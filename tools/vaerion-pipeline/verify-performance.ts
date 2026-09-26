/**
 * VAERION PIPELINE — vaerion:verify-performance
 *
 * Stage 9 conformance checks for the Performance Gates (order Deliverable
 * 7; Constitution 9.9, 6.12; VS §10). Mechanical, binary, cited (9.1;
 * IR-002 — conformance tooling).
 *
 * The gate enforces ONLY ratified bounds (100 ms acknowledgment, 300 ms
 * Gauge, 6 s Returns, 400 ms motion ceiling, 10 s undo, 5 s batching) and
 * measures + reports the unratified quantities with their pin request
 * (IR-014) — nothing is enforced against an invented budget (Art. XI; P-5).
 *
 * Citations: Constitution 9.9, 6.12, 9.1, P-4, P-5, 10.1; Visual System
 * §10, §5.23, §7.2; Bible Art. XI; IR-011; IR-014; order Deliverable 7.
 */

import { assertPerformance } from '../../src/vaerion/testing/performance';
import { implementation, type Citation } from '../../src/vaerion/foundation/citations';
import { writeEvidenceRecord, printEvidenceRecord, toEvidenceLines } from './record';

const violations: string[] = [];
const lines: { label: string; passed: boolean; evidence: string; citations?: readonly string[] }[] = [];

try {
  const report = assertPerformance();

  for (const binding of report.contractBindings) {
    lines.push({
      label: `contract binding: ${binding.contract}`,
      passed: binding.passed,
      evidence: binding.evidence,
    });
    if (!binding.passed) violations.push(binding.contract);
  }

  for (const measurement of report.measurements) {
    lines.push({
      label: `performance: ${measurement.quantity}`,
      passed: measurement.passed,
      evidence: `${measurement.evidence} — bound: ${measurement.ratifiedBoundMs === null ? measurement.boundCitation : `${measurement.ratifiedBoundMs} ms (${measurement.boundCitation})`}`,
    });
    if (measurement.enforced && !measurement.passed) violations.push(measurement.quantity);
  }

  for (const declared of report.declaredBounds) {
    lines.push({ label: 'declared bound (pin requested)', passed: true, evidence: declared });
  }
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  lines.push({ label: 'performance verification', passed: false, evidence: error instanceof Error ? error.message : String(error) });
}

const verdict: 'PASS' | 'FAIL' = violations.length === 0 ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:verify-performance',
  verdict,
  checks: toEvidenceLines(lines),
  citations: [implementation('9.9'), implementation('6.12'), implementation('9.1'), implementation('P-5'), implementation('10.1')],
});

for (const line of record.checks) {
  console.log(`[${line.verdict}] ${line.check} — ${line.evidence}`);
}
printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  process.exit(1);
}
