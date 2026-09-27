# Demo 1 — The Verifiable Agent

**Proves**: an AI agent action with cryptographic proof — execution,
receipt, verification.

Every command below was executed end-to-end against the published
`vaerion@0.1.13-rc1` package. Your run ids and hashes will differ; the
shape and the `ok: true` will not.

## The idea

An agent plan is a JSON array of steps (`note`, `tool`, `model`). The
broker evaluates **every** step against the policy in `vaerion.yaml`
before it runs; the run journals every decision; the receipt is folded
from the journal; and the journal is a blake3 hash chain anyone can
verify — including you, right now.

## Run it

```sh
# 1. provision: copy the canonical demo workspace and create the stores
cp -r examples/vaerion/demo-workspace verifiable-agent && cd verifiable-agent
mkdir -p .vaerion/journal .vaerion/blobs
# (the copied workspace ships its own vaerion.yaml — `vae init` refuses
#  to overwrite one, so these two lines create the stores it would have)

# 2. the agent run — declared inline plan: one note step, one echo-tool step
vae run agent --goal "Prove a brokered agent action" \
  --planner inline \
  --plan-json '[
    { "kind": "note", "text": "the demo agent starts with a note step" },
    { "kind": "tool", "tool": "echo", "args": { "value": "hello from the committed example" } }
  ]'

# 3. verify the proof
vae journal ls                 # note the run_id (crn_run_…)
vae journal verify <RUN_ID>
vae explain <RUN_ID>
```

## Expected output (measured, trimmed)

```text
command: run
kind: agent
run_id: crn_run_01M3F2C38KPXJNDTQ5444GH4GT
outcome: goal
steps: 2
failures: 0
metrics:
  tools:
    requested: 1
    completed: 1
    denied: 0
receipt:
  counts:
    records: 13
    decisions_allow: 1
  journal:
    head_hash: 031238c5afa9db9a…
journal_verified: true
```

```text
$ vae journal verify crn_run_01M3F2C38KPXJNDTQ5444GH4GT
report:
  ok: true
  records: 14
  torn: false
  issues: []
```

`vae explain` reconstructs the run as a human narrative —
`outcome: goal`, `planner: inline`, the broker's allow decision, the
tool step, gateway metering (zero: the echo tool is local) — all from
the journal alone.

## What just happened

1. The plan crossed the broker. `tool.call echo` matched the
   `allow-echo-tool` policy rule → **allow** (journaled).
2. The tool executed; its output entered the content-addressed blob
   store (blake3-addressed).
3. The run closed with a receipt folded from the journal — the run is
   not finished until it has one.
4. `journal verify` recomputed the whole blake3 chain: `ok: true`,
   `torn: false`, `issues: []`. This proof does not depend on the
   process that produced it — it lives in your workspace.

## Where to go next

- Flip one word and watch Vaerion **refuse** instead:
  [`../refused-action/`](../refused-action/)
- The same determinism applied to artifacts:
  [`../replay-machine/`](../replay-machine/)
- Agent configuration (tools, ceilings, planner models):
  [`docs/guides/building-agents.md`](../../docs/guides/building-agents.md)
