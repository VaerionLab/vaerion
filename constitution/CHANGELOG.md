# Constitutional Changelog

**Protocol (Implementation Constitution 11.3):** the changelog is versioned
like a protocol. Ratifications, amendments, and removals are recorded here.
The law itself changes only through the amendment ledger.

---

## [1.8.0] — Volume IV · Phase 12 (Launch Preparation & Externalization)

Executed under the Founder's "LAUNCH PREPARATION & EXTERNALIZATION ORDER"
(RULE ZERO + PHASE 12). Preparation, not invention: no ratified value
altered, nothing published, nothing deployed, no logo created; Stages
1–11 frozen — untouched. "Prepare the entire civilization for launch."

- **RULE ZERO** was executed against the full authority tree and the live
  records (all eleven stage conformance reports; the F-006 release record
  `rel_769da4b7bf84ad3b`; the Release Observatory artifact; the knowledge
  organ; the trace index T-001…T-076; the interpretation ledger
  IR-001…IR-020). Documentation below was generated from that proven
  reality only.
- **Repository preparation** — version alignment of the surfaces outside
  the engine register (root `package.json`, `editors/vscode`,
  `editors/jetbrains`, `BETA-ONBOARDING.md`, `SECURITY.md`,
  `SUPPORT.md`, `examples/README.md`) with the version of record
  `0.1.13-rc1`; the editor manifests added INSIDE the version register
  (`version-register.test.ts`); `editors/README.md` written (the file
  was empty); `.github/CODEOWNERS`; `.env.example` (variable NAMES only
  — no secret values); the `[Unreleased]` changelog entry.
- **Launch website architecture** — `src/components/launch/`: a thin
  routing shell composing the nine mandated sections (Home, Vision,
  Runtime, Architecture, Developers, Security, Documentation, Release
  Observatory, Download) over the completed systems — the ten-surface
  instrument (unmapped-hash default preserved), the Knowledge Interface
  (`#/knowledge`, IR-020), and the preserved site pages (IR-003) — plus
  the boot screen and the single logo component slot. Display path filed
  as **IR-021** (the IR-018/IR-020 instrument; the registry is not
  enlarged).
- **Distribution / deployment / credential readiness** —
  `editors/README.md` honest channel states; `docs/operations/LAUNCH-SEQUENCE.md`
  (the Founder-gated runbook); `tools/launch/credential-check.ts`
  (`bun run launch:credential-check` — existence-only, environment-only,
  publishes nothing). Nothing published; nothing deployed.
- **Logo reservation** — `brand/OFFICIAL-LOGO-SLOT.md`: the official-logo
  slot documented with the full integration map and replacement
  procedure; every existing brand asset byte-untouched (IR-003).
- **Launch record** — `VAERION_LAUNCH_READINESS_REPORT.md`: architecture
  state, completed systems, remaining external actions, required
  credentials, required assets, release steps, verification commands —
  with the honest gaps (F-2/F-4/F-5/F-6/R-7, IR-018/019/021, the three
  performance-budget breaches, the unverified host-gated channels).
- **Ledgers** — directive note RECORDED in the amendments ledger;
  trace index extended T-077…T-080 + O-3 lineage; **IR-021 filed
  (PROPOSED)**.

---

## [1.7.0] — Volume IV · Stage 11 (Documentation Architecture)

Executed under the Founder's "STAGE 11 — DOCUMENTATION ARCHITECTURE"
execution order. Stages 1–10 frozen — untouched. No ratified value altered;
no redesign; every artifact citation-traced. "Documentation is the memory of
the system."

- **Deliverable 1 — Knowledge Architecture** (`constitution/docs/`). The
  knowledge organ: ARCHITECTURE_MAP, SYSTEM_PHILOSOPHY, RUNTIME,
  GOVERNANCE_EXPLANATION, SECURITY_MODEL, RELEASE_MODEL, TESTING_MODEL,
  EXTENSION_MODEL, DEVELOPER_JOURNEY — every page carrying the DOC-META
  header (authority citations, owner, related artifacts, confidence state,
  last-verified date, verification command) and mechanically checked by the
  documentation gate.
- **Deliverable 5 — Documentation Governance.** `GOVERNANCE.md` — the law of
  the organ (no undocumented behavior; no drift; no marketing; generated
  documentation never hand-edited; the three confidence states: verified /
  derived / declared). Machine law: `src/vaerion/docs/governance.ts`
  (`parseDocMeta`, strict parser; malformed header = violation).
- **Deliverable 2 — The Vaerion Codex** (`VAERION_CODEX_v1.0.md`). Twelve
  chapters, Vision → Developer Extension, every chapter referencing real
  implementation and the measured numbers of record (64 tokens · 20
  primitives · 12 states · 13 commands · 7 authorities · 22,853 primitive
  checks · the first release `rel_769da4b7bf84ad3b`).
- **Deliverable 3 — 2090 Experience Layer.** The Vaerion Knowledge
  Interface: a deep-OLED command center (dark chamber, token-only values,
  the two voices, no font-size/weight, ≤400 ms motion) rendering only
  real data — `/api/knowledge` (stage manifest, F-006 release record, trace
  index, interpretation ledger, organ inventory) and `/api/knowledge/search`.
  Reached at the documented hash path `/#/knowledge` with the default
  instrument untouched — display path filed as **IR-020** (the IR-018
  instrument; the ten-surface registry is not enlarged).
- **Deliverable 4 — Developer Pathways.** Four guided journeys in
  `constitution/docs/pathways/` — First Contact, System Understanding,
  Architecture Mastery, Constitutional Engineering — each stating what to
  learn, what files to inspect, what laws apply, and what commands prove
  correctness.
- **Deliverable 6 — Search Intelligence.** Hash-first search
  (`src/vaerion/docs/search.ts`): exact authority references → registry
  identifiers (dual naming) → implementation symbols → documentation. The
  index is built from the live sources at request time; it never copies a
  registry.
- **Deliverable 7 — Final Knowledge Verification.** `vaerion:publish-docs`
  + `vaerion:verify-documentation` (`tools/vaerion-pipeline/docs-shared.ts`,
  `publish-documentation.ts`, `verify-documentation.ts`): fail-closed proof
  that every documented API exists, every citation resolves (Bible
  Articles / VS sections / Constitution rules / T-xxx / IR-xxx / F-xxx /
  directive notes), every stage reference is valid, every architecture claim
  matches live derivation, every documented command is a real script, and
  the five published artifacts under `src/vaerion/docs/generated/`
  (trace-index publication, REGISTRY_DOC, STAGES_DOC, API_DOC,
  knowledge-base) are byte-identical to a fresh regeneration. Result:
  **PASS — 646 checks, 0 violations** (evidence record, stage11 tag,
  SHA-256 integrity hash). During development the gate caught nine real
  defects in the organ's first draft (wrong paths, a stale mapping form,
  missing IR-020) — the gates decide, and the gates held.
- **Deliverable 8 — Final Ascension Report.**
  `src/vaerion/docs/reports/VAERION_COMPLETE_CONFORMANCE_REPORT.md` — all
  eleven stages, all gates, all releases, all authorities, all verification
  results, the final architecture state.
- **Governance:** trace index T-068…T-076 + O-3 update; IR-020 filed
  (PROPOSED); Stage 11 directive note in the amendments ledger; stage
  manifest Stage 11 → conformant after the full battery passed.

## [1.6.0] — Volume IV · Stage 10 (Release Engine)

Executed under the Founder's "MASTER PROMPT — STAGE 10 · RELEASE ENGINE"
execution order. Stages 1–9 frozen — untouched. No ratified value altered; no
redesign; every artifact citation-traced.

- **Deliverable 1 — Release Authority** (`src/vaerion/release/`). The sole
  issuer of releases (10.3; F-006 §5): Release Authority + Release Manifest
  Engine (the ceremony composition), Release Receipt Engine, Constitutional
  Version Engine (identity derived from the ratified titles and the Registry
  itself — never hand-typed; 2.8), Artifact Registry, Distribution Registry,
  Rollback Registry, and the append-only Release Ledger (10.4). The Node-only
  F-006 store records receipts under `constitution/releases/` and refuses
  overwrites — build outputs never enter the constitution tree.
- **Deliverable 2 — Immutable Release Ceremony.** Every release issues the
  seven-receipt ceremony — constitutional, build, artifact, registry,
  snapshot, integrity, distribution — each carrying the mandated anatomy
  (identity, timestamp, SHA-256, parent release, constitutional version,
  snapshot version, registry version, evidence references, chain references,
  authority, digital-signature placeholder, citations). Signatures are a
  deterministic placeholder bound to the release-signing key fingerprint
  (algorithm binding filed as IR-017); tampering is detectable by
  recomputation, never silent (8.8; F-006 law 4). `vaerion:verify-signatures`
  — PASS (determinism, tamper refusal, anonymous-key refusal).
- **Deliverable 3 — Constitutional Build Engine** (`build.ts`). Deterministic
  builds over the real source tree (158 files): two runs produce byte-identical
  records; any drift fails, never warns (10.1). The deterministic record
  carries no clock reading (P-6). `vaerion:verify-build` — PASS (double-build
  identity + injected-drift refusal + anonymous-build refusal).
- **Deliverable 4 — Artifact Intelligence** (`artifacts.ts`). Every artifact
  knows its origin, constitution, registry version, owning release, proving
  snapshots, approving authorities, and evidence; anonymous artifacts are
  refused with ConstitutionalViolationError ("Nothing may exist
  anonymously"). `vaerion:verify-artifacts` — PASS.
- **Deliverable 5 — Autonomous Release Verification** (`verification.ts`).
  Composes the real Stage 2–9 engines — registry validation, the fourteen
  rendering gates, the twelve state gates, the fifteen interaction gates, the
  sixteen authority gates, and the Stage 9 parity / visual / accessibility /
  interaction / state-authority / performance / security engines — plus the
  **Article Gate** (10.2): all fourteen constitutional Articles demonstrated
  from real evidence. If one check fails the release never exists — not a
  warning, not yellow. `vaerion:verify-release` — PASS (39 check lines).
- **Deliverable 6 — Rollback Engine** (`rollback.ts`). Rollback is
  constitutional history, not undo (10.4): rollback receipt, mandatory
  reason, parent chain, affected artifacts, integrity proof, evidence links,
  recovery chain; the superseded release receipt remains untouched (11.4).
  `vaerion:verify-rollback` — PASS (full supersession record + four
  refusal proofs).
- **Deliverable 7 — Distribution Engine** (`distribution.ts`). The eight
  declared channels (npm, pypi, vscode, jetbrains, neovim, cli, docs-bundle,
  offline-bundle) each prepare real hashed packages carrying constitutional
  identity, composed through the 8.7–8.8 manifest lifecycle; third-party
  recomputation proves each signed manifest; quarantined content is refused
  by construction (5.10; 8.7); `delivered` is honestly unreachable without
  external evidence (Art. VIII; IR-019). `vaerion:verify-distribution` — PASS.
- **Deliverable 8 — Trust Engine** (`trust.ts`). Portable verification: the
  stored release record verifies as pure data — every receipt digest,
  anatomy, signature, artifact provenance, and manifest recomputed — without
  product access, without the network (8.8; 11.5). Forged receipts and
  stranger keys are refused. `vaerion:verify-trust` — PASS.
- **Deliverable 9 — Release Observatory** (`observatory.tsx` +
  `tools/vaerion-pipeline/observatory.ts`). The command center rendered
  exclusively from the real release ledger — release chain, constitution
  version, registry evolution, snapshot evolution, artifact graph, integrity
  status, deployment history, rollback history, evidence graph, verification
  timeline — no fabricated metrics (Art. XI). Generated artifact served
  read-only at `/api/release/observatory` (display path filed as IR-018).
  `vaerion:observatory` — PASS.
- **Deliverable 10 — Mechanical Gates.** `verify-build` / `verify-signatures`
  / `verify-artifacts` / `verify-distribution` / `verify-rollback` /
  `verify-release` / `verify-trust` / `verify-everything` — every failure
  produces Evidence, Citation, Receipt (the evidence record), Integrity
  hash, and ConstitutionalViolationError. `bun run vaerion:verify-everything`
  — PASS (7/7 gates).
- **The first release.** `bun run vaerion:release` executed the full graph
  and issued **rel_769da4b7bf84ad3b — 1.0.10.r1** (seven receipts, four
  artifacts with full provenance, eight signed distribution channels,
  trust-verified) into `constitution/releases/receipts/` with the release
  index — the first Release Receipt, exactly as the F-006 authority
  anticipated. The ceremony is idempotent: an identical tree re-verifies
  instead of duplicating history (10.4; F-006 law 3).
- **Verification battery (all PASS, zero violations).** The standing
  eight-command battery (verify-constitution 3/3 digests; compile-registry;
  verify-primitives; verify-state; verify-interaction; verify-rendering;
  verify-authorities; test-all 8/8 engines) plus the eight Stage 10 gates;
  `bun run lint` exit 0; scoped `tsc --noEmit` 0 errors.
- **Governance.** Stage 10 marked conformant in the stage manifest; trace
  index extended (T-057…T-067); IR-017 (signature algorithm), IR-018
  (observatory display path), IR-019 (delivery evidence) filed (PROPOSED,
  P-5); Stage 10 directive note recorded in the amendments ledger; Stage 10
  conformance report issued at
  `src/vaerion/docs/reports/STAGE-10-RELEASE-ENGINE-CONFORMANCE.md`. Work
  front: Stage 11 (Documentation).

## [1.5.0] — Volume IV · Stage 9 (Testing Infrastructure)

Executed under the Founder's "STAGE 9 — TESTING INFRASTRUCTURE · EXECUTION
ORDER". Stages 1–8 frozen — untouched. No ratified value altered; no redesign;
every artifact citation-traced.

- **IR-002 ruled (Founder).** The Stage 9 order is the awaited ruling:
  constitutional gates are conformance tooling, never product test code.
  Recorded RATIFIED in the interpretations ledger; the stage-gate proof
  `IR-002-RATIFIED` passes mechanically. Stage 9 opened with
  `may begin: YES` (AUTH-SNAPSHOT + IR-002-RATIFIED proven).
- **Deliverable 1 — Snapshot Authority Engine** (`src/vaerion/testing/snapshot/`).
  Snapshot creation, digest-first comparison, SHA-256 integrity verification,
  fail-closed drift detection, immutable frozen records, citation tracking
  (uncitable captures rejected), and supersession-only canon evolution — no
  manual approval path exists. Working capture set stored as pipeline
  artifacts (`tools/vaerion-pipeline/snapshots/`); the constitution canon
  stays untouched pending the Founder's ratification (IR-015).
  `vaerion:verify-snapshots` — capture/pin, integrity, comparison, manifest
  drift: PASS.
- **Deliverable 2 — Parity Harness** (`src/vaerion/testing/parity.ts`).
  Seven targets (desktop, mobile, print, grayscale, forced-colors,
  reduced-motion, export) × six invariants (structure identical; evidence
  visible; receipt anatomy intact; chain breaks visible; restricted honest;
  nothing hidden), plus breakpoint parity (9.8; 7.5).
  `vaerion:verify-parity` — PASS.
- **Deliverable 3 — Visual Regression Engine** (`src/vaerion/testing/visual/`).
  Eight ordered areas — registry token usage, primitive geometry, surface
  composition, layer ordering, measurement contracts, responsive evolution,
  seal integrity, lens behavior — verified against meaning, never pixels;
  the forbidden list (pixel matching without meaning, ignoring
  constitutional structure, approving drift manually) is enforced by
  construction. PASS.
- **Deliverable 4 — Accessibility Test Engine** (`src/vaerion/testing/accessibility.ts`).
  Keyboard navigation, focus ownership/restoration, screen-reader
  announcements with both-way registry parity against the Announcement &
  Copy Registry (F-003, 21 ids), ARIA contracts, WCAG 2.2 AA pairs + AAA
  body text, the three dichromacy simulations of 9.4 (executed and recorded;
  numeric pins filed as IR-016 rather than guessed), forced-color survival,
  reduced-motion behavior. Every failure identifies surface, primitive,
  rule, citation. PASS.
- **Deliverable 5 — Interaction Test Engine** (`src/vaerion/testing/interaction.ts`).
  The Stage 6 contracts — commands, keyboard map, pointer/gestures,
  hold-to-confirm, confirmation ladder, undo window, Returns, failure
  receipts, announcement batching — plus registry exclusivity proven by
  refusal; the fifteen interaction gates re-proven. PASS.
- **Deliverable 6 — State & Authority Test Engine**
  (`src/vaerion/testing/state-authority.ts`). Stage 5 (transitions, illegal
  transitions refuse, ownership, honest states, quarantine) and Stage 8
  (authority boundaries, verdict ownership, chain integrity, evidence
  lifecycle, export restrictions, manifest integrity incl. tamper
  detection); the twelve state gates and sixteen authority gates re-proven.
  PASS.
- **Deliverable 7 — Performance Gates** (`src/vaerion/testing/performance.ts`).
  Six ordered quantities measured (first render, interaction latency, state
  transition latency, receipt generation time, registry compilation time,
  verification time); ONLY ratified bounds enforced (100 ms / 300 ms / 6 s /
  400 ms / 10 s / 5 s); unratified budgets reported with pin requested
  (IR-014) — nothing enforced against an invented number (Art. XI; P-5).
  `vaerion:verify-performance` — PASS.
- **Deliverable 8 — Security & Honesty Tests** (`src/vaerion/testing/security.ts`).
  Eight refusal proofs — fake verdicts, missing evidence, broken chains,
  unauthorized exports, unregistered tokens, unregistered commands,
  fabricated receipts, modified snapshots — each terminating in
  ConstitutionalViolationError. `vaerion:verify-security` — PASS (8/8).
- **Deliverable 9 — Complete Test Pipeline** (`tools/vaerion-pipeline/`).
  `verify-snapshots` / `verify-parity` / `verify-accessibility` /
  `verify-performance` / `verify-security` / `verify-all` +
  `bun run vaerion:test-all`; every command emits an evidence record
  (PASS/FAIL, evidence, citations, artifact location, timestamp, SHA-256
  integrity hash) under `tools/vaerion-pipeline/artifacts/`. Aggregate
  verdict: PASS — 8/8 engines.
- **Verification battery (all PASS, zero violations).**
  verify-constitution 3/3 digests; compile-registry GREEN (64 tokens,
  reproducibility + drift); verify-primitives 22,853 checks;
  verify-state 117; verify-interaction 175; verify-rendering 1,310;
  verify-authorities 131; test-all 8/8 engines; `bun run lint` exit 0.
- **Governance.** Stage 9 marked conformant in the stage manifest (root =
  the ordered path `src/vaerion/testing/`); trace index extended
  (T-046…T-056); IR-014, IR-015, IR-016 filed (PROPOSED, P-5); Stage 9
  conformance report issued at
  `src/vaerion/docs/reports/STAGE-9-TESTING-INFRASTRUCTURE-CONFORMANCE.md`.
  Work front: Stage 10 (Release Engine).

## [1.4.0] — Volume IV · Stages 7–8 (Rendering Architecture · Data Authorities)

Executed under the Founder's "VOLUME IV CONTINUES" directive (Stages 1–6
declared COMPLETE and RATIFIED; Stage 1–6 implementations frozen — no ratified
value altered, no redesign, every artifact citation-traced).

- **Stage 7 — Rendering Architecture (Part VII).** The constitutional
  rendering engine implemented (`src/vaerion/rendering/`): the ordinal layer
  system consumed from the Registry scales with the platform stacking
  binding cross-checked against the generated CSS (7.2; VS §3.4); the
  surface hierarchy — chrome → surface → region → primitive — with scope
  law, restyle prohibitions, and chrome-authored-once enforcement (7.1;
  4.1; 4.3); visibility contracts keyed to the twelve canonical states —
  attested or honestly labeled, skeleton structure-only, demo stamped,
  restricted hatched, empty teaching, absence declared (7.3; Part V);
  measurement validation — Gauge Ladder membership, the 4px baseline,
  registered intrinsic heights, ceremonial distances never compressed (7.4;
  VS §1); responsive evolution — four breakpoint contracts naming
  promotion/demotion (IR-010 pins), the Margin Rail at ultra-wide only,
  honest degradation, protected ledger/seal/touch rhythms, platform
  neutrality (7.5; VS §9); the six registered rendering modes and their
  renderers — print, grayscale, forced-colors, reduced-motion, export — with
  parity law and the export target refusing demo records and manifest-less
  exports by construction (7.6–7.10; VS §11); the rendering pipeline
  composing plans through the fixed strata with nothing rendering outside
  the constitutional contracts (P-3). Fourteen rendering gates pass
  mechanically (`vaerion:verify-rendering` — 1,310 checks, 0 violations).
  Mode bindings added to `rendering.css` (print/forced-colors extensions,
  grayscale/export targets); no Stage 1–6 behavior changed.
- **Stage 8 — Data Authorities (Part VIII).** The seven named authorities
  implemented with unambiguous ownership (`src/vaerion/authorities/`):
  Verification (queued → method bound — pinned at verification time →
  verdict issued → final; re-verification issues a new verification; the
  sole mint of verdict facts — 5.3; Art. III), Chain (genesis → append-only
  growth → continuously attestable integrity; first-class breaks; explicit
  recorded reconciliation; appends halt while a break is unreconciled —
  8.5; 5.9), Ledger (the receipt lifecycle of 8.1 — drafted → evidence
  gathered → verdict recorded from the Verification Authority's own fact →
  appended through the Chain Authority → immutable; correction by
  superseding receipt linked by parent; re-append refused; extension fields
  additive), Evidence (captured — hashed at capture → attested →
  referenced; restriction travels; missing evidence is a recorded state —
  8.2), Rule (drafted → ratified versioned → effective window → superseded;
  drift markers bound to receipts verified under the affected window —
  8.4), Identity (actors human/machine/engine; reveal-once credentials with
  mandatory ceremony; rotations and identity events enter the admin log as
  full receipts — 8.9), Export (criteria set → assembled from source
  records → manifest computed → signed → delivered; Demo quarantines refused
  by construction — 8.7; 5.10), plus the pure manifest lifecycle
  (immutable after signing; third-party verification without product
  access; brokenness detectable, never silent — 8.8) and the investigation
  lifecycle of 8.6 implemented without claiming an authority name
  (record-store ownership filed as IR-013 — P-5). Immutability is
  mechanical: every record set frozen; mutation attempts throw; correction
  is supersession only. The integrity substrate is a pure SHA-256 binding
  attested against the published FIPS 180-2 vectors (1.5; 8.0; F-002
  precedent). Sixteen data gates pass mechanically
  (`vaerion:verify-authorities` — 131 checks, 0 violations).
- **Governance.** Stage statuses 7 and 8 recorded conformant in the stage
  manifest; trace index extended (T-040…T-045); IR-013 filed (investigation
  record ownership — PROPOSED, P-5); work front advances to Stage 9
  (Testing Infrastructure), lawfully held by the unratified IR-002.

## [1.3.0] — Volume IV · Stages 5–6 (State Architecture · Interaction Architecture)

Executed under the Founder's "VOLUME IV CONTINUES" directive (Stages 1–4
declared COMPLETE and RATIFIED; Stage 1–4 implementations frozen). No ratified
value altered; no redesign; every artifact citation-traced.

- **Manifest re-sequencing (directive series).** Stage 5 = State
  Architecture; Stage 6 = Interaction Architecture; the Rendering Engine work
  front preserved at Stage 7 (a declared completion-condition set is lawful
  work and is never deleted — 11.4); Data Authorities → 8, Testing → 9,
  Release → 10, Documentation → 11. Recorded in the amendments ledger;
  `DEPENDENCY_GRAPH.md` re-synced in the same change set (also repairing the
  earlier drift where the document still described the Stage 1 plan).
- **Stage 5 — State Architecture (Part V).** The constitutional state engine
  implemented (`src/vaerion/state/`): the canonical State Matrix (twelve
  immutable state definitions — 5.1–5.2), ownership and the seven named
  authority identities (5.4; 8.0), the lawful transition set transcribed row
  for row with every guard enforced and every unlisted transition rejected
  with `ConstitutionalViolationError` (5.7), the state machine with immutable
  snapshots and append-only history, exact-restore cancellation with refusal
  after authority contact (5.8), recovery that revalidates chain integrity
  and refuses to paper over a gap (5.9), offline write-halt (5.2), demo
  quarantine and restriction travel (5.10; 8.2), the verdict boundary with
  optimism refused (5.3; 1.6), runtime state contracts (provider; authority →
  surface → primitive; token-gated dispatch — no sibling mutation, no
  primitive owns state; inheritance with attested overrides that never mask
  evidence-level restriction — 5.5–5.6). **Twelve state gates pass
  mechanically** (`vaerion:verify-state` — 117 checks).
- **Stage 6 — Interaction Architecture (Part VI).** The interaction engine
  implemented (`src/vaerion/interaction/`): the Command Registry on the
  Caliper verb grammar go/get/verify/attest with hash-first routing and
  free-form handlers prohibited (6.1; VS §5), the canonical key map owned
  centrally with shadow detection (V R E J K L Cmd-K Escape — 6.7), pointer
  and gesture ownership with the enumerated gesture set (6.9–6.10), the
  focus engine (one owner per surface; trap and restore; brass-ring
  contract — 6.8), intent declaration and the fixed confirmation ladder
  including typed-identifier destruction (6.2–6.3), hold-to-affirm on the
  registered 600 ms hold with path equivalence (6.6), the ten-second undo
  system with exact restoration (6.4; 5.8), act resolution to receipt /
  Return / Failure Receipt with nothing silent (6.5), latency contracts
  (100 ms acknowledgment, 300 ms Gauge, 6 s Returns; navigation without
  transition — 6.12), the announcement system bound to the Announcement &
  Copy Registry with polite batching and assertive reservation (6.11; F-003),
  the Lens interaction engine (four activation paths; focus law; ACL
  honesty — 3.15; Art. XII), and the command dispatcher synchronized with
  the Part V state machine. **Fifteen interaction gates pass mechanically**
  (`vaerion:verify-interaction` — 175 checks).
- **Governance.** Stage 6 strings registered as PROPOSED (IR-012,
  `constitution/announcement-registry/stage6-proposed-strings.json`,
  consumed by identifier); IR-011 filed (the streaming budget number is not
  enumerated in the ratified text — the contract is enforced as a declared
  bound, its pin requested); trace index extended (T-034…T-039); stage
  statuses 5–6 marked conformant after verification; current work front:
  Stage 7 (Rendering Engine).

## [1.2.0] — Volume IV · Stages 2–4 (Registry System · Primitive Architecture · Composition Architecture)

Executed under the Founder's combined Stage 2 / Stage 3 / Stage 4 execution
order. No ratified value altered; no redesign; every artifact citation-traced.

- **Stage 2 — Registry System.** The canonical Registry implemented
  (`src/vaerion/registry/`): token model (Constitution 2.2 — exactly seven
  fields), ratified scales transcribed from the digest-pinned Visual System,
  seven sub-registries (64 tokens), mechanical validation gates (2.6 — scale
  membership, contrast, grayscale survival, citation presence, lifecycle,
  duplicates, anatomy), and the deterministic token compiler (2.7) emitting
  read-only bindings under `generated/` (css / typescript / json) with
  byte-identical reproducibility and drift checks. Registry authority data
  added to the law tree (`constitution/registry/{token-schema,lifecycle,registries}.json`).
  IR-004 honored: only the agreed space index range compiled. Ambiguities
  filed: IR-005 (type scale), IR-006 (ink strengths), IR-007 (motion pins).
- **Stage 3 — Primitive Architecture.** All fifteen bound contracts of Part
  III implemented (Receipt, Panel, Seal, Chainline, Button, Input, Table,
  Log, Timeline, Environment Stamp, Spine, Dialog, Return, Gauge, Lens) plus
  the remaining Visual System §5 primitives under identical contract structure
  (Hash Line, Evidence Item, Ledger Row, Micro Label, Criteria Bar) — each
  with Responsibility / Boundaries / Extension / Composition, token
  references, state awareness, accessibility contract, and citations
  (P-4). Mechanical conformance: `vaerion:verify-primitives` (anatomy order,
  token usage, citations, forbidden behavior). Receipt anatomy order verified
  against Bible Art. VI.
- **Stage 4 — Composition Architecture.** Exactly three skeletons (4.1) with
  chrome inheritance (4.3); ten registered surfaces mounted per 4.6 bindings
  (Runtime, Ledger, Receipt Viewer, Constitution, Audit, Verification,
  Enterprise, Status, Playground, Search); Criteria Bar ownership (4.4);
  chain continuity with honest breaks (4.5); demo quarantine on all records
  (5.10) with exports disabled; no invented language (4.7) — copy consumed
  by identifier from the proposed string set (IR-009). Responsive evolution
  per VS §9 with honest degradation; IR-010 records the structural pins.
- **Host-route transition (IR-001).** The single user-visible route `/` now
  mounts `SurfaceHost` (the first constitutional surfaces landed); the
  pre-ratification site is preserved untouched as history (IR-003; 11.4).
- **Governance.** IR-005…IR-010 filed (interpretations ledger); trace index
  extended T-027…T-033; stage statuses 2–4 marked conformant after
  verification.

## [1.1.0] — Volume IV · Stage 1 Foundation Amendments (F-001…F-007)

- **F-001 (Canonical Authority Completion)** — VAERION_DESIGN_BIBLE_v1.0 and
  VAERION_VISUAL_SYSTEM_v1.0.1 transcribed into the authority tree
  (`constitution/bible/`, `constitution/visual-system/`) with separated
  transcription records; identity with the ratified originals proven
  mechanically via digest pins. DP-1 and DP-2 closed.
- **F-002 (Snapshot Authority)** — `constitution/snapshot-authority/`
  established (README, snapshots/, manifests/); first manifest
  (`canonical-documents.json`) pins the three ratified documents;
  `vaerion:verify-constitution` fails closed on divergence.
- **F-003 (Announcement & Copy Registry)** —
  `constitution/announcement-registry/README.md` established; no strings
  ratified yet.
- **F-004 (Registry Authority Separation)** — `constitution/registry/`
  established as the law of the canonical Registry; `src/vaerion/registry/`
  bound to execute it; neither replaces the other.
- **F-005 (Generated Artifact Root)** — `generated/{bindings,tokens}/`
  established with the generated-artifact law (`generated/README.md`).
- **F-006 (Release Record Authority)** — `constitution/releases/` established
  as the home of Release Receipts; build outputs excluded.
- **F-007 (Stage Dependency Graph)** — `assertStageMayBegin` extended into a
  complete dependency graph: every stage declares predecessors,
  constitutional prerequisites, and completion conditions;
  `foundation/{prerequisites,gate,verification}.ts` enforce it mechanically
  (unmet prerequisite → ConstitutionalViolationError; skipping structurally
  impossible); `bun run vaerion:stages` prints the live gate;
  `src/vaerion/docs/DEPENDENCY_GRAPH.md` documents the graph.
- **IR-004 filed** — Gauge Ladder index record (transcription ambiguity),
  PROPOSED for Founder ruling; unresolved by design during F-001.
- Trace Index extended (T-019…T-026); obligations O-1/O-2 closed.

## [1.0.0] — Volume IV · Stage 1 (Foundation)

- Repository establishment of the ratified design constitutional series under
  `constitution/` (authority tree) and `src/vaerion/` (implementation tree).
- `VAERION_IMPLEMENTATION_CONSTITUTION_v1.0` transcribed verbatim into the
  repository (governance item closed).
- Bible v1.0 and Visual System v1.0.1 transcription filed as **DP-1** and
  **DP-2** (verbatim, staged; DP-2 is a hard precondition for Stage 2).
- Governance ledgers established: amendments (empty), interpretation requests
  (**IR-001**, **IR-002**, **IR-003** — all PROPOSED), Trace Index seeded
  (T-001…T-018, obligations O-1…O-3).
- Foundation architecture implemented: citation model, precedence resolution,
  stage manifest with mechanical build-order enforcement, canonical path map.
- Architecture contracts ratified: Registry (Stage 2), documentation pipeline
  (Stage 10), build/gate/release pipeline (Stages 2–9 command surface).
- **No law was changed. No amendment was required. No visual artifact was
  built** (Stage 1 scope: "Nothing visual is built yet").

## [1.0.0] — Ratification of the constitutional series (session record)

- **VAERION_DESIGN_BIBLE_v1.0** — ratified by the Founder.
- **VAERION_VISUAL_SYSTEM_v1.0.1** — ratified; Impossible Test amendments
  absorbed into the ratified text.
- **VAERION_IMPLEMENTATION_CONSTITUTION_v1.0** — ratified; seven marked
  implementation necessities (Trace Index, generated bindings, Snapshot
  Authority, Announcement and Copy Registry, Data Authorities, State Matrix,
  Release Receipt) each justified by the fidelity standard, technology
  independence, or an existing Article.
