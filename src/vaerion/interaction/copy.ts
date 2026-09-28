/**
 * Vaerion — Interaction / Copy Module (Announcement & Copy Registry consumption)
 *
 * LAW (Constitution 6.11; Foundation Amendment F-003): every screen-reader
 * announcement, Return message, and interaction sentence resolves from the
 * Announcement & Copy Registry by identifier — no string is composed at
 * render time.
 *
 * The Announcement & Copy Registry held no ratified strings when Stage 6 was
 * ordered. The minimal string set the interaction engine requires is
 * therefore REGISTERED here, submitted as IR-012 (PROPOSED — inert until the
 * Founder ratifies; the same instrument as Stage 4's IR-009), recorded in
 * `constitution/announcement-registry/stage6-proposed-strings.json`, and
 * consumed by identifier only. Every entry declares its voice (Bible
 * Art. VII); honesty constraints (Art. VIII) bind: nothing overstates,
 * softens, or promises.
 *
 * Citations: Implementation Constitution 6.11, 4.7; F-003; Bible Art. VII,
 * VIII.
 */

import { implementation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';

export type InteractionVoice = 'machine' | 'human';

export interface InteractionCopyEntry {
  readonly id: string;
  readonly voice: InteractionVoice;
  readonly text: string;
  /** IR-012 proposal status — every string here is PROPOSED, not ratified. */
  readonly status: 'proposed (IR-012)';
}

function entry(id: string, voice: InteractionVoice, text: string): InteractionCopyEntry {
  return { id, voice, text, status: 'proposed (IR-012)' };
}

/** The Stage 6 proposed string set (IR-012), consumed by identifier (6.11). */
export const INTERACTION_COPY: readonly InteractionCopyEntry[] = Object.freeze([
  // Undo (6.4 — the window is surfaced as a Return).
  entry('interaction.undoWindow', 'human', 'Undo available for ten seconds. This act is reversible.'),
  entry('interaction.undoExecuted', 'human', 'Act undone. The pre-act state was restored exactly; no partial artifacts remain.'),
  entry('interaction.undoClosed', 'human', 'The undo window has closed. The act stands as recorded.'),
  // Cancellation (5.8 — the Return names the cancellation; refusal is truth over convenience).
  entry('interaction.cancelled', 'human', 'Act cancelled. The prior state was restored exactly. No partial artifacts remain.'),
  entry('interaction.cancellationRefused', 'human', 'Cancellation refused — the act already reached an authority. It resolves as a receipt.'),
  // Failure (5.2; 6.5 — every Error renders as a Failure Receipt with its receipt id).
  entry('interaction.actFailed', 'human', 'The act failed. A Failure Receipt records it with its receipt id.'),
  // Offline / Recovery (5.2; 5.4; 5.7 — the chrome announcement).
  entry('state.offline', 'machine', 'AUTHORITY UNREACHABLE — reads continue; writes halt'),
  entry('state.recovery', 'machine', 'RECOVERY — revalidating chain integrity before live resumption'),
  // Hold-to-affirm (6.6 — both paths identical).
  entry('interaction.holdToAffirm', 'human', 'Hold to affirm, or use the click-path ceremony. Releasing early cancels with no partial effect.'),
  // Lens (3.15; 6.8 — Escape returns to the originating claim).
  entry('interaction.lensEscape', 'machine', 'ESC RETURNS TO THE CLAIM'),
]);

const BY_ID: ReadonlyMap<string, InteractionCopyEntry> = new Map(
  INTERACTION_COPY.map((copyEntry) => [copyEntry.id, copyEntry]),
);

/** Resolves an interaction copy entry by identifier — no render-time composition (6.11; F-003). */
export function interactionCopy(id: string): InteractionCopyEntry {
  const found = BY_ID.get(id);
  if (!found) {
    throw new ConstitutionalViolationError(
      '6.11',
      `Unregistered interaction copy id "${id}". Strings are consumed from the Announcement & Copy Registry by identifier; composing copy at render time is a violation (Constitution 6.11; F-003).`,
    );
  }
  return found;
}
