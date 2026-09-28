/**
 * Vaerion — Rendering / Responsive Evolution
 *
 * Responsive law (Constitution 7.5): "Breakpoints are the contract of Visual
 * System §11: each breakpoint names what is promoted and demoted; the Margin
 * Rail appears at ultra-wide; mobile obeys the Monitoring Doctrine with
 * capability tiers rendered honestly ('desktop acts' declared, not hidden).
 * Resizing must never merely scale; it must evolve per the contract."
 *
 * (The clause's "Visual System §11" citation resolves to the responsive
 * evolution registration of VS §9 — honest degradation, registered
 * breakpoints — and §1.4, the Margin Rail. Both are transcribed here.)
 *
 * The breakpoint widths are the Stage 4 structural pins recorded in IR-010
 * (proposed, awaiting governance): ≥1440 ultra-wide / ≥1024 standard /
 * ≥768 tablet / <768 narrow. They are behavior thresholds, not visual
 * values (the literal-value law of 1.3 governs visual values — dimensions,
 * durations, curves, colors, radii, sizes, weights; the pins carry their
 * own IR-010 citations and are exempt from the visual-literal battery as
 * media-query thresholds, per the established Stage 4 treatment).
 *
 * Citations: Implementation Constitution 7.5; Visual System §9, §1.4; Bible
 * Art. VIII, XIV; IR-010.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { LEDGER_ROW_HEIGHT_PX, TOUCH_TARGET_MINIMUM_PX } from '../registry/scales';
import { CEREMONIAL_DISTANCES } from './measurement';

/** The registered breakpoints, in descending width order (IR-010 pins). */
export const BREAKPOINTS = ['ultra-wide', 'standard', 'tablet', 'narrow'] as const;
export type BreakpointName = (typeof BREAKPOINTS)[number];

/** One breakpoint's contract: what is promoted, demoted, and protected. */
export interface BreakpointContract {
  readonly name: BreakpointName;
  /** The IR-010 structural pin (behavior threshold, not a visual value). */
  readonly widthPin: string;
  readonly promoted: readonly string[];
  readonly demoted: readonly string[];
  /** Rhythms and distances that never compress at this breakpoint. */
  readonly protected_: readonly string[];
  readonly citations: readonly Citation[];
}

/**
 * The breakpoint evolution contract (7.5; VS §9; VS §1.4). Each breakpoint
 * names what is promoted and demoted; resizing evolves per the contract and
 * never merely scales.
 */
export const BREAKPOINT_CONTRACTS: readonly BreakpointContract[] = Object.freeze([
  {
    name: 'ultra-wide',
    widthPin: '≥ 1440px (IR-010 pin)',
    promoted: [
      'the Margin Rail — the Document skeleton grows the 320 px rail for citations, evidence links, and stamps instead of stretching the reading column (VS §1.4)',
    ],
    demoted: [],
    protected_: ['content columns do not stretch to fill; they gain rails (VS §1.4)'],
    citations: [visualSystem('1.4', 'the Margin Rail on ultra-wide'), implementation('7.5')],
  },
  {
    name: 'standard',
    widthPin: '≥ 1024px (IR-010 pin)',
    promoted: ['the full instrument (VS §9 — Wide/Standard carry the full instrument)'],
    demoted: ['the Margin Rail collapses into registered positions (VS §9)'],
    protected_: ['the reading column holds its registered measure — it does not stretch to fill (VS §1.4)'],
    citations: [visualSystem('9', 'Standard — full instrument, rail collapses'), implementation('7.5')],
  },
  {
    name: 'tablet',
    widthPin: '≥ 768px (IR-010 pin)',
    promoted: [],
    demoted: [
      'the Spine collapses into its registered horizontal position (3.11 composition; IR-010 Stage 4 pin)',
    ],
    protected_: ['the full instrument remains operable — honest degradation is declared, never silent (Art. VIII)'],
    citations: [implementation('3.11', 'collapse behaviors at tablet and mobile are fixed by the responsive contract'), implementation('7.5')],
  },
  {
    name: 'narrow',
    widthPin: '< 768px (IR-010 pin)',
    promoted: [],
    demoted: [
      'the Spine holds its registered horizontal position (3.11; IR-010)',
      'density reduces by registered gauge steps (VS §9)',
      'capabilities that cannot render truthfully at the width are removed or explicitly labeled as unavailable on this surface — never faked, never truncated into ambiguity ("desktop acts" declared, not hidden — VS §9; Art. VIII)',
    ],
    protected_: [
      `the ledger rhythm (${LEDGER_ROW_HEIGHT_PX} px) never compresses below registration (VS §9; VS §5)`,
      `seal isolation (${CEREMONIAL_DISTANCES.sealIsolationPx} px) never compresses below registration (VS §9; VS §1.3)`,
      `touch targets meet the registered minimum (${TOUCH_TARGET_MINIMUM_PX} px) (VS §9)`,
    ],
    citations: [visualSystem('9', 'narrow / touch — the instrument degrades honestly'), bible('VIII', 'honesty over comfort'), implementation('7.5')],
  },
]);

function contractOf(breakpoint: BreakpointName): BreakpointContract {
  const contract = BREAKPOINT_CONTRACTS.find((candidate) => candidate.name === breakpoint);
  if (!contract) {
    throw new ConstitutionalViolationError(
      '7.5',
      `"${breakpoint}" is not a registered breakpoint. The registered contract is ${BREAKPOINTS.join(' → ')} (Constitution 7.5; VS §9).`,
    );
  }
  return contract;
}

/**
 * Breakpoint evolution (7.5): "Resizing must never merely scale; it must
 * evolve per the contract." Every breakpoint declares at least one promoted
 * or demoted behavior; a breakpoint that only rescales is a violation.
 */
export function assertBreakpointEvolution(): void {
  for (const contract of BREAKPOINT_CONTRACTS) {
    if (contract.promoted.length === 0 && contract.demoted.length === 0) {
      throw new ConstitutionalViolationError(
        '7.5',
        `Breakpoint "${contract.name}" declares no promotion and no demotion — it merely scales. Resizing must never merely scale; each breakpoint names what is promoted and demoted (Constitution 7.5; VS §9).`,
        contract.citations,
      );
    }
  }
}

/**
 * Margin Rail law (7.5; VS §1.4): the rail appears at ultra-wide only.
 */
export function assertMarginRailAtUltraWideOnly(params: {
  readonly breakpoint: BreakpointName;
  readonly railPresent: boolean;
}): void {
  if (params.breakpoint !== 'ultra-wide' && params.railPresent) {
    throw new ConstitutionalViolationError(
      '7.5 / 1.4',
      `The Margin Rail rendered at "${params.breakpoint}". The rail appears at ultra-wide only (Constitution 7.5; VS §1.4); below ultra-wide it collapses into registered positions.`,
      contractOf(params.breakpoint).citations,
    );
  }
}

/**
 * Honest degradation (7.5; VS §9; Art. VIII): a narrow/touch surface that
 * cannot render a capability truthfully removes it or declares it
 * unavailable — a removed capability that is not declared is a violation.
 */
export function assertHonestDegradation(params: {
  readonly capabilityRemoved: boolean;
  readonly capabilityDeclared: boolean;
}): void {
  if (params.capabilityRemoved && !params.capabilityDeclared) {
    throw new ConstitutionalViolationError(
      '7.5 / Art. VIII',
      'A capability was removed at a breakpoint without being declared. Capabilities that cannot render truthfully at the width are removed or explicitly labeled as unavailable on this surface — never faked, never hidden ("desktop acts" is declared, not assumed) (Constitution 7.5; VS §9; Art. VIII).',
      [visualSystem('9', 'honest degradation'), bible('VIII', 'honesty over comfort')],
    );
  }
}

/**
 * Protected rhythms (7.5; VS §9): the ledger rhythm and seal clearances
 * never compress below registration, and touch targets meet the registered
 * minimum, at every breakpoint. Throws on any compression.
 */
export function assertProtectedRhythms(params: {
  readonly ledgerRowPx: number;
  readonly sealIsolationPx: number;
  readonly touchTargetPx: number;
}): void {
  if (params.ledgerRowPx < LEDGER_ROW_HEIGHT_PX) {
    throw new ConstitutionalViolationError(
      '7.5 / Art. X',
      `Ledger rows measured ${params.ledgerRowPx}px. The ledger rhythm (${LEDGER_ROW_HEIGHT_PX} px) never compresses below registration (VS §9; VS §5); scanning is a stable physical act (Art. X).`,
      [visualSystem('5', 'Ledger Row rhythm')],
    );
  }
  if (params.sealIsolationPx < CEREMONIAL_DISTANCES.sealIsolationPx) {
    throw new ConstitutionalViolationError(
      '7.5 / 1.3',
      `Seal clearance measured ${params.sealIsolationPx}px. Seal isolation (${CEREMONIAL_DISTANCES.sealIsolationPx} px) never compresses below registration (VS §9; VS §1.3).`,
      [visualSystem('1.3', 'ceremonial spacing')],
    );
  }
  if (params.touchTargetPx < TOUCH_TARGET_MINIMUM_PX) {
    throw new ConstitutionalViolationError(
      '7.5 / 9',
      `Touch target measured ${params.touchTargetPx}px. Touch targets meet the registered minimum (${TOUCH_TARGET_MINIMUM_PX} px) at every breakpoint (VS §9).`,
      [visualSystem('9', 'touch targets meet registered minimums')],
    );
  }
}

/**
 * Platform neutrality (1.4; 1.5; 7.5): no platform-specific redesign. The
 * same breakpoint contract binds every platform; a platform declaring its
 * own layout evolution is a violation.
 */
export function assertNoPlatformRedesign(params: { readonly platform: string; readonly redesignsContract: boolean }): void {
  if (params.redesignsContract) {
    throw new ConstitutionalViolationError(
      '1.4 / 1.5',
      `Platform "${params.platform}" declared its own layout evolution. Engineers must not alter proportions, spacing, hierarchy, or layout to suit platform idiom (Constitution 1.4); the breakpoint contract binds every platform identically (7.5).`,
      [implementation('1.4', 'engineers implement; they do not redesign'), implementation('1.5', 'the Constitution outlives its tools')],
    );
  }
}

export const RESPONSIVE_CITATIONS: readonly Citation[] = [
  implementation('7.5', 'responsive evolution — each breakpoint names what is promoted and demoted'),
  visualSystem('9', 'layout and responsive evolution'),
  visualSystem('1.4', 'the Margin Rail'),
];
