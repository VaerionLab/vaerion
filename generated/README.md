# GENERATED ARTIFACTS — Constitutional Law of the Generated Root

**Status:** established (Foundation Amendment **F-005**).
**Authority:** Implementation Constitution 2.7 (generated bindings —
implementation necessity), 2.1 (single canonical Registry), 1.3 (no literal
visual values); Visual System §4.7 (value authority).

---

## 1. Mandate

`generated/` is the **only** lawful home of generated artifacts — the compiled
outputs produced deterministically from the canonical Registry. It exists so
that generated material is structurally distinguishable from authored material:
an engineer, a gate, or an auditor can tell at a glance whether a file is
written by a human or produced by the compiler.

## 2. Structure

```
generated/
    bindings/    <- per-platform bindings (one set per target platform)
    tokens/      <- compiled token set — the Registry's compiled form (registry.json)
    css/         <- compiled CSS custom-property bindings (vaerion-tokens.css)
    typescript/  <- compiled TypeScript token bindings (tokens.ts)
```

At establishment (F-005) this root held two empty directories marked with
`.gitkeep`; their emptiness was honest (Bible Art. VIII) — no placeholder
artifacts were fabricated to fill them. Generation began at Stage 2 (Registry
System): the canonical compiler (`src/vaerion/registry/compiler.ts`,
Constitution 2.7) now writes the three compiled binding sets —
`tokens/registry.json`, `css/vaerion-tokens.css`, and
`typescript/tokens.ts` — whose sha256 digests are pinned by the pipeline
verifier and the release receipts. `bindings/` remains empty (`.gitkeep`)
until a per-platform target exists.

## 3. Law of Generated Artifacts

1. **Never hand-authored.** Nothing in `generated/` is written by a human. A
   hand edit under this root is a violation (rule: F-005/GENERATED), detected
   by regeneration comparison.
2. **Produced exclusively from the canonical Registry.** The only lawful input
   is the canonical Registry (`src/vaerion/registry/`) compiling values from
   the ratified Visual System text (Constitution 2.1). No secondary source, no
   manual merge, no local override.
3. **Reproducible.** Regeneration from the same Registry version must produce
   byte-identical output (Constitution 2.7, pipeline determinism). A
   regeneration that differs is a conformance failure.
4. **Read-only to surfaces.** Surfaces consume binding-resolved values; they
   never write, patch, or fork generated material.
5. **Version-traceable.** Every generated artifact records the Registry
   version that produced it, so a surface can declare what it conforms to
   (Constitution 2.8).
6. **Drift is failure.** Where committed generated output is the comparison
   base, output that differs from a clean regeneration fails the pipeline —
   the same drift law the documentation pipeline obeys (Stage 10 contract;
   Constitution 9.1). The distribution policy is ratified with the Stage 2
   compiler: the compiled binding sets are committed under this root, and a
   committed artifact that differs from a fresh compilation is a violation
   (F-005), enforced by the pipeline verifier's sha256 pins and the release
   receipts.

## 4. What Never Belongs Here

- Hand-authored code, types written "for convenience", or curated constants.
- Registry records themselves (they live in the canonical Registry).
- Constitutional documents or governance ledgers (they live under
  `constitution/`).
- Anything whose source of truth is not the Registry.
