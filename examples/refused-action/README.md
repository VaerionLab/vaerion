# Demo 2 — The Refused Action

**Proves**: Vaerion stops unauthorized actions — permission request,
broker refusal, refusal log.

Every command below was executed end-to-end against the published
`vaerion@0.1.13-rc1` package. Your run ids and hashes will differ; the
shape of the refusal will not.

## The idea

Declaring a tool in `vaerion.yaml` grants **nothing**. Only policy
rules grant. The broker is fail-closed: unmatched means denied — and
every denial is recorded twice: as a journaled broker decision inside
the run, and as an entry in the workspace's **hash-chained refusal log**
(`.vaerion/refusals.log`).

This demo refuses an action by changing exactly **one word** of policy.

## Run it

```sh
# 1. provision (same workspace as the Verifiable Agent demo)
cp -r examples/vaerion/demo-workspace refused-action && cd refused-action
mkdir -p .vaerion/journal .vaerion/blobs

# 2. flip one word: allow -> deny, on the echo-tool rule in vaerion.yaml
#    (any editor — or:)
sed -i 's/effect: allow/effect: deny/' vaerion.yaml

# 3. run the SAME agent plan as Demo 1 — the tool step now crosses a deny rule
vae run agent --goal "Try the echo tool without a grant" \
  --planner inline \
  --plan-json '[
    { "kind": "note", "text": "the demo agent starts with a note step" },
    { "kind": "tool", "tool": "echo", "args": { "value": "hello from the committed example" } }
  ]'

# 4. the refusal record
tail -1 .vaerion/refusals.log | cut -c1-200
vae center | grep -A3 refusal_log
vae journal ls                 # note the FAILED run's id
vae journal verify <RUN_ID>    # the failed run's journal STILL verifies
```

## Expected output (measured, trimmed)

```text
command: run
kind: agent
run_id: crn_run_01M3F2C34PE2FP8JJWNZFDBDKB
outcome: failed
steps: 1
failures: 1
metrics:
  tools:
    requested: 1
    denied: 1
receipt:
  counts:
    decisions_deny: 1
journal_verified: true
```

The refusal log — a hash chain of its own (genesis `prev` is 64 zeros):

```text
{"k":"refusal","i":1,"prev":"000000000000…","at":"2026-09-26T14:36:14.732Z",
 "run_id":"crn_run_01M3F2ACG2TQ228DTTZ7E65FK0","decision_id":"01M3F2ACGBA9R99T8XRXVGM8V6",…}
```

`vae center` reports the refusal log's chain integrity alongside the
audit ledger. And the failed run's journal **still verifies** —
`ok: true` — because a refusal is evidence too.

## What just happened

1. The plan's tool step requested `tool.call echo`.
2. The broker evaluated shape → ceiling → policy. First match wins:
   the rule now says **deny**.
3. The step failed honestly — `outcome: failed`, `failures: 1` — while
   the CLI itself exited cleanly (exit 0): a refusal is an *outcome*,
   not a crash. The catalog calls this family `E1300 broker_denied`
   (`spec/errors.yaml`); the measured plain output reports it as the
   denied counters you see above.
4. The denial was journaled in the run **and** appended to the
   workspace refusal log — hash-chained, tamper-evident, independent of
   the run's own journal.
5. `vae journal verify` on the failed run: `ok: true`. Trust even in
   refusal.

## The deeper law

- **Fail-closed**: remove *all* rules and every request is denied —
  the absence of permission is not permission.
- **No blanket grants**: a `prompt` effect opens a durable human gate
  (`vae resume RUN_ID --answer '{…}')` — approvals are journaled as
  elevation authority, scoped to that request.
- Try it: delete the `allow-mockbrain-model` rule too and add a model
  step to the plan — same story, different domain.

## Where to go next

- Policy syntax and the three broker layers:
  [`docs/guides/permissions.md`](../../docs/guides/permissions.md)
- The positive path — a brokered action that succeeds:
  [`../verifiable-agent/`](../verifiable-agent/)
