/**
 * VAERION PIPELINE — vaerion:test-all
 *
 * The complete Stage 9 test pipeline (order Deliverable 9): every engine of
 * the testing infrastructure runs, in order, and the aggregate verdict is
 * emitted as an evidence record — PASS/FAIL, Evidence, Citation, Artifact
 * location, Timestamp, Integrity hash (order Deliverable 9 output form).
 *
 * Engines (order Deliverables 1–8):
 *   [1] Snapshot Authority        — integrity + drift, fail closed (9.3)
 *   [2] Parity Harness            — seven targets, six invariants (9.12)
 *   [3] Visual Regression         — eight ordered areas (9.2; 9.3; 9.8; 9.10)
 *   [4] Accessibility             — 9.4; 9.5; 6.11
 *   [5] Interaction               — the Stage 6 contracts (Part VI)
 *   [6] State & Authority         — the Stage 5 + Stage 8 contracts (Parts V, VIII)
 *   [7] Performance               — ratified bounds enforced; unratified reported (9.9; 6.12)
 *   [8] Security & Honesty        — the eight refusals (1.6; Part VIII)
 *
 * No partial passes (10.1): any engine failure fails the aggregate, and the
 * pipeline exits non-zero.
 *
 * Citations: Constitution Part IX, 9.1–9.15, 10.1, P-4; order Deliverables
 * 1–9.
 */

import {
  assertParity,
  assertBreakpointParity,
} from '../../src/vaerion/testing/parity';
import { assertVisualStructure } from '../../src/vaerion/testing/visual';
import { assertAccessibility } from '../../src/vaerion/testing/accessibility';
import { assertInteraction } from '../../src/vaerion/testing/interaction';
import { assertStateAuthorities } from '../../src/vaerion/testing/state-authority';
import { assertPerformance } from '../../src/vaerion/testing/performance';
import { assertSecurity } from '../../src/vaerion/testing/security';
import { assertNoManifestDrift, loadPinnedManifest, loadWorkingCaptures, verifySnapshotIntegrity } from '../../src/vaerion/testing/snapshot';
import { sha256 } from '../../src/vaerion/authorities';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { implementation, type Citation } from '../../src/vaerion/foundation/citations';
import { writeEvidenceRecord, printEvidenceRecord, toEvidenceLines } from './record';

const ANNOUNCEMENT_DIR = join(process.cwd(), 'constitution', 'announcement-registry');

function registeredAnnouncementIds(): string[] {
  const ids: string[] = [];
  for (const file of ['stage4-proposed-strings.json', 'stage6-proposed-strings.json']) {
    const parsed = JSON.parse(readFileSync(join(ANNOUNCEMENT_DIR, file), 'utf8')) as {
      strings?: readonly { readonly id: string }[];
    };
    for (const entry of parsed.strings ?? []) ids.push(entry.id);
  }
  return ids;
}

const lines: { label: string; passed: boolean; evidence: string; citations?: readonly string[] }[] = [];

function engine(name: string, run: () => string): void {
  try {
    const evidence = run();
    lines.push({ label: name, passed: true, evidence });
    console.log(`[PASS] ${name} — ${evidence}`);
  } catch (error) {
    const evidence = error instanceof Error ? error.message : String(error);
    lines.push({ label: name, passed: false, evidence });
    console.log(`[FAIL] ${name} — ${evidence}`);
  }
}

console.log('VAERION TEST PIPELINE — the machine that proves Vaerion is still Vaerion');
console.log('');

engine('[1] Snapshot Authority — integrity + drift (9.3)', () => {
  const manifest = loadPinnedManifest();
  if (!manifest) {
    throw new Error('no manifest pinned — run vaerion:verify-snapshots first (9.3; F-002 law 1 — ratified, never casual)');
  }
  const records = loadWorkingCaptures();
  for (const record of records) {
    verifySnapshotIntegrity(record, sha256, manifest.pins.find((pin) => pin.snapshotId === record.snapshotId));
  }
  assertNoManifestDrift({ manifest, records, hash: sha256 });
  return `manifest "${manifest.manifestId}": ${records.length} records integrity-verified, zero drift (digest-first, fail closed)`;
});

engine('[2] Parity Harness (9.12)', () => {
  const report = assertParity();
  assertBreakpointParity();
  return `${report.targets.length} targets pass the six invariants — structure identical, evidence visible, receipt anatomy intact, chain breaks visible, restricted honest, nothing hidden; breakpoint parity holds`;
});

engine('[3] Visual Regression (9.2; 9.3; 9.8; 9.10)', () => {
  const report = assertVisualStructure();
  return `${report.areas.length} ordered areas pass — tokens, geometry, composition, layers, measurement, responsive, seals, lens; no pixel matching without meaning, no ignored structure, no manual drift approval`;
});

engine('[4] Accessibility (9.4; 9.5; 6.11)', () => {
  const report = assertAccessibility(registeredAnnouncementIds());
  return `zero findings — every check identifies surface, primitive, rule, citation; registry parity holds both ways`;
});

engine('[5] Interaction (Part VI)', () => {
  const report = assertInteraction();
  return `${report.areas.length} contract areas + ${report.gateCount}/15 gates pass — no interaction exists outside the interaction registry`;
});

engine('[6] State & Authority (Parts V, VIII)', () => {
  const report = assertStateAuthorities();
  return `${report.areas.length} areas pass — 12 state gates, 16 authority gates, illegal transitions and quarantine violations refuse, manifests detect tampering`;
});

engine('[7] Performance (9.9; 6.12)', () => {
  const report = assertPerformance();
  const enforced = report.measurements.filter((measurement) => measurement.enforced).length;
  const reported = report.measurements.filter((measurement) => !measurement.enforced).length;
  return `${report.contractBindings.length} ratified contract bindings hold; ${enforced} enforced measurement(s) within bound; ${reported} unratified measurement(s) reported with pin requested (IR-014) — no invented budgets`;
});

engine('[8] Security & Honesty (1.6; Part VIII)', () => {
  const report = assertSecurity();
  return `${report.proofs.length}/8 refusal proofs throw ConstitutionalViolationError — fake verdicts, missing evidence, broken chains, unauthorized exports, unregistered tokens, unregistered commands, fabricated receipts, modified snapshots`;
});

const verdict: 'PASS' | 'FAIL' = lines.every((line) => line.passed) ? 'PASS' : 'FAIL';
const citations: readonly Citation[] = [
  implementation('Part IX'),
  implementation('9.1', 'mechanical, binary, cited'),
  implementation('10.1', 'no partial passes, no conditional ships, no waivers'),
  implementation('P-4'),
];

const record = writeEvidenceRecord({
  command: 'vaerion:test-all',
  verdict,
  checks: toEvidenceLines(lines),
  citations,
});

printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  console.error('');
  console.error('TEST PIPELINE: FAIL — a failed gate blocks the pipeline (Constitution 10.1).');
  process.exit(1);
}
console.log('');
console.log('TEST PIPELINE: PASS — the gates decide, and the gates held.');
