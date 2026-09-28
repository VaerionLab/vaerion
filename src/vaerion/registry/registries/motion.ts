/**
 * Vaerion — Registry / Motion Registry
 *
 * Durations, curves, the three canonical motions. Scale authority: the Motion
 * Registry (VS §7.1) and Motion Law (VS §7.2): maximum duration 400 ms;
 * registered curves only; the settle-out curve is cubic-bezier(0.2, 0, 0, 1);
 * needle-settle discipline — nothing bounces.
 *
 * The three canonical motions are registered by name and law, not by
 * individual duration pins: each compiles as a formula — duration bound to the
 * ratified 400 ms ceiling on the ratified settle-out curve. The desire for
 * finer per-motion pins is filed as IR-007; the bound and the curve are the
 * ratified numbers, so the formula invents nothing.
 *
 * No fourth motion may be invented. Hover transitions are micro-affordances
 * at registered short durations, not registered motions (VS §7.1).
 *
 * No visual values originate in this file — only transcriptions of ratified
 * values. Citation: Constitution 1.3, 2.1.
 */

import { visualSystem } from '../../foundation/citations';
import {
  ACKNOWLEDGMENT_MS,
  GAUGE_DELAY_MS,
  HOLD_AFFIRM_MS,
  MOTION_CURVE_SETTLE_OUT,
  MOTION_MAX_DURATION_MS,
  RETURN_LIFE_SECONDS,
  SCALE_CITATIONS,
} from '../scales';
import { INITIAL_STATUS, REGISTRY_VERSION, token, type TokenRecord } from '../token';

const canonicalConstraints = [
  `duration is the ratified 400 ms bound (VS §7.2); finer pins requested by IR-007`,
  'curve: the registered settle-out curve (VS §7.2)',
  'needle-settle discipline: indicators land without oscillation; nothing bounces (VS §7.2)',
  'motion communicates direction of certainty and nothing else (VS §7.2)',
  'reduced-motion receives complete informational parity (VS §7.3; Bible Art. V)',
  'a meaning carried only by movement is a violation (VS §7.3; Bible Art. V/XIV)',
] as const;

export const MOTION_REGISTRY: readonly TokenRecord[] = Object.freeze([
  token({
    identifier: 'motion.bound.max',
    instrumentName: 'The Motion Ceiling',
    value: `${MOTION_MAX_DURATION_MS}ms`,
    constraints: [
      'maximum duration; anything slower is friction, anything instant is unperceived (Bible Art. V)',
      'all canonical motions render within this bound (VS §7.2)',
    ],
    governingCitation: SCALE_CITATIONS.motion,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'motion.curve.settleOut',
    instrumentName: 'The Settle-Out Curve',
    value: MOTION_CURVE_SETTLE_OUT,
    constraints: ['the registered settle-out curve (VS §7.2)', 'registered curves only (VS §7.2)'],
    governingCitation: SCALE_CITATIONS.motion,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'motion.canonical.seal',
    instrumentName: 'The Seal Motion',
    value: `${MOTION_MAX_DURATION_MS}ms on ${MOTION_CURVE_SETTLE_OUT}`,
    constraints: [
      'a verdict state change; the seal commits (solid), empties (hollow), crosses (failed), or begins to pulse (VS §7.1)',
      ...canonicalConstraints,
    ],
    governingCitation: SCALE_CITATIONS.motion,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'motion.canonical.sweep',
    instrumentName: 'The Sweep Motion',
    value: `${MOTION_MAX_DURATION_MS}ms on ${MOTION_CURVE_SETTLE_OUT}`,
    constraints: [
      'a verification pass traveling its scope (a row, a receipt, a chain segment) and settling (VS §7.1)',
      ...canonicalConstraints,
    ],
    governingCitation: SCALE_CITATIONS.motion,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'motion.canonical.append',
    instrumentName: 'The Append Motion',
    value: `${MOTION_MAX_DURATION_MS}ms on ${MOTION_CURVE_SETTLE_OUT}`,
    constraints: [
      'a new record joining a ledger; the ledger grows, the spine of existing records does not move (VS §7.1)',
      ...canonicalConstraints,
    ],
    governingCitation: SCALE_CITATIONS.motion,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'motion.delay.gauge',
    instrumentName: 'The Gauge Threshold',
    value: `${GAUGE_DELAY_MS}ms`,
    constraints: [
      'before 300 ms the system renders nothing — latency under 300 ms needs no progress display (VS §5 Gauge, §10)',
      'spinners are prohibited (Constitution 3.14)',
    ],
    governingCitation: SCALE_CITATIONS.gaugeDelay,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'motion.life.return',
    instrumentName: 'The Return Life',
    value: `${RETURN_LIFE_SECONDS}s`,
    constraints: [
      'bottom-left hairline toast; older returns yield (VS §5 Return)',
      'failures persist until acknowledged (Constitution 3.13)',
      'Returns never interrupt focus (VS §10)',
    ],
    governingCitation: SCALE_CITATIONS.returnLife,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'motion.hold.affirm',
    instrumentName: 'The Affirmation Hold',
    value: `${HOLD_AFFIRM_MS}ms`,
    constraints: [
      'significant affirmations bind to a 600 ms hold with a registered click-path alternative (VS §13.2)',
      'releasing early cancels with no partial effect (VS §13.2)',
      'both paths must produce identical receipts (Constitution 6.6)',
    ],
    governingCitation: SCALE_CITATIONS.holdAffirm,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'motion.acknowledge',
    instrumentName: 'The Acknowledgment Bound',
    value: `${ACKNOWLEDGMENT_MS}ms`,
    constraints: [
      'every intentional action receives acknowledgment within 100 ms (VS §10)',
      'silence reads as failure (VS §10)',
    ],
    governingCitation: SCALE_CITATIONS.acknowledgment,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),
]);
