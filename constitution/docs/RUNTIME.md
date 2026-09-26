# THE RUNTIME EXPLANATION — How the Instrument Runs

<!--
DOC-META
id: DOCS-RUNTIME
title: Runtime Explanation
owningSystem: Stage 11 — Documentation Architecture (src/vaerion/docs)
authorityCitations: Implementation Constitution Part IV; Implementation Constitution Part V; Implementation Constitution Part VI; Implementation Constitution Part VII; Implementation Constitution 5.3; Implementation Constitution 5.4; Implementation Constitution 5.7; Implementation Constitution 6.5; Implementation Constitution 6.12; Bible Art. XII; Bible Art. VIII; Visual System §4.1; Visual System §10; Visual System §12; Visual System §13
relatedArtifacts: src/app/page.tsx; src/vaerion/surfaces/host.tsx; src/vaerion/surfaces/registry.ts; src/vaerion/state/machine.ts; src/vaerion/state/transitions.ts; src/vaerion/state/context.tsx; src/vaerion/interaction/dispatcher.ts; src/vaerion/interaction/commands.ts; src/vaerion/rendering/pipeline.ts; src/vaerion/rendering/skeletons.tsx
confidence: verified
lastVerified: 2026-09-22
verificationCommand: bun run vaerion:verify-documentation
-->

How the constitutional instrument runs, from route to pixel to verdict —
stated only where the implementation proves it.

---

## 1. The Host Route

The standing platform exposes a single user-visible route: `/`
(`src/app/page.tsx`). It mounts `SurfaceHost`
(`src/vaerion/surfaces/host.tsx`) — the transition IR-001 anticipated when
the first constitutional surfaces landed at Stage 4. The pre-ratification
site (`src/components/site/`) is preserved untouched as history (IR-003;
Constitution 11.4).

## 2. The Host and the Chrome

`SurfaceHost` mounts the constitutional chrome — the `Shell`
(`src/vaerion/rendering/skeletons.tsx`) — exactly once, and swaps registered
surfaces inside their registered skeletons (Constitution 4.3 — chrome
authored once; 4.1 — exactly three skeletons). The chrome carries the
Environment Stamp (engine version · rule set · environment — Constitution
3.10) and the Spine (the four registered territories: console / records /
rules / system — 3.11). The chamber is an operational choice of the host
(VS §4.1 — the two chambers: a light reading room and a dark war room).

## 3. The Ten Registered Surfaces

The surface set is enumerated and closed (Constitution 4.6;
`src/vaerion/surfaces/registry.ts` — `SURFACE_REGISTRY`): Runtime, Ledger,
Receipt Viewer, Constitution, Audit, Verification, Enterprise, Attestation
Status, Playground, Search. No eleventh surface exists; adding one requires
the Founder's amendment (the Release Observatory's display path is filed as
IR-018 for exactly this reason).

## 4. The State Engine

Twelve immutable states (Part V; `src/vaerion/state/matrix.ts`): verdict-domain
— verified, failed, pending, restricted, demo; system-domain — idle, loading,
skeleton, empty, offline, recovery, error. Ownership follows 5.4; propagation
runs authority → surface → primitive, one direction, with sibling mutation
structurally impossible (`src/vaerion/state/context.tsx` — token-gated
dispatch). The lawful transition set of 5.7 is transcribed row for row in
`src/vaerion/state/transitions.ts` (13 rows over 11 events); every unlisted
transition throws `ConstitutionalViolationError`. The state machine
(`src/vaerion/state/machine.ts`) keeps immutable snapshots and an append-only
history; offline halts writes while reads continue; cancellation after
authority contact is refused and the refusal recorded (5.8).

**Verdicts have one door:** a verdict-domain state enters only from the
Verification Authority (5.3; `src/vaerion/authorities/verification.ts` — the
sole mint of verdict facts). No surface, primitive, or interaction produces,
predicts, or optimistically renders one (1.6; Art. VIII).

## 5. The Interaction Engine

Thirteen registered commands on the Caliper verb grammar go / get / verify /
attest (`src/vaerion/interaction/commands.ts`; 6.1). Every interactive
element binds to a registered command; free-form handlers are prohibited.
The canonical keyboard map (V R E J K L Cmd-K Escape) is owned centrally and
constitutionally unshadowable (`src/vaerion/interaction/keys.ts`; 6.7).
Latency contracts: acknowledgment < 100 ms, Gauge only after 300 ms, Returns
live 6 s — all consumed from the Registry scales (6.12; VS §10).

**Termination law (6.5):** every interaction terminates in exactly one of
three instruments — a receipt (consequential acts), a Return (reversible or
reporting acts, 6 s life), or a Failure Receipt (failed acts, carrying the
receipt id). Nothing terminates silently. The dispatcher
(`src/vaerion/interaction/dispatcher.ts`) refuses verdict fabrication
structurally.

## 6. The Rendering Engine

Seven ordinal layers, ground.0 → lens.6 (`src/vaerion/rendering/layers.ts`;
7.2; VS §3.4) — shadows and glass are impossible. The surface hierarchy runs
chrome → surface → region → primitive (7.1; `strata.ts`). Twelve visibility
obligations are keyed to the canonical states (7.3; `visibility.ts`) —
skeletons render structure only, demo records are stamped, restricted
evidence renders hatched, empty states teach. Six modes render truthfully —
print, grayscale, forced-colors, reduced-motion, export
(`src/vaerion/rendering/modes.ts`; VS §11) — grayscale-first, verdict
identity carried by seal shape.

**The Proof Lens** (Bible Art. XII; `src/vaerion/primitives/lens.tsx`,
`src/vaerion/interaction/lens.ts`): press and hold any claim and the room
recedes while that claim's evidence chain illuminates at lens.6. Four
activation paths (pointer hold, Alt-hover, focus + L, tap-to-toggle); Escape
restores focus to the originating claim. The Lens adds light, never access —
restricted evidence renders hatched with its honest notice.

## 7. The Release/Trust Loop at Runtime

The engine that runs the gates is the same engine that releases: the Release
Authority (`src/vaerion/release/authority.ts`) composes the twelve standing
verifiers before any release exists (10.1), and the stored release verifies
standalone without product contact (`src/vaerion/release/trust.ts`; 8.8).
The observatory artifact is served read-only at `/api/release/observatory`
(IR-018).
