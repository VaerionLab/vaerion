# STAGE DEPENDENCY GRAPH — Documentation

**Status:** operational (Foundation Amendment **F-007**; re-sequenced per the
Founder directive "VOLUME IV CONTINUES" recorded in
`constitution/amendments/LEDGER.md`).
**Authority:** Volume IV directive, "Amendment F-007 — Stage Dependency
Graph"; Volume IV directive, "BUILD ORDER"; the Stage 2–4 and Stage 5/6
directive-series notes; Implementation Constitution P-4, Part X.
**Manifest of record:** `src/vaerion/foundation/stages.ts` (declarations) +
`src/vaerion/foundation/prerequisites.ts` (prerequisite registry) +
`src/vaerion/foundation/gate.ts` (evaluation engine).

> **Sync law.** The executable manifest is authoritative; this document is its
> documented rendering. Until the Stage 10(11) documentation pipeline generates
> documents mechanically, any change to the manifest must update this document
> in the same change set — drift between them is a conformance failure
> (Constitution 9.1, P-4) and is checked by the F-007 structural proof.
> **Change record:** this rendering was re-synced with the Stage 5/6 directive
> series (Stage 5 = State Architecture, Stage 6 = Interaction Architecture,
> Rendering Engine preserved at 7; eleven stages), which also repaired the
> earlier drift where this document still described the Stage 1 plan
> (stage 4 = "State Engine") instead of the ratified Stage 2–4 amendment
> (stage 4 = Composition Architecture).

---

## 1. Declarations (Amendment F-007)

Every stage explicitly declares:

1. **Required predecessor stages** — `dependsOn` (strictly linear, per the
   Volume IV build order as re-sequenced by the directive series).
2. **Constitutional prerequisites** — ids resolved against the Prerequisite
   Registry (`foundation/prerequisites.ts`), each with its own citations and a
   mechanical proof obligation.
3. **Completion conditions** — the declared conditions under which the stage
   may be marked conformant (verified by stage completion reports today and by
   the Part IX gates from Stage 8(9)).

## 2. The Graph

```
[1 Foundation] ──► [2 Registry System] ──► [3 Primitive System] ──► [4 Composition Architecture]
                                                                        │
     ┌──────────────────────────────────────────────────────────────────┘
     ▼
[5 State Architecture] ──► [6 Interaction Architecture] ──► [7 Rendering Engine]
                                                                 │
     ┌───────────────────────────────────────────────────────────┘
     ▼
[8 Data Authorities] ──► [9 Testing Infrastructure] ──► [10 Release Engine] ──► [11 Documentation]
```

Edges (from → to): 1→2, 2→3, 3→4, 4→5, 5→6, 6→7, 7→8, 8→9, 9→10, 10→11.

| Stage | Required predecessors | Constitutional prerequisites | Completion conditions (declared) |
|---|---|---|---|
| 1 Foundation | — (entry) | — | authority tree complete and digest-pinned (F-001/DP-1/DP-2); authority organs established (F-002…F-006); dependency graph operational (F-007); governance ledgers current; conformance report issued |
| 2 Registry System | 1 | DP-1, DP-2, F-001, F-002, F-003, F-004, F-005, F-006, F-007 | seven registries with seven-field anatomy; mechanical validation (scale/contrast/grayscale/citations); reproducible generated bindings under `generated/`; lawful lifecycle; values compiled only from the ratified Visual System text |
| 3 Primitive System | 2 | — | every primitive under its Responsibility/Boundaries/Extension/Composition contract; conformance metadata cited; no value outside registry bindings |
| 4 Composition Architecture | 3 | — | exactly three skeletons; chrome authored once; every registered surface mounted per its 4.6 binding; no invented language; demo quarantine; responsive honest degradation |
| 5 State Architecture | 4 | — | twelve canonical states as immutable definitions; verdict boundary enforced; ownership/propagation/inheritance per 5.4–5.6; fixed transition set mechanically enforced; exact-restore cancellation; recovery revalidates integrity; demo quarantine; the twelve state gates pass |
| 6 Interaction Architecture | 5 | AUTH-ANNOUNCEMENT | registered verbs with hash-first routing; free-form handlers prohibited; friction ladder enforced; every act resolves to receipt/Return/Failure Receipt; strings consumed from the Announcement & Copy Registry (6.11); latency contracts hold; keyboard/pointer/gesture/focus ownership; Lens obeys ACL and motion law; the fifteen interaction gates pass |
| 7 Rendering Engine | 6 | — | layer ordinals enforced (no shadows/glass); three skeletons; print/grayscale/forced-colors/reduced-motion/export truthful; honest responsive degradation |
| 8 Data Authorities | 7 | — | seven authorities own their domains; receipts immutable; verification pins engine version and rule set; all lifecycles implemented |
| 9 Testing Infrastructure | 8 | AUTH-SNAPSHOT, IR-002-RATIFIED | every gate mechanical pass/fail; Snapshot Authority captures/compares canon; Parity Harness standing; no waivers |
| 10 Release Engine | 9 | AUTH-RELEASE | every release issues a receipt naming verifier; append-only chain; receipts under `constitution/releases/`; unproven releases do not ship |
| 11 Documentation | 10 | DP-1 | docs generated from constitutional sources; Trace Index published and drift-enforced; dual naming; drift fails the build |

## 3. Prerequisite Registry (proof obligations)

| Id | Prerequisite | Proof kind | Mechanical proof |
|---|---|---|---|
| DP-1 | Design Bible transcribed and pinned | document-transcription | SHA-256 + byte size match the Snapshot Authority pin; transcription record present |
| DP-2 | Visual System transcribed and pinned | document-transcription | same |
| F-001 | Canonical authority completion | document-transcription | both documents pinned; INDEX records DP-1/DP-2 |
| F-002 | Snapshot Authority established | authority-structure | README + `snapshots/` + `manifests/` present; manifest parses with exactly three pins |
| F-003 | Announcement & Copy Registry authority | authority-structure | authority README present with governing content |
| F-004 | Registry authority separation | authority-structure | `constitution/registry/` law + `src/vaerion/registry/` implementation both present; implementation references the law |
| F-005 | Generated artifact root | authority-structure | `generated/README.md` + `bindings/` + `tokens/` present |
| F-006 | Release record authority | authority-structure | `constitution/releases/README.md` present |
| F-007 | Dependency graph operational | structural | `assertDependencyGraphIntegrity()` passes; this document exists |
| AUTH-ANNOUNCEMENT | standing evidence | authority-structure | F-003 evidence |
| AUTH-SNAPSHOT | standing evidence | authority-structure | F-002 evidence |
| AUTH-RELEASE | standing evidence | authority-structure | F-006 evidence |
| IR-002-RATIFIED | gate-implementation interpretation ratified | governance-status | interpretation ledger records IR-002 as RATIFIED (currently PROPOSED — fails until ruled) |

## 4. Enforcement Mechanics

- `assertStageMayBegin(id, resolve)` — evaluates the full gate and **throws
  `ConstitutionalViolationError`** when any check fails. A stage whose
  prerequisites are unmet terminates immediately (Amendment F-007).
- `evaluateStageGate(id, resolve)` — the non-throwing report used by tooling.
- `assertNoSkippedStages(id)` — independent of `dependsOn`: every stage
  preceding the target in the canonical order must be conformant, so **no edit
  of the manifest can open a skip path**. Skipping stages is structurally
  impossible.
- `assertDependencyGraphIntegrity()` — the graph is acyclic and strictly
  forward; prerequisites are declared; every stage declares completion
  conditions and citations. Cycles and backward edges are violations.
- Graph shape changes (reordering, extra edges, stage addition/removal)
  require a constitutional amendment (Constitution 11.2–11.3); the integrity
  assertions reject them mechanically until the law changes. The Stage 5/6
  re-sequencing was recorded as a directive-series note in the amendments
  ledger before the manifest was edited.

Commands (deterministic tooling; see `tools/vaerion-pipeline/README.md`):

- `bun run vaerion:stages` — prints the graph, live prerequisite proofs, and
  the gate evaluation for every stage.
- `bun run vaerion:verify-constitution` — proves the canonical documents
  against their pinned digests (F-001/F-002).
- `bun run vaerion:verify-state` — the twelve state gates (Stage 5).
- `bun run vaerion:verify-interaction` — the fifteen interaction gates (Stage 6).

## 5. Standing Unmet Prerequisites (honest record)

- **IR-002-RATIFIED** is intentionally unmet: the interpretation request that
  authorizes implementing the Part IX gates as conformance tooling is
  `PROPOSED` awaiting Founder ruling. Stage 9's gate therefore reads FAIL
  today. This is the silence rule working as designed (Constitution P-5) — the
  system declares what it is waiting for instead of improvising.
- All other declared prerequisites are currently satisfied and proven
  mechanically (`bun run vaerion:stages` for the live record).
