# Guide — Permissions & the Broker

How Vaerion decides who may act — and how every decision becomes
evidence. Concept model: [`../concepts/security.md`](../concepts/security.md).

## The law

**Decide → Journal → Act.** Nothing privileged happens without a broker
decision, and every decision is journaled. The broker is fail-closed:
**unmatched means denied** (E1300 `broker_denied` in
[`spec/errors.yaml`](../../spec/errors.yaml); the measured output
reports it as `outcome: failed` with `decisions_deny: 1`).

## Writing policy rules

In `vaerion.yaml` — strict schema, unknown keys rejected:

```yaml
policy:
  rules:
    - id: allow-echo-tool            # unique id
      principalKinds: [agent]        # human | agent | extension
      domain: tool.call              # tool.call | model.invoke |
                                     # research.fetch | secret.read | net.connect
      scope: echo                    # the narrowest target
      effect: allow                  # allow | deny | prompt
      rationale: "why this grant exists (mandatory)"
```

**First match wins** — order rules from most specific to most general.
Declaring tools/providers under `tools:` / `gateway:` sets the ceiling;
**only these rules grant**.

## The three effects

| Effect | Behavior |
|---|---|
| `allow` | the request proceeds; the decision is journaled |
| `deny` | the step fails honestly; the denial is journaled **and** appended to the hash-chained refusal log (`.vaerion/refusals.log`) |
| `prompt` | the run pauses on a durable human gate — it survives crashes and restarts; a human resolves it: `vae resume RUN_ID --answer '{"approved": true}'` |

A `prompt` approval is journaled as elevation authority for that
request — there are no blanket grants, no "remember my choice".

## See all three in ten minutes

1. **allow** — [`../../examples/verifiable-agent/`](../../examples/verifiable-agent/):
   a brokered tool call succeeds, receipt closes, chain verifies.
2. **deny** — [`../../examples/refused-action/`](../../examples/refused-action/):
   flip `allow` → `deny` (one word) and rerun — `outcome: failed`,
   refusal hash-chained, failed run's journal still verifies.
3. **prompt** — change the rule's effect to `prompt`, rerun, then:

   ```sh
   vae journal ls            # the run waits at a gate
   vae resume RUN_ID --answer '{"approved": true}'
   ```

## Inspection and integrity

```sh
vae journal show RUN_ID        # the decision records, in order
vae explain RUN_ID             # the narrative + decision tallies
vae center                     # refusal-log and audit-chain integrity, live
```

## Design rules worth internalizing

- Agents cannot widen their own authority: the ceiling compiles from
  the reviewed, fingerprinted `vaerion.yaml` — changing it is a config
  change with a new fingerprint, visible in every subsequent receipt.
- Fail-closed extends to errors: if the broker cannot evaluate a
  request, it refuses (E1301 `broker_fail_closed`) — it never guesses.
- Secrets are a domain too (`secret.read`): OS-keychain-first
  resolution, presence-only reporting, and policy-gated access.
