/**
 * Vaerion — State / The Lawful Transition Set & Validator
 *
 * Constitution 5.7: "The lawful transition set is fixed:" — the table below is
 * that set, transcribed row for row. "Unlisted transitions are violations.
 * Addition of a transition requires amendment." The validator rejects every
 * unlisted transition and every failed guard with a ConstitutionalViolationError.
 *
 * Guards consume only ratified constants (the display threshold resolves from
 * the Registry scales — VS §5/§10; the 300 ms Gauge delay is ratified law).
 * No value is invented (Art. XI; 1.3; P-5).
 *
 * Citations: Implementation Constitution 5.7, 5.8, 5.9, 5.3, 5.4; 3.4; Art. III,
 * VIII; Visual System §5, §10.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, bible, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { GAUGE_DELAY_MS } from '../registry/scales';
import type { CanonicalState } from './matrix';

/** The transition events of Constitution 5.7, in table order. */
export const STATE_EVENTS = [
  'work-issued',
  'structure-known',
  'data-arrives',
  'verification-requested',
  'verdict-received',
  'user-cancels',
  'retry',
  'authority-unreachable',
  'reconnection',
  'integrity-revalidated',
  'act-fails',
] as const;
export type StateEvent = (typeof STATE_EVENTS)[number];

/** The event vocabulary, with the ratified wording of each row (5.7). */
export const STATE_EVENT_LABELS: Readonly<Record<StateEvent, string>> = Object.freeze({
  'work-issued': 'work issued',
  'structure-known': 'structure known',
  'data-arrives': 'data arrives',
  'verification-requested': 'verification requested',
  'verdict-received': 'verdict received',
  'user-cancels': 'user cancels',
  'retry': 'retry',
  'authority-unreachable': 'authority unreachable',
  'reconnection': 'reconnection',
  'integrity-revalidated': 'integrity revalidated',
  'act-fails': 'act fails',
});

/**
 * Guard evidence payloads. A guard consumes only what the law requires —
 * nothing more (Nothing more, nothing less).
 */
export interface TransitionPayload {
  /**
   * 'structure-known' — the delay measured for the work in flight. The guard
   * permits Skeleton only if the delay exceeds the registered display
   * threshold (5.7: "only if delay exceeds threshold"; the registered
   * threshold is the Gauge delay, VS §5/§10).
   */
  readonly delayMs?: number;
  /**
   * 'data-arrives' — Empty is lawful only when the set is lawfully absent
   * (5.7: "Empty only if set is lawfully absent"; 5.2: "Empty — lawful
   * absence"). The payload carries the evidence of that lawful absence.
   */
  readonly lawfullyAbsent?: boolean;
  /**
   * 'verdict-received' — the verdict fact as received from the Verification
   * Authority. The verdict must name its verifier (5.7 guard; Art. III):
   * engine version, rule set, and environment.
   */
  readonly verdict?: { readonly outcome: 'verified' | 'failed'; readonly verifier: string; readonly ruleset: string; readonly environment: string };
  /**
   * 'verification-requested' — whether the act has reached an authority. Once
   * it has, cancellation is refused (5.8: "If the act already reached an
   * authority, cancellation is refused and the act resolves as a receipt").
   */
  readonly authorityContact?: boolean;
  /**
   * 'integrity-revalidated' — the Chain Authority's revalidation evidence
   * (5.9). Live resumption requires it; an unreconciled break refuses Idle.
   */
  readonly integrityRevalidated?: boolean;
  /** Unreconciled chain break, as detected by the Chain Authority (5.9; 3.4). */
  readonly chainHasUnreconciledBreak?: boolean;
  /**
   * 'act-fails' — the Failure Receipt id. Every Error carries one (5.2; 5.7:
   * "Failure Receipt with receipt id").
   */
  readonly failureReceiptId?: string;
  /**
   * 'authority-unreachable' — the chrome announcement obligation (5.7:
   * "chrome announcement"). The dispatching chrome records that the
   * announcement system will speak (6.11).
   */
  readonly chromeAnnouncement?: boolean;
}

/** One row of the fixed transition table (5.7). */
export interface TransitionRow {
  /** 'any' for the two rows the law extends to every state. */
  readonly from: CanonicalState | 'any';
  readonly event: StateEvent;
  /** Lawful targets. The validator selects by guard. */
  readonly to: readonly CanonicalState[];
  /** Guard identifier — the ratified guard wording (5.7). */
  readonly guard?: string;
  readonly citations: readonly Citation[];
}

const ROW_CITATIONS: readonly Citation[] = [implementation('5.7', 'the lawful transition set is fixed')];

/**
 * The lawful transition set — Constitution 5.7, row for row. Frozen. Any
 * addition requires amendment (5.7; Part XI).
 */
export const LAWFUL_TRANSITIONS: readonly TransitionRow[] = Object.freeze([
  { from: 'idle', event: 'work-issued', to: ['loading'], citations: ROW_CITATIONS },
  {
    from: 'loading',
    event: 'structure-known',
    to: ['skeleton'],
    guard: 'only if delay exceeds threshold',
    citations: [...ROW_CITATIONS, visualSystem('10', 'the registered display threshold — the Gauge delay')],
  },
  {
    from: 'loading',
    event: 'data-arrives',
    to: ['idle', 'empty'],
    guard: 'Empty only if set is lawfully absent',
    citations: ROW_CITATIONS,
  },
  {
    from: 'skeleton',
    event: 'data-arrives',
    to: ['idle', 'empty'],
    guard: 'Empty only if set is lawfully absent',
    citations: ROW_CITATIONS,
  },
  { from: 'idle', event: 'verification-requested', to: ['pending'], citations: ROW_CITATIONS },
  { from: 'empty', event: 'verification-requested', to: ['pending'], citations: ROW_CITATIONS },
  {
    from: 'pending',
    event: 'verdict-received',
    to: ['verified', 'failed'],
    guard: 'verdict must name its verifier',
    citations: [...ROW_CITATIONS, bible('III', 'a verdict names its verifier')],
  },
  {
    from: 'pending',
    event: 'user-cancels',
    to: [], // target resolved dynamically: the pre-act state (5.8 exact restoration)
    guard: 'Return issued; no partial verdict',
    citations: [...ROW_CITATIONS, implementation('5.8', 'cancellation restores the pre-act state exactly')],
  },
  {
    from: 'failed',
    event: 'retry',
    to: ['loading'],
    guard: 'prior failure remains rendered until superseded',
    citations: [...ROW_CITATIONS, bible('VIII', 'the prior failure is not noise')],
  },
  {
    from: 'any',
    event: 'authority-unreachable',
    to: ['offline'],
    guard: 'chrome announcement',
    citations: [...ROW_CITATIONS, implementation('5.4', 'Offline is chrome-scoped')],
  },
  { from: 'offline', event: 'reconnection', to: ['recovery'], citations: ROW_CITATIONS },
  {
    from: 'recovery',
    event: 'integrity-revalidated',
    to: ['idle', 'error'],
    guard: 'break renders as break until reconciled',
    citations: [...ROW_CITATIONS, implementation('3.4', 'a break renders as a break'), implementation('5.9', 'recovery never papers over a gap')],
  },
  {
    from: 'any',
    event: 'act-fails',
    to: ['error'],
    guard: 'Failure Receipt with receipt id',
    citations: [...ROW_CITATIONS, implementation('5.2', 'Error — rendered as Failure Receipt')],
  },
]);

/** The result of a lawful transition resolution (5.7). */
export interface ResolvedTransition {
  readonly row: TransitionRow;
  /** The single lawful target chosen for this dispatch. */
  readonly to: CanonicalState;
  readonly citations: readonly Citation[];
}

/**
 * Resolves the lawful target(s) for (from, event) and validates the guard.
 * Throws ConstitutionalViolationError for:
 *   - an unknown state or event (not part of the ratified vocabulary);
 *   - an unlisted (from, event) pair — "Unlisted transitions are violations";
 *   - a target outside the row's lawful set;
 *   - a failed guard.
 */
export function resolveTransition(
  from: CanonicalState,
  event: StateEvent,
  to: CanonicalState | null,
  payload: TransitionPayload,
  context: { /** The pre-act state recorded on entering Pending (5.8). */ readonly prePendingState?: CanonicalState },
): ResolvedTransition {
  const row = LAWFUL_TRANSITIONS.find(
    (candidate) =>
      candidate.event === event && (candidate.from === 'any' || candidate.from === from),
  );
  if (!row) {
    throw new ConstitutionalViolationError(
      '5.7',
      `Unlisted transition: ${from} —[${event}]. The lawful transition set is fixed (Constitution 5.7); unlisted transitions are violations. Addition requires amendment (Part XI).`,
    );
  }

  // Guard validation before target selection.
  switch (event) {
    case 'structure-known': {
      const threshold = GAUGE_DELAY_MS;
      if (typeof payload.delayMs !== 'number' || payload.delayMs <= threshold) {
        throw new ConstitutionalViolationError(
          '5.7',
          `Guard failed for loading —[structure known]→ skeleton: the delay (${payload.delayMs ?? 'unmeasured'}) does not exceed the registered threshold (${threshold}). "Only if delay exceeds threshold" (Constitution 5.7; VS §5/§10).`,
        );
      }
      break;
    }
    case 'data-arrives': {
      if (to === 'empty' && payload.lawfullyAbsent !== true) {
        throw new ConstitutionalViolationError(
          '5.7',
          `Guard failed for data-arrives → empty: "Empty only if set is lawfully absent" (Constitution 5.7). Empty states state the truth of the emptiness (Art. VIII); an unproven absence may not render as Empty.`,
        );
      }
      break;
    }
    case 'verdict-received': {
      const verdict = payload.verdict;
      if (!verdict || (verdict.outcome !== 'verified' && verdict.outcome !== 'failed')) {
        throw new ConstitutionalViolationError(
          '5.7',
          `Guard failed for pending —[verdict received]: no verdict fact was received from the Verification Authority (Constitution 5.3; 1.6). A verdict is never computed or predicted.`,
        );
      }
      if (!verdict.verifier || !verdict.ruleset || !verdict.environment) {
        throw new ConstitutionalViolationError(
          'Art. III',
          `Guard failed for pending —[verdict received]: the verdict must name its verifier — engine version, rule set, and environment (Constitution 5.7; Bible Art. III). An anonymous verdict is constitutionally void.`,
        );
      }
      break;
    }
    case 'user-cancels': {
      if (!context.prePendingState) {
        throw new ConstitutionalViolationError(
          '5.8',
          `Guard failed for pending —[user cancels]: no pre-act state is recorded, so the act cannot be restored exactly (Constitution 5.8). Cancellation without exact restoration is prohibited.`,
        );
      }
      break;
    }
    case 'integrity-revalidated': {
      if (to === 'idle') {
        if (payload.integrityRevalidated !== true) {
          throw new ConstitutionalViolationError(
            '5.9',
            `Guard failed for recovery —[integrity revalidated]→ idle: live resumption requires chain-integrity revalidation (Constitution 5.9). Recovery must never paper over a gap.`,
          );
        }
        if (payload.chainHasUnreconciledBreak === true) {
          throw new ConstitutionalViolationError(
            '5.9 / 3.4',
            `Guard failed for recovery → idle: an unreconciled chain break exists. "Break renders as break until reconciled" (Constitution 5.7; 5.9; 3.4) — the break is rendered as a break and reconciliation is explicit, recorded, and never implicit (8.5).`,
          );
        }
      }
      break;
    }
    case 'act-fails': {
      if (!payload.failureReceiptId) {
        throw new ConstitutionalViolationError(
          '5.7',
          `Guard failed for act-fails → error: a Failure Receipt with receipt id is required (Constitution 5.7; 5.2; 6.5). Nothing resolves to silence.`,
        );
      }
      break;
    }
    case 'authority-unreachable': {
      if (payload.chromeAnnouncement !== true) {
        throw new ConstitutionalViolationError(
          '5.7',
          `Guard failed for authority-unreachable → offline: the chrome announcement obligation (Constitution 5.7) — the announcement resolves from the Announcement & Copy Registry (6.11).`,
        );
      }
      break;
    }
    default:
      break;
  }

  // Target selection.
  let chosen: CanonicalState | null = null;
  if (event === 'user-cancels') {
    chosen = context.prePendingState ?? null; // exact restoration (5.8)
  } else if (to) {
    if (!row.to.includes(to)) {
      throw new ConstitutionalViolationError(
        '5.7',
        `Unlawful target: ${from} —[${event}]→ ${to}. Lawful targets: ${row.to.join(', ')} (Constitution 5.7).`,
      );
    }
    chosen = to;
  } else if (row.to.length === 1) {
    chosen = row.to[0];
  } else {
    throw new ConstitutionalViolationError(
      '5.7',
      `Ambiguous transition: ${from} —[${event}] requires an explicit lawful target (${row.to.join(' or ')}), decided by its guard (Constitution 5.7).`,
    );
  }

  if (!chosen) {
    throw new ConstitutionalViolationError(
      '5.7',
      `Transition ${from} —[${event}] resolved to no target — refusing to improvise one (Constitution 5.7; P-5).`,
    );
  }

  return { row, to: chosen, citations: row.citations };
}

/** Structural integrity of the table itself — used by the state gates (9.1 form). */
export function assertTransitionTableIntegrity(): void {
  const seen = new Set<string>();
  for (const row of LAWFUL_TRANSITIONS) {
    const key = `${row.from}--${row.event}`;
    if (seen.has(key)) {
      throw new ConstitutionalViolationError(
        '5.7',
        `Duplicate transition row ${key} — the lawful set is fixed; duplicates are a table defect (P-6).`,
      );
    }
    seen.add(key);
    if (row.citations.length === 0) {
      throw new ConstitutionalViolationError(
        'P-4',
        `Transition row ${key} is uncitable. Nothing unmeasured ships (Bible Art. XI).`,
      );
    }
    if (row.event !== 'user-cancels' && row.to.length === 0) {
      throw new ConstitutionalViolationError(
        '5.7',
        `Transition row ${key} declares no lawful target.`,
      );
    }
  }
}
