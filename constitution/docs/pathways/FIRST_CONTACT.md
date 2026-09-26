# PATHWAY — FIRST CONTACT

<!--
DOC-META
id: DOCS-PATH-FIRST
title: Developer Pathway — First Contact
owningSystem: Stage 11 — Documentation Architecture (src/vaerion/docs)
authorityCitations: Bible Part Three; Bible Art. VI; Bible Art. XIII; Implementation Constitution P-1; Implementation Constitution 1.3; Visual System §0; Visual System §2.1; Stage 11 execution order Deliverable 4
relatedArtifacts: constitution/bible/VAERION_DESIGN_BIBLE_v1.0.md; src/vaerion/primitives/seal.tsx; src/vaerion/primitives/receipt.tsx; src/app/page.tsx; constitution/docs/DEVELOPER_JOURNEY.md; constitution/docs/SYSTEM_PHILOSOPHY.md
confidence: verified
lastVerified: 2026-09-22
verificationCommand: bun run vaerion:verify-documentation
-->

**Who this is for:** a developer in their first hour. The goal is not
productivity; it is calibration — learning the four verdicts, the receipt,
and how to see proof.

---

## What to Learn (the first hour)

1. **The four verdicts** — VERIFIED (solid seal), UNVERIFIED (hollow seal),
   FAILED (crossed seal), PENDING (pulse). They are the product's alphabet
   and they are closed: no fifth verdict, no alias, no softer synonym.
   Source: `constitution/bible/VAERION_DESIGN_BIBLE_v1.0.md`, Part Three.
2. **The receipt anatomy** — receipt id → claim → subject → verdict seal →
   verification method → evidence[] → issued-at → chain parent. The sequence
   is sacred (Bible Art. VI).
3. **The brand memory** — *"Anything without proof says so out loud."* The
   hollow seal is the product's signature of honesty, not a gap.

## What to Inspect

| Path | What you will see |
|---|---|
| `constitution/bible/VAERION_DESIGN_BIBLE_v1.0.md` | the supreme design authority — Part Three (verdicts) and Art. VI (receipt) first |
| `src/vaerion/primitives/seal.tsx` | the seal made executable — the only circle and the only verdict color in the system |
| `src/vaerion/primitives/receipt.tsx` | the receipt anatomy rendered in order, proven by the primitive gate |
| `src/app/page.tsx` | the host route mounting the constitutional instrument |

## What Laws Apply

- **P-1** — precedence: the Bible governs everything below it.
- **Art. VI** — the receipt is sacred; its anatomy is never reordered.
- **Art. XIII** — teach the states: every verdict carries a plain-language
  explainer, reachable forever.
- **1.3** — tokens are the only source of visual values: no literal sizes,
  colors, or durations exist in the implementation.

## What Commands Prove Correctness

```bash
bun run vaerion:verify-constitution   # the ratified digests are intact (3/3)
bun run vaerion:verify-primitives     # the receipt anatomy + token law hold (22,853 checks)
bun run vaerion:stages                # the build-order gate — where the work front is
```

## The One Thing to Remember

When the system shows you a hollow seal, it is not hiding a failure — it is
refusing to pretend. That refusal is the entire product thesis (Bible
Part One: certainty without drama).
