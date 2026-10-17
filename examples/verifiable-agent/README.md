# Example — The Verifiable Agent

> A walkthrough, not a fixture: every command below is a real `vae`
> command (`0.1.13-rc1`) run in a scratch workspace. It creates only
> throwaway files and teaches from the CLI of record. Run ids and hashes
> will differ on your machine; the shapes and the `ok: true` will not.

## Purpose

Prove that an agent action can carry its own evidence: the plan executes,
the broker decides (and journals every decision), the run closes with a
receipt folded from the journal, and **you** — not the process that
produced it — verify the blake3 chain with one command.

## Architecture

What is in play, and where it lives in the engine:

| Piece | Role |
|---|---|
| `RunHarness` (`runtime/run.ts`) | opens the run: journal, audit ledger, refusal log — three single-writer chains |
| Broker (`broker/`) | decide → journal → act; policy rules are first-match-wins, **no match ⇒ deny `E1301`** |
| Planner (`agents/planner.ts`) | `inline` executes the plan you declare (`--plan-json`); `model` plans through the gateway |
| Gateway (`gateway/service.ts`) | the one sanctioned egress; `mockbrain/*` is the seeded local provider — no network, no keys |
| Journal (`journal/`) | NDJSON blake3 chain at `.vaerion/journal/<run_id>.ndjson` |
| Receipt (`receipts/receipt.ts`) | the terminal journal record, folded from the chain it certifies |

## Code

```sh
cd "$(mktemp -d)"            # a scratch workspace, anywhere
vae init --template agent    # declared tools (echo), a mockbrain planner, one explicit allow rule
```

The agent template's `vaerion.yaml` declares the `echo` tool and carries
exactly one policy rule: agents may invoke `mockbrain/mock-1`. Declaring
a tool grants nothing — only that rule grants, and only for `model.invoke`.

Run a declared plan (one note step, one model step):

```sh
vae run agent --goal "Prove a brokered agent action" \
  --planner inline \
  --plan-json '[
    { "kind": "note", "text": "the demo agent starts with a note step" },
    { "kind": "model", "model": "mockbrain/mock-1",
      "messages": [ { "role": "user", "content": "Reply with exactly: journaled." } ] }
  ]'
```

`--planner inline` **requires** `--plan-json` (a usage error otherwise —
`E1600`). Want a tool step too? Add the allow rule it needs (the template
intentionally ships without it):

```yaml
# append under policy.rules in vaerion.yaml
    - id: allow-echo-tool
      principalKinds: [agent]
      domain: tool.call
      scope: echo
      effect: allow
      rationale: "the walkthrough allows the declared echo builtin"
```

```sh
vae run agent --goal "Run a tool step through the broker" \
  --planner inline \
  --plan-json '[
    { "kind": "note", "text": "now the declared-and-granted echo tool" },
    { "kind": "tool", "tool": "echo", "args": { "value": "hello from the committed example" } }
  ]'
```

The repo checkout equivalent: `examples/vaerion/demo-workspace/` ships
this plan committed — copy the directory and run
`vae run agent --planner inline --plan-json "$(cat plans/echo-plan.json)"`.

## Verification

The run printed a `run_id:` line (`crn_run_…`). Verify the chain it
certifies:

```sh
vae journal ls                  # your run is listed: run_id, records, events, head_hash
vae journal verify <RUN_ID>     # recompute the whole blake3 chain
```

Exit code `0` means the chain holds; `5` means it does not (with the
first issue named — `E1001` broken chain, `E1002` torn tail, `E1005` seq
gap). The verdict depends only on the bytes on disk. `vae explain
<RUN_ID>` replays the same journal as a human narrative.

## Receipts

The run is not finished until it has a receipt. It is the **terminal
`receipt` record of the journal** — visible as the `receipt:` block of
the run output, as the last line of `vae journal show <RUN_ID>`, and
inside `vae explain`. Read it as: *who* (`run_id`, `trace_id`), *what*
(`counts`: events, `decisions_allow`, …), *on which config bytes*
(`config_fingerprint`), committed to *which chain head*
(`journal.head_hash`). Compare `journal.head_hash` with the `headHash`
printed by `vae journal verify` — both are read from the same verified
chain, and they must match. There is no `.vaerion/receipts/` directory;
receipts live in the journal, by construction.

## Expected output

Plain mode renders `key: value` lines (trimmed here; ids and hashes are
placeholders):

```text
command: run
kind: agent
run_id: crn_run_01JAN5B2Q7M4X8WZ6KPD2RVH9T
trace_id: t_agent_1jan5b2q7m
outcome: goal
goal: Prove a brokered agent action
planner: inline
steps: 2
failures: 0
tokens_used: 12
micro_usd_used: 0
metrics:
  tools:
    requested: 1
    completed: 1
    denied: 0
receipt:
  counts:
    records: 15
    events: 12
    decisions_allow: 1
  journal:
    head_hash: 031238c5afa9db9a…
journal_verified: true
```

```text
$ vae journal verify crn_run_01JAN5B2Q7M4X8WZ6KPD2RVH9T
command: journal
sub: verify
run_id: crn_run_01JAN5B2Q7M4X8WZ6KPD2RVH9T
report:
  ok: true
  records: 15
  torn: false
  issues: []
```

## Common mistakes

- **`--planner inline` without `--plan-json`** — a usage error (`E1600`),
  never a guess. Use `--planner model` for gateway-backed planning.
- **Expecting a declared tool to run** — declaring `echo` in
  `vaerion.yaml` grants nothing. Without an allow rule, a tool step is
  refused fail-closed (`E1301`) and lands in the refusal log. See
  [`../refused-action/`](../refused-action/).
- **Re-running `vae init` in the same directory** — refused (`E1600`);
  the manifest is write-once by law.
- **Looking for `.vaerion/receipts/`** — receipts are journal records,
  not files in a directory.
- **Over-claiming determinism** — mockbrain answers are deterministic for
  the same seed, but *this* example's proof is the verified chain, not
  the model text.

## Next steps

- Flip one policy word and watch Vaerion refuse instead:
  [`../refused-action/`](../refused-action/)
- The same determinism applied to artifacts:
  [`../replay-machine/`](../replay-machine/)
- Agent configuration (tools, ceilings, planner models):
  [`../../docs/guides/building-agents.md`](../../docs/guides/building-agents.md)
- The engine types behind this walkthrough:
  [`../../docs/reference/engine-api.md`](../../docs/reference/engine-api.md)
