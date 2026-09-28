# REGISTRY IMPLEMENTATION — Stage 2 Contract

**Status:** architecture ratified (Stage 1); implementation scheduled Stage 2.
**Authority:** Implementation Constitution Part II; Visual System §0, §4.7.
**Authority separation (Foundation Amendment F-004):** this document governs
the **implementation** of the Registry — the executing side. The **law** of the
Registry (what it is, token anatomy, lifecycle, validation, ownership) is held
by the constitutional authority at `constitution/registry/README.md`. This
implementation may never replace, relax, or restate that law; where they
appear to conflict, the constitutional authority prevails.
**Precondition:** `constitution/visual-system/VAERION_VISUAL_SYSTEM_v1.0.1.md` must be transcribed into the repository (governance item **DP-2**, completed under Foundation Amendment **F-001**) before token values are implemented, because Stage 2 compiles values from the ratified Visual System text, not from memory or invention.

## 1. Source of Truth (Constitution 2.1)

Exactly one canonical Registry holds seven sub-registries, exactly as named in Visual System §0:

| # | Sub-registry | Governs | Scale authority |
|---|---|---|---|
| 1 | Space | all spacing | Gauge Ladder (VS §1.2) |
| 2 | Type | two-voice sizes, weights, tracking, line heights | Type Scale (VS §2.2) |
| 3 | Shape | radii, hairlines, geometry vocabulary | Radius Ladder (VS §3.2) |
| 4 | Color | ground, ink ramp, verdict chromatics, accent, washes | VS §4.7 reference values |
| 5 | Motion | durations, curves, the three canonical motions | Motion Registry (VS §7.1) |
| 6 | Elevation | layer ordinals layer.0–layer.6 | VS §3.4 |
| 7 | Icon | grid, stroke, sizes, families | VS §8 |

## 2. Token Anatomy (Constitution 2.2)

Every token record carries exactly seven fields, no more, no fewer:

1. `identifier` — systematic id, `domain.property.variant`
2. `instrumentName` — the poetic name, dual-registered (VS §0)
3. `value` — or formula
4. `constraints` — scale membership, contrast minima, usage restrictions
5. `governingCitation` — at least one `Citation` into ratified law
6. `version` — Registry version that introduced the current value
7. `status` — `proposed | ratified | active | deprecated | retired`

## 3. Lifecycle (Constitution 2.5, 2.9)

- Transitions between statuses are performed only by governance (Part XI).
- `deprecated` tokens must alias to a successor and render identically during the deprecation window (one full release cycle).
- `retired` tokens must not resolve. Removal occurs only at major ratification.

## 4. Validation (Constitution 2.6)

Automated conformance checks must verify, mechanically:

- **Scale membership** — every value belongs to its registry's ratified scale; off-scale values are violations.
- **Contrast proof** — all color pairs meet Visual System §4.7 minima (≥4.5:1 text, ≥3:1 glyph/focus).
- **Grayscale survival** — verdict colorations remain meaningful with chroma suppressed (VS §4.4).
- **Citation presence** — every record carries a governing citation; empty citation sets are violations (P-4, Bible Art. XI).

## 5. Compiler and Distribution (Constitution 2.7 — implementation necessity)

- The Registry compiles to generated, read-only **platform bindings**; one binding set per target platform.
- Bindings are generated, never hand-authored; regeneration is reproducible from the Registry alone; all binding sets from one Registry version are semantically identical.
- Surfaces consume only binding-resolved values. A literal visual value anywhere in implementation code is a violation (Constitution 1.3).

## 6. Versioning (Constitution 2.8)

- Additions of new tokens: additive versions.
- Any change to the value or meaning of an active token: breaking change requiring a ratified amendment (Part XI).
- Surfaces declare the Registry version they conform to; auditable at release time (Part X).

## 7. Ownership (Constitution 2.4)

The Registry is owned by the Design Systems Authority (Constitution 11.1). Engineers request tokens through the amendment pathway; local copies of token values are violations.

## 8. Non-Authoritative Pre-Ratification Artifacts

`docs/history/brand-tokens.json` (relocated from `brand/tokens.json` by the PHASE 16.3 Founder brand purge — `brand/` now holds ONLY `brand/official/`) and the token block in `src/app/globals.css` predate the ratified Visual System. They hold **no constitutional authority** for Volume IV surfaces and must not be consumed by the Registry. Preserved as history, never deleted (Constitution 11.4). Filed as **IR-003** in `constitution/interpretations/LEDGER.md`.
