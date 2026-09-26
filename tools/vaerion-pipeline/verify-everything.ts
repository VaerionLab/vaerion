/**
 * VAERION PIPELINE — vaerion:verify-everything
 *
 * The aggregate release gate (order Deliverable 10): all seven release
 * gates execute — release, artifacts, distribution, rollback, signatures,
 * build, trust — and the verdict is emitted as an evidence record. Every
 * failure produces: Evidence, Citation, Receipt (the evidence record),
 * Integrity hash, ConstitutionalViolationError (propagated by the gates
 * and recorded here).
 *
 * Citations: Constitution Part X, 10.1, 9.1; order Deliverable 10.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { implementation } from '../../src/vaerion/foundation/citations';
import { writeEvidenceRecord, printEvidenceRecord, toEvidenceLines } from './record';

const GATES: readonly { readonly script: string; readonly label: string; readonly citation: string }[] = Object.freeze([
  { script: 'verify-build.ts', label: 'build determinism (Deliverable 3)', citation: 'Constitution 10.1; 2.7; P-6' },
  { script: 'verify-signatures.ts', label: 'signature binding + tamper detection (Deliverable 2)', citation: 'Constitution 10.3; 8.8' },
  { script: 'verify-artifacts.ts', label: 'artifact intelligence (Deliverable 4)', citation: 'Constitution Part X; 2.8; Art. II' },
  { script: 'verify-distribution.ts', label: 'distribution identity (Deliverable 7)', citation: 'Constitution 8.7; 8.8; 5.10' },
  { script: 'verify-rollback.ts', label: 'the supersession law (Deliverable 6)', citation: 'Constitution 10.4; 11.4' },
  { script: 'verify-release.ts', label: 'the release gate + Article Gate (Deliverable 5)', citation: 'Constitution 10.1; 10.2' },
  { script: 'verify-trust.ts', label: 'portable trust (Deliverable 8)', citation: 'Constitution 8.8; 11.5' },
]);

console.log('VAERION RELEASE GATES — verify-everything (order Deliverable 10)');
console.log('');

const lines: { label: string; passed: boolean; evidence: string; citations?: readonly string[] }[] = [];

for (const gate of GATES) {
  const script = join(process.cwd(), 'tools', 'vaerion-pipeline', gate.script);
  if (!existsSync(script)) {
    lines.push({ label: gate.label, passed: false, evidence: `gate missing: ${gate.script}`, citations: [gate.citation] });
    console.log(`[FAIL] ${gate.label} — gate missing`);
    continue;
  }
  const result = spawnSync(process.execPath, [script], { encoding: 'utf8', timeout: 600_000 });
  const passed = result.status === 0;
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const tail = output.trim().split('\n').filter(Boolean).slice(-1)[0] ?? '(no output)';
  lines.push({
    label: gate.label,
    passed,
    evidence: passed ? tail : `exit ${result.status}: ${output.slice(-400)}`,
    citations: [gate.citation],
  });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${gate.label} — ${passed ? tail : 'gate failed; see its evidence record'}`);
}

const verdict = lines.every((line) => line.passed) ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:verify-everything',
  stageTag: 'stage10',
  verdict,
  checks: toEvidenceLines(lines),
  citations: [implementation('Part X'), implementation('10.1'), implementation('9.1')],
});
printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  console.error('');
  console.error('VERIFY-EVERYTHING: FAIL — a failed gate blocks release (Constitution 10.1).');
  process.exit(1);
}
console.log('');
console.log('VERIFY-EVERYTHING: PASS — the gates decide, and the gates held.');
