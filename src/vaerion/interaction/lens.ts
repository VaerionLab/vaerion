/**
 * Vaerion — Interaction / The Lens Interaction Engine
 *
 * Constitution 3.15 + VS §12 + Bible Art. XII. The Lens is singular; this
 * engine owns its interaction law:
 *   - activation paths: pointer hold, Alt-hover, keyboard focus + L, mobile
 *     tap-to-toggle (3.15; VS §11) — pointer paths are never the sole path
 *     (6.9);
 *   - the veil covers at veil.3; the illuminated chain renders at lens.6
 *     (VS §3.4, §12) — rendering belongs to the Lens primitive;
 *   - activation moves focus to the illuminated chain; Escape returns it to
 *     the originating claim (6.8);
 *   - the Lens adds light, never access — restricted evidence renders
 *     hatched with its honest notice (3.15; 5.2; Art. XII);
 *   - transitions obey the motion law and reduced-motion parity is complete
 *     (Art. V; VS §7.3; 7.9).
 *
 * The pointer-hold duration is the Stage 4 structural pin recorded in IR-010
 * (350 ms, within the motion bound) — not a new invention.
 *
 * Citations: Implementation Constitution 3.15, 6.8, 6.9, 6.10; Visual System
 * §3.4, §11, §12; Bible Art. V, XII.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, visualSystem, bible, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';

/** The registered activation paths of the Lens (3.15; VS §11). */
export const LENS_ACTIVATION_PATHS = ['pointer-hold', 'alt-hover', 'focus-plus-l', 'tap-to-toggle'] as const;
export type LensActivationPath = (typeof LENS_ACTIVATION_PATHS)[number];

export const LENS_CITATIONS: readonly Citation[] = [
  implementation('3.15', 'the Lens — evidence x-ray'),
  visualSystem('12', 'the Proof Lens — visual registration'),
  bible('XII', 'the signature moment; access-control law'),
];

/** One Lens activation (6.8 focus movement is tracked with it). */
export interface LensActivation {
  readonly path: LensActivationPath;
  /** The claim under inspection. */
  readonly claimId: string;
  /** The element that held focus before activation — Escape returns to it (6.8). */
  readonly originatingFocusId: string;
}

/**
 * Activation legality (3.15; 6.9): the path must be registered, and a
 * pointer path must not be the only available path (the keyboard path always
 * exists).
 */
export function assertActivationLawful(params: { readonly path: LensActivationPath; readonly keyboardPathAvailable: boolean }): void {
  if (!LENS_ACTIVATION_PATHS.includes(params.path)) {
    throw new ConstitutionalViolationError(
      '3.15',
      `"${String(params.path)}" is not a registered Lens activation path. Activation is by pointer hold, Alt-hover, keyboard focus + L, or mobile tap-to-toggle (Constitution 3.15; VS §11).`,
    );
  }
  if (!params.keyboardPathAvailable) {
    throw new ConstitutionalViolationError(
      '6.9',
      'The Lens was offered without its keyboard path — pointer events must never be the sole path to any command (Constitution 6.9).',
    );
  }
}

/**
 * Lens focus law (6.8): activation moves focus to the illuminated chain;
 * Escape returns it to the originating claim. The mechanical form records
 * both movements and refuses an Escape restoration to any other element.
 */
export function assertLensFocusLaw(params: {
  readonly activation: LensActivation;
  readonly focusMovedToChain: boolean;
  readonly escapeRestoredToOriginator: boolean;
}): void {
  if (!params.focusMovedToChain) {
    throw new ConstitutionalViolationError(
      '6.8',
      'Lens activation did not move focus to the illuminated chain (Constitution 6.8; 3.15).',
    );
  }
  if (!params.escapeRestoredToOriginator) {
    throw new ConstitutionalViolationError(
      '6.8',
      `Escape did not return focus to the originating claim "${params.activation.originatingFocusId}" (Constitution 6.8).`,
    );
  }
}

/**
 * Lens honesty (3.15; Art. XII): the Lens adds light, never access. A Lens
 * rendering that reveals restricted evidence — rather than the hatched
 * notice — is a violation.
 */
export function assertLensHonorsRestrictions(params: {
  readonly restrictedCount: number;
  readonly restrictedRenderedHatched: boolean;
}): void {
  if (params.restrictedCount > 0 && !params.restrictedRenderedHatched) {
    throw new ConstitutionalViolationError(
      '3.15 / 5.2',
      'The Lens revealed restricted evidence. Restricted evidence renders hatched with its honest notice — the Lens adds light, never access (Constitution 3.15; 5.2; Art. XII).',
    );
  }
}
