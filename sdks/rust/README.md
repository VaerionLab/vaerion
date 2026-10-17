# vaerion — the Rust SDK for Vaerion

> Generated against engine `0.1.15` (version-register alignment, 2026-10-03;
> signatures verified against source at `815e929`). Wire surface: `packages/vaerion/src/api/routes.ts` (the same
> table that dispatches and generates the daemon's OpenAPI description),
> auth/shutdown law: `packages/vaerion/src/api/server.ts`, CLI-of-record
> verify shapes: `packages/vaerion/src/cli/commands.ts` (`cmdVerify`,
> `journal verify`). Behavioral reference: `sdks/python/src/vaerion/`.

## Binding mode — stated honestly, up front

The in-process binding (`VaeClient`) is **TypeScript-runtime-only**: the
Vaerion engine is a TypeScript library, and no Rust process can call it
in-process. The Rust SDK therefore binds through the two sanctioned wire
transports of the [SDK standard](../../VAERION_SDK_STANDARD.md):

1. **The loopback daemon** (`vae serve`) — `DaemonClient` speaks exactly the
   published HTTP/SSE routes with the pairing token. Non-loopback bases are
   refused **in code, before any byte is sent** (`E2006`).
2. **The CLI of record** (`vae verify --json`) — `Agent::verify` recomputes
   the journal's blake3 chain from the bytes on disk by executing the CLI in
   the workspace. Verification trusts bytes, not processes.

This is a binding mode of the standard (§1a: "both MUST be implemented or the
missing one named honestly") — not a workaround.

## Install

The crate is not yet on crates.io — registry publication (crates.io / npm /
PyPI / Maven Central) is Founder-gated (`docs/SDK.md`). Until then, consume
from this repository of record: point a path dependency at the checkout
(`vaerion = { path = "path/to/vaerion/sdks/rust" }`) or vendor the
`sdks/rust` crate directory into your workspace. Verify with `cargo test`
(27 tests) from the crate directory.

## Quickstart — the five-line experience

```rust
use vaerion::Agent;

let mut agent = Agent::spawn(&workspace)?;          // starts `vae serve` on a free loopback port
let result = agent.run("summarize the project")?;   // brokered + journaled (declared inline note plan)
println!("{}", result["receipt"]["journal"]["head_hash"]);  // the integrity commitment
let verified = agent.verify(Some(run_id))?;         // chain recomputation via the CLI of record
agent.close();                                      // token-echo shutdown + child reap (Drop covers you too)
```

Real output of `cargo run --example basic` (isolated temp workspace; run
2026-10-01 on the `0.1.13` line; flow re-verified on `0.1.15` via the
engine parity suite):

```text
workspace: /tmp/vaerion-rust-basic-20458-1790833913974348014
daemon:    http://127.0.0.1:44627 (spawned, loopback, token pre-provisioned)
run_id:     crn_run_01M3V09W8MR2DTCVFJ5J8A1HKH
status:     closed
journal_ok: true
records:    7
head_hash:  b0aa82fd7a36188992290fe26cdf2f091be45bbc895b74f0d7eafd65b613fd53
verify:     ok=true torn=false records=8 head=68e757cbd5b41976679706c9af10d380b5cd153d205bfa27aee5ab0230b825c6
```

(ids/hashes are real output from one execution, not placeholders.) Note
`records=7` in the receipt vs `records=8` in the verify report: the receipt
certifies the chain **up to its fold**; the terminal receipt record itself is
appended afterwards, so the verified head is one link beyond
`receipt.journal.head_hash`.

## The wire surface (nothing invented)

| Method | Path | Token? | SDK call |
|---|---|---|---|
| GET | `/health` | no | `DaemonClient::health` |
| GET | `/version` | no | `DaemonClient::version` |
| GET | `/openapi.json` | no | `DaemonClient::openapi` |
| POST | `/runs` | Bearer | `start_agent_run` / `start_workflow_run` |
| GET | `/runs/{run_id}` | Bearer | `DaemonClient::get_run` |
| GET | `/runs/{run_id}/events` | Bearer | `DaemonClient::events` → `EventStream` (Iterator of parsed SSE payloads) |
| POST | `/runs/{run_id}/answer` | Bearer | `DaemonClient::answer_gate` |
| POST | `/shutdown` | Bearer + token echo | `DaemonClient::shutdown` |

`Agent` wraps the client: `spawn(cwd)` / `attach(base, token)`, `run(goal)`
(inline planner default = the single declared note step
`{"kind":"note","text":"goal: <goal>"}`), `run_with(goal, steps, planner,
max_steps, timeout)`, `workflow(dag)`, `status(run_id)`, `events(run_id)`,
`verify(run_id: Option<&str>)`, `close()`, plus a `Drop` safety net.

Wire payloads are returned as `serde_json::Value` with **field names exactly
as the wire carries them** (`run_id`, `journal_ok`, `head_hash`,
`open_gates`, …). One typed struct ships where normalization is needed:
`VerifyReport` (`run_id`, `ok`, `torn`, `records`, `events`, `head_hash`,
`issues`) — snake_case verbatim.

## Verify — the CLI of record

```rust
let verified = agent.verify(Some(&run_id))?;   // vae journal verify RUN --json
assert!(verified.ok && !verified.torn);
println!("{}", verified.head_hash.as_deref().unwrap());
```

`Agent::verify` normalizes the two CLI faces into one `VerifyReport`:
`vae verify --json` is flat (`head_hash` snake_case), `vae journal verify RUN
--json` wraps the report under `"report"` with camelCase `headHash` — both
arrive as the same struct. A failed chain (nonzero exit) raises `E1001` with
the full report payload as `detail`.

## Errors — one taxonomy, the engine's

`VaerionError { code, message, fix, detail }` implements `std::error::Error`
and renders as `"<code> <message> (Fix: …)"`. Codes are strings — never an
enum that needs recompilation to learn new values. A live daemon error body,
carried verbatim:

```json
{"error":{"code":"E2003","name":"daemon_run_unknown","message":"run crn_run_UNKNOWNUNKNOWNUNKNOWNUNKNO is not known to this workspace","fix":"List known runs from the journal directory; run ids are crn_run_* journal names under .vaerion/journal/.","detail":null}}
```

| Code | When | Fix shipped with the error |
|---|---|---|
| `E1001` | journal verification FAILED (CLI exit ≠ 0) | `vae journal recover <run_id>` |
| `E1601` | daemon unreachable / vae runtime not found / spawn died | `start it with \`vae serve\` (loopback only) and pass the pairing token` |
| `E1602` | run did not close within the deadline | inspect `GET /runs/{id}` and the events stream |
| `E1900` | unreadable daemon/CLI machine output | — |
| `E2000` | pairing token missing or invalid / shutdown without token | pass the pairing token |
| `E2003` | unknown run (from the daemon, unmodified) | from the daemon body |
| `E2006` | non-loopback base refused in code (this SDK, before any byte) | use a loopback base such as `http://127.0.0.1:7897` |

## Resolving `vae`

`$VAE_BIN` (whitespace-split, e.g. `bun run /path/vae.ts`) → `vae` on PATH →
repo fallback `bun run <repoRoot>/packages/vaerion/src/cli/vae.ts` (repoRoot =
two parents above this crate) when `bun` exists → otherwise `E1601`.

## Conformance suite

`cargo test` runs the §18 battery: SSE parsing (multi-event, multiline data,
garbage passthrough as text, empty), error-contract fidelity, the loopback law
(`E2006` before any byte), token header rules, unreachable-daemon `E1601`, and
— against a REAL spawned daemon in a temporary workspace (skipped, never
faked, when no vae runtime exists): run lifecycle with receipt fields,
status-fold agreement, CLI verification green, SSE replay (`run.opened`),
fail-closed denial evidence (undeclared tool step → `status: closed`,
`agent.outcome: "failed"`, receipt STILL present, journal STILL verifies), and
error-code fidelity over the live wire (`E2003`).

Dependencies are deliberately minimal: `serde` (derive), `serde_json`,
`ureq` (json). Blocking I/O only — the daemon is loopback-local.

## Honest gaps

- **No standalone daemon verify route in engine `0.1.15`** — verification
  is the CLI of record (`vae verify` / `vae journal verify`), which is what
  this SDK executes. A ratified `/journal/*` route family is the standard's
  first additive candidate (§17); when the engine ships it, this SDK can move
  `verify()` onto the wire.
- Raw journal records and the refusal log are not on the daemon wire in this
  engine version; read them through the CLI (`vae journal show`,
  `vae explain --json`) or the workspace files.
- The SSE `EventStream` ends on a mid-stream transport error after flushing
  any pending frame rather than panicking; the journal is the truth and can be
  re-read. The daemon closes streams cleanly after `event: end`.
- Non-object SSE data frames are skipped by `EventStream` (the Python
  reference filters identically); the raw parser (`parse_sse`) passes
  non-JSON data through as `Value::String`.

## License

Apache-2.0, matching the repository.
