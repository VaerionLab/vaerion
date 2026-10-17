# Vaerion Java SDK (`dev.vaerion:vaerion-sdk`)

> **Generated against engine `0.1.15-rc1` (version-register alignment,
> 2026-10-03; signatures verified at `815e929`); every signature verified
> against source** (`packages/vaerion/src/api/routes.ts`, the CLI `--json`
> renderers, and the Python reference SDK). Wire facts are quoted from these
> files; nothing here is aspirational. Conforms to `VAERION_SDK_STANDARD.md`
> (v0.1 DRAFT) — §18 conformance suite included, §19 documentation rules applied.

## What this SDK is (and is not)

Vaerion's **in-process binding is TypeScript-runtime-only** — the engine
library runs under Bun/Node and cannot be linked into a JVM. The Java SDK
therefore binds **exactly the way the standard's daemon mode prescribes**:
over the loopback HTTP/SSE wire of `vae serve` (ADR-0010), with the pairing
token. Same runs, same journals, same receipts — a projection of the engine,
never a second implementation (standard §0).

For verification, the CLI is the CLI of record in this engine version: there
is **no standalone daemon verify route** (standard §4b, §17 additive
candidate), so `verify()` shells out to `vae verify` / `vae journal verify
--json` and recomputes the blake3 chain from the journal bytes on disk.
Verification trusts bytes, not processes.

## Requirements

- Java 21 (the SDK is compiled with `--release 21`)
- Jackson (`com.fasterxml.jackson.core:jackson-databind`) — the only
  non-test dependency
- A `vae` CLI to spawn/verify against — resolved like the Python reference:
  `$VAE_BIN` (split on whitespace) → `vae` on `PATH` → in a dev checkout,
  `bun run <repoRoot>/packages/vaerion/src/cli/vae.ts`

## Quickstart — the five-line experience

```java
import dev.vaerion.sdk.VaeClient;
import dev.vaerion.sdk.VerifyReport;

try (VaeClient vae = new VaeClient()) {                 // spawns `vae serve` on a free loopback port
    Map<String, Object> result = vae.run("summarize the project");   // brokered + journaled
    System.out.println(result.get("run_id"));
    System.out.println(vae.verify((String) result.get("run_id")));   // chain recomputation
}                                                        // token-echo /shutdown + process reaping
```

The constructor spawns `vae serve --port <free> --host 127.0.0.1` with
`VAE_TRUST=<secure-random token>` in the child environment. **The token is
never printed, logged, or sent anywhere except the daemon base.** To bind to
a daemon you run yourself, use the attach mode (runs `verify()` in the
process working directory):

```java
try (VaeClient vae = VaeClient.attach("http://127.0.0.1:7897", "<pairing-token>")) { ... }
```

### Real output

Executed against a scratch workspace with this SDK (`java -cp
target/classes:<deps> dev.vaerion.sdk.examples.Basic /tmp/vaerion-java-demo`,
2026-10-01); ids and hashes differ per run — shapes are real:

```text
vaerion java sdk — basic example
workspace: /tmp/vaerion-java-demo
health: ok=true engine_version=0.1.15-rc1
run: run_id=crn_run_01M3V042DYP5DA6W6MJQGYB2QM status=closed journal_ok=true
receipt: head_hash=8a70e8662b60cc15863446d1df8d535f7dc050239d77f62e916bfcc895cce9f7 records=7
events replayed: 7 (first: run.opened, agent.run.started, reasoning.note.recorded)
verify: ok=true torn=false records=8 events=6 head_hash=a44d0ea816be060f84f27a7d4f1d5e3bc7adf01cf27a17b0b83b0a8857897c0f
daemon stopped
```

Note `verify` reports **8** records while `receipt.journal.records` is 7: the
receipt certifies the chain *up to its fold*, and the terminal receipt record
is then appended — the verified head is one link beyond `receipt.journal`.

Run the example yourself: `mvn -q compile exec:java -Dexec.args=/tmp/vaerion-demo`
(or `java -cp "target/classes:$(mvn -q dependency:build-classpath
-Dmdep.outputFile=/tmp/cp.txt && cat /tmp/cp.txt)" dev.vaerion.sdk.examples.Basic
/tmp/vaerion-demo`).

## The surface

### `VaeClient` — facade (`AutoCloseable`)

| Method | Meaning |
| --- | --- |
| `new VaeClient()` / `new VaeClient(Path cwd)` / `new VaeClient(Path cwd, Duration serveTimeout)` | spawn a daemon in that workspace (ad-hoc workspaces are fine), poll `/health` ≤ 20 s |
| `VaeClient.attach(base, token[, cwd])` | bind to a daemon you run yourself |
| `run(goal)` | inline planner default = one **declared** note step `{"kind":"note","text":"goal: <goal>"}` — deterministic, no model calls, no fake intelligence; returns the final status view (receipt present once closed). Overload: `run(goal, steps, planner, maxSteps, timeout)` |
| `workflow(dag[, timeout])` | one deterministic workflow DAG run |
| `status(runId)` | the folded status view without waiting |
| `events(runId)` | lazy `Iterator<Map<String,Object>>` over the run's SSE data payloads (cursor replay; ends at seal) |
| `verify([runId])` | CLI of record; null = latest journal. Throws `E1001` carrying the report when the chain fails |
| `client()` | the underlying `VaeDaemonClient` (health/version/openapi/gates) |
| `close()` | `POST /shutdown {"token": …}` (echo guard), then waitFor → destroy → destroyForcibly |

A failed step does **not** throw: the run closes with a receipt and the agent
fold carries `outcome="failed"` — evidence, not an exception (fail-closed
fidelity, standard §0.3).

### `VaeDaemonClient` — the wire client

Routes (1:1 with `packages/vaerion/src/api/routes.ts`): `GET /health`,
`GET /version`, `GET /openapi.json` (unauthenticated metadata trio),
`POST /runs` (`{kind:"agent"|"workflow", goal?, planner?, steps?, max_steps?,
dag?}` → `201 RunStarted`), `GET /runs/{run_id}` (folded status + terminal
receipt), `GET /runs/{run_id}/events` (SSE), `POST /runs/{run_id}/answer`
(`{gate_id, answer?}`), `POST /shutdown` (`{"token": …}` echo guard).

- **Auth:** `Authorization: Bearer <token>` on every route **except**
  `/health`, `/version`, `/openapi.json` — enforced in `headers(path, withBody)`
  and unit-tested against real loopback HTTP stubs.
- **Loopback law:** non-loopback bases are refused **in code, before any byte
  is sent** — `E2006`. Only `127.0.0.1`, `localhost`, `[::1]` are accepted
  (standard §11).
- **Wire keys stay snake_case verbatim** (`run_id`, `trace_id`, `journal_ok`,
  `head_hash`, `max_steps`, `gate_id`, `open_gates` …). Jackson reads/writes
  raw maps; typed records (`RunStarted`, `VerifyReport`) use `@JsonProperty`.
- `waitForRun(runId[, timeout])` polls until a receipt is present or the
  status leaves `open`; `E1602` on deadline.
- `events(runId)` returns an `Iterator`; `eventsStream(runId)` wraps it in a
  Java `Stream` (standard §13c).

### `Sse` — minimal parser

`Sse.parse(String)` / `Sse.iterate(Iterator<String>)`: `data:` lines only;
comments (`:`) and `event:`/`id:`/`retry:` fields ignored; multiline data
joined with `\n`; JSON decodes to Maps/Lists/scalars; non-JSON data passes
through untouched as text. Unknown event types are forwarded, never rejected
(forward-compat duty, standard §14).

### `VerifyReport`

`(runId, ok, torn, records, events, headHash, issues)` — normalized from the
two CLI faces into one honest type: `vae verify --json` is flat with
`head_hash`; `vae journal verify RUN --json` wraps a VerifyReport (camelCase
`headHash`) under `report`. Issues carry `{i, code, message}` with
`code ∈ {E1001, E1002, E1003, E1005, E1006, E1009}`.

## Errors — one taxonomy, stable E-codes

`VaerionError extends RuntimeException` carries `code`, `message`, `fix`,
`detail`; `getMessage()`/`toString()` render `"E1234 message (Fix: …)"`. The
daemon's non-2xx body `{"error":{code, message, fix, detail}}` maps onto it
verbatim; unparseable bodies → `E1900`; unreachable daemon → `E1601`. Codes
are strings, never enums (standard §10c).

| Code | Raised when | Fix |
| --- | --- | --- |
| `E2006` | non-loopback base — refused in code before any request | point the client at the daemon's loopback URL |
| `E1601` | daemon unreachable, spawn failed, vae not found | start it with `vae serve` / install the CLI |
| `E1602` | run did not close within the deadline | inspect `GET /runs/{id}` and its event stream |
| `E2000` | `shutdown()` without the pairing token | pass the token (echo guard) |
| `E1900` | unparseable daemon body / no machine output | re-run with `--json`; check daemon version |
| `E1001` | journal verification FAILED (report carried as detail) | `vae journal recover <run_id>` |
| `E2003` | unknown run (from the daemon, code intact) | check the run id |

## Build & test

```bash
export JAVA_HOME=/path/to/jdk21 && export PATH="$JAVA_HOME/bin:/path/to/maven/bin:$PATH"
mvn test          # 40 tests: 37 unit + 3 integration
mvn package       # target/vaerion-sdk-0.1.15-rc1.jar
```

The integration layer (`VaeClientIntegrationTest`) spawns a REAL daemon in a
JUnit `@TempDir` workspace and runs a REAL brokered goal through to a REAL
receipt and a REAL verification. It is gated with `Assumptions.assumeTrue` —
**when no vae runtime exists it is skipped, never faked** (standard §0 law).

## Honest gaps

- **No standalone daemon verify route** in engine `0.1.15-rc1` — verification
  is the CLI of record (`vae verify`, `vae journal verify RUN --json`), run in
  the client's workspace directory. A ratified `/journal/{run_id}/verify`
  route is standard §17's first additive candidate; nothing here pretends it
  exists.
- `POST /runs/{run_id}/continue`, `POST /runs/{run_id}/cancel`, `GET /events`,
  `GET /models*`, `GET /tools`, and the `/packages/*` routes exist on the wire
  but are not wrapped by the facade yet — drive them via a thin extension or
  call the engine CLI. No invented endpoints to paper over this.
- The token lives in process memory only; it is not persisted anywhere and
  never appears in output. If a daemon this SDK spawned dies without the
  graceful shutdown, the token dies with the process.
