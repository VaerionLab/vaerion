# Constitutional Amendments — Ledger

**Protocol (Implementation Constitution 11.2–11.3).** An amendment proposal
must name the Article affected, the necessity, and the migration plan. An
amendment is ratified only after review against **every** prior Article — a
change legal under one Article but corrosive to another must not pass.
Ratification updates: the affected constitutional document(s), the registries,
the Snapshot Authority, the Trace Index, and this changelog, which is
versioned like a protocol (Visual System §23).

**Amendment statuses:** `PROPOSED` · `RATIFIED` · `WITHDRAWN` ·
`SUPERSEDED`.

---

## Ledger

### F-001 — Canonical Authority Completion — RATIFIED

- **Source:** Design Systems Authority directive, "Foundation Review — Stage 1"
  (Foundation Amendments are mandatory constitutional corrections, not
  optional improvements).
- **Mandate:** the complete ratified copies of VAERION_DESIGN_BIBLE_v1.0 and
  VAERION_VISUAL_SYSTEM_v1.0.1 are transcribed verbatim into the
  constitutional authority tree (`constitution/bible/`,
  `constitution/visual-system/`); no wording change, no meaning-altering
  formatting, no interpretation introduced; verification proves the repository
  copies identical to the ratified originals. Stage 2 was prohibited until
  complete.
- **Implementation:** both documents transcribed with separated transcription
  records (apparatus, not law); identity proven mechanically via the Snapshot
  Authority manifest `snapshot-authority/manifests/canonical-documents.json`
  (SHA-256 + byte pins; `bun run vaerion:verify-constitution`). Governance
  items **DP-1** and **DP-2** closed. Recorded ambiguity handled per P-5:
  **IR-004** filed for the Gauge Ladder index record (not resolved here).
- **Citations:** Implementation Constitution P-6, 2.1, 11.2–11.3;
  constitution/INDEX.md §2.

### F-002 — Snapshot Authority — RATIFIED

- **Mandate:** create the constitutional Snapshot Authority
  (`constitution/snapshot-authority/` with `README.md`, `snapshots/`,
  `manifests/`). No snapshots required yet; only the authority and governance
  structure.
- **Implementation:** authority established with the law of snapshots
  (ratified, pinned, never hand-edited, all registered modes, consumed never
  duplicated); first manifest pins the three ratified documents.
- **Citations:** Implementation Constitution P-6, 9.3, Part IX.

### F-003 — Announcement & Copy Registry — RATIFIED

- **Mandate:** create the constitutional Announcement and Copy Registry
  (`constitution/announcement-registry/README.md`). No announcement strings
  required yet; only the governing authority.
- **Implementation:** authority established with the law of copy (every string
  registered; voice declared; verdict explainers canonical; honesty
  constraints bind; no render-time invention; changes are amendments).
- **Citations:** Implementation Constitution 6.11; Bible Art. VII, VIII, XIII.

### F-004 — Registry Authority Separation — RATIFIED

- **Mandate:** separate constitutional authority from implementation.
  Constitutional registry under `constitution/registry/`; implementation under
  `src/vaerion/registry/`. The constitutional registry defines law; the
  implementation executes law; neither may replace the other.
- **Implementation:** `constitution/registry/README.md` established as the law
  of the canonical Registry (seven sub-registries, token anatomy, lifecycle,
  validation, bindings, versioning, ownership, value source); the
  implementation contract (`src/vaerion/registry/README.md`) re-titled and
  bound to execute that law. The same separation recorded for every authority
  pair.
- **Citations:** Implementation Constitution Part II, 2.4, 11.1.

### F-005 — Generated Artifact Root — RATIFIED

- **Mandate:** create the generated artifact hierarchy
  (`generated/bindings/`, `generated/tokens/`). Generated artifacts are never
  hand-authored; they are produced exclusively from the canonical Registry.
- **Implementation:** root established with `generated/README.md` stating the
  law of generated artifacts (never hand-authored, Registry-only source,
  reproducible, read-only, version-traceable, drift = failure); directories
  honestly empty until the Stage 2 compiler exists.
- **Citations:** Implementation Constitution 1.3, 2.1, 2.7.

### F-006 — Release Record Authority — RATIFIED

- **Mandate:** create the constitutional release record authority
  (`constitution/releases/`). Release Receipts belong here; build outputs do
  not.
- **Implementation:** authority established with the law of release records
  (every release produces its own receipt; receipts name their verifier; the
  chain is append-only; receipts are immutable; rollbacks produce superseding
  receipts; build outputs excluded).
- **Citations:** Implementation Constitution Part X, 10.3, 10.4; Bible Art. III.

### F-007 — Stage Dependency Graph — RATIFIED

- **Mandate:** extend `assertStageMayBegin()` into a complete dependency
  graph. Every stage must explicitly declare required predecessor stages,
  constitutional prerequisites, and completion conditions. A stage whose
  prerequisites are unmet must terminate immediately with a Constitutional
  Violation. Skipping stages must be structurally impossible.
- **Implementation:** `foundation/stages.ts` (every stage declares `dependsOn`,
  `constitutionalPrerequisites`, `completionConditions`);
  `foundation/prerequisites.ts` (prerequisite registry with proof obligations
  and citations); `foundation/gate.ts` (gate engine: `evaluateStageGate`,
  `assertStageMayBegin`, `assertNoSkippedStages`,
  `assertDependencyGraphIntegrity` — order enforcement independent of
  `dependsOn` so skipping cannot be re-introduced by edit);
  `foundation/verification.ts` (mechanical fs proofs, Node-only);
  `tools/vaerion-pipeline/stages.ts` (`bun run vaerion:stages`);
  `src/vaerion/docs/DEPENDENCY_GRAPH.md` (documentation).
- **Citations:** Volume IV directive BUILD ORDER + Amendment F-007;
  Implementation Constitution Part X, 9.1, 10.1.

### Directive Note — Stage 5/6 Execution Order (Founder, "Volume IV Continues") — RECORDED

- **Instrument:** the Founder's directive "VOLUME IV CONTINUES — STAGE 5 /
  STAGE 6" declaring Stages 1–4 COMPLETE and RATIFIED, and ordering **STAGE 5 —
  STATE ARCHITECTURE** (Part V — the complete constitutional state engine,
  mechanically enforced) and, after Stage 5 passes completely, **STAGE 6 —
  INTERACTION ARCHITECTURE** (Part VI). Stages 1–4 implementations are frozen:
  "DO NOT revisit / redesign / simplify / modernize / replace."
- **Effect:** the stage manifest (`src/vaerion/foundation/stages.ts`) is
  re-sequenced per the directive — Stage 5 = State Architecture (root
  `src/vaerion/state/`, previously reserved in the canonical path map), Stage 6
  = Interaction Architecture. The Rendering Engine work front (Part VII) is
  **preserved** and re-slotted at Stage 7; Data Authorities → 8, Testing
  Infrastructure → 9, Release Engine → 10, Documentation → 11. A declared
  completion-condition set is lawful work and is never deleted (Constitution
  11.4 — historical truth is never retired); the re-sequencing deletes nothing.
  `DEPENDENCY_GRAPH.md` re-synced in the same change set (its sync law), which
  also repairs the pre-existing drift where the document still described the
  Stage 1 plan (stage 4 = "State Engine") instead of the ratified Stage 2–4
  amendment (stage 4 = Composition Architecture).
- **Constitutional guard:** no Article or Section relaxed; Part V and Part VI
  are enforced as written; every artifact remains citation-traced (P-4); no
  value outside the ratified text is introduced (Art. XI; 1.3). Silences
  encountered during execution are filed in the interpretations ledger, never
  improvised (P-5).

### Directive Note — Stage 10 Execution Order (Founder, "MASTER PROMPT — STAGE 10 / RELEASE ENGINE") — RECORDED

- **Instrument:** the Founder's Stage 10 execution order — "Implement Part X
  — Release Engine… Every release must prove itself… Nothing is believed.
  Everything is verified." — with ten deliverables (Release Authority,
  Immutable Release Ceremony, Constitutional Build Engine, Artifact
  Intelligence, Autonomous Release Verification, Rollback Engine,
  Distribution Engine, Trust Engine, Release Observatory, Mechanical Gates)
  and the FINAL COMMAND: "Execute Stage 10 only. Do not begin Stage 11. Do
  not redesign previous stages. Do not modify constitutional law."
- **Effect:** the release engine is implemented per the order —
  `src/vaerion/release/` (identity, receipt, build, artifacts, ledger,
  rollback, distribution, verification, trust, authority, observatory
  modules + the Node-only F-006 store), the eight mechanical gate commands
  and the ceremony command under `tools/vaerion-pipeline/` ending in
  `bun run vaerion:verify-everything` and `bun run vaerion:release`, and the
  first Release Receipt issued by the Release Engine into
  `constitution/releases/` exactly as the F-006 authority anticipated. The
  stage manifest's Stage 10 status is marked conformant only after every
  gate passes (10.1 form — no partial passes).
- **Constitutional guard:** no Article or Section relaxed; Part X is
  enforced as written (10.1 — no waivers, no conditional ships; 10.4 —
  append-only chain, rollbacks as superseding receipts); Stages 1–9
  untouched except the stage manifest's Stage 10 status field; the
  constitution tree untouched except the governance ledgers and the
  F-006 release records the Release Engine itself issued; silences are
  filed (IR-017 signature algorithm binding, IR-018 observatory display
  path, IR-019 external delivery evidence), never improvised (P-5).

### Directive Note — Stage 9 Execution Order (Founder, "STAGE 9 — TESTING INFRASTRUCTURE") — RECORDED

- **Instrument:** the Founder's Stage 9 execution order declaring the Stage
  7/8 work ratified and ordering **STAGE 9 — TESTING INFRASTRUCTURE** — "the
  system must prove that the constitutional implementation remains identical,
  accessible, measurable, and honest across every target." The order also
  rules **IR-002** (recorded RATIFIED in the interpretations ledger): the
  Part IX gates are conformance tooling, not product test code.
- **Effect:** the testing infrastructure is implemented per the order's ten
  deliverables — the Snapshot Authority engine (`src/vaerion/testing/snapshot/`
  per the order's explicit path; the Stage 1 reservation `src/vaerion/gates/`
  remains untouched), the parity harness, the visual regression engine
  (`src/vaerion/testing/visual/`), the accessibility, interaction, state &
  authority, performance, and security & honesty engines, and the complete
  pipeline commands under `tools/vaerion-pipeline/` ending in
  `bun run vaerion:test-all`. The stage manifest's Stage 9 root is updated to
  the ordered path and Stage 9's status is marked conformant only after every
  verification command passes (Constitution 10.1 form — no partial passes).
- **Constitutional guard:** no Article or Section relaxed; Part IX is
  enforced as written (9.1 — every check mechanical, binary, cited); the
  constitution tree is untouched except the governance ledgers this note
  lives in; silences are filed (IR-014 performance budget pins, IR-015
  fidelity-canon ratification), never improvised (P-5).

### Directive Note — Stage 11 Execution Order (Founder, "STAGE 11 — DOCUMENTATION ARCHITECTURE") — RECORDED

- **Instrument:** the Founder's Stage 11 execution order — "Documentation is
  the memory of the system." Every statement must have source authority,
  citation, evidence, current status, ownership" — with eight deliverables
  (Knowledge Architecture, The Vaerion Codex, the 2090 Experience Layer,
  Developer Pathways, Documentation Governance, Search Intelligence, Final
  Knowledge Verification, the Final Ascension Report) and the rules: no
  redesign, no invention, no fake achievements, no simplification, no
  marketing.
- **Effect:** the knowledge organ is established at `constitution/docs/`
  (nine knowledge documents + this organ's governance law + the Codex + four
  developer pathways, each carrying a DOC-META header per the page metadata
  law); the documentation machine exists at `src/vaerion/docs/` (governance
  model, hash-first search, the 2090 Knowledge Interface served at the
  documented hash path `#/knowledge` with the routes `/api/knowledge` and
  `/api/knowledge/search` — display path filed as IR-020, the IR-018
  instrument); the verification pipeline exists at
  `tools/vaerion-pipeline/` (`docs-shared.ts`, `publish-documentation.ts`,
  `verify-documentation.ts`; scripts `vaerion:publish-docs`,
  `vaerion:verify-documentation`) and proves, fail-closed: every documented
  API exists, every citation resolves, every stage reference is valid, every
  architecture claim matches reality, no outdated claims exist, and the five
  published artifacts under `src/vaerion/docs/generated/` are byte-identical
  to a fresh regeneration. The stage manifest's Stage 11 status is marked
  conformant only after every gate passes (10.1 form — no partial passes).
- **Constitutional guard:** no Article or Section relaxed; the ten-surface
  product registry (4.6) and the Spine's enumerated set (3.11) are untouched
  — the Knowledge Interface is documentation delivery, not an eleventh
  surface (IR-020); Stages 1–10 untouched except the stage manifest's Stage
  11 status field; the constitution tree changed only in the governance
  ledgers and the new knowledge organ the order itself established;
  silences are filed (IR-020), never improvised (P-5).

### Directive Note — Stage 2–4 Execution Order (Founder, combined order) — RECORDED

- **Instrument:** the Founder's combined "STAGE 2 / STAGE 3 / STAGE 4
  EXECUTION ORDER" (Registry System → Primitive Architecture → Composition
  Architecture), issued after the Stage 1 exit declaration.
- **Effect:** the directive series governs the build order of Volume IV. The
  stage manifest (`src/vaerion/foundation/stages.ts`) is updated to record
  Stage 4 as Composition Architecture per this order; the state engine,
  rendering engine, interaction engine, data authorities, gates, release, and
  documentation stages remain in the manifest as future work fronts with
  their constitutional prerequisites intact.
- **Constitutional guard:** nothing in this order relaxes any Article or
  Section; every Stage 2–4 artifact remains citation-traced (P-4) and no
  value outside the ratified text was compiled (Art. XI; 2.1).

### Directive Note — Phase 12 Launch Preparation & Externalization Order (Founder, "LAUNCH PREPARATION & EXTERNALIZATION") — RECORDED

- **Instrument:** the Founder's "VAERION — LAUNCH PREPARATION &
  EXTERNALIZATION ORDER" (RULE ZERO complete reality inspection +
  PHASE 12 — LAUNCH READINESS), issued after the Stage 11 exit record.
- **Effect:** preparation, not invention. Repository preparation (trust
  documents audited; version alignment of the surfaces outside the engine
  register — root `package.json`, editor manifests, `SECURITY.md`,
  `SUPPORT.md`, `BETA-ONBOARDING.md`, `examples/README.md`; editor
  manifests added to the version register; `editors/README.md` written
  from empty; `.github/CODEOWNERS`; `.env.example` names-only). Package &
  distribution preparation (npm/PyPI/installer/editor structures armed —
  nothing published). Launch website architecture (`src/components/launch/`
  composing the ten-surface instrument, the Knowledge Interface, and the
  preserved site pages; display path filed IR-021). Logo integration
  preparation (`brand/OFFICIAL-LOGO-SLOT.md` — NO logo created or altered;
  the official asset is awaited from the Founder). Deployment preparation
  (`docs/operations/LAUNCH-SEQUENCE.md`; CI/CD of record untouched; no
  deployment). Credential readiness (`tools/launch/credential-check.ts`,
  existence-only, environment-only). `VAERION_LAUNCH_READINESS_REPORT.md`
  issued.
- **Constitutional guard:** no Article or Section relaxed; the ten-surface
  product registry (4.6), the Spine's enumerated set (3.11), the three
  ratified constitutions and their digest pins, and the F-006 release
  record are untouched; nothing was published, deployed, or transmitted;
  no secret value entered the tree; silences are filed (IR-021), never
  improvised (P-5); every new artifact is citation-traced (P-4).
