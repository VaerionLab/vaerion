# Example — the 15-minute demo workspace

> The canonical external-tester workspace — the deeper companion to the
> pure-CLI journey in [`docs/QUICKSTART.md`](../../docs/QUICKSTART.md)
> (the quickstart teaches init → run → verify; this workspace adds the
> reproducible-bundle half). Its `vaerion.yaml` is
> committed, so you use it in place or copy it — **do not run `vae init`
> here** (it would refuse: the manifest already exists, by law).

## Purpose

Give a new developer one directory where the whole core story runs in
fifteen minutes: declared local sources → broker-gated research run →
verified journal → receipt → byte-identical reproducible bundle.

## Architecture

| Piece | Where here |
|---|---|
| Config law | `vaerion.yaml` — schema `0.1`, strict keys, `telemetry.enabled: false` |
| Declared capability | `research.capabilities[0]`: local sources at `./sources`, `fencing: untrusted` (content is data, never instructions) |
| Sources | `sources/journal.md`, `sources/determinism.md` — small, honest texts about the engine's own guarantees |
| Stores | `.vaerion/journal/` + `.vaerion/blobs/` — created on the first run |
| Packaging | `package.include: [vaerion.yaml, DEMO.md, sources]` — the declared bundle inputs |

## Code

The walkthrough lives in [`DEMO.md`](DEMO.md); the whole journey is:

```sh
cd examples/vaerion-demo            # or a copy of this directory
vae run demo --query "determinism"  # no --sources needed: paths derive from
                                    # the declared capabilities (or be explicit)
vae journal ls                      # note the run_id (crn_run_…)
vae journal verify <RUN_ID>
vae explain <RUN_ID>
vae package build                   # → .vaerion/package/vaerion-demo.vxn
vae package build --out second.vxn
vae package verify .vaerion/package/vaerion-demo.vxn
```

## Verification

- `vae journal verify <RUN_ID>` recomputes the blake3 chain: `ok: true`,
  `torn: false`, `issues: []` — exit `0`. Exit `5` names the first issue.
- `vae package verify` on the bundle: `VERIFIED (0 finding(s))`; build
  twice and the sha256 digests match — byte-identical, because nothing in
  the pipeline reads the clock.
- `vae doctor` audits the whole workspace: config, every journal, every
  referenced blob, evidence↔blob↔fingerprint triangulation, both sibling
  chains (audit, refusals), the gateway matrix — zero network.

## Receipts

The research run closes with a receipt folded from its journal: the
research-index broker decision(s) in `counts.decisions_allow` (one per
source), the context pack and snapshot in `counts.snapshots`, the indexed
content in `blob_refs[]`, and the integrity commitment in
`journal.head_hash`. The bundle build is a journaled run of its own, with
its own receipt.

## Expected output

Plain mode, trimmed (ids and hashes are placeholders):

```text
$ vae run demo --query "determinism"
command: run
kind: demo
run_id: crn_run_01JAN6C4R8M5X9WZ7KPD3RVH2Y
trace_id: t_1jan6c4r8m
documents: 2
query: determinism
hits: 4
hits_detail:
  - { doc_id: doc_0001, score: 0.82 }
context:
  blocks: 5
  dropped: 0
  tokens_estimated: 356
receipt:
  counts:
    records: 24
    events: 18
    decisions_allow: 1
  journal:
    head_hash: 5a3f9c02e1b7d446…
journal_verified: true
```

## Common mistakes

- **Running `vae init` here** — refused (`E1600`); the manifest is
  committed. Copy the directory if you want a scratch variant.
- **Adding files and expecting them in the bundle** — only
  `package.include` paths are folded; extend the list, then rebuild.
- **Expecting `.vaerion/receipts/`** — receipts are the terminal journal
  records, not files in a directory.
- **Editing sources while interpreting results** — sources are fenced
  `untrusted`: their content is data the engine indexes, never
  instructions it follows.

## Next steps

- The full annotated walkthrough: [`DEMO.md`](DEMO.md)
- The pure-CLI quickstart this workspace pairs with:
  [`../../docs/QUICKSTART.md`](../../docs/QUICKSTART.md)
- An agent action with proof: [`../verifiable-agent/`](../verifiable-agent/)
- The book's tutorials: [`../../docs/book/tutorials/`](../../docs/book/tutorials/)
