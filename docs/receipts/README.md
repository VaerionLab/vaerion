# Receipts — the anatomy of evidence

A receipt is the folded, verifiable summary of a run. It is the artifact you can
hand to a person who saw nothing and let them prove what happened.

## What goes into it

| Field class | Meaning |
|---|---|
| identity | run id (`crn_run_<ulid>`), engine version, trace id |
| chain | the journal's blake3 head hash and record count — the receipt names the evidence it summarizes |
| decisions | broker outcomes for the gated actions the run took |
| artifacts | documents, packages, and outputs with their hashes |
| shape | schema-pinned — see [`spec/schemas/receipt.schema.json`](../../spec/schemas/receipt.schema.json) and the golden fixture at [`packages/vaerion/fixtures/golden/receipt.golden.json`](../../packages/vaerion/fixtures/golden/receipt.golden.json) |

## Where it lives

Inside `.vaerion/journal/<run_id>.ndjson` — the same append-only, hash-chained
journal that recorded every event. The receipt is folded from the chain; it never
floats free of it.

## How you verify one

See [verification](../verification/README.md) for the commands, and
[`docs/launch/receipt-verification.md`](../launch/receipt-verification.md) for the
measured, screenshot-backed walkthrough of a real verification.

## Why hash-chained

`blake3` links every record to its predecessor: edit one byte anywhere and the
head hash changes, the chain reports `torn`, and verification fails loudly. The
math is explained in [checkpoint-math](../book/concepts/checkpoint-math.md); the
envelope contract in ADR [0002](../adr/0002-versioned-event-spine-envelope.md).
