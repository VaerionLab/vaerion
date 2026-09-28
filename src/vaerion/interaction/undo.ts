/**
 * Vaerion — Interaction / The Undo System
 *
 * Constitution 6.4: "Reversible acts hold a ten-second undo window surfaced
 * as a Return. Undo restores the pre-act state exactly. Consequential and
 * destructive acts have no undo; their weight is their contract."
 *
 * Restoration exactness is state law (5.8): the cancelled act must restore
 * the pre-act state exactly and leave no partial artifacts.
 *
 * Citations: Implementation Constitution 6.4, 5.8, 6.5; VS §13.1.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { UNDO_WINDOW_MS, UNDO_WINDOW_CITATIONS } from './contracts';
import type { FrictionClass } from './commands';

export { UNDO_WINDOW_MS, UNDO_WINDOW_CITATIONS };

/** A reversible act registered with the undo system (6.4). */
export interface UndoableAct {
  /** The act's machine id (6.5 — Returns carry the machine id). */
  readonly actId: string;
  /** Monotonic dispatch timestamp of the act, measured. */
  readonly dispatchedAtMs: number;
  /** The pre-act state — restored exactly on undo (5.8). */
  readonly preActState: unknown;
  readonly friction: FrictionClass;
}

/** Whether the act's undo window is open at the given time (6.4 — ten seconds). */
export function isUndoWindowOpen(act: UndoableAct, nowMs: number): boolean {
  return act.friction === 'reversible' && nowMs - act.dispatchedAtMs < UNDO_WINDOW_MS;
}

/**
 * Executes an undo. Refuses:
 *   - consequential and destructive acts — they have no undo (6.4);
 *   - acts whose window has closed;
 *   - any restoration that is not exact (5.8).
 */
export function executeUndo(params: {
  readonly act: UndoableAct;
  readonly nowMs: number;
  /** The state offered for restoration — must equal the pre-act state exactly. */
  readonly offeredRestoreState: unknown;
}): { readonly restored: true } {
  const { act, nowMs } = params;
  if (act.friction === 'significant' || act.friction === 'destructive') {
    throw new ConstitutionalViolationError(
      '6.4',
      `Act "${act.actId}" is ${act.friction} — consequential and destructive acts have no undo; their weight is their contract (Constitution 6.4).`,
    );
  }
  if (nowMs - act.dispatchedAtMs >= UNDO_WINDOW_MS) {
    throw new ConstitutionalViolationError(
      '6.4',
      `The undo window of act "${act.actId}" has closed. Reversible acts hold a ten-second undo window (Constitution 6.4).`,
    );
  }
  if (!deepExactEqual(act.preActState, params.offeredRestoreState)) {
    throw new ConstitutionalViolationError(
      '5.8',
      `The undo of act "${act.actId}" did not restore the pre-act state exactly. Undo restores the pre-act state exactly and leaves no partial artifacts (Constitution 6.4; 5.8).`,
    );
  }
  return { restored: true };
}

/** Structural exactness (5.8) — a deterministic deep equality for restore proofs. */
function deepExactEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => deepExactEqual(item, b[index]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a as Record<string, unknown>).sort();
    const kb = Object.keys(b as Record<string, unknown>).sort();
    if (!deepExactEqual(ka, kb)) return false;
    return ka.every((key) =>
      deepExactEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
    );
  }
  return false;
}

/**
 * The undo Return obligation (6.4; 6.5): a reversible act surfaces its undo
 * window as a Return. The Return message resolves from the Announcement &
 * Copy Registry (6.11) — the engine carries the registry id, never a
 * composed string.
 */
export const UNDO_RETURN_COPY_ID = 'interaction.undoWindow';
export const UNDO_EXECUTED_COPY_ID = 'interaction.undoExecuted';
export const UNDO_CITATIONS: readonly Citation[] = [
  implementation('6.4', 'reversible acts hold a ten-second undo window surfaced as a Return'),
  implementation('6.11', 'the Return message resolves from the Announcement & Copy Registry'),
];
