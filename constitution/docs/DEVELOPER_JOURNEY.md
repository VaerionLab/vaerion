# THE DEVELOPER JOURNEY — Four Pathways Into the Instrument

<!--
DOC-META
id: DOCS-JOURNEY
title: Developer Journey
owningSystem: Stage 11 — Documentation Architecture (src/vaerion/docs)
authorityCitations: Stage 11 execution order Deliverable 4; Implementation Constitution P-4; Implementation Constitution 1.1; Implementation Constitution 9.1; Implementation Constitution 11.2; Visual System §0; Bible Art. XIII; Bible Art. XIV; constitution/docs/GOVERNANCE.md
relatedArtifacts: constitution/docs/pathways/; constitution/docs/VAERION_CODEX_v1.0.md; constitution/docs/ARCHITECTURE_MAP.md; src/vaerion/docs/DEPENDENCY_GRAPH.md; tools/vaerion-pipeline/README.md
confidence: verified
lastVerified: 2026-09-22
verificationCommand: bun run vaerion:verify-documentation
-->

The knowledge organ teaches the way the instrument works: states are taught
permanently (Bible Art. XIII — the system never assumes the user has learned
the states), and every claim a developer reads is verifiable by a command
they can run (Art. XIV — an equal instrument; Constitution 9.1 — mechanical
proofs).

Four guided pathways exist, each stating: what to learn, what files to
inspect, what laws apply, and what verification commands prove correctness.
Every file path and command in the pathways is mechanically checked by
`bun run vaerion:verify-documentation`.

| Pathway | For | Document |
|---|---|---|
| **First Contact** | the new developer's first hour | `constitution/docs/pathways/FIRST_CONTACT.md` |
| **System Understanding** | the intermediate developer who wants the machinery | `constitution/docs/pathways/SYSTEM_UNDERSTANDING.md` |
| **Architecture Mastery** | the advanced engineer who will compose and extend | `constitution/docs/pathways/ARCHITECTURE_MASTERY.md` |
| **Constitutional Engineering** | the core contributor who will evolve the law itself | `constitution/docs/pathways/CONSTITUTIONAL_ENGINEERING.md` |

## How to Read Vaerion

1. **Read the law before the code.** The precedence is fixed (P-1):
   `constitution/bible/VAERION_DESIGN_BIBLE_v1.0.md` →
   `constitution/visual-system/VAERION_VISUAL_SYSTEM_v1.0.1.md` →
   `constitution/implementation-constitution/VAERION_IMPLEMENTATION_CONSTITUTION_v1.0.md`.
2. **Trust the gates, not the prose.** Every claim in this organ carries a
   verification command; run it (Constitution 9.1). The full command surface
   is recorded in `tools/vaerion-pipeline/README.md` and re-derived by the
   documentation gate.
3. **Follow the trace.** Every engineering decision maps to a citation in
   `constitution/trace-index/trace-index.md` (T-001…T-076). An uncitable
   decision is a violation by definition (P-4).
4. **When the law is silent, stop.** File an interpretation request
   (`constitution/interpretations/LEDGER.md`); never improvise (P-5).

## The Codex

The complete civilization archive is `constitution/docs/VAERION_CODEX_v1.0.md`
— twelve chapters from Vision to Developer Extension, each referencing real
implementation. The Knowledge Interface (Deliverable 3) renders it at the
Knowledge Organ display path (IR-020).

## The One-Sentence Doctrine

> **"Documentation is the memory of the system"** — and memory that is wrong
> is a violation, not an editorial matter
> (`constitution/docs/GOVERNANCE.md`; Constitution 9.1).
