/**
 * Vaerion — Testing / Public Barrel
 *
 * The Stage 9 testing infrastructure (Implementation Constitution Part IX;
 * order Deliverables 1–9): the Snapshot Authority engine, the Parity
 * Harness, the visual regression engine, the accessibility, interaction,
 * state & authority, performance, and security & honesty engines, the
 * module manifest, and the aggregate gate.
 *
 * "The system must prove that the constitutional implementation remains
 * identical, accessible, measurable, and honest across every target"
 * (order, Stage 9 objective).
 *
 * Citations: Implementation Constitution Part IX, 9.1–9.15, P-4, P-6, 10.1.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

export {
  captureSnapshot,
  compareSnapshots,
  assertNoDrift,
  verifySnapshotIntegrity,
  pinManifest,
  detectManifestDrift,
  assertNoManifestDrift,
  supersedeManifest,
  snapshotIdentity,
  SNAPSHOT_ENGINE_CITATIONS,
  type SnapshotSubject,
  type SnapshotContent,
  type SnapshotRecord,
  type SnapshotManifest,
  type SnapshotDifference,
  type DriftReport,
} from './snapshot/engine';
/* The Node-only snapshot store (snapshot/store.ts) is intentionally NOT
   exported here — it imports node:fs and belongs to pipeline tooling, the
   same discipline as foundation/verification.ts (1.5; 9.1). */
export {
  PARITY_TARGETS,
  resolveParityTarget,
  composeTargetPlan,
  runParityForTarget,
  runParityHarness,
  assertParity,
  assertBreakpointParity,
  PARITY_HARNESS_CITATIONS,
  type ParityTarget,
  type ParityTargetResolution,
  type ParityTargetResult,
  type ParityReport,
} from './parity';
export * from './visual/engine';
export {
  runAccessibilityVerification,
  assertAccessibility,
  verifyKeyboardNavigation,
  verifyFocusOwnershipAndRestoration,
  verifyScreenReaderAnnouncements,
  verifyAriaContracts,
  verifyColorContrast,
  verifyColorIndependence,
  dichromacySimulationEvidence,
  verifyForcedColorsAndReducedMotion,
  ACCESSIBILITY_ENGINE_CITATIONS,
  type AccessibilityFinding,
  type AccessibilityReport,
} from './accessibility';
export {
  runInteractionVerification,
  assertInteraction,
  INTERACTION_ENGINE_CITATIONS,
  type InteractionVerificationResult,
  type InteractionReport,
} from './interaction';
export {
  runStateAuthorityVerification,
  assertStateAuthorities,
  STATE_AUTHORITY_ENGINE_CITATIONS,
  type StateAuthorityResult,
  type StateAuthorityReport,
} from './state-authority';
export {
  runPerformanceVerification,
  assertPerformance,
  verifyLatencyContractBindings,
  PERFORMANCE_ENGINE_CITATIONS,
  type PerformanceMeasurement,
  type ContractBinding,
  type PerformanceReport,
} from './performance';
export {
  runSecurityVerification,
  assertSecurity,
  runRefusalProofs,
  SECURITY_ENGINE_CITATIONS,
  type RefusalProof,
  type SecurityReport,
} from './security';
export { TESTING_MANIFEST, VERIFICATION_COMMANDS, type TestingEngineManifestEntry } from './manifest';
