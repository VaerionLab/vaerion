# VAERION_CODEX_v1.0

<!--
DOC-META
id: DOCS-CODEX
title: The Vaerion Codex
owningSystem: Stage 11 — Documentation Architecture (src/vaerion/docs)
authorityCitations: VAERION_DESIGN_BIBLE_v1.0; VAERION_VISUAL_SYSTEM_v1.0.1; VAERION_IMPLEMENTATION_CONSTITUTION_v1.0; Implementation Constitution P-1; Implementation Constitution P-4; Implementation Constitution P-5; Implementation Constitution Part XI; Foundation Amendments F-001-F-007; Visual System §0; Stage 11 execution order Deliverable 2
relatedArtifacts: constitution/; src/vaerion/; tools/vaerion-pipeline/; constitution/trace-index/trace-index.md; constitution/docs/GOVERNANCE.md; constitution/docs/DEVELOPER_JOURNEY.md
confidence: verified
lastVerified: 2026-09-22
verificationCommand: bun run vaerion:verify-documentation
-->

**The Vaerion Codex — the civilization archive of a verifiable runtime.**

This Codex is the primary documentation artifact of Vaerion, created under
the Founder's Stage 11 execution order (Deliverable 2). It records what the
system **is** — not what it aspires to be. Every chapter references real
implementation, every measured number comes from the conformance reports and
their evidence records, and every claim is mechanically checked by
`bun run vaerion:verify-documentation`. Where this Codex and the ratified
law disagree, the law prevails (P-1) — and the disagreement is a
documentation violation.

**Edition:** v1.0 · Stage 11 · protocol 1.6.0 · Registry 1.0.0 ·
first release `rel_769da4b7bf84ad3b` (1.0.10.r1).

---

## CONTENTS

| Chapter | Title | Subject |
|---|---|---|
| I | The Vision | why certainty without drama exists |
| II | The Constitution | the three ratified documents and their organs |
| III | The Runtime | from route to pixel to verdict |
| IV | The Registry | the seven registries and the generated bindings |
| V | The Primitive Language | twenty law-manifestations |
| VI | The State Machine | twelve states, one door for verdicts |
| VII | The Interaction Grammar | thirteen commands, the termination law |
| VIII | The Rendering Universe | layers, modes, and the Proof Lens |
| IX | The Authority System | seven authorities, append-only history |
| X | The Testing Fortress | eight engines; nothing believed |
| XI | The Release Ceremony | the gate that is the ceremony |
| XII | Developer Extension | the four lawful ways to grow |

---

# CHAPTER I — THE VISION

**The claim:** software asks the world to trust its makers. Vaerion removes
the request. Every claim the system renders carries either its evidence or
an explicit UNVERIFIED mark — there is no third option (Bible Art. II).

**The feeling:** certainty without drama (Bible Part One). Calm the way a
calibration laboratory is calm — not because nothing is at stake, but
because everything is measured. The interface is permitted to be
disappointing; it is not permitted to be misleading (Art. VIII).

**The metaphor:** a metrology institute for machine claims (Bible Part Two).
An agent's claim is a measurement; the verdict is the seal; the receipt is
the certified record; the chain is the registry ledger. The seal — not the
weight — is what the world trusts.

**The memory:** *"Anything without proof says so out loud."* (Bible Part
Six.)

**The proof the vision is real:** the vision is not a manifesto in this
system; it is enforced machinery. The four verdicts are a closed set
(`src/vaerion/primitives/seal.tsx` — the only circle, the only filled glyph,
the only verdict color); the receipt anatomy is mechanically proven in
source order by `tools/vaerion-pipeline/verify-primitives.ts` (Bible Art.
VI); and the standing test of 11.7 exists to detect the day the system
drifts from its own identity.

---

# CHAPTER II — THE CONSTITUTION

**The law.** Three ratified documents, in fixed precedence (P-1):

1. **VAERION_DESIGN_BIBLE_v1.0** (`constitution/bible/`) — the emotional
   core, the metaphor, the four verdicts with the seal shape system, the
   fourteen Articles, the Proof Lens, the brand memory.
2. **VAERION_VISUAL_SYSTEM_v1.0.1** (`constitution/visual-system/`) — the
   seven registries and dual naming (§0), space, type, shape and surface,
   color, the primitives (§5), records, motion, icon, layout, latency,
   rendering modes, the Proof Lens, the interaction grammar.
3. **VAERION_IMPLEMENTATION_CONSTITUTION_v1.0**
   (`constitution/implementation-constitution/`) — the engineering law:
   P-1…P-6 and Parts I–XI.

**The organs** (INDEX.md §2a; F-002…F-006): the Snapshot Authority, the
Announcement & Copy Registry, the Registry authority (law) with its
implementation (execution), the generated artifact root, the release record
authority — and, since Stage 11, the knowledge organ (`constitution/docs/`).

**The governance ledgers:** amendments (F-001…F-007), interpretation
requests (IR-001…IR-021; IR-002 RATIFIED), the trace index (T-001…T-080,
obligation O-3), and the changelog (protocol-versioned, [1.8.0]).

**The discipline:** engineers implement; they do not redesign (1.4). Where
the law is silent, they stop and file (P-5). Conformance is binary (P-3).
The fidelity standard is interchangeability (P-6): two teams from the
documents and registries alone must build indistinguishable implementations.

**The proof:** `bun run vaerion:verify-constitution` — the SHA-256 digests
of the three ratified documents match the Snapshot Authority pins (3/3;
`constitution/snapshot-authority/manifests/canonical-documents.json`).

---

# CHAPTER III — THE RUNTIME

**The host.** One route (`src/app/page.tsx`) mounts `SurfaceHost`
(`src/vaerion/surfaces/host.tsx`) — the transition IR-001 anticipated. The
Shell mounts the chrome once (Environment Stamp + Spine) and carries the ten
registered surfaces in exactly three skeletons: Console (six surfaces),
Document (two, with the ultra-wide Margin Rail at 320 px), Status (two)
(Constitution 4.1, 4.3, 4.6; VS §1.4).

**The ten surfaces** (`src/vaerion/surfaces/registry.ts`): Runtime, Ledger,
Receipt Viewer, Constitution, Audit, Verification, Enterprise, Attestation
Status, Playground, Search — enumerated, closed, each with its binding
citation.

**The chamber.** The two chambers of VS §4.1 — a light reading room and a
dark war room — are an operational choice of the host; chambered values are
resolved per chamber everywhere.

**The spine.** Four registered territories (3.11; VS §5.20): console,
records, rules, system. The Spine hosts navigation and nothing else.

**The demo truth.** All pre-authority records are Demo-stamped; the stamp
travels with the record and renders wherever the record appears (5.10). The
Environment Stamp tells the truth about the environment it renders in.

**The proof:** Stage 4 browser verification (measured, recorded in the
Stage 4 conformance report): both chambers render; the Spine navigates all
ten surfaces; hold-to-affirm issues a decision receipt with a Return; the
Proof Lens illuminates by keyboard L and restores on Escape; all ten
surfaces are overflow-free at 390 px.

---

# CHAPTER IV — THE REGISTRY

**The law.** One canonical Registry, seven sub-registries in registered
order — Space, Type, Shape, Color, Motion, Elevation, Icon (VS §0;
Constitution Part II). The constitutional law lives at
`constitution/registry/` (F-004); the implementation at
`src/vaerion/registry/` executes it and may never replace it.

**The anatomy.** Every token carries exactly seven fields — identifier,
instrumentName, value or formula, constraints, governingCitation, version,
status (2.2). An uncitabled token is void at construction.

**The holdings.** 64 tokens, Registry version 1.0.0, all active: Space 16,
Type 5, Shape 13, Color 9, Motion 9, Elevation 7, Icon 5. The Gauge Ladder
compiles space.0–space.10 (0…96 px) with 128 px held as
ratified-but-unindexed per IR-004; the Type Scale numbers are held open per
IR-005 — no font-size or font-weight exists anywhere, enforced mechanically.

**The compiler.** `src/vaerion/registry/compiler.ts` emits the generated
bindings — `generated/css/vaerion-tokens.css` (73 custom properties,
chamber-scoped), `generated/typescript/tokens.ts`,
`generated/tokens/registry.json` — exclusively, reproducibly, and never by
hand (F-005; 2.7).

**The validation.** Eleven mechanical gates (2.6): anatomy, citation
presence, duplicates, lifecycle, ladder memberships, seal/icon sizes, motion
values, §4.7 value identity, WCAG contrast (≥4.5:1 text, ≥3:1 glyph, per
chamber), grayscale survival.

**The proof:** `bun run vaerion:compile-registry` — validation GREEN,
two-compilation byte-identity PASS, committed-drift PASS.

---

# CHAPTER V — THE PRIMITIVE LANGUAGE

**The law.** Every primitive is a constitutional rule made executable (1.2).
Each carries the four binding clauses — Responsibility, Boundaries,
Extension, Composition (3.0) — plus tokens, state awareness, an
accessibility contract, and standing citations (P-4).

**The twenty manifestations** (`src/vaerion/primitives/`): the fifteen bound
contracts — Receipt (3.1), Panel (3.2), Seal (3.3), Chainline (3.4), Button
(3.5), Input/Field Frame (3.6), Audit Table (3.7), Log (3.8), Timeline
(3.9), Environment Stamp (3.10), Navigation/Spine (3.11), Dialog (3.12),
Toast/Return (3.13), Gauge (3.14), Lens (3.15) — plus the five remaining
Visual System §5 primitives: Hash Line, Evidence Item, Ledger Row (fixed
36 px rhythm), Micro Label, Criteria Bar.

**The character of the language.** The Receipt renders its anatomy in the
sacred order and never computes a verdict (1.6). The Seal is the only
circle, the only filled glyph, the only verdict color. The Gauge renders
nothing before 300 ms and refuses unmeasured progress. The Lens dims the
room and lights the proof (Art. XII). The Criteria Bar owns every filterable
set (4.4) and displays its formula: `field operator value`.

**The proof:** `bun run vaerion:verify-primitives` — **22,853 checks, 0
violations**: manifest completeness, per-line literal scan (zero literal
visual values), receipt anatomy proven by source-position assertion, token
resolution, forbidden-behavior scan (no `Math.random`, no `Date.now`, no
`fetch`, no verdict computation).

---

# CHAPTER VI — THE STATE MACHINE

**The law.** Twelve immutable states (5.1–5.2; `src/vaerion/state/matrix.ts`):
verdict-domain — verified, failed, pending, restricted, demo; system-domain —
idle, loading, skeleton, empty, offline, recovery, error. Each carries its
ratified definition, rendering obligations, owner, and fact authority.

**The ownership.** Seven named authorities (5.4; 8.0;
`src/vaerion/state/ownership.ts`). Propagation runs authority → surface →
primitive, one direction (5.5); dispatch is token-gated so sibling mutation
is structurally impossible (`src/vaerion/state/context.tsx`).

**The transitions.** The lawful set of 5.7 transcribed row for row —
13 rows over 11 events (`src/vaerion/state/transitions.ts`). Every guard
enforced: skeleton only above the registered threshold; Empty only on lawful
absence; verdicts only with a named verifier; cancellation only with an
exact-restore target; recovery only with revalidation and no unreconciled
break. **Every unlisted transition throws `ConstitutionalViolationError`.**

**The honesty.** The machine (`src/vaerion/state/machine.ts`) keeps immutable
snapshots and an append-only history; offline halts writes while reads
continue; the pre-act state is recorded on entering Pending; cancellation
after authority contact is refused and the refusal recorded. The honesty
module (`src/vaerion/state/honesty.ts`) refuses optimism as a structural
property (Art. VIII).

**The proof:** `bun run vaerion:verify-state` — **117 checks, 0 violations**
across the twelve state gates.

---

# CHAPTER VII — THE INTERACTION GRAMMAR

**The law.** Thirteen registered commands on the Caliper verb grammar —
go / get / verify / attest (6.1; VS §5.8; `src/vaerion/interaction/commands.ts`).
Every interactive element binds to a registered command; free-form handlers
are prohibited. Input resolves hash-first: identifier-shaped input finds the
identifier.

**The keyboard.** The canonical map — V R E J K L Cmd-K Escape — owned
centrally, constitutionally unshadowable (6.7; `keys.ts`), with the lawful E
duality (evidence traversal / criteria edit, disambiguated by focus
context).

**The friction.** The confirmation ladder (6.2–6.3): single acts reversible;
ceremony acts dialogued with the governing rule quoted; destructive acts
demand the typed exact identifier. Hold-to-affirm is the registered 600 ms
(6.6); early release cancels with no partial effect. Undo lives ten seconds
and restores exactly (6.4; 5.8).

**The termination law.** Every interaction ends in exactly one of three
instruments (6.5): a **receipt**, a **Return** (6 s life from the Registry),
or a **Failure Receipt** carrying the receipt id. Nothing terminates
silently; the resolution validator throws on any null resolution.

**The latency.** Acknowledgment < 100 ms; Gauge only after 300 ms; Returns
6 s; navigation without transition — all consumed from the Registry scales
(6.12; VS §10). The streaming budget is enforced as a declared bound with
its pin requested (IR-011) — no number was invented (Art. XI).

**The proof:** `bun run vaerion:verify-interaction` — **175 checks, 0
violations** across the fifteen interaction gates.

---

# CHAPTER VIII — THE RENDERING UNIVERSE

**The strata.** chrome → surface → region → primitive (7.1;
`src/vaerion/rendering/strata.ts`); chrome authored once (4.3); scope law
and restyle prohibitions enforced.

**The layers.** Seven ordinal layers — ground.0, surface.1, sticky.2,
veil.3, floating.4, ceremony.5, lens.6 (7.2; `layers.ts`; VS §3.4) —
stacking bound to ordinal × 10 and cross-checked against the generated CSS.
Shadows and glass are impossible.

**The visibility.** Twelve obligations keyed to the canonical states (7.3;
`visibility.ts`): skeletons render structure only; demo is stamped;
restricted evidence is hatched; empty states teach; absence is declared.

**The measurement.** Gauge Ladder membership; the 4 px baseline with its
registered half-step; intrinsic heights — ledger 36, touch 44, rail 320,
seals 16/20/28/44, chainline 2·8, hairline 1 (7.4); ceremonial distances
never compressed.

**The responsive evolution.** Four breakpoint contracts (IR-010 pins:
≥1440 / ≥1024 / ≥768 / <768), each naming promotion and demotion; the Margin
Rail at ultra-wide only; honest degradation, never scaling-only (7.5);
ledger, seal, and touch rhythms never compress.

**The modes.** Six registered modes (7.6–7.10; VS §11; `modes.ts`): print,
grayscale, forced-colors, reduced-motion, export — grayscale-first; verdict
identity carried by seal shape; export refuses demo records and
manifest-less exports by construction.

**The Proof Lens.** The signature moment (Art. XII): press and hold any
claim and the room recedes while its evidence chain illuminates at lens.6.
Four activation paths; the keyboard path always available; Escape restores
focus to the originating claim; restricted evidence renders hatched — the
Lens adds light, never access.

**The proof:** `bun run vaerion:verify-rendering` — **1,310 checks, 0
violations** across the fourteen rendering gates.

---

# CHAPTER IX — THE AUTHORITY SYSTEM

**The law.** Exactly seven named authorities (8.0;
`src/vaerion/authorities/contracts.ts`), their names constitutional —
inventing an eighth requires amendment:

| Authority | Owns | Implementation |
|---|---|---|
| **Chain** | append order and integrity | `src/vaerion/authorities/chain.ts` — genesis → append-only → attestable; breaks first-class; halt-while-broken |
| **Ledger** | receipt records | `src/vaerion/authorities/ledger.ts` — the 8.1 lifecycle; verdict read from the Verification Authority's own fact, never a parameter; correction by superseding receipt |
| **Evidence** | artifacts and restrictions | `src/vaerion/authorities/evidence.ts` — hashed at capture; restriction travels; missing evidence is a recorded state |
| **Verification** | verdicts | `src/vaerion/authorities/verification.ts` — engine version + ruleset pinned at verification time; the sole mint of verdict facts |
| **Rule** | rulesets | `src/vaerion/authorities/rule.ts` — effective windows; supersession recorded; drift markers bound to receipts |
| **Identity** | actors and credentials | `src/vaerion/authorities/identity.ts` — human/machine/engine; reveal-once ceremony |
| **Export** | bundles and manifests | `src/vaerion/authorities/export.ts` — the 8.7 lifecycle; demo refused by construction |

**The investigation lifecycle** (8.6; `src/vaerion/authorities/investigation.ts`)
is implemented exactly — opened → annotated → shared → closed, with replay
honoring present-day restrictions — while claiming no authority name; its
ownership is filed as IR-013 (P-5).

**The integrity substrate.** Pure SHA-256 attested against the FIPS 180-2
vectors (`src/vaerion/authorities/hash.ts`). Manifests immutable after
signing (8.8); third-party verification without product access.

**The proof:** `bun run vaerion:verify-authorities` — **131 checks, 0
violations** across the sixteen authority gates.

---

# CHAPTER X — THE TESTING FORTRESS

**The law.** Every check mechanical, binary, cited (9.1). No waivers; no
partial passes (10.1). The gates are conformance tooling (IR-002,
RATIFIED) — the machinery that enforces law, never product test code.

**The eight engines** (`src/vaerion/testing/`): the Snapshot Authority
(digest-first, fail-closed, supersession-only, **no approval API** — 9.3;
F-002), the Parity Harness (seven targets × six invariants — 9.12), the
Visual Regression engine (eight ordered areas, meaning-based — 9.2), the
Accessibility engine (keyboard, focus, announcements with both-way registry
parity over 21 registered ids, AA + AAA contrast, dichromacy simulations
executed and recorded — 9.4), the Interaction engine (the fifteen gates
re-proven), the State & Authority engine (12 + 16 gates and the refusal
proofs), the Performance gates (six measurements; only ratified bounds
enforced — IR-014), and the Security & Honesty engine (eight refusal proofs,
each terminating in `ConstitutionalViolationError`).

**The evidence protocol.** Every pipeline command emits an evidence record —
PASS/FAIL · evidence · citation · artifact location · timestamp · integrity
hash — frozen under `tools/vaerion-pipeline/artifacts/`
(`tools/vaerion-pipeline/record.ts`).

**The proof:** `bun run vaerion:test-all` — **8/8 engines PASS**. Standing
numbers of record: primitives 22,853 · state 117 · interaction 175 ·
rendering 1,310 · authorities 131 · accessibility 0 findings (24 dichromacy
values recorded) · security 8/8.

---

# CHAPTER XI — THE RELEASE CEREMONY

**The law.** A release exists only through the Release Authority (10.3;
`src/vaerion/release/authority.ts`). The gate is the ceremony
(`tools/vaerion-pipeline/full-graph.ts`): the twelve standing stage
verifiers as real subprocesses, snapshot integrity, source manifest,
protocol version, the ten-area engine battery, and the Article Gate
demonstrating all fourteen Bible Articles from real evidence (10.2). One
failure — the release never exists (10.1).

**The receipts.** Seven kinds — constitutional, build, artifact, registry,
snapshot, integrity, distribution — each with the mandated twelve-field
anatomy: identity, timestamp, SHA-256, parent release, constitutional
version, snapshot version, registry version, evidence references, chain
references, authority, digital-signature placeholder, citations.

**The identity.** Derived, never typed: `1.0.<stage>.r<seq>` from the
ratified titles, the protocol version, the stage, and the ledger sequence
(`src/vaerion/release/identity.ts`).

**The first release.** `rel_769da4b7bf84ad3b` — version `1.0.10.r1`, ledger
seq 1, parent genesis, seven receipts, four provenanced artifacts, eight
signed channels, recorded under `constitution/releases/` (F-006) by the
engine itself — never hand-authored.

**The rollback law.** Rollback is constitutional history, not undo (10.4):
the Rollback Receipt with reason, parent chain, affected artifacts,
integrity proof, evidence links, and recovery chain; the superseded release
proven byte-identical (11.4).

**The trust law.** The stored release verifies standalone — no product
contact, no network (`src/vaerion/release/trust.ts`; 8.8; 11.5). Forgery is
detected by recomputation; a stranger key cannot verify the chain.

**The proof:** `bun run vaerion:verify-everything` — **7/7 gates PASS**;
`bun run vaerion:release` — the ceremony that ends: *"I don't hope this
release is correct. I can prove it."*

---

# CHAPTER XII — DEVELOPER EXTENSION

**The four lawful ways to grow** (full detail:
`constitution/docs/EXTENSION_MODEL.md`):

1. **Register a token** — seven-field anatomy, lawful lifecycle, compiler
   regenerates the bindings (2.2; 2.5; 2.9; F-005).
2. **Manifest a primitive** — four binding clauses, tokens, states,
   accessibility, citations; consumption of `var(--vx-*)` only (3.0; 1.3).
3. **Amend the law** — interpretation request for new cases (P-5);
   amendment proposal for changes, reviewed against every prior Article
   (11.2–11.3).
4. **Extend the product engine** — the pre-existing runtime
   (`packages/vaerion/src/extensions/`) under the product constitution and
   the capability-broker architecture (ADR-0009; IR-003).

**What cannot be extended without amendment:** the verdict set (four), the
state set (twelve), the transition set (the rows of 5.7), the command verbs
(go/get/verify/attest), the skeleton set (three), the surface set (ten), the
authority set (seven), the registry set (seven).

**The compatibility law** (11.5): receipts, manifests, and exports remain
verifiable indefinitely across Registry and Constitution versions; tokens
alias forward; surfaces declare their conformance version; the Parity
Harness passes across the supported window.

---

## COLOPHON

This Codex was generated under the Founder's Stage 11 execution order
(Deliverable 2) by the Documentation Architecture. It is the memory of the
system — kept alive by `bun run vaerion:verify-documentation`, which proves
its citations, its file paths, its stage references, its counts, and its
generated artifacts against the implementation on every run
(`constitution/docs/GOVERNANCE.md`). Documentation that drifts is a
violation, not an editorial matter (Constitution 9.1; P-4).

*Nothing is believed. Everything is verified.*
