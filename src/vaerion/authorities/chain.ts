/**
 * Vaerion — Authorities / The Chain Authority
 *
 * Chain lifecycle (Constitution 8.5): "Genesis → append-only growth →
 * continuously attestable integrity. A break is a first-class event rendered
 * everywhere the chain renders. Reconciliation is explicit, recorded, and
 * never implicit."
 *
 * The Chain Authority owns append order and integrity (8.0). Appended
 * records are never edited (8.1; 11.4 — historical truth is never retired);
 * appends are refused while an unreconciled break exists, because recovery
 * must never paper over a gap (5.9).
 *
 * Citations: Implementation Constitution 8.0, 8.5, 8.1, 5.9; Bible Art.
 * VIII, XII.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import type { HashFunction } from './hash';

/** The kind of a chain record (8.5 — breaks and reconciliations are records too). */
export type ChainRecordKind = 'genesis' | 'append' | 'break' | 'reconciliation';

/** One immutable chain record (8.5). */
export interface ChainRecord {
  readonly seq: number;
  readonly hash: string;
  readonly parentHash: string;
  readonly kind: ChainRecordKind;
  readonly payload: string;
  readonly appendedAt: number;
}

/** The result of a continuous integrity attestation (8.5). */
export interface ChainIntegrity {
  readonly intact: boolean;
  readonly brokenAt: number | null;
  readonly records: number;
}

export interface ChainAuthority {
  readonly name: 'Chain Authority';
  /** The append-only record set — frozen; appends produce a new frozen set. */
  readonly records: readonly ChainRecord[];
  /** Appends one record. Refused while an unreconciled break exists (5.9). */
  append(params: { readonly payload: string; readonly kind?: ChainRecordKind }): ChainRecord;
  /** Continuously attestable integrity: recomputes the whole chain (8.5). */
  integrity(): ChainIntegrity;
  /** Records a break as a first-class event (8.5). */
  recordBreak(params: { readonly atSeq: number; readonly reason: string }): ChainRecord;
  /** Explicit, recorded reconciliation — never implicit (8.5; 5.9). */
  reconcile(params: { readonly resolution: string }): ChainRecord;
  /** The unreconciled break, if any (5.9 — the break renders as a break until reconciled). */
  readonly openBreak: { readonly atSeq: number; readonly reason: string } | null;
}

const CHAIN_CITATIONS: readonly Citation[] = [
  implementation('8.5', 'chain lifecycle'),
  implementation('8.0', 'the Chain Authority owns append order and integrity'),
];

function canonicalRecord(record: Omit<ChainRecord, 'hash'>): string {
  return [record.seq, record.parentHash, record.kind, record.payload, record.appendedAt].join('|');
}

/**
 * Creates the Chain Authority. The hash function and clock are injected
 * (P-6 — two teams produce identical results; the engine never reads a wall
 * clock implicitly).
 */
export function createChainAuthority(params: {
  readonly hash: HashFunction;
  readonly clock?: () => number;
}): ChainAuthority {
  const hash = params.hash;
  const clock = params.clock ?? (() => 0);
  let openBreak: { readonly atSeq: number; readonly reason: string } | null = null;

  const genesisRecord: ChainRecord = Object.freeze((() => {
    const base = {
      seq: 0,
      parentHash: '0'.repeat(64),
      kind: 'genesis' as ChainRecordKind,
      payload: 'chain genesis',
      appendedAt: clock(),
    };
    return { ...base, hash: hash(canonicalRecord(base)) };
  })());

  let records: readonly ChainRecord[] = Object.freeze([genesisRecord]);

  function head(): ChainRecord {
    return records[records.length - 1];
  }

  function appendFrozen(record: ChainRecord): void {
    records = Object.freeze([...records, record]);
  }

  const authority: ChainAuthority = {
    name: 'Chain Authority',
    get records() {
      return records;
    },
    get openBreak() {
      return openBreak;
    },
    append({ payload, kind = 'append' }) {
      if (openBreak) {
        throw new ConstitutionalViolationError(
          '5.9 / 8.5',
          `An append was refused while an unreconciled break exists at seq ${openBreak.atSeq}. Recovery must never paper over a gap (Constitution 5.9); the break renders as a break until the Chain Authority reconciles.`,
          CHAIN_CITATIONS,
        );
      }
      const previous = head();
      const base = {
        seq: previous.seq + 1,
        parentHash: previous.hash,
        kind,
        payload,
        appendedAt: clock(),
      };
      const record: ChainRecord = Object.freeze({ ...base, hash: hash(canonicalRecord(base)) });
      appendFrozen(record);
      return record;
    },
    integrity() {
      // Continuously attestable integrity (8.5): the whole chain recomputes.
      let expectedParent = '0'.repeat(64);
      for (const record of records) {
        if (record.parentHash !== expectedParent || record.hash !== hash(canonicalRecord(record))) {
          return Object.freeze({ intact: false, brokenAt: record.seq, records: records.length });
        }
        expectedParent = record.hash;
      }
      return Object.freeze({ intact: true, brokenAt: null, records: records.length });
    },
    recordBreak({ atSeq, reason }) {
      if (openBreak) {
        throw new ConstitutionalViolationError(
          '8.5',
          'A break is already recorded and unreconciled. One open break at a time; reconcile before recording another (Constitution 8.5).',
          CHAIN_CITATIONS,
        );
      }
      openBreak = Object.freeze({ atSeq, reason });
      const previous = head();
      const base = {
        seq: previous.seq + 1,
        parentHash: previous.hash,
        kind: 'break' as ChainRecordKind,
        payload: `break at seq ${atSeq}: ${reason}`,
        appendedAt: clock(),
      };
      const record: ChainRecord = Object.freeze({ ...base, hash: hash(canonicalRecord(base)) });
      appendFrozen(record);
      return record;
    },
    reconcile({ resolution }) {
      if (!openBreak) {
        throw new ConstitutionalViolationError(
          '8.5',
          'Reconciliation attempted with no recorded break. Reconciliation is explicit, recorded, and never implicit (Constitution 8.5) — it exists only in answer to a recorded break.',
          CHAIN_CITATIONS,
        );
      }
      // Reconciliation requires the chain to actually verify (5.9 — never
      // paper over a gap). An unresolved integrity failure keeps the break.
      const attestation = authority.integrity();
      if (!attestation.intact) {
        throw new ConstitutionalViolationError(
          '5.9 / 8.5',
          `Reconciliation refused: the chain does not verify (broken at seq ${attestation.brokenAt}). A detected gap renders as a visible break and remains until the Chain Authority reconciles — recovery must never paper over a gap (Constitution 5.9).`,
          CHAIN_CITATIONS,
        );
      }
      const previous = head();
      const base = {
        seq: previous.seq + 1,
        parentHash: previous.hash,
        kind: 'reconciliation' as ChainRecordKind,
        payload: `reconciled break at seq ${openBreak.atSeq}: ${resolution}`,
        appendedAt: clock(),
      };
      const record: ChainRecord = Object.freeze({ ...base, hash: hash(canonicalRecord(base)) });
      appendFrozen(record);
      openBreak = null;
      return record;
    },
  };

  return authority;
}
