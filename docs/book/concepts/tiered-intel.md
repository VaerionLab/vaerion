# Concept — Tiered intelligence

*(grounded in ADR-0005 tiered intelligence / progressive enhancement, ADR-0008
local stores)*

Vaerion's project intelligence is **tiered**: the base tier works everywhere,
offline, with zero external dependencies; higher tiers enhance it behind the
same contracts and can degrade gracefully.

## Tier 1a — lexical, local, deterministic

The always-available path: a deterministic BM25 index over declared local
sources (`LocalIndex`). Properties that matter for a build system's brain:

- **Determinism** — same docs, same query ⇒ same scores, same order
  (total-order tiebreak).
- **Replace-on-reindex** — no incremental drift; a reindex is a new exact
  state, not a merge of history.
- **Provenance-complete packs** — context packs carry fingerprints and
  evidence ids, so citations point at verifiable records.

This tier is what powers `run research`, agent `context` steps, and citation
enforcement (E1806) today. It is test-covered, hermetic, and fast
(OBJ-Q5 throughput budget; see `PERFORMANCE.md` for the current measured
number).

## Higher tiers — progressive enhancement

Embedding-backed retrieval (vector stores per ADR-0008's FTS+VEC design) and
project-language tuning are **enhancements**, not foundations: they slot in
behind the same capability declarations and the same broker path. When they
are unavailable — fresh machine, air-gapped environment, provider outage —
the tier-1 path still answers, and the system says which tier served the
query instead of pretending.

## Why tiering is a constitutional stance

An agent that *sometimes cannot read your project* is dangerous exactly when
it pretends it can. Tiered intelligence with explicit degradation is the
antidote: every context pack names its provenance and its tier, citation
enforcement applies uniformly, and a degraded run is a journaled fact, not a
silent quality drop.
