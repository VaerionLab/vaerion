# Interpretation Requests — Ledger

**Protocol (Implementation Constitution P-5, Part XI, Volume IV directive).**
Where the ratified documents are silent, engineers stop and file an
interpretation request. A request states: the undefined case, the missing
authority (with the closest constitutional citations), and a proposed ruling.
Proposed rulings are inert until ratified by the Founder / Design Systems
Authority. Improvised resolution of undefined cases is a violation regardless
of quality.

**Status vocabulary:** `PROPOSED` (awaiting ruling) · `RATIFIED` (binding) ·
`SUPERSEDED` (replaced by an amendment or later ruling) · `DECLINED`.

---

## IR-001 — Host route scope before the first constitutional surface exists

- **Filed:** Stage 1 (Volume IV)
- **Status:** PROPOSED
- **Undefined case:** the standing platform exposes a single user-visible
  route (`/`), which currently renders the pre-existing governance-console
  site from prior phases. The ratified documents define surfaces for Stages 3+
  but define no interim behavior for a pre-existing host route before any
  constitutional surface is implemented. Stage 1 builds nothing visual, so no
  ruling is required yet — but Stage 5/6 integration will require one.
- **Missing authority:** no Article of the Bible, Section of the Visual
  System, or Part of the Implementation Constitution addresses interim host
  behavior. Closest authorities: Constitution P-5 (silence rule), 1.4
  (engineers do not redesign), 11.4 (historical behavior is preserved, never
  silently retired).
- **Proposed ruling:** the existing `/` route remains exactly as-is — outside
  Volume IV scope — until a constitutional surface (Stage 5+) is implemented;
  it is neither redesigned toward the ratified system nor deleted. When the
  first constitutional surface lands, the host route is switched to it in a
  single, recorded governance transition, and the legacy site becomes a
  preserved historical artifact.
- **Citations:** Implementation Constitution P-5, 1.4, 11.4.

## IR-002 — Standing "no test code" constraint vs. constitutional gates

- **Filed:** Stage 1 (Volume IV)
- **Status:** RATIFIED
- **Ruling (Stage 9 execution order, Founder):** the Founder's "STAGE 9 —
  TESTING INFRASTRUCTURE · EXECUTION ORDER" commands "Implement Part IX —
  Testing Infrastructure … Build the machine that proves Vaerion is still
  Vaerion. Measure everything. Trust nothing without evidence. Let the gates
  decide." That order is the Founder ruling this request awaited: the
  proposed resolution stands as ratified — constitutional gates are
  implemented as **conformance tooling** (deterministic verification
  machinery, the instrument that enforces law), never as product test code.
- **Undefined case:** the standing environment directive for this project
  states "do not write any test code." The Implementation Constitution Part IX
  mandates eleven mechanical gates, the Snapshot Authority, and the Parity
  Harness as executable conformance checks, and the Volume IV directive orders
  their implementation at Stage 8. The two instruments conflict.
- **Missing authority:** the ratified documents cannot resolve a conflict with
  a standing platform directive; per the Volume IV directive ("If a required
  behavior is undefined, you must stop and report"), this is reported rather
  than silently resolved.
- **Proposed ruling (as ratified):** constitutional gates are implemented as
  **conformance tooling** (deterministic verification programs under
  `src/vaerion/gates/` and `tools/vaerion-pipeline/` — the machinery that
  *enforces* law, analogous to a compiler or linter, not product test code),
  and Stage 8 begins only after the Founder explicitly ratifies this
  interpretation. If declined, Stage 8 stops and gates are delivered as
  specifications only, with the conformance report recording the standing
  limitation.
- **Citations:** Implementation Constitution Part IX, 9.1; Volume IV directive
  Stage 8; standing platform directive (recorded here as the conflicting
  instrument); Founder ruling — "STAGE 9 — TESTING INFRASTRUCTURE · EXECUTION
  ORDER" (governance record: constitution/amendments/LEDGER.md, Stage 9
  directive note).

## IR-003 — Pre-ratification artifacts (brand tokens, site tokens, product constitution)

- **Filed:** Stage 1 (Volume IV)
- **Status:** PROPOSED
- **Undefined case:** the repository contains pre-ratification artifacts from
  prior phases: `brand/tokens.json` (and brand book/logos), a token block in
  `src/app/globals.css`, and the product-engineering constitution series
  `docs/constitution/VAERION_CONSTITUTION_v1.0–v1.7.md`. The ratified Visual
  System §0 and Implementation Constitution 1.3/2.1 establish that visual
  values may originate only from the canonical Registry, but the ratified
  documents do not state how pre-existing non-conforming artifacts should be
  disposed of.
- **Missing authority:** disposal/migration of pre-existing artifacts is
  outside the scope of all three ratified documents.
- **Proposed ruling:** the pre-ratification artifacts hold no constitutional
  authority, are preserved untouched as history (Constitution 11.4 — historical
  truth is never retired), are excluded from the Registry and from all Volume
  IV surfaces, and their migration or replacement is decided at the Stage 5
  integration point through a further interpretation request.
- **Citations:** Implementation Constitution 1.3, 2.1, 11.4; Visual System §0.
- **PHASE 16.3 relocation note (2026-09-24, Founder brand purge):** the
  Founder's BRAND PURGE DIRECTIVE ordered `brand/` to contain ONLY
  `brand/official/` (the uploaded official assets). In compliance — and to
  honor the 11.4 preservation intent of this ruling — `brand/tokens.json`
  was relocated intact (byte-identical) to `docs/history/brand-tokens.json`;
  `brand/BRAND-BOOK.md` and the pre-official logo directories were purged
  outright per the same order. The artifacts remain non-authoritative.

## IR-004 — Gauge Ladder index record (transcription ambiguity)

- **Filed:** Stage 1 (Volume IV), under Foundation Amendment F-001
  (transcription of the ratified Visual System).
- **Undefined case:** the ratified session record of Visual System §1.2 states
  the Gauge Ladder as **"space.0–space.10"** with a **twelve-value ramp**
  (0 / 2 / 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 px). An eleven-token
  enumeration cannot bind twelve values one-to-one; the ratified text does not
  state which value maps to which index beyond what the enumeration implies,
  and no Article resolves the discrepancy. F-001 prohibits introducing an
  interpretation during transcription, so the ramp was transcribed verbatim
  and the ambiguity is filed here rather than silently resolved.
- **Missing authority:** Visual System §1.2 (the ratified ramp), Bible Art. XI
  (nothing unmeasured ships — Stage 2 may not compile a token whose value is
  guessed), Implementation Constitution P-5, 2.1.
- **Proposed ruling (inert until ratified):** Option A — the ramp is
  authoritative and the enumeration is `space.0` = 0, `space.1` = 2, …
  `space.10` = 96, with **128 px entering the ladder only by ratified
  amendment** (as, e.g., `space.11`). Option B — the enumeration is
  `space.0–space.11` binding all twelve values in order. The Founder rules;
  until ruled, Stage 2 compiles only what Option A and Option B agree on (the
  ramp values themselves) and must not emit a `space.10`/`space.11` assignment
  that presumes a ruling.
- **Citations:** Visual System §1.2; Bible Art. XI; Implementation
  Constitution P-5, 2.1; Foundation Amendment F-001.

## IR-005 — Type Scale numeric pins

- **Filed:** Stage 2 (Volume IV), during Registry compilation.
- **Undefined case:** Visual System §2.2 fixes that type sizes register "on a
  fixed scale per voice" and that "weights are registered per voice," but the
  ratified text enumerates no numeric size and no numeric weight. The Registry
  may not compile values the law does not state (Bible Art. XI; P-5;
  Constitution 2.1).
- **Missing authority:** the numeric content of the Type Scale.
- **Resolution requested:** Founder pins the Type Scale (sizes and weights per
  voice). Until ruled, no `type.size.*`, `type.weight.*`, or `type.tracking.*`
  token is compiled, and no font-size/font-weight declaration exists anywhere
  in the implementation (mechanically enforced by
  `tools/vaerion-pipeline/verify-primitives.ts`); hierarchy is carried by
  voice, caps, hairlines, layers, and space (recorded in the Stage 2 report).
- **Citations:** Visual System §2.2; Bible Art. XI; Constitution 2.1, P-5.

## IR-006 — Ink ramp strength values (ink.16 / ink.32)

- **Filed:** Stage 2 (Volume IV).
- **Undefined case:** Visual System §3.3/§4.2 register hairline strengths
  `ink.16` and `ink.32` by name but the ratified text never states their hex
  values. The identifiers encode a formula — the named strength of
  full-strength ink (ink.100 at alpha 0.16 / 0.32) — and Stage 2 compiled
  them as formula tokens resolved per chamber (Constitution 2.2 permits
  "value or formula"). This reading is recorded here for confirmation; it is
  the identifier's own semantics, not an invented value.
- **Resolution requested:** Founder confirms the formula reading (or supplies
  ratified hex values).
- **Citations:** Visual System §3.3, §4.2, §4.7; Constitution 2.2.

## IR-007 — Canonical motion duration pins

- **Filed:** Stage 2 (Volume IV).
- **Undefined case:** Visual System §7.1 registers the three canonical motions
  by name; §7.2 registers the 400 ms ceiling and the settle-out curve. No
  per-motion duration is enumerated. Stage 2 compiled each canonical motion
  with the ratified bound itself (400 ms on the settle-out curve) — a formula
  of ratified numbers, nothing invented. Finer pins would sharpen fidelity
  (P-6) but require a ruling.
- **Resolution requested:** Founder pins per-motion durations within the
  400 ms bound (optional; the current compilation is lawful without it).
- **Citations:** Visual System §7.1, §7.2; Constitution 2.2, P-6.

## IR-008 — Layer treatments (veil, fog, surface fills) and icon grid/family

- **Filed:** Stage 2–4 (Volume IV).
- **Undefined case:** (a) Visual System §3.4 says "each layer's treatment is
  registered," but the ratified text states no numeric treatment for the veil
  (veil.3 dimming) or the Lens fog, and no surface.1 fill distinct from the
  ground. The implementation renders the veil/fog at the registered ink.32
  strength (closest registered ink strength for a dimming stratum) and panels
  as hairline-framed ground — recorded here as the interim reading. (b) §8
  registers an icon grid and per-icon naming but no grid number and no
  family; no icon.grid.*/icon.family.* token is compiled.
- **Resolution requested:** Founder pins veil/fog treatment and, if glyph
  icons beyond registered geometry are ever needed, the grid and family.
- **Citations:** Visual System §3.4, §8, §12; Constitution 1.3, P-5.

## IR-009 — Stage 4 announcement and copy strings (PROPOSED set)

- **Filed:** Stage 4 (Volume IV).
- **Undefined case:** Constitution 4.7 requires surface copy to come from the
  Announcement & Copy Registry (F-003), which held no ratified strings when
  Stage 4 was ordered — yet the ordered surfaces require guidance sentences
  and the Art. XIII verdict explainers. The minimal required string set is
  registered in `constitution/announcement-registry/stage4-proposed-strings.json`
  and consumed by identifier only (`src/vaerion/surfaces/copy.ts`); no string
  is composed at render time. This request asks the Founder to RATIFY the set.
- **Resolution requested:** ratification of the proposed strings (all marked
  `proposed (IR-009)`); wording changes then follow the amendment pathway.
- **Citations:** Constitution 4.7, 6.11; F-003; Bible Art. VII, VIII, XIII.

## IR-010 — Stage 4 structural pins (breakpoints, Returns maximum, Lens hold, attestation fields)
- **Filed:** Stage 4 (Volume IV).
- **Undefined case:** the ratified text registers behaviors but not the numbers
  the platform needs to execute them: (a) breakpoint widths (VS §9/§11 name
  Wide/Standard/Narrow/ultra-wide without px); (b) the Returns "registered
  maximum" visible at once (VS §5.23) — implemented as 3; (c) the Proof Lens
  pointer-hold duration (VS §12 names pointer hold without a duration) —
  implemented as 350 ms, within the motion bound; (d) the "four governing
  questions" of the Status surface (4.6) are not enumerated — the attestation
  field set of VS §13.3 (engine version, rule set, environment, gate results,
  chain health) is rendered instead.
- **Resolution requested:** Founder pins the breakpoint widths (implemented:
  ≥1440 ultra-wide / ≥1024 standard / ≥768 tablet / <768 narrow), the Returns
  maximum, the Lens hold, and (optionally) canonical wording for the four
  questions.
- **Citations:** Visual System §5.23, §9, §11, §12, §13.3; Constitution 4.6, P-5.

## IR-011 — The streaming budget number (append streaming)

- **Filed:** Stage 6 (Volume IV), during Interaction Architecture.
- **Undefined case:** Constitution 6.12 registers the latency contract
  "appends streamed within the streaming budget [VS §13, §7.3]" and 9.9 gates
  it ("append streaming within budget"), but neither the Implementation
  Constitution, the Visual System, nor the Bible enumerates the budget's
  number. The contract is lawful and enforced as a named bound; its numeric
  pin is not (Bible Art. XI — no number is invented; P-5).
- **Missing authority:** the numeric value of the streaming budget.
- **Resolution requested:** Founder pins the streaming budget (a measured
  bound for append streaming, in the same spirit as the 100 ms / 300 ms / 6 s
  pins already ratified). Until ruled, the contract is enforced as a declared
  bound with its pin requested; the interaction latency gate records the
  absence honestly.
- **Citations:** Constitution 6.12, 9.9; Visual System §13, §10; Bible
  Art. XI; Constitution P-5.

## IR-012 — Stage 6 interaction strings (PROPOSED set)

- **Filed:** Stage 6 (Volume IV), during Interaction Architecture.
- **Undefined case:** Constitution 6.11 requires every announced string to
  resolve from the Announcement & Copy Registry (F-003), which held no
  ratified strings when Stage 6 was ordered — yet the interaction engine's
  Returns, failure receipts, cancellation notices, offline/recovery chrome
  announcements, hold-to-affirm guidance, and Lens Escape guidance require a
  minimal string set. The set is registered in
  `constitution/announcement-registry/stage6-proposed-strings.json` and
  consumed by identifier only (`src/vaerion/interaction/copy.ts`); no string
  is composed at render time. This request asks the Founder to RATIFY the
  set (the same instrument as Stage 4's IR-009).
- **Resolution requested:** ratification of the proposed strings (all marked
  `proposed (IR-012)`); wording changes then follow the amendment pathway.
- **Citations:** Constitution 6.11, 4.7; F-003; Bible Art. VII, VIII.

## IR-013 — Ownership of investigation records (Constitution 8.6 vs 8.0)

- **Filed:** Stage 8 (Volume IV), during Data Architecture.
- **Undefined case:** Constitution 8.6 defines the investigation lifecycle
  (opened → annotated → shared → closed; the shared investigation replays
  the exact saved fog and chain, honoring present-day restrictions), but
  Constitution 8.0 names exactly seven authorities and none of them owns
  investigation records: the Verification Authority issues verdicts, the
  Chain Authority owns append order and integrity, the Ledger Authority owns
  receipt records, the Evidence Authority owns artifacts and restrictions,
  the Rule Authority owns rulesets, the Identity Authority owns actors and
  credentials, and the Export Authority owns bundles and manifests. No
  authority's owned domain covers the investigation record store, and
  inventing an eighth authority is prohibited without amendment (8.0 — "the
  names are constitutional").
- **Missing authority:** the owner of investigation records (the criteria,
  lens snapshot, annotations, and share state of 8.6).
- **Resolution requested:** Founder rules either (a) that investigation
  records are Evidence Authority artifacts (an investigation snapshot is an
  owned artifact; annotations are Margin Notes attached to it), or (b) that
  investigation records require an eighth named authority (a constitutional
  amendment under 11.2–11.3), or (c) another ruling. Until ruled, Stage 8
  implements the lifecycle of 8.6 exactly (`src/vaerion/authorities/investigation.ts`)
  while it claims no authority name, composes the Chain Authority for the
  chain-position pin and the Evidence Authority for restriction truth, and
  stores nothing outside its own module scope.
- **Citations:** Constitution 8.6, 8.0, 8.2, P-5; Bible Art. XII; Constitution 11.2–11.3.

## IR-014 — Performance budget pins for the Part IX performance gate

- **Filed:** Stage 9 (Volume IV), during Testing Infrastructure.
- **Undefined case:** the Stage 9 execution order mandates a performance gate
  measuring first render, interaction latency, state transition latency,
  receipt generation time, registry compilation time, and verification time,
  and forbids invented budgets: "If a number is not ratified: create
  Interpretation Request, do not guess." The ratified text pins some bounds —
  interaction acknowledgment < 100 ms (6.12; VS §10), the Gauge delay
  300 ms (VS §10), Returns 6 s (VS §5.23), the motion ceiling 400 ms
  (VS §7.2) — but states no number for first render, state transition
  latency, receipt generation time, registry compilation time, or
  verification time. Bible Art. XI prohibits inventing a number the law does
  not state.
- **Missing authority:** the numeric budgets for the five unratified
  measurements.
- **Resolution requested:** Founder pins the five budgets (measured bounds in
  the spirit of the ratified 100 ms / 300 ms / 6 s pins). Until ruled, the
  performance gate measures and reports each quantity honestly, enforces only
  the ratified bounds, and records "pin requested (IR-014)" — nothing is
  enforced against an invented number (Constitution 9.9; 6.12; P-5; Art. XI).
- **Citations:** Constitution 9.9, 6.12, P-5; Visual System §10, §5.23, §7.2;
  Bible Art. XI; Stage 9 execution order (Deliverable 7).

## IR-015 — Ratification of the initial Snapshot Authority capture set as the fidelity canon

- **Filed:** Stage 9 (Volume IV), during Testing Infrastructure.
- **Undefined case:** the Snapshot Authority law (F-002) holds that snapshots
  enter the fidelity canon only through governance ratification and that "an
  unratified image in this tree is a violation." Stage 9 implements the
  Snapshot Authority engine (creation, comparison, integrity verification,
  drift detection) per the execution order, but no ratified reference
  rendering set exists yet. The engine therefore captures a **working
  reference set** under pipeline tooling (`tools/vaerion-pipeline/snapshots/`
  — pipeline artifacts, never the constitution tree) and proves its integrity
  and drift status mechanically; the constitution canon
  (`constitution/snapshot-authority/snapshots/`) remains empty until the
  Founder ratifies a capture set.
- **Missing authority:** the Founder ruling that a specific capture set is
  the fidelity canon (9.3 — "the ratified canonical rendering set").
- **Resolution requested:** Founder ratifies the working reference set (a
  dated manifest digest) as the fidelity canon, promoting it into
  `constitution/snapshot-authority/snapshots/` with its pin manifest. Until
  ruled, visual regression runs in record-and-prove-integrity mode against
  the working set — digest-first, fail-closed, no manual approval path — and
  the limitation is recorded honestly in the Stage 9 conformance report
  (P-5; 9.3; F-002).
- **Citations:** Constitution 9.3, P-5, P-6; Foundation Amendment F-002; Stage
  9 execution order (Deliverables 1 and 3).

## IR-016 — Numeric pins for the 9.4 dichromacy simulations

- **Filed:** Stage 9 (Volume IV), during Accessibility Test Engineering.
- **Undefined case:** Constitution 9.4 mandates that "color-independence [is]
  validated under deuteranopia, protanopia, and tritanopia simulations
  [VS §10]" but states no numeric acceptance bound for the simulated
  projections. Executing the simulations mechanically (Machado, Oliveira &
  Fernandes 2009 apparatus, severity 1.0) shows that one ratified verdict
  color (`color.verdict.failed`, dark chamber `#C65B4E` per VS §4.7) falls
  below the 4.5:1 WCAG AA text minimum against ground under deuteranopia
  (4.23:1) and protanopia (3.25:1) — while passing AA in unfiltered vision
  (registry validation, VS §4.6) and while the verdict's meaning is carried
  structurally by shape + word + position (Art. IV; VS §4.4 grayscale
  survival), never by hue alone. The ratified text therefore supports two
  readings: (a) the simulations validate that meaning never depends on hue —
  the structural reading, enforced now (grayscale survival + distinct seal
  shapes), with simulated values recorded as evidence; or (b) the simulated
  projections must themselves meet a numeric contrast minimum — which would
  require amending the ratified VS §4.7 color set, because the current
  ratified values cannot satisfy it.
- **Missing authority:** the numeric acceptance bounds (if any) for the 9.4
  simulations.
- **Resolution requested:** Founder rules reading (a) or (b). Under (a), the
  gate's current form stands as lawful (simulations executed, values
  recorded, structural independence enforced). Under (b), a constitutional
  amendment must replace the affected VS §4.7 values or scope the
  simulations to glyph-level minimums, and the Registry recompiles
  accordingly. Until ruled, no invented number is enforced (Art. XI; P-5),
  and the measured values are reported in the Stage 9 conformance report.
- **Citations:** Constitution 9.4, P-5; Visual System §4.4, §4.6, §4.7;
  Bible Art. IV; Stage 9 execution order (Deliverable 4).

## IR-017 — The release signature algorithm binding (Constitution 8.8; 10.3)

- **Filed:** Stage 10 (Volume IV), during Release Engine.
- **Undefined case:** the Stage 10 execution order mandates a "Digital
  Signature placeholder" on every ceremony receipt; the ratified law requires
  manifests to be signed and immutable after signing (8.8) and receipts to
  name their verifier (10.3; Art. III) — but no ratified text names a
  signature algorithm or key ceremony for releases. The implemented placeholder
  is a deterministic SHA-256 keyed digest bound to the fingerprint of
  `keys/release-signing.pub` (ed25519 SPKI): same body + same key = same
  signature; any body alteration detaches it (proven by `vaerion:verify-signatures`).
- **Missing authority:** the asymmetric algorithm, key ceremony, and rotation
  law for release signatures.
- **Resolution requested:** Founder pins the signing algorithm (e.g. ed25519
  over the canonical receipt body, consistent with ADR-0010/0018 lineage) and
  the key ceremony. Until ruled, the placeholder remains deterministic,
  tamper-detecting, and honestly labeled in every receipt's
  `signatureAlgorithm` field — nothing stronger is claimed (Art. VIII; P-5).
- **Citations:** Constitution 8.8, 10.3, 11.5, P-5; F-006; Bible Art. III;
  Stage 10 execution order (Deliverable 2).

## IR-018 — Display path of the Release Observatory (Constitution 4.6; 3.11)

- **Filed:** Stage 10 (Volume IV), during Release Engine.
- **Undefined case:** the Stage 10 execution order mandates a Release
  Observatory ("the command center… every visualization must originate from
  real release data"), but the enumerated product surface set (4.6) holds
  exactly ten registered surfaces, and the Spine's enumerated set admits new
  sections only by amendment (3.11). The implemented observatory renders
  exclusively from the stored release record (F-006) and is generated as a
  pipeline artifact (`tools/vaerion-pipeline/observatory/index.html`), served
  read-only at `/api/release/observatory` — tooling output, not an eleventh
  product surface.
- **Missing authority:** whether the Release Observatory is (a) permanently
  release tooling, or (b) promoted into the enumerated surface set (which
  would require the Founder's amendment of 4.6/3.11).
- **Resolution requested:** Founder rules (a) or (b). Until ruled, the
  observatory remains a generated artifact outside the product surface
  registry, honestly labeled (P-5; 11.4 — nothing is deleted either way).
- **Citations:** Constitution 4.6, 3.11, P-5; Bible Art. XI; Stage 10
  execution order (Deliverable 9).

## IR-019 — Delivery evidence for external distribution channels (Constitution 8.7)

- **Filed:** Stage 10 (Volume IV), during Release Engine.
- **Undefined case:** the export lifecycle ends at 'delivered' (8.7), and the
  Stage 10 order mandates eight distribution channels; but no ratified text
  defines what evidence constitutes 'delivered' for external registries (npm,
  PyPI, VS Code Marketplace, JetBrains, Neovim, package index) — and this
  environment cannot contact them. The Distribution Engine therefore stops
  honestly at 'signed' and REFUSES `markDelivered` without external delivery
  evidence (Art. VIII — deployment history is never fabricated); the refusal
  is proven mechanically in `vaerion:verify-distribution`.
- **Missing authority:** the definition of delivery evidence (registry
  response, publish log digest, or other proof) that lawfully moves a channel
  from 'signed' to 'delivered'.
- **Resolution requested:** Founder pins the delivery-evidence definition per
  channel. Until ruled, no channel claims delivery; the honest state is
  rendered everywhere (observatory, receipts — Art. VIII).
- **Citations:** Constitution 8.7, 1.6, P-5; Bible Art. VIII; Stage 10
  execution order (Deliverable 7).

## IR-020 — Display path of the Knowledge Interface (Constitution 4.6; 3.11; P-5)

- **Filed:** Stage 11 (Volume IV), during Documentation Architecture.
- **Undefined case:** the Stage 11 execution order mandates a "documentation
  interface … the Vaerion Knowledge Interface" (Deliverable 3), but the
  enumerated product surface set (4.6) holds exactly ten registered surfaces
  and the Spine's enumerated set admits new sections only by amendment
  (3.11). The Knowledge Interface is documentation delivery — the rendering
  of the knowledge organ (`constitution/docs/`, the Stage 11 Codex, the
  pathways, the search intelligence, and the live stage/registry/release
  data) — and it composes the existing constitutional primitives and tokens;
  it adds no eleventh surface to `SURFACE_REGISTRY`.
- **Missing authority:** whether the Knowledge Interface is (a) permanently
  documentation tooling rendered at the host route through a documented hash
  path (`#/knowledge`), the same instrument as the Release Observatory's
  IR-018, or (b) promoted into the enumerated surface set (which would
  require the Founder's amendment of 4.6/3.11).
- **Resolution requested:** Founder rules (a) or (b). Until ruled, the
  interface is mounted at the documented hash path with the host route's
  default composition unchanged (`src/app/page.tsx` — `SurfaceHost` remains
  the primary mount; the interface is honestly labeled as documentation
  delivery, not a registered surface), the mechanism is recorded in the
  amendments ledger directive note for Stage 11, and nothing is deleted
  either way (11.4).
- **Citations:** Constitution 4.6, 3.11, P-5, 11.4; Bible Art. XI; Stage 11
  execution order (Deliverable 3); `constitution/docs/GOVERNANCE.md` §6.2;
  IR-018 precedent.

## IR-021 — Display path of the launch website layer (Constitution 4.6; 3.11; P-5)

- **Filed:** Phase 12 (Launch Preparation & Externalization), during launch
  readiness.
- **Undefined case:** the Phase 12 execution order mandates a launch website
  with nine sections (Home, Vision, Runtime, Architecture, Developers,
  Security, Documentation, Release Observatory, Download), but the
  enumerated product surface set (4.6) holds exactly ten registered
  surfaces and the Spine's enumerated set admits new sections only by
  amendment (3.11). The launch layer (`src/components/launch/`) is website
  delivery: a thin routing shell that composes the constitutional
  instrument (untouched), the Knowledge Interface (IR-020), and the
  pre-ratification site pages (IR-003 — preserved unmodified as composed
  sources); it adds no eleventh surface to `SURFACE_REGISTRY`.
- **Missing authority:** whether the launch layer is (a) permanently
  website delivery rendered at the host route through documented hash
  paths — the same instrument as the Release Observatory's IR-018 and the
  Knowledge Interface's IR-020 — or (b) promoted into the enumerated
  surface set (which would require the Founder's amendment of 4.6/3.11).
- **Resolution requested:** Founder rules (a) or (b). Until ruled, the
  layer mounts at the documented hash paths with the host route's
  historical default preserved (unmapped hashes render the instrument;
  `#/instrument` names it explicitly), every section is honestly
  composed from real data, nothing is deleted either way (11.4), and the
  mechanism is recorded in the amendments ledger directive note for
  Phase 12.
- **Citations:** Constitution 4.6, 3.11, P-3, P-5, 11.4; Bible Art. XI;
  Phase 12 execution order (section 3 — Website Preparation); IR-018 and
  IR-020 precedents.
