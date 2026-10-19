# Final Architecture Review — RC-1 → GA

| | |
|---|---|
| **Scope** | The GA objective 6 architecture sweep: does the shipped architecture hold the constitution under release scrutiny? |
| **Method** | Every verdict below is measured by a named gate or report — this document reviews and points; it never asserts what a gate did not prove |
| **Evidence** | [`ARCHITECTURE_REPORT.md`](../../ARCHITECTURE_REPORT.md) (full record) · `tools/layerlint.ts` (95 files / 459 runtime edges / 0 violations) · `tools/constitutional-check.ts` (C1–C9 green) · `tools/verify.ts` (all 6 gates green, 309 tests / 2081 expectations / 31 files) |

## Verdict: **the RC-1 architecture is GA-shaped** — with the honest boundaries below.

## 1. The layer model holds under release scrutiny

| Layer | Contents | Law | Measured by |
|---|---|---|---|
| L0 | `kernel/`, `config/` | depends on nothing above | layerlint |
| L1 | `spine/`, `journal/`, `store/`, `receipts/`, `broker/`, `gateway/` | L0 only | layerlint |
| L2 | `runtime/run.ts`, `research/`, `agents/`, `workflow/`, `evals/`, `extensions/`, `package/` | L0, L1 | layerlint |
| L4 | `cli/`, `api/` (the daemon may never import the CLI) | L0–L2 | layerlint (hard edge) |
| SDK | `sdks/typescript` | engine public API; the only HTTP-client site is loopback-enforced in code (`E2006`) | sdk-parity + daemon-parity tests |

Release-collateral additions (examples, docs, `.github/`, `docs/ga/`, dist
pipeline) live OUTSIDE the engine layer model and introduce no engine edge —
measured: layerlint file/edge counts unchanged since the engine last changed.

## 2. The constitutional spine is singular and scanner-enforced

- **Every power crosses the broker** (`decide → journal → act`): tool calls,
  model invocations, secret reads, extension host calls, gate answers —
  denials are journaled + hash-chained in the refusal log (C-broker tests).
- **Exactly two network seams, both singular**: outbound provider egress
  (`src/gateway/transport.ts`, ADR-0019) and the SDK wire client
  (`sdks/typescript/src/daemon-transport.ts`, loopback-only in code, ADR-0020).
  The listener may never egress — C7 scans it with a zero-entry allowlist.
- **One journal of record** per run: NDJSON + blake3 chain, single-writer,
  verify/replay/recovery/redacted-export; receipts close every run honestly.
- **Machine parity by construction**: CLI and daemon call the SAME L2
  services (`package/service.ts`, agent/workflow/gateway compositions);
  wire-parity tests prove identical journaled event sequences on both
  surfaces — including byte-identical bundles built from either surface.
- **Contract-first**: `spec/openapi.json` is generated from the one route
  table (C4 byte-sync); the error catalog (67 codes) and event registry
  (40 types) are synchronized mirrors; SDK shapes are generated/checked
  against the same contracts (C4 + parity tests).

## 3. Determinism and replay are load-bearing, not decorative

- No wall-clock or ambient paths in produced artifacts: `.vxn` bundles are
  byte-identical across rebuilds (re-proven by hand this sprint AND by
  `tests/integration/examples.test.ts` on every gate run).
- CLI output is deterministic (a11y A2 byte-identical double-runs) and
  NDJSON-parseable (`--json`, A3) with zero-ANSI proof (A1) — the CLI is
  scriptable by contract, not by luck.
- Replay recomputes folds from the journal alone; snapshots are accelerators,
  never truth; agent metrics fold exclusively from gateway metering records
  (no double counting).

## 4. Security posture is architectural

Fail-closed broker at every layer; secret NAMES in config with call-time
keychain resolution behind a broker decision (ADR-0013); redaction on the
outbound path AND at the journal; digest-pinned extension host with an empty
environment; the bundle is a verified protocol artifact whose lock seals
config fingerprint + extension pins + bundle digest. Full record with
gate traces: [`SECURITY-HARDENING.md`](SECURITY-HARDENING.md).

## 5. Honest architectural boundaries at GA (not defects — recorded decisions)

1. **Serial run queue** — the daemon executes runs one-at-a-time per
   workspace because the audit ledger and refusal log are single-writer hash
   chains. Concurrency requires a ratified federation ADR (not drafted).
2. **Collect-then-consume streaming** — gateway invocations materialize
   frames before returning; incremental consumer streaming is deferred
   (the spine bus already supports ordered fan-out).
3. **Per-process breaker state** — deliberately not journaled; sound under
   the serial queue, needs an ADR for multi-process sharing.
4. **Substrate budgets** — OBJ-Q2/Q3/Q4 breached on TS-on-Bun (measured,
   root-caused in [`ADR-0018-EVALUATION.md`](ADR-0018-EVALUATION.md));
   Founder-gated, not architecture-gated.
5. **Reserved cloud seams** — ADR-0017 keeps cloud out of the v0.1 surface;
   nothing in the release depends on it.

## Review outcome

The architecture ships with its constitution intact: broker-gated powers,
one journal of record, deterministic artifacts, parity across surfaces, and
scanner-enforced seams. The open items above are recorded decisions or
Founder-gated ratifications — none is a hidden shortcut.
