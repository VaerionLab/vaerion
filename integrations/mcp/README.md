# Vaerion MCP — the host guide (`vae mcp`)

> **Provenance:** every fact below was measured against the engine in this repository
> (`packages/vaerion/src/mcp/server.ts`, `packages/vaerion/src/cli/vae.ts`) and against a
> live spawned server on **2026-10-01**, engine version **0.1.15**. The demo at the end
> of this file was executed and its output captured byte-for-byte in
> [`captured_output.txt`](./captured_output.txt). No claims are aspirational.

## (a) What `vae mcp` is

`vae mcp` is the **official Model Context Protocol stdio server that ships inside the
Vaerion engine**. Any MCP host — Claude Desktop, Cursor, Cline, or a hand-rolled client —
attaches to it and every tool call the host makes goes through the same brokered,
journaled, receipt-backed path a human typing `vae` uses.

Measured facts:

| Property | Value |
|---|---|
| Transport | stdio, **newline-delimited JSON-RPC 2.0** (one message per line) |
| Protocol version | **2024-11-05** (returned by `initialize`) |
| Server info | `{"name": "vaerion", "version": "0.1.15"}` |
| Tools | **6** (list below) |
| Executor | every tool call runs the **real CLI contract** in-process (`runCli … --json`) — same broker, same journal, same receipts, same exit codes. Nothing bypasses the constitutional path. |
| stdout law | stdout carries protocol messages and **nothing else**; diagnostics go to stderr |
| EOF law | stdin EOF ends the server with **exit 0** |
| Error discipline | bad JSON → `-32700`; unknown method → `-32601`; unknown tool / bad params → `-32602`; tool *execution* failures are results with `isError: true`, never protocol errors |
| Notifications | silent (no response), including `notifications/initialized` |
| Workspace scope | one process serves ONE workspace (the `cwd` of the spawned process, like every other command) |

The six ratified tools (verbatim from `tools/list`):

| Tool | What it does | Arguments |
|---|---|---|
| `vaerion_doctor` | Audit the workspace: config, journal chains, blobs, evidence, audit + refusal ledgers, gateway matrix (no network). Exit 5 = findings reported. | — |
| `vaerion_status` | The project dashboard: workspace state, runs, next steps (read-only). | — |
| `vaerion_journal_ls` | List every run journal: run_id, records, events, head_hash (read-only). | — |
| `vaerion_verify_journal` | Verify a run journal: full blake3 chain recomputation, torn-tail detection, issue list. | `run_id` (optional; omit = latest run) |
| `vaerion_run_demo` | Run the brokered demo research pipeline: per-source broker decisions → fingerprint → fence → blob CAS → index → citations → receipt. | `query` (optional) |
| `vaerion_run_agent` | Run the supervised agent loop on a goal: journaled steps, policy-checked tools and model calls, receipt on close. Default inline planner is a **declared** plan (deterministic, no model calls). | `goal` (required), `steps` (optional declared plan), `planner` (`inline` \| `model`) |

## (b) Copy-paste host configs

**Which command to use:**

- **Installed CLI** (`npm install -g vaerion` puts `vae` on PATH): use `vae mcp`.
  **Version note (honest):** the npm registry delivers
  `vaerion 0.1.15` under dist-tag `latest` (published 2026-10-21) —
  the npm-delivered engine now ships `vae mcp`; no repository path is
  required. (The rc-era engine lacked the command; the repository path
  below remains the dev-checkout route.)
- **This repository (dev checkout)**: the engine entry is TypeScript; run it with
  `bun run <path-to-repo>/packages/vaerion/src/cli/vae.ts mcp` (bun ≥ 1.3 is required —
  the engine runs on bun).
- The server inherits the **cwd of the host process** for its workspace, so point the
  host's working directory (or launch from the project you want verified) accordingly —
  one server process serves exactly one workspace.

### Claude Desktop — `claude_desktop_config.json` (installed CLI)

```json
{
  "mcpServers": {
    "vaerion": {
      "command": "vae",
      "args": ["mcp"]
    }
  }
}
```

### Claude Desktop — dev checkout of this repository

```json
{
  "mcpServers": {
    "vaerion": {
      "command": "bun",
      "args": ["run", "/home/you/vaerion/packages/vaerion/src/cli/vae.ts", "mcp"]
    }
  }
}
```

### Cursor / Cline / generic stdio MCP host (installed CLI)

```json
{
  "mcpServers": {
    "vaerion": {
      "command": "vae",
      "args": ["mcp"],
      "env": {},
      "disabled": false,
      "autoApprove": ["vaerion_status", "vaerion_journal_ls", "vaerion_verify_journal"]
    }
  }
}
```

### Cursor / Cline / generic stdio MCP host (dev checkout)

```json
{
  "mcpServers": {
    "vaerion": {
      "command": "bun",
      "args": ["run", "/home/you/vaerion/packages/vaerion/src/cli/vae.ts", "mcp"],
      "env": {},
      "disabled": false,
      "autoApprove": ["vaerion_status", "vaerion_journal_ls", "vaerion_verify_journal"]
    }
  }
}
```

> **AutoApprove is a trust decision, not a Vaerion decision.** Read-only tools
> (`vaerion_status`, `vaerion_journal_ls`, `vaerion_verify_journal`) are safe to
> auto-approve; the two `vaerion_run_*` tools create journaled runs. Vaerion brokers and
> journals every call either way — but auto-approving runs means the host never asks the
> human first. The broker still fails closed (see section d).

**Quick sanity check without any host** — the server speaks plain line-delimited JSON:

```sh
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"me","version":"0"}}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  | vae mcp
```

## (c) The REAL demo — executed, captured

[`demo_stdio.py`](./demo_stdio.py) is a dependency-free Python 3.10+ script that speaks
the wire protocol itself so you can see exactly what a host does:

1. resolve `vae` ($VAE_BIN → PATH → repo `bun run` fallback, the same law as the Python SDK),
2. create a fresh temp workspace (`vae init --template demo`),
3. spawn `vae mcp` in it,
4. `initialize` handshake → serverInfo + instructions,
5. `tools/list` → asserts the exact 6-tool surface,
6. `tools/call vaerion_status` (read-only, real output),
7. `tools/call vaerion_run_demo` (a real brokered run with a receipt),
8. `vae verify` on the resulting journal (CLI of record),
9. closes stdin and asserts the server exited 0.

```sh
python3 demo_stdio.py   # exit 0 = every stage verified
```

Captured output of an actual run (full text: [`captured_output.txt`](./captured_output.txt)):

```text
[1] vae command resolved: bun run <repo-root>/packages/vaerion/src/cli/vae.ts
[2] temp workspace: /tmp/vaerion-mcp-demo-k5axu6a4
[3] spawning `vae mcp` (stdio, JSON-RPC 2.0, protocol 2024-11-05)
[4] initialize ->
{
  "protocolVersion": "2024-11-05",
  "capabilities": { "tools": { "listChanged": false } },
  "serverInfo": { "name": "vaerion", "version": "0.1.15" },
  "instructions": "Vaerion — the verification layer for AI agents. Every tool call is broker-decided, journaled and receipted; verify anything with vaerion_verify_journal."
}
[5] tools/list -> 6 tools: vaerion_doctor, vaerion_status, vaerion_journal_ls, vaerion_verify_journal, vaerion_run_demo, vaerion_run_agent
[6] tools/call vaerion_status -> isError: False
{"command":"status","engine_version":"0.1.15","workspace":{"state":"workspace","name":"my-project", ... },"runs":{"total":0,"closed":0,"open":0}, ... }
[7] tools/call vaerion_run_demo -> isError: False
{
  "command": "run",
  "kind": "demo",
  "run_id": "crn_run_01M3TZRFV5C5VVNB6JTX5VBEJJ",
  "trace_id": "t_7ph2vqspax",
  "documents": 1,
  "hits": 1,
  ...
  "receipt": {
    "run_id": "crn_run_01M3TZRFV5C5VVNB6JTX5VBEJJ",
    "engine_version": "0.1.15",
    "counts": { "records": 13, "events": 10, "decisions_allow": 1, "decisions_deny": 0, ... },
    "blob_refs": [ { "alg": "blake3", "hash": "a1ca3c65…", "size": 291 } ],
    "journal": { "records": 13, "head_hash": "2aaefae9183d3acdaaa64f112bc445156bfe431ee001d7eb606ceb4c0066d8fc" },
    "summary": "indexed 1 documents; 1 hits for \"prove the MCP path end to end\""
  },
  "journal_verified": true
}
[8] vae verify (CLI of record — chain recomputed from disk bytes)
{"command":"verify","run_id":"crn_run_01M3TZRFV5C5VVNB6JTX5VBEJJ","verdict":"VERIFIED","ok":true,"records":14,"events":10,"head_hash":"7708b1fa3a93d2e08949521f00858c16b875383c8430a3cc79b596659784a96c","torn":false,"issues":[],"next":["vae explain crn_run_01M3TZRFV5C5VVNB6JTX5VBEJJ","vae status"]}
[9] server exited with code 0 after EOF (law: exit 0)
DEMO OK
```

> **Why does `vae verify` report `records: 14` while the receipt says `records: 13`?**
> This is engine law, not tampering: the receipt's `journal.head_hash` certifies the *fold*
> (the state at close), and the receipt **record itself is the terminal link** appended to
> the chain afterwards — so the on-disk chain is one record longer and its head advances.
> `vae verify` recomputes and validates the whole chain including that terminal record.

## (d) Policy + receipts: how MCP calls are brokered

**Nothing bypasses the constitutional path.** Each `tools/call` runs the real CLI command
with `--json` inside the server process, so the engine's decide → journal → act law holds
byte-for-byte:

1. **Every mutating action is broker-decided first.** The broker evaluates the workspace
   policy (first match wins; **no match = deny, exit code E1301** — fail closed). The
   decision record is journaled BEFORE anything acts.
2. **Every step is journaled.** Runs live in `.vaerion/journal/crn_run_*.ndjson` — a
   blake3-256 hash-chained NDJSON log with single-writer locking; evidence blobs are
   content-addressed under `.vaerion/blobs`.
3. **Every run closes with a receipt** (run id, counts, blob refs, journal head hash) —
   even failed runs. A denied step closes the run with `outcome: "failed"` and the receipt
   still present: refusals are *evidence*, not exceptions.
4. **The broker refuses nothing silently.** Every deny decision is also appended to the
   chained refusal ledger at **`.vaerion/refusals.log`** (same chain primitive as the
   journal), with a sibling `audit.log` for decision records.
5. **Verification trusts bytes, not processes**: `vae verify [RUN_ID]` (or the
   `vaerion_verify_journal` tool) recomputes the full blake3 chain from the bytes on disk
   and reports `{ok, torn, records, events, head_hash, issues}`.

### A REAL refusal through the broker (captured 2026-10-01)

A fresh `agent`-template workspace, an agent run with an `echo` tool step that no policy
rule grants (`vae run agent --goal … --planner inline --plan-json '[{"kind":"tool","tool":"echo","args":{"value":"hi"}}]'`):

- Run closes **with receipt**, `outcome: "failed"`, `counts.decisions_deny: 1`,
  `journal_verified: true` (exit code 0 — the failure is journaled evidence).
- `.vaerion/refusals.log` record (first line, verbatim):

```json
{"k":"refusal","i":1,"prev":"0000000000000000000000000000000000000000000000000000000000000000","at":"2026-10-01T05:42:44.216Z","run_id":"crn_run_01M3TZS37EJYEAZYE97Z4BZSNE","decision_id":"01M3TZS37Q9MMZMVJ3NR36NJZE","request_id":"01M3TZS37NJ1PQP870SNDXG3D1","principal":{"kind":"agent","id":"agent:7z4bzsne"},"domain":"tool.call","scope":"echo","reason_code":"E1301","reason":"no policy rule matched — broker fails closed","policy":"default-my-project:default-deny","hash":"a59dbbe85ad696d8d1c2076a907df408d6bba761bfdd9a770fa38d3a98697974"}
```

- `vae verify --json` on that workspace:

```json
{"command":"verify","run_id":"crn_run_01M3TZRTQZJ1NCZNESC4VEWB43","verdict":"VERIFIED","ok":true,"records":7,"events":5,"head_hash":"4fb7e0088d960a2aaa3dc892d13f82b7871e57d7ecebe79678cdc6a6db51c598","torn":false,"issues":[],"next":["vae explain crn_run_01M3TZRTQZJ1NCZNESC4VEWB43","vae status"]}
```

### The host's verification loop

After any MCP session (or before you trust a session's output):

```sh
vae verify                 # verify the latest run: ok:true / ok:false, exit 0/5
vae journal ls             # every run journal: run_id, records, events, head_hash
vae doctor                 # config, chains, blobs, evidence, audit + refusal ledgers
```

The same three are available to the agent itself as `vaerion_verify_journal`,
`vaerion_journal_ls`, and `vaerion_doctor` — so a framework agent can verify its own work,
but the hash chain means it cannot forge it.

## Engine notes (documented, not patched)

- `vaerion_run_agent` maps `planner: "model"` through to `vae run agent --planner model`;
  a model-planned run needs a configured provider in the workspace. The **default is the
  deterministic inline planner** (a declared plan), which is what makes MCP-driven runs
  reproducible and testable without network access.
- On a **fresh, un-initialized directory** `vaerion_status` answers with
  `workspace.state: "fresh"` and `vaerion_run_demo` returns an `isError: true` result with
  `E1600 "no local sources to demo"` plus the fix (`vae init --template demo`). Correct
  fail-closed behavior; hosts should init a workspace rather than expect a server error.
