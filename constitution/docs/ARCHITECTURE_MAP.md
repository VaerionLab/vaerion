# THE ARCHITECTURE MAP — Where Everything Is and Why

<!--
DOC-META
id: DOCS-ARCH-MAP
title: The Architecture Map
owningSystem: Stage 11 — Documentation Architecture (src/vaerion/docs)
authorityCitations: Implementation Constitution P-4; Implementation Constitution P-1; Implementation Constitution 2.1; Implementation Constitution 2.7; Implementation Constitution 8.0; Bible Art. XI; Foundation Amendment F-002; Foundation Amendment F-004; Foundation Amendment F-005; Foundation Amendment F-006; Visual System §0; Visual System §1.4
relatedArtifacts: constitution/INDEX.md; src/vaerion/; src/vaerion/foundation/paths.ts; src/vaerion/foundation/stages.ts; generated/; tools/vaerion-pipeline/; constitution/trace-index/trace-index.md; src/vaerion/docs/DEPENDENCY_GRAPH.md
confidence: verified
lastVerified: 2026-09-22
verificationCommand: bun run vaerion:verify-documentation
-->

The Architecture Map states where every part of Vaerion lives. Every path in
this document is real and mechanically checked by
`bun run vaerion:verify-documentation`; a path that stops existing fails the
gate (Bible Art. XI — nothing unmeasured ships).

---

## 1. The Five Realms

The repository has exactly five realms. Each realm has one owner class and
one law of change (Implementation Constitution P-1 — precedence; 11.1 —
ownership).

| Realm | Root | What it is | Law of change |
|---|---|---|---|
| **Constitutional authority** | `constitution/` | the ratified documents, the governance ledgers, and the authority organs | changed only through the amendment pathway (Constitution 11.2–11.3) |
| **Implementation** | `src/vaerion/` | the executable law — registry, primitives, state, interaction, rendering, authorities, testing, release, docs | every artifact citation-traced (P-4); conformance is binary (P-3) |
| **Pipeline tooling** | `tools/vaerion-pipeline/` | the gate runners, the ceremony, the observatory generator | conformance tooling per IR-002 (RATIFIED) — never product test code |
| **Generated bindings** | `generated/` | compiler output of the canonical Registry — CSS, TypeScript, JSON | never hand-authored (F-005; Constitution 2.7); drift = failure |
| **The pre-existing engine** | `packages/vaerion/` | the product runtime from prior phases — event spine, journal, broker, gateway, agents, CLI (`packages/vaerion/src/`) | governed by the product-engineering constitution (`docs/constitution/`), preserved untouched (Constitution 11.4; IR-003) |

## 2. The Constitutional Authority Tree

Governed by `constitution/INDEX.md` (the Authority Registry). The organs:

| Organ | Path | Established by |
|---|---|---|
| The three ratified documents | `constitution/bible/`, `constitution/visual-system/`, `constitution/implementation-constitution/` | DP-1 / DP-2 under F-001; digests pinned |
| Snapshot Authority | `constitution/snapshot-authority/` | F-002 |
| Announcement & Copy Registry | `constitution/announcement-registry/` | F-003 |
| Registry authority (law) | `constitution/registry/` | F-004 |
| Release record authority | `constitution/releases/` | F-006 |
| **Knowledge organ (this stage)** | `constitution/docs/` | Stage 11 execution order (Deliverables 1–5); directive note in `constitution/amendments/LEDGER.md` |

Governance ledgers: `constitution/amendments/LEDGER.md` (F-001…F-007),
`constitution/interpretations/LEDGER.md` (IR-001…IR-021; IR-002 RATIFIED),
`constitution/trace-index/trace-index.md` (T-001…T-080),
`constitution/CHANGELOG.md` (protocol-versioned; current 1.8.0).

**Precedence (P-1):** VAERION_DESIGN_BIBLE_v1.0 >
VAERION_VISUAL_SYSTEM_v1.0.1 > VAERION_IMPLEMENTATION_CONSTITUTION_v1.0.
The knowledge organ holds no authority over any of them.

## 3. The Implementation Tree — Stage by Stage

The build order is the stage manifest `src/vaerion/foundation/stages.ts`
(11 stages; the directive series re-sequenced State to 5 and Interaction to
6, preserving Rendering at 7 — recorded in the amendments ledger). The
canonical path map is `src/vaerion/foundation/paths.ts`.

| Stage | Name | Root | Status (manifest) |
|---|---|---|---|
| 1 | Foundation | `src/vaerion/foundation/` | conformant |
| 2 | Registry System | `src/vaerion/registry/` | conformant |
| 3 | Primitive System | `src/vaerion/primitives/` | conformant |
| 4 | Composition Architecture | `src/vaerion/rendering/` + `src/vaerion/surfaces/` | conformant |
| 5 | State Architecture | `src/vaerion/state/` | conformant |
| 6 | Interaction Architecture | `src/vaerion/interaction/` | conformant |
| 7 | Rendering Engine | `src/vaerion/rendering/` | conformant |
| 8 | Data Authorities | `src/vaerion/authorities/` | conformant |
| 9 | Testing Infrastructure | `src/vaerion/testing/` | conformant |
| 10 | Release Engine | `src/vaerion/release/` | conformant |
| 11 | Documentation | `src/vaerion/docs/` + `constitution/docs/` | conformant |

Stage order is mechanically enforced: `bun run vaerion:stages` evaluates the
F-007 dependency graph; a stage whose prerequisites are unmet terminates
immediately with `ConstitutionalViolationError`
(`src/vaerion/foundation/authority.ts`).

## 4. The Data Flow — How a Value Reaches the Screen

One direction only (Constitution 1.3; 2.7(c); 5.4):

```
ratified law (constitution/…)
  → canonical Registry (src/vaerion/registry, 7 registries, 64 tokens, v1.0.0)
  → deterministic compiler → generated bindings (generated/css, generated/typescript, generated/tokens)
  → primitives (src/vaerion/primitives, 20) consume var(--vx-*) only
  → three skeletons (src/vaerion/rendering/skeletons.tsx) carry ten surfaces (src/vaerion/surfaces/registry.ts)
  → state flows authority → surface → primitive, one direction (src/vaerion/state/context.tsx)
  → verdicts enter only from the Verification Authority (src/vaerion/authorities/verification.ts; Part V 5.3)
```

Nothing renders a value that did not come from the Registry; nothing renders
a verdict that was not received (1.6; Art. III; Art. VIII).

## 5. The Verification Topology

Every realm is covered by a mechanical gate (Constitution 9.1; Part X):

- constitutional digests: `bun run vaerion:verify-constitution` (3/3 pins)
- registry: `bun run vaerion:compile-registry` (validation + reproducibility + drift)
- primitives: `bun run vaerion:verify-primitives`
- state: `bun run vaerion:verify-state` · interaction: `bun run vaerion:verify-interaction`
- rendering: `bun run vaerion:verify-rendering` · authorities: `bun run vaerion:verify-authorities`
- the Stage 9 battery: `bun run vaerion:test-all` (8/8 engines)
- the Release Engine gates: `bun run vaerion:verify-build` … `bun run vaerion:verify-trust`,
  aggregated by `bun run vaerion:verify-everything` (7/7)
- the knowledge organ: `bun run vaerion:verify-documentation` (this stage)

Gate failures emit evidence records under `tools/vaerion-pipeline/artifacts/`
(PASS/FAIL · evidence · citation · artifact · timestamp · SHA-256).

## 6. What Lives Where — Forbidden Dependencies

- The constitution tree never imports from `src/` (law does not depend on its execution — F-004).
- `generated/` is written only by the compiler (`src/vaerion/registry/compiler.ts`); a hand edit is detected (F-005).
- `constitution/releases/` holds receipts only — build outputs never enter it (F-006).
- Primitives never compute verdicts and never own state (1.6; 5.4).
- The pipeline imports the pure cores; the pure cores never import the pipeline.

The full machine-checked statement of the stage graph is
`src/vaerion/docs/DEPENDENCY_GRAPH.md`; the published machine form is
regenerated by `bun run vaerion:verify-documentation`.
