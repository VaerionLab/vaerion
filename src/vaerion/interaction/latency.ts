/**
 * Vaerion — Interaction / Latency Contracts
 *
 * Constitution 6.12: "Interaction acknowledgment under 100ms; navigation
 * without transition; Gauge only after 300ms; appends streamed within the
 * streaming budget. Breaching a latency contract is a conformance failure,
 * not a tuning matter."
 *
 * The ratified numbers are consumed from the Registry scales (1.3): the
 * acknowledgment bound (< 100 ms), the Gauge delay (300 ms), and the Return
 * life (6 s). The streaming budget's number is not enumerated in the
 * ratified text — the contract is declared and its pin requested (IR-011;
 * P-5; no number is invented).
 *
 * Citations: Implementation Constitution 6.12, 9.9; VS §10, §13.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import {
  ACKNOWLEDGMENT_MS,
  GAUGE_DELAY_MS,
  RETURN_LIFE_SECONDS,
} from '../registry/scales';
import { STREAMING_BUDGET_CITATIONS } from './contracts';

/** The acknowledgment bound (< 100 ms — VS §10). */
export const ACKNOWLEDGMENT_BOUND_MS = ACKNOWLEDGMENT_MS;
/** The Gauge delay (300 ms — VS §5, §10). */
export const GAUGE_THRESHOLD_MS = GAUGE_DELAY_MS;
/** The Return life (6 s — VS §5, §10). */
export const RETURN_LIFE_S = RETURN_LIFE_SECONDS;

export const LATENCY_CITATIONS: readonly Citation[] = [
  implementation('6.12', 'latency contracts'),
  implementation('9.9', 'performance gate — latency contracts hold'),
  ...STREAMING_BUDGET_CITATIONS,
];

/**
 * Acknowledgment contract (6.12; VS §10): every intentional action receives
 * acknowledgment within the bound. Silence reads as failure. `measuredMs` is
 * a real measurement (Art. VIII) — a breach is a conformance failure, not a
 * tuning matter (6.12).
 */
export function assertAcknowledgment(measuredMs: number): void {
  if (typeof measuredMs !== 'number' || !Number.isFinite(measuredMs)) {
    throw new ConstitutionalViolationError('Art. VIII', 'The acknowledgment time is not a real measurement (Bible Art. VIII).');
  }
  if (measuredMs > ACKNOWLEDGMENT_BOUND_MS) {
    throw new ConstitutionalViolationError(
      '6.12',
      `Acknowledgment took ${measuredMs} ms; the contract bound is < ${ACKNOWLEDGMENT_BOUND_MS} ms. Breaching a latency contract is a conformance failure, not a tuning matter (Constitution 6.12; VS §10).`,
    );
  }
}

/**
 * Gauge delay contract (6.12; 3.14): the Gauge renders only after the
 * registered delay — never on fast loads.
 */
export function assertGaugeDelayLawful(displayedAfterMs: number): void {
  if (displayedAfterMs < GAUGE_THRESHOLD_MS) {
    throw new ConstitutionalViolationError(
      '6.12 / 3.14',
      `A progress display rendered after ${displayedAfterMs} ms. The Gauge renders only after the registered ${GAUGE_THRESHOLD_MS} ms delay; below it the system renders nothing (Constitution 6.12; 3.14; VS §10).`,
    );
  }
}

/**
 * Return life contract (6.12; 3.13): Returns live six seconds; failures
 * persist until acknowledged.
 */
export function assertReturnLifeLawful(lifeSeconds: number, persistent: boolean): void {
  if (!persistent && lifeSeconds !== RETURN_LIFE_S) {
    throw new ConstitutionalViolationError(
      '6.12 / 3.13',
      `A Return lived ${lifeSeconds} s. Returns live the registered ${RETURN_LIFE_S} s; failures persist until acknowledged (Constitution 6.12; 3.13).`,
    );
  }
}

/**
 * Navigation contract (6.12): navigation occurs without transition — no
 * route transition animation exists. The mechanical form refuses a declared
 * transition on navigation.
 */
export function assertNavigationWithoutTransition(declaredTransition: boolean): void {
  if (declaredTransition) {
    throw new ConstitutionalViolationError(
      '6.12',
      'Navigation declared a transition — navigation is without transition (Constitution 6.12; VS §10).',
    );
  }
}
