# Concepts — Journals, Receipts & Provenance

The evidence model: append-only journals, the blake3 hash chain,
receipts, and permanent provenance. Deep records: ADR-0003 (journals),
ADR-0006 (folds), ADR-0016 (`.vxn`) in [`../adr/`](../adr/).

## The journal

One append-only NDJSON file per run in `.vaerion/journal/` (single
writer). Record kinds: `meta` · `evt` · `decision` · `gate` ·
`snapshot` · `receipt`. The chain law
(`journal/hashchain.ts`):

```text
hash(record) = blake3(canonicalJson(record_without_hash))
prev(record_1) = GENESIS_HASH (64 zeros)
prev(record_n) = hash(record_{n-1})
```

`vae journal verify RUN_ID` recomputes every hash, checks prev-linkage
and index continuity, and reports `{ ok, records, headHash, torn,
issues }` — measured: `ok: true, torn: false, issues: []` on a healthy
run. One implementation serves run journals **and** the workspace audit
ledger and refusal log.

## Receipts — a run is not finished until it has one

A receipt (`receipts/receipt.ts`) is folded **from** the journal:
counts of records/events/allow/deny/prompt decisions, gates, snapshots,
recovery notes, blob references, and the journal head hash. It is
shape-guarded (E1003), stored in `.vaerion/receipts/`, and verifies
independently of the process that produced it. The run command prints
it on close — `journal_verified: true` is the engine re-checking its
own chain before declaring the run closed.

## Operations

| Command | What it does |
|---|---|
| `vae journal ls` | every run in the workspace, with record counts and head hashes |
| `vae journal show RUN_ID` | the full event narrative, record by record |
| `vae journal verify [RUN_ID]` | recompute the blake3 chain (measured: `ok: true, torn: false, issues: []`) |
| `vae journal recover RUN_ID` | truncate **only** a torn crash tail and re-seal with an auditable note — never a silent rewrite |
| `vae journal export RUN_ID` | a redacted, verifiable derivation (secrets excluded by law) |
| `vae explain RUN_ID` | the human narrative: cause-chain walk, decisions, metering |
| `vae report` | a pure fold over every journal in the workspace |
| `vae snapshot` / `vae restore` | deterministic evidence-state archives pinned by blake3 — identical state, identical bytes |

## Provenance — evidence, not branding

`vae provenance ARTIFACT` recomputes every digest that **can** be
recomputed from the bytes: a `.vxn` bundle (structure, sizes, entry
digests), `vaerion.lock` (seal vs on-disk bundle), a redacted journal
export, or a release `MANIFEST.json`. Measured on a demo bundle:
6/6 checks passed, `findings: []`.

## Prove it to yourself

[`../../examples/replay-machine/`](../../examples/replay-machine/) —
build twice, compare digests, flip a byte, watch the verifier refuse.

Next: [security.md](security.md) — who is allowed to write these
journals, and who decides.
