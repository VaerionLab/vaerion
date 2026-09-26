/**
 * VAERION PIPELINE — vaerion:verify-build
 *
 * The determinism gate (order Deliverable 3): the build engine executes
 * twice over the real constitutional source tree; the two records must be
 * byte-identical. Any drift fails — never warns (Constitution 10.1).
 * Additionally proves: an injected drift IS detected (the gate refuses to
 * be a rubber stamp), and an empty manifest is refused (Art. II).
 *
 * Citations: Constitution 10.1, 10.3, 2.7, P-6; order Deliverable 3.
 */

import {
  executeBuild,
  assertDeterministicBuilds,
  firstBuildDivergence,
  RELEASE_BUILD_STEPS,
} from '../../src/vaerion/release/build';
import { RELEASE_ENGINE_NAME, RELEASE_ENGINE_VERSION, RELEASE_RULESET } from '../../src/vaerion/release/identity';
import { sha256 } from '../../src/vaerion/authorities/hash';
import { ConstitutionalViolationError } from '../../src/vaerion/foundation/authority';
import { computeSourceManifest, loadSigningKey } from './stage10-common';
import { writeEvidenceRecord, printEvidenceRecord, toEvidenceLines } from './record';
import { implementation } from '../../src/vaerion/foundation/citations';

const lines: { label: string; passed: boolean; evidence: string }[] = [];
function check(label: string, run: () => string): void {
  try {
    const evidence = run();
    lines.push({ label, passed: true, evidence });
    console.log(`[PASS] ${label} — ${evidence}`);
  } catch (error) {
    const evidence = error instanceof Error ? error.message : String(error);
    lines.push({ label, passed: false, evidence });
    console.log(`[FAIL] ${label} — ${evidence}`);
  }
}

console.log('VAERION RELEASE GATE — verify-build (determinism, order Deliverable 3)');
console.log('');

let treeHash = '';
check('[1] deterministic double build over the real source tree', () => {
  const manifest = computeSourceManifest();
  if (manifest.length === 0) throw new Error('source manifest is empty — evidence or silence (Art. II)');
  const runA = executeBuild({
    sourceManifest: manifest,
    steps: RELEASE_BUILD_STEPS,
    buildEngine: `${RELEASE_ENGINE_NAME} ${RELEASE_ENGINE_VERSION}`,
    ruleset: RELEASE_RULESET,
    hash: sha256,
  });
  const runB = executeBuild({
    sourceManifest: manifest,
    steps: RELEASE_BUILD_STEPS,
    buildEngine: `${RELEASE_ENGINE_NAME} ${RELEASE_ENGINE_VERSION}`,
    ruleset: RELEASE_RULESET,
    hash: sha256,
  });
  assertDeterministicBuilds(runA, runB);
  treeHash = runA.sourceTreeHash;
  return `${manifest.length} source files hashed; run A == run B (buildId ${runA.buildId}, tree ${treeHash.slice(0, 16)}…)`;
});

check('[2] injected drift is detected — the gate refuses to be a rubber stamp', () => {
  const manifest = computeSourceManifest();
  const drifted = executeBuild({
    sourceManifest: manifest.slice(0, -1),
    steps: RELEASE_BUILD_STEPS,
    buildEngine: `${RELEASE_ENGINE_NAME} ${RELEASE_ENGINE_VERSION}`,
    ruleset: RELEASE_RULESET,
    hash: sha256,
  });
  const honest = executeBuild({
    sourceManifest: manifest,
    steps: RELEASE_BUILD_STEPS,
    buildEngine: `${RELEASE_ENGINE_NAME} ${RELEASE_ENGINE_VERSION}`,
    ruleset: RELEASE_RULESET,
    hash: sha256,
  });
  const divergence = firstBuildDivergence(drifted, honest);
  if (!divergence) {
    throw new Error('a drifted build was accepted — the determinism gate is broken (Constitution 10.1)');
  }
  return `drift detected and refused: ${divergence.slice(0, 120)}…`;
});

check('[3] anonymous builds are refused', () => {
  try {
    executeBuild({
      sourceManifest: [{ path: 'x', sha256: '0'.repeat(64) }],
      steps: RELEASE_BUILD_STEPS,
      buildEngine: '',
      ruleset: '',
      hash: sha256,
    });
    throw new Error('an anonymous build was accepted (Constitution 10.3; Art. III)');
  } catch (error) {
    if (!(error instanceof ConstitutionalViolationError)) {
      throw error instanceof Error && error.message.startsWith('an anonymous build')
        ? error
        : new Error(`unexpected refusal shape: ${String(error)}`);
    }
    return 'refused with ConstitutionalViolationError — a build names its engine and ruleset (10.3; Art. III)';
  }
});

const verdict = lines.every((line) => line.passed) ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:verify-build',
  stageTag: 'stage10',
  verdict,
  checks: toEvidenceLines(lines.map((line) => ({ ...line, citations: ['Constitution 10.1; 2.7; P-6; order Deliverable 3'] }))),
  citations: [implementation('10.1'), implementation('2.7'), implementation('P-6')],
});
printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  console.error('VERIFY-BUILD: FAIL — determinism is broken; no release may exist (Constitution 10.1).');
  process.exit(1);
}
console.log('VERIFY-BUILD: PASS — identical sources, identical outputs, drift fails.');
