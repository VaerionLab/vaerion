# THE GOVERNANCE EXPLANATION — How the Law Changes and Who Owns What

<!--
DOC-META
id: DOCS-GOVERNANCE-EXPL
title: Governance Explanation
owningSystem: Stage 11 — Documentation Architecture (src/vaerion/docs)
authorityCitations: Implementation Constitution Part XI; Implementation Constitution 11.1; Implementation Constitution 11.2; Implementation Constitution 11.3; Implementation Constitution 11.4; Implementation Constitution 11.6; Implementation Constitution P-5; Implementation Constitution P-1; constitution/INDEX.md; constitution/amendments/LEDGER.md; constitution/interpretations/LEDGER.md; constitution/trace-index/trace-index.md
relatedArtifacts: constitution/INDEX.md; constitution/amendments/LEDGER.md; constitution/interpretations/LEDGER.md; constitution/trace-index/trace-index.md; constitution/CHANGELOG.md; src/vaerion/foundation/stages.ts; src/vaerion/foundation/gate.ts; src/vaerion/foundation/prerequisites.ts
confidence: verified
lastVerified: 2026-09-22
verificationCommand: bun run vaerion:verify-documentation
-->

---

## 1. The Order of Precedence (P-1)

In any conflict: the Bible prevails over the Visual System; the Visual System
prevails over the Implementation Constitution. A lower document is never read
to relax a higher one. Machine form: `src/vaerion/foundation/authority.ts`
(`resolvePrecedence`, `governingDocument`); registered in the trace index as
T-001.

## 2. The Authority Organs (Constitution 11.1; INDEX.md §2a)

The Design Systems Authority owns the Registry, the Snapshot Authority, the
Announcement & Copy Registry, the Trace Index, and the Constitution. Its
decisions are recorded as receipts. The organs and their establishing
amendments:

| Organ | Path | Amendment |
|---|---|---|
| Snapshot Authority | `constitution/snapshot-authority/` | F-002 |
| Announcement & Copy Registry | `constitution/announcement-registry/` | F-003 |
| Registry authority (law) ↔ implementation (execution) | `constitution/registry/` ↔ `src/vaerion/registry/` | F-004 |
| Generated artifact root | `generated/` | F-005 |
| Release record authority | `constitution/releases/` | F-006 |
| Knowledge organ | `constitution/docs/` | Stage 11 execution order |

Foundation Amendments F-001…F-007 are recorded with mandates,
implementations, and citations in `constitution/amendments/LEDGER.md`.

## 3. The Two Instruments of Evolution (11.2)

1. **Interpretation request** — asks how existing law applies to a new case.
   The Authority answers with a citation; the answer enters the Trace Index.
   Filed in `constitution/interpretations/LEDGER.md`. Current open requests:
   IR-001, IR-003…IR-019 (IR-002 is RATIFIED — the Founder's Stage 9 order
   is its ruling instrument).
2. **Amendment proposal** — seeks to change law. Must name the Article
   affected, the necessity, and the migration plan; ratified only after
   review against **every** prior Article (11.3 — a change legal under one
   Article but corrosive to another must not pass).

## 4. What Ratification Updates (11.3)

The affected constitutional document(s), the registries, the Snapshot
Authority, the Trace Index, and the changelog —
`constitution/CHANGELOG.md` — which is versioned like a protocol (current:
[1.6.0], Volume IV · Stage 10).

## 5. Deprecation, Removal, and Historical Truth (11.4)

Deprecated behavior renders identically to its successor during the window;
removal occurs at major ratification only. Removal of any receipt, manifest,
or export verification path is prohibited — **historical truth is never
retired, only frozen**. This is why the pre-ratification site
(`src/components/site/`), the pre-ratification brand artifacts, and the
product-engineering constitution (`docs/constitution/`) are preserved
untouched (IR-003; INDEX.md §4 — they hold no authority and are never
consumed by the Registry).

## 6. Violation Detection (11.6)

Three instruments: (1) the automated gates of Part IX — twelve stage
verifiers plus the Stage 9 engines, executed by the pipeline; (2) the Trace
Index audit — sampled decisions traced to citations; an uncitable decision is
a violation by definition (P-4); (3) registry conformance scanning for
literal values. **A detected violation blocks release** (10.1 — no waivers,
no conditional ships). Every refusal in the implementation terminates in
`ConstitutionalViolationError` (`src/vaerion/foundation/authority.ts` — the
single authority class; no duplicates exist).

## 7. The Stage Gate (F-007)

Every stage declares `dependsOn`, `constitutionalPrerequisites`, and
`completionConditions` in `src/vaerion/foundation/stages.ts`; the prerequisite
registry with its proof obligations lives in
`src/vaerion/foundation/prerequisites.ts`; the gate engine
(`src/vaerion/foundation/gate.ts`) provides `evaluateStageGate`,
`assertStageMayBegin`, `assertNoSkippedStages`, and
`assertDependencyGraphIntegrity`. `bun run vaerion:stages` prints the graph,
the proofs, and the per-stage gates. Skipping stages is structurally
impossible — order enforcement is independent of the `dependsOn` fields, so
it cannot be re-introduced by editing them.

## 8. The Standing Test (11.7)

Governance periodically re-runs the ratification identity test: cover the
logo, strip the color, ask what moved and why. If the answer is no longer
*"every claim here carries proof, or admits it has none,"* the system has
drifted — and the drift is a constitutional matter, not a stylistic one.
