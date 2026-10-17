//! `DaemonClient` — the wire client for the local Vaerion daemon.
//!
//! The daemon (`vae serve`) is loopback-only with a first-run pairing token
//! (ADR-0010). This client speaks exactly the published contract
//! (`packages/vaerion/src/api/routes.ts` — the same table that dispatches and
//! generates the daemon's `/openapi.json`):
//!
//! ```text
//! GET  /health, /version, /openapi.json   (open metadata routes)
//! POST /runs                              start an agent|workflow run
//! GET  /runs/{run_id}                     folded status + terminal receipt
//! GET  /runs/{run_id}/events              SSE event stream (cursor replay)
//! POST /runs/{run_id}/answer              resolve a durable human gate
//! POST /shutdown                          token-echo guarded shutdown
//! ```
//!
//! Auth: `Authorization: Bearer <token>` on every route except the metadata
//! trio. Non-loopback bases are refused in code (`E2006`) before any byte is
//! sent. Errors arrive as `{"error": {code, message, fix, detail}}` and are
//! raised as [`VaerionError`] with the E-code intact. Nothing is invented
//! here: every method maps 1:1 to the daemon's published surface.

use crate::error::VaerionError;
use crate::sse::SseParser;
use serde_json::{json, Value};
use std::io::{BufRead, BufReader, Read};
use std::thread;
use std::time::{Duration, Instant};

/// The three unauthenticated metadata routes (ADR-0010: metadata routes only).
pub const OPEN_PATHS: [&str; 3] = ["/health", "/version", "/openapi.json"];

const DEFAULT_TIMEOUT: Duration = Duration::from_secs(30);
const CONNECT_TIMEOUT: Duration = Duration::from_secs(10);
const POLL_INTERVAL: Duration = Duration::from_millis(100);

/// Thin, honest client over the daemon wire. Nothing is invented here:
/// every method maps 1:1 to the daemon's published OpenAPI surface.
#[derive(Debug, Clone)]
pub struct DaemonClient {
    base: String,
    token: Option<String>,
    timeout: Duration,
    agent: ureq::Agent,
}

impl DaemonClient {
    /// Bind to a daemon base (e.g. `http://127.0.0.1:7897`) with an optional
    /// pairing token.
    ///
    /// The loopback law is enforced HERE, in code, before any byte can be
    /// sent: only `127.0.0.1`, `localhost`, and `[::1]` bases are accepted
    /// (`E2006` otherwise, standard §11).
    pub fn new(base: &str, token: Option<&str>) -> Result<Self, VaerionError> {
        ensure_loopback(base)?;
        Ok(DaemonClient {
            base: base.trim_end_matches('/').to_string(),
            token: token.map(str::to_string),
            timeout: DEFAULT_TIMEOUT,
            agent: build_agent(DEFAULT_TIMEOUT),
        })
    }

    /// Override the request timeout (connect + per-read). Applies to every
    /// subsequent call on this client.
    pub fn with_timeout(mut self, timeout: Duration) -> Self {
        self.timeout = timeout;
        self.agent = build_agent(timeout);
        self
    }

    /// The base this client is bound to (loopback-checked at construction).
    pub fn base(&self) -> &str {
        &self.base
    }

    /// The `Authorization` header value this client would send for `path`
    /// (`None` on the open metadata routes and when no token is set).
    ///
    /// Public introspection point for the auth law (standard §11b): the token
    /// rides ONLY on authenticated paths, never on `/health`, `/version`,
    /// `/openapi.json`.
    pub fn auth_header(&self, path: &str) -> Option<String> {
        let token = self.token.as_ref()?;
        if OPEN_PATHS.contains(&path) {
            return None;
        }
        Some(format!("Bearer {token}"))
    }

    // ── transport ─────────────────────────────────────────────────────────

    fn request(
        &self,
        method: &str,
        path: &str,
        body: Option<&Value>,
    ) -> Result<Value, VaerionError> {
        let url = format!("{}{}", self.base, path);
        let mut req = self
            .agent
            .request(method, &url)
            .set("Accept", "application/json");
        if body.is_some() {
            req = req.set("Content-Type", "application/json");
        }
        if let Some(auth) = self.auth_header(path) {
            req = req.set("Authorization", &auth);
        }

        let result = match body {
            Some(value) => req.send_json(value),
            None => req.call(),
        };
        let resp = match result {
            Ok(resp) => resp,
            Err(ureq::Error::Status(code, resp)) => {
                let text = resp.into_string().unwrap_or_default();
                return Err(match serde_json::from_str::<Value>(&text) {
                    Ok(payload) => VaerionError::from_error_payload(&payload),
                    Err(_) => VaerionError::new(
                        "E1900",
                        format!("daemon returned HTTP {code} with an unreadable body"),
                    ),
                });
            }
            Err(ureq::Error::Transport(t)) => return Err(reach_error(&self.base, &t.to_string())),
        };

        let text = resp.into_string().map_err(|e| {
            VaerionError::new("E1601", format!("cannot read the daemon response: {e}"))
        })?;
        if text.trim().is_empty() {
            return Ok(Value::Null);
        }
        serde_json::from_str(&text).map_err(|_| {
            VaerionError::new(
                "E1900",
                format!("daemon returned an unreadable body on {path}"),
            )
        })
    }

    // ── metadata (open routes) ────────────────────────────────────────────

    /// Liveness probe: ok, engine version, daemon uptime (no token).
    pub fn health(&self) -> Result<Value, VaerionError> {
        self.request("GET", "/health", None)
    }

    /// The engine version of record, substrate, and contract counts (no token).
    pub fn version(&self) -> Result<Value, VaerionError> {
        self.request("GET", "/version", None)
    }

    /// The generated OpenAPI contract — every route, described (no token).
    pub fn openapi(&self) -> Result<Value, VaerionError> {
        self.request("GET", "/openapi.json", None)
    }

    // ── runs ──────────────────────────────────────────────────────────────

    /// Start the supervised agent loop (background, serial per workspace).
    /// Returns `(run_id, started_payload)`; poll [`DaemonClient::get_run`] or
    /// stream [`DaemonClient::events`].
    pub fn start_agent_run(
        &self,
        goal: &str,
        steps: Option<Vec<Value>>,
        planner: &str,
        max_steps: Option<u32>,
    ) -> Result<(String, Value), VaerionError> {
        let mut body = json!({"kind": "agent", "goal": goal, "planner": planner});
        if let Some(steps) = &steps {
            body["steps"] = Value::Array(steps.clone());
        }
        if let Some(max_steps) = max_steps {
            body["max_steps"] = json!(max_steps);
        }
        let started = self.request("POST", "/runs", Some(&body))?;
        extract_run_id(started)
    }

    /// Start a deterministic workflow DAG execution (background).
    pub fn start_workflow_run(&self, dag: &Value) -> Result<(String, Value), VaerionError> {
        let body = json!({"kind": "workflow", "dag": dag});
        let started = self.request("POST", "/runs", Some(&body))?;
        extract_run_id(started)
    }

    /// Folded status: verification result, decisions, gates, receipt when closed.
    pub fn get_run(&self, run_id: &str) -> Result<Value, VaerionError> {
        self.request("GET", &format!("/runs/{run_id}"), None)
    }

    /// The run's SSE event stream (JSON data payloads, cursor replay).
    ///
    /// The daemon first REPLAYS every journaled envelope, then FOLLOWS the
    /// journal until the run seals; the stream terminates with `event: end`.
    /// The iterator yields only JSON-object data payloads (the Python
    /// reference filters identically); non-object frames are skipped.
    pub fn events(&self, run_id: &str) -> Result<EventStream, VaerionError> {
        let path = format!("/runs/{run_id}/events");
        let url = format!("{}{}", self.base, path);
        let mut req = self
            .agent
            .request("GET", &url)
            .set("Accept", "application/json");
        if let Some(auth) = self.auth_header(&path) {
            req = req.set("Authorization", &auth);
        }
        let resp = match req.call() {
            Ok(resp) => resp,
            Err(ureq::Error::Status(code, resp)) => {
                let text = resp.into_string().unwrap_or_default();
                return Err(match serde_json::from_str::<Value>(&text) {
                    Ok(payload) => VaerionError::from_error_payload(&payload),
                    Err(_) => {
                        VaerionError::new("E1900", format!("daemon returned HTTP {code} on {path}"))
                    }
                });
            }
            Err(ureq::Error::Transport(t)) => return Err(reach_error(&self.base, &t.to_string())),
        };
        Ok(EventStream::new(resp.into_reader()))
    }

    /// Human authority over a paused run — the durable gate resolution.
    pub fn answer_gate(
        &self,
        run_id: &str,
        gate_id: &str,
        answer: Option<&Value>,
    ) -> Result<Value, VaerionError> {
        let mut body = json!({"gate_id": gate_id});
        if let Some(answer) = answer {
            body["answer"] = answer.clone();
        }
        self.request("POST", &format!("/runs/{run_id}/answer"), Some(&body))
    }

    /// Poll [`DaemonClient::get_run`] until the run closes. Terminal = a
    /// receipt exists or the status left `open`. The final status view is
    /// returned; `E1602` when the deadline passes first.
    pub fn wait_for_run(&self, run_id: &str, timeout: Duration) -> Result<Value, VaerionError> {
        let start = Instant::now();
        let mut last: Value;
        while Instant::now() < start + timeout {
            last = self.get_run(run_id)?;
            let receipt_present = last.get("receipt").map_or(false, |r| !r.is_null());
            let left_open = last
                .get("status")
                .and_then(Value::as_str)
                .map_or(false, |s| s != "open");
            if receipt_present || left_open {
                return Ok(last);
            }
            thread::sleep(POLL_INTERVAL);
        }
        Err(VaerionError::new(
            "E1602",
            format!(
                "run {run_id} did not close within {}s",
                timeout.as_secs_f64()
            ),
        )
        .with_fix("inspect GET /runs/{id} and GET /runs/{id}/events for where it is paused"))
    }

    /// Graceful daemon stop (token-echo guarded).
    pub fn shutdown(&self) -> Result<(), VaerionError> {
        let token = self.token.as_ref().ok_or_else(|| {
            VaerionError::new("E2000", "shutdown requires the pairing token (echo guard)")
        })?;
        self.request("POST", "/shutdown", Some(&json!({"token": token})))?;
        Ok(())
    }
}

/// Extract `(run_id, payload)` from a `RunStarted` body (`E1900` without one).
fn extract_run_id(started: Value) -> Result<(String, Value), VaerionError> {
    let run_id = started
        .get("run_id")
        .and_then(Value::as_str)
        .unwrap_or_default()
        .to_string();
    if run_id.is_empty() {
        return Err(VaerionError::new(
            "E1900",
            "daemon accepted the run but returned no run_id",
        ));
    }
    Ok((run_id, started))
}

fn reach_error(base: &str, reason: &str) -> VaerionError {
    VaerionError::new(
        "E1601",
        format!("cannot reach the daemon at {base}: {reason}"),
    )
    .with_fix("start it with `vae serve` (loopback only) and pass the pairing token")
}

fn build_agent(timeout: Duration) -> ureq::Agent {
    ureq::AgentBuilder::new()
        .timeout_connect(CONNECT_TIMEOUT.min(timeout))
        .timeout_read(timeout)
        .build()
}

/// Refuse any non-loopback base IN CODE, before any byte is sent (E2006).
///
/// The host is parsed from the base URL: scheme stripped, path stripped,
/// userinfo stripped, IPv6 brackets honored. Only `127.0.0.1`, `localhost`,
/// and `::1` are loopback.
pub fn ensure_loopback(base: &str) -> Result<(), VaerionError> {
    let host = host_of(base);
    if matches!(host.as_str(), "127.0.0.1" | "localhost" | "::1") {
        return Ok(());
    }
    let message = if host.is_empty() {
        format!("cannot parse a loopback host from the daemon base: {base}")
    } else {
        format!("non-loopback daemon base refused: {host} — the daemon is loopback-only (ADR-0010)")
    };
    Err(VaerionError::new("E2006", message).with_fix(
        "use a loopback base such as http://127.0.0.1:7897 — start the daemon with `vae serve`",
    ))
}

/// Parse the host component of a base URL (no external URL crate; the law
/// only needs the host, and loopback bases are trivially shaped).
fn host_of(base: &str) -> String {
    let s = base.trim();
    let s = match s.find("://") {
        Some(i) => &s[i + 3..],
        None => s,
    };
    let s = match s.find('/') {
        Some(i) => &s[..i],
        None => s,
    };
    let s = match s.rfind('@') {
        Some(i) => &s[i + 1..],
        None => s,
    };
    if let Some(start) = s.find('[') {
        if let Some(end_rel) = s[start..].find(']') {
            return s[start + 1..start + end_rel].to_string();
        }
    }
    match s.matches(':').count() {
        0 => s.to_string(),
        1 => s.split(':').next().unwrap_or_default().to_string(),
        _ => s.to_string(), // unbracketed IPv6 literal, e.g. ::1
    }
}

/// Iterator over a run's SSE event stream — the parsed JSON data payloads.
///
/// Connect with [`DaemonClient::events`]. Each `data:` frame that parses as a
/// JSON object is yielded; non-object frames are skipped (the Python
/// reference filters identically). The stream ends when the daemon closes it
/// (after the terminal `event: end`) or on a transport error — a mid-stream
/// read failure ends the iterator after flushing any pending frame rather
/// than panicking; the journal is the truth and can always be re-read.
pub struct EventStream {
    source: Box<dyn BufRead>,
    parser: SseParser,
    done: bool,
}

impl EventStream {
    fn new(reader: impl Read + 'static) -> Self {
        EventStream {
            source: Box::new(BufReader::new(reader)),
            parser: SseParser::new(),
            done: false,
        }
    }
}

impl Iterator for EventStream {
    type Item = Value;

    fn next(&mut self) -> Option<Value> {
        if self.done {
            return None;
        }
        let mut line = String::new();
        loop {
            line.clear();
            match self.source.read_line(&mut line) {
                Ok(0) => {
                    self.done = true;
                    return self.parser.finish();
                }
                Ok(_) => {
                    let line = line.trim_end_matches(['\n', '\r']);
                    if let Some(payload) = self.parser.push_line(line) {
                        if payload.is_object() {
                            return Some(payload);
                        }
                    }
                }
                Err(_) => {
                    self.done = true;
                    return self.parser.finish();
                }
            }
        }
    }
}
