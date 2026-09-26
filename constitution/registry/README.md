# REGISTRY AUTHORITY — Constitutional Law of the Canonical Registry

**Status:** established (Foundation Amendment **F-004** — Registry Authority
Separation).
**Authority:** Implementation Constitution Part II (token pipeline); Visual
System §0 (the seven registries), §1.2 (Gauge Ladder), §2.2 (Type Scale),
§3.2 (Radius Ladder), §4.7 (reference color values), §7.1 (Motion Registry),
§3.4 (layer system), §8 (icon law).
**Supremacy:** Bible (P-1) — Art. XI (Nothing Unmeasured Ships), Art. IV
(Color Is Meaning) — prevails over this authority and over the implementation.

---

## 0. The Separation of Authority and Execution

There are exactly two Registry trees, and they are not interchangeable:

| Tree | Path | Role |
|------|------|------|
| **Constitutional Registry authority** | `constitution/registry/` | **Defines the law.** What the Registry is, what a token is, which scales are ratified, which lifecycle transitions are lawful, who owns the Registry. |
| **Registry implementation** | `src/vaerion/registry/` | **Executes the law.** The canonical data store, validation, versioning, compiler, and binding generation — built at Stage 2 under the Stage 2 contract. |

**Neither may replace the other.** The authority cannot execute (it holds no
code); the implementation cannot legislate (it holds no law). Where the
implementation and this authority appear to conflict, this authority prevails
and the discrepancy is a defect in the implementation. Where both documents
are silent, the silence is resolved only through governance (P-5).

The same separation holds for every other authority pair established by the
Foundation Amendments:

| Authority (law) | Implementation (execution) |
|---|---|
| `constitution/registry/` | `src/vaerion/registry/` |
| `constitution/snapshot-authority/` | Stage 8 snapshot infrastructure |
| `constitution/announcement-registry/` | Stage 6 announcement system |
| `constitution/releases/` | Stage 9 release engine |
| `generated/` (artifact law, `generated/README.md`) | Stage 2 compiler output |

---

## 1. The Canonical Registry (Constitution 2.1)

There is exactly **one canonical Registry**. It holds exactly **seven
sub-registries**, exactly as named by Visual System §0:

1. **Space** — all spacing. Scale authority: the Gauge Ladder (VS §1.2).
2. **Type** — the two voices, sizes, weights, tracking, line heights. Scale
   authority: the Type Scale (VS §2.2).
3. **Shape** — radii, hairlines, geometry vocabulary. Scale authority: the
   Radius Ladder (VS §3.2).
4. **Color** — grounds, ink ramp, verdict chromatics, accent, washes. Value
   authority: VS §4.7 reference tables.
5. **Motion** — durations, curves, the three canonical motions. Scale
   authority: the Motion Registry (VS §7.1).
6. **Elevation** — the layer system and ordinals. Authority: VS §3.4.
7. **Icon** — grid, stroke, sizes, families. Authority: VS §8.

No eighth registry exists; none may be added except by amendment.

## 2. Law of Token Records (Constitution 2.2)

Every token record carries **exactly seven fields** — no more, no fewer:

1. **identifier** — systematic id, `domain.property.variant`.
2. **instrumentName** — the poetic name; dual naming is inseparable (VS §0).
3. **value** — the value or formula.
4. **constraints** — scale membership, contrast minima, usage restrictions.
5. **governingCitation** — at least one citation into ratified law; an
   uncitabled token is void (P-4, Bible Art. XI).
6. **version** — the Registry version that introduced the current value.
7. **status** — `proposed | ratified | active | deprecated | retired`.

## 3. Law of the Lifecycle (Constitution 2.5, 2.9)

- Status transitions are performed **only by governance** (Part XI).
- Lawful transitions: `proposed → ratified → active → deprecated → retired`.
- `deprecated` tokens must alias to a successor and render identically during
  the deprecation window (one full release cycle).
- `retired` tokens must not resolve; removal occurs only at major ratification.

## 4. Law of Validation (Constitution 2.6)

Validation is mechanical, pass or fail (9.1). The Registry must verify:

- **Scale membership** — every value belongs to its registry's ratified scale;
  off-scale values are violations.
- **Contrast proof** — all color pairs meet Visual System §4.6/§4.7 minima;
  text-level and glyph-level tokens are validated against their separate
  registered minimums.
- **Grayscale survival** — verdict colorations remain meaningful with chroma
  suppressed (VS §4.4; Bible Art. IV).
- **Citation presence** — every record carries a governing citation.

## 5. Law of Generated Bindings (Constitution 2.7)

- The Registry compiles to generated, read-only **platform bindings** — one
  binding set per target platform.
- Bindings are **generated, never hand-authored**; they live exclusively under
  `generated/` (Foundation Amendment F-005) and are produced only by the
  canonical compiler from the canonical Registry.
- Regeneration is **reproducible** from the Registry alone; all binding sets
  from one Registry version are semantically identical.

## 6. Law of Versioning (Constitution 2.8)

- New tokens: additive versions.
- Any change to the value or meaning of an active token: **breaking change**
  requiring a ratified amendment (Part XI).
- Surfaces declare the Registry version they conform to; the declaration is
  audited at release (Part X).

## 7. Ownership (Constitution 2.4)

The Registry is owned by the **Design Systems Authority** (Constitution 11.1).
Engineers request tokens through the amendment pathway. Local copies of token
values, shadow registries, and "temporary" constants are violations wherever
they appear.

## 8. Source of Values

The Registry compiles values **from the ratified Visual System text**
(`constitution/visual-system/VAERION_VISUAL_SYSTEM_v1.0.1.md`, pinned by the
Snapshot Authority manifest) — never from memory, secondary notes, or
invention (Constitution 2.1; Bible Art. XI). Where that text is ambiguous, the
ambiguity is resolved only through the interpretation ledger (P-5); see
IR-004 (Gauge Ladder index record) for the standing example.
