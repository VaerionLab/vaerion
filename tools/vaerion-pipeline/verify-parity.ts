/**
 * VAERION PIPELINE — vaerion:verify-parity
 *
 * Stage 9 conformance checks for the Parity Harness and the visual
 * regression engine (order Deliverables 2–3; Constitution 9.12, 9.3, 9.8,
 * 9.10). Mechanical, binary, cited (9.1; IR-002 — conformance tooling).
 *
 * Checks:
 *   [1] Parity Harness — the seven targets, six invariants each (9.12).
 *   [2] Breakpoint parity — the responsive contracts evolve, never scale
 *       (9.8; 7.5).
 *   [3] Visual regression — the eight ordered areas of the visual engine
 *       (order Deliverable 3).
 *
 * Citations: Constitution 9.12, 9.3, 9.8, 9.10, 9.1, P-4, 10.1; Bible
 * Art. II, IV, VI, VIII, XII; order Deliverables 2–3.
 */

import { runParityHarness, assertBreakpointParity, PARITY_TARGETS } from '../../src/vaerion/testing/parity';
import { runVisualVerification } from '../../src/vaerion/testing/visual';
import { implementation, type Citation } from '../../src/vaerion/foundation/citations';
import { writeEvidenceRecord, printEvidenceRecord, toEvidenceLines } from './record';

const violations: string[] = [];
const lines: { label: string; passed: boolean; evidence: string; citations?: readonly string[] }[] = [];

/* [1] The Parity Harness — seven targets, six invariants (9.12). */
const parity = runParityHarness();
for (const target of parity.targets) {
  lines.push({
    label: `parity target: ${target.target}`,
    passed: target.passed,
    evidence: target.evidence,
    citations: target.citations.map((citation) => `${citation.document} ${citation.reference}`),
  });
  if (!target.passed) violations.push(`parity target ${target.target} failed`);
}
if (parity.targets.length !== PARITY_TARGETS.length) {
  violations.push(`parity ran ${parity.targets.length} targets; seven are ordered`);
}

/* [2] Breakpoint parity (9.8; 7.5). */
try {
  assertBreakpointParity();
  lines.push({ label: 'breakpoint parity', passed: true, evidence: 'the four breakpoint contracts promote/demote per registration — no breakpoint merely scales (7.5; 9.8; IR-010 pins)' });
} catch (error) {
  lines.push({ label: 'breakpoint parity', passed: false, evidence: error instanceof Error ? error.message : String(error) });
  violations.push('breakpoint parity failed');
}

/* [3] Visual regression — the eight ordered areas (order Deliverable 3). */
const visual = runVisualVerification();
for (const area of visual.areas) {
  lines.push({
    label: `visual: ${area.area}`,
    passed: area.passed,
    evidence: area.evidence,
    citations: area.citations.map((citation) => `${citation.document} ${citation.reference}`),
  });
  if (!area.passed) violations.push(`visual area ${area.area} failed`);
}

const verdict: 'PASS' | 'FAIL' = violations.length === 0 ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:verify-parity',
  verdict,
  checks: toEvidenceLines(lines),
  citations: [implementation('9.12'), implementation('9.3'), implementation('9.8'), implementation('9.1'), implementation('10.1')],
});

for (const line of record.checks) {
  console.log(`[${line.verdict}] ${line.check} — ${line.evidence}`);
}
printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  process.exit(1);
}
