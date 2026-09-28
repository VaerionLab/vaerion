/**
 * Vaerion — Release / The Release Record Store (Node-only)
 *
 * The filesystem execution of the release record authority (Foundation
 * Amendment F-006): Release Receipts live under `constitution/releases/`;
 * build outputs NEVER do (F-006 "What Belongs Here — and What Never Does").
 *
 * Law enforced mechanically:
 * - Append-only: an existing receipt file or index entry is never
 *   overwritten — the store refuses (F-006 law 3; 10.4).
 * - Immutable records: any alteration of an issued receipt is detectable
 *   by digest recomputation (F-006 law 4).
 * - Idempotent ceremony: re-running the ceremony for an identical release
 *   identity returns the issued record after re-verifying its integrity —
 *   it does not duplicate history.
 *
 * This module is Node-only and deliberately excluded from the release
 * barrel (the foundation/testing precedent: pure cores stay browser-safe;
 * fs bindings live behind tooling imports only).
 *
 * Citations: Foundation Amendment F-006; Constitution 10.3, 10.4, 8.8,
 * 11.4; P-4.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { ConstitutionalViolationError } from '../foundation/authority';
import { CONSTITUTION_PATHS } from '../foundation/paths';
import type { Citation } from '../foundation/citations';
import type { ReleaseReceipt } from './receipt';
import type { ReleaseLedgerEntry } from './ledger';
import type { ArtifactRecord } from './artifacts';
import type { DistributionRecord } from './distribution';
import { verifyReceiptIntegrity } from './receipt';

/** The canonical release record index (F-006 — "the receipt index as it grows"). */
export interface ReleaseIndex {
  readonly indexId: 'vaerion-release-index';
  readonly entries: readonly {
    readonly releaseId: string;
    readonly version: string;
    readonly seq: number;
    readonly kind: string;
    readonly appendedAt: number;
    readonly receiptDigests: readonly string[];
    readonly receiptsFile: string;
    readonly parentReleaseId: string | null;
    readonly supersedes: string | null;
    readonly citations: readonly string[];
  }[];
}

const RELEASES_DIR = join(process.cwd(), CONSTITUTION_PATHS.releasesDir);
const INDEX_PATH = join(RELEASES_DIR, 'index.json');

/** The persisted ceremony record for one release. */
export interface StoredReleaseRecord {
  readonly releaseId: string;
  readonly version: string;
  readonly seq: number;
  readonly appendedAt: number;
  readonly receipts: readonly ReleaseReceipt[];
  readonly artifacts: readonly ArtifactRecord[];
  readonly distribution: readonly DistributionRecord[];
  readonly entry: ReleaseLedgerEntry;
}

function releaseDir(releaseId: string): string {
  return join(RELEASES_DIR, 'receipts');
}

/** Reads the release index, or null when no release has ever been issued. */
export function readReleaseIndex(): ReleaseIndex | null {
  if (!existsSync(INDEX_PATH)) return null;
  return JSON.parse(readFileSync(INDEX_PATH, 'utf8')) as ReleaseIndex;
}

/** Reads one stored release record, or null. */
export function readReleaseRecord(releaseId: string): StoredReleaseRecord | null {
  const index = readReleaseIndex();
  const entry = index?.entries.find((candidate) => candidate.releaseId === releaseId);
  if (!entry) return null;
  const path = join(RELEASES_DIR, 'receipts', entry.receiptsFile);
  if (!existsSync(path)) {
    throw new ConstitutionalViolationError(
      'F-006',
      `Release index references "${entry.receiptsFile}" but the receipt file is missing. The receipt chain is corrupt — brokenness is detectable, never silent (Constitution 8.8; F-006).`,
    );
  }
  return JSON.parse(readFileSync(path, 'utf8')) as StoredReleaseRecord;
}

/**
 * Appends a release record to the F-006 authority tree. Refuses to
 * overwrite an existing release (append-only, 10.4); returns the existing
 * record for an identical releaseId after proving its integrity
 * (idempotent ceremony).
 */
export function appendReleaseRecord(record: StoredReleaseRecord): {
  readonly stored: boolean;
  readonly record: StoredReleaseRecord;
} {
  if (!existsSync(RELEASES_DIR)) mkdirSync(RELEASES_DIR, { recursive: true });
  const receiptsDir = releaseDir(record.releaseId);
  if (!existsSync(receiptsDir)) mkdirSync(receiptsDir, { recursive: true });

  const index = readReleaseIndex() ?? { indexId: 'vaerion-release-index' as const, entries: [] };
  const existingEntry = index.entries.find((candidate) => candidate.releaseId === record.releaseId);
  if (existingEntry) {
    // Idempotent re-run: verify the issued record instead of duplicating it.
    const existing = readReleaseRecord(record.releaseId);
    if (!existing) {
      throw new ConstitutionalViolationError(
        'F-006',
        `Release "${record.releaseId}" is indexed but unreadable. The receipt chain is corrupt (Constitution 8.8).`,
      );
    }
    for (const receipt of existing.receipts) verifyReceiptIntegrity(receipt);
    return { stored: false, record: existing };
  }

  const receiptsFile = `${record.releaseId}.receipts.json`;
  const receiptsPath = join(receiptsDir, receiptsFile);
  if (existsSync(receiptsPath)) {
    throw new ConstitutionalViolationError(
      '10.4 / F-006',
      `A receipt file already exists at ${receiptsFile} but the index has no entry for "${record.releaseId}". The record tree is out of order — refusing to guess (Constitution 10.4; F-006).`,
    );
  }

  writeFileSync(
    receiptsPath,
    `${JSON.stringify(
      {
        ...record,
        receipts: record.receipts,
        artifacts: record.artifacts,
        distribution: record.distribution,
        entry: record.entry,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  const nextIndex: ReleaseIndex = {
    indexId: 'vaerion-release-index',
    entries: Object.freeze([
      ...index.entries,
      {
        releaseId: record.releaseId,
        version: record.version,
        seq: record.seq,
        kind: record.entry.kind,
        appendedAt: record.appendedAt,
        receiptDigests: record.receipts.map((receipt) => receipt.sha256),
        receiptsFile,
        parentReleaseId: record.entry.parentReleaseId,
        supersedes: record.entry.supersedes,
        citations: record.entry.citations.map((citation: Citation) => `${citation.document}:${citation.reference}`),
      },
    ]),
  };
  writeFileSync(INDEX_PATH, `${JSON.stringify(nextIndex, null, 2)}\n`, 'utf8');
  return { stored: true, record };
}
