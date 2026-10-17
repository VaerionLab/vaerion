# Example — The Refused Action

> A walkthrough, not a fixture: every command below is a real `vae`
> command (`0.1.13-rc1`) run in a scratch workspace. Run ids and hashes
> will differ; the shape of the refusal will not.

## Purpose

Prove that Vaerion stops unauthorized actions — and that a refusal is
evidence, not an error to hide. One flipped policy word turns the
Verifiable Agent's allowed step into a broker refusal: the action is
denied, the denial is journaled twice (in the run **and** in the
workspace's hash-chained refusal log), and the failed run **still
verifies**.

## Architecture

| Piece | Role |
|---|---|
| Broker layers (`broker/engine.ts`) | shape → permission-graph ceiling → policy. Fail-closed at every layer |
| `PolicyRule.effect` | `allow` / `deny` / `prompt`; first match wins; **no match ⇒ deny `E1301`** |
| Refusal log (`broker/refusal-log.ts`) | every deny appended to `.vaerion/refusals.log` — a blake3 chain of its own, genesis `prev` = 64 zeros |
| `agentGrants` (`agents/grants.ts`) | the agent's ceiling grants are *derived* from admitted policy rules — a deny rule removes the grant too |
| `vae center` | folds runs, metering, and **both chains' integrity** into one read-only report |

## Code

```sh
cd "$(mktemp -d)"
vae init --template agent            # one policy rule: allow model.invoke mockbrain/mock-1
```

Flip exactly one word of that rule — `allow` → `deny` (any editor; on
GNU sed):

```sh
sed -i 's/effect: allow/effect: deny/' vaerion.yaml
```

Run the same kind of plan the Verifiable Agent ran — the model step now
crosses a deny rule:

```sh
vae run agent --goal "Try to invoke the planner model without a grant" \
  --planner inline \
  --plan-json '[
    { "kind": "note", "text": "this step is not allowed anymore" },
    { "kind": "model", "model": "mockbrain/mock-1",
      "messages": [ { "role": "user", "content": "hello" } ] }
  ]'
```

Then look at the evidence:

```sh
tail -1 .vaerion/refusals.log | cut -c1-200   # the newest refusal entry
vae center                                     # runs, metering, refusal_log + audit integrity
vae journal ls                                 # note the FAILED run's id
vae journal verify <RUN_ID>                    # the failed run's journal STILL verifies
```

## Verification

- `vae journal verify <RUN_ID>` on the **failed** run reports
  `ok: true`, `torn: false`, `issues: []` — a refusal is journaled
  evidence like any other record.
- `vae center` reports the refusal log's chain integrity alongside the
  audit ledger; `vae doctor` re-checks both chains any time.
- Delete the rule entirely instead of flipping it and the broker still
  refuses — unmatched means deny (`E1301`): the absence of permission is
  not permission.

## Receipts

The refused run closes with a receipt like any run — that is the point.
Its `counts.decisions_deny` is `1`; its `journal.head_hash` commits to a
chain that contains the denial. The refusal log entry is a separate,
independent chain record:

```json
{"k":"refusal","i":1,"prev":"000000000000…","at":"2026-09-26T14:36:14.732Z",
 "run_id":"crn_run_…","decision_id":"01M3F2ACGBA9R99T8XRXVGM8V6",
 "reason_code":"E1300","domain":"model.invoke","scope":"mockbrain/mock-1", …}
```

## Expected output

Plain mode, trimmed (ids and hashes are placeholders):

```text
command: run
kind: agent
run_id: crn_run_01JAN5E9T3N7Y2WZ4KPD8RVH1X
outcome: failed
steps: 1
failures: 1
metrics:
  model:
    requested: 1
    denied: 1
receipt:
  counts:
    decisions_deny: 1
journal_verified: true
```

The CLI exits cleanly (exit `0`): a refusal inside the supervised loop is
an **outcome**, not a crash. (Broker denial as a run-level exit code —
`3` — applies where the run itself is the denied action, e.g. `vae run
demo` against a denied source.)

## Common mistakes

- **macOS/BSD `sed -i`** needs an argument (`sed -i '' 's/…/…/'`) — or
  just flip the word in your editor.
- **Expecting exit 3** — agent-loop refusals end with `outcome: failed`
  and exit `0` (the journal verified). Exit 3 is the run-level
  broker-denied code for other run kinds.
- **Hand-editing `.vaerion/refusals.log`** — it is a hash chain;
  tampering breaks `vae center`/`vae doctor` verification loudly. There
  is no repair for an edited refusal: the chain is the point.
- **Treating the refusal as a bug** — check the `rationale` in the
  policy rule that refused; the reason is part of the rule, by law.

## Next steps

- The positive path — a brokered action that succeeds:
  [`../verifiable-agent/`](../verifiable-agent/)
- Policy syntax and the three broker layers:
  [`../../docs/guides/permissions.md`](../../docs/guides/permissions.md)
- `PolicyRule` / `evaluatePolicy` / `RefusalEntry` types:
  [`../../docs/reference/engine-api.md`](../../docs/reference/engine-api.md)
  (§ Broker)
