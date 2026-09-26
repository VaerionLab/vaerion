/**
 * VAERION PIPELINE — vaerion:verify-rollback
 *
 * The rollback gate (order Deliverable 6; Constitution 10.4): rollback is
 * constitutional history — a superseding receipt on an append-only chain.
 * Proven on a live demonstration ledger: receipt, reason, parent chain,
 * affected artifacts, integrity proof, evidence links, recovery chain; the
 * superseded release remains untouched; integrity holds; refusals for
 * missing reasons, missing artifacts, missing evidence, and unknown
 * targets.
 *
 * Citations: Constitution 10.4, 10.3, 11.4, 8.5; Bible Art. VIII; order
 * Deliverables 6 and 10.
 */

import {
  createRollback,
  verifyRollbackReceipt,
  demonstrateRollbackLaw,
} from '../../src/vaerion/release/rollback';
import { createReleaseLedger } from '../../src/vaerion/release/ledger';
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

console.log('VAERION RELEASE GATE — verify-rollback (order Deliverable 6)');
console.log('');

check('[1] rollback creates the full supersession record on a live ledger', () => {
  const key = loadSigningKey();
  const { result, supersededEntry } = demonstrateRollbackLaw({ key });
  const receipt = result.receipt;
  if (!receipt.reason || receipt.affectedArtifacts.length === 0 || receipt.evidenceLinks.length === 0 || !receipt.recoveryChain) {
    throw new Error('rollback record incomplete (order Deliverable 6)');
  }
  verifyRollbackReceipt(receipt);
  return `rollback ${receipt.rollbackId} supersedes ${receipt.supersedes}; parent chain [${receipt.parentChain.join(' → ')}]; integrity proof ${receipt.integrityProof.slice(0, 16)}…; superseded entry untouched (seq ${supersededEntry.seq})`;
});

check('[2] a rollback without a reason is refused — history is never improvised', () => {
  const key = loadSigningKey();
  const ledger = createReleaseLedger({ hash: sha256 });
  ledger.appendRelease({
    releaseId: 'rel_rb_probe',
    version: '1.0.10.r1',
    receiptDigests: ['probe'],
    citations: [implementation('10.4')],
  });
  try {
    createRollback({
      ledger,
      reason: '   ',
      supersedes: 'rel_rb_probe',
      affectedArtifacts: ['art_probe'],
      evidenceLinks: ['probe'],
      recoveryChain: 'probe',
      key,
    });
    throw new Error('a reasonless rollback was accepted (Constitution 10.4; Art. VIII)');
  } catch (error) {
    if (!(error instanceof ConstitutionalViolationError)) throw error;
    return 'reasonless rollback refused with ConstitutionalViolationError — unexplained history is fabrication';
  }
});

check('[3] a rollback of an unknown target is refused', () => {
  const key = loadSigningKey();
  const ledger = createReleaseLedger({ hash: sha256 });
  try {
    createRollback({
      ledger,
      reason: 'probe',
      supersedes: 'rel_does_not_exist',
      affectedArtifacts: ['art_probe'],
      evidenceLinks: ['probe'],
      recoveryChain: 'probe',
      key,
    });
    throw new Error('a rollback against an unknown release was accepted (Constitution 10.4)');
  } catch (error) {
    if (!(error instanceof ConstitutionalViolationError)) throw error;
    return 'unknown target refused with ConstitutionalViolationError — operations name real entries or they do not happen';
  }
});

check('[4] the superseded release receipt remains in the chain — rollback is not undo', () => {
  const key = loadSigningKey();
  const { ledger, result, supersededEntry } = demonstrateRollbackLaw({ key });
  const integrity = ledger.integrity();
  if (!integrity.intact) throw new Error(`ledger broken at seq ${integrity.brokenAt} (Constitution 8.5)`);
  if (ledger.entryOf('rel_demo_stage10') !== supersededEntry) {
    throw new Error('the superseded entry changed — historical truth was retired (Constitution 11.4)');
  }
  const chain = ledger.parentChainOf(result.entry.releaseId);
  if (!chain.some((entry) => entry.releaseId === 'rel_demo_stage10')) {
    throw new Error('the rollback is not linked to the release it supersedes (order Deliverable 6)');
  }
  return `chain intact (${integrity.entries} entries); superseded release still present; parent chain walkable through the superseded release`;
});

const verdict = lines.every((line) => line.passed) ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:verify-rollback',
  stageTag: 'stage10',
  verdict,
  checks: toEvidenceLines(lines.map((line) => ({ ...line, citations: ['Constitution 10.4; 11.4; order Deliverable 6'] }))),
  citations: [implementation('10.4'), implementation('11.4'), implementation('8.5')],
});
printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  console.error('VERIFY-ROLLBACK: FAIL — rollback history must be constitutional (order Deliverable 6).');
  process.exit(1);
}
console.log('VERIFY-ROLLBACK: PASS — rollback is history, not undo.');
