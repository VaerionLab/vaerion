/**
 * Vaerion — Interaction / The Accessibility Announcement System
 *
 * Constitution 6.11 — Accessibility Ownership: "all screen-reader
 * announcements, verdict wordings, empty-state sentences, and state
 * explanations must resolve from one registry [the Announcement and Copy
 * Registry], so that two independent teams announce identical strings.
 * Announcements: appends polite, batched at most every five seconds; verdict
 * changes assertive only when user-triggered; seals announce the full fact —
 * verdict, verifier, ruleset."
 *
 * The system consumes strings by identifier from the copy authority
 * (F-003); composing copy at render time is a violation. The Stage 6 string
 * set is registered in
 * `constitution/announcement-registry/stage6-proposed-strings.json`
 * (proposed — IR-012) and consumed by identifier below.
 *
 * Citations: Implementation Constitution 6.11; Foundation Amendment F-003;
 * Bible Art. IV, VII, XIII.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { ANNOUNCEMENT_BATCH_WINDOW_MS, ANNOUNCEMENT_BATCH_CITATIONS } from './contracts';

/** The voice of an announcement (Bible Art. VII — the two voices). */
export type AnnouncementVoice = 'machine' | 'human';

/** The politeness of an announcement (6.11). */
export type AnnouncementPoliteness = 'polite' | 'assertive';

/** A registered announcement request (6.11). */
export interface AnnouncementRequest {
  /** The registry identifier — strings are consumed by identifier (F-003). */
  readonly copyId: string;
  /** The resolved announced text from the copy authority. */
  readonly text: string;
  readonly voice: AnnouncementVoice;
  /**
   * Assertive is lawful only when the announcement reports a verdict change
   * that the user triggered (6.11).
   */
  readonly politeness: AnnouncementPoliteness;
  /** Whether the user triggered the fact being announced. */
  readonly userTriggered: boolean;
  /** The full fact for verdict announcements — verdict, verifier, ruleset (6.11). */
  readonly fullFact?: { readonly verdict: string; readonly verifier?: string; readonly ruleset?: string };
}

export const ANNOUNCEMENT_CITATIONS: readonly Citation[] = [
  implementation('6.11', 'the announcement system resolves from one registry'),
  implementation('F-003', 'the Announcement & Copy Registry authority'),
];

/**
 * Announcement legality (6.11): the announced text must come from the
 * registry (non-empty, identifier-consumed); assertive politeness is lawful
 * only for user-triggered verdict changes; verdict announcements must carry
 * the full fact.
 */
export function assertAnnouncementLawful(request: AnnouncementRequest): void {
  if (!request.copyId || !request.text) {
    throw new ConstitutionalViolationError(
      '6.11',
      'An announcement without a registry identifier or text. All announcements resolve from the Announcement and Copy Registry (Constitution 6.11; F-003); composing copy at render time is a violation.',
    );
  }
  if (request.politeness === 'assertive' && !(request.userTriggered && request.fullFact)) {
    throw new ConstitutionalViolationError(
      '6.11',
      'An assertive announcement that is not a user-triggered verdict change. Verdict changes are assertive only when user-triggered (Constitution 6.11).',
    );
  }
  if (request.fullFact) {
    const { verdict, verifier, ruleset } = request.fullFact;
    if (verifier !== undefined && (!verifier || !ruleset)) {
      throw new ConstitutionalViolationError(
        '6.11',
        'A verdict announcement without the full fact. Seals announce the full fact — verdict, verifier, ruleset (Constitution 6.11; Art. III).',
      );
    }
  }
}

/**
 * Batch legality (6.11): polite appends are batched at most every five
 * seconds. A batch flushed sooner than the registered window throws.
 */
export function assertBatchWindowLawful(msSinceLastBatch: number): void {
  if (msSinceLastBatch < ANNOUNCEMENT_BATCH_WINDOW_MS) {
    throw new ConstitutionalViolationError(
      '6.11',
      `A polite batch was flushed after ${msSinceLastBatch} ms. Appends are polite, batched at most every five seconds (Constitution 6.11).`,
    );
  }
}

export { ANNOUNCEMENT_BATCH_CITATIONS };
