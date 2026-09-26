# VAERION PIPELINE — Build, Gate, Release Architecture

**Status:** architecture ratified (Stage 1); stages implemented from Stage 2 onward.
**Authority:** Implementation Constitution Part II (token pipeline), Part IX (testing), Part X (release), Volume IV directive Stages 8–9.

## 1. Prime Properties

1. **Deterministic** — identical inputs produce identical artifacts (Volume IV "Engineering Standards").
2. **Constitutional** — every stage's failure semantics are fixed by law; no waivers exist (Constitution 10.1).
3. **Ordered** — stage execution enforces the Volume IV build order
   mechanically via the F-007 dependency graph (`foundation/stages.ts` +
   `foundation/prerequisites.ts` + `foundation/gate.ts` →
   `assertStageMayBegin`, with mechanical proofs from
   `foundation/verification.ts`).

## 2. Stage Graph (fixed; extension requires amendment)

```
[1] registry-compile      Registry -> canonical token set
      fails on: missing citation | off-scale value | contrast failure | grayscale failure   (Constitution 2.6)
[2] binding-generate      token set -> per-platform generated bindings
      fails on: non-reproducible regeneration | hand-authored binding detected               (Constitution 2.7)
[3] static-conformance    implementation scan
      fails on: literal visual value | uncitable artifact | vocabulary violation             (Constitution 1.3, P-4, 4.7)
[4] constitutional-gates  the eleven gates of Part IX
      Token / Visual / Accessibility / Motion / Print / Performance /
      State / Receipt / Chain / Export / Lens  + Snapshot Authority + Parity Harness         (Constitution Part IX)
[5] release-receipt       receipt issuance for the release
      fails on: any gate not demonstrated on the exact shipped artifact                      (Constitution 10.1–10.3)
```

Any failure blocks the pipeline. Partial passes and conditional ships are
prohibited (Constitution 10.1: "No partial passes, no conditional ships, no
waivers").

## 3. Snapshot Authority (Constitution 9.3; implementation necessity P-6)

The ratified canonical rendering set that defines "visually identical" for the
fidelity standard: every surface × state × density × theme (both rooms) ×
breakpoint. Visual Gate compares against it; divergence without an amendment
is failure. Established in Stage 8.

## 4. Parity Harness (Constitution 9.12; Bible §16)

CLI, API, and UI must render the same record equivalently. The harness is a
standing gate from Stage 8 onward.

## 5. Release Receipts (Constitution 10.3; Bible Art. III)

Every release issues a receipt naming the build engine and rule set that
verified it. A release whose receipt cannot be produced does not ship.
Rollbacks are recorded as superseding receipts; the release chain is
append-only (Constitution 10.4).

## 6. Command Surface (contract; wired as stages implement it)

| Command | Stage | Effect |
|---|---|---|
| `vaerion:stages` | 1 (operational) | prints stage manifest and current work front; evaluates the F-007 dependency-graph gate for every stage with mechanical prerequisite proofs |
| `vaerion:verify-constitution` | 1 (operational) | recomputes SHA-256 of each pinned canonical document against the Snapshot Authority manifest; fails closed on divergence (F-001/F-002) |
| `vaerion:compile-registry` | 2 (operational) | validates the Registry, emits generated bindings, proves byte-identical reproducibility and committed drift |
| `vaerion:verify-primitives` | 3 (operational) | primitive conformance: anatomy order, token usage, citations, forbidden behavior |
| `vaerion:verify-state` | 5 (operational) | the twelve state gates (Part V) |
| `vaerion:verify-interaction` | 6 (operational) | the fifteen interaction gates (Part VI) |
| `vaerion:verify-rendering` | 7 (operational) | the fourteen rendering gates (Part VII) |
| `vaerion:verify-authorities` | 8 (operational) | the sixteen data gates (Part VIII) |
| `vaerion:verify-snapshots` | 9 (operational) | Snapshot Authority engine: capture/pin, integrity, comparison, manifest drift — fail closed (9.3; F-002) |
| `vaerion:verify-parity` | 9 (operational) | Parity Harness (seven targets × six invariants), breakpoint parity, visual regression areas (9.12; 9.3; 9.8) |
| `vaerion:verify-accessibility` | 9 (operational) | accessibility gates with surface/primitive/rule/citation findings (9.4; 9.5; 6.11) |
| `vaerion:verify-performance` | 9 (operational) | performance gates: ratified bounds enforced, unratified measured and reported (9.9; 6.12; IR-014) |
| `vaerion:verify-security` | 9 (operational) | the eight refusal proofs, all ConstitutionalViolationError (order Deliverable 8) |
| `vaerion:test-all` | 9 (operational) | the complete test pipeline — all eight engines; emits the aggregate evidence record |
| `vaerion:verify-build` | 10 (operational) | build determinism — double build over the real tree, drift fails (Deliverable 3) |
| `vaerion:verify-signatures` | 10 (operational) | signature binding, determinism, tamper detection, anonymous-key refusal (Deliverable 2) |
| `vaerion:verify-artifacts` | 10 (operational) | artifact intelligence — nothing anonymous (Deliverable 4) |
| `vaerion:verify-distribution` | 10 (operational) | the eight channels, constitutional identity, honest delivery refusal (Deliverable 7) |
| `vaerion:verify-rollback` | 10 (operational) | the supersession law on a live demonstration ledger (Deliverable 6) |
| `vaerion:verify-release` | 10 (operational) | the full graph + Article Gate (Deliverable 5) |
| `vaerion:verify-trust` | 10 (operational) | portable standalone verification of the stored release record (Deliverable 8) |
| `vaerion:verify-everything` | 10 (operational) | the aggregate release gate — all seven gates (Deliverable 10) |
| `vaerion:release` | 10 (operational) | executes the full graph; issues the seven-receipt ceremony; records under constitution/releases/ (F-006); idempotent by release identity |
| `vaerion:observatory` | 10 (operational) | generates the Release Observatory from the real release record (Deliverable 9; served at /api/release/observatory — IR-018) |
| `vaerion:publish-docs` | 11 (operational) | generates the five published documentation artifacts into src/vaerion/docs/generated/ — trace-index publication, registry / stages / API docs, knowledge base (Deliverable 7; F-005 discipline; never hand-edited) |
| `vaerion:verify-documentation` | 11 (operational) | the knowledge-organ gate: DOC-META law, citation resolution, stage-reference validity, architecture claims vs live derivation, symbol existence, command existence, and regeneration byte-comparison of the published artifacts — fail closed (Deliverable 7; stage11 evidence records) |

Every Stage 9, Stage 10, and Stage 11 command emits an evidence record under
`artifacts/` in the ordered output form: PASS/FAIL · Evidence · Citation ·
Artifact location · Timestamp · Integrity hash (SHA-256 over the canonical
record body; Stage 10 records carry the `stage10-` id prefix, Stage 11 the
`stage11-` prefix). The snapshot
working set lives under `snapshots/` (pipeline artifacts, pending
canon ratification — IR-015).

Commands are deterministic tooling, not product code; IR-002 is RATIFIED
(Founder's Stage 9 execution order) — the gates are conformance tooling, the
machinery that enforces law.
