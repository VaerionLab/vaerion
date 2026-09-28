/**
 * Vaerion — Interaction / Hold-to-Affirm
 *
 * Constitution 6.6: "Verification and signing use a 600ms hold (pointer or
 * held Enter) with an equivalent click-path ceremony. Both paths must
 * produce identical receipts and identical announcements."
 *
 * VS §13.2: "The hold renders its progress on the registered meter;
 * releasing early cancels with no partial effect."
 *
 * The duration is consumed from the Registry scales (HOLD_AFFIRM_MS — VS
 * §13.2; 1.3). The engine models the hold contract; the rendering meter
 * belongs to the surface's hold control (Constitution Part V — the surface
 * hosts, the primitive renders).
 *
 * Citations: Implementation Constitution 6.6; VS §13.2; Part V (state law —
 * releasing early cancels with no partial effect).
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { HOLD_AFFIRM_MS } from '../registry/scales';

/** The ratified hold duration (6.6; VS §13.2). */
export const HOLD_DURATION_MS = HOLD_AFFIRM_MS;

export const HOLD_CITATIONS: readonly Citation[] = [
  implementation('6.6', 'hold-to-affirm — 600 ms hold, both paths identical'),
  implementation('6.5', 'both paths produce identical receipts'),
];

/** The two lawful hold input paths (6.6). */
export const HOLD_PATHS = ['pointer-hold', 'held-enter'] as const;
export type HoldPath = (typeof HOLD_PATHS)[number];

/** The state of one hold interaction. */
export interface HoldState {
  readonly path: HoldPath;
  /** Milliseconds held so far, measured — never estimated (1.6; Art. VIII). */
  readonly heldMs: number;
  readonly completed: boolean;
}

/**
 * Completes a hold. A hold that has not reached the registered duration is a
 * cancellation — "releasing early cancels with no partial effect" (VS
 * §13.2; 5.8). Only a completed hold may affirm.
 */
export function completeHold(state: HoldState): { readonly affirmed: boolean } {
  if (state.completed && state.heldMs >= HOLD_DURATION_MS) {
    return { affirmed: true };
  }
  if (state.heldMs < HOLD_DURATION_MS && state.completed) {
    throw new ConstitutionalViolationError(
      '6.6',
      `A hold of ${state.heldMs} ms was affirmed before the registered ${HOLD_DURATION_MS} ms. Releasing early cancels with no partial effect (VS §13.2; Constitution 5.8).`,
    );
  }
  return { affirmed: false };
}

/**
 * Path equivalence (6.6): the pointer path and the click-path ceremony must
 * produce identical receipts and identical announcements. The mechanical
 * form compares the two path outcomes.
 */
export function assertPathEquivalence(params: {
  readonly pointer: { readonly receiptId: string; readonly announcement: string };
  readonly clickPath: { readonly receiptId: string; readonly announcement: string };
}): void {
  if (params.pointer.receiptId !== params.clickPath.receiptId || params.pointer.announcement !== params.clickPath.announcement) {
    throw new ConstitutionalViolationError(
      '6.6',
      'The hold path and the click-path ceremony produced different receipts or announcements. Both paths must produce identical receipts and identical announcements (Constitution 6.6).',
    );
  }
}
