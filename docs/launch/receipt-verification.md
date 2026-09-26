# Receipt verification — the chain holds

The promise: every action leaves evidence, and anyone can check the
evidence without trusting anyone — including us. This is the real
verification of the run in [`demo-flow.md`](demo-flow.md).

## The command

```sh
vae journal verify crn_run_01M3DDZY13X91QSVVJYJ0JJ4FC
```

## The output (unedited)

```yaml
command: journal
sub: verify
run_id: crn_run_01M3DDZY13X91QSVVJYJ0JJ4FC
report:
  ok: true
  path: /tmp/vaerion-stranger-project/.vaerion/journal/crn_run_01M3DDZY13X91QSVVJYJ0JJ4FC.ndjson
  records: 14
  events: 10
  maxSeq: 10
  headHash: e47a0bbc77e0275b2b277aa74c53a79689250b672581767808973542aeb56a44
  torn: false
  issues:
    []
```

Measured: **exit 0 in 85 ms**.

## How to read it

| Field | Meaning |
|---|---|
| `ok: true` | The journal chain is intact from the first record to the head |
| `records: 14` | Every record on the spine for this run was present and hash-checked (13 from the run + the closing record) |
| `headHash` | The blake3 head of the chain — change one byte anywhere in history and this hash changes |
| `torn: false` | No missing sequence numbers; the append-only law holds |
| `issues: []` | Zero anomalies found |

The verifier is a **pure check**: it reads the journal and recomputes
hashes. It never executes anything it finds. That is the whole trust
model — evidence first, verification second, trust last.

Reproduce it yourself: install Vaerion
([`installation-walkthrough.md`](installation-walkthrough.md)), run the
demo ([`demo-flow.md`](demo-flow.md)), and verify your own run ID — your
hashes will be your own, and they will hold the same way.
