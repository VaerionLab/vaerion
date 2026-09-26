# THE TESTING MODEL — The Machine That Proves Vaerion Is Still Vaerion

<!--
DOC-META
id: DOCS-TESTING
title: Testing Model
owningSystem: Stage 11 — Documentation Architecture (src/vaerion/docs)
authorityCitations: Implementation Constitution Part IX; Implementation Constitution 9.1; Implementation Constitution 9.2; Implementation Constitution 9.3; Implementation Constitution 9.4; Implementation Constitution 9.9; Implementation Constitution 9.12; Implementation Constitution 10.1; Implementation Constitution P-6; IR-002 (RATIFIED); IR-014; IR-015; IR-016; Stage 9 execution order Deliverables 1-10
relatedArtifacts: src/vaerion/testing/; tools/vaerion-pipeline/verify-all.ts; tools/vaerion-pipeline/record.ts; tools/vaerion-pipeline/snapshots/; tools/vaerion-pipeline/artifacts/; src/vaerion/docs/reports/STAGE-9-TESTING-INFRASTRUCTURE-CONFORMANCE.md
confidence: verified
lastVerified: 2026-09-22
verificationCommand: bun run vaerion:verify-documentation
-->

---

## 1. What the Gates Are (IR-002, RATIFIED)

The Part IX gates are **conformance tooling** — deterministic verification
machinery, the instrument that enforces law, analogous to a compiler or
linter — never product test code. Recorded RATIFIED in
`constitution/interpretations/LEDGER.md`; the stage-gate proof
`IR-002-RATIFIED` passes mechanically.

## 2. The Law of the Gates (9.1)

Every check is mechanical, binary, and cited. A check that cannot name its
rule cannot gate. No gate may be waived; partial passes are failures
(10.1). Every pipeline command emits an evidence record under
`tools/vaerion-pipeline/artifacts/` in the ordered form: PASS/FAIL ·
Evidence · Citation · Artifact location · Timestamp · Integrity hash
(SHA-256 over the canonical record body) — written by
`tools/vaerion-pipeline/record.ts`.

## 3. The Eight Engines (Stage 9, Deliverables 1–8)

| Engine | Root | What it proves |
|---|---|---|
| Snapshot Authority | `src/vaerion/testing/snapshot/` | immutable frozen records; SHA-256 identity over content + citations; digest-first comparison; fail-closed drift; supersession-only canon evolution; **no approval API exists** (9.3; F-002) |
| Parity Harness | `src/vaerion/testing/parity.ts` | seven targets × six invariants + breakpoint parity (9.12; 9.8) |
| Visual Regression | `src/vaerion/testing/visual/` | eight ordered areas — meaning-based structure, never pixels; no manual drift approval (9.2; 9.10) |
| Accessibility | `src/vaerion/testing/accessibility.ts` | keyboard, focus, announcements with both-way registry parity, ARIA, AA + AAA contrast, the three dichromacy simulations executed and recorded (Machado et al. 2009), forced-colors, reduced motion (9.4; 9.5) |
| Interaction | `src/vaerion/testing/interaction.ts` | the nine Stage 6 contract areas + registry exclusivity proven by refusal (Part VI) |
| State & Authority | `src/vaerion/testing/state-authority.ts` | 12 state gates + 16 authority gates; illegal-transition, quarantine, verdict-ownership, chain, manifest-tamper, export proofs (Parts V, VIII) |
| Performance | `src/vaerion/testing/performance.ts` | six measurements; ONLY ratified bounds enforced (100 ms / 300 ms / 6 s / 400 ms / 10 s / 5 s); unratified budgets reported with "pin requested (IR-014)" — nothing enforced against an invented number (9.9; Art. XI) |
| Security & Honesty | `src/vaerion/testing/security.ts` | eight refusal proofs, each terminating in `ConstitutionalViolationError` (1.6; Part VIII) |

## 4. The Aggregate

`bun run vaerion:test-all` runs all eight engines — **8/8 PASS** at Stage 9
conformance and re-proven at every subsequent stage (the Stage 10 report
records the full regression battery). The individual commands:
`vaerion:verify-snapshots`, `vaerion:verify-parity`,
`vaerion:verify-accessibility`, `vaerion:verify-performance`,
`vaerion:verify-security` (plus the standing Stage 2–8 gates
`vaerion:verify-primitives`, `vaerion:verify-state`,
`vaerion:verify-interaction`, `vaerion:verify-rendering`,
`vaerion:verify-authorities`, `vaerion:compile-registry`,
`vaerion:verify-constitution`).

## 5. The Fidelity Canon (IR-015)

The working capture set (`tools/vaerion-pipeline/snapshots/`,
`working-captures-v1`) is a pipeline artifact pending the Founder's ruling
that promotes it into `constitution/snapshot-authority/snapshots/`. Until
then, visual regression runs in record-and-prove-integrity mode:
digest-first, fail-closed, no approval path — honestly labeled.

## 6. Honest Limitations (from the Stage 9 report)

- Five performance budgets are unratified (IR-014) — measured and reported,
  never enforced against an invented number.
- Dichromacy simulation values are recorded, not enforced (IR-016) — the
  enforced requirement is the ratified structural one (never color alone;
  shape + word + position).
- The parity harness proves structural and law-level equivalence across the
  seven targets; pixel-level appearance on real devices is not snapshotted
  (and must not be matched without meaning).

## 7. Measured Results of Record

From the Stage 9 conformance report (evidence records on disk):
verify-primitives 22,853 checks · verify-state 117 · verify-interaction 175
· verify-rendering 1,310 · verify-authorities 131 · verify-snapshots
(capture + 7 integrity + 7 comparison + manifest drift) ·
verify-accessibility 0 findings, 24 dichromacy values recorded ·
verify-performance 6 bindings + 6 measurements · verify-security 8/8 ·
test-all 8/8.
