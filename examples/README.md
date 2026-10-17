# Examples — the indexed library

Every entry below is a real directory in this repository, and every
command quoted here or in the linked READMEs exists in the `vae` CLI of
record (census verified at `0.1.14-rc1`; surface unchanged through
`0.1.15-rc1` — verified against the CLI source before being
documented). Run ids and hashes will differ on your machine; the shapes
and the `ok: true` will not.

## The index

| Example | Purpose | Try it | What it proves |
|---|---|---|---|
| [`verifiable-agent/`](verifiable-agent/) | an agent action with cryptographic evidence | scratch dir → `vae init --template agent` → `vae run agent --planner inline --plan-json '…'` → `vae journal verify RUN` | execution → journaled broker decisions → receipt → an independently verifiable chain (`ok: true`) |
| [`refused-action/`](refused-action/) | unauthorized actions are stopped and recorded | scratch dir → `vae init --template agent` → flip one policy word → `vae run agent …` → `vae journal verify RUN` | fail-closed broker (`E1300`/`E1301`), a hash-chained refusal log, and a **failed run that still verifies** |
| [`replay-machine/`](replay-machine/) | determinism you can hold | scratch dir → `vae init` + a `package:` block → `vae package build` twice → `sha256sum` → flip one byte → `vae package verify` | identical inputs → byte-identical `.vxn` bundles; the pure check refuses tampering with exit 5 |
| [`vaerion-demo/`](vaerion-demo/) | the 15-minute demo workspace (the canonical external-tester workspace; pairs with [`docs/QUICKSTART.md`](../docs/QUICKSTART.md)) | `vae run demo --query "determinism"` → `vae journal verify RUN` → `vae package build` + `vae package verify .vaerion/package/vaerion-demo.vxn` | the research pipeline end-to-end: declared sources, fenced evidence, receipt, reproducible bundle |
| [`vaerion/demo-workspace/`](vaerion/demo-workspace/) | committed DAG + agent-plan assets | copy the dir → `vae run workflow --dag workflow.json` and `vae run agent --planner inline --goal "run the echo plan" --plan-json "$(cat plans/echo-plan.json)"` | deterministic topological workflow execution and an inline-planned agent run, both journaled and receipted |
| [`websocket/`](websocket/) | standalone WebSocket sample (site stack) | see its sources (`server.ts`, `frontend.tsx`) | nothing about the engine — an independent transport demo that does **not** exercise `packages/vaerion/` |

The first five are walkthroughs: their READMEs teach with real CLI
commands against a scratch workspace, never claiming files exist that do
not. The committed assets live in `vaerion-demo/` and
`vaerion/demo-workspace/`.

## How to read the walkthroughs

Each walkthrough README carries the same eight sections —
**Purpose · Architecture · Code · Verification · Receipts · Expected
output · Common mistakes · Next steps** — so you can skim the one you
need. Expected-output blocks show the real renderer shapes (plain mode:
`key: value`; `--json`: one NDJSON object per line) with your-ids-will-
differ placeholders.

## Conventions

- **Scratch first.** Walkthroughs run in a throwaway directory
  (`cd "$(mktemp -d)"`) so nothing in your projects is touched. The
  committed workspaces are used by copying, never by initializing over
  (`vae init` refuses to overwrite an existing `vaerion.yaml` — E1600).
- **The journal is the truth.** Receipts are the terminal `receipt`
  record of a run's journal — there is no `.vaerion/receipts/` directory.
- **Contracts of record live in `spec/`**, and the CLI grammar of record
  is `vae --help` (or `vae help <command>`). New examples should be
  minimal, deterministic, and runnable from a fresh clone or a release
  tarball — the Empty Machine Test standard
  (`docs/ga/ASCENSION-XX-EMPTY-MACHINE-TEST.md`).
