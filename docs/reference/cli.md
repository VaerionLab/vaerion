# Reference — the `vae` Command Surface

> **Version of record: `v0.1.15`** (29 registry commands). The grammar of
> record is always `vae --help` (help always teaches, never executes); this
> page is the compact complete reference — every command, its purpose, a real
> example, the expected output shape, and its error/exit behavior. The full
> generated manual with deep dives: [`../CLI.md`](../CLI.md). The error
> catalog of record: [`errors.md`](errors.md).

## Global flags

| Flag | Meaning |
|---|---|
| `--json` | stable NDJSON machine output (guaranteed shape) |
| `--plain` | human-readable output (default) |
| `--dry-run` | plan only, nothing written (threaded into every mutating command) |
| `--cwd DIR` | operate on DIR as the workspace |
| `--help` / `--version` | teach / identify — never execute |
| `--quiet` | suppress decorative framing only — data and errors are never suppressed |

Bare `vae` opens the welcome front door: it measures this directory and
points at the next step — read-only, exit 0.

## Exit codes (law: `src/cli/io.ts`)

| Code | Meaning |
|---|---|
| `0` | ok |
| `1` | internal error (an engine bug or an unmapped failure) |
| `2` | usage error (bad invocation, unknown command, unknown template) |
| `3` | broker-denied (a policy deny, a refused gate answer) |
| `4` | provider-down (gateway transport failures) |
| `5` | partial — completed with findings; the output carries repair hints |

Stable E-code mapping (deterministic, in `runCli`): exit 2 ← `E1600`, `E1203`,
`E1700`, `E1701`, `E2204`, `E2300`; exit 3 ← `E1300`, `E1301`, `E1302`; exit 4 ←
`E1601`, `E1702`, `E1704`, `E1705`, `E1706`; exit 5 ← `E1703`, `E1501`, `E2200`–`E2203`,
`E2205`, `E2206`, all `E23xx`; everything else → exit 1. (`vae verify` and the
run commands map journal outcomes themselves: a failed verification — e.g.
`E1001` tamper or `E1010` completeness — exits 5 by the same partial code.)

Unknown commands are a taught usage error — with suggestions:

```
$ vae frobnicate
E1600 unknown command: frobnicate (run `vae --help` for the command surface of record)
Fix: Re-run with `--help`; help always teaches and never executes.   # exit 2

$ vae statu
E1600 unknown command: statu — did you mean `status`?                # exit 2
```

## Workspace & lifecycle

### `vae init`
Scaffolds `vaerion.yaml` (strict schema `0.1`) + `.vaerion/` stores from the
deterministic template registry — **7 templates**: `minimal` (default; bare
`vae init` is exactly this), `demo`, `agent`, `tool`, `automation`,
`multi-agent`, `enterprise`. Byte-stable; refuses to overwrite; unknown
template → `E1203` (exit 2).
```
vae init [--template T] [--name NAME] [--dry-run]
vae init --template demo
# → created: vaerion.yaml, .vaerion/journal, .vaerion/blobs, sources/demo.md
#   config_fingerprint: 41c3410b… (measured, stable) · engine_version: 0.1.15
```

### `vae create`
Scaffolds a NEW project directory (must not exist — `E1600`) and prints the
exact next commands. On a terminal, missing NAME/template are asked with
numbered prompts; `--json` never prompts.
```
vae create NAME [--template T] [--interactive] [--no-interactive] [--dry-run]
vae create my-first-agent && cd my-first-agent && vae run demo && vae verify
```

### `vae start`
The five-minute first agent — ONE guided command: workspace (init demo,
continued if present) → first run (`run demo`) → verify → summary
(`run_id`, `head_hash`, `journal_verified`, next steps). Interactive prompts
on a terminal; `--json` emits one NDJSON line per stage.
```
vae start [--template T] [--name NAME] [--interactive] [--no-interactive] [--dry-run]
```

### `vae status`
The project dashboard: workspace, identity, AI, runs, next steps (read-only).
```
vae status [--json]
# → {"command":"status","engine_version":"0.1.15","workspace":{…},
#    "runs":{"total":1,"closed":1,"open":0},"hints":[…]}   (measured)
```

### `vae report`
A pure fold over every journal — runs, decisions, metering, evidence
(read-only).

### `vae clean`
Reclaim orphaned blobs — plan-only by default; evidence-linked blobs never.
```
vae clean [--yes] [--dry-run]
```

## Runs

### `vae run`
The journaled pipelines. `research`/`demo`: declared capability → broker
decision per source → fingerprint → fence → blob CAS → evidence → index →
query → citations → context pack → snapshot → receipt. `model`: the gateway
single gate (broker decision → secret NAMES resolved at call time, never
journaled → sanctioned transport → micro-USD metering). `agent`: the
supervised loop (every step journaled; undeclared tools refused `E1801`;
ceiling `E1804`). `workflow`: fail-closed DAG (`E1803`), content-addressed
outputs, `--resume` crash-safe.
```
vae run research --sources P[,P] --query Q [--max-docs N]
vae run demo [--sources P,P] [--query Q]
vae run model --model P/M [--prompt TEXT | --op embed|rerank …] [--seed N]
vae run agent --goal TEXT [--planner inline|model] [--steps N] [--plan-json JSON]
vae run workflow --dag FILE [--resume RUN_ID]
# run demo (measured tail): summary: indexed 1 documents; …
#   journal_verified: true   — pre-run broker denial → exit 3; verify failure → exit 5
#   (a denial DURING a run closes the run with a failed receipt — exit 0 — the
#    journal is the evidence of what happened; that is the point)
```

### `vae resume`
Restore a run from its journal; resolve a pending human gate. Resume without
`--answer` renders the review; `--answer JSON` resolves it (approval records
a journaled elevation; denial ends the run, exit 3).
```
vae resume RUN_ID [--answer JSON]
```

### `vae explain`
The run's narrative — decisions, gates, events, receipt — reconstructed from
the hash-chained journal, plus the gateway metering rollup. Exit 5 if the
journal fails verification.
```
vae explain RUN_ID
```

### `vae verify`
One-command verification. Without RUN_ID: the latest journal (ULIDs sort
monotonically). FULL blake3 chain recomputation from bytes on disk: shape,
index continuity, hash linkage, gapless sequences. Exit 0 VERIFIED / 5 FAILED.
```
vae verify [RUN_ID] [--json]
# (measured) issues: [] · next: vae explain <run_id> · exit 0
```

### `vae journal`
Append-only journal operations. `recover` truncates only a torn crash tail
and re-seals with an auditable note; `export` produces a redacted,
independently verifiable derivation.
```
vae journal ls | show RUN_ID | verify RUN_ID | recover RUN_ID [--dry-run]
vae journal export RUN_ID [--out P] [--dry-run]
# (measured) journal verify <RUN_ID> → ok · torn: false · issues: [] · exit 0
```

## Integrity & operations

### `vae doctor`
Verifies config, every journal chain, every referenced blob, evidence
triangulation, audit + refusal-log chains, and the gateway picture (secret
NAMES only; no network — zero telemetry is constitutional). Exit 5 with
`Fix:` hints on failures. **Next-step law:** on a finding it names the EXACT
recovery command as top-level `next_step`; a green audit carries none.
```
vae doctor
# (measured) summary: all checks green · exit 0
```

### `vae dev`
Engine status: version, substrate (ADR-0018), layer map, milestone position
(read-only).

### `vae serve`
The local API daemon (MS-5, ADR-0010/ADR-0020): loopback HTTP/SSE over the
same contracts the CLI exercises; generated OpenAPI at `/openapi.json`.
Pairing token printed ONCE (`VAE_TRUST` pre-provisions headlessly);
`POST /shutdown` echoes the token in the body; non-loopback binds refused
(`E2001` — remote exposure requires a ratified ADR, never a flag).
Default listener `127.0.0.1:7897`.
```
vae serve [--port N] [--host ADDR]
# (measured) GET /runs unauthenticated → 401 · bind observed: 127.0.0.1 only
```

### `vae mcp`
The MCP stdio server: newline-delimited JSON-RPC 2.0, protocol `2024-11-05`,
six tools (`vaerion_doctor`, `vaerion_status`, `vaerion_journal_ls`,
`vaerion_verify_journal`, `vaerion_run_demo`, `vaerion_run_agent`). Every
tool call executes the REAL CLI contract in-process — same broker, journal,
receipts, exit codes. stdout carries protocol messages only; EOF exits 0.
```
vae mcp
# (measured initialize) {"protocolVersion":"2024-11-05",
#   "serverInfo":{"name":"vaerion","version":"0.1.15"},…}
```

## Packages & recovery

### `vae package`
`build` (ADR-0016): a deterministic fold over declared inputs + pin-verified
extension artifacts → `.vxn` bundle; identical inputs → byte-identical bytes
(measured: two builds → identical sha256); regenerates `vaerion.lock`.
`verify`: the pure check — recomputes digests, compares pins against
`vaerion.yaml` AND `vaerion.lock` (digest-swap defense), never executes
content. Exit 0 verified / 5 refused (`E2206`).
```
vae package build [--out PATH] [--dry-run]
vae package verify BUNDLE [--dry-run]
```

### `vae snapshot`
Deterministic archive of the evidence state, pinned by its blake3 digest.
```
vae snapshot [--out FILE] [--dry-run]
```

### `vae restore`
Verify-then-restore an archive; conflicts refuse with the list until
`--force`.
```
vae restore FILE [--force] [--dry-run]
```

### `vae provenance`
Permanent provenance for anything Vaerion created — every recomputable
digest recomputed, honest per kind (`.vxn` full pure check; `vaerion.lock`
seal cross-check `E2205`; redacted export derivation; release MANIFEST as
recorded). Exit 0 when evidence holds / 5 with findings.
```
vae provenance ARTIFACT
```

## Repository & CI

### `vae repo`
Repository intelligence, measured never assumed (read-only; every git
invocation `--no-optional-locks`): branch, staged/unstaged/untracked,
conflicts, worktrees, submodules, tags at HEAD, commit-identity audit of the
last 50 commits, canonical remote state. `verify` reports trust findings
only. Exit 0 when no blocker-severity finding / 5 otherwise.
```
vae repo [verify]
```

### `vae ci`
CI understanding: the workflows are the remote projection of the single
verification authority (`tools/verify.ts`). `validate` parses every workflow
with stable finding codes (`E2304`–`E2307`); `simulate` deterministically
projects which workflows trigger for an event/ref — a projection is never
claimed as an execution.
```
vae ci validate
vae ci simulate --event push|pull_request|workflow_dispatch|tag [--ref NAME]
```

### `vae release`
The constitutional release evaluator: gates (`--live-gates` re-runs them
live), tree-clean, identity (head + history), tag binding, version
lockstep, CI validity, canonical sync, artifacts, worklog ledger, reports.
Fail-closed: unmeasurable means blocked. Exit 0 READY / 5 BLOCKED.
```
vae release readiness [--live-gates]
```

## Assistance

### `vae tour`
A guided, read-only nine-step walk (what Vaerion is → this directory → the
config law → the journal → doctor → the gateway → your first run → the trust
surface → where to go next), measured against this machine; teaches by
pointing, never executes.

### `vae account`
Identity and attribution (read-only): actor law, journal-observed actors,
commit identity, declared secret PROFILES (names only). Optional local-first
subcommands: `account create --name NAME [--email=E]`, `status`, `login`,
`logout`, `export`.

### `vae ai`
`ask`: the grounded question — declared capability or explicit `--sources`
(never ambient, never network) → broker decisions → the one research pipeline
→ the gateway single gate → metering → receipt. Default model
`mockbrain/mock-1` (local, seeded, byte-identical). `models`: the gateway
capability matrix. `setup`: declare a provider ceiling. `status`: providers +
credential PRESENCE (never values). `use`: set the default model. `remove`:
drop a declared provider (if it owned the default model, the default is
cleared — the local seeded provider resolves again).
```
vae ai ask --question TEXT [--sources P,P | --capability NAME] [--model P/M] [--seed N]
vae ai models | setup --provider=P --model=M | status
vae ai use --model=M | remove --provider=P
```

> Flag-form law (measured): this engine's parser accepts space-form values
> only for a fixed flag allow-list (`cwd`, `sources`, `query`, `name`,
> `model`, `question`, `goal`, `template`, …); `--provider`, `--file`, and
> `--email` are NOT on it — with a space they parse as valueless booleans
> (`--file F` → `E1600` where the flag is required; `--email E` is silently
> dropped), so the taught forms are `--provider=P`, `--file=F`, `--email=E`.

### `vae center`
The operator cockpit (read-only): operations (runs, metering rollup, blobs),
integrity (audit + refusal chains), release-readiness digest for checkouts.
Exit 0 when everything verifies / 5 with the failing section.

### `vae completions`
Shell completions for `bash|zsh|fish|powershell|nushell|xonsh`, pinned to the
command registry by test.
```
vae completions <shell>       # install: source <(vae completions bash)
```

### `vae help`
The help frames for a COMMAND (unknown topics fall back to the main help).

### `vae version`
Print the engine version and exit.
```
vae version      # → vae 0.1.15   (measured)
```

---
*Registry of record: `COMMAND_HELP` in `packages/vaerion/src/cli/vae.ts`;
pinned by `tests/integration/dx-surface.test.ts` and the version-register
test. Outputs marked "(measured)" were captured on this tree at
`0.1.15` (2026-10-17; the 0.1.14-rc1 capture epoch is superseded).*
