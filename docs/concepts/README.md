# Concepts — the vocabulary of trust

Six words carry the whole model. Each links to the deep-dive in
[`docs/book/concepts/`](../book/README.md).

| Concept | One line | Deep dive |
|---|---|---|
| **Manifest** | `vaerion.yaml` is the strict-subset contract that drives the project; the lockfile and generated specs freeze it into verifiable form. | [book/concepts](../book/README.md) · schema: [`spec/schemas/vaerion-yaml.schema.json`](../../spec/schemas/vaerion-yaml.schema.json) |
| **Event spine** | Every meaningful thing that happens is a versioned event with an envelope — one ordered stream per run. | [event-spine](../book/concepts/event-spine.md) |
| **Broker** | A fail-closed permission broker gates consequential actions; a refusal is a recorded, auditable outcome — never a silent fallback. | [broker-model](../book/concepts/broker-model.md) |
| **Journal** | The append-only, blake3-chained record of a run. Torn chains are detected, not hidden. | [checkpoint-math](../book/concepts/checkpoint-math.md) |
| **Receipt** | The folded, verifiable summary of a run — the artifact you hand to a stranger. | [receipts](../receipts/README.md) |
| **Provenance** | Reproducible packaging means artifacts carry their origin with them (`.vxn` bundles). | [book/guides/packaging](../book/guides/packaging.md) · ADR [0016](../adr/0016-reproducible-vxn-bundles.md) |

## The source-of-truth chain

`vaerion.yaml → vaerion.lock → spec/` — the manifest is authored, the lock is
derived, the specs are generated. Nothing is asserted twice; everything is checked.

## Determinism as a contract

Same inputs → same events → same hashes. That is what makes the evidence
verifiable by anyone, anywhere, later. The tiered-intelligence model keeps model
output behind measured seams so the trust properties do not depend on a
particular provider: [tiered-intel](../book/concepts/tiered-intel.md).
