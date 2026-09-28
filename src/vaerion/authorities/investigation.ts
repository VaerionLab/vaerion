/**
 * Vaerion — Authorities / The Investigation Lifecycle
 *
 * Investigation lifecycle (Constitution 8.6): "Opened (criteria plus lens
 * snapshot pinned to chain position) → annotated (Margin Notes, human
 * voice) → shared → closed. A shared investigation must replay the exact
 * saved fog and chain, honoring present-day restrictions honestly."
 *
 * INTERPRETATION REQUEST (P-5): the Constitution defines the investigation
 * lifecycle but names no owner for investigation records among the seven
 * authorities of 8.0. Ownership of the record store is filed as **IR-013**
 * in constitution/interpretations/LEDGER.md; until ruled, this module
 * implements exactly the defined lifecycle and composes the named
 * authorities for their owned facts — the Chain Authority for the chain
 * position pin (8.0), the Evidence Authority for restriction truth (8.2).
 * It claims no authority name and stores nothing outside its own scope.
 *
 * Citations: Implementation Constitution 8.6, 8.0, 8.2; Bible Art. XII.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import type { HashFunction } from './hash';
import type { ChainAuthority } from './chain';
import type { EvidenceAuthority } from './evidence';

/** The stages of the investigation lifecycle (8.6), in order. */
export const INVESTIGATION_STAGES = ['opened', 'annotated', 'shared', 'closed'] as const;
export type InvestigationStage = (typeof INVESTIGATION_STAGES)[number];

/** The lens snapshot pinned to a chain position (8.6; Art. XII). */
export interface LensSnapshot {
  readonly chainSeq: number;
  readonly chainHash: string;
  /** The saved fog of the moment the investigation opened (Art. XII). */
  readonly fogSaved: boolean;
}

/** One immutable investigation record (8.6). */
export interface InvestigationRecord {
  readonly investigationId: string;
  readonly criteria: readonly string[];
  readonly snapshot: LensSnapshot;
  readonly stage: InvestigationStage;
  /** Margin Notes, human voice (8.6; Art. VII). */
  readonly annotations: readonly { readonly noteId: string; readonly text: string }[];
  readonly sharedWith: readonly string[];
}

/** The replay of a shared investigation (8.6). */
export interface InvestigationReplay {
  readonly investigationId: string;
  /** The exact saved chain — records up to the pinned position (8.6). */
  readonly chainRecordsUpToPin: readonly { readonly seq: number; readonly hash: string }[];
  /** The exact saved fog (8.6). */
  readonly snapshot: LensSnapshot;
  /**
   * The evidence that is restricted TODAY — present-day restrictions are
   * honored honestly over the saved fog (8.6; 8.2).
   */
  readonly presentDayRestrictedEvidenceIds: readonly string[];
}

export interface InvestigationEngine {
  readonly name: 'Investigation Lifecycle (8.6)';
  readonly records: readonly InvestigationRecord[];
  /** Opens an investigation — criteria plus a lens snapshot pinned to chain position (8.6). */
  open(params: { readonly criteria: readonly string[]; readonly snapshot: LensSnapshot }): InvestigationRecord;
  /** Annotates — Margin Notes, human voice (8.6). */
  annotate(params: { readonly investigationId: string; readonly text: string }): InvestigationRecord;
  /** Shares the investigation (8.6). */
  share(params: { readonly investigationId: string; readonly audience: string }): InvestigationRecord;
  /** Closes the investigation (8.6). */
  close(params: { readonly investigationId: string }): InvestigationRecord;
  /** Replays a shared investigation — the exact saved fog and chain, honoring present-day restrictions (8.6). */
  replay(params: { readonly investigationId: string }): InvestigationReplay;
}

const INVESTIGATION_CITATIONS: readonly Citation[] = [
  implementation('8.6', 'investigation lifecycle'),
  implementation('P-5', 'record-store ownership filed as IR-013, not improvised'),
];

export const INVESTIGATION_NOTE: string =
  'Investigation record-store ownership is not defined by the seven authorities of 8.0; filed as IR-013 (P-5). The lifecycle itself is defined by 8.6 and implemented exactly.';

export function createInvestigationEngine(params: {
  readonly hash: HashFunction;
  readonly clock?: () => number;
  readonly chain: ChainAuthority;
  readonly evidence: EvidenceAuthority;
}): InvestigationEngine {
  const hash = params.hash;
  const clock = params.clock ?? (() => 0);
  const { chain, evidence } = params;
  let seq = 0;
  let records: readonly InvestigationRecord[] = Object.freeze([]);

  function replaceRecord(next: InvestigationRecord): void {
    records = Object.freeze([...records.filter((record) => record.investigationId !== next.investigationId), next]);
  }

  /** Requires the record to exist and to sit at one of the lawful stages. */
  function requireRecord(investigationId: string, allowedStages: readonly InvestigationStage[]): InvestigationRecord {
    const record = records.find((candidate) => candidate.investigationId === investigationId);
    if (!record) {
      throw new ConstitutionalViolationError(
        '8.6',
        `Investigation "${investigationId}" does not exist (Constitution 8.6).`,
        INVESTIGATION_CITATIONS,
      );
    }
    if (!allowedStages.includes(record.stage)) {
      throw new ConstitutionalViolationError(
        '8.6',
        `Investigation "${investigationId}" is "${record.stage}"; this operation requires one of: ${allowedStages.join(', ')}. The lifecycle is opened → annotated → shared → closed (Constitution 8.6).`,
        INVESTIGATION_CITATIONS,
      );
    }
    return record;
  }

  return {
    name: 'Investigation Lifecycle (8.6)',
    get records() {
      return records;
    },
    open({ criteria, snapshot }) {
      if (criteria.length === 0) {
        throw new ConstitutionalViolationError(
          '8.6',
          'An investigation was opened with no criteria. Opened means criteria plus lens snapshot (Constitution 8.6).',
          INVESTIGATION_CITATIONS,
        );
      }
      if (!snapshot.fogSaved) {
        throw new ConstitutionalViolationError(
          '8.6 / Art. XII',
          'An investigation was opened without its saved fog. Opened means criteria plus lens snapshot — the exact saved fog is the replay contract (Constitution 8.6).',
          INVESTIGATION_CITATIONS,
        );
      }
      // The snapshot is pinned to a chain position — the pin must match the
      // Chain Authority's record at that position (8.6; 8.0 composition).
      const pinned = chain.records.find((chainRecord) => chainRecord.seq === snapshot.chainSeq);
      if (!pinned || pinned.hash !== snapshot.chainHash) {
        throw new ConstitutionalViolationError(
          '8.6 / 8.0',
          `The lens snapshot pins chain position ${snapshot.chainSeq}, which does not resolve in the Chain Authority. The snapshot is pinned to a chain position (Constitution 8.6); a loose pin is a violation.`,
          INVESTIGATION_CITATIONS,
        );
      }
      seq += 1;
      const record: InvestigationRecord = Object.freeze({
        investigationId: `inv_${hash(`${criteria.join('|')}|${snapshot.chainHash}|${seq}`).slice(0, 16)}`,
        criteria: Object.freeze([...criteria]),
        snapshot: Object.freeze({ ...snapshot }),
        stage: 'opened',
        annotations: Object.freeze([]),
        sharedWith: Object.freeze([]),
      });
      records = Object.freeze([...records, record]);
      return record;
    },
    annotate({ investigationId, text }) {
      const record = requireRecord(investigationId, ['opened', 'annotated']);
      if (!text) {
        throw new ConstitutionalViolationError(
          '8.6',
          'An empty annotation cannot be recorded (Constitution 8.6).',
          INVESTIGATION_CITATIONS,
        );
      }
      const next: InvestigationRecord = Object.freeze({
        ...record,
        stage: record.stage === 'opened' ? 'annotated' : record.stage,
        annotations: Object.freeze([
          ...record.annotations,
          Object.freeze({ noteId: `note_${hash(`${investigationId}|${text}|${clock()}`).slice(0, 12)}`, text }),
        ]),
      });
      replaceRecord(next);
      return next;
    },
    share({ investigationId, audience }) {
      const record = requireRecord(investigationId, ['opened', 'annotated', 'shared']);
      if (!audience) {
        throw new ConstitutionalViolationError(
          '8.6',
          'A share must name its audience (Constitution 8.6).',
          INVESTIGATION_CITATIONS,
        );
      }
      const next: InvestigationRecord = Object.freeze({
        ...record,
        stage: 'shared',
        sharedWith: Object.freeze([...record.sharedWith, audience]),
      });
      replaceRecord(next);
      return next;
    },
    close({ investigationId }) {
      const record = requireRecord(investigationId, ['opened', 'annotated', 'shared']);
      const next: InvestigationRecord = Object.freeze({ ...record, stage: 'closed' });
      replaceRecord(next);
      return next;
    },
    replay({ investigationId }) {
      const record = requireRecord(investigationId, ['shared']);
      // The exact saved chain: records up to the pinned position (8.6).
      const chainRecordsUpToPin = chain.records
        .filter((chainRecord) => chainRecord.seq <= record.snapshot.chainSeq)
        .map((chainRecord) => ({ seq: chainRecord.seq, hash: chainRecord.hash }));
      // Present-day restrictions are honored honestly (8.6; 8.2): the
      // Evidence Authority's current restriction states govern the replay —
      // the saved fog never widens visibility beyond today's grants.
      const presentDayRestrictedEvidenceIds = evidence.events
        .filter((event) => event.kind === 'restricted')
        .map((event) => event.evidenceId);
      return Object.freeze({
        investigationId,
        chainRecordsUpToPin: Object.freeze(chainRecordsUpToPin),
        snapshot: record.snapshot,
        presentDayRestrictedEvidenceIds: Object.freeze(presentDayRestrictedEvidenceIds),
      });
    },
  };
}
