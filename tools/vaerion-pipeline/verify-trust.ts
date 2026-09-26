/**
 * VAERION PIPELINE — vaerion:verify-trust
 *
 * The trust gate (order Deliverable 8): the stored release record (F-006)
 * is verified standalone — as pure delivered data, without product access,
 * without the network (8.8; 11.5). A tampered bundle is refused; an
 * unsigned or untrustable bundle never passes.
 *
 * Citations: Constitution 8.8, 11.5, 10.3, 10.4; F-006; Bible Art. XI;
 * order Deliverables 8 and 10.
 */

import { readReleaseRecord, readReleaseIndex } from '../../src/vaerion/release/store';
import { verifyTrustBundle, type TrustBundle } from '../../src/vaerion/release/trust';
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

console.log('VAERION RELEASE GATE — verify-trust (order Deliverable 8)');
console.log('');

check('[1] the stored release record verifies standalone — trust is portable', () => {
  const index = readReleaseIndex();
  if (!index || index.entries.length === 0) {
    throw new Error(
      'no release is recorded under constitution/releases/ — run vaerion:release first (F-006: the first receipt is issued by the Release Engine)',
    );
  }
  const key = loadSigningKey();
  let verified = 0;
  let findingsTotal = 0;
  for (const entry of index.entries) {
    const stored = readReleaseRecord(entry.releaseId);
    if (!stored) throw new Error(`indexed release "${entry.releaseId}" is unreadable (F-006)`);
    const bundle: TrustBundle = {
      releaseId: stored.releaseId,
      version: stored.version,
      ledgerEntries: [stored.entry],
      receipts: stored.receipts,
      artifacts: stored.artifacts,
      distribution: stored.distribution,
    };
    const report = verifyTrustBundle({ bundle, keys: [key], hash: sha256 });
    findingsTotal += report.findings.length;
    if (!report.trusted) {
      const failures = report.findings.filter((finding) => finding.verdict === 'FAIL');
      throw new ConstitutionalViolationError(
        '10.3 / 8.8',
        `stored release "${stored.releaseId}" failed standalone verification: ${failures
          .map((finding) => `${finding.check}: ${finding.detail}`)
          .join(' | ')}`,
      );
    }
    verified += 1;
  }
  return `${verified} stored release(s) verified as pure data — ${findingsTotal} recomputed findings, no product access, no network (8.8; 11.5)`;
});

check('[2] a tampered bundle is refused — brokenness is detectable, never silent', () => {
  const index = readReleaseIndex();
  if (!index || index.entries.length === 0) {
    throw new Error('no stored release to tamper-test — run vaerion:release first');
  }
  const key = loadSigningKey();
  const stored = readReleaseRecord(index.entries[0].releaseId)!;
  const tampered: TrustBundle = {
    releaseId: stored.releaseId,
    version: stored.version,
    ledgerEntries: [stored.entry],
    receipts: stored.receipts,
    artifacts: stored.artifacts,
    distribution: stored.distribution,
  };
  // Simulate a forged receipt: keep the digest fields, alter the evidence.
  if (tampered.receipts.length === 0) throw new Error('stored release carries no receipts (Constitution 10.3)');
  const forged = {
    ...tampered.receipts[0],
    evidenceReferences: ['forged:evidence'],
  } as typeof tampered.receipts[0];
  const report = verifyTrustBundle({
    bundle: { ...tampered, receipts: [forged, ...tampered.receipts.slice(1)] },
    keys: [key],
    hash: sha256,
  });
  if (report.trusted) {
    throw new Error('a forged receipt passed trust verification — the trust engine is broken (Constitution 8.8)');
  }
  return 'forged receipt detected — trust verdict is NOT trusted; brokenness detectable, never silent (8.8)';
});

check('[3] an untrusted key cannot verify the chain', () => {
  const index = readReleaseIndex();
  if (!index || index.entries.length === 0) throw new Error('no stored release — run vaerion:release first');
  const stored = readReleaseRecord(index.entries[0].releaseId)!;
  const bundle: TrustBundle = {
    releaseId: stored.releaseId,
    version: stored.version,
    ledgerEntries: [stored.entry],
    receipts: stored.receipts,
    artifacts: stored.artifacts,
    distribution: stored.distribution,
  };
  const report = verifyTrustBundle({
    bundle,
    keys: [{ keyId: 'stranger', fingerprint: sha256('stranger-key') }],
    hash: sha256,
  });
  if (report.trusted) {
    throw new Error('a stranger key verified the release chain (Art. III)');
  }
  return 'stranger key refused — signatures verify only against the configured release signing identity (Art. III)';
});

const verdict = lines.every((line) => line.passed) ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:verify-trust',
  stageTag: 'stage10',
  verdict,
  checks: toEvidenceLines(lines.map((line) => ({ ...line, citations: ['Constitution 8.8; 11.5; F-006; order Deliverable 8'] }))),
  citations: [implementation('8.8'), implementation('11.5'), implementation('10.3')],
});
printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  console.error('VERIFY-TRUST: FAIL — trust that cannot be verified is not trust (order Deliverable 8).');
  process.exit(1);
}
console.log('VERIFY-TRUST: PASS — trust is portable.');
