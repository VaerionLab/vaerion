# Guide — Building Agents

From a declared plan to a receipted, resumable agent run. Working
assets: [`../../examples/verifiable-agent/`](../../examples/verifiable-agent/)
· the test-proven [`../../examples/vaerion/demo-workspace/`](../../examples/vaerion/demo-workspace/).

## The supervised agent loop

`vae run agent --goal TEXT` runs the loop: plan → step → broker →
execute → journal → repeat, bounded by `agents.maxSteps`, retried
within bounds, resumable after crashes and human gates. Two planners:

- **`inline`** — you declare the plan; the loop executes it faithfully:
  `--planner inline --plan-json '<JSON array>'`
- **`model`** — the declared planner model proposes steps through the
  gateway single gate (default: `mockbrain/mock-1`, the seeded hermetic
  provider — deterministic, offline, no keys)

## Step kinds

```json
[
  { "kind": "note", "text": "reasoning scratchpad — journaled as-is" },
  { "kind": "tool", "tool": "echo", "args": { "value": "hello" } },
  { "kind": "model", "model": "mockbrain/mock-1",
    "messages": [{ "role": "user", "content": "Reply with exactly: demo ok" }] }
]
```

Every step crosses its constitutional path: model steps → the gateway
single gate (broker decision → adapter → metered on the spine); tool
steps → the broker tool pipeline; notes → the reasoning scratchpad.
One Context Path; bounded retries; every decision journaled.

## Declaring capabilities (the ceiling)

In `vaerion.yaml`:

```yaml
gateway:
  providers:
    mockbrain: { enabled: true, models: ["mock-1"] }
  budgets:
    tokensPerRun: 100000        # the run-level ceiling
agents:
  maxSteps: 24
  plannerModel: mockbrain/mock-1
tools:
  - name: echo
    description: "Echoes its input back (the hermetic builtin)"
```

Declaring a tool or model grants **nothing** — it defines the ceiling.
Grants live in `policy.rules` (next section). Undeclared tool calls
refuse fail-closed (E1801); exceeding the step ceiling stops loudly
(E1804).

## Grants — the policy rules

```yaml
policy:
  rules:
    - id: allow-echo-tool
      principalKinds: [agent]
      domain: tool.call
      scope: echo
      effect: allow
      rationale: "the demo's only tool call is the declared echo builtin"
```

First match wins; unmatched ⇒ deny; refusals are journaled and
hash-chained. Full syntax, deny/prompt effects, and human gates:
[`permissions.md`](permissions.md).

## Workflows — deterministic multi-step pipelines

For DAG-shaped work (no planner):

```sh
vae run workflow --dag workflow.json
```

Nodes run in topological order (lexicographic tie-break), outputs are
content-addressed, interrupted runs resume automatically. The committed
[`demo-workspace/workflow.json`](../../examples/vaerion/demo-workspace/workflow.json)
chains tool → model → note and is executed by the test suite.

## Observing and proving runs

```sh
vae explain RUN_ID      # the narrative, from the journal
vae report              # fold over every journal
vae center              # the operator cockpit: runs, metering, integrity
vae journal verify RUN_ID
```

## Where to go next

- [`../../examples/refused-action/`](../../examples/refused-action/) —
  watch the broker refuse, and why that is the point
- [`../reference/cli.md`](../reference/cli.md) — the full surface
- [`../concepts/runtime.md`](../concepts/runtime.md) — why runs resume
