# Tutorial 3 — Workflows

The workflow engine executes a DAG **deterministically**: nodes run in
topological order (Kahn's algorithm with lexicographic tie-break, so the
order is a function of the DAG alone), node outputs are content-addressed
into the blob CAS, and interrupted runs **resume** from their journal fold —
completed nodes are skipped, never re-executed.

## 1. Write a DAG

`dag.json`:

```json
{
  "id": "release-notes",
  "nodes": [
    { "id": "fetch", "deps": [], "step": { "kind": "note", "text": "collect merged PRs" } },
    { "id": "lint",  "deps": [], "step": { "kind": "tool", "tool": "echo", "args": { "value": "lint ok" } } },
    { "id": "draft", "deps": ["fetch", "lint"], "step": { "kind": "note", "text": "draft the notes" } },
    { "id": "publish", "deps": ["draft"], "step": { "kind": "note", "text": "publish" } }
  ]
}
```

A node's `step` is a normal plan step (`model` | `tool` | `note` | `context`).
Optional `maxAttempts` overrides the bounded-retry count for that node.

## 2. Declare the tools it needs

The same fail-closed law applies: every tool a node calls must be declared
and admitted by policy. Minimal `vaerion.yaml` for the DAG above:

```yaml
schemaVersion: "0.1"
project:
  name: first-workflow
tools:
  - name: echo
policy:
  rules:
    - id: agent-echo-allow
      principalKinds: [agent]
      domain: tool.call
      scope: echo
      effect: allow
      rationale: "workflow nodes may call echo"
telemetry:
  enabled: false
```

(Workflow nodes act as the `agent` principal `agent:workflow`.)

## 3. Run it

```bash
vae run workflow --dag dag.json
```

Validation is fail-closed (E1803): cycles, unknown deps, duplicate ids, and
malformed steps are refused before anything runs. Outputs are journaled with
their blake3 hashes.

## 4. Crash it on purpose

Start a long DAG and SIGKILL the process mid-run. Restart with:

```bash
vae run workflow --dag dag.json --resume RUN_ID
```

The engine verifies the hash chain **before** appending anything, folds the
journal to reconstruct which nodes completed, and continues exactly where the
crash left it. Byte-stable replay is test-proven: the same DAG on the same
inputs yields the same journaled step sequence.

## Pitfalls

- **E1803 unknown node shape**: the DAG is validated as a whole — a typo in
  one `deps` entry refuses the entire run (that is the point).
- **Resuming with a different DAG file**: the journal does not embed your
  file; `--resume RUN_ID` requires the original DAG to continue a workflow.
- **Human gates inside nodes**: a prompt-policy decision pauses the whole run
  (the journal stays open). Answer with `vae resume RUN_ID --answer ...` and
  the DAG continues from the paused node.
- **Node outputs are content-addressed**: mutating a completed node's step
  changes its hash — that is a different plan, and the engine treats it as
  one (the old outputs stay, the node re-runs under the new hash).
