/**
 * VAERION PIPELINE — vaerion:verify-signatures
 *
 * The signature gate (order Deliverable 2; 10): the release-signing key
 * binds every receipt; the same body and key produce the same signature
 * (determinism); any body alteration detaches the signature (tamper
 * detection, never silent — 8.8); anonymous keys are refused (Art. III).
 *
 * Citations: Constitution 10.3, 8.8, 11.5; Foundation Amendment F-006;
 * order Deliverable 10.
 */

import { issueReceipt, verifyReceiptIntegrity, signReceiptBody, verifyReceiptSignature } from '../../src/vaerion/release/receipt';
import { constitutionalVersion } from '../../src/vaerion/release/identity';
import { sha256 } from '../../src/vaerion/authorities/hash';
import { ConstitutionalViolationError } from '../../src/vaerion/foundation/authority';
import { implementation } from '../../src/vaerion/foundation/citations';
import { loadSigningKey } from './stage10-common';
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

console.log('VAERION RELEASE GATE — verify-signatures (order Deliverable 2)');
console.log('');

check('[1] receipt issuance + signature binding to the release signing key', () => {
  const key = loadSigningKey();
  const receipt = issueReceipt({
    kind: 'integrity',
    releaseId: 'rel_signature_probe',
    releaseVersion: '1.0.10.r0',
    timestamp: 0,
    parentRelease: null,
    constitutionalVersion: constitutionalVersion({ protocol: 'probe', volumeStage: 10 }),
    snapshotVersion: 'working-captures-probe',
    evidenceReferences: ['probe:signature-gate'],
    chainReferences: ['probe:chain'],
    key,
    citations: [implementation('10.3'), implementation('8.8')],
    payload: { probe: 'verify-signatures' },
  });
  verifyReceiptIntegrity(receipt);
  return `receipt ${receipt.receiptId} issued; signature ${receipt.signature.slice(0, 24)}… verifies against key "${key.keyId}"`;
});

check('[2] signature determinism — same body, same key, same signature', () => {
  const key = loadSigningKey();
  const body = 'canonical-probe-body';
  const a = signReceiptBody({ canonicalBody: body, key });
  const b = signReceiptBody({ canonicalBody: body, key });
  if (a !== b) throw new Error('signature is not deterministic (Constitution P-6)');
  if (!verifyReceiptSignature({ canonicalBody: body, signature: a, key })) {
    throw new Error('signature does not verify against its own body (Constitution 8.8)');
  }
  return 'signatures are deterministic and verify (P-6; 8.8)';
});

check('[3] tamper detection — any body alteration detaches the signature', () => {
  const key = loadSigningKey();
  const receipt = issueReceipt({
    kind: 'integrity',
    releaseId: 'rel_tamper_probe',
    releaseVersion: '1.0.10.r0',
    timestamp: 0,
    parentRelease: null,
    constitutionalVersion: constitutionalVersion({ protocol: 'probe', volumeStage: 10 }),
    snapshotVersion: 'working-captures-probe',
    evidenceReferences: ['probe:signature-gate'],
    chainReferences: ['probe:chain'],
    key,
    citations: [implementation('10.3')],
    payload: { state: 'original' },
  });
  const tampered = { ...receipt, payload: { state: 'altered' } } as typeof receipt;
  try {
    verifyReceiptIntegrity(tampered);
    throw new Error('a tampered receipt passed integrity — brokenness went silent (Constitution 8.8)');
  } catch (error) {
    if (!(error instanceof ConstitutionalViolationError)) throw error;
    return 'tampered receipt refused with ConstitutionalViolationError — alteration is detectable, never silent (8.8; F-006 law 4)';
  }
});

check('[4] anonymous keys are refused', () => {
  try {
    signReceiptBody({ canonicalBody: 'x', key: { keyId: '', fingerprint: '' } });
    throw new Error('an anonymous key signed a receipt (Art. III)');
  } catch (error) {
    if (!(error instanceof ConstitutionalViolationError)) throw error;
    return 'anonymous key refused with ConstitutionalViolationError — a signature names its key (Art. III)';
  }
});

const verdict = lines.every((line) => line.passed) ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:verify-signatures',
  stageTag: 'stage10',
  verdict,
  checks: toEvidenceLines(lines.map((line) => ({ ...line, citations: ['Constitution 10.3; 8.8; F-006; order Deliverable 2'] }))),
  citations: [implementation('10.3'), implementation('8.8'), implementation('11.5')],
});
printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  console.error('VERIFY-SIGNATURES: FAIL — a release whose receipt cannot be produced does not ship (10.3).');
  process.exit(1);
}
console.log('VERIFY-SIGNATURES: PASS — every receipt proves itself.');
