'use client';

/**
 * Vaerion — Primitive / Verdict Seal
 *
 * Renders a received verdict as shape + word — solid, hollow, crossed,
 * pulsing — at the sanctioned sizes 16, 20, 28, 44.
 *
 * Contract (Constitution 3.3 [VS §5.2; Bible Art. III, IV]):
 * - Responsibility: rendering a verdict as shape + word at sanctioned sizes.
 * - Boundaries: the Seal is the only component permitted a filled glyph, a
 *   circle, and verdict color; at size 16 it must not appear without its word
 *   unless disclosure (tooltip and accessible name) is present; it must not
 *   render a verdict not received from the Verification Authority.
 * - Extension: a new verdict state requires constitutional amendment; no
 *   local state glyphs.
 * - Composition: embeds in Receipt, Ledger Row, Table, Return, Timeline;
 *   standalone at ceremony sizes.
 *
 * State law: the verdict arrives as a prop (Part V — verdict-domain states
 * enter only from the Verification Authority). No verdict is computed,
 * predicted, or optimistically rendered here (1.6; Bible Art. VIII).
 *
 * Accessibility: the full fact is announced — verdict, verifier, ruleset
 * (6.11); shape carries the verdict independently of color (Bible Part
 * Three; Art. IV); size 16 pairs a mandatory tooltip with an accessible name.
 */

import {
  VERDICT_STATES,
  definePrimitive,
  type VerdictState,
} from './contract';

/** Seal contract metadata — Constitution 3.3. */
export const SEAL_METADATA = definePrimitive({
  name: 'Seal',
  constitutionClause: '3.3',
  visualSystemSections: ['5.2'],
  bound: true,
  contract: {
    responsibility: 'Rendering a verdict as shape + word — solid, hollow, crossed, pulsing — at sanctioned sizes 16, 20, 28, 44.',
    boundaries: [
      'the Seal is the only component permitted a filled glyph, a circle, and verdict color (Constitution 3.3)',
      'it must not appear without its word except at size 16, where disclosure (tooltip and accessible name) is mandatory (Constitution 3.3)',
      'it must not render a verdict not received from the Verification Authority (Constitution 3.3; 1.6)',
      'no alias, no softer synonym, no fifth verdict (Bible Part Three)',
    ],
    extension: 'a new verdict state requires constitutional amendment; no local state glyphs (Constitution 3.3)',
    composition: 'embeds in Receipt, Ledger Row, Table, Return, Timeline nodes; standalone at ceremony sizes (Constitution 3.3)',
  },
  tokens: [
    'shape.seal.size.16', 'shape.seal.size.20', 'shape.seal.size.28', 'shape.seal.size.44',
    'color.verdict.verified', 'color.verdict.pending', 'color.verdict.failed', 'color.ink.100',
    'shape.radius.seal', 'shape.hairline.width',
  ],
  states: ['verified', 'unverified', 'failed', 'pending'],
  accessibility: {
    announcement: 'announces the full fact — verdict, verifier, ruleset (Constitution 6.11)',
    keyboard: 'n/a — status indicator; traversal owned by the surface (6.7)',
    sensory: 'shape carries the verdict independently of color (Bible Part Three; Art. IV)',
  },
  citations: [],
});

const SIZES = [16, 20, 28, 44] as const;
export type SealSize = (typeof SIZES)[number];

/** The verdict word — constitutional vocabulary, never an alias (Bible Part Three). */
const VERDICT_WORDS: Record<VerdictState, string> = {
  verified: 'VERIFIED',
  unverified: 'UNVERIFIED',
  failed: 'FAILED',
  pending: 'PENDING',
};

export interface SealProps {
  /** Received verdict — never computed here (1.6; Part V). */
  verdict: VerdictState;
  /** Registered size (VS §5.2). */
  size?: SealSize;
  /** The verifier name — every verdict names its verifier (Bible Art. III). */
  verifier?: string;
  /** The rule set the check ran against (Bible Art. III). */
  ruleset?: string;
  /** Show the word beside the glyph (mandatory visibility at ≥ 20). */
  showWord?: boolean;
  /** Accessible label override (size 16 disclosure). */
  ariaLabel?: string;
}

export function Seal({
  verdict,
  size = 20,
  verifier,
  ruleset,
  showWord = true,
  ariaLabel,
}: SealProps) {
  if (!SIZES.includes(size)) {
    throw new Error(
      `[PRIMITIVE · 3.3] Seal size ${size} is not a registered size (VS §5.2: 16 / 20 / 28 / 44).`,
    );
  }
  if (!VERDICT_STATES.includes(verdict)) {
    throw new Error(
      `[PRIMITIVE · 3.3] Verdict "${verdict}" is not one of the four verdicts (Bible Part Three). No alias, no fifth verdict.`,
    );
  }

  const needsDisclosure = size === 16 && !showWord;
  const announcement =
    `${VERDICT_WORDS[verdict]}` +
    (verifier ? `, verified by ${verifier}` : '') +
    (ruleset ? `, rule set ${ruleset}` : '');

  return (
    <span
      className={`vx-seal vx-seal-${size}`}
      data-verdict={verdict}
      role="status"
      aria-label={ariaLabel ?? announcement}
      title={needsDisclosure ? announcement : undefined}
    >
      <span className="vx-seal-disc" aria-hidden="true">
        {verdict === 'failed' ? (
          <svg className="vx-seal-cross" viewBox="0 0 44 44" aria-hidden="true" focusable="false">
            <line
              x1="10" y1="10" x2="34" y2="34"
              style={{ stroke: 'var(--vx-color-verdict-failed)', strokeWidth: 'var(--vx-shape-hairline-width)' }}
            />
            <line
              x1="34" y1="10" x2="10" y2="34"
              style={{ stroke: 'var(--vx-color-verdict-failed)', strokeWidth: 'var(--vx-shape-hairline-width)' }}
            />
          </svg>
        ) : null}
        {verdict === 'pending' ? <span className="vx-seal-pulse" aria-hidden="true" /> : null}
      </span>
      {showWord ? <span className="vx-seal-word vx-micro">{VERDICT_WORDS[verdict]}</span> : null}
    </span>
  );
}
