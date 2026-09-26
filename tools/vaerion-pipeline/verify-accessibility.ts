/**
 * VAERION PIPELINE — vaerion:verify-accessibility
 *
 * Stage 9 conformance checks for the Accessibility Test Engine (order
 * Deliverable 4; Constitution 9.4, 9.5, 6.11). Mechanical, binary, cited
 * (9.1; IR-002 — conformance tooling).
 *
 * The Announcement & Copy Registry ids are read from the constitution tree
 * (F-003 — consumed, never duplicated) and handed to the engine, which
 * proves consumption parity both ways. Every failure identifies surface,
 * primitive, rule, and citation (P-4; order Deliverable 4).
 *
 * Citations: Constitution 9.4, 9.5, 6.11, 9.1, P-4, 10.1; F-003; Bible
 * Art. IV, VII, XIV.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { assertAccessibility } from '../../src/vaerion/testing/accessibility';
import { implementation, type Citation } from '../../src/vaerion/foundation/citations';
import { writeEvidenceRecord, printEvidenceRecord, toEvidenceLines } from './record';

const ANNOUNCEMENT_DIR = join(process.cwd(), 'constitution', 'announcement-registry');

function registeredAnnouncementIds(): string[] {
  const ids: string[] = [];
  for (const file of ['stage4-proposed-strings.json', 'stage6-proposed-strings.json']) {
    const parsed = JSON.parse(readFileSync(join(ANNOUNCEMENT_DIR, file), 'utf8')) as {
      strings?: readonly { readonly id: string }[];
    };
    for (const entry of parsed.strings ?? []) ids.push(entry.id);
  }
  return ids;
}

const violations: string[] = [];
const lines: { label: string; passed: boolean; evidence: string; citations?: readonly string[] }[] = [];

try {
  const registeredIds = registeredAnnouncementIds();
  if (registeredIds.length === 0) {
    throw new Error('the Announcement & Copy Registry files resolved zero ids — the parity proof would be vacuous (F-003)');
  }
  const report = assertAccessibility(registeredIds);
  const simulationEvidence = report.simulationEvidence.length > 0 ? report.simulationEvidence.join('; ') : 'none';
  lines.push({
    label: 'accessibility verification',
    passed: report.passed,
    evidence: report.passed
      ? `${registeredIds.length} registered announcement ids consumed by identifier; keyboard navigation, focus ownership/restoration, ARIA contracts, AA + AAA contrast, forced-color survival, and reduced-motion behavior all hold; 9.4 dichromacy simulations executed — recorded evidence (IR-016): ${simulationEvidence}`
      : report.findings.map((item) => `[${item.surface} / ${item.primitive}] ${item.rule} (${item.citation}): ${item.evidence}`).join(' | '),
    citations: report.citations.map((citation) => `${citation.document} ${citation.reference}`),
  });
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  lines.push({ label: 'accessibility verification', passed: false, evidence: error instanceof Error ? error.message : String(error) });
}

const verdict: 'PASS' | 'FAIL' = violations.length === 0 ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:verify-accessibility',
  verdict,
  checks: toEvidenceLines(lines),
  citations: [implementation('9.4'), implementation('9.5'), implementation('6.11'), implementation('9.1'), implementation('10.1')],
});

for (const line of record.checks) {
  console.log(`[${line.verdict}] ${line.check} — ${line.evidence}`);
}
printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  process.exit(1);
}
