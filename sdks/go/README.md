# vaerion-go — the Go SDK for Vaerion

> **Provenance.** Generated against engine `0.1.15-rc1` (version-register
> alignment 2026-10-03; generation-time provenance `815e929`); every signature and
> wire shape verified against source: the daemon route table
> (`packages/vaerion/src/api/routes.ts`), the daemon handlers
> (`packages/vaerion/src/api/server.ts`), the run-status fold
> (`packages/vaerion/src/api/run-registry.ts`), the verify primitive
> (`packages/vaerion/src/journal/verify.ts`) and the CLI verify commands
> (`packages/vaerion/src/cli/commands.ts` `cmdVerify`/`cmdJournal`).
> Wire facts are measured, never guessed; where the engine has a gap, the
> gap is stated (see [Honest gaps](#honest-gaps)).

**Binding model, stated honestly.** The in-process engine binding is
TypeScript-runtime-only (the engine is TypeScript on Bun; there is no
compiled Go binding of the engine library). This SDK binds through the
**loopback daemon** (`vae serve`, ADR-0010) over HTTP/SSE, and verifies
journals through the **CLI of record** executed as a subprocess —
verification trusts bytes on disk, not processes. Machine parity holds:
same runs, same journals, same receipts, same E-codes.

## Install

Go 1.23+, standard library only — **zero external dependencies** (no
`go.sum` is required; the module has nothing to hash).

```
go get github.com/VaerionLab/vaerion-go
```

A `vae` runtime must be resolvable on the machine (see
[CLI resolution](#cli-resolution)).

## The five-line experience

```go
import vae "github.com/VaerionLab/vaerion-go"

cwd, _ := os.MkdirTemp("", "vaerion-")
agent, _ := vae.NewClient(vae.WithCwd(cwd))
defer agent.Close()

result, _ := agent.Run("summarize the project from the journal")
fmt.Println(result.RunID)                                          // crn_run_…
fmt.Println(result.Receipt["journal"].(map[string]any)["head_hash"]) // 64-hex commitment
report, _ := agent.Verify(result.RunID)
fmt.Println(report.OK, report.Torn, report.HeadHash)
```

`NewClient` **spawns its own daemon**: it resolves the `vae` CLI, picks a
free loopback port, starts `vae serve --port <free> --host 127.0.0.1` with
the pairing token pre-provisioned via `VAE_TRUST` (the token is generated
from `crypto/rand` and **never printed, logged, or persisted**), waits for
`/health` to answer `ok`, and stops the daemon on `Close` (token-echo
shutdown → wait → terminate → kill).

**Attach mode** — bind to a daemon you run yourself:

```go
agent, err := vae.NewClient(
    vae.WithBase("http://127.0.0.1:7897"), // loopback only — see the E2006 law below
    vae.WithToken("<pairing token>"),
)
```

Real output of `go run ./examples/basic` (placeholders would dishonor the
contract; this is one actual run):

```
run_id:    crn_run_01M3V09D22FMZAG9WMH4MB7QNP
status:    closed
head_hash: 62220e95cb7cf2469e74f8fc5d45f8a28586cd4b5be4858f1f89fd76342cd4c4
verify:    ok=true torn=false records=8 head=9e8bd991e943467f15ab135b0265b966c14cee5e3f6e9cb17948bceffae88667
workspace: /tmp/vaerion-go-example-3954268292/.vaerion/journal
```

## API

### `Client` (facade)

| Method | Meaning |
| --- | --- |
| `NewClient(opts ...ClientOption) (*Client, error)` | Spawn (default) or attach. Options: `WithBase`, `WithToken`, `WithCwd`, `WithServeTimeout`. |
| `Run(goal string, opts ...RunOption) (RunStatus, error)` | One brokered, journaled agent run, awaited to closure. Inline planning is **declared**: with no `WithSteps`, the honest default is a single journaled note step `{"kind":"note","text":"goal: <goal>"}` — deterministic, no model calls. A failed step does **not** error: the run closes with a receipt and the agent fold carries `outcome:"failed"` (evidence, not an exception). Options: `WithSteps`, `WithPlanner` (`"inline"`/`"model"`), `WithMaxSteps`, `WithRunTimeout` (default 120s). |
| `Workflow(dag map[string]any, opts ...RunOption)` | One deterministic workflow DAG run (`{"id","nodes":[{"id","deps","step"}]}`), awaited to closure. |
| `Status(runID) (RunStatus, error)` | The folded status view without waiting. |
| `Events(runID) func(yield func(map[string]any) bool)` | Go 1.23 range-over-func iterator over the run's parsed SSE payloads (replay + follow; ends at the seal). Open errors terminate iteration silently — use `EventStream(runID)` when the dial error must be observed. |
| `EventStream(runID) (*EventStream, error)` | The same stream as an explicit handle (`Next`/`Err`/`Close`). |
| `Verify(runID string) (VerifyReport, error)` | Journal verification through the CLI of record (see below). Empty id → latest run. |
| `AnswerGate(runID, gateID string, answer map[string]any)` | Resolve a pending durable human gate. |
| `Close() error` | Stop a spawned daemon; no-op for attached clients; safe to repeat. |
| `DaemonClient() *DaemonClient` | The underlying wire client. |

### `DaemonClient` (wire client, 1:1 with the published OpenAPI)

`Health()` · `Version()` · `OpenAPI()` (the three **open** metadata
routes — no token) · `StartAgentRun(goal, steps, planner, maxSteps)` ·
`StartWorkflowRun(dag)` · `GetRun(runID)` · `Events(runID)` /
`OpenEvents(runID)` · `AnswerGate(runID, gateID, answer)` ·
`WaitForRun(runID, timeout)` · `Shutdown()`.

### Wire types

Snake_case json tags verbatim — the wire is canonical
(`run_id`, `trace_id`, `journal_ok`, `open_gates`, `last_seq`,
`events_seen`, `head_hash`, …). Semantics are never renamed.
`Health{OK, EngineVersion, UptimeMS}` · `RunStarted{RunID, TraceID, Kind}`
· `RunStatus{RunID, Kind, Status, JournalOK, TraceID, Decisions,
OpenGates, ResolvedGates, LastSeq, EventsSeen, Receipt, Agent, Workflow,
Metrics, Note}` · `VerifyReport{RunID, OK, Torn, Records, Events,
HeadHash, Issues}`.

## Verify — the CLI of record

This engine version has **no standalone daemon verify route**, so the SDK
executes the CLI of record as a subprocess **in the workspace cwd** and
normalizes the two output faces into one `VerifyReport`:

- `vae verify --json` (latest run) — flat shape
  `{command:"verify", run_id, ok, records, events, head_hash, torn, issues}`
- `vae journal verify RUN --json` — report-wrapped shape
  `{command:"journal", sub:"verify", run_id, report:{ok, records, events,
  maxSeq, headHash, torn, issues}}` (camelCase `headHash` — normalized)

Exit `0` → verified; exit `5` → failed chain, raised as `E1001` carrying
the parsed report payload as `Detail`; no parseable machine output →
`E1900`. `VerifyReport.HeadHash` matches `^[0-9a-f]{64}$` on a healthy
chain, and is the hash of the terminal receipt record — one link beyond
`receipt.journal.head_hash`, which certifies the chain up to its fold.

## Authentication law (standard §11)

- `Authorization: Bearer <token>` on **every** path except the three open
  metadata routes `/health`, `/version`, `/openapi.json` (proven by test —
  the token is never placed on those requests).
- **Loopback law:** a non-loopback base is refused **in code, before any
  byte is sent**, with `E2006` (checked at construction and re-asserted on
  every request). Accepted hosts: `localhost`, `127.0.0.0/8`, `[::1]` —
  the same set the daemon itself accepts server-side (`E2001`).
- Shutdown is double-guarded by the daemon: the body must echo the token
  (`{"token":"…"}`, mismatch `403 E2004`); the SDK sends the echo and never
  logs the token.

## CLI resolution

Mirrors the Python reference `_vae_command`, in order:

1. `$VAE_BIN` — split on whitespace (e.g. `VAE_BIN="bun run /path/vae.ts"`);
2. `vae` on `PATH`;
3. repo layout fallback for dev checkouts: `bun run
   <repoRoot>/packages/vaerion/src/cli/vae.ts`, where `repoRoot` is two
   parents above this package's source directory — only when `bun` exists;
4. otherwise `E1601` with a Fix line — never a guess.

## Errors

One taxonomy: `*VaerionError` with a stable `E####` code, rendering as
`E1234 message (Fix: …)`. Codes are strings, never renumbered; unknown
codes render as received (forward-compat duty). The daemon's non-2xx body
`{"error":{code,message,fix,detail}}` maps field-for-field; unreadable
bodies become `E1900`.

| Code | Meaning | When you see it from this SDK |
| --- | --- | --- |
| `E1001` | Journal verification FAILED | `Verify` on a chain that fails recomputation (Detail = the report payload) |
| `E1301` | Broker denial (no matching allow rule) | Surfaces in run folds as journaled evidence, not an SDK exception |
| `E1601` | Provider/CLI unreachable | vae CLI missing, daemon not reachable, spawned daemon died early |
| `E1602` | Partial — repair path exists | `WaitForRun` timeout (run did not close) |
| `E1900` | Machine-output contract violated | Unreadable daemon body, no machine output from verify |
| `E2000` | Pairing token missing or invalid | `Shutdown` without a token; daemon 401s |
| `E2003` | Unknown run | `GetRun`/`AnswerGate` on an unknown id |
| `E2004` | Shutdown echo mismatch | Token echoed in the body does not match |
| `E2006` | Non-loopback daemon base refused | `NewDaemonClient`/`NewClient(WithBase(...))` — before any byte is sent |

## Conformance tests

`go test ./...` runs the standard §18 battery: unit layer over
`net/http/httptest` (SSE parse incl. multiline/garbage/empty, error-payload
contract + tolerance, loopback refusal **before any dial**, token absence
on open paths measured on the wire, start-body contract, wait timeouts,
shutdown echo) and an integration layer against a **REAL spawned daemon**
in `t.TempDir()`: run → `crn_run_` id → `journal_ok` → receipt with 64-hex
`journal.head_hash`; status agreement; verify `ok=true, torn=false`;
events stream contains `run.opened`; an undeclared tool step closes the
run with `outcome:"failed"` yet still leaves a receipt and a verifying
journal (fail-closed evidence law); workflow closure; attach mode; daemon
shutdown. When no `vae` runtime resolves, integration tests **skip —
never fake**.

## Honest gaps

- **No standalone daemon verify route in this engine version** — the SDK
  verifies through the CLI of record (`vae verify --json` /
  `vae journal verify RUN --json`), not the wire. A ratified
  `/journal/{run_id}/verify` route is the standard's first additive
  candidate (§17); when it ships, `Verify` can move onto the wire without
  changing its signature or semantics.
- **No raw journal-record / refusal-log routes on the daemon** — wire
  clients read run truth via `GetRun` folds (`decisions`, `journal_ok`,
  `receipt`); refusals surface as journaled evidence, and the CLI of
  record (`vae explain`, `vae center`) remains the sanctioned reader of
  refusal-log bytes.
- **The in-process binding is TypeScript-runtime-only** — Go never links
  the engine library; parity is the daemon's contract, proven by tests.
- **Iterator error surface:** a Go range-over-func cannot return an error;
  `Events` therefore terminates silently on stream-open failure. The
  explicit `EventStream`/`OpenEvents` form carries the error (this is a
  language-shape constraint, not an engine gap).
- **Envelope validation is shape-only** (`v`/`seq` arrive as sent);
  unknown event types pass through untouched — read-time forward-compat is
  the law, and the SDK does not widen it.
