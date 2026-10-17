# Example — the workflow + plan asset workspace

> Committed assets the other walkthroughs and the test battery reuse:
> one deterministic workflow DAG (`workflow.json`), one declared agent
> plan (`plans/echo-plan.json`), and the `vaerion.yaml` that grants both.
> Copy this directory; **do not run `vae init` over it** (the manifest is
> committed — `vae init` refuses, by law).

## Purpose

Prove the two L2 execution engines end-to-end with nothing but the CLI:
the **WorkflowEngine** (deterministic topological DAG execution on the
journal) and the supervised **agent loop** with an inline declared plan —
both journaled, both receipted, both verifiable.

## Architecture

| Piece | Where here |
|---|---|
| `vaerion.yaml` | declares the `echo` tool, `mockbrain/mock-1`, and exactly two allow rules (`tool.call echo`, `model.invoke mockbrain/mock-1`) — declaring grants nothing, these rules grant |
| `workflow.json` | DAG `demo-flow`: `hello` (tool) → `ask-model` (model) → `signoff` (note); validated fail-closed (`E1803`), executed in topological order with a lexicographic tie-break |
| `plans/echo-plan.json` | the inline agent plan: one note step, one `echo` tool step |
| Run stores | `.vaerion/journal/` + `.vaerion/blobs/` (created on first run in your copy) |
| Node outputs | content-addressed into the blob CAS and journaled (`outputs` are blob hashes) |

## Code

```sh
cd "$(mktemp -d)"
cp -r <your-checkout>/examples/vaerion/demo-workspace .
mkdir -p .vaerion/journal .vaerion/blobs   # the manifest is committed, so
                                           # `vae init` would refuse — create
                                           # the stores the manifest implies

# 1. the deterministic workflow
vae run workflow --dag workflow.json

# 2. the inline-planned agent run (same tool the workflow used)
vae run agent --goal "Run the committed echo plan" \
  --planner inline \
  --plan-json "$(cat plans/echo-plan.json)"

# 3. verify both
vae journal ls
vae journal verify <RUN_ID>          # once per run id
```

Resume law worth knowing: an interrupted workflow continues from its
journal fold with `vae run workflow --dag workflow.json --resume RUN_ID`
— completed nodes are skipped deterministically.

## Verification

- `vae journal verify <RUN_ID>` per run: `ok: true`, `torn: false`,
  `issues: []` (exit `0`).
- The workflow output names `completed_nodes` in execution order and
  `outputs` keyed by node id — each value a blob hash you can re-verify
  via `vae doctor` (every referenced blob is digest-checked).
- `vae explain <RUN_ID>` reconstructs either run as a narrative from its
  journal alone.

## Receipts

Both runs close with receipts folded from their journals. The workflow
receipt counts its node decisions (`decisions_allow` covers the tool and
model nodes) and the agent receipt its step decisions; both commit to
their chain via `journal.head_hash` — the value that must equal the
`headHash` of a fresh `vae journal verify`.

## Expected output

Plain mode, trimmed (ids and hashes are placeholders):

```text
$ vae run workflow --dag workflow.json
command: run
kind: workflow
run_id: crn_run_01JAN6FAK9M6X2WZ8KPD4RVH3Z
trace_id: t_1jan6fak9m
workflow: demo-flow
outcome: completed
completed_nodes:
  - hello
  - ask-model
  - signoff
failed_nodes: []
outputs:
  hello: 9a2f7c…
  ask-model: 44b1e0…
receipt:
  counts:
    records: 21
    decisions_allow: 2
  journal:
    head_hash: c41d88a9f0e2b553…
journal_verified: true
```

```text
$ vae run agent --goal "Run the committed echo plan" --planner inline \
    --plan-json "$(cat plans/echo-plan.json)"
command: run
kind: agent
run_id: crn_run_01JAN6GH2N7X3WZ9KPD5RVH4A
outcome: goal
planner: inline
steps: 2
failures: 0
receipt:
  counts:
    decisions_allow: 1
journal_verified: true
```

## Common mistakes

- **Running `--dag` against the wrong anchor** — `--dag` resolves against
  the workspace root (your `--cwd`), not the process cwd.
- **Editing `plans/echo-plan.json` to add an ungranted step** — a model
  or tool step outside the two allow rules is refused fail-closed
  (`E1301`); see [`../../refused-action/`](../../refused-action/).
- **Invalid DAG edits** — duplicate ids, missing deps, or cycles are
  refused before anything executes or journals (`E1803`).
- **Expecting `.vaerion/receipts/`** — receipts are the terminal journal
  records; `outputs` are blob hashes, not files in a results directory.
- **`vae init` here** — refused (`E1600`); copy the directory instead.

## Next steps

- Where the committed plan is taught step-by-step:
  [`../../verifiable-agent/`](../../verifiable-agent/)
- Workflow configuration in the book:
  [`../../../docs/book/tutorials/03-workflow.md`](../../../docs/book/tutorials/03-workflow.md)
- `WorkflowEngine` / `assertWorkflowDag` signatures:
  [`../../../docs/reference/engine-api.md`](../../../docs/reference/engine-api.md)
  (§ Workflow)
- The SDK's programmatic equivalent — `workflowRun({ dag })`:
  [`../../../docs/SDK.md`](../../../docs/SDK.md)
