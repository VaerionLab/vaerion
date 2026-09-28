/**
 * Vaerion — Registry / Shape Registry
 *
 * Radii, hairlines, geometry vocabulary, chain geometry, seal geometry.
 * Scale authority: the Radius Ladder (VS §3.2); hairline law (§3.3);
 * Chainline (§3.5); registered seal sizes (§5.2).
 *
 * A radius used outside its registered role is a violation. Circles are
 * reserved for truth (§3.1). No shadows, no glass (§3.4).
 *
 * No visual values originate in this file — only transcriptions of ratified
 * values. Citation: Constitution 1.3, 2.1.
 */

import { bible, visualSystem } from '../../foundation/citations';
import {
  CHAINLINE_BREAK_GAP_PX,
  CHAINLINE_NODE_PX,
  CHAINLINE_WIDTH_PX,
  HAIRLINE_WIDTH_PX,
  RADIUS_LADDER,
  SCALE_CITATIONS,
  SEAL_SIZES_PX,
} from '../scales';
import { INITIAL_STATUS, REGISTRY_VERSION, token, type TokenRecord } from '../token';

const radiusTokens: TokenRecord[] = RADIUS_LADDER.map((step) =>
  token({
    identifier: `shape.radius.${step.value}`,
    instrumentName:
      step.value === 'seal'
        ? 'The Seal Radius'
        : step.value === 0
          ? 'The Structural Edge'
          : `The ${step.value} Pixel Edge`,
    value: step.value === 'seal' ? '9999px' : `${step.value}px`,
    constraints: [
      `registered role: ${step.role} (VS §3.2)`,
      'a radius used outside its registered role is a violation (VS §3.2)',
      ...(step.value === 'seal'
        ? ['circles are reserved for truth — only verdict seals and pulse dots (VS §3.1; Bible Part Three)']
        : []),
    ],
    governingCitation: SCALE_CITATIONS.radiusLadder,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),
);

const sealSizeNames: Record<number, string> = {
  16: 'The Whisper Seal',
  20: 'The Ledger Seal',
  28: 'The Standing Seal',
  44: 'The Ceremony Seal',
};

const sealTokens: TokenRecord[] = SEAL_SIZES_PX.map((px) =>
  token({
    identifier: `shape.seal.size.${px}`,
    instrumentName: sealSizeNames[px],
    value: `${px}px`,
    constraints: [
      'registered seal size — verdict seals only (VS §5.2)',
      'size 16 renders without its word only with mandatory disclosure (tooltip and accessible name) (Constitution 3.3)',
    ],
    governingCitation: SCALE_CITATIONS.sealSizes,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),
);

export const SHAPE_REGISTRY: readonly TokenRecord[] = Object.freeze([
  ...radiusTokens,

  token({
    identifier: 'shape.hairline.width',
    instrumentName: 'The Hairline',
    value: `${HAIRLINE_WIDTH_PX}px`,
    constraints: [
      'structure is drawn with 1 px hairlines at registered ink strengths ink.16 and ink.32 (VS §3.3)',
      'hairlines replace shadows, borders-as-color, and dividers-as-decoration (VS §3.3)',
      'shadows are prohibited; glass is prohibited (VS §3.4)',
    ],
    governingCitation: SCALE_CITATIONS.hairline,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'shape.chainline.width',
    instrumentName: 'The Chainline',
    value: `${CHAINLINE_WIDTH_PX}px`,
    constraints: [
      'continuous line joining square nodes — one node per link (VS §3.5)',
      'rendered at ink.32 (VS §3.5)',
      'the Chainline is signature geometry: walkable (Bible Art. IX), never replaced by arrows, trees, or freeform connectors',
    ],
    governingCitation: SCALE_CITATIONS.chainline,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'shape.chainline.node',
    instrumentName: 'The Chain Node',
    value: `${CHAINLINE_NODE_PX}px`,
    constraints: ['2 px square nodes, one per link (VS §3.5)'],
    governingCitation: SCALE_CITATIONS.chainline,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'shape.chainline.breakGap',
    instrumentName: 'The Break Gap',
    value: `${CHAINLINE_BREAK_GAP_PX}px`,
    constraints: [
      'a broken chain renders as an 8 px gap with the registered break glyph at the gap (VS §3.5)',
      'a broken chain is rendered honestly, never silently re-rooted or skipped (Bible Art. IX)',
    ],
    governingCitation: SCALE_CITATIONS.chainline,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  ...sealTokens,
]);
