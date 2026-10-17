//! # vaerion — the Rust SDK for Vaerion
//!
//! Generated against engine `0.1.15-rc1` (version-register alignment,
//! 2026-10-03; signatures verified against source at `815e929`); every signature in this
//! crate was verified against engine source (`packages/vaerion/src/api/routes.ts`,
//! `packages/vaerion/src/api/server.ts`, `packages/vaerion/src/cli/commands.ts`)
//! and mirrors the behavioral reference (`sdks/python/src/vaerion/`).
//!
//! **Binding mode, honestly stated.** The in-process binding (`VaeClient`) is
//! TypeScript-runtime-only: the engine is a TypeScript library and no Rust
//! process can call it in-process. The Rust SDK therefore binds through the
//! **loopback daemon** (`vae serve`) — HTTP/SSE over the published wire — and
//! through the **CLI of record** (`vae verify --json`) for journal
//! verification, which trusts bytes on disk, not processes. This is a binding
//! mode of the standard (VAERION_SDK_STANDARD §1a), not a workaround.
//!
//! ## The wire surface (nothing invented)
//!
//! ```text
//! GET  /health, /version, /openapi.json   — open metadata routes (no token)
//! POST /runs                              — start an agent | workflow run
//! GET  /runs/{run_id}                     — folded status + terminal receipt
//! GET  /runs/{run_id}/events              — SSE event stream (cursor replay)
//! POST /runs/{run_id}/answer              — resolve a durable human gate
//! POST /shutdown                          — token-echo guarded shutdown
//! ```
//!
//! Auth is the pairing token: `Authorization: Bearer <token>` on every path
//! except the three metadata routes. Non-loopback bases are refused in code
//! (`E2006`) before any byte is sent (standard §11).
//!
//! ## Quickstart
//!
//! ```rust,no_run
//! use vaerion::Agent;
//!
//! # fn main() -> Result<(), vaerion::VaerionError> {
//! let mut agent = Agent::spawn(&std::env::temp_dir())?;   // starts `vae serve`
//! let result = agent.run("summarize the project from the journal")?;
//! println!("run_id: {}", result["run_id"]);
//! println!("head_hash: {}", result["receipt"]["journal"]["head_hash"]);
//! let verified = agent.verify(Some(result["run_id"].as_str().unwrap()))?;
//! assert!(verified.ok);
//! agent.close();
//! # Ok(())
//! # }
//! ```
//!
//! ## Design laws honored here
//!
//! 1. Projection, never a second implementation — every method maps 1:1 to a
//!    daemon route or CLI command; no invented endpoints.
//! 2. The wire is canonical — wire fields stay snake_case verbatim
//!    (`run_id`, `journal_ok`, `head_hash`).
//! 3. Fail-closed fidelity — engine refusals surface as [`VaerionError`] with
//!    the exact engine E-code, message, and `Fix:` line; nothing is swallowed.
//! 4. Thin — no caching of run truth, no client-side policy evaluation, no
//!    second error taxonomy.
//!
//! Known honest gaps (standard §17): engine `0.1.15-rc1` has no standalone
//! daemon verify route — [`Agent::verify`] executes the CLI of record; raw
//! journal records and the refusal log are not on the wire.
#![forbid(unsafe_code)]

mod agent;
mod daemon;
mod error;
mod sse;

pub use agent::{vae_command, Agent, VerifyReport};
pub use daemon::{DaemonClient, EventStream, OPEN_PATHS};
pub use error::VaerionError;
pub use sse::{parse_sse, SseParser};

/// The SDK version of record — tracks the engine minor line it was
/// conformance-tested against (standard §16c).
pub const VERSION: &str = "0.1.15-rc1";

/// The engine version this SDK was conformance-tested against.
pub const ENGINE_VERSION_TESTED: &str = "0.1.15-rc1";
