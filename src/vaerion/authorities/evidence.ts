/**
 * Vaerion — Authorities / The Evidence Authority
 *
 * Evidence lifecycle (Constitution 8.2): "Captured (type, source, hash,
 * captured-at) → attested into a receipt → referenced by chains, lenses,
 * investigations. Restriction is a first-class state that travels with the
 * artifact; missing evidence is a recorded state, never silent deletion."
 *
 * The Evidence Authority owns artifacts and restrictions (8.0). Each item
 * is hashed at capture (8.1). The store is an append-only event log —
 * current state is derived, never mutated (no mutation of constitutional
 * history).
 *
 * Citations: Implementation Constitution 8.0, 8.2, 8.1; Bible Art. II,
 * VIII, XII.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import type { HashFunction } from './hash';

/** The restriction state that travels with the artifact (8.2). */
export type EvidenceRestriction = 'open' | 'restricted';

/** One immutable evidence event (the store is append-only). */
export type EvidenceEvent =
  | { readonly kind: 'captured'; readonly evidenceId: string; readonly type: string; readonly source: string; readonly hash: string; readonly capturedAt: number; readonly restriction: EvidenceRestriction }
  | { readonly kind: 'missing-recorded'; readonly evidenceId: string; readonly type: string; readonly source: string; readonly capturedAt: number }
  | { readonly kind: 'restricted'; readonly evidenceId: string; readonly restrictedAt: number }
  | { readonly kind: 'attested'; readonly evidenceId: string; readonly receiptId: string; readonly attestedAt: number }
  | { readonly kind: 'referenced'; readonly evidenceId: string; readonly referenceId: string; readonly referencedAt: number };

/** The derived state of one artifact (8.2). */
export interface EvidenceState {
  readonly evidenceId: string;
  readonly type: string;
  readonly source: string;
  readonly hash: string;
  readonly capturedAt: number;
  readonly restriction: EvidenceRestriction;
  /** Missing evidence is a recorded state, never silent deletion (8.2). */
  readonly missing: boolean;
  readonly attestedInto: readonly string[];
  readonly references: readonly string[];
}

export interface EvidenceAuthority {
  readonly name: 'Evidence Authority';
  /** The append-only event log — frozen; every write produces a new set. */
  readonly events: readonly EvidenceEvent[];
  /** Captures an artifact — hashed at capture (8.1; 8.2). */
  capture(params: { readonly type: string; readonly source: string; readonly content: string; readonly restriction?: EvidenceRestriction }): EvidenceState;
  /** Records missing evidence — a recorded state, never silent deletion (8.2). */
  recordMissing(params: { readonly type: string; readonly source: string }): EvidenceState;
  /** Restricts an artifact — the restriction travels with it (8.2). */
  restrict(params: { readonly evidenceId: string }): EvidenceState;
  /** Attests evidence into a receipt (8.2). */
  attest(params: { readonly evidenceId: string; readonly receiptId: string }): EvidenceState;
  /** References evidence from a chain, lens, or investigation (8.2). */
  reference(params: { readonly evidenceId: string; readonly referenceId: string }): EvidenceState;
  /** The present-day derived state of one artifact. */
  stateOf(evidenceId: string): EvidenceState;
}

const EVIDENCE_CITATIONS: readonly Citation[] = [
  implementation('8.2', 'evidence lifecycle'),
  implementation('8.1', 'each item hashed at capture'),
];

export function createEvidenceAuthority(params: {
  readonly hash: HashFunction;
  readonly clock?: () => number;
}): EvidenceAuthority {
  const hash = params.hash;
  const clock = params.clock ?? (() => 0);
  let seq = 0;
  let events: readonly EvidenceEvent[] = Object.freeze([]);

  function emit(event: EvidenceEvent): void {
    seq += 1;
    events = Object.freeze([...events, event]);
  }

  function requireState(evidenceId: string): EvidenceState {
    const state = authority.stateOf(evidenceId);
    if (!state) {
      throw new ConstitutionalViolationError(
        '8.2',
        `Evidence "${evidenceId}" does not exist. Artifacts are owned by the Evidence Authority; unknown artifacts resolve nothing (Constitution 8.0; 8.2).`,
        EVIDENCE_CITATIONS,
      );
    }
    return state;
  }

  const authority: EvidenceAuthority = {
    name: 'Evidence Authority',
    get events() {
      return events;
    },
    capture({ type, source, content, restriction = 'open' }) {
      const evidenceId = `evd_${hash(`${type}|${source}|${content}|${clock()}`).slice(0, 16)}`;
      // Each item is hashed at capture (8.1; 8.2).
      emit({ kind: 'captured', evidenceId, type, source, hash: hash(content), capturedAt: clock(), restriction });
      return authority.stateOf(evidenceId);
    },
    recordMissing({ type, source }) {
      const evidenceId = `evd_missing_${hash(`${type}|${source}|${clock()}`).slice(0, 16)}`;
      emit({ kind: 'missing-recorded', evidenceId, type, source, capturedAt: clock() });
      return authority.stateOf(evidenceId);
    },
    restrict({ evidenceId }) {
      const state = requireState(evidenceId);
      if (state.missing) {
        throw new ConstitutionalViolationError(
          '8.2',
          `Missing evidence "${evidenceId}" cannot be restricted. Missing evidence is a recorded state — an absence, not an artifact (Constitution 8.2).`,
          EVIDENCE_CITATIONS,
        );
      }
      if (state.restriction === 'restricted') {
        throw new ConstitutionalViolationError(
          '8.2',
          `Evidence "${evidenceId}" is already restricted. The restriction is a first-class state that travels with the artifact; re-restriction is not a state change (Constitution 8.2).`,
          EVIDENCE_CITATIONS,
        );
      }
      emit({ kind: 'restricted', evidenceId, restrictedAt: clock() });
      return authority.stateOf(evidenceId);
    },
    attest({ evidenceId, receiptId }) {
      const state = requireState(evidenceId);
      if (state.missing) {
        throw new ConstitutionalViolationError(
          '8.2 / Art. II',
          `Missing evidence "${evidenceId}" cannot be attested into a receipt. Missing evidence is a recorded state, never silent deletion — and an absence cannot attest a claim (Constitution 8.2; Art. II).`,
          EVIDENCE_CITATIONS,
        );
      }
      if (state.attestedInto.includes(receiptId)) {
        throw new ConstitutionalViolationError(
          '8.2',
          `Evidence "${evidenceId}" is already attested into receipt "${receiptId}". Attestation is recorded once (Constitution 8.2).`,
          EVIDENCE_CITATIONS,
        );
      }
      emit({ kind: 'attested', evidenceId, receiptId, attestedAt: clock() });
      return authority.stateOf(evidenceId);
    },
    reference({ evidenceId, referenceId }) {
      requireState(evidenceId);
      emit({ kind: 'referenced', evidenceId, referenceId, referencedAt: clock() });
      return authority.stateOf(evidenceId);
    },
    stateOf(evidenceId) {
      let state: EvidenceState | null = null;
      for (const event of events) {
        if (event.evidenceId !== evidenceId) continue;
        switch (event.kind) {
          case 'captured':
            state = {
              evidenceId: event.evidenceId,
              type: event.type,
              source: event.source,
              hash: event.hash,
              capturedAt: event.capturedAt,
              restriction: event.restriction,
              missing: false,
              attestedInto: [],
              references: [],
            };
            break;
          case 'missing-recorded':
            state = {
              evidenceId: event.evidenceId,
              type: event.type,
              source: event.source,
              hash: '',
              capturedAt: event.capturedAt,
              restriction: 'open',
              missing: true,
              attestedInto: [],
              references: [],
            };
            break;
          case 'restricted': {
            const current = state;
            if (current) state = { ...current, restriction: 'restricted' };
            break;
          }
          case 'attested': {
            const current = state;
            if (current) state = { ...current, attestedInto: [...current.attestedInto, event.receiptId] };
            break;
          }
          case 'referenced': {
            const current = state;
            if (current) state = { ...current, references: [...current.references, event.referenceId] };
            break;
          }
        }
      }
      if (!state) {
        throw new ConstitutionalViolationError(
          '8.2',
          `Evidence "${evidenceId}" resolves no state — it was never captured (Constitution 8.2).`,
          EVIDENCE_CITATIONS,
        );
      }
      return Object.freeze(state);
    },
  };

  return authority;
}
