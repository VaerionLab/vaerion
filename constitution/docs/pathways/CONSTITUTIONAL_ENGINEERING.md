# PATHWAY — CONSTITUTIONAL ENGINEERING

<!--
DOC-META
id: DOCS-PATH-CONSTITUTIONAL
title: Developer Pathway — Constitutional Engineering
owningSystem: Stage 11 — Documentation Architecture (src/vaerion/docs)
authorityCitations: Implementation Constitution P-4; Implementation Constitution P-5; Implementation Constitution Part XI; Implementation Constitution 11.2; Implementation Constitution 11.3; Implementation Constitution 11.6; constitution/INDEX.md; Stage 11 execution order Deliverable 4; constitution/docs/GOVERNANCE.md
relatedArtifacts: constitution/INDEX.md; constitution/amendments/LEDGER.md; constitution/interpretations/LEDGER.md; constitution/trace-index/trace-index.md; constitution/CHANGELOG.md; src/vaerion/foundation/gate.ts; src/vaerion/foundation/prerequisites.ts; constitution/snapshot-authority/manifests/canonical-documents.json
confidence: verified
lastVerified: 2026-09-22
verificationCommand: bun run vaerion:verify-documentation
-->

**Who this is for:** the core contributor who will evolve the law itself —
amendments, interpretations, ratifications — without breaking the system's
identity.

---

## What to Learn

1. **The authority tree** (`constitution/INDEX.md`): the three ratified
   documents and their precedence (P-1); the authority organs and the
   amendments that established them (F-001…F-007); the pre-ratification
   artifacts that hold no authority and are preserved untouched (§4; IR-003).
2. **The two instruments of evolution** (11.2): the interpretation request
   and the amendment proposal — and the strict difference between them.
   An interpretation applies existing law to a new case; an amendment
   changes law and must survive review against **every** prior Article
   (11.3).
3. **The trace discipline** (P-4): every decision carries a citation; the
   trace index is the consolidated map (T-001…T-076); an uncitable decision
   is a violation by definition; the audit samples and verifies.
4. **The transcription discipline** (F-001; P-6): ratified texts are
   transcribed verbatim, digest-pinned in
   `constitution/snapshot-authority/manifests/canonical-documents.json`,
   and any divergence fails `bun run vaerion:verify-constitution`.

## What to Inspect

| Path | What you will see |
|---|---|
| `constitution/INDEX.md` | the Authority Registry — the single point of departure |
| `constitution/amendments/LEDGER.md` | F-001…F-007 + the directive notes of the execution series |
| `constitution/interpretations/LEDGER.md` | IR-001…IR-021; the status vocabulary; the protocol |
| `constitution/trace-index/trace-index.md` | the citation ↔ artifact map; obligation O-3 |
| `src/vaerion/foundation/gate.ts` | the gate engine — `assertStageMayBegin` and friends |
| `src/vaerion/foundation/prerequisites.ts` | the prerequisite registry with proof obligations |
| `constitution/docs/GOVERNANCE.md` | the law of this knowledge organ (Stage 11, Deliverable 5) |

## What Laws Apply

- **P-5** — the silence rule: where all three documents are silent, stop and
  file; improvised resolution is a violation regardless of quality.
- **11.2–11.3** — the evolution pathway and the amendment protocol.
- **11.4** — historical truth is never retired, only frozen.
- **11.6** — violations are detected by the gates, the trace audit, and the
  literal scan; a detected violation blocks release.
- **11.7** — the standing test: cover the logo, strip the color, ask what
  moved and why.

## What Commands Prove Correctness

```bash
bun run vaerion:verify-constitution   # the ratified digests are intact
bun run vaerion:stages                # the dependency graph; prerequisite proofs; the work front
bun run vaerion:verify-documentation  # the knowledge organ: citations resolve, claims match reality
```

## The One Obligation

You are never the author of law — you are its recording secretary and, at
most, its petitioner. When the Founder or the Design Systems Authority rules,
the ruling enters the ledgers with its citations; when they are silent, the
silence is honored. The system's memory (`constitution/`) is append-only in
spirit: nothing is deleted, corrections supersede (11.4), and every page of
the knowledge organ carries its own authority, its evidence, and its
verification command (GOVERNANCE.md §2).
