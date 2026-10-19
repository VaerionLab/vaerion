# Vaerion Quickstart — zero to a verified run

> **Provenance.** Every command below exists in the `vae` CLI of record
> (measured on `0.1.13-rc1`; re-verified on `0.1.14-rc1`, 2026-10-03) and was checked against the CLI source and help text before
> being documented — and the core path of this guide (init → run demo →
> verify → doctor) was re-executed end-to-end in a clean temp workspace on
> 2026-10-01 @ `7e6b751`. Output shapes shown are the real renderer shapes;
> your ids and hashes will differ, the shapes will not. Nothing here
> requires an account, a network call, or an API key — the default provider
> is local.

Vaerion is a local-first verification layer for AI-driven work: one event
spine, append-only blake3-chained journals, a fail-closed permission broker,
and a **receipt folded from the journal** at the end of every run. The whole
point is that you can *verify* what happened instead of trusting it.

This guide is the pure CLI journey. Budget: ~10 minutes.

## 0. Install (2 minutes)

Vaerion executes on the [Bun](https://bun.sh) runtime (1.3+):

```sh
curl -fsSL https://bun.sh/install | bash   # if you do not have Bun yet
npm install -g vaerion@rc                  # the published CLI package
vae --version
```

```text
vae 0.1.14-rc1
```

> **Version note (honest):** the npm registry delivers `0.1.14-rc1` on
> `rc`+`latest` (measured 2026-10-19) — LIVE BUT LAGS — until the `0.1.15`
> publish executes (Founder-gated); PyPI is live at `0.1.15`. The capture
> above is the truth for the npm path today: the older rc engine without
> `verify` / `create` / `start` / `mcp`. Every command below exists in the
> `0.1.15` engine of record; run the guide against a source checkout
> (`bun install && bun run packages/vaerion/src/cli/vae.ts --help`), use the
> signed release set, or `npm install -g vaerion` (which resolves to
> `0.1.14-rc1` until the publish lands).

Alternatives (release tarballs, from-source) and signature verification are
in [`INSTALL.md`](INSTALL.md). If `vae` is not found after install, check
your npm global `bin` directory is on `PATH`.

## 1. Say hello — the welcome front door (1 minute)

In any directory:

```sh
vae
```

Bare `vae` is the welcome front door: it **measures this directory
read-only** and points at the next step (exit 0, nothing created). In an
empty directory its `next:` list leads with `vae start` (the whole
first-agent journey in one command), then `vae init`, `vae tour`, and
`vae --help`.

Then take the guided walk:

```sh
vae tour
```

`vae tour` is a nine-step, read-only tour of the engine — what Vaerion is,
this directory, the config law, the journal, the gateway, your first run —
each step measured against *your* machine. It teaches by pointing at real
commands; it never executes them.

## 2. Create a workspace (1 minute)

```sh
mkdir vaerion-first-run && cd vaerion-first-run
vae init --template demo
```

```text
command: init
template: demo
dry_run: false
created:
  0: vaerion.yaml
  1: .vaerion/journal
  2: .vaerion/blobs
  3: sources/demo.md
config_fingerprint: 41c3410b862ac152f5d6176a5888686f9d649ab65ca0d55a7fcccdaa69d25ffc
engine_version: 0.1.14-rc1
```

(The shapes in this guide are the `--plain` profile — byte-stable, the
pipe/CI contract. In a real terminal the `rich` profile renders the same
data as panels instead.)

What you got:

- `vaerion.yaml` — the strict project config (schema `0.1`; unknown keys are
  rejected). The `demo` template declares a local source capability at
  `./sources` and scaffolds `sources/demo.md` so the first run has something
  to index.
- `.vaerion/` — the workspace stores: `journal/` (append-only run journals)
  and `blobs/` (content-addressed store).

Templates are `minimal` (the default — bare `vae init` is exactly
`--template minimal`), `demo`, `agent`, `tool`, `automation`,
`multi-agent`, and `enterprise` — seven in the registry of record.
`vae init` refuses to overwrite an existing `vaerion.yaml`, and
`--dry-run` prints the plan without writing.

Fast paths, if you want them: `vae create NAME` scaffolds a NEW project
directory (default template `demo`) and prints the exact next commands;
`vae start` runs the whole first-agent journey — init → run → verify →
summary — as ONE guided command in the current directory. On a real
terminal both prompt for missing choices (`--no-interactive` or `--json`
keeps them silent); this guide keeps every step explicit instead.

## 3. First run (2 minutes)

```sh
vae run demo
```

```text
command: run
kind: demo
run_id: crn_run_01M3V25W1B8W9PK17WAG0E4725
trace_id: t_7wag0e4726
documents: 1
query: event spine journal deterministic
hits: 1
hits_detail:
  0:
    doc_id: doc_1
    score: 0.5753641449035617
context:
  blocks: 2
  dropped: 0
  tokens_estimated: 152
  pack_fingerprint: 5af7ee52b803d29f8b1f3f961761a774aefcfe40fca343550ba18efb2ad0cc7d
receipt:
  run_id: crn_run_01M41NDCSBVBGZRN94SZ1SXY7S
  trace_id: t_94sz1sxy7t
  engine_version: 0.1.14-rc1
  config_fingerprint: 41c3410b862a…
  opened_at: 2026-10-03T19:56:16.046Z
  closed_at: 2026-10-03T19:56:16.061Z
  counts:
    records: 13
    events: 10
    decisions_allow: 1
    decisions_deny: 0
    decisions_prompt: 0
    gates_opened: 0
    gates_resolved: 0
    snapshots: 1
    recovery_notes: 0
  blob_refs:
    0:
      alg: blake3
      hash: a1ca3c65d06d…
      size: 291
  journal:
    records: 13
    head_hash: 8e0a856355a1004a48cf4260f4fc579f8392246f643924981660e9699c39f122
  summary: indexed 1 documents; 1 hits for "event spine journal deterministic"
journal_verified: true
```

What happened: the declared local sources were broker-decisioned (one
decision per source, journaled), fingerprinted, fenced, stored in the blob
CAS, indexed, and queried — every step journaled on the blake3 chain — and
the run closed with a **receipt folded from the journal**.

**Where the RUN_ID comes from:** the `run_id:` line in the run output above
(`crn_run_…`). Copy it — the journal commands take it as their argument. If
you lost it, `vae journal ls` lists every run in the workspace with its
`run_id`, record counts, and head hash.

> `vae run demo` needs no flags: with no `--sources` it derives paths from
> the declared capabilities in `vaerion.yaml`, and with no `--query` it uses
> a fixed default query. `--query "your words"` works too. Other run kinds:
> `research`, `model`, `agent`, `workflow` — see `vae help run`.

## 4. Verify the journal (2 minutes)

```sh
vae journal verify crn_run_01M3V25W1B8W9PK17WAG0E4725
```

```text
command: journal
sub: verify
run_id: crn_run_01M3V25W1B8W9PK17WAG0E4725
report:
  ok: true
  path: /tmp/vaerion-quickstart-592f/vaerion-first-run/.vaerion/journal/crn_run_01M3V25W1B8W9PK17WAG0E4725.ndjson
  records: 14
  events: 10
  maxSeq: 10
  headHash: ab1593aa3d8e24175e7e5f6f1e17fad14298269d6fcb8db5113ee2de7dcde0ef
  torn: false
  issues:
    []
```

(`path` is the absolute journal path — it resolves from YOUR workspace
directory; this capture ran in a temp workspace.)

`verify` recomputes the entire blake3 hash chain — shape, 1-based index
continuity, hash linkage, gapless per-run sequence numbers — and reports
honestly: `ok` (no issues), `torn` (a crash-torn tail was detected), and
`issues` (stable E-codes like `E1001` chain-broken, `E1002` torn tail,
`E1005` seq gap). Exit code is `0` when the chain holds, `5` when it does
not. The verdict depends only on the bytes on disk — it does not trust the
process that produced them.

Companions:

```sh
vae verify                      # the one-command shorthand — latest run
vae journal ls                  # every run: run_id, records, events, head_hash
vae journal show <RUN_ID>       # the raw hash-chained records, one per line
vae explain <RUN_ID>            # the run as a human narrative + metering
```

`vae verify` (no RUN_ID) verifies the latest journal; `vae verify <RUN_ID>`
verifies the exact run — the same full chain recomputation as
`vae journal verify`.

## 5. Read the receipt (2 minutes)

A run is not finished until it has a receipt. The receipt is **computed from
the journal** (a fold, not an assertion), so it can never disagree with it,
and it is stored as the **terminal `receipt` record of the journal** — the
last line of `vae journal show <RUN_ID>`, the `receipt:` key of the run
output, and part of `vae explain`.

| Field | Meaning |
|---|---|
| `run_id` / `trace_id` | the run's two stable coordinates |
| `engine_version` / `config_fingerprint` | which engine, against which config bytes |
| `opened_at` / `closed_at` | run wall-clock window (RFC3339) |
| `counts.records` / `counts.events` | journal size (all kinds / spine events) |
| `counts.decisions_allow/deny/prompt` | broker verdicts, including refusals |
| `counts.gates_opened` / `gates_resolved` | durable human gates (a `prompt` decision pauses the run until `vae resume`) |
| `blob_refs` | every blob the run content-addressed (`{alg, hash, size}`) |
| `journal.records` / `journal.head_hash` | **the integrity commitment**: the chained head the receipt certifies |
| `summary` | one human line about what the run did |

To re-prove the commitment right now, re-run
`vae journal verify <RUN_ID>`. One measured detail: the verify report will
show **one more record** than the receipt's `journal.records` (13 → 14 in
this guide) and a `headHash` **one link beyond** the receipt's
`journal.head_hash` — the receipt itself is appended to the journal as the
terminal record AFTER the fold, so the chain the verifier recomputes
includes it. `ok: true` means every link, including that terminal receipt
record, was recomputed from the bytes on disk.

## 6. Health check (1 minute)

```sh
vae doctor
```

`doctor` audits the whole workspace with **zero network access** and no
secret values: config validity, every journal's hash chain, every referenced
blob in the CAS, evidence↔blob↔fingerprint triangulation, the audit-ledger
chain, the refusal-log chain, and the gateway capability matrix (secret
*NAMES* only). Failures exit `5` with a `Fix:` hint per finding — and a
top-level `next_step` naming the EXACT recovery command (a missing config
yields `vae init`; a torn tail yields `vae journal recover <run_id>`). A
fully green audit carries no `next_step`.

## 7. When something refuses

Vaerion is fail-closed by design. Unknown commands and bad flags exit `2`
with the usage; a broker denial exits `3`; a failed final verification exits
`5`. Every engine error prints a stable code, a message, and a `Fix:` line,
in plain text and in `--json` NDJSON alike:

```sh
vae frobnicate          # unknown command → E1600, exit 2
vae doctor --json       # the same data, one JSON object per line
```

Denials are evidence too: they are journaled in the run *and* appended to the
workspace's hash-chained refusal log (`.vaerion/refusals.log`). The
[`refused-action` example](../examples/refused-action/) shows it happening.

## Where next

- [`SDK.md`](SDK.md) — the programmatic surface (`VaeClient` /
  `VaeDaemonClient` in TypeScript), the same contracts the CLI uses
- [`reference/engine-api.md`](reference/engine-api.md) — the engine API
  reference (kernel, spine, journal, broker, gateway, runtime)
- [`../examples/README.md`](../examples/README.md) — the indexed examples
  library: a verifiable agent, a refused action, the replay machine
- [`book/`](book/) — the Vaerion book: tutorials (install → first agent →
  workflow), guides, and concept chapters
- [`reference/cli.md`](reference/cli.md) — the full command surface
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) — exit codes and E-codes
- [`getting-started/quickstart.md`](getting-started/quickstart.md) — the
  10-minute condensed version of this journey
