# Introduction

## What Vaerion is

**AI agents act. Vaerion turns those actions into cryptographic evidence.**

Vaerion is the **trust runtime for AI agents**: a local-first, deterministic engine
that sits underneath autonomous AI work and records what actually happened —

- every run becomes an **append-only, blake3-chained journal**,
- every consequential action passes a **fail-closed permission broker**,
- every run produces a **receipt** you can verify yourself,
- and packaging is **reproducible**, so artifacts carry permanent provenance.

Local-first means your work, your journals, and your keys stay on your machine.
Deterministic means the same input yields the same evidence — the engine is built to
be audited, not admired.

## The problem that exists

Autonomous AI agents now write code, run commands, and change systems. But their
actions are usually invisible afterwards: a chat transcript is not evidence, a
"trust me" summary is not provenance, and nothing about a typical agent run can be
verified by a stranger. Teams are asked to grant machine autonomy while holding
none of the accountability tooling they would demand from a human deployer.

## Why Vaerion exists

Vaerion exists to close that gap. It treats **evidence as the primary product**:
not logs you might read, but hash-chained journals, broker decisions, and receipts
designed to be verified — by you, your CI, or anyone you hand them to. The engine's
own development is governed by the same law it ships: a constitution, a measured
verification battery, and release provenance.

## What Vaerion is not

- It is **not** a cloud control plane — there is no telemetry and no hosted brain.
- It is **not** an agent framework that thinks for you — it is the runtime that
  makes whatever the agent does *provable*.
- It is **not** finished — see the honest [`LIMITATIONS`](../LIMITATIONS.md) page
  and the [roadmap](../../ROADMAP.md).

## Where to go next

- Install: [installation](../installation/README.md)
- First verified receipt: [quickstart](../quickstart/README.md)
- The full thesis and architecture: the [master blueprint](../vaerion-master-blueprint.md)
  and the [ADR set](../adr/README.md)
