/**
 * Vaerion — Testing / Snapshot Authority (public barrel)
 *
 * The Snapshot Authority engine (order Deliverable 1): creation, comparison,
 * integrity verification, drift detection, immutable records, SHA-256
 * identity binding, and constitutional citation tracking — plus the
 * Node-only working-capture store (pipeline artifacts, never the
 * constitution canon).
 *
 * Citations: Implementation Constitution 9.3, P-4, P-6, 10.1; Foundation
 * Amendment F-002; order Deliverable 1.
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
} from './engine';

export {
  loadWorkingCaptures,
  appendWorkingCapture,
  loadPinnedManifest,
  pinWorkingManifest,
  supersedePinnedManifest,
  SNAPSHOT_STORE_ROOT,
} from './store';
