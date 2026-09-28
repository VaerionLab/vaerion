# DOCUMENTATION PIPELINE — Stage 10 Contract

**Status:** architecture ratified (Stage 1); implementation scheduled Stage 10.
**Authority:** Implementation Constitution P-4, Part XI; Visual System §0.

## 1. Prime Directive

Documentation is generated from the constitutional sources, never hand-edited.
Hand-edited documentation drifts; drift is a violation of the governing rule
that documentation must never drift from implementation (Volume IV directive,
Stage 10) and of the Trace Index discipline (Constitution P-4).

## 2. Sources (all authoritative, all in-repository)

| Source | Path | Feeds |
|---|---|---|
| Constitutional INDEX | `constitution/INDEX.md` | every document header |
| Ratified documents | `constitution/{bible,visual-system,implementation-constitution}/` | citation resolution |
| Trace Index | `constitution/trace-index/trace-index.md` | published trace index |
| Registry | `src/vaerion/registry/` | registry documentation, token tables |
| Primitive contracts | `src/vaerion/primitives/` | primitive documentation |
| Stage manifest | `src/vaerion/foundation/stages.ts` | implementation status documentation |

## 3. Outputs

1. **Registry documentation** — token tables with dual naming, values, constraints, citations, lifecycle status (VS §0).
2. **Trace Index publication** — every engineering rule mapped to its citation (Constitution P-4).
3. **Implementation documentation** — stage-by-stage architecture from the stage manifest.
4. **API documentation** — public exports of `src/vaerion/*` with their citations.

## 4. Drift Enforcement

The documentation build must fail if generated output differs from committed
output. Documentation errors are conformance errors, not editorial matters
(Constitution 9.1 — every check mechanical, pass or fail).

## 5. Language Rules

Documentation uses the dual naming system (systematic identifier + instrument
name) and the constitutional vocabulary — states, seals, chain, lens, receipt —
without local synonym invention (Constitution 4.7; VS §14 NN/g amendment for
the permanent one-line explainers of the three verdict states).
