/**
 * Vaerion — Foundation / Stage Manifest
 *
 * The Volume IV build order as a typed, deterministic manifest. The pipeline
 * and the release engine read this manifest; they never re-encode the order.
 *
 * Citations:
 * - Volume IV directive, "BUILD ORDER": "Build in the following order only.
 *   Do not skip stages. Do not reorder stages. Complete one stage before
 *   proceeding." — encoded mechanically by `assertStageMayBegin` and
 *   `assertNoSkippedStages` (foundation/gate.ts).
 * - Volume IV directive, "Amendment F-007 — Stage Dependency Graph": every
 *   stage declares required predecessor stages (`dependsOn`), constitutional
 *   prerequisites (`constitutionalPrerequisites` — resolved against the
 *   Prerequisite Registry, foundation/prerequisites.ts), and completion
 *   conditions (`completionConditions`).
 * - Implementation Constitution Part X: no stage exit without its gates
 *   (automated gates arrive with Stage 8; until then stage conformance is
 *   declared by the stage completion report and recorded in the worklog).
 * - Implementation Constitution P-4: every deliverable below is citable.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, visualSystem, type Citation } from './citations';
import { ConstitutionalViolationError } from './authority';
import { GENERATED_ROOT, PIPELINE_ROOT, STAGE_ROOTS } from './paths';

/**
 * Eleven stages. The directive series re-sequenced the Volume IV build order
 * (Stage 5 = State Architecture; Stage 6 = Interaction Architecture); the
 * Rendering Engine work front was preserved and re-slotted at 7 — a declared
 * completion-condition set (Part VII) is lawful work and is never deleted
 * (Constitution 11.4). Recorded in constitution/amendments/LEDGER.md.
 */
export const STAGE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
export type StageId = (typeof STAGE_IDS)[number];

export type StageStatus = 'pending' | 'in_progress' | 'conformant';

export interface StageDefinition {
  readonly id: StageId;
  readonly name: string;
  readonly purpose: string;
  /** Canonical implementation root. Citation: foundation/paths.ts. */
  readonly root: string;
  /** Required predecessor stages (F-007: "required predecessor stages"). */
  readonly dependsOn: readonly StageId[];
  /**
   * Constitutional prerequisites (F-007: "constitutional prerequisites") —
   * ids resolved against the Prerequisite Registry (foundation/prerequisites.ts).
   */
  readonly constitutionalPrerequisites: readonly string[];
  /**
   * Completion conditions (F-007: "completion conditions") — the declared
   * conditions under which this stage may be marked conformant. Verified by
   * the stage completion report and, from Stage 8, by the mechanical gates.
   */
  readonly completionConditions: readonly string[];
  readonly deliverables: readonly string[];
  readonly citations: readonly Citation[];
  readonly status: StageStatus;
}

/**
 * The ten stages, exactly as ordered by the Volume IV directive.
 * Stage statuses are updated only through stage completion reports.
 */
export const STAGES: readonly StageDefinition[] = Object.freeze([
  {
    id: 1,
    name: 'Foundation',
    purpose:
      'Repository architecture, constitutional directory structure, governance folders, build/documentation pipeline architecture, registry architecture, tooling architecture. Nothing visual is built.',
    root: STAGE_ROOTS.foundation,
    dependsOn: [],
    constitutionalPrerequisites: [],
    completionConditions: [
      'authority tree complete: all three ratified documents transcribed and digest-pinned (F-001, DP-1, DP-2)',
      'authority organs established: Snapshot Authority (F-002), Announcement & Copy Registry (F-003), Registry authority separation (F-004), generated artifact root (F-005), release record authority (F-006)',
      'stage dependency graph operational with mechanical enforcement (F-007)',
      'governance ledgers current (amendments, interpretations, trace index, changelog)',
      'foundation conformance report issued with citations for every amendment',
    ],
    deliverables: [
      'constitutional directory structure (constitution/)',
      'governance ledgers (amendments, interpretations, trace index)',
      'foundation architecture modules (citations, authority, stages, paths, prerequisites, gate, verification)',
      'canonical authority transcriptions (DP-1, DP-2 — F-001)',
      'authority organs (snapshot-authority, announcement-registry, registry authority, releases, generated root)',
      'registry architecture contract',
      'build pipeline architecture contract',
      'documentation pipeline architecture contract',
      'dependency graph documentation',
    ],
    citations: [
      implementation('P-4', 'traceability instrumented from the first artifact'),
      implementation('P-5', 'silence rule: interpretation requests, never improvisation'),
      implementation('11.1', 'Design Systems Authority owns the registries'),
      bible('XI', 'nothing unmeasured ships'),
    ],
    status: 'conformant',
  },
  {
    id: 2,
    name: 'Registry System',
    purpose:
      'Implement the canonical Registry: seven sub-registries, token anatomy, lifecycle, validation, versioning, compiler, generated bindings.',
    root: STAGE_ROOTS.registry,
    dependsOn: [1],
    constitutionalPrerequisites: ['DP-1', 'DP-2', 'F-001', 'F-002', 'F-003', 'F-004', 'F-005', 'F-006', 'F-007'],
    completionConditions: [
      'seven sub-registries implemented with the seven-field token anatomy (Constitution 2.2)',
      'validation passes mechanically: scale membership, contrast, grayscale survival, citation presence (Constitution 2.6)',
      'compiler emits reproducible generated bindings exclusively under generated/ (Constitution 2.7; F-005)',
      'lifecycle transitions follow the lawful status graph (Constitution 2.5, 2.9)',
      'values compiled only from the ratified Visual System text (Constitution 2.1; VS §4.7)',
    ],
    deliverables: [
      'Registry source of truth (7 registries)',
      'token records with the seven anatomy fields',
      'validation gates (scale membership, contrast, grayscale, citation presence)',
      'registry compiler and generated per-platform bindings',
    ],
    citations: [
      implementation('Part II'),
      implementation('2.7', 'generated bindings are an implementation necessity'),
      visualSystem('0', 'seven registries and dual naming'),
      visualSystem('4.7', 'reference color values (transcribed with DP-2)'),
    ],
    status: 'conformant',
  },
  {
    id: 3,
    name: 'Primitive System',
    purpose:
      'Implement every constitutional primitive under its Responsibility / Boundaries / Extension / Composition contract.',
    root: STAGE_ROOTS.primitives,
    dependsOn: [2],
    constitutionalPrerequisites: [],
    completionConditions: [
      'every primitive implements its Responsibility / Boundaries / Extension / Composition contract (Constitution Part III)',
      'per-primitive conformance metadata carries citations (P-4)',
      'no primitive renders a value outside registry bindings (Constitution 1.3)',
    ],
    deliverables: [
      'the fifteen bound primitives (Receipt, Panel, Seal, Chainline, Button, Input, Table, Log, Timeline, Environment Stamp, Navigation, Dialog, Toast, Gauge, Lens)',
      'remaining Visual System §5 primitives under identical contract structure',
      'per-primitive conformance metadata (citations, contract clauses)',
    ],
    citations: [implementation('Part III'), visualSystem('5')],
    status: 'conformant',
  },
  {
    id: 4,
    name: 'Composition Architecture',
    purpose:
      'Compose primitives into the canonical Vaerion surfaces: exactly three skeletons, the ten registered surfaces, composition rules (Part IV), and the responsive contract — per the Founder directive series recorded in constitution/amendments/LEDGER.md.',
    root: STAGE_ROOTS.rendering,
    dependsOn: [3],
    constitutionalPrerequisites: [],
    completionConditions: [
      'exactly three skeletons exist; no fourth layout pattern (Constitution 4.1; VS §1.4)',
      'chrome authored once and inherited everywhere (Constitution 4.3)',
      'every registered surface mounted per its 4.6 binding with Criteria Bar ownership (4.4) and chain continuity (4.5)',
      'no surface invents language — copy consumed by identifier (Constitution 4.7; 6.11; F-003)',
      'demo quarantine on all pre-authority records; exports disabled (Constitution 5.10; 8.7)',
      'responsive evolution per VS §9 — honest degradation, never scaling-only (Constitution 7.5)',
    ],
    deliverables: [
      'Console / Document / Status skeletons with chrome inheritance',
      'ten surfaces: Runtime, Ledger, Receipt Viewer, Constitution, Audit, Verification, Enterprise, Status, Playground, Search',
      'surface registry with skeleton mappings and citations',
      'proposed announcement strings (IR-009) and structural pins (IR-010) filed',
    ],
    citations: [implementation('Part IV'), visualSystem('1.4'), visualSystem('9'), bible('XIII', 'teach the states on every verdict surface')],
    status: 'conformant',
  },
  {
    id: 5,
    name: 'State Architecture',
    purpose:
      'The constitutional state engine per Part V: the canonical State Matrix (twelve states), ownership, propagation, inheritance, transitions, cancellation, recovery, offline, demo quarantine, restricted evidence, pending verification, honesty enforcement.',
    root: STAGE_ROOTS.state,
    dependsOn: [4],
    constitutionalPrerequisites: [],
    completionConditions: [
      'the twelve canonical states exist as immutable definitions; no other state renders; no aliases are coined (Constitution 5.1–5.2)',
      'verdict-domain states enter only from the Verification Authority — no surface, primitive, or interaction produces, predicts, or optimistically renders one (5.3; 1.6; Art. VIII)',
      'ownership follows 5.4 and propagation follows 5.5: authority → surface → primitive, one direction; no sibling mutation; no primitive owns state',
      'inheritance honors explicitly attested overrides and never masks evidence-level restriction (5.6)',
      'the lawful transition set of 5.7 is enforced mechanically; every unlisted transition is rejected with a ConstitutionalViolationError',
      'cancellation restores the pre-act state exactly, issues a Return, and is refused once an act has reached an authority (5.8)',
      'recovery revalidates chain integrity before live resumption; a gap renders as a break until reconciled (5.9; 3.4)',
      'demo state may not co-mingle with production data in any store, stream, or export (5.10)',
      'the twelve state gates (transition, ownership, propagation, inheritance, recovery, cancellation, honesty, verdict authority, chain integrity, demo quarantine, restricted evidence, offline recovery) pass mechanically',
    ],
    deliverables: [
      'canonical State Matrix (twelve immutable state definitions)',
      'state and authority ownership registry',
      'transition validator (the fixed lawful transition set of 5.7)',
      'state machine with immutable state definitions',
      'honesty enforcement (verdict boundary; no optimistic rendering; no fabricated verdicts)',
      'runtime state contracts (authority → surface → primitive provider; no sibling mutation)',
      'the twelve state gates',
    ],
    citations: [implementation('Part V'), implementation('1.6'), bible('VIII', 'honesty over comfort'), bible('III', 'a verdict names its verifier')],
    status: 'conformant',
  },
  {
    id: 6,
    name: 'Interaction Architecture',
    purpose:
      'The interaction engine per Part VI: Command Registry (Caliper verb grammar), keyboard/pointer/gesture/focus ownership, intent declaration, confirmation ladder, hold-to-affirm, undo, receipts and Returns, latency contracts, announcements bound to the Announcement & Copy Registry, Lens interaction.',
    root: STAGE_ROOTS.interaction,
    dependsOn: [5],
    constitutionalPrerequisites: ['AUTH-ANNOUNCEMENT'],
    completionConditions: [
      'command registry implements the registered verbs go/get/verify/attest with hash-first routing (VS §5 Caliper)',
      'every interactive element binds to a registered command; free-form handlers are prohibited (6.1)',
      'friction ladder enforced per action class, including hold-to-affirm and receipt-id destruction (6.2–6.3; VS §13.1)',
      'every completed act resolves to a receipt or a Return; every failed act to a Failure Receipt; nothing terminates silently (6.5)',
      'every rendered or announced string is consumed from the Announcement & Copy Registry — none invented at render time (Constitution 6.11; F-003)',
      'latency contracts hold: <100 ms acknowledgment, 300 ms Gauge delay, 6 s Returns (6.12; VS §10)',
      'keyboard, pointer, gesture, and focus ownership hold (6.7–6.10); constitutional keys are owned centrally and never shadowed',
      'Proof Lens obeys ACL and motion law on every claim surface (Bible Art. XII; VS §12)',
      'the fifteen interaction gates pass mechanically',
    ],
    deliverables: [
      'command registry and command dispatcher (go/get/verify/attest; hash-first)',
      'keyboard, pointer, gesture, and focus engines with central ownership',
      'intent declaration, confirmation ladder, hold-to-affirm, undo system',
      'receipt / Return / Failure Receipt resolution (nothing terminates silently)',
      'announcement system bound to the Announcement & Copy Registry (6.11)',
      'latency contracts (100 ms acknowledgment, 300 ms Gauge delay, 6 s Returns)',
      'Lens interaction engine (pointer hold, Alt-hover, focus + L, tap-to-toggle)',
    ],
    citations: [implementation('Part VI'), visualSystem('13'), visualSystem('10'), visualSystem('5', 'Caliper')],
    status: 'conformant',
  },
  {
    id: 7,
    name: 'Rendering Engine',
    purpose:
      'Surface hierarchy, layer system, measurement, responsive evolution, print, grayscale, forced-colors, reduced motion, export rendering. (Re-slotted from 5 to 7 by the directive series; the work front is preserved — Part VII remains law.)',
    root: STAGE_ROOTS.rendering,
    dependsOn: [6],
    constitutionalPrerequisites: [],
    completionConditions: [
      'layer ordinals ground.0–lens.6 enforced; shadows and glass impossible (VS §3.4)',
      'all three page skeletons render per registration (VS §1.4)',
      'print, grayscale, forced-colors, reduced-motion, and export targets render every surface truthfully (VS §11)',
      'responsive evolution follows the registered honest-degradation contract (VS §9)',
    ],
    deliverables: [
      'layer ordinals layer.0–layer.6',
      'three-skeleton surface system',
      'responsive evolution contract per breakpoint',
      'print / grayscale / forced-colors / reduced-motion / export targets',
    ],
    citations: [implementation('Part VII'), visualSystem('3.4'), visualSystem('11')],
    status: 'conformant',
  },
  {
    id: 8,
    name: 'Data Authorities',
    purpose:
      'Verification, Chain, Ledger, Evidence, Rule, Identity, Export Authorities; every lifecycle of Constitution Part VIII.',
    root: STAGE_ROOTS.authorities,
    dependsOn: [7],
    constitutionalPrerequisites: [],
    completionConditions: [
      'seven named authorities own their data domains exclusively (Constitution Part VIII)',
      'receipts are immutable; corrections append new receipts (Bible Art. VI)',
      'verification pins engine version and rule set at verification time (Bible Art. III)',
      'all lifecycles (receipt, evidence, verification, rule, chain, investigation, export, manifest, identity) implemented as declared',
    ],
    deliverables: [
      'seven named authorities with unambiguous ownership',
      'receipt / evidence / verification / rule / chain / investigation / export / manifest / identity lifecycles',
      'append-only, no-mutation invariants',
    ],
    citations: [implementation('Part VIII'), bible('VI', 'receipt is sacred')],
    status: 'conformant',
  },
  {
    id: 9,
    name: 'Testing Infrastructure',
    purpose:
      'Every constitutional gate as a mechanical conformance check; Snapshot Authority; Parity Harness. No stage proceeds while any gate fails.',
    // The Founder's Stage 9 execution order names the explicit path
    // src/vaerion/testing/ (Deliverable 1); the Stage 1 reservation
    // src/vaerion/gates/ remains untouched. Recorded in the amendments
    // ledger, Stage 9 directive note.
    root: 'src/vaerion/testing',
    dependsOn: [8],
    constitutionalPrerequisites: ['AUTH-SNAPSHOT', 'IR-002-RATIFIED'],
    completionConditions: [
      'every gate of Part IX is a mechanical pass/fail check with citations (Constitution 9.1)',
      'Snapshot Authority infrastructure captures and compares against the ratified canon (Constitution 9.3; F-002)',
      'Parity Harness proves CLI/API/UI record equivalence (Constitution 9.12)',
      'no gate may be waived; partial passes are failures (Constitution 10.1)',
    ],
    deliverables: [
      'Token / Visual / Accessibility / Motion / Print / Performance / State / Receipt / Chain / Export / Lens gates',
      'Snapshot Authority (fidelity canon)',
      'Parity Harness (CLI/API/UI equivalence)',
    ],
    citations: [implementation('Part IX'), implementation('P-6', 'fidelity standard')],
    status: 'conformant',
  },
  {
    id: 10,
    name: 'Release Engine',
    purpose:
      'Release receipts, release gates, rollback chain, version declaration, conformance verification. Every release produces its own constitutional receipt.',
    root: STAGE_ROOTS.release,
    dependsOn: [9],
    constitutionalPrerequisites: ['AUTH-RELEASE'],
    completionConditions: [
      'every release issues a receipt naming engine version, rule set, environment, and demonstrated gates (Constitution 10.3; Bible Art. III)',
      'the release chain is append-only; rollbacks issue superseding receipts (Constitution 10.4)',
      'receipts are recorded under constitution/releases/ (F-006); build outputs never are',
      'a release whose gates cannot be demonstrated does not ship (Constitution 10.1–10.2)',
    ],
    deliverables: [
      'release receipt (implementation necessity, 10.3)',
      'Article gate demonstration per release',
      'append-only release/rollback chain',
    ],
    citations: [implementation('Part X'), implementation('10.3'), bible('III', 'a release names its verifier')],
    status: 'conformant',
  },
  {
    id: 11,
    name: 'Documentation',
    purpose:
      'Documentation generated from the Constitution: trace index publication, registry docs, implementation docs, API docs. Documentation must never drift from implementation.',
    root: STAGE_ROOTS.docs,
    dependsOn: [10],
    constitutionalPrerequisites: ['DP-1'],
    completionConditions: [
      'documentation is generated from constitutional sources, never hand-edited (Stage 10 contract)',
      'the Constitutional Trace Index is published and drift-enforced (Constitution P-4)',
      'dual naming appears in all generated documentation (VS §0)',
      'generated documentation differing from committed output fails the build (Constitution 9.1)',
    ],
    deliverables: [
      'generated documentation pipeline',
      'published Constitutional Trace Index',
      'registry / primitive / API documentation',
    ],
    citations: [implementation('P-4'), implementation('Part XI'), visualSystem('0', 'dual naming in docs')],
    status: 'conformant',
  },
]);

/** Returns a stage definition or throws — unknown stages do not exist and are never improvised. */
export function getStage(id: StageId): StageDefinition {
  const stage = STAGES.find((s) => s.id === id);
  if (!stage) {
    throw new ConstitutionalViolationError(
      'BUILD ORDER',
      `Unknown stage id ${id}. The Volume IV build order defines exactly eleven stages (directive series: State Architecture is Stage 5, Interaction Architecture is Stage 6; the Rendering Engine is preserved at 7).`,
    );
  }
  return stage;
}

/** The first stage not yet conformant, in order — the current work front. */
export function currentStage(): StageDefinition | null {
  return STAGES.find((s) => s.status !== 'conformant') ?? null;
}

/** The pipeline root is part of Stage 1 scope (build/tooling architecture). */
export const FOUNDATION_ROOTS = Object.freeze([
  STAGE_ROOTS.foundation,
  PIPELINE_ROOT,
  'constitution',
  GENERATED_ROOT,
] as const);
