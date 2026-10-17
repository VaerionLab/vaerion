//! Vaerion Rust SDK — the conformance suite (VAERION_SDK_STANDARD §18).
//!
//! Unit layer: SSE parsing, error-contract fidelity, the loopback law, token
//! header rules. Integration layer: a REAL spawned daemon — the Agent starts
//! `vae serve`, runs a brokered agent goal, reads the terminal receipt, and
//! verifies the journal chain through the CLI of record. Skipped (never
//! faked) when no vae runtime exists on the machine.

use serde_json::{json, Value};
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use vaerion::{parse_sse, Agent, DaemonClient, VaerionError};

// ── unit: SSE parse (the daemon's event streams) ─────────────────────────────

#[test]
fn sse_multi_event() {
    let body = ": keep-alive comment\n\
                event: spine\n\
                data: {\"seq\":1,\"type\":\"run.opened\"}\n\
                \n\
                data: {\"seq\":2,\"type\":\"run.closed\"}\n\
                \n";
    let events = parse_sse(body);
    assert_eq!(events.len(), 2);
    assert_eq!(events[0]["type"], json!("run.opened"));
    assert_eq!(events[1]["seq"], json!(2));
}

#[test]
fn sse_multiline_data() {
    assert_eq!(
        parse_sse("data: {\"a\":\ndata: 1}\n\n"),
        vec![json!({"a": 1})]
    );
}

#[test]
fn sse_garbage_data_passes_through_as_text() {
    assert_eq!(parse_sse("data: not-json\n\n"), vec![json!("not-json")]);
}

#[test]
fn sse_empty_body() {
    assert!(parse_sse("").is_empty());
}

// ── unit: the error contract ─────────────────────────────────────────────────

#[test]
fn error_payload_carries_code_message_fix() {
    let err = VaerionError::from_error_payload(&json!({
        "error": {"code": "E1301", "message": "unmatched request", "fix": "declare a policy rule"}
    }));
    assert_eq!(err.code, "E1301");
    assert_eq!(err.message, "unmatched request");
    assert_eq!(err.fix.as_deref(), Some("declare a policy rule"));
    assert!(err.to_string().contains("E1301"));
    assert!(err.to_string().contains("(Fix: declare a policy rule)"));
}

#[test]
fn error_payload_tolerance() {
    assert_eq!(
        VaerionError::from_error_payload(&json!("boom")).code,
        "E1900"
    );
    assert_eq!(VaerionError::from_error_payload(&Value::Null).code, "E1900");
}

// ── unit: the loopback law (refused in code, before any byte) ────────────────

#[test]
fn non_loopback_base_refused_in_code_before_any_byte() {
    for base in [
        "http://example.com:8787",
        "http://192.168.1.4:8787",
        "http://vaerion.example.internal",
        "http://0.0.0.0:8787",
    ] {
        let err = DaemonClient::new(base, None).expect_err(base);
        assert_eq!(err.code, "E2006", "{base}");
        assert!(err.fix.is_some());
    }
}

#[test]
fn loopback_bases_are_accepted() {
    for base in ["http://127.0.0.1:1", "http://localhost:1", "http://[::1]:1"] {
        assert!(DaemonClient::new(base, None).is_ok(), "{base}");
    }
}

// ── unit: token header rules ─────────────────────────────────────────────────

#[test]
fn open_paths_never_carry_the_token() {
    let client = DaemonClient::new("http://127.0.0.1:1", Some("secret-token")).unwrap();
    assert_eq!(client.auth_header("/health"), None);
    assert_eq!(client.auth_header("/version"), None);
    assert_eq!(client.auth_header("/openapi.json"), None);
    assert_eq!(
        client.auth_header("/runs").as_deref(),
        Some("Bearer secret-token")
    );
    assert_eq!(
        client.auth_header("/runs/crn_run_X/answer").as_deref(),
        Some("Bearer secret-token")
    );

    let tokenless = DaemonClient::new("http://127.0.0.1:1", None).unwrap();
    assert_eq!(tokenless.auth_header("/runs"), None);
}

#[test]
fn unreachable_daemon_is_e1601_with_a_fix() {
    let client = DaemonClient::new("http://127.0.0.1:1", Some("t"))
        .unwrap()
        .with_timeout(Duration::from_secs(1));
    let err = client
        .get_run("crn_run_UNKNOWNUNKNOWNUNKNOWNUNKNO")
        .expect_err("nothing listens on port 1");
    assert_eq!(err.code, "E1601");
    assert!(err.fix.is_some());
}

// ── integration scaffolding (skip when no vae runtime — NEVER fake) ──────────

static TMP_COUNTER: AtomicU64 = AtomicU64::new(0);

struct TempDir(PathBuf);

impl TempDir {
    fn new(tag: &str) -> Self {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0);
        let dir = std::env::temp_dir().join(format!(
            "vaerion-rust-sdk-{tag}-{}-{}-{}",
            std::process::id(),
            nanos,
            TMP_COUNTER.fetch_add(1, Ordering::SeqCst)
        ));
        fs::create_dir_all(&dir).expect("create temp workspace");
        TempDir(dir)
    }
}

impl Drop for TempDir {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}

fn vae_available() -> bool {
    vaerion::vae_command().is_ok()
}

fn spawn_agent(tag: &str) -> Option<(TempDir, Agent)> {
    if !vae_available() {
        eprintln!(
            "skipping integration test `{tag}`: no vae runtime on this machine — \
             integration layer skipped, never faked"
        );
        return None;
    }
    let tmp = TempDir::new(tag);
    let agent = Agent::spawn(&tmp.0)
        .unwrap_or_else(|err| panic!("spawn failed although a vae runtime exists: {err}"));
    Some((tmp, agent))
}

fn is_hex64(s: &str) -> bool {
    s.len() == 64
        && s.chars()
            .all(|c| c.is_ascii_hexdigit() && !c.is_ascii_uppercase())
}

// ── integration: a REAL daemon, a REAL run, a REAL receipt, a REAL verify ────

#[test]
fn integration_spawn_run_receipt_verify() {
    let Some((_tmp, mut agent)) = spawn_agent("spawn-run-receipt-verify") else {
        return;
    };

    // The daemon is up and honest about its version.
    let health = agent.client.health().unwrap();
    assert_eq!(health["ok"], json!(true));
    let version = agent.client.version().unwrap();
    assert!(version.get("engine_version").is_some(), "{version}");
    assert!(agent.client.openapi().unwrap().get("paths").is_some());

    // One brokered, journaled run with the declared note plan.
    let result = agent.run("summarize the project from the journal").unwrap();
    assert_eq!(result["kind"], json!("agent"));
    let run_id = result["run_id"].as_str().expect("run_id on the wire");
    assert!(run_id.starts_with("crn_run_"), "{run_id}");
    assert_eq!(result["journal_ok"], json!(true));

    let receipt = result["receipt"]
        .as_object()
        .expect("a closed run carries its receipt");
    let receipt_head = receipt["journal"]["head_hash"]
        .as_str()
        .expect("journal.head_hash");
    assert!(
        is_hex64(receipt_head),
        "head_hash must be 64-hex: {receipt_head}"
    );
    assert!(receipt["journal"]["records"].as_u64().unwrap() > 0);

    // The status fold agrees with the terminal state.
    let status = agent.status(run_id).unwrap();
    assert_eq!(status["run_id"], json!(run_id));
    assert!(status["receipt"].is_object());

    // Verification through the CLI of record: chain recomputed, green.
    // (The receipt certifies the chain UP TO its fold; the terminal receipt
    // record itself is then appended — so the verified head is one link
    // beyond receipt.journal.head_hash.)
    let verified = agent.verify(Some(run_id)).unwrap();
    assert!(verified.ok, "{verified:?}");
    assert!(!verified.torn);
    assert!(verified.records.unwrap() >= receipt["journal"]["records"].as_u64().unwrap());
    assert!(verified.head_hash.as_deref().map(is_hex64).unwrap_or(false));

    agent.close();
}

#[test]
fn integration_events_stream_replays_the_run() {
    let Some((_tmp, agent)) = spawn_agent("events-stream") else {
        return;
    };
    let result = agent.run("event stream probe").unwrap();
    let events: Vec<Value> = agent
        .events(result["run_id"].as_str().unwrap())
        .unwrap()
        .collect();
    assert!(
        !events.is_empty(),
        "the SSE stream replays the journaled envelopes"
    );
    let kinds: HashSet<&str> = events
        .iter()
        .filter_map(|e| e.get("type").and_then(Value::as_str))
        .collect();
    assert!(kinds.contains("run.opened"), "kinds: {kinds:?}");
}

#[test]
fn integration_undeclared_tool_step_fails_closed_with_evidence() {
    // The daemon's ad-hoc config declares NO tools → the undeclared tool step
    // fails CLOSED at the tool gate (fail-closed law). The run still closes
    // WITH a receipt — the refusal is evidence on the chain, not an exception
    // to hide. The SDK returns the truth; the caller reads it.
    let Some((_tmp, agent)) = spawn_agent("fail-closed") else {
        return;
    };
    let result = agent
        .run_with(
            "undeclared tool call",
            Some(vec![
                json!({"kind": "tool", "tool": "echo", "args": {"value": "hi"}}),
            ]),
            "inline",
            None,
            Duration::from_secs(120),
        )
        .unwrap();
    assert_eq!(result["status"], json!("closed"));
    assert_eq!(result["agent"]["outcome"], json!("failed"));
    assert!(
        result["receipt"].is_object(),
        "even a failed run leaves a receipt"
    );

    // …and the journal STILL verifies: the evidence trail is intact.
    let verified = agent
        .verify(Some(result["run_id"].as_str().unwrap()))
        .unwrap();
    assert!(verified.ok, "{verified:?}");
}

#[test]
fn integration_unknown_run_surfaces_e2003() {
    // Error-code fidelity over the live wire (§18.6): the daemon's own code
    // arrives intact — never rewritten by the SDK.
    let Some((_tmp, agent)) = spawn_agent("error-fidelity") else {
        return;
    };
    let err = agent
        .client
        .get_run("crn_run_UNKNOWNUNKNOWNUNKNOWNUNKNO")
        .expect_err("unknown run");
    assert_eq!(err.code, "E2003");
    assert!(!err.message.is_empty());
}
