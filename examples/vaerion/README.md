# Vaerion examples

This directory holds the worked example the documentation points at. It is
not illustrative fiction: **the engine's own test suite executes every flow
shown here** (`packages/vaerion/tests/integration/examples.test.ts`), so the
example cannot drift from reality — a change that breaks it fails the gates.

## What `demo-workspace/` demonstrates

| File | What it teaches |
|---|---|
| `vaerion.yaml` | a complete, schema-valid config: MockBrain (the hermetic seeded provider), one declared tool, agent ceiling, fail-closed policy rules with rationales, a `package` block, zero telemetry |
| `plans/echo-plan.json` | an inline plan (`--plan-json` takes a JSON **array** of steps): note → tool |
| `workflow.json` | a workflow DAG (`--dag` takes the JSON file): a three-node chain — tool → **model step through the gateway single gate** → note, with dependency edges |

## Run it yourself (all commands below are test-executed)

```bash
# 1. get the engine (docs/book/tutorials/00-install.md has the full story)
bun install && alias vae="bun run packages/vaerion/src/cli/vae.ts"

# 2. copy the example into a live workspace (init scaffolds .vaerion/)
cp -r examples/vaerion/demo-workspace /tmp/demo && cd /tmp/demo
vae init . 2>/dev/null || true          # init writes a template config; the demo ships its own
#    ...or simply create the dirs yourself:
mkdir -p .vaerion/journal .vaerion/blobs

# 3. the agent run — declared plan, broker-admitted steps, receipted close
vae run agent --goal "demo the committed example" \
  --planner inline \
  --plan-json "$(cat plans/echo-plan.json)" --json

# 4. the workflow run — deterministic DAG, model step through the gateway
vae run workflow --dag workflow.json --json

# 5. prove the journals (the blake3 hash chain)
vae journal verify

# 6. packaging — byte-identical bundles, sealed by vaerion.lock
vae package build && vae package build   # run twice: identical bytes
vae package verify .vaerion/package/vaerion-demo.vxn
vae doctor                               # the full picture, repair hints if anything is off
```

Expected honest results, all test-proven:

- step 3 exits `0` with `outcome: "goal"` and `journal_verified: true`;
- step 4 exits `0` with `outcome: "completed"` and the three nodes
  completed in topological order;
- step 5 verifies the hash chain for every run in the workspace;
- step 6 produces two byte-identical `.vxn` bundles and a green verify —
  identical inputs, identical bytes (the P2 determinism law, in your hands);
- `vae serve` (not shown — interactive) starts the loopback-only daemon
  with a once-printed pairing token; the TypeScript SDK in
  `sdks/typescript` is its wire client.

## Refuse law (negative demos worth trying)

- Remove the `allow-echo-tool` policy rule and rerun step 3 — the run
  completes **honestly failed** (`E1300`, refusal hash-chained, exit stays
  truthful).
- Tamper a byte of the built bundle and rerun `vae package verify` —
  `E2201`, the pure check refuses without executing anything.
- Add an unknown key to `vaerion.yaml` — strict schema rejection names it.

Next: the book — [`docs/book/tutorials/00-install.md`](../../docs/book/tutorials/00-install.md).
