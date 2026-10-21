# ADR-0008: SQLite+WAL+FTS5+sqlite-vec triad as local store

> **Status update (2026-10-21, Era II GA):** the v0.1.15 GA engine ships the
> blob-CAS store and the NDJSON journal chain — the SQLite/WAL/FTS5/sqlite-vec
> triad described here is NOT in the GA engine; no derived-store milestone has
> adopted it. Honest status: **superseded-by-reality / deferred** — the decision
> stands as written for a future derived store, but it is not the shipped local
> store of record.

| | |
|---|---|
| Status | Accepted |
| Date | 2026-08-29 |
| Supersedes | none |
| Superseded by | none |

## Context

The engine needs local persistence for derived, disposable state: the
symbol/graph intelligence database, semantic chunks and vectors, caches and
fingerprints. Requirements are zero-config embedded deployment, ubiquitous
recovery tooling, full-text search, and approximate vector search adequate
for local repositories (hundreds of thousands to roughly a million vectors
with a clear upgrade path).

## Decision

1. The local store triad for derived state is SQLite in WAL mode, FTS5 for
   full-text search, and sqlite-vec for vector search. Rejected alternatives:
   bundled Postgres (operationally heavy for local-first), LMDB and sled
   (no FTS/vector ecosystem).
2. Scope note (binding): the law-governed durable stores are NOT SQLite. Run
   journals and the audit ledger are append-only NDJSON with a blake3 hash
   chain, and large payloads live in a content-addressed blob store, per
   constitution decision D-I. The SQLite triad applies to derived and
   disposable stores only; the journal substrate decision is deferred to that
   law, and MS-1 implements journals as NDJSON.
3. Derived stores are disposable by design: `rebuild` and `re-embed`
   operations can reconstruct them entirely from project content and journals.
   They are never the source of truth and never back up user data.
4. Vector scale: the triad is adequate up to roughly one million vectors;
   an HNSW-based upgrade path is noted for reconsideration via a future ADR.

## Consequences

- Positive: zero-admin local deployment; one well-understood file format per
  derived store; mature tooling for inspection and recovery.
- Positive: clean separation between disposable derived state (SQLite) and
  law-governed durable state (NDJSON chains + CAS), so neither is taxed by
  the other's requirements.
- Negative: two persistence technologies must be operated and tested.
- Negative: sqlite-vec performance is bounded; the threshold is documented
  and monitored rather than assumed.
