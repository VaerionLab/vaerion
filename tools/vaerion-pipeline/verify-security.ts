/**
 * VAERION PIPELINE — vaerion:verify-security
 *
 * Stage 9 conformance checks for the Security & Honesty Tests (order
 * Deliverable 8; Constitution 1.6, Part VIII, 9.1). Mechanical, binary,
 * cited (9.1; IR-002 — conformance tooling).
 *
 * The eight refusal proofs — fake verdicts, missing evidence, broken
 * chains, unauthorized exports, unregistered tokens, unregistered
 * commands, fabricated receipts, modified snapshots — must ALL terminate
 * with ConstitutionalViolationError. An accepted violation, or a refusal
 * raised as any other error class, fails the gate.
 *
 * Citations: Constitution 1.6, 5.3, 5.10, 6.1, 8.1, 8.5, 8.7, 9.3, 9.1,
 * P-4, 10.1; Bible Art. II, III, VI, VIII, XI, XII; F-002; order
 * Deliverable 8.
 */

import { assertSecurity } from '../../src/vaerion/testing/security';
import { implementation, type Citation } from '../../src/vaerion/foundation/citations';
import { writeEvidenceRecord, printEvidenceRecord, toEvidenceLines } from './record';

const violations: string[] = [];
const lines: { label: string; passed: boolean; evidence: string; citations?: readonly string[] }[] = [];

try {
  const report = assertSecurity();
  for (const proof of report.proofs) {
    lines.push({
      label: `refusal: ${proof.refusal}`,
      passed: proof.passed,
      evidence: proof.evidence,
      citations: proof.citations.map((citation) => `${citation.document} ${citation.reference}`),
    });
    if (!proof.passed) violations.push(proof.refusal);
  }
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  lines.push({ label: 'security & honesty verification', passed: false, evidence: error instanceof Error ? error.message : String(error) });
}

const verdict: 'PASS' | 'FAIL' = violations.length === 0 ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:verify-security',
  verdict,
  checks: toEvidenceLines(lines),
  citations: [implementation('1.6'), implementation('9.1'), implementation('10.1')],
});

for (const line of record.checks) {
  console.log(`[${line.verdict}] ${line.check} — ${line.evidence}`);
}
printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  process.exit(1);
}
