/**
 * Vaerion — Interaction / Pointer & Gesture Ownership
 *
 * Pointer (Constitution 6.9): "Hover has meaning only where the Visual
 * System grants it (row washes, 300ms annotations); pointer-hold is reserved
 * for the Lens and hold-to-affirm; pointer events must never be the sole
 * path to any command."
 *
 * Gestures (Constitution 6.10): "Mobile gestures are enumerated:
 * tap-to-toggle Lens, hold-to-affirm, standard scroll. Drag interactions
 * (scrubber) must pair with step controls. Undocumented gestures are
 * prohibited."
 *
 * Citations: Implementation Constitution 6.9, 6.10; VS §10, §11, §12, §13.2.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { HOLD_AFFIRM_MS } from '../registry/scales';

/** The registered hover grants (6.9). Hover outside this set is a violation. */
export const HOVER_GRANTS = ['row-wash', 'annotation-300ms'] as const;
export type HoverGrant = (typeof HOVER_GRANTS)[number];

/** The pointer holds reserved by law (6.9). */
export const POINTER_HOLD_RESERVATIONS = ['proof-lens', 'hold-to-affirm'] as const;
export type PointerHoldReservation = (typeof POINTER_HOLD_RESERVATIONS)[number];

/** The enumerated mobile gestures (6.10). The set is closed. */
export const GESTURES = ['tap-to-toggle-lens', 'hold-to-affirm', 'standard-scroll', 'scrub-with-step-controls'] as const;
export type Gesture = (typeof GESTURES)[number];

const POINTER_CITATIONS: readonly Citation[] = [implementation('6.9', 'pointer ownership')];
const GESTURE_CITATIONS: readonly Citation[] = [implementation('6.10', 'gesture ownership — the enumerated set is closed')];

/**
 * Hover legality (6.9): hover meaning exists only where the Visual System
 * grants it. A hover use outside the registered grants throws.
 */
export function assertHoverLawful(grant: string): void {
  if (!HOVER_GRANTS.includes(grant as HoverGrant)) {
    throw new ConstitutionalViolationError(
      '6.9',
      `Hover grant "${grant}" is not registered. Hover has meaning only where the Visual System grants it (Constitution 6.9): ${HOVER_GRANTS.join(', ')}.`,
    );
  }
}

/**
 * Pointer-hold legality (6.9): pointer-hold is reserved for the Lens and
 * hold-to-affirm. Any other hold use throws.
 */
export function assertPointerHoldLawful(reservation: string): void {
  if (!POINTER_HOLD_RESERVATIONS.includes(reservation as PointerHoldReservation)) {
    throw new ConstitutionalViolationError(
      '6.9',
      `Pointer hold "${reservation}" is not reserved. Pointer-hold is reserved for the Lens and hold-to-affirm (Constitution 6.9).`,
    );
  }
}

/**
 * Pointer-never-sole-path (6.9): every pointer-activated command must have a
 * keyboard equivalent. The command registry carries `pointerEquivalent`;
 * this gate-form assertion refuses a command whose only path is pointer.
 */
export function assertPointerNeverSolePath(command: { readonly id: string; readonly key?: string }): void {
  if (!command.key) {
    throw new ConstitutionalViolationError(
      '6.9',
      `Command "${command.id}" has no keyboard binding — pointer events must never be the sole path to any command (Constitution 6.9; 6.7).`,
    );
  }
}

/**
 * Gesture legality (6.10): only the enumerated gestures exist. An
 * undocumented gesture throws.
 */
export function assertGestureLawful(gesture: string): void {
  if (!GESTURES.includes(gesture as Gesture)) {
    throw new ConstitutionalViolationError(
      '6.10',
      `Gesture "${gesture}" is not enumerated. Mobile gestures are enumerated — tap-to-toggle Lens, hold-to-affirm, standard scroll; undocumented gestures are prohibited (Constitution 6.10).`,
    );
  }
}

/**
 * Scrub pairing (6.10): a drag interaction must pair with step controls.
 * The mechanical form: the scrubber declares its paired step controls.
 */
export function assertScrubPairing(declaresStepControls: boolean): void {
  if (!declaresStepControls) {
    throw new ConstitutionalViolationError(
      '6.10',
      'A drag interaction without paired step controls. Drag interactions (scrubber) must pair with step controls (Constitution 6.10; VS §10).',
    );
  }
}

/** The ratified hold-to-affirm duration (6.6; VS §13.2 — consumed from the Registry scales). */
export const INTERACTION_HOLD_AFFIRM_MS = HOLD_AFFIRM_MS;
export const INTERACTION_HOLD_CITATIONS: readonly Citation[] = [
  implementation('6.6', 'verification and signing use a 600 ms hold with an equivalent click-path ceremony'),
  visualSystem('13.2', 'hold-to-affirm — 600 ms hold; releasing early cancels with no partial effect'),
];

export { POINTER_CITATIONS, GESTURE_CITATIONS };
