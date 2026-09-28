/**
 * Vaerion — Registry / Type Registry
 *
 * The two voices, sizes, weights, tracking, line heights.
 *
 * Compiled strictly from what the ratified text registers: the two voices with
 * their families and line heights (VS §2.1) and the tabular-numeral discipline
 * (VS §2.3). The Type Scale (VS §2.2) registers that sizes and weights exist
 * on a fixed scale per voice, but the ratified text does not enumerate numeric
 * sizes or weights — per Bible Art. XI and P-5 no size or weight token is
 * compiled; the numeric pins are requested by IR-005 and enter only by
 * governance.
 *
 * No visual values originate in this file — only transcriptions of ratified
 * values. Citation: Constitution 1.3, 2.1.
 */

import { visualSystem } from '../../foundation/citations';
import {
  HUMAN_VOICE_FALLBACK,
  HUMAN_VOICE_FAMILY,
  HUMAN_VOICE_LINE_HEIGHT,
  MACHINE_VOICE_FALLBACK,
  MACHINE_VOICE_FAMILY,
  MACHINE_VOICE_LINE_HEIGHT,
  SCALE_CITATIONS,
} from '../scales';
import { INITIAL_STATUS, REGISTRY_VERSION, token, type TokenRecord } from '../token';

export const TYPE_REGISTRY: readonly TokenRecord[] = Object.freeze([
  token({
    identifier: 'type.voice.machine',
    instrumentName: 'The Machine Voice',
    value: `${MACHINE_VOICE_FAMILY}, ${MACHINE_VOICE_FALLBACK}, monospace`,
    constraints: [
      'renders identifiers, hashes, versions, timestamps, counts, rules, and all literal measurement (VS §2.1)',
      'the Machine Voice does not use italic (VS §2.2)',
      'a hash never renders in the Human Voice (VS §2.3)',
      'never editorializes (Bible Art. VII)',
    ],
    governingCitation: SCALE_CITATIONS.voices,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'type.voice.human',
    instrumentName: 'The Human Voice',
    value: `${HUMAN_VOICE_FAMILY}, ${HUMAN_VOICE_FALLBACK}, sans-serif`,
    constraints: [
      'renders explanations, one-line state explainers, guidance (VS §2.1)',
      'plain and specific; it never markets (Bible Art. VII)',
      'the two voices never share a family and never blend into a third tone (VS §2.1; Bible Art. VII)',
    ],
    governingCitation: SCALE_CITATIONS.voices,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'type.leading.machine',
    instrumentName: 'Machine Measure',
    value: String(MACHINE_VOICE_LINE_HEIGHT),
    constraints: ['Machine Voice line height (VS §2.1)'],
    governingCitation: SCALE_CITATIONS.voices,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'type.leading.human',
    instrumentName: 'Human Measure',
    value: String(HUMAN_VOICE_LINE_HEIGHT),
    constraints: ['Human Voice line height (VS §2.1)'],
    governingCitation: SCALE_CITATIONS.voices,
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),

  token({
    identifier: 'type.numeric.tabular',
    instrumentName: 'The Numerals',
    value: 'tabular-nums',
    constraints: [
      'numeric literals, hashes, and identifiers render in the Machine Voice with tabular alignment (VS §2.3)',
      'prose numbers stay in the Human Voice (VS §2.3)',
    ],
    governingCitation: [visualSystem('2.3', 'numerals and literals — tabular alignment in the Machine Voice')],
    version: REGISTRY_VERSION,
    status: INITIAL_STATUS,
  }),
]);

/**
 * Registered-but-unenumerated Type Scale slots. The law fixes that sizes and
 * weights register per voice on a fixed scale (VS §2.2); the ratified text
 * does not state the numbers. No token is compiled; consumption is blocked
 * until governance rules (IR-005).
 */
export const PENDING_TYPE_SCALE = {
  reason: 'VS §2.2 fixes that a Type Scale exists per voice but enumerates no numeric sizes or weights; compiling values would be invention (Bible Art. XI; P-5).',
  request: 'IR-005 — Founder pins the Type Scale (sizes and weights per voice).',
  blockedTokenSlots: [
    'type.size.machine.*',
    'type.size.human.*',
    'type.weight.machine.*',
    'type.weight.human.*',
    'type.tracking.*',
  ],
} as const;
