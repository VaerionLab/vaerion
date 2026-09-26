# DOCUMENTATION GOVERNANCE — The Law of the Knowledge Organ

<!--
DOC-META
id: DOCS-GOV
title: Documentation Governance — The Law of the Knowledge Organ
owningSystem: Stage 11 — Documentation Architecture (src/vaerion/docs)
authorityCitations: Implementation Constitution P-4; Implementation Constitution P-5; Implementation Constitution 1.2; Implementation Constitution 9.1; Implementation Constitution 11.1; Implementation Constitution 11.6; Visual System §0; Visual System §2.1; Bible Art. II; Bible Art. VII; Bible Art. XI; Stage 11 execution order Deliverable 5; src/vaerion/docs/README.md (the documentation pipeline contract)
relatedArtifacts: src/vaerion/docs/governance.ts; tools/vaerion-pipeline/verify-documentation.ts; constitution/docs/; constitution/trace-index/trace-index.md
confidence: verified
lastVerified: 2026-09-22
verificationCommand: bun run vaerion:verify-documentation
-->

**Status:** RATIFIED-instrument of the Founder's Stage 11 execution order
(Deliverable 5). This document is the governing law of the knowledge organ
(`constitution/docs/`) and of every page the organ contains. It is
documentation law — it governs how Vaerion's memory is written, verified, and
kept alive. It is not itself one of the three ratified constitutional
documents; where it appears to conflict with them, they prevail
(Implementation Constitution P-1) and the conflict is a conformance failure
of this organ, reported through the interpretation pathway (P-5).

---

## 1. The Prime Law — Documentation Is the Memory of the System

Documentation is the memory of the system. Memory that is wrong is worse than
no memory: it is fabrication. Therefore:

1. **No undocumented system behavior.** A behavior that exists in the
   implementation and is not documented in the knowledge organ is a
   documentation violation (Constitution 11.6 form — a detected violation
   blocks release).
2. **No documentation drift.** A documented statement that no longer matches
   the implementation is a violation, equal in kind to a token drifting from
   the Registry (Constitution P-4; 9.1).
3. **No marketing.** Documentation uses the two voices (Visual System §2.1;
   Bible Art. VII): the Machine Voice for identifiers, hashes, versions,
   counts; the Human Voice for explanation. The Human Voice never restates a
   measurement incorrectly to sound better. Decorative assertions of quality
   are prohibited (Bible Art. II) — a word that asserts without evidence is
   rendered exactly like the unverified claim it is.
4. **Generated documentation is never hand-edited.** The artifacts emitted by
   the documentation pipeline into `src/vaerion/docs/generated/` are produced
   exclusively from constitutional sources (the stage manifest, the canonical
   Registry, the trace index, the release records) — the same discipline as
   the generated bindings (F-005; Constitution 2.7). A hand edit is detected
   by regeneration comparison and fails the gate (Constitution 9.1).

## 2. The Page Metadata Law (Deliverable 5)

Every documentation page in the knowledge organ carries a machine-readable
`DOC-META` header. A page without its header is an undocumented page and is a
violation. The header carries exactly these fields:

| Field | Meaning | Law |
|---|---|---|
| `id` | the page identifier, unique within the organ | the identifier is the citation key other pages use (VS §0 dual naming — identifier and title resolve to the same record) |
| `title` | the human-readable instrument name | the dual-naming pair with `id` (Visual System §0) |
| `owningSystem` | the stage or system that owns the page | every page has exactly one owner (Constitution 11.1 ownership discipline) |
| `authorityCitations` | the constitutional authorities the page derives from | every page is citation-traced (Constitution P-4; Bible Art. XI); an uncitabled page is a violation by definition |
| `relatedArtifacts` | the implementation paths and pipeline commands the page documents | every statement's subject must be reachable (Bible Art. II — evidence or silence) |
| `confidence` | `verified` \| `derived` \| `declared` | see §3 |
| `lastVerified` | ISO date of the last mechanical verification pass | a page that cannot state when it was last proven true cannot be trusted (Constitution 9.1) |
| `verificationCommand` | the gate command that proves the page | verification must be executable, not aspirational (Constitution 9.1) |

The machine model and parser live at `src/vaerion/docs/governance.ts`; the
enforcement lives in `tools/vaerion-pipeline/verify-documentation.ts`
(`bun run vaerion:verify-documentation`).

## 3. The Confidence States

Exactly three confidence states exist. They are closed — no fourth state, no
alias, no softer synonym (Bible Part Three discipline applied to memory):

1. **`verified`** — every factual claim in the page has been checked against
   the implementation by `bun run vaerion:verify-documentation` in its most
   recent run, and the check passed. The `lastVerified` date must match the
   most recent gate run date.
2. **`derived`** — the page is generated from a constitutional source and is
   byte-compared on every gate run; its truth is the truth of its source.
3. **`declared`** — the page records a governance status (a ratified ruling,
   a proposed interpretation request, a preserved historical state) whose
   truth is the act of recording itself; it cites the ledger where the act is
   recorded.

A page marked `verified` whose claims fail the gate is downgraded by
correction, never by removing the claim silently (Constitution 11.4 —
historical truth is never retired; corrections are appended).

## 4. The Search Law (Deliverable 6)

Search over the knowledge organ is **hash-first**. Resolution priority, in
order:

1. **Exact authority references** — a query shaped like a citation
   (`Art. VI`, `§5.7`, `P-4`, `8.1`) resolves to the cited authority and the
   pages that cite it.
2. **Registry identifiers** — a query shaped like a token identifier
   (`space.7`, `color.verdict.verified`, `motion.life.return`) resolves to
   the Registry record and its generated bindings.
3. **Implementation symbols** — a query shaped like a code symbol
   (`ConstitutionalViolationError`, `captureSnapshot`, `SurfaceHost`)
   resolves to the exporting module and its documentation.
4. **Documentation** — free-text over page titles and content, last.

The rationale is Constitutional: identifiers are measurements (Bible Art. VII
— the Machine Voice is canonical), so a query that is a measurement must hit
the measurement, not prose. The index builder is
`src/vaerion/docs/search.ts`; it is generated from the live sources at request
time — it never maintains a second copy of any registry.

## 5. The Verification Pipeline (Deliverable 7)

`bun run vaerion:verify-documentation` is the mechanical proof of the organ.
It proves, and fails closed on:

1. **every documented API exists** — every symbol this organ names as an
   export of `src/vaerion/*` is exported by that module's source;
2. **every citation exists** — every citation this organ carries resolves to
   a real reference in the cited document, a real trace-index entry (T-xxx),
   or a real interpretation request (IR-xxx);
3. **every stage reference is valid** — every stage number, name, and status
   this organ states matches `src/vaerion/foundation/stages.ts`;
4. **every architecture claim matches reality** — every file path exists;
   every countable claim (registries, tokens, primitives, surfaces, states,
   transitions, commands, authorities, receipts, channels, gates) equals the
   value derived live from the implementation;
5. **no outdated claims exist** — every page's DOC-META is present, its
   `relatedArtifacts` exist, its `verificationCommand` is a real script, and
   the generated documentation under `src/vaerion/docs/generated/` is
   byte-identical to a fresh regeneration (drift = failure; Constitution 9.1).

Every failure produces the ordered evidence form: Evidence, Citation,
Integrity hash, Violation record (written under
`tools/vaerion-pipeline/artifacts/` with the `stage11` tag) — the same output
protocol as every standing gate.

## 6. The Knowledge Interface (Deliverable 3)

The 2090 experience layer — the Vaerion Knowledge Interface — renders this
organ. Its law:

1. It renders **only** data served from the real sources (the stage manifest,
   the canonical Registry, the release records, the trace index, this organ).
   No invented metric, no placeholder, no demo value (Bible Art. XI;
   Constitution 1.6).
2. It is **documentation delivery**, not an eleventh product surface: the
   enumerated surface set of Constitution 4.6 holds ten surfaces and is not
   enlarged here. The display path is recorded as **IR-020** in the
   interpretation ledger — the same instrument as the Release Observatory's
   IR-018.
3. It obeys the design law it documents: registry tokens only
   (Constitution 1.3), the two voices (VS §2.1), the seal grammar
   (Bible Part Three), motion within the 400 ms bound (Art. V), absence
   rendered as absence (Art. VIII).

## 7. Ownership

- **Owning system:** Stage 11 — Documentation (the Documentation Architecture;
  `src/vaerion/docs/`).
- **Governance pathway:** changes to this document follow the directive-note
  instrument recorded in `constitution/amendments/LEDGER.md`; silences are
  filed as interpretation requests (P-5), never improvised.
- **Audit:** Constitution 11.6 — the trace-index audit samples decisions and
  traces them to citations; this organ extends that audit to documentation.
