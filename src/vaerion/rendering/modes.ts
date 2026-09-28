/**
 * Vaerion — Rendering / The Rendering Modes and Their Renderers
 *
 * Every surface must render correctly in all registered modes (Visual
 * System §11): the two chambers (light, dark), print, grayscale,
 * forced-colors, and export. The Implementation Constitution adds the
 * renderers of 7.6–7.10 and reduced-motion parity (7.9):
 *
 *   7.6  Print         — grayscale-first; seals keep shapes and words;
 *                        hatching persists; DEMO stamps persist; truncation
 *                        of verdict information is prohibited; color is
 *                        optional ink only.
 *   7.7  Grayscale     — fully operable with all chromatic tokens
 *                        suppressed; shapes and words carry every meaning.
 *   7.8  Forced colors — hairlines resolve to full ink, washes are dropped,
 *                        seals gain outlines, the focus ring remains visible.
 *   7.9  Reduced motion — every transition instant; every state reachable
 *                        and legible; the pending pulse becomes a static dot
 *                        with its word.
 *   7.10 Export        — preview and delivered artifact rendered from the
 *                        same source record set; ships with a manifest
 *                        receipt; honors print, grayscale, and
 *                        demo-quarantine rules without exception.
 *
 * "A mode that renders a verdict ambiguously is a violation regardless of
 * how the screen renders" (VS §11).
 *
 * Citations: Implementation Constitution 7.6–7.10; Visual System §4.1–§4.7,
 * §7.3, §11, §11.6; Bible Art. III, IV, V, VIII, XIV.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { VERDICT_STATES, type VerdictState } from '../primitives/contract';
import { assertExportAllowed, type StateRecord } from '../state/quarantine';

/** The six registered rendering modes (VS §11), in registered order. */
export const RENDERING_MODES = ['light', 'dark', 'print', 'grayscale', 'forced-colors', 'export'] as const;
export type RenderingMode = (typeof RENDERING_MODES)[number];

export interface ModeContract {
  readonly mode: RenderingMode;
  /** The ratified obligations of the mode, transcribed. */
  readonly obligations: readonly string[];
  readonly citations: readonly Citation[];
}

/**
 * The mode contracts (VS §11; Constitution 7.6–7.10). The chambers render
 * the ratified reference sets of VS §4.7; the renderers carry their clause
 * obligations.
 */
export const MODE_CONTRACTS: readonly ModeContract[] = Object.freeze([
  {
    mode: 'light',
    obligations: ['the light chamber — the reading room; the ratified set of VS §4.7; a surface declares its chamber'],
    citations: [visualSystem('4.1', 'the two chambers'), visualSystem('4.7', 'reference value tables')],
  },
  {
    mode: 'dark',
    obligations: ['the dark chamber — the war room; the ratified set of VS §4.7; a surface declares its chamber'],
    citations: [visualSystem('4.1', 'the two chambers'), visualSystem('4.7', 'reference value tables')],
  },
  {
    mode: 'print',
    obligations: [
      'grayscale-first (7.6)',
      'seals keep shapes and words (7.6)',
      'hatching persists (7.6)',
      'DEMO stamps persist (7.6)',
      'truncation of verdict information is prohibited (7.6)',
      'color is optional ink only (7.6)',
    ],
    citations: [implementation('7.6', 'print rendering'), visualSystem('11.3', 'print — print-true rendering')],
  },
  {
    mode: 'grayscale',
    obligations: [
      'all chromatic tokens suppressed (7.7)',
      'shapes and words carry every meaning (7.7; Art. IV — never color alone)',
    ],
    citations: [implementation('7.7', 'grayscale rendering'), visualSystem('4.4', 'grayscale survival'), bible('IV', 'color is meaning — never the only carrier')],
  },
  {
    mode: 'forced-colors',
    obligations: [
      'hairlines resolve to full ink (7.8)',
      'washes are dropped (7.8)',
      'seals gain outlines (7.8)',
      'the focus ring remains visible (7.8)',
    ],
    citations: [implementation('7.8', 'forced-colors rendering'), visualSystem('11.5', 'forced colors — verdict identity survives via seal shape and label')],
  },
  {
    mode: 'export',
    obligations: [
      'preview and delivered artifact rendered from the same source record set (7.10)',
      'the bundle ships with a manifest receipt (7.10; Part VIII)',
      'honors print, grayscale, and demo-quarantine rules without exception (7.10)',
      'the record, its chain, its verifier names, and the Environment Stamp — without interactive-only affordances (VS §11.6)',
    ],
    citations: [implementation('7.10', 'export rendering'), visualSystem('11.6', 'export — the registered export treatment')],
  },
]);

export function modeContractOf(mode: RenderingMode): ModeContract {
  const contract = MODE_CONTRACTS.find((candidate) => candidate.mode === mode);
  if (!contract) {
    throw new ConstitutionalViolationError(
      '7.6 / 11',
      `"${String(mode)}" is not a registered rendering mode. Exactly six modes are registered: ${RENDERING_MODES.join(', ')} (VS §11).`,
    );
  }
  return contract;
}

/** The mode set is exactly the six registered modes (VS §11). */
export function assertModeSetComplete(): void {
  if (MODE_CONTRACTS.length !== RENDERING_MODES.length || RENDERING_MODES.length !== 6) {
    throw new ConstitutionalViolationError(
      '11',
      `The rendering modes hold ${MODE_CONTRACTS.length} contracts for ${RENDERING_MODES.length} names. Exactly six modes are registered (VS §11); inventing a mode is a violation.`,
    );
  }
}

/** The reduced-motion contract (7.9; VS §7.3) — parity, not a chamber mode. */
export const REDUCED_MOTION_CONTRACT = Object.freeze({
  obligations: [
    'every transition is instant (7.9)',
    'every state remains reachable and legible (7.9)',
    'the pending pulse becomes a static dot with its word (7.9)',
    'complete informational parity — no meaning is carried by motion alone (VS §7.3; Art. V)',
  ] as readonly string[],
  citations: [
    implementation('7.9', 'reduced motion'),
    visualSystem('7.3', 'reduced motion receives complete informational parity'),
    bible('V', 'motion is information'),
  ] as readonly Citation[],
});

/**
 * The verdict shape system (Bible Part Three) — the color-independent
 * verdict identity that carries grayscale, forced-colors, and print parity.
 * Transcribed; the Seal primitive enforces it at render time.
 */
export const VERDICT_SHAPE_IDENTITY: Readonly<Record<VerdictState, string>> = Object.freeze({
  verified: 'solid disc',
  unverified: 'hollow disc',
  failed: 'crossed disc',
  pending: 'pulse dot',
});

/** Print parity (7.6). Every obligation must hold; truncation throws. */
export function assertPrintParity(params: {
  readonly sealShapesKept: boolean;
  readonly sealWordsKept: boolean;
  readonly hatchingPersisted: boolean;
  readonly demoStampsPersisted: boolean;
  /** Truncation of verdict information is prohibited — must be false. */
  readonly verdictInfoTruncated: boolean;
  readonly colorOptionalInkOnly: boolean;
}): void {
  const failures: string[] = [];
  if (!params.sealShapesKept) failures.push('seal shapes');
  if (!params.sealWordsKept) failures.push('seal words');
  if (!params.hatchingPersisted) failures.push('hatching');
  if (!params.demoStampsPersisted) failures.push('DEMO stamps');
  if (params.verdictInfoTruncated) failures.push('verdict information was truncated');
  if (!params.colorOptionalInkOnly) failures.push('color was not optional ink');
  if (failures.length > 0) {
    throw new ConstitutionalViolationError(
      '7.6',
      `Print parity failed: ${failures.join('; ')}. The print target is grayscale-first: seals keep shapes and words, hatching persists, DEMO stamps persist, truncation of verdict information is prohibited, color is optional ink only (Constitution 7.6; VS §11.3). Print conformance is gated, not best-effort.`,
      modeContractOf('print').citations,
    );
  }
}

/**
 * Grayscale parity (7.7; Art. IV): with chroma suppressed, every verdict
 * must remain readable through its seal shape, label, and position — a
 * state distinguishable only by hue is a violation.
 */
export function assertGrayscaleParity(params: {
  readonly chromaSuppressed: boolean;
  readonly verdictLabelsCarried: boolean;
  readonly verdictPositionsCarried: boolean;
}): void {
  if (!params.chromaSuppressed) {
    throw new ConstitutionalViolationError(
      '7.7',
      'Grayscale parity failed: chromatic tokens were not suppressed. The implementation must be fully operable with all chromatic tokens suppressed (Constitution 7.7; VS §4.4).',
      modeContractOf('grayscale').citations,
    );
  }
  const shapes = VERDICT_STATES.map((verdict) => VERDICT_SHAPE_IDENTITY[verdict]);
  const distinctShapes = new Set(shapes).size === VERDICT_STATES.length;
  if (!distinctShapes || !params.verdictLabelsCarried || !params.verdictPositionsCarried) {
    throw new ConstitutionalViolationError(
      '7.7 / Art. IV',
      `Grayscale parity failed: verdict identity must survive chroma removal through seal shape (${shapes.join(' / ')}), label, and position. A state distinguishable only by hue is a violation (Constitution 7.7; VS §4.4; Art. IV).`,
      modeContractOf('grayscale').citations,
    );
  }
}

/** Forced-colors parity (7.8). Every obligation must hold. */
export function assertForcedColorsParity(params: {
  readonly hairlinesFullInk: boolean;
  readonly washesDropped: boolean;
  readonly sealOutlinesGained: boolean;
  readonly focusRingVisible: boolean;
}): void {
  const failures: string[] = [];
  if (!params.hairlinesFullInk) failures.push('hairlines did not resolve to full ink');
  if (!params.washesDropped) failures.push('washes were not dropped');
  if (!params.sealOutlinesGained) failures.push('seals did not gain outlines');
  if (!params.focusRingVisible) failures.push('the focus ring is not visible');
  if (failures.length > 0) {
    throw new ConstitutionalViolationError(
      '7.8',
      `Forced-colors parity failed: ${failures.join('; ')}. Under forced palettes hairlines resolve to full ink, washes are dropped, seals gain outlines, and the focus ring remains visible (Constitution 7.8; VS §11.5). The near-monochrome design makes forced-colors survival structural, not patched.`,
      modeContractOf('forced-colors').citations,
    );
  }
}

/** Reduced-motion parity (7.9; VS §7.3). Every obligation must hold. */
export function assertReducedMotionParity(params: {
  readonly transitionsInstant: boolean;
  readonly statesReachableAndLegible: boolean;
  readonly pendingStaticDotWithWord: boolean;
}): void {
  const failures: string[] = [];
  if (!params.transitionsInstant) failures.push('transitions are not instant');
  if (!params.statesReachableAndLegible) failures.push('a state is unreachable or illegible');
  if (!params.pendingStaticDotWithWord) failures.push('the pending pulse did not become a static dot with its word');
  if (failures.length > 0) {
    throw new ConstitutionalViolationError(
      '7.9 / Art. V',
      `Reduced-motion parity failed: ${failures.join('; ')}. With reduced motion asserted, every transition is instant and every state remains reachable and legible; the pending pulse becomes a static dot with its word (Constitution 7.9); no meaning is carried by motion alone (VS §7.3; Art. V).`,
      REDUCED_MOTION_CONTRACT.citations,
    );
  }
}

/** The record the export target renders (VS §11.6), plus its manifest receipt. */
export interface ExportTargetPlan {
  readonly records: readonly StateRecord[];
  /** The manifest receipt reference — required (7.10). */
  readonly manifestReceiptId: string;
  /** The verifier names carried by the export (Art. III; VS §11.6). */
  readonly verifierNames: readonly string[];
  readonly environmentStampPresent: boolean;
  readonly chainPresent: boolean;
  /** Interactive-only affordances are absent from the export treatment. */
  readonly interactiveOnlyAffordances: false;
  readonly citations: readonly Citation[];
}

/**
 * The export renderer (7.10): composes the export target plan. The plan is
 * refused by construction when (a) no manifest receipt is presented — the
 * bundle ships with a manifest receipt — or (b) any record is
 * Demo-quarantined — exports from Demo quarantines are refused by
 * construction (5.10; 8.7; composition with the state engine's quarantine
 * law, never a duplicate).
 */
export function composeExportTarget(params: {
  readonly records: readonly StateRecord[];
  readonly manifestReceiptId: string | null;
  readonly verifierNames: readonly string[];
  readonly environmentStampPresent: boolean;
  readonly chainPresent: boolean;
}): ExportTargetPlan {
  if (!params.manifestReceiptId) {
    throw new ConstitutionalViolationError(
      '7.10',
      'An export target was composed without a manifest receipt. The bundle ships with a manifest receipt (Constitution 7.10; Part VIII); an export that cannot name its manifest does not render.',
      modeContractOf('export').citations,
    );
  }
  // Demo quarantine is honored without exception (7.10) — composition with
  // the state engine's export-refusal law (5.10; 8.7), not a duplicate.
  assertExportAllowed(params.records);
  return Object.freeze({
    records: Object.freeze([...params.records]),
    manifestReceiptId: params.manifestReceiptId,
    verifierNames: Object.freeze([...params.verifierNames]),
    environmentStampPresent: params.environmentStampPresent,
    chainPresent: params.chainPresent,
    interactiveOnlyAffordances: false,
    citations: modeContractOf('export').citations,
  });
}

/** Export parity (7.10; VS §11.6). Every obligation must hold. */
export function assertExportParity(params: {
  readonly sameSourceRecordSet: boolean;
  readonly manifestReceiptShipped: boolean;
  readonly demoQuarantineHonored: boolean;
  readonly printRulesHonored: boolean;
  readonly grayscaleRulesHonored: boolean;
  readonly interactiveOnlyAffordancesPresent: boolean;
}): void {
  const failures: string[] = [];
  if (!params.sameSourceRecordSet) failures.push('the delivered artifact did not render from the same source record set');
  if (!params.manifestReceiptShipped) failures.push('no manifest receipt shipped');
  if (!params.demoQuarantineHonored) failures.push('demo quarantine was not honored');
  if (!params.printRulesHonored) failures.push('print rules were not honored');
  if (!params.grayscaleRulesHonored) failures.push('grayscale rules were not honored');
  if (params.interactiveOnlyAffordancesPresent) failures.push('interactive-only affordances are present');
  if (failures.length > 0) {
    throw new ConstitutionalViolationError(
      '7.10',
      `Export parity failed: ${failures.join('; ')}. Export is a distinct rendering target: preview and delivered artifact render from the same source record set, the bundle ships with a manifest receipt, and print, grayscale, and demo-quarantine rules are honored without exception (Constitution 7.10; VS §11.6).`,
      modeContractOf('export').citations,
    );
  }
}

/**
 * Rendering parity (VS §11): every surface must render correctly in all six
 * registered modes. A surface whose mode coverage is incomplete is a
 * violation — regardless of how the screen renders.
 */
export function assertRenderingParity(params: {
  readonly surfaceId: string;
  readonly modesRendered: readonly RenderingMode[];
}): void {
  const missing = RENDERING_MODES.filter((mode) => !params.modesRendered.includes(mode));
  if (missing.length > 0) {
    throw new ConstitutionalViolationError(
      '11',
      `Surface "${params.surfaceId}" does not render in: ${missing.join(', ')}. Every surface must render correctly in all registered modes (VS §11); a mode that renders a verdict ambiguously is a violation regardless of how the screen renders.`,
      [visualSystem('11', 'rendering modes')],
    );
  }
}

export const MODES_CITATIONS: readonly Citation[] = [
  implementation('7.6', 'print rendering — gated, not best-effort'),
  implementation('7.7', 'grayscale rendering'),
  implementation('7.8', 'forced-colors rendering'),
  implementation('7.9', 'reduced motion'),
  implementation('7.10', 'export rendering'),
  visualSystem('11', 'rendering modes'),
];
