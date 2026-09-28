# STAGE 3 — PRIMITIVE ARCHITECTURE CONFORMANCE REPORT

**Operation:** Primitive Architecture · **Authority:** VAERION_IMPLEMENTATION_CONSTITUTION_v1.0 (Part III) · **Dependency:** Stage 2 Registry System complete (verified).
**Doctrine honored:** every primitive is a manifestation of law (1.2) — no redesign, no added variants, no anatomy changes, no framework-specific visual decisions, no components without citations.

---

## 1. Primitives completed

### The fifteen bound contracts (Constitution 3.1–3.15) — all implemented

| # | Primitive | Contract | Implementation notes (law preserved) |
|---|---|---|---|
| 1 | **Receipt** | 3.1 | fixed anatomy rendered in order — id strip → claim → subject → seal block → verification method → evidence[] → issued-at → chain parent (+ extensions zone, Margin Notes); variants row/card/page differ in compression and ceremony, never in order; throws on a verdict without verifier (Art. III) or without verification method (Art. VI); never computes verdicts (1.6) |
| 2 | **Panel** | 3.2 | hairline-framed surface.1; no claims, no verdict coloration; no cards (VS §5.6) |
| 3 | **Seal** | 3.3 | shape + word at 16/20/28/44 only; solid/hollow/crossed/pulse geometry per Bible Part Three; size 16 hides the word only with tooltip + accessible name; throws on any non-canonical verdict; the only circle + filled glyph + verdict color in the system |
| 4 | **Chainline** | 3.4 | 1 px ink.32 line, 2 px square nodes, 8 px break gap with break glyph; horizontal/vertical; renders received integrity; returns null where no chain exists (no decoration) |
| 5 | **Button** | 3.5 | Primary (ink-filled) / Secondary (hairline) / Quiet / Control; destructive coloration only at confirmation; consequential actions name their consequence |
| 6 | **Input (Field Frame)** | 3.6 | persistent machine-voice micro-label set into the top-left frame edge; validation speaks through the Seal grammar; placeholder never a label |
| 7 | **Table (Audit)** | 3.7 | horizontal rules only; numerals right-aligned tabular with mandatory unit column; verdict columns bind Seal-16; slice statement always rendered (position memory / Art. X) |
| 8 | **Log** | 3.8 | fixed timestamp gutter, anchored lines, hang-indent grid; severity is seal-dot + word; immutable append-only stream |
| 9 | **Timeline** | 3.9 | state-shaped nodes (Seal-16), gaps render as Chainline breaks; scrubbing paired with step controls |
| 10 | **Environment Stamp** | 3.10 | engine version · rule set · environment in chrome, Machine Voice, links to attestation; told honestly at Stage 4: "not-yet-bound (Stage 7)" |
| 11 | **Navigation (Spine)** | 3.11 | the four enumerated territories (console / records / rules / system); labels mandatory; active-state brass tick; never hosts actions/metrics |
| 12 | **Dialog** | 3.12 | standard / ceremony / destructive classes only; veil (no verdict meaning); ceremony = consequence sentence + governing rule quote + explicit confirm; destructive = typed identifier match; focus trap + restore (Radix behavior) |
| 13 | **Toast (Return)** | 3.13 | bottom-left; 6 s life from the Registry (`motion.life.return`); failures persist until acknowledged; seal + machine id + human message; older returns yield at the recorded maximum (IR-010) |
| 14 | **Gauge** | 3.14 | renders nothing before 300 ms (`motion.delay.gauge`); determinate requires a measured value (throws otherwise — never fakes progress); indeterminate = traveling segment; no spinners |
| 15 | **Lens** | 3.15 | pointer hold / Alt-hover / focus+L / tap-to-toggle; veil.3 dims, chain renders at lens.6 full ink; restricted evidence hatched with honest notice — adds light, never access; Escape restores focus to the claim |

### Remaining Visual System §5 primitives under identical contract structure (3.0) — 5 implemented

**Hash Line** (≥10 characters, truncation visibly marked `[elided]`, click-only reveal — never hover; reveal auditable via aria-expanded + callback), **Evidence Item** (kind/source/hash/contribution; restricted = first-class hatched state; demo flag travels), **Ledger Row** (fixed 36 px rhythm via `space.ledgerRow`; seal at registered position; never compresses), **Micro Label** (the only caps; Machine Voice), **Criteria Bar** (visible formula `field operator value` + conjunctions, editable in place — owns every filterable set, 4.4).

## 2. Contracts satisfied

Every primitive carries: contract metadata (Responsibility / Boundaries / Extension / Composition — 3.0), registry token references resolved against the canonical Registry (2.7(c)), state awareness declared against the canonical states (Part V), an accessibility contract (6.7–6.11; Art. XIV), and ≥4 standing citations (P-4). No primitive owns business logic, computes verdicts, invents states, or contains an uncited value.

## 3. Violations found and corrected during the build

| Found by | Violation | Correction |
|---|---|---|
| verify gate [3.0] | "Input (Field Frame)" name mismatch between manifest and bound-contract list | aligned to the constitutional name |
| verify gate [Part V] | stateless primitives flagged for empty state arrays | gate corrected — an empty declaration is lawful for stateless primitives |
| verify gate [1.3] | `RETURN_LIFE_MS = 6000` literal in feedback.tsx | consumed from Registry scales (`RETURN_LIFE_SECONDS`) |
| runtime (browser QA) | copy ids resolved by map key instead of registered identifier; one render-time `.replace()` composition | all call sites consume canonical ids; composition removed (F-003 law 5) |

## 4. Tests performed (mechanical conformance — IR-002 form)

`bun run vaerion:verify-primitives` — **PASS: 22,853 checks, 0 violations**:

1. **Manifest completeness** — all 15 bound contracts present; four clauses + tokens + states + accessibility + citations per primitive.
2. **Token usage** — per-line scan of every primitive file and the stylesheet for literal visual values (hex, rgba, px, ms, font-size/weight, box-shadow, cubic-bezier, backdrop-filter); comment lines and IR-010 media-query thresholds exempt; **zero literals**.
3. **Receipt anatomy check** — rendered segment order in `receipt.tsx` proven to match `RECEIPT_ANATOMY` (Art. VI) by source-position assertion.
4. **Token reference check** — every declared token identifier resolves in the canonical Registry.
5. **Forbidden behavior** — no `Math.random`, no `Date.now`, no `fetch`, no verdict computation/optimism, no spinners (comments stripped before judging).

## 5. Stage 4 readiness

**READY.** Every primitive is a law-manifestation consuming only generated bindings; the receipt anatomy is mechanically proven; the State/verdict boundary holds (primitives render received state only). The Stage 4 gate (dependsOn: Stage 3 conformant) evaluates **mayBegin: YES**.
