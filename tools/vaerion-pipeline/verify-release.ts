/**
 * VAERION PIPELINE — vaerion:verify-release
 *
 * The release gate (order Deliverable 5; Constitution 10.1–10.2): executes
 * the full graph — every standing stage verifier, the in-process engine
 * battery, snapshot integrity, and the Article Gate. If one check fails,
 * the release never exists. Not a warning. Not yellow.
 *
 * Citations: Constitution 10.1, 10.2, 9.1, Part IX; pipeline contract §6;
 * order Deliverables 5 and 10.
 */

import { implementation } from '../../src/vaerion/foundation/citations';
import { runFullGraph } from './full-graph';
import { writeEvidenceRecord, printEvidenceRecord, toEvidenceLines } from './record';

console.log('VAERION RELEASE GATE — verify-release (order Deliverable 5; Constitution 10.1–10.2)');
console.log('');

const graph = runFullGraph();

const verdict = graph.allPassed ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:verify-release',
  stageTag: 'stage10',
  verdict,
  checks: toEvidenceLines(
    graph.lines.map((line) => ({ ...line, citations: ['Constitution 9.1; 10.1; 10.2 — the full graph executes'] })),
  ),
  citations: [implementation('10.1'), implementation('10.2'), implementation('9.1')],
});
printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  console.error('');
  console.error('VERIFY-RELEASE: FAIL — the release never exists. Not a warning, not yellow (Constitution 10.1).');
  process.exit(1);
}
console.log('');
console.log('VERIFY-RELEASE: PASS — the full graph held; every Article demonstrated.');
