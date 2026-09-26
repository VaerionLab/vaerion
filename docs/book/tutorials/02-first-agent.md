# Tutorial 2 — Your first agent

The Vaerion agent loop is **supervised**: every step (model, tool, note,
context) crosses its constitutional path — the gateway single gate for
models, the broker tool pipeline for tools, the reasoning scratchpad for
state, the One Context Path for research. Every step is journaled with
round/index coordinates, retried in a bounded way, and resumable after
crashes and human gates.

This tutorial is fully hermetic: no network, no API keys — the `mockbrain`
provider is a seeded local virtual provider, and the `echo` tool is a
deterministic builtin.

## 1. Declare what the agent may do

Create a workspace and write this `vaerion.yaml`:

```yaml
schemaVersion: "0.1"
project:
  name: first-agent
gateway:
  providers:
    mockbrain: { enabled: true, models: ["mock-1"] }
tools:
  - name: echo
agents:
  maxSteps: 12
  plannerModel: "mockbrain/mock-1"
policy:
  rules:
    - id: agent-echo-allow
      principalKinds: [agent]
      domain: tool.call
      scope: echo
      effect: allow
      rationale: "the demo agent may call echo"
    - id: agent-model-allow
      principalKinds: [agent]
      domain: model.invoke
      scope: "mockbrain/mock-1"
      effect: allow
      rationale: "the demo agent may plan and answer with mockbrain"
    - id: agent-echo-prompt
      principalKinds: [agent]
      domain: tool.call
      scope: echo
      effect: prompt
      gateLabel: "Approve the echo call?"
      rationale: "show the human gate"
telemetry:
  enabled: false
```

The law that matters: **policy rules are first-match-wins and unmatched
requests deny fail-closed.** Every rule must state its rationale. Above, the
`prompt` rule is listed second, so the first two `allow` rules match first —
remove them to see the gate fire.

## 2. Run an agent with a declared plan

Inline planning is the hermetic determinism device: the plan is a declared
JSON step array instead of model output.

```bash
vae run agent --goal "echo a value" --planner inline --plan-json '[
  { "kind": "note", "text": "starting the demo" },
  { "kind": "tool", "tool": "echo", "args": { "value": "hello vaerion" } }
]'
```

Step kinds: `model` (messages through the gateway), `tool` (a declared tool),
`note` (a journaled marker), `context` (research through the One Context
Path). The run closes with a receipt; `vae explain RUN_ID` shows every step's
decision trail.

## 3. Meet the human gate

Swap the rule order so the `prompt` rule matches `tool.call scope=echo`
first, then rerun:

```bash
vae run agent --goal "echo a value" --planner inline --plan-json '[
  { "kind": "tool", "tool": "echo", "args": { "value": "needs authority" } }
]'
```

The run **pauses** — status `awaiting_gate`, exit 0, the journal left open
(the gate must survive process death). Render the review, then answer:

```bash
vae resume RUN_ID                          # renders question + linked decision
vae resume RUN_ID --answer '{"approved":true}'
```

Approval records a **journaled elevation** and the loop continues from its
journaled steps — the approved gate is durable authority for the same
principal, so a restart-safe resume still works. A denial ends the run
(exit 3).

## 4. Model planning (still offline)

```bash
vae run agent --goal "plan with the local brain" --planner model
```

The ModelPlanner plans through the gateway single gate with
`agents.plannerModel` (default `mockbrain/mock-1`). Malformed plans are
refused (E1800); the planner's own model calls are metered on the spine like
any other invocation.

## 5. Watch it over the wire (optional)

```bash
vae serve &                       # loopback-only; prints a pairing token once
```

Then start the same run through `POST /runs` on the local daemon (see
`spec/openapi.json`). Wire parity is test-proven: the same run journals an
identical event-type sequence in-process and over HTTP/SSE.

## Pitfalls

- **E1801 "undeclared tool"**: tools must be declared in `vaerion.yaml` AND
  admitted by policy — declaring alone is not authority.
- **E1804 step ceiling**: `agents.maxSteps` stops the run loudly; raise it or
  fix the plan. The ceiling is a guardrail, not a suggestion.
- **E1301 on the very first step**: no policy rule matched (fail-closed).
  Add a rule or fix the scope.
- **Forgot the run id?** `vae journal ls` lists runs; `vae explain` needs the
  exact `RUN_ID`.
