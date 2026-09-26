# PATHWAY — SYSTEM UNDERSTANDING

<!--
DOC-META
id: DOCS-PATH-SYSTEM
title: Developer Pathway — System Understanding
owningSystem: Stage 11 — Documentation Architecture (src/vaerion/docs)
authorityCitations: Implementation Constitution Part II; Implementation Constitution Part V; Implementation Constitution Part VI; Implementation Constitution 2.2; Implementation Constitution 2.7; Implementation Constitution 5.7; Implementation Constitution 6.5; Visual System §0; Visual System §10; Stage 11 execution order Deliverable 4
relatedArtifacts: src/vaerion/registry/index.ts; generated/css/vaerion-tokens.css; src/vaerion/state/; src/vaerion/interaction/; constitution/docs/ARCHITECTURE_MAP.md; constitution/docs/RUNTIME.md; src/vaerion/docs/DEPENDENCY_GRAPH.md
confidence: verified
lastVerified: 2026-09-22
verificationCommand: bun run vaerion:verify-documentation
-->

**Who this is for:** the intermediate developer who wants the machinery —
how a value travels from law to screen, and how behavior stays lawful.

---

## What to Learn

1. **The Registry pipeline** (Part II): ratified law → seven sub-registries
   (Space, Type, Shape, Color, Motion, Elevation, Icon — 64 tokens, v1.0.0)
   → deterministic compiler → generated bindings under `generated/`.
   Dual naming (VS §0): every token has an identifier (`space.7`) and an
   instrument name ("Seal Isolation"); documentation uses either;
   implementations bind only to identifiers.
2. **The state engine** (Part V): twelve immutable states; ownership
   (authority → surface → primitive, one direction); the lawful transition
   set of 5.7 (13 rows over 11 events); the verdict boundary (5.3 — verdicts
   enter only from the Verification Authority).
3. **The interaction engine** (Part VI): thirteen commands on go / get /
   verify / attest; the latency contracts (<100 ms ack, 300 ms Gauge,
   6 s Returns); the termination law (receipt, Return, or Failure Receipt —
   nothing terminates silently).

## What to Inspect

| Path | What you will see |
|---|---|
| `src/vaerion/registry/index.ts` | the canonical Registry — `getToken`, `getTokenValue`, `cssVarName`, `resolveFormula` |
| `generated/css/vaerion-tokens.css` | the generated bindings — every value carries its citation inline (never hand-edit; F-005) |
| `src/vaerion/state/transitions.ts` | the 5.7 table, row for row, guards enforced |
| `src/vaerion/state/context.tsx` | token-gated dispatch — sibling mutation structurally impossible |
| `src/vaerion/interaction/commands.ts` | the command registry and hash-first routing |
| `src/vaerion/surfaces/registry.ts` | the ten registered surfaces and their skeleton mappings |
| `constitution/docs/ARCHITECTURE_MAP.md` | the five realms and the data flow |

## What Laws Apply

- **2.2 / 2.7** — token anatomy and generated bindings (2.7(b): two
  compilations of the same source are byte-identical).
- **5.4 / 5.5** — propagation and ownership; no primitive owns state.
- **5.7** — the closed transition set; unlisted transitions throw
  `ConstitutionalViolationError`.
- **6.5 / 6.12** — termination and latency law.
- **4.6** — the surface set is enumerated and closed.

## What Commands Prove Correctness

```bash
bun run vaerion:compile-registry      # validation + reproducibility + drift (the bindings are lawful)
bun run vaerion:verify-state          # the twelve state gates
bun run vaerion:verify-interaction    # the fifteen interaction gates
bun run vaerion:stages                # the dependency graph and the work front
```

## The One Thing to Understand

Nothing reaches the screen by decision of an engineer at render time. Values
come from the Registry, states come from the matrix, verdicts come from the
Verification Authority, and copy comes from the Announcement & Copy Registry
by identifier. The implementation is a rendering of law, not a set of
choices (Constitution 1.1 — design is law).
