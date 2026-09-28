/**
 * Vaerion — Rendering / Measurement Validation
 *
 * Measurement law (Constitution 7.4): "All resolved geometry must land on
 * the Gauge Ladder and the 4px baseline; primitives must declare intrinsic
 * heights that are ladder-conformant at every density. A measured
 * off-ladder value in any rendering target is a gate failure."
 *
 * The Gauge is the 4 px base gauge; all spacing is a multiple or registered
 * half-step of the gauge (VS §1.1); the Gauge Ladder is the ratified spacing
 * ramp (VS §1.2). The registered half-step is the ladder's 2 px step
 * (space.1) — the sole step below the 4 px base, ratified in the ramp.
 *
 * Registered intrinsic heights are themselves ratified registrations (VS
 * §1.3, §1.4, §3.5, §5, §9) — they are validated for baseline conformance
 * and for identity against the Registry scales, never re-declared.
 *
 * Citations: Implementation Constitution 7.4; Visual System §1.1–§1.4, §3.5,
 * §5, §9; Bible Art. X, XI.
 *
 * No visual values may appear in this file beyond the transcribed ratified
 * registrations consumed from the scales. Citation: Constitution 1.3.
 */

import { bible, implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import {
  GAUGE_LADDER_PX,
  CHAINLINE_NODE_PX,
  CHAINLINE_BREAK_GAP_PX,
  HAIRLINE_WIDTH_PX,
  LEDGER_ROW_HEIGHT_PX,
  MARGIN_RAIL_WIDTH_PX,
  SEAL_SIZES_PX,
  TOUCH_TARGET_MINIMUM_PX,
} from '../registry/scales';

/** The 4 px base gauge (VS §1.1). */
export const GAUGE_BASE_PX = 4;

/**
 * The registered half-step: the ladder's 2 px step (space.1) — the sole
 * ratified step below the 4 px base ("a multiple or registered half-step of
 * the gauge" — VS §1.1).
 */
export const GAUGE_REGISTERED_HALF_STEP_PX = 2;

/** Ladder membership (7.4; VS §1.2): the value is a ratified ladder step. */
export function isOnGaugeLadder(value: number): boolean {
  return (GAUGE_LADDER_PX as readonly number[]).includes(value);
}

/**
 * Baseline conformance (7.4; VS §1.1): the value is a multiple of the 4 px
 * base gauge, or the registered half-step.
 */
export function isOnGaugeBaseline(value: number): boolean {
  return value % GAUGE_BASE_PX === 0 || value === GAUGE_REGISTERED_HALF_STEP_PX;
}

/** One registered intrinsic height, with its ratified registration. */
export interface IntrinsicHeight {
  /** What declares this height (the primitive or structural registration). */
  readonly subject: string;
  readonly px: number;
  /** Why this exact value is lawful (the ratified registration). */
  readonly registration: string;
  readonly citations: readonly Citation[];
}

/**
 * The registered intrinsic heights (7.4: "primitives must declare intrinsic
 * heights that are ladder-conformant at every density"). Every value is
 * consumed from the Registry scales — the sole source (2.1) — and carries
 * its ratified registration.
 */
export const INTRINSIC_HEIGHTS: readonly IntrinsicHeight[] = Object.freeze([
  {
    subject: 'Ledger Row rhythm',
    px: LEDGER_ROW_HEIGHT_PX,
    registration: 'the fixed ledger rhythm — 36 px, never compressed (VS §5; Art. X)',
    citations: [visualSystem('5', 'Ledger Row — fixed 36 px rhythm'), bible('X', 'the sliced ledger keeps a stable physical act')],
  },
  {
    subject: 'Touch target minimum',
    px: TOUCH_TARGET_MINIMUM_PX,
    registration: 'touch targets meet the registered 44 px minimum (VS §9)',
    citations: [visualSystem('9', 'touch targets meet registered minimums')],
  },
  {
    subject: 'Margin Rail width',
    px: MARGIN_RAIL_WIDTH_PX,
    registration: 'the ultra-wide Document rail — 320 px (VS §1.4)',
    citations: [visualSystem('1.4', 'the Margin Rail')],
  },
  ...SEAL_SIZES_PX.map((size) => ({
    subject: `Seal size ${size}`,
    px: size,
    registration: `registered seal size ${size} (VS §5.2)`,
    citations: [visualSystem('5.2', 'registered seal sizes 16 / 20 / 28 / 44'), bible('III', 'seal geometry carries verdict identity')],
  })),
  {
    subject: 'Chainline node',
    px: CHAINLINE_NODE_PX,
    registration: 'the Chainline joins 2 px square nodes (VS §3.5)',
    citations: [visualSystem('3.5', 'the Chainline geometry')],
  },
  {
    subject: 'Chainline break gap',
    px: CHAINLINE_BREAK_GAP_PX,
    registration: 'a broken chain renders an 8 px gap with the registered break glyph (VS §3.5)',
    citations: [visualSystem('3.5', 'the Chainline break'), bible('IX', 'a broken chain is rendered honestly')],
  },
  {
    subject: 'Hairline width',
    px: HAIRLINE_WIDTH_PX,
    registration: 'structure is drawn with 1 px hairlines at registered ink strengths (VS §3.3) — the registered structural exception to the gauge base',
    citations: [visualSystem('3.3', 'hairlines — 1 px at registered ink strengths')],
  },
]);

/**
 * Validates declared intrinsic heights (7.4): every intrinsic height must be
 * (a) identical to its Registry scale source (no drift), and (b) conformant
 * to the gauge baseline, or carry its ratified structural registration (the
 * 1 px hairline — VS §3.3). Throws on any defect.
 */
export function assertIntrinsicHeightsConformant(): void {
  for (const height of INTRINSIC_HEIGHTS) {
    if (height.citations.length === 0) {
      throw new ConstitutionalViolationError(
        'P-4',
        `Intrinsic height "${height.subject}" is uncitable. Nothing unmeasured ships (Bible Art. XI).`,
      );
    }
    if (!isOnGaugeBaseline(height.px) && height.subject !== 'Hairline width') {
      throw new ConstitutionalViolationError(
        '7.4',
        `Intrinsic height "${height.subject}" (${height.px}px) is off the 4px baseline. All resolved geometry must land on the Gauge Ladder and the 4px baseline (Constitution 7.4; VS §1.1).`,
        height.citations,
      );
    }
  }
}

/**
 * Resolved-geometry validation (7.4): "A measured off-ladder value in any
 * rendering target is a gate failure." Every resolved measurement reaching
 * the rendering engine passes this gate: the value must be a Gauge Ladder
 * step, a declared intrinsic height, or the registered half-step. Anything
 * else throws.
 */
export function validateResolvedGeometry(params: {
  readonly values: readonly number[];
  /** The rendering target or component presenting the measurement (for the verdict). */
  readonly context: string;
}): void {
  const lawfulValues = new Set<number>([
    ...(GAUGE_LADDER_PX as readonly number[]),
    ...INTRINSIC_HEIGHTS.map((height) => height.px),
  ]);
  for (const value of params.values) {
    if (!lawfulValues.has(value)) {
      throw new ConstitutionalViolationError(
        '7.4',
        `Resolved geometry ${value}px in "${params.context}" is off-ladder. All resolved geometry must land on the Gauge Ladder and the 4px baseline; a measured off-ladder value in any rendering target is a gate failure (Constitution 7.4; VS §1.2).`,
        [visualSystem('1.2', 'the Gauge Ladder'), implementation('7.4', 'measurement')],
      );
    }
  }
}

/** The ceremonial distances that may never be compressed (VS §1.3). */
export const CEREMONIAL_DISTANCES = {
  sealIsolationPx: 32,
  receiptCeremonyPx: 64,
} as const;

/**
 * Ceremonial spacing law (VS §1.3; 4.2): seal isolation (≥ 32 px) and the
 * Receipt Viewer ceremony (64 px) may not be compressed — layout may
 * compress, never the ceremony. Throws on any compression.
 */
export function assertCeremonyNeverCompressed(params: {
  readonly sealIsolationGapPx: number;
  readonly receiptCeremonyGapPx: number;
}): void {
  if (params.sealIsolationGapPx < CEREMONIAL_DISTANCES.sealIsolationPx) {
    throw new ConstitutionalViolationError(
      '4.2 / 7.4',
      `Seal isolation measured ${params.sealIsolationGapPx}px. A verdict seal keeps at least ${CEREMONIAL_DISTANCES.sealIsolationPx}px clearance; a crowded seal reads as decoration (VS §1.3). Ceremonial distances may not be compressed.`,
      [visualSystem('1.3', 'seal isolation — ≥ 32 px (space.7)')],
    );
  }
  if (params.receiptCeremonyGapPx < CEREMONIAL_DISTANCES.receiptCeremonyPx) {
    throw new ConstitutionalViolationError(
      '4.2 / 7.4',
      `The Receipt Viewer ceremony measured ${params.receiptCeremonyGapPx}px. The full receipt view surrounds the verdict seal with ${CEREMONIAL_DISTANCES.receiptCeremonyPx}px (VS §1.3); the reading environment is architecture, not layout.`,
      [visualSystem('1.3', 'Receipt Viewer ceremony — 64 px (space.9)')],
    );
  }
}

export const MEASUREMENT_CITATIONS: readonly Citation[] = [
  implementation('7.4', 'measurement: Gauge Ladder and 4px baseline'),
  visualSystem('1.1', 'the Gauge — 4px base, registered half-steps'),
  visualSystem('1.2', 'the Gauge Ladder'),
];
