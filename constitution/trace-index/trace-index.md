# Constitutional Trace Index — Seed

**Authority:** Implementation Constitution P-4 — "Every rule in this document
carries a citation to its governing Article or Section. A consolidated index
of all citations is maintained alongside the registries. Any engineering
decision that cannot be traced to a citation is a violation of Article XI of
the Bible (Nothing Unmeasured Ships)."

**Maintenance:** every Stage 2+ artifact (token, primitive, gate, release
record) appends its citations here as part of its own completion report. The
documentation pipeline (Stage 10) publishes this index and fails on drift.
Audits sample entries and verify the cited authority exists; an uncitable
decision is a violation by definition (Constitution 11.6).

---

## Index

| # | Citation | Governed instrument / artifact | Kind |
|---|----------|--------------------------------|------|
| T-001 | Implementation Constitution P-1 (precedence) | `src/vaerion/foundation/authority.ts` — `resolvePrecedence`, `governingDocument`; `constitution/INDEX.md` §1 | code + governance |
| T-002 | Implementation Constitution P-4 + Bible Art. XI (traceability) | `src/vaerion/foundation/citations.ts` (citation model); `foundation/authority.ts` — `assertTraceable` | code |
| T-003 | Implementation Constitution P-5 (silence rule) | `constitution/interpretations/LEDGER.md` protocol | governance |
| T-004 | Implementation Constitution P-6 (fidelity standard) | `tools/vaerion-pipeline/README.md` §3 (Snapshot Authority contract, Stage 8) | architecture |
| T-005 | Volume IV directive "BUILD ORDER" | `src/vaerion/foundation/stages.ts` — `STAGES`, `assertStageMayBegin` | code |
| T-006 | Implementation Constitution Part II (token pipeline) | `src/vaerion/registry/README.md` (Stage 2 contract); `tools/vaerion-pipeline/README.md` §2 stages [1]–[2] | architecture |
| T-007 | Implementation Constitution 2.7 (generated bindings — implementation necessity) | `src/vaerion/registry/README.md` §5 | architecture |
| T-008 | Implementation Constitution Part IX (gates) | `tools/vaerion-pipeline/README.md` §2 stage [4], §4; Stage 8 scope | architecture |
| T-009 | Implementation Constitution Part X (release) | `tools/vaerion-pipeline/README.md` §2 stage [5], §5; Stage 9 scope | architecture |
| T-010 | Implementation Constitution Part XI (governance) | `constitution/amendments/LEDGER.md`, `constitution/interpretations/LEDGER.md` protocols | governance |
| T-011 | Implementation Constitution 11.4 (historical truth preserved) | `constitution/INDEX.md` §4; IR-003 proposed ruling | governance |
| T-012 | Visual System §0 (seven registries, dual naming) | `src/vaerion/registry/README.md` §1–2; `src/vaerion/docs/README.md` §5 | architecture |
| T-013 | Visual System §4.7 (reference color values) | Stage 2 token values source — text now transcribed and digest-pinned (DP-2, F-001) | architecture |
| T-014 | Bible Art. III (a verdict names its verifier) | release receipt contract — `tools/vaerion-pipeline/README.md` §5 | architecture |
| T-015 | Implementation Constitution 9.12 + Bible §16 (parity) | Parity Harness contract — `tools/vaerion-pipeline/README.md` §4 | architecture |
| T-016 | Volume IV directive Stage 1 (foundation scope) | repository architecture, governance folders, pipeline/docs/registry architecture contracts | governance |
| T-017 | Constitution P-4 / Stage 10 | documentation pipeline contract — `src/vaerion/docs/README.md` | architecture |
| T-018 | Constitution 10.1 (no waivers) | `tools/vaerion-pipeline/README.md` §1–2 failure semantics | architecture |
| T-019 | Foundation Amendment F-001 + P-6 | canonical transcriptions `constitution/bible/`, `constitution/visual-system/`; digest pins `constitution/snapshot-authority/manifests/canonical-documents.json`; `tools/vaerion-pipeline/verify-constitution.ts` | governance + code |
| T-020 | Foundation Amendment F-002 + P-6, 9.3 | Snapshot Authority — `constitution/snapshot-authority/README.md`, snapshots/, manifests/ | governance |
| T-021 | Foundation Amendment F-003 + 6.11 | Announcement & Copy Registry authority — `constitution/announcement-registry/README.md` | governance |
| T-022 | Foundation Amendment F-004 + Part II | Registry authority separation — `constitution/registry/README.md` (law) ↔ `src/vaerion/registry/README.md` (execution) | governance + architecture |
| T-023 | Foundation Amendment F-005 + 2.7 | generated artifact root — `generated/README.md`, `generated/bindings/`, `generated/tokens/` | governance |
| T-024 | Foundation Amendment F-006 + 10.3, 10.4 | release record authority — `constitution/releases/README.md` | governance |
| T-025 | Foundation Amendment F-007 + BUILD ORDER | dependency graph — `foundation/stages.ts` (declarations), `foundation/prerequisites.ts` (registry), `foundation/gate.ts` (engine), `foundation/verification.ts` (proofs), `tools/vaerion-pipeline/stages.ts`, `src/vaerion/docs/DEPENDENCY_GRAPH.md` | code + architecture |
| T-026 | IR-004 (Gauge Ladder index record) | `constitution/interpretations/LEDGER.md` — recorded transcription ambiguity, unresolved by design | governance |

## Open (unresolved) citation obligations

| # | Obligation | Blocks | Filed as |
|---|------------|--------|----------|
| ~~O-1~~ | ~~Transcribe Bible v1.0 text into `constitution/bible/`~~ | ~~Stage 10 documentation pipeline~~ | **CLOSED** — DP-1 complete (F-001); digest-pinned |
| ~~O-2~~ | ~~Transcribe Visual System v1.0.1 text (token values source) into `constitution/visual-system/`~~ | ~~Stage 2 Registry implementation~~ | **CLOSED** — DP-2 complete (F-001); digest-pinned |
| O-3 | Ratification of IR-001…IR-013, IR-014…IR-020 | IR-002 RATIFIED at Stage 9 (Founder's Stage 9 execution order — recorded in the interpretations ledger; gate proof IR-002-RATIFIED passes mechanically). Open: IR-001 (transition executed, T-033), IR-005 (type scale) and IR-010 (structural pins) refine Stage 2–4 renders; IR-009 and IR-012 ratify Stage 4 and Stage 6 strings; IR-006/007/008 confirmations optional; IR-011 pins the streaming budget; IR-013 rules investigation-record ownership; IR-014 pins the five unratified performance budgets; IR-015 ratifies the working capture set as the fidelity canon; IR-016 rules the 9.4 dichromacy simulation reading; IR-017 pins the release signature algorithm (Stage 10); IR-018 rules the Release Observatory display path (Stage 10); IR-019 defines external delivery evidence (Stage 10); IR-020 rules the Knowledge Interface display path (Stage 11) | Founder ruling |
| T-027 | Constitution 2.1–2.9 + VS §0, §1.2–§1.3, §2.1, §3.2–§3.5, §4.1–§4.7, §5.2, §7.1–§7.2, §8, §9, §10, §13.2 | Stage 2 Registry System — `constitution/registry/{token-schema,lifecycle,registries}.json` (law data), `src/vaerion/registry/` (token model, scales, seven registries, validation, compiler), `generated/{css,typescript,tokens}` (bindings), `tools/vaerion-pipeline/compile-registry.ts` (gates) | governance + code |
| T-028 | IR-004 (Gauge Ladder index record) | `src/vaerion/registry/scales.ts` (INDEXED_SPACE_RANGE), `src/vaerion/registry/registries/space.ts` (PENDING_INDEX_RAMP_VALUES) — compiles only the agreed range | code |
| T-029 | Constitution 3.0–3.15 + VS §5 | Stage 3 Primitive System — `src/vaerion/primitives/` (20 primitives, manifest, stylesheet), `tools/vaerion-pipeline/verify-primitives.ts` (conformance checks) | code |
| T-030 | Constitution Part IV + VS §1.4, §9, §11 | Stage 4 Composition — `src/vaerion/rendering/` (three skeletons, shell, rendering stylesheet), `src/vaerion/surfaces/` (ten surfaces, host, registry, copy, fixtures) | code |
| T-031 | IR-005…IR-010 | `constitution/interpretations/LEDGER.md` — Stage 2–4 ambiguity filings (type scale, ink formula, motion pins, layer treatments, Stage 4 strings, structural pins) | governance |
| T-032 | Constitution 4.7, 6.11 + F-003 | proposed string set — `constitution/announcement-registry/stage4-proposed-strings.json`, consumed by identifier in `src/vaerion/surfaces/copy.ts` | governance + code |
| T-033 | IR-001 (host-route transition), IR-003 (pre-ratification artifacts preserved) | `src/app/page.tsx` now mounts `SurfaceHost`; legacy site preserved untouched at `src/components/site/` | governance + code |
| T-034 | Constitution Part V (State Architecture) + 1.6, Art. VIII, Art. III | Stage 5 State Architecture — `src/vaerion/state/` (matrix, ownership, transitions, machine, honesty, quarantine, context provider, gates), `tools/vaerion-pipeline/verify-state.ts` (12 gates), `src/vaerion/docs/reports/STAGE-5-STATE-ARCHITECTURE-CONFORMANCE.md` | code |
| T-035 | Constitution 5.7 (the lawful transition set) | `src/vaerion/state/transitions.ts` — 13 rows transcribed row for row; every unlisted transition rejected with ConstitutionalViolationError | code |
| T-036 | Constitution 5.4 + 8.0 (ownership; the seven named authorities) | `src/vaerion/state/ownership.ts`, `src/vaerion/state/matrix.ts` (owner per state; authority identities) | code |
| T-037 | Constitution Part VI (Interaction Architecture) + 6.11, F-003 | Stage 6 Interaction Architecture — `src/vaerion/interaction/` (commands, keys, pointer, focus, confirm, hold, undo, receipts, latency, announce, lens, dispatcher, copy, gates), `tools/vaerion-pipeline/verify-interaction.ts` (15 gates), `src/vaerion/docs/reports/STAGE-6-INTERACTION-ARCHITECTURE-CONFORMANCE.md` | code |
| T-038 | IR-011 (streaming budget pin), IR-012 (Stage 6 strings) | `constitution/interpretations/LEDGER.md`; `constitution/announcement-registry/stage6-proposed-strings.json` consumed by identifier in `src/vaerion/interaction/copy.ts` | governance + code |
| T-039 | Directive series Stage 5/6 (manifest re-sequencing; Rendering preserved at 7) | `src/vaerion/foundation/stages.ts` (11 stages), `src/vaerion/docs/DEPENDENCY_GRAPH.md` (re-synced), `constitution/amendments/LEDGER.md` | governance |
| T-040 | Constitution Part VII (Rendering Architecture) + VS §3.4, §9, §11 | Stage 7 Rendering Engine — `src/vaerion/rendering/` (layers, strata, visibility, measurement, responsive, modes, pipeline, target, manifest, gates), `rendering.css` mode bindings (print / grayscale / forced-colors / export), `tools/vaerion-pipeline/verify-rendering.ts` (14 gates), `src/vaerion/docs/reports/STAGE-7-RENDERING-ARCHITECTURE-CONFORMANCE.md` | code |
| T-041 | Constitution 7.2 + VS §3.4 (the ordinal layer system) | `src/vaerion/rendering/layers.ts` consumes `LAYER_SYSTEM` (registry/scales — sole source); stacking binding ordinal × 10 cross-checked against generated/css/vaerion-tokens.css by the pipeline verifier | code |
| T-042 | Constitution 7.3 + Part V (visibility keyed to the canonical states) | `src/vaerion/rendering/visibility.ts` — twelve visibility obligations resolved from the State Matrix; skeleton structure-only, demo stamped, restricted hatched, empty teaching | code |
| T-043 | Constitution Part VIII (Data Architecture) + 8.0–8.9 | Stage 8 Data Authorities — `src/vaerion/authorities/` (hash, contracts, chain, evidence, verification, ledger, rule, identity, investigation, manifest, export, composition, gates), `tools/vaerion-pipeline/verify-authorities.ts` (16 gates), `src/vaerion/docs/reports/STAGE-8-DATA-AUTHORITIES-CONFORMANCE.md` | code |
| T-044 | IR-013 (investigation record ownership) | `constitution/interpretations/LEDGER.md`; `src/vaerion/authorities/investigation.ts` implements the 8.6 lifecycle without claiming an authority name (P-5) | governance + code |
| T-045 | Technology bindings of Stages 7–8 (1.5; 8.0) | grayscale suppression mechanism and SHA-256 integrity binding documented in-module (`rendering.css` mode blocks; `src/vaerion/authorities/hash.ts` — FIPS 180-2 vectors; F-002 precedent) | code |
| T-046 | Founder's Stage 9 execution order + IR-002 ruling | Stage 9 Testing Infrastructure executed; IR-002 recorded RATIFIED (gates are conformance tooling); directive note in `constitution/amendments/LEDGER.md` | governance |
| T-047 | Constitution 9.3, P-4, P-6, 10.1, 8.1 + F-002 + order Deliverable 1 | Snapshot Authority Engine — `src/vaerion/testing/snapshot/` (engine: creation, comparison, integrity, drift fail-closed, supersession-only; store: Node-only working captures under `tools/vaerion-pipeline/snapshots/`), `tools/vaerion-pipeline/verify-snapshots.ts` | code |
| T-048 | Constitution 9.12, 9.8, 7.1, 7.5 + order Deliverable 2 | Parity Harness — `src/vaerion/testing/parity.ts` (seven targets, six invariants, breakpoint parity), `tools/vaerion-pipeline/verify-parity.ts` | code |
| T-049 | Constitution 9.2, 9.3, 9.8, 9.10 + order Deliverable 3 | Visual Regression Engine — `src/vaerion/testing/visual/` (eight ordered areas; meaning-based structure, never pixels; no manual drift approval) | code |
| T-050 | Constitution 9.4, 9.5, 6.11 + F-003 + order Deliverable 4 | Accessibility Test Engine — `src/vaerion/testing/accessibility.ts` (keyboard, focus, announcements + registry parity, ARIA, AA/AAA contrast, dichromacy simulations, forced-colors, reduced motion; findings carry surface/primitive/rule/citation), `tools/vaerion-pipeline/verify-accessibility.ts` | code |
| T-051 | Constitution Part VI, 6.1 + order Deliverable 5 | Interaction Test Engine — `src/vaerion/testing/interaction.ts` (Stage 6 contracts; registry exclusivity proven by refusal; 15 gates re-proven) | code |
| T-052 | Constitution Parts V, VIII, 9.11, 9.13, 9.14 + order Deliverable 6 | State & Authority Test Engine — `src/vaerion/testing/state-authority.ts` (12 state gates, 16 authority gates, illegal-transition/quarantine/manifest-tamper refusal proofs) | code |
| T-053 | Constitution 9.9, 6.12, P-5, Art. XI + IR-011, IR-014 + order Deliverable 7 | Performance Gates — `src/vaerion/testing/performance.ts` (six measured quantities; only ratified bounds enforced: 100 ms / 300 ms / 6 s / 400 ms; unratified budgets reported with pin requested), `tools/vaerion-pipeline/verify-performance.ts` | code |
| T-054 | Constitution 1.6, Part VIII, 9.3 + F-002 + order Deliverable 8 | Security & Honesty Tests — `src/vaerion/testing/security.ts` (eight refusal proofs, each terminating in ConstitutionalViolationError), `tools/vaerion-pipeline/verify-security.ts` | code |
| T-055 | Constitution Part IX, 9.1, 10.1 + order Deliverable 9 | Complete Test Pipeline — `tools/vaerion-pipeline/verify-all.ts` + evidence records (`record.ts`, artifacts under `tools/vaerion-pipeline/artifacts/` with PASS/FAIL, evidence, citations, artifact location, timestamp, integrity hash); `bun run vaerion:test-all` | code |
| T-056 | IR-014, IR-015, IR-016 | `constitution/interpretations/LEDGER.md` — Stage 9 ambiguity filings (performance budget pins; fidelity-canon ratification; dichromacy simulation reading) | governance |
| T-057 | Founder's Stage 10 execution order | Stage 10 Release Engine executed — "Nothing is believed. Everything is verified."; directive note in `constitution/amendments/LEDGER.md` | governance |
| T-058 | Constitution Part X, 10.1–10.4 + 10.3 + F-006 + order Deliverables 1–2 | Release Authority & Ceremony — `src/vaerion/release/` (identity.ts, receipt.ts, authority.ts, ledger.ts, store.ts), first Release Receipt issued into `constitution/releases/` (rel_769da4b7bf84ad3b, 1.0.10.r1), `tools/vaerion-pipeline/release.ts` (`vaerion:release`) | code |
| T-059 | order Deliverable 3 + 10.1 + 2.7 + P-6 | Constitutional Build Engine — `src/vaerion/release/build.ts` (deterministic double-build proof, drift fails), `tools/vaerion-pipeline/verify-build.ts` (`vaerion:verify-build`) | code |
| T-060 | order Deliverable 4 + 2.8 + Art. II | Artifact Intelligence — `src/vaerion/release/artifacts.ts` (nothing anonymous), `tools/vaerion-pipeline/verify-artifacts.ts` (`vaerion:verify-artifacts`) | code |
| T-061 | order Deliverable 5 + 10.1–10.2 | Autonomous Release Verification + Article Gate — `src/vaerion/release/verification.ts` (composes the real Stage 2–9 engines; fourteen Articles demonstrated), `tools/vaerion-pipeline/verify-release.ts` + `full-graph.ts` (`vaerion:verify-release`) | code |
| T-062 | order Deliverable 6 + 10.4 + 11.4 | Rollback Engine — `src/vaerion/release/rollback.ts` (superseding receipts; superseded release untouched), `tools/vaerion-pipeline/verify-rollback.ts` (`vaerion:verify-rollback`) | code |
| T-063 | order Deliverable 7 + 8.7–8.8 + 5.10 | Distribution Engine — `src/vaerion/release/distribution.ts` (eight declared channels; composition with the manifest lifecycle; delivery refused without evidence — Art. VIII), `tools/vaerion-pipeline/verify-distribution.ts` (`vaerion:verify-distribution`) | code |
| T-064 | order Deliverable 8 + 8.8 + 11.5 | Trust Engine — `src/vaerion/release/trust.ts` (portable standalone verification of the stored release record), `tools/vaerion-pipeline/verify-trust.ts` (`vaerion:verify-trust`) | code |
| T-065 | order Deliverable 9 + 10.3 + Art. XI | Release Observatory — `src/vaerion/release/observatory.tsx`, `tools/vaerion-pipeline/observatory.ts` (`vaerion:observatory`), served at `/api/release/observatory` (IR-018); renders only real release data | code |
| T-066 | order Deliverable 10 + 10.1 | Mechanical Gates — verify-build / verify-signatures / verify-artifacts / verify-distribution / verify-rollback / verify-release / verify-trust / verify-everything, each emitting an evidence record (PASS/FAIL · evidence · citation · artifact · timestamp · SHA-256); `bun run vaerion:verify-everything` | code |
| T-067 | IR-017, IR-018, IR-019 | `constitution/interpretations/LEDGER.md` — Stage 10 ambiguity filings (signature algorithm binding; observatory display path; external delivery evidence) | governance |
| T-068 | Founder's Stage 11 execution order | Stage 11 Documentation Architecture executed — "Documentation is the memory of the system."; directive note in `constitution/amendments/LEDGER.md` | governance |
| T-069 | order Deliverables 1 + 5 + P-4 + 9.1 + 11.1 | Knowledge organ + Documentation Governance — `constitution/docs/` (nine knowledge documents + `GOVERNANCE.md`), `src/vaerion/docs/governance.ts` (the DOC-META machine law), `src/vaerion/docs/README.md` (the documentation pipeline contract) | governance + code |
| T-070 | order Deliverable 2 + P-1 | The Vaerion Codex — `constitution/docs/VAERION_CODEX_v1.0.md` (twelve chapters; every chapter references real implementation) | governance |
| T-071 | order Deliverable 3 + 4.6 + 3.11 + IR-020 | 2090 Experience Layer — `src/vaerion/docs/knowledge-interface.tsx` + `knowledge-host-route.tsx` (hash path `#/knowledge`), `src/app/api/knowledge/route.ts`, `src/app/page.tsx` (documented branch) | code |
| T-072 | order Deliverable 4 | Developer Pathways — `constitution/docs/pathways/` (First Contact, System Understanding, Architecture Mastery, Constitutional Engineering), `constitution/docs/DEVELOPER_JOURNEY.md` | governance |
| T-073 | order Deliverable 6 + Bible Art. VII | Search Intelligence — `src/vaerion/docs/search.ts` (hash-first: authority → registry → symbol → documentation), `src/app/api/knowledge/search/route.ts` | code |
| T-074 | order Deliverable 7 + 9.1 + F-005 + docs contract | Final Knowledge Verification — `tools/vaerion-pipeline/docs-shared.ts`, `publish-documentation.ts` (`vaerion:publish-docs`), `verify-documentation.ts` (`vaerion:verify-documentation`), published artifacts under `src/vaerion/docs/generated/` (trace-index publication, registry/stages/API docs, knowledge base) | code |
| T-075 | order Deliverable 8 | Final Ascension Report — `src/vaerion/docs/reports/VAERION_COMPLETE_CONFORMANCE_REPORT.md` | governance |
| T-076 | IR-020 (Knowledge Interface display path) | `constitution/interpretations/LEDGER.md` — Stage 11 ambiguity filing (documentation delivery vs product surface) | governance |
| T-077 | Founder's Phase 12 execution order | Launch Preparation executed — "Prepare the entire civilization for launch"; directive note in `constitution/amendments/LEDGER.md` | governance |
| T-078 | order sections 1–2, 5–6 + ADR-0001 | Repository & distribution & deployment preparation — version register extended to the editor manifests (`packages/vaerion/tests/integration/version-register.test.ts`), `editors/README.md` written (was empty), `.github/CODEOWNERS`, `.env.example` (names only), `tools/launch/credential-check.ts` (`launch:credential-check`), `docs/operations/LAUNCH-SEQUENCE.md` | code |
| T-079 | order section 3 + IR-018/IR-020/IR-021 | Launch website layer — `src/components/launch/` (LaunchShell, LaunchNav, LaunchFooter, BootScreen, Logo, pages Home/Vision/Observatory/DocumentationPortal) composing the preserved site pages + Knowledge Interface + instrument at `src/app/page.tsx`; Release Observatory surfaced at `#/observatory` (artifact served verbatim from `/api/release/observatory`) | code |
| T-080 | order section 4 + IR-003 | Official-logo reservation — `brand/OFFICIAL-LOGO-SLOT.md` (integration map + replacement procedure; no logo created, existing assets untouched) | governance |
