# VAERION SDK STANDARD — v0.1

> **Status: v0.1 — implemented across five SDKs; Founder ratification
> pending.** This document is the language-neutral contract that every
> Vaerion SDK — TypeScript, Python, Go, Rust, and Java, all shipped —
> must satisfy before it may call itself a Vaerion SDK. It is written
> against engine `0.1.15-rc1` (re-verified 2026-10-18; previously
> `0.1.14-rc1` after version-register alignment, 2026-10-03, and
> `0.1.13-rc1` @ `7e6b751`, 2026-10-01) and
> verified against source: the daemon route table
> (`packages/vaerion/src/api/routes.ts`), the wire client
> (`sdks/typescript/src/daemon.ts`), the in-process client
> (`sdks/typescript/src/index.ts`), and the CLI `--json` NDJSON contract
> (`packages/vaerion/src/cli/render.ts`). Wire facts are quoted from these
> files; nothing here is aspirational. Where the engine has a gap, the gap
> is stated — never papered over with an invented route.

---

## 0. The four design laws

1. **The SDK is a projection, never a second implementation** (machine
   parity law, Sacred Invariant #7). Same contracts as the CLI: same runs,
   same journals, same receipts. Parity is enforced by a test battery, not
   promised.
2. **The wire is canonical.** Daemon HTTP routes and CLI `--json` NDJSON
   are the two sanctioned transports. A field name on the wire
   (`run_id`, `journal_verified`, `head_hash`) is law; SDK types map casing
   per language idiom but never rename semantics.
3. **Fail-closed fidelity.** If the engine refuses, the SDK refuses the
   same way with the same code. An SDK that swallows, rewrites, or
   defaults-around an engine decision is defective.
4. **Thin.** No caching of run truth (the journal is the truth), no
   client-side policy evaluation, no second error taxonomy, no invented
   endpoints. Anything an SDK needs beyond this document requires a
   standard revision, not a feature branch.

---

## 1. Client

**(a) Semantic contract.** A Client is the single entry object an
application instantiates. It binds to exactly one workspace. Two binding
modes exist and both MUST be implemented or the missing one named honestly:

- **In-process** (`VaeClient`): calls the engine library directly in the
  host process. Options: `{ cwd? }` (default: process cwd).
- **Daemon** (`VaeDaemonClient`): HTTP/SSE against a local `vae serve`.
  Options: `{ base, token }` — `base` MUST be loopback (the SDK refuses
  non-loopback bases in code before any byte is sent, `E2006`).

**(b) Canonical wire mapping.**
In-process: `runCli(argv, io, cwd)` in `--json` mode (the SDK appends
`--json`; results are NDJSON objects `{ code, lines }`).
Daemon: the route table below (§19). Unauthenticated metadata routes:
`GET /health`, `GET /version`, `GET /openapi.json`. Everything else
requires the pairing token.

**(c) Naming.** The shipped truth (every name verified against source,
2026-10-01 @ `7e6b751`):

- TypeScript: `VaeClient` (in-process facade) + `VaeDaemonClient` (wire
  client) — camelCase methods.
- Python (`vaerion` package): `Agent` (facade) + `VaeDaemonClient` —
  snake_case methods.
- Go (package `vae`): `vae.Client` (facade) + `vae.DaemonClient`.
- Rust (crate `vaerion`): `vaerion::Agent` (facade) + `DaemonClient` —
  snake_case methods.
- Java (`dev.vaerion.sdk`): `VaeClient` + `VaeDaemonClient`.

The in-process binding of §1(a) (`runCli` called directly in the host
process) remains **TypeScript-only**; every other language binds via the
loopback daemon and is named honestly per §1(a) — their facades spawn a
local `vae serve` with a pre-provisioned `VAE_TRUST` token. The name
`createClient` is reserved to nothing — a factory by that name existed
only as a documentation ghost and MUST NOT be reintroduced.

## 2. Run

**(a) Semantic contract.** A Run is one governed execution (research, demo,
model, agent, workflow) with two stable coordinates — `run_id`
(`crn_run_<ulid>`) and `trace_id` — an append-only journal, and a terminal
receipt. A run is *open*, *awaiting a gate*, or *closed*. A closed run is
immutable. `run_id` is the handle for every other concept.

**(b) Canonical wire mapping.**
Daemon: `POST /runs` body `{ kind: "agent"|"workflow", goal?, planner?,
steps?, max_steps?, dag? }` → `201` `RunStarted { run_id, trace_id, kind }`
with `Location: /runs/{run_id}`; `GET /runs/{run_id}` → `RunStatus`
(`status: "open"|"awaiting_gate"|"closed"`, `journal_ok`, decision counts,
`open_gates`, `receipt` when closed); `GET /runs` lists; `POST
/runs/{run_id}/answer` `{ gate_id, answer }` resolves a gate; `POST
/runs/{run_id}/continue`; `POST /runs/{run_id}/cancel` (in-flight runs are
refused `409 E2005`). CLI `--json`: `vae run <kind> --json` emits a
terminal NDJSON line carrying `run_id`, `trace_id`, and (when the run
closes) `receipt` and `journal_verified`.

**(c) Naming.** Wire fields stay snake_case inside payload maps in every
language. SDK-level types map: TS `runId`, Go `RunID`, Rust `run_id`
(serde rename), Java `getRunId()`, Python `run_id`. `resume` (gate
resolution) keeps the engine word: TS `resume(input)`, daemon
`answerGate(runId, gateId, answer)`.

## 3. Receipt

**(a) Semantic contract.** A receipt is the verifiable summary of a closed
run, **folded from the journal** — never asserted, never hand-built by an
SDK. It certifies the chain up to and including itself
(`journal.head_hash` is the integrity commitment). SDKs MUST NOT construct
receipts locally; they only carry and surface them.

**(b) Canonical wire mapping.** The receipt is the terminal `receipt`
record of the run journal (see `receipt.schema.json` of the 8 JSON
Schemas). Surfaces: the `receipt` key of CLI run NDJSON;
`GET /runs/{run_id}` → `RunStatus.receipt` when closed; `vae journal show
RUN --json` (last record, `k: "receipt"`). Required fields an SDK must
expose: `run_id`, `trace_id`, `engine_version`, `config_fingerprint`,
`opened_at`, `closed_at`, `counts` (records, events,
decisions_allow/deny/prompt, gates_opened/resolved, snapshots,
recovery_notes), `blob_refs[]` (`{alg, hash, size}`), `journal.records`,
`journal.head_hash`, `summary`.

**(c) Naming.** Keep the field table verbatim (snake_case) in wire-facing
types; language-idiomatic accessors on top. The words are `receipt` and
`head_hash` — never "attestation", never "proof token".

## 4. Verify

**(a) Semantic contract.** Verification is the recomputation of a journal's
blake3 chain: shape, 1-based index continuity, hash linkage, gapless
per-run seq. The result is a `VerifyReport`:
`{ ok, path, records, events, maxSeq, headHash, torn, issues[] }` with
`issues[]: { i, code, message }` where `code ∈ {E1001, E1002, E1003, E1005,
E1006, E1009}`. Verification depends only on bytes on disk — never on the
process that produced them. An SDK MUST expose verification and MUST NOT
cache or fabricate its result.

**(b) Canonical wire mapping.** In-process: `verifyJournal(path)` (same
primitive the audit ledger uses). CLI: `vae journal verify RUN --json` →
NDJSON `{ command: "journal", sub: "verify", run_id, report: VerifyReport }`
(exit `0` when ok, `5` when not). Daemon: this engine version has **no
standalone verify route** — wire clients read `RunStatus.journal_ok` plus
`receipt` from `GET /runs/{run_id}`; a ratified `/journal/*` route family
is the standard's first additive-candidate (§17).

**(c) Naming.** `verify` everywhere: `verifyJournal`, `journalVerify`,
`Verify`, `verify()`. The report type is `VerifyReport` in every language.

## 5. Policy

**(a) Semantic contract.** Permission is expressed as an ordered rule set:
`PolicyContract { policy_id, version: 1, rules[] }`, each rule
`{ id, principalKinds, domain, scope, effect: "allow"|"deny"|"prompt",
gateLabel?, rationale }`. Semantics every SDK must preserve when
*surfacing* policy (never evaluating it): **first match wins**;
**no match ⇒ deny `E1301`** (fail-closed); `prompt` opens a durable human
gate; `rationale` is mandatory. Principal kinds:
`human | agent | tool | extension | research | system`. Domains (12):
`fs.read, fs.write, net.connect, exec.run, model.invoke, secret.read,
tool.call, intel.query, research.index, research.fetch, journal.append,
journal.read`.

**(b) Canonical wire mapping.** Policy is declared in `vaerion.yaml`
(`policy.rules`, schema `vaerion-yaml.schema.json`) — SDKs never evaluate
it. Its effects surface as journaled broker decisions (CLI
`vae explain RUN --json` → `decisions[]`; daemon `GET /runs/{run_id}` →
`decisions: { allow, deny, prompt }`) and as gates (`open_gates` on the
run status; `POST /runs/{run_id}/answer` to resolve).

**(c) Naming.** `PolicyRule`, `PolicyContract`, `effect`, `rationale` are
reserved words across SDKs. Do not invent "roles", "scopes" as a separate
concept, or client-side allow/deny logic.

## 6. Journal

**(a) Semantic contract.** The journal is the append-only, blake3-chained,
per-run NDJSON record of everything that happened. Record kinds:
`meta | evt | decision | gate | snapshot | receipt`. Genesis `prev` is 64
zeros. SDKs read journals; only the engine's single-writer `JournalWriter`
appends. Snapshots are accelerators — never truth.

**(b) Canonical wire mapping.** Files at
`.vaerion/journal/<run_id>.ndjson`. In-process: `readJournal`,
`listJournals`, `replayJournal`, `recoverJournal`, `exportRedacted`.
CLI `--json`: `vae journal ls --json` (per run: `run_id`, `records`,
`events`, `head_hash`, `bytes`), `vae journal show RUN --json` (one record
per NDJSON line), `vae journal export RUN --json` (redacted, re-chained,
self-verifying derivation). Daemon: run truth is served via
`GET /runs`/`GET /runs/{run_id}` (folded from the journal — nothing is
cached); raw record access over the wire is not ratified in this engine
version.

**(c) Naming.** `JournalRecord`, `VerifyReport`, `RecoveryReport`,
`ExportReport` keep their engine names. `recover` means *truncate a torn
crash tail and re-seal* — never "repair corruption".

## 7. Blob

**(a) Semantic contract.** Blobs are immutable content-addressed bytes:
`{ alg: "blake3", hash, size }`, stored under `.vaerion/blobs/`. A blob ref
that fails size/digest verification is `E1008`; a missing blob is `E1007`.
SDKs expose open/verify; they never mutate content in place.

**(b) Canonical wire mapping.** In-process: `BlobStore(root).put/open/
exists/verify`. Over the wire, blobs surface as `blob_refs` inside
journals, receipts, and run status; raw blob transfer is not a daemon
route in this engine version. CLI: `vae doctor` verifies every referenced
blob.

**(c) Naming.** `BlobRef` with fields `alg/hash/size` verbatim; the store
class is `BlobStore`. The word "blob" is canonical — not "object", not
"artifact" (artifact means `.vxn` bundles and extension pins).

## 8. Gateway

**(a) Semantic contract.** All model I/O crosses ONE sanctioned gateway
gate: broker decision (`model.invoke`, ceiling = `gateway.providers`) →
optional `secret.read` decision (value resolved at call time, never
journaled) → adapter → sanctioned transport → metering (integer micro-USD,
never floats) → journal. SDKs invoke; they never bypass, cache at the
gate, or log secret values.

**(b) Canonical wire mapping.** In-process/CLI:
`GatewayService.invoke(host, input)`; CLI `vae run model --model P/M …
--json` → NDJSON with `usage`, `cost`, `metering`, `receipt`,
`journal_verified`. Daemon: `GET /models` (capability matrix, secret NAMES
only), `GET /models/{logical}` (capability + price entry), `GET /tools`.
The gateway's own HTTP egress is engine-internal (`fetchTransport`); SDK
tests use `cassetteTransport` (recorded wire chunks keyed by a blake3
request fingerprint) for byte-deterministic replays.

**(c) Naming.** Ops are exactly `chat | embed | rerank` (`MODEL_OPS`).
Model ids are `provider/model-id` (`parseModelId`, else `E1700`).
`UsageCost.totalMicroUsd` is an integer — an SDK that introduces floating
money violates this standard.

## 9. Refusal

**(a) Semantic contract.** A denial is evidence. Every broker deny is
recorded twice: as a `decision` record in the run journal, and as a
`refusal` entry in the workspace refusal log `.vaerion/refusals.log` — a
blake3 chain of its own (genesis 64 zeros), verifiable independently of
the run. Refusal entries carry `{ at, run_id, decision_id, request_id,
principal, domain, scope, reason_code: "E1300"|"E1301", reason, policy }`.

**(b) Canonical wire mapping.** In-process: `readRefusals(path, filter?)`,
`verifyRefusalLog(path)`. CLI `--json`: `vae explain RUN --json` →
`refusals[]` (per refusal: `reason_code`, `domain`, `scope`, `reason`),
and `vae center --json` reports the refusal-log chain integrity. Daemon: no
refusal route is ratified in this engine version — wire clients use the
run's journaled `decisions_deny` counts plus `explain` NDJSON; a
ratified refusals route is a §17 candidate.

**(c) Naming.** The word is **refusal** (engine law), with `reason_code`
carrying the stable E-code. An SDK that renames refusals to "rejections"
or "blocks" breaks cross-SDK grepability, which is the point of the
standard.

## 10. Errors

**(a) Semantic contract.** One error taxonomy: `VaerionError` with a stable
`E####` code (`E1000`–`E2312`, 82 codes in `ERROR_CATALOG`; `spec/errors.yaml`
is the source of truth), a human message, a machine-readable `detail`
object, and a **`Fix:` line** — the actionable next step. The philosophy:
stable code + what failed + why likely + Fix. Codes are never renumbered
or recycled; new codes are appended only.

**(b) Canonical wire mapping.** CLI `--json` error lines (stderr):
`{"error":{"code","name","message","fix","detail"}}`. Daemon non-2xx
bodies: the same `error` object. Exit-code contract (CLI): `0` ok · `1`
internal · `2` usage · `3` broker-denied · `4` provider-down · `5`
partial-with-repair-hint. SDKs MUST attach `code`, `fix`, and (over the
wire) `status` to thrown errors — the TypeScript SDK's `raiseForStatus` is
the reference behavior.

**(c) Naming.** The exception type is `VaerionError` in every language.
E-codes are strings, never enums that require recompilation to learn new
values.

## 11. Authentication

**(a) Semantic contract.** The daemon is loopback-only (non-loopback binds
refused server-side `E2001`; wire clients refuse non-loopback bases in
code `E2006`). Authentication is a **pairing token**: generated at daemon
start, printed once (or pre-provisioned headlessly via `VAE_TRUST=<token>`,
in which case it is never printed). There is no flag that opens the daemon
to the network; remote exposure requires a ratified transport-security ADR.

**(b) Canonical wire mapping.** `Authorization: Bearer <token>` on every
call except the three unauthenticated metadata routes (`/health`,
`/version`, `/openapi.json`). Shutdown is double-guarded: the body must
echo the token (`{"token": "…"}`; mismatch `403 E2004`). SDKs MUST NOT
persist the token beyond the process, log it, or send it anywhere except
the daemon base.

**(c) Naming.** Option name: `token`. Environment pre-provision:
`VAE_TRUST`. There is no "api key", no "client secret".

## 12. Configuration

**(a) Semantic contract.** One workspace, one `vaerion.yaml`, strict
schema `0.1` (`CONFIG_SCHEMA_VERSION = "0.1"`): unknown keys are rejected
(`E1201`), schema violations `E1202`, and `telemetry.enabled` accepts only
`false`. `loadConfig` returns the config plus a blake3
`config_fingerprint` that appears in receipts. SDKs MAY load and validate
config through the engine; they MUST NOT write hand-rolled parsers or
accept unknown keys.

**(b) Canonical wire mapping.** In-process: `loadConfig(path)` →
`{ config, fingerprint }`; `validateConfig(value)`. CLI: `vae init
--template T` (and `vae create` / `vae start`) resolve T against the
template registry of record in `src/config/templates.ts` —
`minimal|demo|agent|tool|automation|multi-agent|enterprise` (7, verified
against the CLI `--help` and the registry source, 2026-10-01) — and write
template bytes (byte-stable, the only parameter `--name`); `vae doctor
--json` reports config validity + fingerprint. Schema of record:
`spec/schemas/vaerion-yaml.schema.json`.

**(c) Naming.** Template names are exactly `minimal`, `demo`, `agent`,
`tool`, `automation`, `multi-agent`, `enterprise` (unknown template ⇒
`E1203`; never a guess). Config field names follow the schema verbatim
in every language.

## 13. Streaming

**(a) Semantic contract.** Event streams are Server-Sent Events with
journal-cursor replay: a stream first REPLAYS every journaled envelope
with seq > cursor, then FOLLOWS the journal until the run seals. Frames:
`data: <envelope JSON>`; the stream terminates with `event: end`; failures
arrive as `event: error`. Payloads pass redaction before publication.

**(b) Canonical wire mapping.** `GET /runs/{run_id}/events?cursor=N`
(single run; ends at seal) and `GET /events?after=N&types=a,b&follow=true
&limit=200` (workspace-wide merge ordered by `(ts, run_id, seq)`; `follow`
defaults true). The TypeScript SDK's `streamRunEvents` /
`streamWorkspaceEvents` (async generators over a minimal SSE frame parser)
are the reference client implementation for porting.

**(c) Naming.** Iterator/Generator idioms per language: `AsyncGenerator`
(TS); sync generators/iterators (Python `Iterator`, Go `Events`
range-over-func, Rust `EventStream: Iterator`); `Iterator`/`Stream`
(Java). The cursor parameter is `cursor` (per-run) / `after` (workspace) —
keep both names.

## 14. Events

**(a) Semantic contract.** An event is an `Envelope`:
`{ v: 1, type, seq, ts, trace_id, span_id, actor, cause, payload }`.
`ENVELOPE_VERSION = 1`; `seq` is per-run, monotonic, gapless, allocated by
the journal writer (never by callers). The type registry (`EVENT_TYPES`,
42 types) is additive-only; unknown types are an emit-time error (`E1101`)
but MUST be forwarded untouched at read time (forward-compat duty).

**(b) Canonical wire mapping.** Envelope JSON is canonical NDJSON
(`encodeEnvelope`/`decodeEnvelope`; schema `envelope.schema.json`). It
appears inside journal `evt` records, on SSE streams, and as CLI NDJSON
event lines. SDKs validate `v` and `seq` shape; they treat unknown `type`
values as opaque data.

**(c) Naming.** Field names are wire-verbatim (`trace_id`, `span_id`,
`seq`). `Actor` kinds match principal kinds exactly.

## 15. Type definitions

**(a) Semantic contract.** Every SDK ships types for the concepts above —
generated or hand-written, but **shape-checked against the 8 JSON Schemas**
(`envelope`, `journal-record`, `receipt`, `broker-decision`, `gate`,
`vaerion-yaml`, `capability-declaration`, `evidence-record`) and the
generated OpenAPI description (`spec/openapi.json`, produced from the same
route table that dispatches — drift is impossible by construction on the
daemon side, and conformance tests hold the SDK side to the same law).

**(b) Canonical wire mapping.** Wire field names (snake_case) are
canonical inside payload-carrying structures. Language mappings:
snake_case → camelCase (TS/Java), → CamelCase exported fields (Go, with
json tags), → snake_case (Rust/Python, serde rename or native).

**(c) Naming.** Preserve engine names for engine concepts (`RunReceipt`,
`VerifyReport`, `GateRecord`, `PolicyRule`, `BlobRef`, `Envelope`). Do not
introduce synonyms. Type names are part of the standard's grep surface.

## 16. Version compatibility

**(a) Semantic contract.** The versioned surfaces are: the engine
(`0.1.15-rc1` today, semver `MAJOR.MINOR.PATCH-rcN`), the envelope
(`ENVELOPE_VERSION = 1`), and the config schema (`"0.1"`). An SDK must
know all three and surface them.

**(b) Canonical wire mapping.** Handshake: `GET /health` →
`{ ok, engine_version, uptime_ms }`; `GET /version` → engine version,
substrate, envelope version, and published contract counts (event types,
error codes). CLI `--json`: `vae version --json` → `{"version":"…"}`.
Every SDK exposes the engine version it attached to after the handshake.

**(c) Semver rules for SDKs.**
- SDK `0.M.P`: `M` tracks the engine minor line it was conformance-tested
  against; `P` is SDK-only fixes.
- Handshake mismatch in engine `MAJOR` ⇒ refuse to attach (loud
  `version_mismatch` error). Mismatch in `MINOR` ⇒ attach, emit a
  warning, and disable any method the tested range does not cover — never
  silently approximate.
- Envelope `v ≠ 1` ⇒ refuse (no negotiation in v0.1 of this standard).
- Config `schemaVersion ≠ "0.1"` ⇒ refuse with `E1202` fidelity.

## 17. Migration rules

- **Engine → SDK:** wire routes are additive within a minor (new routes,
  new optional body fields). Old SDKs ignore unknown routes and unknown
  fields — parsers that reject unknown fields violate forward-compat duty.
- **Codes:** E-codes are append-only forever. An SDK's error display must
  render unknown E-codes as the code + message + fix it received — never
  as a generic "unknown error".
- **Event types:** additive-only within envelope v1. Unknown event types
  on streams/records pass through untouched.
- **Templates:** names are registry-resolved; an unknown template name is
  a usage error (`E1203`), never a guess.
- **Deprecation:** a wire route or SDK method may be deprecated only by a
  ratified standard revision that names its replacement; removal requires
  an engine MAJOR.
- **Known additive candidates** (documented gaps in engine `0.1.14-rc1`,
  to be ratified, never invented by SDKs): standalone
  `GET /journal/{run_id}/verify` and refusal-read routes on the daemon.

## 18. Testing rules — the conformance suite

Every SDK ships a conformance suite that runs against a real workspace
(`vae init --template demo` + a real or cassette-backed daemon) and
asserts, at minimum, the cases below. A suite with fewer cases is not a
Vaerion SDK.

1. **Version handshake** — attach, read engine version (`/health`,
   `/version`), assert non-empty and surfaced to the caller; assert
   non-loopback base is refused (`E2006`) without any byte sent.
2. **Run lifecycle** — start an agent run (`POST /runs`, inline planner or
   `vae run` NDJSON), poll/stream to a terminal status, assert
   `status: "closed"` and a receipt present; assert the run is visible in
   `GET /runs`.
3. **Journal verify roundtrip** — verify the run's journal (in-process
   `verifyJournal` or CLI `vae journal verify RUN --json`) and assert
   `report.ok === true`, `torn === false`, `issues === []`. Measured
   relationship (2026-10-01, live): the receipt is the terminal journal
   record appended AFTER the fold, so the verified file carries
   `records === receipt.journal.records + 1` and a `headHash` one link
   beyond `receipt.journal.head_hash` — assert `records >=` the receipt's
   count and that the chain recomputes; do NOT assert head-hash equality.
4. **Receipt fields** — assert every required receipt field of §3 exists
   with the right shape (`counts` keys present, `blob_refs` entries
   `{alg, hash(64 hex), size}`, `journal.head_hash` 64 hex).
5. **Refusal read** — deny one action (flip a policy rule or use an
   ungranted tool), assert the run surfaces the denial (journaled decision
   + refusal entry via in-process `readRefusals`/CLI `explain --json`
   `refusals[]`), and assert the refusal-log chain verifies.
6. **Error-code fidelity** — provoke a stable failure (unknown command,
   missing required flag, unknown model) and assert the SDK-thrown error
   carries the exact engine code (`E1600`, `E1700` …), the `fix` text, and
   the right exit/status class — not a rewritten message.
7. **SSE event stream parse** — connect to `/runs/{run_id}/events`,
   parse frames through the SDK's stream type, assert: envelopes arrive
   with gapless `seq` from the cursor, `event: end` terminates, and an
   unknown event type passes through without breaking the stream.

Parity note: the TypeScript SDK's `sdk-parity.test.ts` additionally proves
CLI ⇄ SDK agreement on run ids, verification, receipts, and redacted
exports — other SDKs should port the same parity spine where an in-process
binding exists.

Shipped conformance (measured 2026-10-01 against engine `0.1.13-rc1` @
`7e6b751`; re-verified 2026-10-03 on engine `0.1.14-rc1`; integration cases spawn a REAL loopback daemon in a temp
workspace — never skipped, never faked): Python **12/12**, Go **43/43**,
Rust **27/27** (12 lib + 14 conformance + 1 doctest), Java **40/40**
(37 unit + 3 real-daemon integration). Every suite covers the lifecycle,
verify-roundtrip, receipt-fields, error-fidelity, and SSE cases above,
and each proves the fail-closed evidence law: an undeclared tool step
closes the run WITH a receipt and the journal still verifies.

## 19. Documentation rules

1. **No undocumented flags, no phantom APIs.** Every method, flag, route,
   and field an SDK documents must exist in the engine source it targets.
   The `createClient` incident (a documented factory that never existed)
   is the standing counter-example; a phantom API in SDK docs is a release
   blocker.
2. **Provenance header.** Every SDK README states the engine version and
   commit it was generated against, e.g. *"Generated against engine
   `0.1.13-rc1` @ `f6e328b`; every signature verified against source."*
3. **Examples are executed before publishing.** A code example ships only
   if it was run against a real workspace and its output shape matches the
   real renderer (`run_id`, `receipt`, `journal_verified` …). "Expected
   output" sections quote real shapes with placeholder ids/hashes, labeled
   as such.
4. **Errors teach.** Documentation of failures shows the `code + Fix:`
   shape and the exit-code contract; it never shows truncated or invented
   error text.
5. **Honest gaps.** Where the engine lacks a surface (e.g. no daemon
   verify route in this version), docs say so and show the sanctioned
   alternative — never a workaround that pretends the route exists.

---

## Ratification checklist (Founder)

- [ ] §0 design laws — accept as binding
- [ ] §1–§15 concept contracts + wire mappings — accept as binding
- [ ] §16 semver rules — accept / amend
- [ ] §17 migration rules + additive-candidate list — accept / amend
- [ ] §18 conformance-suite minimum — accept as release gate
- [ ] §19 documentation rules — accept as release gate

*End of VAERION SDK STANDARD v0.1 — implemented across five SDKs; Founder ratification pending.*
