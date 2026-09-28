/**
 * Vaerion — Registry / Space Registry
 *
 * All spacing, page architecture, ceremonial distance. Scale authority: the
 * Gauge Ladder (Visual System §1.2). Off-ladder spacing is a violation.
 *
 * IR-004 compliance: tokens are compiled only for the agreed index range
 * space.0–space.10 (0…96 px). The ratified 128 px ramp value is recorded in
 * `PENDING_INDEX_RAMP_VALUES` as ratified-but-unindexed and must not be
 * consumed until the Founder rules (Constitution 2.1; Bible Art. XI; P-5).
 *
 * No visual values originate in this file — only transcriptions of ratified
 * values. Citation: Constitution 1.3, 2.1.
 */

import { visualSystem } from '../../foundation/citations';
import {
  GAUGE_LADDER_PX,
  INDEXED_SPACE_RANGE,
  LEDGER_ROW_HEIGHT_PX,
  MARGIN_RAIL_WIDTH_PX,
  SCALE_CITATIONS,
  TOUCH_TARGET_MINIMUM_PX,
} from '../scales';
import { INITIAL_STATUS, REGISTRY_VERSION, token, type TokenRecord } from '../token';

const stepNames = [
  'Rest', // 0
  'Hairline Breath', // 2
  'Gauge Step', // 4
  'Tight Measure', // 8
  'Compact Measure', // 12
  'Standard Measure', // 16
  'Comfortable Measure', // 24
  'Seal Isolation', // 32 — VS §1.3 names this step ceremonial
  'Wide Measure', // 48
  'Receipt Ceremony', // 64 — VS §1.3 names this step ceremonial
  'Sectional Distance', // 96
] as const;

const stepTokens: TokenRecord[] = GAUGE_LADDER_PX.slice(0, INDEXED_SPACE_RANGE + 1).map(
  (px, index) =>
    token({
      identifier: `space.${index}`,
      instrumentName: stepNames[index],
      value: `${px}px`,
      constraints: [
        'Gauge Ladder membership (VS §1.2)',
        'selection by measurement significance, never by taste (VS §1.2)',
        ...(px === 32 ? ['ceremonial: seal isolation may not be compressed (VS §1.3)'] : []),
        ...(px === 64 ? ['ceremonial: Receipt Viewer ceremony may not be compressed (VS §1.3)'] : []),
      ],
      governingCitation: SCALE_CITATIONS.gaugeLadder,
      version: REGISTRY_VERSION,
      status: INITIAL_STATUS,
    }),
);

/** Ratified ramp values with no ratified index assignment — inert until IR-004 is ruled. */
export const PENDING_INDEX_RAMP_VALUES: readonly number[] = GAUGE_LADDER_PX.slice(
  INDEXED_SPACE_RANGE + 1,
);

export const SPACE_REGISTRY: readonly TokenRecord[] = Object.freeze([
  ...stepTokens,

  token({
    identifier: 'space.sealIsolation',
    instrumentName: 'Seal Isolation',
    value: '32px',
    constraints: [
      'ceremonial distance — may not be compressed (VS §1.3)',
      'equals space.7 (VS §1.3)',
      'a verdict seal keeps at least this clearance from any other element',
    ],
    governingCitation: [visualSystem('1.3', 'seal isolation — ≥ 32 px (space.7)')],
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'space.receiptCeremony',
    instrumentName: 'Receipt Ceremony',
    value: '64px',
    constraints: [
      'ceremonial distance — may not be compressed (VS §1.3)',
      'equals space.9 (VS §1.3)',
      'the full receipt view surrounds the verdict seal with this distance',
    ],
    governingCitation: [visualSystem('1.3', 'Receipt Viewer ceremony — 64 px (space.9)')],
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'space.marginRail',
    instrumentName: 'The Margin Rail',
    value: `${MARGIN_RAIL_WIDTH_PX}px`,
    constraints: [
      'Document skeleton only — on ultra-wide displays (VS §1.4)',
      'content columns do not stretch to fill; they gain rails (VS §1.4)',
    ],
    governingCitation: SCALE_CITATIONS.marginRail,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'space.ledgerRow',
    instrumentName: 'The Ledger Rhythm',
    value: `${LEDGER_ROW_HEIGHT_PX}px`,
    constraints: [
      'fixed ledger row height — never changes between surfaces (VS §5 Ledger Row)',
      'never compresses below registration at narrow widths (VS §9)',
    ],
    governingCitation: SCALE_CITATIONS.ledgerRow,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'space.touchMinimum',
    instrumentName: 'The Equal Instrument Minimum',
    value: `${TOUCH_TARGET_MINIMUM_PX}px`,
    constraints: [
      'minimum touch target per control class (VS §9)',
      'touch targets must not depend on pointer precision (Bible Art. XIV)',
    ],
    governingCitation: SCALE_CITATIONS.touchTarget,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),
]);
