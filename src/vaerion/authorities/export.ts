/**
 * Vaerion — Authorities / The Export Authority
 *
 * Export lifecycle (Constitution 8.7): "Criteria set → bundle assembled
 * from source records → manifest computed → signed → delivered. Exports
 * from Demo quarantines are refused by construction."
 *
 * The Export Authority owns bundles and manifests (8.0). The bundle is
 * assembled from the source records — the same source record set the
 * preview renders (7.10) — and demo-quarantined records are refused by
 * construction through the state engine's quarantine law (5.10; 8.7;
 * composition, never a duplicate).
 *
 * Citations: Implementation Constitution 8.0, 8.7, 8.8; 5.10; 7.10; Bible
 * Art. III, VIII.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { assertExportAllowed } from '../state/quarantine';
import type { HashFunction } from './hash';
import type { ReceiptRecord } from './ledger';
import { computeManifest, signManifest, verifyBundle, type ExportManifest, type ManifestVerification } from './manifest';

/** The stages of the export lifecycle (8.7), in order. */
export const EXPORT_STAGES = ['criteria-set', 'assembled', 'manifest-computed', 'signed', 'delivered'] as const;
export type ExportStage = (typeof EXPORT_STAGES)[number];

/** One immutable export record (8.7). */
export interface ExportRecord {
  readonly exportId: string;
  readonly criteria: readonly string[];
  readonly stage: ExportStage;
  /** The source receipt records the bundle was assembled from (8.7). */
  readonly sourceRecordIds: readonly string[];
  readonly recordHashes: readonly string[];
  readonly manifest: ExportManifest | null;
}

export interface ExportAuthority {
  readonly name: 'Export Authority';
  readonly records: readonly ExportRecord[];
  /** Sets the export criteria (8.7). */
  setCriteria(params: { readonly criteria: readonly string[] }): ExportRecord;
  /**
   * Assembles the bundle from source records — refused by construction for
   * Demo quarantines (8.7; 5.10).
   */
  assemble(params: { readonly exportId: string; readonly sourceRecords: readonly ReceiptRecord[] }): ExportRecord;
  /** Computes the manifest from the assembled bundle (8.7; 8.8). */
  computeManifest(params: { readonly exportId: string; readonly timestampAuthority: string; readonly issuingEngine: string; readonly ruleset: string }): ExportRecord;
  /** Signs the manifest — immutable after signing (8.8). */
  sign(params: { readonly exportId: string; readonly signature: string }): ExportRecord;
  /** Delivers — refuses anything unsigned (8.7; 8.8). */
  deliver(params: { readonly exportId: string }): ExportRecord;
  /** Third-party verification of a delivered bundle (8.8) — pure. */
  verifyDelivered(params: { readonly manifest: ExportManifest; readonly recordHashes: readonly string[] }): ManifestVerification;
}

const EXPORT_CITATIONS: readonly Citation[] = [
  implementation('8.7', 'export lifecycle'),
  implementation('8.8', 'manifest lifecycle'),
  implementation('5.10', 'demo quarantine — exports refused by construction'),
];

export function createExportAuthority(params: {
  readonly hash: HashFunction;
  readonly clock?: () => number;
}): ExportAuthority {
  const hash = params.hash;
  const clock = params.clock ?? (() => 0);
  let seq = 0;
  let records: readonly ExportRecord[] = Object.freeze([]);

  function replaceRecord(next: ExportRecord): void {
    records = Object.freeze([...records.filter((record) => record.exportId !== next.exportId), next]);
  }

  function requireRecord(exportId: string, stage: ExportStage): ExportRecord {
    const record = records.find((candidate) => candidate.exportId === exportId);
    if (!record) {
      throw new ConstitutionalViolationError(
        '8.7',
        `Export "${exportId}" does not exist (Constitution 8.7).`,
        EXPORT_CITATIONS,
      );
    }
    if (record.stage !== stage) {
      throw new ConstitutionalViolationError(
        '8.7',
        `Export "${exportId}" is "${record.stage}"; this operation requires "${stage}". The export lifecycle is criteria set → bundle assembled from source records → manifest computed → signed → delivered (Constitution 8.7).`,
        EXPORT_CITATIONS,
      );
    }
    return record;
  }

  return {
    name: 'Export Authority',
    get records() {
      return records;
    },
    setCriteria({ criteria }) {
      if (criteria.length === 0) {
        throw new ConstitutionalViolationError(
          '8.7',
          'An export was opened with no criteria. The lifecycle begins when criteria are set (Constitution 8.7).',
          EXPORT_CITATIONS,
        );
      }
      seq += 1;
      const record: ExportRecord = Object.freeze({
        exportId: `exp_${hash(criteria.join('|')).slice(0, 16)}_${seq}`,
        criteria: Object.freeze([...criteria]),
        stage: 'criteria-set',
        sourceRecordIds: [],
        recordHashes: [],
        manifest: null,
      });
      records = Object.freeze([...records, record]);
      return record;
    },
    assemble({ exportId, sourceRecords }) {
      requireRecord(exportId, 'criteria-set');
      if (sourceRecords.length === 0) {
        throw new ConstitutionalViolationError(
          '8.7',
          'An export bundle was assembled from no source records. The bundle is assembled from source records (Constitution 8.7).',
          EXPORT_CITATIONS,
        );
      }
      // Demo quarantine is honored by construction (8.7; 5.10) — composition
      // with the state engine's law, never a duplicate. The quarantine flag
      // travels on the receipt record (5.10); the state engine's refusal
      // reads it through the StateRecord contract.
      assertExportAllowed(
        sourceRecords.map((record) => ({ id: record.receiptId, quarantine: record.quarantine })),
      );
      const recordHashes = sourceRecords.map((record) => hash(`${record.receiptId}|${record.chainParent}|${record.verdict.outcome}`));
      const next: ExportRecord = Object.freeze({
        ...records.find((candidate) => candidate.exportId === exportId)!,
        stage: 'assembled',
        sourceRecordIds: Object.freeze(sourceRecords.map((record) => record.receiptId)),
        recordHashes: Object.freeze(recordHashes),
      });
      replaceRecord(next);
      return next;
    },
    computeManifest({ exportId, timestampAuthority, issuingEngine, ruleset }) {
      const record = requireRecord(exportId, 'assembled');
      const manifest = computeManifest({
        bundleHash: hash(record.recordHashes.join('|')),
        recordHashes: record.recordHashes,
        timestampAuthority,
        issuingEngine,
        ruleset,
        hash,
      });
      const next: ExportRecord = Object.freeze({ ...record, stage: 'manifest-computed', manifest });
      replaceRecord(next);
      return next;
    },
    sign({ exportId, signature }) {
      const record = requireRecord(exportId, 'manifest-computed');
      const signed = signManifest({ manifest: record.manifest!, signature, signedAt: clock() });
      const next: ExportRecord = Object.freeze({ ...record, stage: 'signed', manifest: signed });
      replaceRecord(next);
      return next;
    },
    deliver({ exportId }) {
      const record = requireRecord(exportId, 'signed');
      const next: ExportRecord = Object.freeze({ ...record, stage: 'delivered' });
      replaceRecord(next);
      return next;
    },
    verifyDelivered({ manifest, recordHashes }) {
      // Third parties verify a bundle against its manifest without product
      // access (8.8) — the pure manifest verification.
      return verifyBundle({ recordHashes, manifest, hash });
    },
  };
}
