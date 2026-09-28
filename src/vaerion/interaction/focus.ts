/**
 * Vaerion — Interaction / The Focus Engine
 *
 * Constitution 6.8 — Focus Ownership: "Exactly one focus owner per surface.
 * Focus is visible per the brass-ring contract, never animated, never
 * removed. Dialogs trap and restore focus. Lens activation moves focus to
 * the illuminated chain; Escape returns it to the originating claim."
 *
 * Citations: Implementation Constitution 6.8, 3.12, 3.15; VS §3.5; Bible
 * Art. XIV.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';

/** One focus ownership record (6.8). */
export interface FocusOwnership {
  /** The surface that owns focus. */
  readonly surfaceId: string;
  /** The element id that owns focus — exactly one per surface (6.8). */
  readonly ownerId: string | null;
}

const FOCUS_CITATIONS: readonly Citation[] = [implementation('6.8', 'focus ownership')];

/**
 * Focus ownership invariant (6.8): exactly one focus owner per surface.
 * Accepts the set of claimed owners within one surface; more than one is a
 * violation.
 */
export function assertSingleFocusOwner(surfaceId: string, claimedOwners: readonly string[]): void {
  const unique = new Set(claimedOwners);
  if (unique.size > 1) {
    throw new ConstitutionalViolationError(
      '6.8',
      `Surface "${surfaceId}" holds ${unique.size} focus owners (${[...unique].join(', ')}). Exactly one focus owner per surface (Constitution 6.8).`,
    );
  }
}

/**
 * Focus visibility contract (6.8; VS §3.5): focus is visible per the
 * brass-ring contract, never animated, never removed. The mechanical form
 * asserts the three prohibitions on a focus treatment declaration.
 */
export function assertFocusTreatmentLawful(treatment: { readonly visible: boolean; readonly animated: boolean; readonly removed: boolean }): void {
  if (!treatment.visible) {
    throw new ConstitutionalViolationError('6.8', 'Focus is not visible — the brass-ring contract requires visible focus (Constitution 6.8; VS §3.5).');
  }
  if (treatment.animated) {
    throw new ConstitutionalViolationError('6.8', 'Focus is animated — focus is never animated (Constitution 6.8).');
  }
  if (treatment.removed) {
    throw new ConstitutionalViolationError('6.8', 'Focus was removed — focus is never removed (Constitution 6.8).');
  }
}

/**
 * Focus restoration contract (6.8; 3.12): a dialog or the Lens, on close,
 * returns focus to the originating element. The engine records the
 * originator and asserts the restoration.
 */
export interface FocusRestoration {
  /** The element that held focus before the trap opened. */
  readonly originatorId: string;
  /** Whether focus was restored to the originator on close. */
  readonly restoredToOriginator: boolean;
}

export function assertFocusRestored(restoration: FocusRestoration): void {
  if (!restoration.restoredToOriginator) {
    throw new ConstitutionalViolationError(
      '6.8',
      `Focus was not restored to the originating element "${restoration.originatorId}". Dialogs trap and restore focus; Escape returns it to the originating claim (Constitution 6.8).`,
    );
  }
}

/**
 * Dialog trapping (6.8; 3.12): while a dialog is open, focus is trapped.
 * The mechanical form asserts the trap declaration of an open dialog.
 */
export function assertDialogTrapsFocus(open: boolean, trapDeclared: boolean): void {
  if (open && !trapDeclared) {
    throw new ConstitutionalViolationError(
      '6.8 / 3.12',
      'An open dialog without a declared focus trap — focus is trapped while the dialog is open (Constitution 6.8; 3.12).',
    );
  }
}

export { FOCUS_CITATIONS };
