/**
 * Vaerion — Registry / Icon Registry
 *
 * Grid, stroke, sizes, families (VS §8). Compiled strictly from what the
 * ratified text registers: the stroke is hairline-consistent (1 px, VS §3.3)
 * and the registered sizes match the seal sizes where icons pair with verdicts
 * (VS §8 → §5.2: 16 / 20 / 28 / 44).
 *
 * The ratified text registers an icon grid and per-icon names but enumerates
 * no grid number and no family — per Bible Art. XI and P-5, no grid token and
 * no family token is compiled; the pins are requested by IR-008. Icons never
 * carry verdict color, never replace seals, and never decorate (VS §8); the
 * instrument's glyph needs are met by registered geometry (seals, Chainline,
 * break glyph), which is not font-icon territory.
 *
 * No visual values originate in this file — only transcriptions of ratified
 * values. Citation: Constitution 1.3, 2.1.
 */

import { visualSystem } from '../../foundation/citations';
import { HAIRLINE_WIDTH_PX, SCALE_CITATIONS, SEAL_SIZES_PX } from '../scales';
import { INITIAL_STATUS, REGISTRY_VERSION, token, type TokenRecord } from '../token';

const sizeNames: Record<number, string> = {
  16: 'The Inline Glyph',
  20: 'The Row Glyph',
  28: 'The Panel Glyph',
  44: 'The Ceremony Glyph',
};

export const ICON_REGISTRY: readonly TokenRecord[] = Object.freeze([
  token({
    identifier: 'icon.stroke',
    instrumentName: 'The Hairline Stroke',
    value: `${HAIRLINE_WIDTH_PX}px`,
    constraints: [
      'registered stroke is hairline-consistent (VS §8; §3.3)',
      'icons never carry verdict color (VS §8; §4.3 reserves color)',
      'icons never replace seals and never decorate (VS §8)',
    ],
    governingCitation: SCALE_CITATIONS.hairline,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  ...SEAL_SIZES_PX.map((px) =>
    token({
      identifier: `icon.size.${px}`,
      instrumentName: sizeNames[px],
      value: `${px}px`,
      constraints: [
        'registered sizes match the seal sizes where icons pair with verdicts (VS §8; §5.2)',
        'an icon whose meaning is not registered with its name cannot ship (VS §8; §0 dual naming)',
      ],
      governingCitation: SCALE_CITATIONS.sealSizes,
      version: REGISTRY_VERSION,
      status: INITIAL_STATUS,
    }),
  ),
]);

/**
 * Registered-but-unenumerated Icon slots (VS §8). No grid number and no
 * family are stated by the ratified text; nothing is compiled; consumption is
 * blocked until governance rules (IR-008).
 */
export const PENDING_ICON_SLOTS = {
  reason: 'VS §8 registers an icon grid and per-icon naming but enumerates no grid number and no family; compiling either would be invention (Bible Art. XI; P-5).',
  request: 'IR-008 — Founder pins the icon grid and, if glyphs beyond registered geometry are ever needed, the icon family.',
  blockedTokenSlots: ['icon.grid.*', 'icon.family.*'],
} as const;
