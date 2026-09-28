/**
 * Vaerion — Testing / Module Manifest
 *
 * The conformance metadata of the Stage 9 testing infrastructure: the
 * implemented laws, the engines, their public APIs, and the pipeline
 * commands — every entry citation-traced (P-4).
 *
 * Citations: Implementation Constitution Part IX, P-4; order Deliverables
 * 1–9.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, visualSystem, type Citation } from '../foundation/citations';

/** One engine of the testing infrastructure. */
export interface TestingEngineManifestEntry {
  readonly engine: string;
  readonly root: string;
  readonly orderDeliverable: string;
  readonly implements: readonly string[];
  readonly publicApi: readonly string[];
  readonly pipelineCommand: string;
  readonly citations: readonly Citation[];
}

/** The Stage 9 engine manifest, in the order's deliverable order. */
export const TESTING_MANIFEST: readonly TestingEngineManifestEntry[] = Object.freeze([
  {
    engine: 'Snapshot Authority Engine',
    root: 'src/vaerion/testing/snapshot/',
    orderDeliverable: 'Deliverable 1',
    implements: [
      'snapshot creation (9.3; F-002 law 1)',
      'snapshot comparison — digest-first (F-002 law 2)',
      'snapshot integrity verification — SHA-256 identity binding',
      'drift detection — fail closed (9.3; 10.1)',
      'immutable snapshot records (F-002 law 3)',
      'constitutional citation tracking (P-4)',
      'no manual approval bypass — supersession only (8.1 precedent)',
    ],
    publicApi: [
      'captureSnapshot',
      'compareSnapshots',
      'assertNoDrift',
      'verifySnapshotIntegrity',
      'pinManifest',
      'detectManifestDrift',
      'assertNoManifestDrift',
      'supersedeManifest',
      'loadWorkingCaptures / appendWorkingCapture / loadPinnedManifest / pinWorkingManifest / supersedePinnedManifest',
    ],
    pipelineCommand: 'vaerion:verify-snapshots',
    citations: [implementation('9.3'), implementation('P-6'), implementation('P-4'), implementation('10.1')],
  },
  {
    engine: 'Parity Harness',
    root: 'src/vaerion/testing/parity.ts',
    orderDeliverable: 'Deliverable 2',
    implements: [
      'seven targets — desktop, mobile, print, grayscale, forced-colors, reduced-motion, export',
      'structure remains identical (7.1)',
      'evidence remains visible (Art. II)',
      'receipt anatomy remains intact (Art. VI)',
      'chain breaks remain visible (3.4; 5.9)',
      'restricted information remains honest (5.2; VS §3.3)',
      'no target hides constitutional information (7.3)',
      'breakpoint parity (9.8; 7.5)',
    ],
    publicApi: ['resolveParityTarget', 'composeTargetPlan', 'runParityHarness', 'assertParity', 'assertBreakpointParity'],
    pipelineCommand: 'vaerion:verify-parity',
    citations: [implementation('9.12'), implementation('9.8'), implementation('7.1')],
  },
  {
    engine: 'Visual Regression Engine',
    root: 'src/vaerion/testing/visual/',
    orderDeliverable: 'Deliverable 3',
    implements: [
      'registry token usage (9.2; 1.3)',
      'primitive geometry (7.4)',
      'surface composition (7.1)',
      'layer ordering (7.2; VS §3.4)',
      'measurement contracts (7.4)',
      'responsive evolution (7.5; 9.8)',
      'seal integrity (Art. IV; 7.7)',
      'lens behavior (3.15; Art. XII)',
      'forbidden: pixel matching without meaning, ignoring constitutional structure, approving drift manually',
    ],
    publicApi: [
      'runVisualVerification',
      'assertVisualStructure',
      'composeVisualInvariants',
      'verifyRegistryTokenUsage',
      'verifyPrimitiveGeometry',
      'verifySurfaceComposition',
      'verifyLayerOrdering',
      'verifyMeasurementContracts',
      'verifyResponsiveEvolution',
      'verifySealIntegrity',
      'verifyLensBehavior',
    ],
    pipelineCommand: 'vaerion:verify-parity (visual areas) + vaerion:verify-snapshots (canonical invariants)',
    citations: [implementation('9.2'), implementation('9.3'), implementation('9.10')],
  },
  {
    engine: 'Accessibility Test Engine',
    root: 'src/vaerion/testing/accessibility.ts',
    orderDeliverable: 'Deliverable 4',
    implements: [
      'keyboard navigation (9.5; 6.7)',
      'focus ownership and restoration (6.8)',
      'screen reader announcements + registry parity (6.11; F-003)',
      'ARIA contracts (9.4)',
      'color contrast — AA all pairs, AAA body text (9.4; VS §4.6)',
      'color independence — deuteranopia, protanopia, tritanopia simulations (9.4)',
      'forced color survival (7.8)',
      'reduced motion behavior (7.9)',
      'every failure identifies surface, primitive, rule, citation (P-4)',
    ],
    publicApi: [
      'runAccessibilityVerification',
      'assertAccessibility',
      'verifyKeyboardNavigation',
      'verifyFocusOwnershipAndRestoration',
      'verifyScreenReaderAnnouncements',
      'verifyAriaContracts',
      'verifyColorContrast',
      'verifyColorIndependence',
      'verifyForcedColorsAndReducedMotion',
    ],
    pipelineCommand: 'vaerion:verify-accessibility',
    citations: [implementation('9.4'), implementation('9.5'), implementation('6.11')],
  },
  {
    engine: 'Interaction Test Engine',
    root: 'src/vaerion/testing/interaction.ts',
    orderDeliverable: 'Deliverable 5',
    implements: [
      'Stage 6 contracts — commands, keyboard map, pointer, gestures, hold-to-confirm, confirmation ladder, undo window, returns, failure receipts, announcement batching',
      'no interaction exists outside the interaction registry (6.1)',
      'the fifteen interaction gates re-proven (9.1)',
    ],
    publicApi: [
      'runInteractionVerification',
      'assertInteraction',
      'verifyCommands',
      'verifyNoInteractionOutsideRegistry',
      'verifyKeyboardMap',
      'verifyPointerAndGestures',
      'verifyHoldToConfirm',
      'verifyConfirmationLadder',
      'verifyUndoWindow',
      'verifyReturnsAndFailureReceipts',
      'verifyAnnouncementBatching',
    ],
    pipelineCommand: 'vaerion:verify-accessibility (interaction preconditions) + vaerion:test-all',
    citations: [implementation('Part VI'), implementation('6.1'), implementation('6.5')],
  },
  {
    engine: 'State & Authority Test Engine',
    root: 'src/vaerion/testing/state-authority.ts',
    orderDeliverable: 'Deliverable 6',
    implements: [
      'Stage 5 — state transitions, ownership rules, illegal transitions, honest states, quarantine rules (Part V; 9.11)',
      'Stage 8 — authority boundaries, verdict ownership, chain integrity, evidence lifecycle, export restrictions, manifest integrity (Part VIII; 9.13; 9.14)',
      'the twelve state gates and sixteen authority gates re-proven',
    ],
    publicApi: [
      'runStateAuthorityVerification',
      'assertStateAuthorities',
      'verifyStateGates',
      'verifyStateTransitions',
      'verifyHonestStates',
      'verifyQuarantineRules',
      'verifyAuthorityGates',
      'verifyVerdictOwnership',
      'verifyChainIntegrity',
      'verifyEvidenceAndManifestIntegrity',
      'verifyExportRestrictions',
    ],
    pipelineCommand: 'vaerion:test-all (state + authority areas)',
    citations: [implementation('9.11'), implementation('9.13'), implementation('9.14')],
  },
  {
    engine: 'Performance Gates',
    root: 'src/vaerion/testing/performance.ts',
    orderDeliverable: 'Deliverable 7',
    implements: [
      'measures first render, interaction latency, state transition latency, receipt generation time, registry compilation time, verification time',
      'enforces ONLY ratified bounds — 100 ms acknowledgment, 300 ms Gauge, 6 s Returns, 400 ms motion ceiling (6.12; VS §10, §5.23, §7.2)',
      'unratified budgets measured and reported with pin requested — never guessed (Art. XI; P-5; IR-014)',
      'streaming budget enforced as declared bound; pin requested (IR-011)',
    ],
    publicApi: ['runPerformanceVerification', 'assertPerformance', 'verifyLatencyContractBindings'],
    pipelineCommand: 'vaerion:verify-performance',
    citations: [implementation('9.9'), implementation('6.12'), visualSystem('10', 'latency and feedback contract')],
  },
  {
    engine: 'Security & Honesty Tests',
    root: 'src/vaerion/testing/security.ts',
    orderDeliverable: 'Deliverable 8',
    implements: [
      'rejects fake verdicts (5.3; Art. III)',
      'rejects missing evidence (8.1; Art. II)',
      'rejects broken chains (8.5; 5.9)',
      'rejects unauthorized exports (8.7; 5.10)',
      'rejects unregistered tokens (1.3; 2.1)',
      'rejects unregistered commands (6.1)',
      'rejects fabricated receipts (8.1; Art. VI)',
      'rejects modified snapshots (9.3; F-002)',
      'every refusal terminates with ConstitutionalViolationError',
    ],
    publicApi: ['runSecurityVerification', 'assertSecurity', 'runRefusalProofs'],
    pipelineCommand: 'vaerion:verify-security',
    citations: [implementation('1.6'), bible('VIII', 'honesty over comfort'), bible('XII', 'the Proof Lens')],
  },
]);

/** The verification commands the Founder's order requires (order: Verification Requirements). */
export const VERIFICATION_COMMANDS: readonly { readonly command: string; readonly stage: string }[] = Object.freeze([
  { command: 'bun run vaerion:verify-constitution', stage: '1 (operational)' },
  { command: 'bun run vaerion:compile-registry', stage: '2' },
  { command: 'bun run vaerion:verify-primitives', stage: '3' },
  { command: 'bun run vaerion:verify-state', stage: '5' },
  { command: 'bun run vaerion:verify-interaction', stage: '6' },
  { command: 'bun run vaerion:verify-rendering', stage: '7' },
  { command: 'bun run vaerion:verify-authorities', stage: '8' },
  { command: 'bun run vaerion:test-all', stage: '9' },
]);
