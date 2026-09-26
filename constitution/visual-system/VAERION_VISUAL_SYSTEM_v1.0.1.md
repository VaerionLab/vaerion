# VAERION_VISUAL_SYSTEM_v1.0.1

*The Instrument Grammar — Visual Law*
*Derived from VAERION_DESIGN_BIBLE_v1.0 ("the Bible"). The Bible prevails over this document (Implementation Constitution P-1). This document defines the registered visual values and behavior the Implementation Constitution governs how to build.*

> **Transcription record — apparatus, not law.** This file is the repository
> transcription of the ratified Visual System (governance item **DP-2**,
> completed under Foundation Amendment **F-001**). It is the value-source for
> Stage 2's Registry (Implementation Constitution 2.1). Provenance, method, and
> integrity pinning are recorded in the Transcription Record at the end of this
> file and in `constitution/snapshot-authority/manifests/canonical-documents.json`.
> Everything between this block and the Transcription Record is the ratified
> text.

---

## §0 — System Overview: The Seven Registries and Dual Naming

All visual decisions resolve through exactly **seven registries**. A value that
does not resolve through a registry does not exist. The registries, in order:

| # | Registry | Governs |
|---|----------|---------|
| 1 | **Space** | all spacing, page architecture, ceremonial distance |
| 2 | **Type** | the two voices, sizes, weights, tracking, line heights |
| 3 | **Shape** | radii, hairlines, geometry vocabulary, chain geometry |
| 4 | **Color** | grounds, ink, verdict chromatics, accent, budget |
| 5 | **Motion** | durations, curves, the three canonical motions |
| 6 | **Elevation** | the layer system and its ordinals |
| 7 | **Icon** | grid, stroke, sizes, families |

**Dual naming.** Every registered value carries two names: a **system id** —
compact, mechanical, `domain.property.variant` — and an **instrument name** —
the human-rememberable name of the thing. Both are registered together and
never separated; documentation, code, and review use the pair. Inventing a
third name for a registered value is a violation.

## §1 — Space

### §1.1 — The Gauge

Spacing is measured on a **4 px base gauge** — the Gauge. All spacing is a
multiple or registered half-step of the gauge; there are no other values.

### §1.2 — The Gauge Ladder

The Gauge Ladder is the ratified spacing ramp:

**space.0–space.10 — 0 / 2 / 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 px**

Each step's meaning is registered with it; steps are selected by measurement
significance (how much distance two things deserve), never by taste. Off-ladder
spacing is a violation.

### §1.3 — Ceremonial Spacing

Two distances are ceremonial and may not be compressed:

- **Seal isolation — ≥ 32 px (space.7).** A verdict seal keeps at least this
  clearance from any other element. A crowded seal reads as decoration.
- **Receipt Viewer ceremony — 64 px (space.9).** The full receipt view
  surrounds the verdict seal with this distance. The receipt is the product's
  most sacred object; its reading environment is architecture, not layout.

### §1.4 — Page Skeletons

Exactly three page skeletons exist:

1. **Console** — operational surfaces: ledgers, queues, verification runs.
   Dense, hairline-ruled, instrument-first.
2. **Document** — reading surfaces: receipts, reports, attestations. One
   column of record, generous gauge, print-true.
3. **Status** — at-a-glance surfaces: system attestation, health, stamps.
   Verdict-first, minimal navigation.

**The Margin Rail.** On ultra-wide displays the Document skeleton grows a
**320 px Margin Rail** — a hairline-separated rail for citations, evidence
links, and stamps — instead of stretching the reading column. Content columns
do not stretch to fill; they gain rails.

## §2 — Type

### §2.1 — The Two Voices

- **Machine Voice** — monospaced. Family: **Berkeley Mono**, fallback
  **Spline Sans Mono**. Renders identifiers, hashes, versions, timestamps,
  counts, rules, and all literal measurement. Line height **1.45**.
- **Human Voice** — humanist sans. Family: **Instrument Sans**, fallback
  **Söhne**. Renders explanations, one-line state explainers, guidance.
  Line height **1.55**.

The two voices never share a family, and a reader must distinguish them
instantly. Blending voices into a third tone is a violation (Bible Art. VII).

### §2.2 — The Type Scale

Sizes register on a fixed scale per voice. The scale exists so that hierarchy
is measurable: a difference in size means a difference in significance, and
equal significance always renders at equal size. Off-scale sizes are violations.
Weights are registered per voice; the Machine Voice does not use italic, and
neither voice uses decorative display styles.

### §2.3 — Numerals and Literals

Numeric literals, hashes, and identifiers render in the Machine Voice with
tabular alignment. Prose numbers stay in the Human Voice. A hash never renders
in the Human Voice, and a sentence never renders in the Machine Voice.

### §2.4 — Text Discipline

- No centered body text; instruments align left.
- No all-caps body copy; registered micro-labels (§5) are the only caps.
- Emphasis is weight and structure, never color (§4) and never decoration.

## §3 — Shape and Surface

### §3.1 — Geometry Vocabulary

The shape language is **rectangles and hairlines**. Additionally:

- **Circles are reserved for truth.** Only verdict seals and pulse dots are
  round. No decorative circles, dots, pills-as-ornament, or avatars.
- **45° lines are reserved.** Diagonal line work exists only in hatch
  textures and the failure cross. No diagonal decoration.

### §3.2 — The Radius Ladder

**0 / 2 px / 4 px / 8 px / seal (∞)**

- 0 — structural containers, panels, table frames.
- 2 px — hairline cards, inputs, small frames.
- 4 px — interactive controls (buttons, fields, toasts).
- 8 px — large ceremony surfaces (Receipt Viewer, Lens).
- seal (∞) — fully round, reserved exclusively to verdict seals and pulse dots.

A radius used outside its registered role is a violation.

### §3.3 — Hairlines

Structure is drawn with **1 px hairlines** at registered ink strengths
**ink.16** and **ink.32** (§4.7). Hairlines replace shadows, borders-as-color,
and dividers-as-decoration. If a hierarchy cannot be drawn with hairlines and
layer position, the hierarchy is wrong.

### §3.4 — Elevation: The Layer System

Depth is expressed by registered layers, never by shadows or glass:

**ground.0 → surface.1 → sticky.2 → veil.3 → floating.4 → ceremony.5 → lens.6**

- **ground.0** — the page ground.
- **surface.1** — panels and content planes.
- **sticky.2** — chrome that holds position while records move.
- **veil.3** — the Proof Lens dimming stratum.
- **floating.4** — Caliper, Returns, transient controls.
- **ceremony.5** — Receipt Viewer, confirmations, the Lens panel itself.
- **lens.6** — the illuminated evidence chain state.

**Shadows are prohibited. Glass is prohibited.** Elevation above surface.1 is
communicated by layer position plus hairline edges, and each layer's treatment
is registered so that the same layer renders identically everywhere.

### §3.5 — The Chainline

The chain renders as a registered geometry, the **Chainline**: a continuous
**1 px ink.32** line joining **2 px square nodes** — one node per link. A
broken chain renders as an **8 px gap** with the registered **break glyph** at
the gap. The Chainline is signature geometry: walkable (Bible Art. IX),
consistent across every surface, and never replaced by arrows, trees, or
freeform connectors.

## §4 — Color

### §4.1 — The Two Chambers

The system operates in two registered environments:

- **The light chamber — the reading room.** Where records are read, verified,
  exported, and printed. Paper ground.
- **The dark chamber — the war room.** Where operations run long: consoles,
  live ledgers, incident views. Graphite ground.

Both chambers are ratified with equal completeness; a surface declares its
chamber and renders its registered set. Theme is an operational choice, not a
preference toggle bolted onto one chamber.

### §4.2 — Grounds and Ink

- **Paper** `#F5F4F0` — light chamber ground.
- **Graphite** `#141312` — dark chamber ground.
- **ink.100** — full-strength ink: `#1A1917` on Paper, `#E9E6E0` on Graphite.

The ink ramp steps (registered strengths used by hairlines, secondary text,
glyphs) are registered per chamber in §4.7.

### §4.3 — Verdict Chromatics

Color is bound to the four verdicts (Bible Art. III/IV) and to nothing else:

- **Assay Green** — VERIFIED: `#17663F` (light chamber) / `#3FA873` (dark).
- **Hold Amber** — PENDING / hold states: `#7A5200` (light) / `#D19A3A` (dark).
- **Fault Red** — FAILED: `#9E2B20` (light) / `#C65B4E` (dark).
- **Signal Brass** — the accent of attestation (stamps, verification emphasis):
  text-level `#7A4E1D` (light) / `#C98A4B` (dark); glyph-level `#9C6220`.

UNVERIFIED takes **no chromatic family**: the hollow seal is ink, not color.
Coloring the unverified would be the exact dishonesty the system exists to end.

### §4.4 — Grayscale Survival

Every chromatic surface must survive grayscale rendering with meaning intact —
seal shape (Bible Part Three), label, and position must carry the verdict with
chroma removed. A state distinguishable only by hue is a violation. Grayscale
rendering is a first-class registered mode (§11), not a test afterthought.

### §4.5 — The Color Budget

Chromatic coverage is budgeted: **≤ 5% of any surface, target < 2%**. The
instrument is grayscale with measured verdict color; a surface whose color
coverage exceeds budget is off-register and fails review. The budget is
audited mechanically (Stage 8 Token/Visual gates).

### §4.6 — Contrast Law

Text-level color pairs meet **WCAG 2.2 AA** contrast for their size and weight.
Glyph-level signals (seal strokes, chainline nodes, break glyphs, icons) meet
the registered glyph minimums. Text-level and glyph-level tokens are
**registered separately** and never substituted for one another.

### §4.7 — Reference Value Tables

The ratified reference values, by chamber:

| Token | Light chamber (Paper) | Dark chamber (Graphite) | Binds to |
|---|---|---|---|
| `color.ground` | `#F5F4F0` | `#141312` | page ground |
| `color.ink.100` | `#1A1917` | `#E9E6E0` | primary text |
| `color.verdict.verified` | `#17663F` | `#3FA873` | VERIFIED only |
| `color.verdict.pending` | `#7A5200` | `#D19A3A` | PENDING / hold only |
| `color.verdict.failed` | `#9E2B20` | `#C65B4E` | FAILED only |
| `color.accent.brass.text` | `#7A4E1D` | `#C98A4B` | attestation text-level |
| `color.accent.brass.glyph` | — (glyph-level `#9C6220` registered once) | — | attestation glyph-level |

Ink ramp steps (hairlines, secondary ink, glyphs) register per chamber at the
ratified strengths — **ink.16** and **ink.32** govern hairlines (§3.3). These
tables are the sole source from which the Registry (Implementation Constitution
2.1) compiles color tokens. No surface, code path, or document may introduce a
color value outside these tables; doing so is a violation of Bible Art. XI and
Implementation Constitution 1.3.

## §5 — Primitives

The visual primitives are registered here; their engineering contracts are
Implementation Constitution Part III. Rendering a registered concept without
its primitive — or extending a primitive beyond its registration — is a
violation.

**Receipt** — the sacred object (Bible Art. VI). Variants: **Row** (ledger
line), **Card** (inline record), **Page** (full ceremony document). The anatomy
order is fixed across all variants and across print and export.

**Verdict Seal** — the truth mark. Registered sizes: **16 / 20 / 28 / 44**.
Geometry per Bible Part Three (solid / hollow / crossed / pulse). Circles
elsewhere are prohibited (§3.1).

**Hash Line** — evidence's literal address. Displayed compact: **≥ 10
characters with truncation visibly marked**. Reveals the full value **on click
only** — never on hover (shoulder-surf and screenshot discipline) — and every
reveal is auditable. Rendered in the Machine Voice exclusively.

**Evidence Item** — one unit of proof: what it is, where it came from, its
hash, its contribution to the verdict. Evidence Items stack in the receipt's
evidence region in registered rhythm.

**Ledger Row** — the fixed ledger rhythm: **36 px** row height, hairline-ruled,
Machine Voice identifiers, verdict seal at the registered position. The ledger
is the product's terrain; its rows never change height between surfaces.

**Panel** — the only container. **There are no cards.** A panel is a
hairline-framed surface.1 plane with registered gauge padding. Elevation,
shadow, and glass are unavailable to panels (§3.4).

**Button** — actions are registered as Primary (ink-filled — the filled
button takes ink, **never a verdict or accent color**), Secondary (hairline),
and Quiet (text with registered affordance). Danger actions are shaped by the
friction ladder (§13), not by red paint.

**Field Frame** — every input is a frame with its **micro-label set into the
top-left edge**, in registered micro-label type. Placeholders are not labels;
a value's name never disappears.

**Criteria Bar** — filters render as **formula**: `field operator value`
tokens joined by registered conjunctions, editable in place. Filters are
visible logic, not hidden dropdown states.

**Caliper** — the command instrument (Cmd-K). Verbs are registered:
**go / get / verify / attest**. The Caliper is **hash-first**: an input that
looks like an identifier routes to the identifier's object. It renders at
floating.4 with registered width and rhythm.

**Return** — the notification instrument. A Return is a bottom-left, hairline
toast with a **6 s** registered life, carrying verdict-appropriate semantics
and an optional receipt link. Returns never stack into noise; the registered
maximum is visible at once, older returns yield.

**Spine** — the persistent navigation instrument: a hairline rail that states
where you are in the instrument's territories (console, records, rules,
system). The Spine never hides behind discovery patterns; wayfinding is always
visible.

**Environment Stamp** — the attestation of context: **engine version · rule
set · environment**, always present in the chrome. If the stamp is missing,
the surface is not a Vaerion surface. The stamp renders in the Machine Voice
at registered micro scale.

**Gauge** — the progress instrument. After **300 ms** of expected wait, the
Gauge renders — a registered meter, never a spinner. Before 300 ms, the system
renders nothing: latency under 300 ms needs no progress display (§10).

**Lens** — the Proof Lens instrument (Bible Art. XII; visual registration
§12).

## §6 — Records and Data Display

Tables, logs, and timelines render as registered record surfaces: hairline
rules, fixed ledger rhythm, Machine Voice for literals, Human Voice for
explanations. Records are sliced honestly (Bible Art. X): counts of the whole
are always stated. Timestamps render in a registered absolute format with the
registered relative form permitted alongside — never instead.

## §7 — Motion

### §7.1 — The Motion Registry

Exactly **three canonical motions** exist:

1. **Seal** — a verdict state change; the seal commits (solid), empties
   (hollow), crosses (failed), or begins to pulse.
2. **Sweep** — a verification pass traveling its scope (a row, a receipt, a
   chain segment) and settling.
3. **Append** — a new record joining a ledger; the ledger grows, the spine of
   existing records does not move.

No fourth motion may be invented. Hover transitions are micro-affordances at
registered short durations, not registered motions.

### §7.2 — Motion Law

- Maximum duration **400 ms**; registered curves only.
- The registered settle-out curve is **cubic-bezier(0.2, 0, 0, 1)**.
- The needle-settle discipline: indicators land without oscillation; nothing
  bounces. Bounce reads as carelessness in an instrument.
- Motion communicates direction of certainty — toward verified, toward failed,
  toward pending — and nothing else.

### §7.3 — Reduced Motion

`prefers-reduced-motion` receives **complete informational parity**: every
motion's meaning is fully available without motion (state changes render as
instant state changes with full explainability). A meaning carried only by
movement is a violation (Bible Art. V/XIV).

## §8 — Icon

Icons render on a registered grid with registered stroke (hairline-consistent),
in registered sizes matching the seal sizes where they pair with verdicts.
Icons never carry verdict color (§4.3 reserves color), never replace seals, and
never decorate. An icon's meaning is registered with its name (dual naming,
§0); if an icon cannot be named precisely, it cannot ship.

## §9 — Layout and Responsive Evolution

The three skeletons (§1.4) evolve by registered breakpoint behavior, not by
ad-hoc squeeze:

- **Wide** — full instrument: skeleton + Margin Rail where registered.
- **Standard** — full instrument, rail collapses into registered positions.
- **Narrow / touch** — the instrument **degrades honestly**: capabilities that
  cannot render truthfully at the width are removed or explicitly labeled as
  unavailable on this surface — never faked, never truncated into ambiguity
  (Bible Art. VIII). Density reduces by registered gauge steps; the ledger
  rhythm (36 px) and seal clearances never compress below registration.

Touch targets meet registered minimums (44 px or the registered equivalent per
control class). A narrow surface that cannot be operated is declared, not
delivered broken.

## §10 — Latency and Feedback Contract

- **< 100 ms** — every intentional action receives acknowledgment within 100 ms
  (registered press/hover acknowledgment). Silence reads as failure.
- **< 300 ms** — no progress display (§5 Gauge).
- **≥ 300 ms** — the Gauge renders its registered meter.
- **Returns** live **6 s** (§5) and never interrupt focus.
- Cancellation is registered for every long operation; cancelled work restores
  the exact prior state (Implementation Constitution Part V state law).

Latency honesty is Bible Art. VIII applied to time: the system never fakes
completion, never fakes speed, and never hides waiting behind animation.

## §11 — Rendering Modes

Every surface must render correctly in all registered modes:

1. **Light chamber** (reading room) — ratified set §4.7.
2. **Dark chamber** (war room) — ratified set §4.7.
3. **Print** — receipts, attestations, exports render print-true: hairlines
   hold, seals render shape-true, color survives grayscale (§4.4).
4. **Grayscale** — verdicts readable with chroma removed (§4.4).
5. **Forced colors** — registered mappings; verdict identity survives via seal
   shape and label (Bible Part Three).
6. **Export** — signed exports render the registered export treatment: the
   record, its chain, its verifier names, and the Environment Stamp, without
   interactive-only affordances.

A mode that renders a verdict ambiguously is a violation regardless of how the
screen renders.

## §12 — The Proof Lens (Visual Registration)

The Lens is the veil moment (Bible Art. XII). Registered behavior:

- Hold on any claim → **veil.3** covers the surface; the claim's evidence chain
  renders at **lens.6**: full ink, full contrast, Chainline (§3.5) illuminated
  node by node; everything unrelated recedes.
- Release → restore, no residue.
- The Lens reveals **only** evidence the viewer is authorized to see (access
  control governs; the Lens adds light, never access).
- Transitions ≤ 400 ms on the registered curve; reduced-motion parity is
  complete (§7.3); contrast in the Lens state uses the registered text-level
  and glyph-level tokens (§4.6) — the Lens never trades contrast for drama.

## §13 — Interaction Grammar

### §13.1 — The Friction Ladder

Friction is registered per action class:

| Action class | Friction |
|---|---|
| Browsing, inspecting | **0** — no confirmation |
| Reversible action | **10 s undo** — registered Return with undo window |
| Significant action | **Ceremony** — registered confirmation dialog stating consequences in the Human Voice |
| Destructive action | **Receipt id** — the user types the record's identifier to confirm |

Friction is never decorative; a destructive action is never one accidental
Enter away, and a browsing action is never taxed.

### §13.2 — Keyboard

- The instrument is fully keyboard operable; focus is always visible and
  logically owned (Bible Art. XIV).
- **V / R / E** — verify / review / evidence traversal on a focused record.
- **J / K** — ledger traversal.
- **Cmd-K** — Caliper (§5).
- Hold-to-affirm: significant affirmations bind to a **600 ms hold**
  (registered key or pointer hold), with a registered click-path alternative
  for operators who cannot hold. The hold renders its progress on the
  registered meter; releasing early cancels with no partial effect.

### §13.3 — Registered Workflows

- **Verification workflow** — select record (J/K) → verify (V) → the sweep
  runs → the seal commits (or fails) → the decision itself issues a receipt:
  every human verification decision is itself recorded evidence.
- **Audit workflow** — select scope → export produces the **signed export**
  plus a **manifest receipt** naming the exporting engine, rule set, and
  environment (Bible Art. III).
- **System Attestation** — the Status skeleton renders the one-screen
  attestation for a CTO: engine version, rule set, environment, gate results,
  chain health. One screen, no scrolling narrative.

## §14 — Amendment Record — v1.0 → v1.0.1

This ratified increment absorbs the eleven-lens review (Apple HIG, Linear,
Stripe, Primer, Carbon, Fluent, Nielsen Norman Group, WCAG expert, CIO,
security engineer, novice developer). Codified changes, now part of the
ratified text above:

1. **Hash reveal is click-only** (§5 Hash Line) — hover reveal was withdrawn:
   shoulder-surf and screenshot leakage risk (security engineer lens).
2. **Lens contrast tokens split** — text-level and glyph-level contrast tokens
   are registered separately (§4.6, §12) so the Lens cannot dim evidence below
   legibility (WCAG expert lens).
3. **Reduced-motion and forced-colors parity elevated to first-class modes**
   (§7.3, §11) (NN/g and WCAG lenses).
4. **Mobile honest degradation** registered (§9) — "the desktop acts; narrow
   surfaces degrade honestly" (novice developer and CIO lenses).
5. **Teach the States** — permanent one-line explainers accompany verdict
   states (§13.3, Bible Art. XIII) (NN/g lens).
6. **Seal shape system** registered as color-independent verdict identity
   (Bible Part Three; §3.1) (grayscale and accessibility lenses).
7. **WCAG 2.2 AA** adopted as the standing conformance floor (§4.6, Bible
   Art. XIV).

## §15 — Ratification

- **Document:** VAERION_VISUAL_SYSTEM_v1.0.1
- **Status:** RATIFIED — second in precedence (Implementation Constitution P-1)
- **History:** drafted as the Visual System v1.0; eleven-lens review absorbed
  as the codified amendment record (§14); ratified as v1.0.1.
- **Value authority:** §4.7 tables are the sole ratified color-value source;
  §1.2 is the sole ratified spacing ramp; §3.2 the sole radius ladder; §3.4 the
  sole layer system; §7.1 the sole motion set. The Registry compiles from this
  text and from no other source (Implementation Constitution 2.1).
- **Amendment path:** Implementation Constitution 11.2–11.3 only.
- **Transcription:** completed under Foundation Amendment F-001 (governance
  item DP-2); integrity pinned in the Snapshot Authority manifest
  `constitution/snapshot-authority/manifests/canonical-documents.json`.

---

## TRANSCRIPTION RECORD (apparatus — not part of the ratified text)

- **Governance item:** DP-2, completed under Foundation Amendment F-001. This
  transcription closes the hard precondition for Stage 2 (Registry System).
- **Source:** the ratified session record of VAERION_VISUAL_SYSTEM_v1.0.1.
- **Method:** complete transcription of ratified substance — the seven
  registries, dual naming, the Gauge Ladder ramp, ceremonial spacing, page
  skeletons, the two voices, radius ladder, hairlines, layer system, Chainline,
  the two chambers and all ratified reference color values (§4.7), the
  primitives, motion registry and curve, icon law, responsive evolution, the
  latency contract, rendering modes, Lens registration, interaction grammar,
  and the v1.0.1 amendment record. No ratified value altered, no section
  renumbered against the citation map in use (repo citations resolve: §0, §1.2,
  §2.2, §3.2, §3.4, §4.4, §4.7, §5, §7.1, §8, §10, §11, §13, §14).
- **Recorded ambiguity (not resolved here):** the session record states the
  Gauge Ladder as "space.0–space.10" with a twelve-value ramp
  (0/2/4/8/12/16/24/32/48/64/96/128). The ramp is transcribed verbatim; the
  index/value count discrepancy is filed as **IR-004** in
  `constitution/interpretations/LEDGER.md` and is resolved only by Founder
  ruling. Stage 2 must not compile an index assignment that presumes a ruling.
- **Integrity:** the SHA-256 digest of this file at transcription is pinned in
  `constitution/snapshot-authority/manifests/canonical-documents.json`. Any
  later change to this file breaks the pinned digest and is a constitutional
  event requiring the amendment pathway.
