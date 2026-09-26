# PATHWAY — ARCHITECTURE MASTERY

<!--
DOC-META
id: DOCS-PATH-MASTERY
title: Developer Pathway — Architecture Mastery
owningSystem: Stage 11 — Documentation Architecture (src/vaerion/docs)
authorityCitations: Implementation Constitution Part VII; Implementation Constitution Part VIII; Implementation Constitution Part X; Implementation Constitution 7.2; Implementation Constitution 8.0; Implementation Constitution 8.8; Implementation Constitution 10.1; Implementation Constitution P-6; Bible Art. XII; Stage 11 execution order Deliverable 4
relatedArtifacts: src/vaerion/rendering/; src/vaerion/authorities/; src/vaerion/release/; src/vaerion/testing/; constitution/docs/RELEASE_MODEL.md; constitution/docs/SECURITY_MODEL.md; constitution/docs/TESTING_MODEL.md
confidence: verified
lastVerified: 2026-09-22
verificationCommand: bun run vaerion:verify-documentation
-->

**Who this is for:** the advanced engineer who will compose, extend, and
operate the whole instrument — rendering, data authorities, testing, and the
release engine.

---

## What to Learn

1. **The rendering engine** (Part VII): the strata (chrome → surface →
   region → primitive, 7.1); the seven ordinal layers ground.0 → lens.6
   (7.2; shadows and glass impossible); the twelve visibility obligations
   keyed to the canonical states (7.3); measurement (7.4 — the Gauge Ladder,
   the 4px baseline, the registered intrinsic heights); responsive evolution
   (7.5 — four breakpoint contracts per IR-010); the six modes — print,
   grayscale, forced-colors, reduced-motion, export (7.6–7.10; VS §11).
2. **The data authorities** (Part VIII): seven named authorities — Chain,
   Ledger, Evidence, Verification, Rule, Identity, Export (8.0) — and the
   investigation lifecycle (8.6, ownership filed as IR-013). Append-only
   history; correction by superseding records; the sole verdict mint.
3. **The testing infrastructure** (Part IX): eight engines; every check
   mechanical, binary, cited; evidence records with SHA-256 integrity.
4. **The release engine** (Part X): the gate == the ceremony; seven
   receipts; deterministic builds; artifact intelligence; the eight
   channels; the Trust Engine (portable standalone verification).

## What to Inspect

| Path | What you will see |
|---|---|
| `src/vaerion/rendering/layers.ts` | LAYER_SYSTEM consumed from the Registry scales — the sole source |
| `src/vaerion/rendering/modes.ts` | the six mode renderers and their parity law |
| `src/vaerion/authorities/contracts.ts` | the seven authority contracts, consumed from the ownership registry |
| `src/vaerion/authorities/chain.ts` | append-only growth; first-class breaks; halt-while-broken |
| `src/vaerion/testing/snapshot/engine.ts` | digest-first snapshots; supersession-only evolution; no approval API |
| `src/vaerion/release/authority.ts` | the sole issuer of releases |
| `src/vaerion/release/verification.ts` | autonomous verification composing the real Stage 2–9 engines + the Article Gate |
| `constitution/docs/RELEASE_MODEL.md` | the ceremony, the first release, the eight gates |

## What Laws Apply

- **7.2 / VS §3.4** — the ordinal layer system; treatment law; invented layers refused.
- **8.0–8.9** — authority ownership and isolation; no eighth authority without amendment.
- **9.1 / 10.1** — mechanical gates; no waivers; partial passes are failures.
- **P-6** — the fidelity standard: interchangeable teams, no invented values.
- **Art. XII** — the Proof Lens: adds light, never access.

## What Commands Prove Correctness

```bash
bun run vaerion:verify-rendering      # the fourteen rendering gates
bun run vaerion:verify-authorities    # the sixteen authority gates
bun run vaerion:test-all              # the eight Stage 9 engines
bun run vaerion:verify-release        # the full graph + the Article Gate
bun run vaerion:verify-everything     # the seven release gates, aggregated
```

## The One Thing to Master

Every subsystem refuses. The state machine refuses illegal transitions; the
chain refuses appends while broken; the export refuses demo content; the
release refuses a world where one check fails; the distribution refuses
delivery without evidence. Architecture mastery is knowing each refusal,
its citation, and the gate that proves it — because in this system a refusal
is not an error path; it is the architecture (P-3 — conformance is binary).
