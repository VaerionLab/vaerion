# Reference — Exit Codes & E-Codes

Vaerion errors teach. Every refusal carries a stable code, a human
summary, and a Fix line. Full recovery paths:
[`../TROUBLESHOOTING.md`](../TROUBLESHOOTING.md) · the authoritative
catalog of record: [`../../spec/errors.yaml`](../../spec/errors.yaml)
(82 codes).

## Exit codes (the contract)

| Code | Meaning | Typical cause |
|---|---|---|
| `0` | ok (including honest `outcome: failed` runs — the refusal lives in the receipt and journal, not in a crash) | — |
| `1` | internal error | engine bug — `VAE_DEBUG=1` prints the stack |
| `2` | usage error | unknown command/flag, missing prerequisite (e.g. Bun absent) |
| `3` | broker-denied | a policy refusal reached the process boundary |
| `4` | provider-down | a model provider failed through the gateway |
| `5` | partial — with repair hint | e.g. `package verify` on a tampered bundle |

## The codes you will actually meet

| Code | Name | Fires when | The Fix (verbatim spirit) |
|---|---|---|---|
| `E1600` | usage/taught-refusal | unknown command, wrong runtime, overwrite refusal — help always teaches | follow the printed Fix; `vae --help` never executes |
| `E1202` | config schema | `vaerion.yaml` violates the strict schema (unknown keys are rejected by law) | remove/fix the named key |
| `E1203` | unknown template | `vae init --template X` not in the registry | available templates are named in the error (`minimal\|demo\|agent`) |
| `E1300` | `broker_denied` | the permission broker denied the requested capability | inspect the recorded decision (`vae explain <trace>`); request the narrowest needed grant in `vaerion.yaml` |
| `E1301` | `broker_fail_closed` | the broker could not evaluate and refused rather than guess | resolve the underlying condition; fail-closed is a feature |
| `E1801` | undeclared tool | an agent step called a tool not declared in config | declare the tool and grant it via policy |
| `E1803` | invalid DAG | the workflow graph fails fail-closed validation | fix cycles/edges named in the error |
| `E1804` | step ceiling | the agent hit `agents.maxSteps` | raise the ceiling consciously (config change, new fingerprint) |
| `E2001` | non-loopback bind | `vae serve` asked to bind a non-loopback address | keep the daemon loopback-only |
| `E2201` | bundle tamper | `package verify` recomputed digests and found mismatch | restore the verified bytes; investigate before trusting |
| `E2206` | bundle pin mismatch | pins in `vaerion.lock` disagree with the artifact | rebuild (`vae package build`) and re-verify |

Measured examples live in the demos: a policy denial reported as
`outcome: failed` + `decisions_deny: 1`
([`../../examples/refused-action/`](../../examples/refused-action/)) and
a tampered bundle refused with exit 5
([`../../examples/replay-machine/`](../../examples/replay-machine/)).

## Debugging discipline

1. Read the Fix line — it is generated with the error, not bolted on.
2. `vae explain RUN_ID` — the journal narrates what actually happened.
3. `vae doctor` — rule out workspace-level causes.
4. `VAE_DEBUG=1` — the underlying stack (a diagnostics aid, never a
   data path).
