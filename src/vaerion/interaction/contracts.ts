/**
 * Vaerion — Interaction / Constitutional Interaction Constants
 *
 * The ratified numbers of Part VI, each with its citation. Where the ratified
 * text registers a bound but not a number, the constant is NOT invented —
 * the absence is recorded and the pin is requested (P-5; Art. XI).
 *
 * Citations: Implementation Constitution 6.4, 6.6, 6.11, 6.12; Visual System
 * §5, §10, §13.2. Registered scale constants are consumed from the Registry
 * scales (1.3 — tokens are the only source of values).
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';

/** Constitution 6.4 — "Reversible acts hold a ten-second undo window." */
export const UNDO_WINDOW_MS = 10_000;
export const UNDO_WINDOW_CITATIONS: readonly Citation[] = [
  implementation('6.4', 'reversible acts hold a ten-second undo window'),
  implementation('5.8', 'undo restores the pre-act state exactly'),
];

/** Constitution 6.11 — "appends polite, batched at most every five seconds." */
export const ANNOUNCEMENT_BATCH_WINDOW_MS = 5_000;
export const ANNOUNCEMENT_BATCH_CITATIONS: readonly Citation[] = [
  implementation('6.11', 'appends polite, batched at most every five seconds'),
];

/** Constitution 6.11 — assertive announcements are reserved to user-triggered verdict changes. */
export const ASSERTIVE_ANNOUNCEMENT_CITATIONS: readonly Citation[] = [
  implementation('6.11', 'verdict changes assertive only when user-triggered'),
  implementation('6.11', 'seals announce the full fact — verdict, verifier, ruleset'),
];

/**
 * Constitution 6.12 — "appends streamed within the streaming budget." The
 * ratified documents register the contract but enumerate no number for the
 * budget (VS §13 and §7.3 name no value). No number is invented; the budget
 * is filed as IR-011 and the contract is enforced as a named bound whose pin
 * is requested (P-5).
 */
export const STREAMING_BUDGET_CITATIONS: readonly Citation[] = [
  implementation('6.12', 'appends streamed within the streaming budget — the budget number is not enumerated in the ratified text'),
];
