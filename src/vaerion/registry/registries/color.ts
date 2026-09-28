/**
 * Vaerion — Registry / Color Registry
 *
 * Grounds, ink, verdict chromatics, accent. Value authority: the VS §4.7
 * reference value tables — the sole ratified color-value source. No surface,
 * code path, or document may introduce a color value outside these tables
 * (VS §4.7; Bible Art. XI; Constitution 1.3).
 *
 * Ink ramp steps ink.16 / ink.32: the ratified text registers the strengths by
 * name ("registered strengths") but not as hex values; the identifiers encode
 * the formula — ink.100 at the named alpha (16% / 32%). They compile as
 * formula tokens resolved by the compiler against ink.100 per chamber
 * (Constitution 2.2 permits value/formula). The reading is recorded as
 * IR-006 for confirmation; until ruled otherwise, the formula is the
 * identifier's own semantics, not an invented value.
 *
 * UNVERIFIED takes no chromatic family: the hollow seal is ink.100 — no token
 * exists for it, and none may be added (VS §4.3).
 *
 * No visual values originate in this file — only transcriptions of ratified
 * values. Citation: Constitution 1.3, 2.1.
 */

import { visualSystem } from '../../foundation/citations';
import { GROUND_DARK, GROUND_LIGHT, SCALE_CITATIONS } from '../scales';
import { INITIAL_STATUS, REGISTRY_VERSION, token, type ChamberedValue, type TokenRecord } from '../token';

const chambered = (light: string, dark: string): ChamberedValue => ({ light, dark });

/** The four verdicts bind color and nothing else (Bible Art. III/IV; VS §4.3). */
export const VERDICT_COLOR_CONSTRAINTS = [
  'binds to its verdict and to nothing else (VS §4.3; Bible Art. IV)',
  'must survive grayscale rendering with meaning intact — seal shape, label, and position carry the verdict (VS §4.4)',
  'chromatic coverage is budgeted ≤ 5% of any surface, target < 2% (VS §4.5)',
  'never the only carrier of meaning — shape, label, position encode simultaneously (Bible Art. IV)',
] as const;

export const COLOR_REGISTRY: readonly TokenRecord[] = Object.freeze([
  token({
    identifier: 'color.ground',
    instrumentName: 'The Reading Room / The War Room',
    value: chambered(GROUND_LIGHT, GROUND_DARK),
    constraints: [
      'light chamber (Paper) — where records are read, verified, exported, printed (VS §4.1)',
      'dark chamber (Graphite) — where operations run long (VS §4.1)',
      'a surface declares its chamber and renders its registered set (VS §4.1)',
    ],
    governingCitation: SCALE_CITATIONS.grounds,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'color.ink.100',
    instrumentName: 'Full Ink',
    value: chambered('#1A1917', '#E9E6E0'),
    constraints: [
      'full-strength ink — primary text (VS §4.2)',
      'text-level color pairs meet WCAG 2.2 AA contrast for their size and weight (VS §4.6)',
      'the hollow seal is ink, not color — UNVERIFIED takes no chromatic family (VS §4.3)',
    ],
    governingCitation: SCALE_CITATIONS.grounds,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'color.ink.16',
    instrumentName: 'Hairline Ink (16)',
    value: 'color.ink.100 @ 0.16 alpha',
    constraints: [
      'registered hairline strength (VS §3.3)',
      'formula: ink.100 at the strength named by the identifier (VS §3.3, §4.2)',
      'reading recorded as IR-006 for governance confirmation',
    ],
    governingCitation: SCALE_CITATIONS.hairline,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'color.ink.32',
    instrumentName: 'Hairline Ink (32)',
    value: 'color.ink.100 @ 0.32 alpha',
    constraints: [
      'registered hairline strength (VS §3.3)',
      'governs the Chainline render (VS §3.5)',
      'formula: ink.100 at the strength named by the identifier (VS §3.3, §4.2)',
      'reading recorded as IR-006 for governance confirmation',
    ],
    governingCitation: SCALE_CITATIONS.hairline,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'color.verdict.verified',
    instrumentName: 'Assay Green',
    value: chambered('#17663F', '#3FA873'),
    constraints: [...VERDICT_COLOR_CONSTRAINTS, 'VERIFIED only — the solid seal (VS §4.3; Bible Part Three)', 'never appears without naming its verifier (Bible Art. III)'],
    governingCitation: SCALE_CITATIONS.grounds,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'color.verdict.pending',
    instrumentName: 'Hold Amber',
    value: chambered('#7A5200', '#D19A3A'),
    constraints: [...VERDICT_COLOR_CONSTRAINTS, 'PENDING / hold states only — the pulse (VS §4.3; Bible Part Three)', 'never rounded forward to VERIFIED (Bible Part Three)'],
    governingCitation: SCALE_CITATIONS.grounds,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'color.verdict.failed',
    instrumentName: 'Fault Red',
    value: chambered('#9E2B20', '#C65B4E'),
    constraints: [...VERDICT_COLOR_CONSTRAINTS, 'FAILED only — the crossed seal (VS §4.3; Bible Part Three)', 'always names what failed and which verifier refuted it (Bible Part Three)'],
    governingCitation: SCALE_CITATIONS.grounds,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'color.accent.brass.text',
    instrumentName: 'Signal Brass (Text)',
    value: chambered('#7A4E1D', '#C98A4B'),
    constraints: [
      'the accent of attestation — stamps, verification emphasis (VS §4.3)',
      'text-level: meets WCAG 2.2 AA for its size and weight (VS §4.6)',
      'never substituted for glyph-level brass (VS §4.6)',
    ],
    governingCitation: SCALE_CITATIONS.grounds,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'color.accent.brass.glyph',
    instrumentName: 'Signal Brass (Glyph)',
    value: '#9C6220',
    constraints: [
      'glyph-level — seal strokes, ticks, glyph emphasis (VS §4.3, §4.6)',
      'registered once — chamber-invariant (VS §4.7)',
      'never substituted for text-level brass (VS §4.6)',
    ],
    governingCitation: SCALE_CITATIONS.grounds,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),
]);
