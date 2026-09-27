# Reference — the `vae` Command Surface

The grammar of record is always `vae --help` (help always teaches,
never executes) and the full generated manual:
[`../CLI.md`](../CLI.md). Version of record: `v0.1.13-rc1`.

## Global flags

| Flag | Meaning |
|---|---|
| `--json` | stable NDJSON machine output (guaranteed shape) |
| `--plain` | human-readable output (default) |
| `--dry-run` | plan only, nothing written (threaded into every mutating command) |
| `--cwd DIR` | operate on DIR as the workspace |
| `--help` / `--version` | teach / identify — never execute |
| `--quiet` | suppress decorative framing only — data and errors are never suppressed |

## Commands

| Command | Purpose |
|---|---|
| `vae` (bare) | the welcome front door: measures this directory, points at the next step (read-only, exit 0) |
| `init [--template minimal\|demo\|agent] [--name NAME] [--dry-run]` | scaffold `vaerion.yaml` + `.vaerion/` stores from the deterministic template registry |
| `status` | project dashboard: workspace, identity, AI, runs, next steps (read-only) |
| `report` | pure fold over every journal — runs, decisions, metering, evidence |
| `run research --sources P[,P] --query Q [--max-docs N]` | local research through the full journaled pipeline |
| `run demo [--sources P,P] [--query Q]` | the same pipeline with demo defaults |
| `run model --model P/M --prompt TEXT [--seed N]` | model invoke through the gateway single gate; metered |
| `run agent --goal TEXT [--planner inline\|model] [--plan-json JSON] [--steps N]` | the supervised agent loop; every step brokered and journaled |
| `run workflow --dag FILE [--resume RUN_ID]` | deterministic DAG execution; content-addressed outputs; crash-safe resume |
| `resume RUN_ID [--answer JSON]` | restore a run; resolve a pending human gate |
| `explain RUN_ID` | reconstruct the run's narrative from its journal |
| `journal ls \| show RUN \| verify RUN \| recover RUN \| export RUN` | append-only journal operations |
| `doctor` | verify config, journals, blobs, audit chain, gateway matrix (no phone-home) |
| `dev` | engine status: version, layers, gateway matrix, milestone position |
| `serve [--port N] [--host ADDR]` | loopback-only HTTP/SSE daemon over the same contracts; pairing token printed once |
| `package build [--out PATH]` / `package verify BUNDLE` | reproducible `.vxn` build / pure verification (never executes content) |
| `snapshot [--out FILE]` / `restore FILE [--force]` | deterministic evidence-state archives pinned by blake3 |
| `provenance ARTIFACT` | permanent provenance recomputed from the bytes |
| `repo` / `repo verify` | repository intelligence, measured never assumed |
| `ci validate` / `ci simulate --event EV` | workflow validation / deterministic pipeline projection |
| `release readiness [--live-gates]` | the constitutional release evaluator (fail-closed) |
| `tour` | a guided, read-only nine-step walk of the engine |
| `account create --name NAME` (and `status/login/logout/export`) | local-first identity — never a cloud account |
| `ai setup --provider P --model M` / `ai ask --question Q` / `ai models` / `ai status` | the developer-owned AI layer through the single gate |
| `center` | the operator cockpit: runs, receipts, metering, integrity |
| `version` / `help [COMMAND]` / `completions <shell>` | identify / teach / shell completion (bash, zsh, fish, powershell, nushell, xonsh) |

## Exit codes

`0` ok · `1` internal · `2` usage · `3` broker-denied · `4`
provider-down · `5` partial-with-repair-hint. Diagnostics: `VAE_DEBUG=1`.

Full per-command reference with every flag:
[`../CLI.md`](../CLI.md) · error codes: [`errors.md`](errors.md).
