//! `Agent` — the five-line Vaerion experience in Rust.
//!
//! ```text
//! let mut agent = Agent::spawn(&workspace)?;          // starts `vae serve`
//! let result = agent.run("summarize the project")?;   // brokered + journaled
//! println!("{}", result["receipt"]["journal"]["head_hash"]); // integrity commitment
//! let verified = agent.verify(Some(&run_id))?;        // chain recomputation
//! agent.close();
//! ```
//!
//! By default [`Agent`] SPAWNS its own `vae serve` daemon on a free loopback
//! port (`VAE_TRUST` pre-provisions the pairing token — the secret is never
//! printed) and stops it on [`Agent::close`] (and via `Drop` as a safety
//! net). [`Agent::attach`] binds to a daemon you run yourself. [`Agent::verify`]
//! executes the CLI of record against the journal bytes on disk —
//! verification trusts bytes, not processes.

use crate::daemon::{DaemonClient, EventStream};
use crate::error::VaerionError;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::fs::File;
use std::io::Read;
use std::net::TcpListener;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicU64, Ordering};
use std::thread;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

/// How long [`Agent::spawn`] waits for `vae serve` to become healthy.
pub const DEFAULT_SERVE_TIMEOUT: Duration = Duration::from_secs(20);
/// Default deadline for [`Agent::run_with`] / [`Agent::workflow_with`].
pub const DEFAULT_RUN_TIMEOUT: Duration = Duration::from_secs(120);
/// Default deadline for the CLI-of-record verification subprocess.
pub const DEFAULT_VERIFY_TIMEOUT: Duration = Duration::from_secs(60);

/// The normalized verify report — ONE honest shape for the two CLI faces.
///
/// `vae verify --json` is flat (snake_case `head_hash`); `vae journal verify
/// RUN --json` wraps a VerifyReport under `report` with camelCase `headHash`.
/// Both normalize into this struct (wire field names stay snake_case verbatim
/// per standard §15b; `headHash` is folded into `head_hash`).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct VerifyReport {
    /// The run whose journal was verified (None if the CLI omitted it).
    #[serde(default)]
    pub run_id: Option<String>,
    /// Full blake3 chain recomputed and intact.
    pub ok: bool,
    /// A torn crash tail was detected.
    pub torn: bool,
    /// Journal record count seen by the verifier.
    #[serde(default)]
    pub records: Option<u64>,
    /// Event count seen by the verifier.
    #[serde(default)]
    pub events: Option<u64>,
    /// The chain head (64-hex blake3) — the integrity commitment.
    #[serde(default)]
    pub head_hash: Option<String>,
    /// Per-issue findings `[{i, code, message}]` — empty when ok.
    #[serde(default)]
    pub issues: Vec<Value>,
}

/// Resolve the `vae` CLI: `$VAE_BIN`, PATH, or the repo layout (dev checkouts).
///
/// Resolution order mirrors the Python reference exactly:
/// 1. `$VAE_BIN`, whitespace-split (a full command line, e.g. `bun run vae.ts`);
/// 2. `vae` on PATH;
/// 3. the repo fallback `bun run <repoRoot>/packages/vaerion/src/cli/vae.ts`
///    (repoRoot = two parents above this crate) when `bun` exists;
/// 4. otherwise `E1601` with the install Fix.
pub fn vae_command() -> Result<Vec<String>, VaerionError> {
    if let Ok(bin) = std::env::var("VAE_BIN") {
        if !bin.trim().is_empty() {
            return Ok(bin.split_whitespace().map(str::to_string).collect());
        }
    }
    if let Some(path) = which("vae") {
        return Ok(vec![path]);
    }
    let repo_vae = Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .and_then(Path::parent)
        .map(|root| {
            root.join("packages")
                .join("vaerion")
                .join("src")
                .join("cli")
                .join("vae.ts")
        });
    if let Some(ts) = repo_vae {
        if ts.is_file() {
            if let Some(bun) = which("bun") {
                return Ok(vec![
                    bun,
                    "run".to_string(),
                    ts.to_string_lossy().into_owned(),
                ]);
            }
        }
    }
    Err(VaerionError::new(
        "E1601",
        "cannot find the vae CLI (looked at $VAE_BIN, PATH, and the repo layout)",
    )
    .with_fix(
        "install it: npm install -g vaerion — or set VAE_BIN to the command that runs vae",
    ))
}

/// Search PATH for an executable (the stdlib-only `which`).
fn which(name: &str) -> Option<String> {
    let path = std::env::var_os("PATH")?;
    for dir in std::env::split_paths(&path) {
        let candidate = dir.join(name);
        if is_executable(&candidate) {
            return Some(candidate.to_string_lossy().into_owned());
        }
    }
    None
}

#[cfg(unix)]
fn is_executable(path: &Path) -> bool {
    use std::os::unix::fs::PermissionsExt;
    path.is_file()
        && path
            .metadata()
            .map(|m| m.permissions().mode() & 0o111 != 0)
            .unwrap_or(false)
}

#[cfg(not(unix))]
fn is_executable(path: &Path) -> bool {
    path.is_file()
}

/// A verified agent: run goals against the brokered loop, read receipts.
pub struct Agent {
    /// The daemon client this agent speaks through (spawned or attached).
    pub client: DaemonClient,
    /// The workspace directory the agent binds to.
    pub cwd: PathBuf,
    child: Option<Child>,
}

impl Agent {
    /// Spawn a `vae serve` daemon for a workspace and wait for health.
    ///
    /// The daemon is started with `serve --port <free> --host 127.0.0.1` and
    /// `VAE_TRUST=<generated token>`; the token is handed only to the daemon
    /// process environment and this client — never printed, never logged.
    pub fn spawn(cwd: impl AsRef<Path>) -> Result<Self, VaerionError> {
        Self::spawn_with_timeout(cwd, DEFAULT_SERVE_TIMEOUT)
    }

    /// [`Agent::spawn`] with an explicit health-wait deadline.
    pub fn spawn_with_timeout(
        cwd: impl AsRef<Path>,
        serve_timeout: Duration,
    ) -> Result<Self, VaerionError> {
        let cwd = cwd.as_ref().to_path_buf();
        let cmd = vae_command()?;
        if cmd.is_empty() {
            return Err(VaerionError::new(
                "E1601",
                "the vae runtime command resolved to nothing",
            ));
        }
        let port = free_port()?;
        let token = generate_token();
        let mut child = Command::new(&cmd[0])
            .args(&cmd[1..])
            .args(["serve", "--port", &port.to_string(), "--host", "127.0.0.1"])
            .current_dir(&cwd)
            .env("VAE_TRUST", &token)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| {
                VaerionError::new("E1601", format!("cannot spawn the vae runtime: {e}")).with_fix(
                    "install it: npm install -g vaerion — or set VAE_BIN to the command that runs vae",
                )
            })?;
        let base = format!("http://127.0.0.1:{port}");
        let client = DaemonClient::new(&base, Some(&token))?;

        let deadline = Instant::now() + serve_timeout;
        loop {
            if child
                .try_wait()
                .map_err(|e| {
                    VaerionError::new("E1601", format!("cannot poll the vae serve process: {e}"))
                })?
                .is_some()
            {
                return Err(VaerionError::new(
                    "E1601",
                    "the spawned vae serve process exited before becoming healthy",
                )
                .with_fix("run `vae serve` manually to see the startup error"));
            }
            if client
                .health()
                .ok()
                .and_then(|h| h.get("ok").and_then(Value::as_bool))
                .unwrap_or(false)
            {
                break;
            }
            if Instant::now() >= deadline {
                let _ = child.kill();
                return Err(VaerionError::new(
                    "E1601",
                    format!(
                        "the daemon did not become healthy within {}s",
                        serve_timeout.as_secs_f64()
                    ),
                )
                .with_fix("check that port allocation is allowed and no security software blocks loopback"));
            }
            thread::sleep(Duration::from_millis(150));
        }
        Ok(Agent {
            client,
            cwd,
            child: Some(child),
        })
    }

    /// Attach to a daemon you run yourself (no child process is owned).
    pub fn attach(base: &str, token: Option<&str>) -> Result<Self, VaerionError> {
        let cwd = std::env::current_dir().map_err(|e| {
            VaerionError::new("E1601", format!("cannot determine the workspace cwd: {e}"))
        })?;
        let client = DaemonClient::new(base, token)?;
        Ok(Agent {
            client,
            cwd,
            child: None,
        })
    }

    // ── lifecycle ─────────────────────────────────────────────────────────

    /// Stop a daemon this Agent spawned (a no-op for attached daemons):
    /// token-echo shutdown, bounded wait, then kill.
    pub fn close(&mut self) {
        let Some(mut child) = self.child.take() else {
            return;
        };
        let _ = self.client.shutdown();
        if wait_timeout(&mut child, Duration::from_secs(10)).is_none() {
            let _ = child.kill();
            let _ = wait_timeout(&mut child, Duration::from_secs(5));
        }
    }

    // ── the run surface ───────────────────────────────────────────────────

    /// One brokered, journaled agent run with the declared inline note plan;
    /// returns the final status view (receipt present once closed).
    ///
    /// Inline planning is DECLARED: with no `steps`, the honest default is a
    /// single journaled note step — deterministic, no model calls, no fake
    /// intelligence. A failed step does NOT error — the run closes with a
    /// receipt and the agent fold carries `outcome: "failed"` (evidence, not
    /// an exception).
    pub fn run(&self, goal: &str) -> Result<Value, VaerionError> {
        self.run_with(goal, None, "inline", None, DEFAULT_RUN_TIMEOUT)
    }

    /// [`Agent::run`] with explicit steps / planner / step ceiling / deadline.
    pub fn run_with(
        &self,
        goal: &str,
        steps: Option<Vec<Value>>,
        planner: &str,
        max_steps: Option<u32>,
        timeout: Duration,
    ) -> Result<Value, VaerionError> {
        let steps = if planner == "inline" && steps.is_none() {
            Some(vec![
                json!({"kind": "note", "text": format!("goal: {goal}")}),
            ])
        } else {
            steps
        };
        let (run_id, _) = self
            .client
            .start_agent_run(goal, steps, planner, max_steps)?;
        self.client.wait_for_run(&run_id, timeout)
    }

    /// One deterministic workflow DAG run on the journal.
    pub fn workflow(&self, dag: &Value) -> Result<Value, VaerionError> {
        self.workflow_with(dag, DEFAULT_RUN_TIMEOUT)
    }

    /// [`Agent::workflow`] with an explicit deadline.
    pub fn workflow_with(&self, dag: &Value, timeout: Duration) -> Result<Value, VaerionError> {
        let (run_id, _) = self.client.start_workflow_run(dag)?;
        self.client.wait_for_run(&run_id, timeout)
    }

    /// The live SSE event stream for a run (JSON payloads).
    pub fn events(&self, run_id: &str) -> Result<EventStream, VaerionError> {
        self.client.events(run_id)
    }

    /// The folded status view without waiting.
    pub fn status(&self, run_id: &str) -> Result<Value, VaerionError> {
        self.client.get_run(run_id)
    }

    // ── verification ──────────────────────────────────────────────────────

    /// Journal verification through the CLI of record: the FULL blake3 chain
    /// recomputed from the bytes on disk. `vae verify --json` (latest run) by
    /// default; pass a run_id for `vae journal verify RUN --json`. A failed
    /// chain (nonzero exit) raises `E1001` carrying the report as detail.
    pub fn verify(&self, run_id: Option<&str>) -> Result<VerifyReport, VaerionError> {
        self.verify_with_timeout(run_id, DEFAULT_VERIFY_TIMEOUT)
    }

    /// [`Agent::verify`] with an explicit subprocess deadline.
    pub fn verify_with_timeout(
        &self,
        run_id: Option<&str>,
        timeout: Duration,
    ) -> Result<VerifyReport, VaerionError> {
        let mut args: Vec<String> = match run_id {
            Some(id) => vec!["journal".to_string(), "verify".to_string(), id.to_string()],
            None => vec!["verify".to_string()],
        };
        args.push("--json".to_string());

        let cmd = vae_command()?;
        let mut child = Command::new(&cmd[0])
            .args(&cmd[1..])
            .args(&args)
            .current_dir(&self.cwd)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| VaerionError::new("E1601", format!("cannot run the vae CLI: {e}")))?;

        let mut stderr_pipe = child
            .stderr
            .take()
            .ok_or_else(|| VaerionError::new("E1900", "the vae CLI stderr pipe is missing"))?;
        let stderr_thread = thread::spawn(move || {
            let mut buf = String::new();
            let _ = stderr_pipe.read_to_string(&mut buf);
            buf
        });
        let mut stdout_pipe = child
            .stdout
            .take()
            .ok_or_else(|| VaerionError::new("E1900", "the vae CLI stdout pipe is missing"))?;
        let mut out = String::new();
        if let Err(e) = stdout_pipe.read_to_string(&mut out) {
            let _ = child.kill();
            return Err(VaerionError::new(
                "E1601",
                format!("cannot read the vae CLI output: {e}"),
            ));
        }
        let Some(status) = wait_timeout(&mut child, timeout) else {
            let _ = child.kill();
            return Err(VaerionError::new(
                "E1601",
                format!("verification timed out after {}s", timeout.as_secs_f64()),
            ));
        };
        let stderr = stderr_thread.join().unwrap_or_default();

        // The CLI of record emits NDJSON; keep the LAST parseable line.
        let mut payload: Option<Value> = None;
        for line in out.lines() {
            let line = line.trim();
            if line.is_empty() {
                continue;
            }
            if let Ok(value) = serde_json::from_str::<Value>(line) {
                payload = Some(value);
            }
        }
        let Some(payload) = payload else {
            let exit = status.code().unwrap_or(-1);
            return Err(VaerionError::new(
                "E1900",
                format!("verification produced no machine output (exit {exit})"),
            )
            .with_detail(if stderr.is_empty() {
                Value::Null
            } else {
                Value::String(tail(&stderr, 500))
            }));
        };
        if !status.success() {
            return Err(VaerionError::new(
                "E1001",
                "journal verification FAILED — see the report payload",
            )
            .with_fix("vae journal recover <run_id>")
            .with_detail(payload));
        }
        Ok(normalize_verify(&payload))
    }
}

impl Drop for Agent {
    /// Safety net: an un-closed Agent still stops its spawned daemon.
    fn drop(&mut self) {
        self.close();
    }
}

/// Normalize the two CLI verify faces into ONE honest [`VerifyReport`]:
/// `vae verify` is flat with snake_case `head_hash`; `vae journal verify`
/// wraps a VerifyReport under `report` with camelCase `headHash`.
fn normalize_verify(payload: &Value) -> VerifyReport {
    let report = payload
        .get("report")
        .filter(|v| v.is_object())
        .unwrap_or(payload);
    let run_id = payload
        .get("run_id")
        .and_then(Value::as_str)
        .or_else(|| report.get("run_id").and_then(Value::as_str))
        .map(str::to_string);
    let head_hash = report
        .get("headHash")
        .or_else(|| report.get("head_hash"))
        .and_then(Value::as_str)
        .map(str::to_string);
    VerifyReport {
        run_id,
        ok: report.get("ok").and_then(Value::as_bool).unwrap_or(false),
        torn: report.get("torn").and_then(Value::as_bool).unwrap_or(false),
        records: report.get("records").and_then(Value::as_u64),
        events: report.get("events").and_then(Value::as_u64),
        head_hash,
        issues: report
            .get("issues")
            .and_then(Value::as_array)
            .cloned()
            .unwrap_or_default(),
    }
}

/// Last `n` characters of a string (the Python `s[-n:]` tail).
fn tail(s: &str, n: usize) -> String {
    let start = s
        .char_indices()
        .rev()
        .nth(n.saturating_sub(1))
        .map(|(i, _)| i)
        .unwrap_or(0);
    s[start..].to_string()
}

/// Bounded wait for a child process (`None` when the deadline passed first).
fn wait_timeout(child: &mut Child, timeout: Duration) -> Option<std::process::ExitStatus> {
    let deadline = Instant::now() + timeout;
    loop {
        match child.try_wait() {
            Ok(Some(status)) => return Some(status),
            Ok(None) => {}
            Err(_) => return None,
        }
        if Instant::now() >= deadline {
            return None;
        }
        thread::sleep(Duration::from_millis(25));
    }
}

/// Bind-and-release a free loopback port (the daemon will claim it next).
fn free_port() -> Result<u16, VaerionError> {
    let listener = TcpListener::bind(("127.0.0.1", 0)).map_err(|e| {
        VaerionError::new(
            "E1601",
            format!("cannot allocate a free loopback port: {e}"),
        )
    })?;
    let port = listener
        .local_addr()
        .map_err(|e| VaerionError::new("E1601", format!("cannot read the allocated port: {e}")))?
        .port();
    drop(listener);
    Ok(port)
}

static TOKEN_FALLBACK_COUNTER: AtomicU64 = AtomicU64::new(0);

/// Generate a pairing token from the OS CSPRNG (24 bytes → 32 base64url
/// chars, the same shape as the Python reference). The value crosses exactly
/// one boundary — the spawned daemon's environment — and is never printed.
fn generate_token() -> String {
    let mut bytes = [0u8; 24];
    let filled = File::open("/dev/urandom")
        .and_then(|mut f| {
            use std::io::Read as _;
            f.read_exact(&mut bytes)
        })
        .is_ok();
    if !filled {
        // Fallback entropy mix (non-CSPRNG OSes are not a supported target;
        // this keeps the SDK honest rather than calling it random).
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_nanos() as u64)
            .unwrap_or(0);
        let mut hasher = std::collections::hash_map::DefaultHasher::new();
        use std::hash::{Hash, Hasher};
        let counter = TOKEN_FALLBACK_COUNTER.fetch_add(1, Ordering::Relaxed);
        (
            nanos,
            std::process::id(),
            thread::current().id(),
            counter,
            &bytes as *const _,
        )
            .hash(&mut hasher);
        let seed = hasher.finish();
        for (i, b) in bytes.iter_mut().enumerate() {
            *b = (seed >> (i % 8 * 8)) as u8 ^ (i as u8);
        }
    }
    base64url(&bytes)
}

fn base64url(bytes: &[u8]) -> String {
    const ALPHABET: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    let mut out = String::with_capacity(bytes.len().div_ceil(3) * 4);
    for chunk in bytes.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = *chunk.get(1).unwrap_or(&0) as u32;
        let b2 = *chunk.get(2).unwrap_or(&0) as u32;
        let n = (b0 << 16) | (b1 << 8) | b2;
        out.push(ALPHABET[(n >> 18) as usize & 63] as char);
        out.push(ALPHABET[(n >> 12) as usize & 63] as char);
        if chunk.len() > 1 {
            out.push(ALPHABET[(n >> 6) as usize & 63] as char);
        }
        if chunk.len() > 2 {
            out.push(ALPHABET[n as usize & 63] as char);
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn token_is_32_base64url_chars() {
        let token = generate_token();
        assert_eq!(token.len(), 32);
        assert!(token
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_'));
        assert_ne!(generate_token(), token);
    }

    #[test]
    fn base64url_matches_known_vectors() {
        assert_eq!(base64url(b""), "");
        assert_eq!(base64url(b"f"), "Zg");
        assert_eq!(base64url(b"fo"), "Zm8");
        assert_eq!(base64url(b"foo"), "Zm9v");
        assert_eq!(base64url(&[0xffu8, 0xff, 0xff]), "____");
    }

    #[test]
    fn tail_takes_the_last_characters() {
        assert_eq!(tail("abcdefgh", 3), "fgh");
        assert_eq!(tail("short", 500), "short");
    }
}
