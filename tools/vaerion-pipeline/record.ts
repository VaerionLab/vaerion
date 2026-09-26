/**
 * VAERION PIPELINE — Evidence Record Writer
 *
 * Every Stage 9 pipeline command emits its verdict as a machine-checkable
 * evidence record (order Deliverable 9):
 *
 *   PASS/FAIL · Evidence · Citation · Artifact location · Timestamp ·
 *   Integrity hash
 *
 * The record is written under tools/vaerion-pipeline/artifacts/ (pipeline
 * tooling owns intermediates — never the constitution tree, F-002 "What
 * Does Not Belong Here"). The integrity hash is SHA-256 over the canonical
 * record body; the record is frozen after writing.
 *
 * Citations: Implementation Constitution 9.1, 10.1, P-4; order Deliverable 9.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatCitations, type Citation } from '../../src/vaerion/foundation/citations';

const PIPELINE_DIR = resolve(dirname(fileURLToPath(import.meta.url)));
export const ARTIFACTS_DIR = join(PIPELINE_DIR, 'artifacts');

/** One check line of an evidence record. */
export interface EvidenceLine {
  readonly check: string;
  readonly verdict: 'PASS' | 'FAIL';
  readonly evidence: string;
  readonly citations: readonly string[];
}

/** The evidence record of one pipeline command. */
export interface EvidenceRecord {
  readonly recordId: string;
  readonly command: string;
  readonly verdict: 'PASS' | 'FAIL';
  readonly issuedAt: string;
  readonly issuedAtEpochMs: number;
  readonly checks: readonly EvidenceLine[];
  readonly citations: readonly string[];
  readonly artifact: string;
  readonly integrityHash: string;
  readonly integrityAlgorithm: 'sha256';
}

function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, item) => {
    if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;
      const sorted: Record<string, unknown> = {};
      for (const key of Object.keys(record).sort()) sorted[key] = record[key];
      return sorted;
    }
    return item;
  });
}

export interface RecordInput {
  readonly command: string;
  readonly verdict: 'PASS' | 'FAIL';
  readonly checks: readonly EvidenceLine[];
  readonly citations: readonly Citation[];
  /** Optional stage tag for the record id (Stage 9 commands default to "stage9"). */
  readonly stageTag?: string;
}

/** Writes the evidence record and returns it with its artifact location. */
export function writeEvidenceRecord(input: RecordInput): EvidenceRecord {
  const nowDate = new Date();
  const issuedAtEpochMs = nowDate.getTime();
  const recordId = `${input.stageTag ?? 'stage9'}-${input.command.replace(/[^a-z0-9]+/gi, '-')}-${issuedAtEpochMs}`;
  const artifact = join(ARTIFACTS_DIR, `${recordId}.json`);
  const body = {
    recordId,
    command: input.command,
    verdict: input.verdict,
    issuedAt: nowDate.toISOString(),
    issuedAtEpochMs,
    checks: input.checks,
    citations: input.citations.map((citation) => formatCitations([citation])),
    artifact,
  };
  const integrityHash = createHash('sha256').update(canonical(body)).digest('hex');
  const record: EvidenceRecord = Object.freeze({ ...body, integrityHash, integrityAlgorithm: 'sha256' });
  if (!existsSync(ARTIFACTS_DIR)) mkdirSync(ARTIFACTS_DIR, { recursive: true });
  writeFileSync(artifact, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  return record;
}

/** Prints the record in the ordered output form (order Deliverable 9). */
export function printEvidenceRecord(record: EvidenceRecord): void {
  console.log('');
  console.log('  VERDICT:            ' + record.verdict);
  console.log('  EVIDENCE:           ' + record.checks.length + ' check line(s) — see record artifact');
  console.log('  CITATION:           ' + record.citations.join(' | '));
  console.log('  ARTIFACT LOCATION:  ' + record.artifact);
  console.log('  TIMESTAMP:          ' + record.issuedAt + ' (' + record.issuedAtEpochMs + ' ms epoch)');
  console.log('  INTEGRITY HASH:     sha256:' + record.integrityHash);
}

/** Builds PASS/FAIL check lines from a results list with a per-item evidence string. */
export function toEvidenceLines(items: readonly { readonly label: string; readonly passed: boolean; readonly evidence: string; readonly citations?: readonly string[] }[]): EvidenceLine[] {
  return items.map((item) => ({
    check: item.label,
    verdict: item.passed ? 'PASS' : 'FAIL',
    evidence: item.evidence,
    citations: item.citations ?? [],
  }));
}
