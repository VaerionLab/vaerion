/**
 * VAERION PIPELINE — vaerion:verify-artifacts
 *
 * The artifact-intelligence gate (order Deliverable 4): real release
 * artifacts register with complete provenance; anonymous artifacts are
 * refused with ConstitutionalViolationError (nothing exists anonymously);
 * the trust engine independently re-checks provenance on the delivered
 * data.
 *
 * Citations: Constitution Part X, 10.1, 2.8, 8.2; Bible Art. II, III; order
 * Deliverable 4.
 */

import { registerArtifact, assertNoAnonymousArtifacts } from '../../src/vaerion/release/artifacts';
import { readReleaseIndex } from '../../src/vaerion/release/store';
import { registryVersion, RELEASE_RULESET } from '../../src/vaerion/release/identity';
import { sha256 } from '../../src/vaerion/authorities/hash';
import { ConstitutionalViolationError } from '../../src/vaerion/foundation/authority';
import { implementation } from '../../src/vaerion/foundation/citations';
import { fileSha256 } from './stage10-common';
import { writeEvidenceRecord, printEvidenceRecord, toEvidenceLines } from './record';

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

console.log('VAERION RELEASE GATE — verify-artifacts (order Deliverable 4)');
console.log('');

check('[1] real release artifacts register with full provenance', () => {
  const records: { kind: 'binding' | 'receipt-set'; name: string; sha256: string; origin: string; provingSnapshots: string[] }[] = [
    {
      kind: 'binding' as const,
      name: 'generated/css/vaerion-tokens.css',
      sha256: fileSha256('generated/css/vaerion-tokens.css'),
      origin: 'the canonical Registry compiler (Constitution 2.7)',
      provingSnapshots: ['working-captures-v1'],
    },
    {
      kind: 'binding' as const,
      name: 'generated/typescript/tokens.ts',
      sha256: fileSha256('generated/typescript/tokens.ts'),
      origin: 'the canonical Registry compiler (Constitution 2.7)',
      provingSnapshots: ['working-captures-v1'],
    },
  ];
  // When the ceremony has issued a release, its F-006 receipt record is a
  // real artifact — hashed from the actual file (nothing anonymous).
  const index = readReleaseIndex();
  if (index && index.entries.length > 0) {
    const latest = [...index.entries].reverse().find((entry) => entry.kind === 'release');
    if (latest) {
      records.push({
        kind: 'receipt-set' as const,
        name: `constitution/releases/receipts/${latest.receiptsFile}`,
        sha256: fileSha256(`constitution/releases/receipts/${latest.receiptsFile}`),
        origin: 'the Release Authority (F-006; Constitution 10.3)',
        provingSnapshots: ['working-captures-v1'],
      });
    }
  }
  const registered = records.map((spec) =>
    registerArtifact({
      ...spec,
      constitutionVersion: RELEASE_RULESET,
      registryVersion: registryVersion(),
      owningRelease: 'rel_artifact_probe',
      approvingAuthorities: ['Release Authority (F-006)', 'Chain Authority (8.5)'],
      evidenceReferences: ['build:probe', 'snapshot:working-captures-v1'],
      hash: sha256,
    }),
  );
  assertNoAnonymousArtifacts(registered);
  return `${registered.length} real artifacts registered — origin, constitution, registry version, owning release, proving snapshots, approving authorities, evidence all present`;
});

check('[2] an anonymous artifact is refused — nothing exists anonymously', () => {
  try {
    registerArtifact({
      kind: 'package',
      name: 'anonymous-artifact-probe',
      sha256: sha256('probe'),
      origin: '',
      constitutionVersion: RELEASE_RULESET,
      registryVersion: registryVersion(),
      owningRelease: 'rel_artifact_probe',
      provingSnapshots: ['working-captures-v1'],
      approvingAuthorities: ['Release Authority (F-006)'],
      evidenceReferences: ['probe'],
      hash: sha256,
    });
    throw new Error('an anonymous artifact was registered (order Deliverable 4)');
  } catch (error) {
    if (!(error instanceof ConstitutionalViolationError)) throw error;
    return 'anonymous artifact refused with ConstitutionalViolationError — origin is mandatory (Art. II)';
  }
});

check('[3] an artifact with an unnamed approving authority is refused', () => {
  try {
    registerArtifact({
      kind: 'package',
      name: 'vibes-approved-probe',
      sha256: sha256('probe-2'),
      origin: 'somewhere',
      constitutionVersion: RELEASE_RULESET,
      registryVersion: registryVersion(),
      owningRelease: 'rel_artifact_probe',
      provingSnapshots: ['working-captures-v1'],
      approvingAuthorities: ['the general feeling that it works'],
      evidenceReferences: ['probe'],
      hash: sha256,
    });
    throw new Error('an artifact with an unnamed authority was registered (Art. III)');
  } catch (error) {
    if (!(error instanceof ConstitutionalViolationError)) throw error;
    return 'unnamed authority refused with ConstitutionalViolationError — approvals name verifiers (Art. III)';
  }
});

const verdict = lines.every((line) => line.passed) ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:verify-artifacts',
  stageTag: 'stage10',
  verdict,
  checks: toEvidenceLines(lines.map((line) => ({ ...line, citations: ['Constitution Part X; 2.8; Art. II; order Deliverable 4'] }))),
  citations: [implementation('Part X'), implementation('2.8'), implementation('8.2')],
});
printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  console.error('VERIFY-ARTIFACTS: FAIL — anonymous artifacts cannot ship (order Deliverable 4).');
  process.exit(1);
}
console.log('VERIFY-ARTIFACTS: PASS — every artifact knows where it came from.');
