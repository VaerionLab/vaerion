# IMPLEMENTATION DOCUMENTATION — generated from the stage manifest

Generated from `src/vaerion/foundation/stages.ts` by
`tools/vaerion-pipeline/publish-documentation.ts`. Never hand-edited; drift
fails `bun run vaerion:verify-documentation` (Constitution 9.1).

| stage | name | root | dependsOn | status |
|---|---|---|---|---|
| 1 | Foundation | src/vaerion/foundation | — | conformant |
| 2 | Registry System | src/vaerion/registry | 1 | conformant |
| 3 | Primitive System | src/vaerion/primitives | 2 | conformant |
| 4 | Composition Architecture | src/vaerion/rendering | 3 | conformant |
| 5 | State Architecture | src/vaerion/state | 4 | conformant |
| 6 | Interaction Architecture | src/vaerion/interaction | 5 | conformant |
| 7 | Rendering Engine | src/vaerion/rendering | 6 | conformant |
| 8 | Data Authorities | src/vaerion/authorities | 7 | conformant |
| 9 | Testing Infrastructure | src/vaerion/testing | 8 | conformant |
| 10 | Release Engine | src/vaerion/release | 9 | conformant |
| 11 | Documentation | src/vaerion/docs | 10 | conformant |

## Stage 1 — Foundation (conformant)

Purpose: Repository architecture, constitutional directory structure, governance folders, build/documentation pipeline architecture, registry architecture, tooling architecture. Nothing visual is built.

Completion conditions:
- authority tree complete: all three ratified documents transcribed and digest-pinned (F-001, DP-1, DP-2)
- authority organs established: Snapshot Authority (F-002), Announcement & Copy Registry (F-003), Registry authority separation (F-004), generated artifact root (F-005), release record authority (F-006)
- stage dependency graph operational with mechanical enforcement (F-007)
- governance ledgers current (amendments, interpretations, trace index, changelog)
- foundation conformance report issued with citations for every amendment

## Stage 2 — Registry System (conformant)

Purpose: Implement the canonical Registry: seven sub-registries, token anatomy, lifecycle, validation, versioning, compiler, generated bindings.

Completion conditions:
- seven sub-registries implemented with the seven-field token anatomy (Constitution 2.2)
- validation passes mechanically: scale membership, contrast, grayscale survival, citation presence (Constitution 2.6)
- compiler emits reproducible generated bindings exclusively under generated/ (Constitution 2.7; F-005)
- lifecycle transitions follow the lawful status graph (Constitution 2.5, 2.9)
- values compiled only from the ratified Visual System text (Constitution 2.1; VS §4.7)

## Stage 3 — Primitive System (conformant)

Purpose: Implement every constitutional primitive under its Responsibility / Boundaries / Extension / Composition contract.

Completion conditions:
- every primitive implements its Responsibility / Boundaries / Extension / Composition contract (Constitution Part III)
- per-primitive conformance metadata carries citations (P-4)
- no primitive renders a value outside registry bindings (Constitution 1.3)

## Stage 4 — Composition Architecture (conformant)

Purpose: Compose primitives into the canonical Vaerion surfaces: exactly three skeletons, the ten registered surfaces, composition rules (Part IV), and the responsive contract — per the Founder directive series recorded in constitution/amendments/LEDGER.md.

Completion conditions:
- exactly three skeletons exist; no fourth layout pattern (Constitution 4.1; VS §1.4)
- chrome authored once and inherited everywhere (Constitution 4.3)
- every registered surface mounted per its 4.6 binding with Criteria Bar ownership (4.4) and chain continuity (4.5)
- no surface invents language — copy consumed by identifier (Constitution 4.7; 6.11; F-003)
- demo quarantine on all pre-authority records; exports disabled (Constitution 5.10; 8.7)
- responsive evolution per VS §9 — honest degradation, never scaling-only (Constitution 7.5)

## Stage 5 — State Architecture (conformant)

Purpose: The constitutional state engine per Part V: the canonical State Matrix (twelve states), ownership, propagation, inheritance, transitions, cancellation, recovery, offline, demo quarantine, restricted evidence, pending verification, honesty enforcement.

Completion conditions:
- the twelve canonical states exist as immutable definitions; no other state renders; no aliases are coined (Constitution 5.1–5.2)
- verdict-domain states enter only from the Verification Authority — no surface, primitive, or interaction produces, predicts, or optimistically renders one (5.3; 1.6; Art. VIII)
- ownership follows 5.4 and propagation follows 5.5: authority → surface → primitive, one direction; no sibling mutation; no primitive owns state
- inheritance honors explicitly attested overrides and never masks evidence-level restriction (5.6)
- the lawful transition set of 5.7 is enforced mechanically; every unlisted transition is rejected with a ConstitutionalViolationError
- cancellation restores the pre-act state exactly, issues a Return, and is refused once an act has reached an authority (5.8)
- recovery revalidates chain integrity before live resumption; a gap renders as a break until reconciled (5.9; 3.4)
- demo state may not co-mingle with production data in any store, stream, or export (5.10)
- the twelve state gates (transition, ownership, propagation, inheritance, recovery, cancellation, honesty, verdict authority, chain integrity, demo quarantine, restricted evidence, offline recovery) pass mechanically

## Stage 6 — Interaction Architecture (conformant)

Purpose: The interaction engine per Part VI: Command Registry (Caliper verb grammar), keyboard/pointer/gesture/focus ownership, intent declaration, confirmation ladder, hold-to-affirm, undo, receipts and Returns, latency contracts, announcements bound to the Announcement & Copy Registry, Lens interaction.

Completion conditions:
- command registry implements the registered verbs go/get/verify/attest with hash-first routing (VS §5 Caliper)
- every interactive element binds to a registered command; free-form handlers are prohibited (6.1)
- friction ladder enforced per action class, including hold-to-affirm and receipt-id destruction (6.2–6.3; VS §13.1)
- every completed act resolves to a receipt or a Return; every failed act to a Failure Receipt; nothing terminates silently (6.5)
- every rendered or announced string is consumed from the Announcement & Copy Registry — none invented at render time (Constitution 6.11; F-003)
- latency contracts hold: <100 ms acknowledgment, 300 ms Gauge delay, 6 s Returns (6.12; VS §10)
- keyboard, pointer, gesture, and focus ownership hold (6.7–6.10); constitutional keys are owned centrally and never shadowed
- Proof Lens obeys ACL and motion law on every claim surface (Bible Art. XII; VS §12)
- the fifteen interaction gates pass mechanically

## Stage 7 — Rendering Engine (conformant)

Purpose: Surface hierarchy, layer system, measurement, responsive evolution, print, grayscale, forced-colors, reduced motion, export rendering. (Re-slotted from 5 to 7 by the directive series; the work front is preserved — Part VII remains law.)

Completion conditions:
- layer ordinals ground.0–lens.6 enforced; shadows and glass impossible (VS §3.4)
- all three page skeletons render per registration (VS §1.4)
- print, grayscale, forced-colors, reduced-motion, and export targets render every surface truthfully (VS §11)
- responsive evolution follows the registered honest-degradation contract (VS §9)

## Stage 8 — Data Authorities (conformant)

Purpose: Verification, Chain, Ledger, Evidence, Rule, Identity, Export Authorities; every lifecycle of Constitution Part VIII.

Completion conditions:
- seven named authorities own their data domains exclusively (Constitution Part VIII)
- receipts are immutable; corrections append new receipts (Bible Art. VI)
- verification pins engine version and rule set at verification time (Bible Art. III)
- all lifecycles (receipt, evidence, verification, rule, chain, investigation, export, manifest, identity) implemented as declared

## Stage 9 — Testing Infrastructure (conformant)

Purpose: Every constitutional gate as a mechanical conformance check; Snapshot Authority; Parity Harness. No stage proceeds while any gate fails.

Completion conditions:
- every gate of Part IX is a mechanical pass/fail check with citations (Constitution 9.1)
- Snapshot Authority infrastructure captures and compares against the ratified canon (Constitution 9.3; F-002)
- Parity Harness proves CLI/API/UI record equivalence (Constitution 9.12)
- no gate may be waived; partial passes are failures (Constitution 10.1)

## Stage 10 — Release Engine (conformant)

Purpose: Release receipts, release gates, rollback chain, version declaration, conformance verification. Every release produces its own constitutional receipt.

Completion conditions:
- every release issues a receipt naming engine version, rule set, environment, and demonstrated gates (Constitution 10.3; Bible Art. III)
- the release chain is append-only; rollbacks issue superseding receipts (Constitution 10.4)
- receipts are recorded under constitution/releases/ (F-006); build outputs never are
- a release whose gates cannot be demonstrated does not ship (Constitution 10.1–10.2)

## Stage 11 — Documentation (conformant)

Purpose: Documentation generated from the Constitution: trace index publication, registry docs, implementation docs, API docs. Documentation must never drift from implementation.

Completion conditions:
- documentation is generated from constitutional sources, never hand-edited (Stage 10 contract)
- the Constitutional Trace Index is published and drift-enforced (Constitution P-4)
- dual naming appears in all generated documentation (VS §0)
- generated documentation differing from committed output fails the build (Constitution 9.1)
