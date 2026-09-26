/**
 * VAERION PIPELINE — vaerion:verify-snapshots
 *
 * Stage 9 conformance checks for the Snapshot Authority (order Deliverable
 * 1; Constitution 9.3; Foundation Amendment F-002). Mechanical, binary,
 * cited (9.1; IR-002 — conformance tooling).
 *
 * Checks:
 *   [1] Working capture set — the seven parity targets are captured as
 *       immutable snapshot records with SHA-256 identity binding and
 *       citations (first run captures and pins; later runs verify).
 *   [2] Integrity — every stored record hashes to its bound identity.
 *   [3] Comparison — the fresh capture is identical to the stored baseline
 *       (invariants AND citations; divergence = drift).
 *   [4] Manifest drift — every pin matches; nothing missing, unpinned, or
 *       modified. Drift fails closed (9.3; 10.1). No approval path exists.
 *
 * Citations: Constitution 9.3, 9.1, P-4, P-6, 10.1; F-002; IR-015.
 */

import {
  captureSnapshot,
  appendWorkingCapture,
  loadWorkingCaptures,
  loadPinnedManifest,
  pinWorkingManifest,
  verifySnapshotIntegrity,
  assertNoDrift,
  assertNoManifestDrift,
  pinManifest,
} from '../../src/vaerion/testing/snapshot';
import { sha256 } from '../../src/vaerion/authorities';
import { composeVisualInvariants, assertVisualStructure } from '../../src/vaerion/testing/visual';
import { PARITY_TARGETS, resolveParityTarget, composeTargetPlan } from '../../src/vaerion/testing/parity';
import { RECEIPT_ANATOMY } from '../../src/vaerion/primitives/contract';
import { implementation, bible, type Citation } from '../../src/vaerion/foundation/citations';
import { writeEvidenceRecord, printEvidenceRecord, toEvidenceLines } from './record';

/** Captures one deterministic snapshot record for a parity target. */
function captureForTarget(target: (typeof PARITY_TARGETS)[number], clock: () => number) {
  const resolution = resolveParityTarget(target);
  const plan = composeTargetPlan(resolution);
  const invariants = [
    ...composeVisualInvariants(),
    `target: ${target} — modes ${resolution.modes.join(', ')}; breakpoint ${resolution.breakpoint ?? 'none'}; reduced-motion ${resolution.reducedMotion}`,
    `structure: ${plan.nodes.map((node) => node.stratum).join('→')} (7.1)`,
    `receipt anatomy: ${RECEIPT_ANATOMY.join('→')} (Art. VI)`,
  ];
  return captureSnapshot({
    snapshotId: `parity-${target}`,
    subject: {
      surface: 'rendering-engine reference (console skeleton)',
      target,
      mode: resolution.modes.length === 1 ? resolution.modes[0] : null,
      breakpoint: resolution.breakpoint,
      states: ['verified', 'failed', 'pending', 'restricted', 'demo', 'idle', 'loading', 'skeleton', 'empty', 'offline', 'recovery', 'error'],
    },
    content: {
      invariants,
      citations: [
        implementation('9.3', 'Snapshot Authority — visual regression against the canon'),
        implementation('7.1', 'structure remains identical'),
        bible('VI', 'receipt anatomy intact'),
      ] as readonly Citation[],
    },
    clock,
    hash: sha256,
  });
}

const violations: string[] = [];
const lines: { label: string; passed: boolean; evidence: string; citations?: readonly string[] }[] = [];
const clock = (): number => 0; // the working capture set is deterministic; time is injected (P-6)

try {
  /* [0] The visual structure the snapshots capture must itself conform. */
  assertVisualStructure();

  /* [1] Capture set — deterministic re-capture of the seven targets. */
  const fresh = PARITY_TARGETS.map((target) => captureForTarget(target, clock));
  const manifest = loadPinnedManifest();

  if (!manifest) {
    // First run: record the capture set and pin it. The pin is the
    // working-set manifest — canon ratification is the Founder's ruling
    // (IR-015); the constitution tree stays untouched (F-002).
    for (const record of fresh) appendWorkingCapture(record);
    pinWorkingManifest(
      pinManifest({
        manifestId: 'working-captures-v1',
        records: fresh,
        clock,
        citations: [
          implementation('9.3', 'Snapshot Authority engine — working capture set pinned for integrity verification'),
          implementation('9.1', 'mechanical, binary, cited'),
        ],
      }),
    );
    lines.push({
      label: 'working capture set created and pinned',
      passed: true,
      evidence: `${fresh.length} parity-target snapshots captured (SHA-256 identity bound, citation-tracked) and pinned as working-captures-v1 (pipeline artifacts pending canon ratification — IR-015)`,
    });
  } else {
    /* [2] Integrity of every stored record. */
    const storedRecords = loadWorkingCaptures();
    for (const record of storedRecords) {
      const pin = manifest.pins.find((candidate) => candidate.snapshotId === record.snapshotId);
      try {
        verifySnapshotIntegrity(record, sha256, pin);
        lines.push({ label: `integrity: ${record.snapshotId}`, passed: true, evidence: `identity digest ${record.sha256.slice(0, 16)}… verified against ${pin ? 'manifest pin' : 'bound identity'}` });
      } catch (error) {
        lines.push({ label: `integrity: ${record.snapshotId}`, passed: false, evidence: error instanceof Error ? error.message : String(error) });
        violations.push(`${record.snapshotId}: integrity failure`);
      }
    }

    /* [3] Comparison — fresh capture vs stored baseline (drift = failure). */
    for (const record of fresh) {
      const baseline = storedRecords.find((candidate) => candidate.snapshotId === record.snapshotId);
      if (!baseline) {
        lines.push({ label: `comparison: ${record.snapshotId}`, passed: false, evidence: 'no stored baseline — the capture set is incomplete (9.3)' });
        violations.push(`${record.snapshotId}: missing baseline`);
        continue;
      }
      try {
        assertNoDrift({ baseline, candidate: record });
        lines.push({ label: `comparison: ${record.snapshotId}`, passed: true, evidence: 'fresh capture is structurally identical to the baseline (invariants and citations)' });
      } catch (error) {
        lines.push({ label: `comparison: ${record.snapshotId}`, passed: false, evidence: error instanceof Error ? error.message : String(error) });
        violations.push(`${record.snapshotId}: drift`);
      }
    }

    /* [4] Manifest drift — fail closed. */
    try {
      assertNoManifestDrift({ manifest, records: storedRecords, hash: sha256 });
      lines.push({ label: 'manifest drift', passed: true, evidence: `manifest "${manifest.manifestId}": no missing, unpinned, or modified records — digest-first verification holds` });
    } catch (error) {
      lines.push({ label: 'manifest drift', passed: false, evidence: error instanceof Error ? error.message : String(error) });
      violations.push('manifest drift');
    }
  }
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  lines.push({ label: 'snapshot verification', passed: false, evidence: error instanceof Error ? error.message : String(error) });
}

const verdict: 'PASS' | 'FAIL' = violations.length === 0 && lines.every((line) => line.passed) ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:verify-snapshots',
  verdict,
  checks: toEvidenceLines(lines),
  citations: [implementation('9.3'), implementation('9.1'), implementation('P-4'), implementation('10.1')],
});

for (const line of record.checks) {
  console.log(`[${line.verdict}] ${line.check} — ${line.evidence}`);
}
printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  process.exit(1);
}
