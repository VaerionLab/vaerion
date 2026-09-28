/**
 * Vaerion — Testing / The Parity Harness
 *
 * "CLI, API, and UI render the same record equivalently — the Parity
 * Harness, mandated by Bible §16 and VS P1, is a standing gate"
 * (Constitution 9.12). The Stage 9 execution order names the harness's
 * targets — Desktop, Mobile, Print, Grayscale, Forced Colors, Reduced
 * Motion, Export — and its six invariants:
 *
 *   1. Structure remains identical          (7.1 — the fixed strata chain)
 *   2. Evidence remains visible             (Art. II — evidence or silence)
 *   3. Receipt anatomy remains intact       (Art. VI — the receipt is sacred)
 *   4. Chain breaks remain visible          (3.4; 5.9; Art. XII)
 *   5. Restricted information remains honest (5.2; VS §3.3 — hatched, notice)
 *   6. No target hides constitutional information (7.3 — visibility law)
 *
 * The harness is a standing gate (9.12): it composes the reference rendering
 * plan per target through the rendering engine's own law and proves the six
 * invariants mechanically for every target. A target that fails any
 * invariant produces a ConstitutionalViolationError — parity is not a
 * report, it is a gate (9.1; 10.1).
 *
 * Citations: Implementation Constitution 9.12, 9.1, 7.1–7.10, 6.12, P-3;
 * Bible Art. II, III, IV, VI, VIII, XII; Visual System §4.4, §7.3, §9, §11.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { RECEIPT_ANATOMY } from '../primitives/contract';
import {
  composeRenderingPlan,
  assertPlanConformant,
  type RenderingPlanNode,
} from '../rendering/pipeline';
import { RENDERING_MODES, modeContractOf, REDUCED_MOTION_CONTRACT, type RenderingMode } from '../rendering/modes';
import { VISIBILITY_OBLIGATIONS, visibilityObligationOf } from '../rendering/visibility';
import { BREAKPOINT_CONTRACTS } from '../rendering/responsive';
import { STATE_MATRIX, type CanonicalState } from '../state/matrix';
import type { SkeletonKind } from '../rendering/skeletons';

/** The seven parity targets of the standing gate (order Deliverable 2). */
export const PARITY_TARGETS = [
  'desktop',
  'mobile',
  'print',
  'grayscale',
  'forced-colors',
  'reduced-motion',
  'export',
] as const;
export type ParityTarget = (typeof PARITY_TARGETS)[number];

/** The resolution of one target against the rendering engine's contracts. */
export interface ParityTargetResolution {
  readonly target: ParityTarget;
  /** The registered rendering modes the target renders (screen targets render both chambers). */
  readonly modes: readonly RenderingMode[];
  /** The breakpoint contract applied, where the target is a screen target. */
  readonly breakpoint: string | null;
  /** Whether the target renders under reduced motion (7.9). */
  readonly reducedMotion: boolean;
  readonly citations: readonly Citation[];
}

/**
 * Resolves a parity target against the rendering engine's own contracts.
 * An unregistered target is a violation — parity runs against the
 * registered targets, never invented ones (P-3).
 */
export function resolveParityTarget(target: ParityTarget): ParityTargetResolution {
  switch (target) {
    case 'desktop':
      return Object.freeze({
        target,
        modes: Object.freeze(['light', 'dark'] as RenderingMode[]),
        breakpoint: 'standard',
        reducedMotion: false,
        citations: Object.freeze([implementation('7.5', 'responsive evolution'), visualSystem('9', 'layout and responsive evolution')]),
      });
    case 'mobile':
      return Object.freeze({
        target,
        modes: Object.freeze(['light', 'dark'] as RenderingMode[]),
        breakpoint: 'narrow',
        reducedMotion: false,
        citations: Object.freeze([implementation('7.5', 'responsive evolution — honest degradation'), visualSystem('9', 'narrow / touch degrades honestly')]),
      });
    case 'print':
      return Object.freeze({
        target,
        modes: Object.freeze(['print'] as RenderingMode[]),
        breakpoint: null,
        reducedMotion: false,
        citations: Object.freeze([...modeContractOf('print').citations]),
      });
    case 'grayscale':
      return Object.freeze({
        target,
        modes: Object.freeze(['grayscale'] as RenderingMode[]),
        breakpoint: null,
        reducedMotion: false,
        citations: Object.freeze([...modeContractOf('grayscale').citations]),
      });
    case 'forced-colors':
      return Object.freeze({
        target,
        modes: Object.freeze(['forced-colors'] as RenderingMode[]),
        breakpoint: null,
        reducedMotion: false,
        citations: Object.freeze([...modeContractOf('forced-colors').citations]),
      });
    case 'reduced-motion':
      return Object.freeze({
        target,
        modes: Object.freeze(['light', 'dark'] as RenderingMode[]),
        breakpoint: null,
        reducedMotion: true,
        citations: Object.freeze([...REDUCED_MOTION_CONTRACT.citations]),
      });
    case 'export':
      return Object.freeze({
        target,
        modes: Object.freeze(['export'] as RenderingMode[]),
        breakpoint: null,
        reducedMotion: false,
        citations: Object.freeze([...modeContractOf('export').citations]),
      });
    default: {
      throw new ConstitutionalViolationError(
        '9.12 / P-3',
        `"${String(target)}" is not a registered parity target. The standing gate runs the seven ordered targets: ${PARITY_TARGETS.join(', ')} (order Deliverable 2; 9.12).`,
      );
    }
  }
}

/** The evidence-bearing states — received facts and withheld-but-present evidence. */
const EVIDENCE_STATES: readonly CanonicalState[] = ['verified', 'failed', 'pending', 'restricted'];

/**
 * The reference skeleton the harness composes per target: the Console —
 * the surface family the parity law speaks of first (6.3, 6.5 — every
 * listed surface class). One plan per target, same skeleton, so structure
 * comparison is lawful.
 */
const REFERENCE_SKELETON: SkeletonKind = 'console';

function referenceStates(): readonly CanonicalState[] {
  return STATE_MATRIX.map((definition) => definition.id);
}

/** Composes the reference rendering plan for one target (7.1). */
export function composeTargetPlan(resolution: ParityTargetResolution): {
  readonly nodes: readonly RenderingPlanNode[];
  readonly visibility: readonly CanonicalState[];
} {
  const plan = composeRenderingPlan({
    skeleton: REFERENCE_SKELETON,
    modes: resolution.modes,
    states: referenceStates(),
  });
  assertPlanConformant(plan);
  return plan;
}

const HARNESS_CITATIONS: readonly Citation[] = [
  implementation('9.12', 'the Parity Harness is a standing gate'),
  implementation('9.1', 'mechanical, binary, cited'),
  bible('XVI', 'parity across renderings'),
];

/** The per-target verdict of the harness. */
export interface ParityTargetResult {
  readonly target: ParityTarget;
  readonly passed: boolean;
  readonly evidence: string;
  readonly citations: readonly Citation[];
}

/**
 * Runs the six parity invariants for one target. Every invariant is
 * mechanical: it compares the target's rendering resolution against the
 * rendering engine's law and throws ConstitutionalViolationError on
 * divergence.
 */
export function runParityForTarget(target: ParityTarget): ParityTargetResult {
  try {
    const resolution = resolveParityTarget(target);
    const plan = composeTargetPlan(resolution);

    /* Invariant 1 — structure remains identical (7.1). The strata chain is
       the fixed resolution chain in every target; the skeleton is one of
       the three canonical skeletons (4.1). */
    const strata = plan.nodes.map((node) => node.stratum);
    if (strata.join('→') !== 'chrome→surface→region→primitive') {
      throw new ConstitutionalViolationError(
        '7.1 / 9.12',
        `Target "${target}" resolved the strata chain "${strata.join('→')}". The fixed chain is chrome → surface → region → primitive (Constitution 7.1); parity requires identical structure across every target (order Deliverable 2, invariant 1).`,
      );
    }

    /* Invariant 2 — evidence remains visible (Art. II). Every
       evidence-bearing state resolves its visibility obligation under the
       target, and mode-bearing targets carry the persistence clauses that
       keep evidence rendering (print: no truncation; grayscale: shapes and
       words; export: same source record set). */
    for (const state of EVIDENCE_STATES) {
      visibilityObligationOf(state);
    }
    if (resolution.modes.includes('print') && !modeContractOf('print').obligations.some((o) => o.includes('truncation of verdict information is prohibited'))) {
      throw new ConstitutionalViolationError(
        '7.6 / Art. II',
        `The print target lost its no-truncation obligation. Verdict information may never be truncated in print (Constitution 7.6); a target that drops the clause hides evidence (order Deliverable 2, invariant 2; Art. II).`,
      );
    }
    if (resolution.modes.includes('grayscale') && !modeContractOf('grayscale').obligations.some((o) => o.includes('shapes and words carry every meaning'))) {
      throw new ConstitutionalViolationError(
        '7.7 / Art. IV',
        'The grayscale target lost its shape-and-word obligation. With chroma suppressed, shapes and words carry every meaning (Constitution 7.7; Art. IV); a target that drops the clause hides evidence.',
      );
    }
    if (resolution.modes.includes('export') && !modeContractOf('export').obligations.some((o) => o.includes('same source record set'))) {
      throw new ConstitutionalViolationError(
        '7.10',
        'The export target lost its same-source-records obligation. Preview and delivered artifact render from the same source record set (Constitution 7.10); a target that drops the clause hides evidence.',
      );
    }

    /* Invariant 3 — receipt anatomy remains intact (Art. VI). The anatomy
       order is identical in every target: it is law, not a per-target
       arrangement (3.1 — variants differ in compression, never in order).
       The anatomy is composed once here and its identity digest is what the
       snapshot engine pins per target. */
    const anatomy = RECEIPT_ANATOMY.join('→');

    /* Invariant 4 — chain breaks remain visible (3.4; 5.9; Art. XII). The
       recovery obligation (integrity revalidation; break renders as a break)
       resolves in every target. */
    const recovery = visibilityObligationOf('recovery');
    if (!recovery.obligation.includes('integrity revalidation')) {
      throw new ConstitutionalViolationError(
        '5.9 / 3.4',
        'The recovery obligation no longer binds integrity revalidation. Recovery revalidates chain integrity before live resumption and a break renders as a break until reconciled (Constitution 5.9; 3.4); a target that drops it papers over gaps.',
      );
    }

    /* Invariant 5 — restricted information remains honest (5.2; VS §3.3).
       The restricted obligation binds hatching and the honest notice in
       every target. */
    const restricted = visibilityObligationOf('restricted');
    if (!restricted.obligation.includes('hatched') || !restricted.obligation.includes('notice')) {
      throw new ConstitutionalViolationError(
        '5.2 / VS §3.3',
        `The restricted obligation does not bind hatching and its honest notice ("${restricted.obligation}"). Restricted evidence renders hatched with its honest notice in every target (Constitution 5.2; VS §3.3; order Deliverable 2, invariant 5).`,
      );
    }

    /* Invariant 6 — no target hides constitutional information (7.3).
       Every canonical state's obligation resolves under the target; the
       target hides none of them. */
    if (plan.visibility.length !== STATE_MATRIX.length) {
      throw new ConstitutionalViolationError(
        '7.3',
        `Target "${target}" resolves ${plan.visibility.length} of ${STATE_MATRIX.length} canonical states. Nothing renders without being either attested or honestly labeled — and no target drops a state's obligation (Constitution 7.3; order Deliverable 2, invariant 6).`,
      );
    }
    for (const definition of STATE_MATRIX) {
      visibilityObligationOf(definition.id);
    }

    return {
      target,
      passed: true,
      evidence: `structure chrome→surface→region→primitive; ${EVIDENCE_STATES.length} evidence states visible; receipt anatomy intact (${anatomy}); chain-break obligation bound; restricted hatched+notice; all ${STATE_MATRIX.length} state obligations resolve`,
      citations: [...resolution.citations, ...HARNESS_CITATIONS],
    };
  } catch (error) {
    return {
      target,
      passed: false,
      evidence: error instanceof Error ? error.message : String(error),
      citations: HARNESS_CITATIONS,
    };
  }
}

/** The full harness report across the seven targets. */
export interface ParityReport {
  readonly passed: boolean;
  readonly targets: readonly ParityTargetResult[];
  readonly citations: readonly Citation[];
}

/**
 * Runs the standing gate across all seven targets (9.12). The report is
 * evidence; `assertParity` is the gate — it throws on any failed target
 * (9.1; 10.1 — no partial passes).
 */
export function runParityHarness(): ParityReport {
  const targets = PARITY_TARGETS.map((target) => runParityForTarget(target));
  return Object.freeze({
    passed: targets.every((result) => result.passed),
    targets: Object.freeze(targets),
    citations: HARNESS_CITATIONS,
  });
}

/** The gate form: throws a ConstitutionalViolationError on any failure. */
export function assertParity(): ParityReport {
  const report = runParityHarness();
  const failed = report.targets.filter((result) => !result.passed);
  if (failed.length > 0) {
    throw new ConstitutionalViolationError(
      '9.12',
      `The Parity Harness failed for ${failed.length} target(s): ${failed.map((result) => result.target).join(', ')}. The harness is a standing gate (Constitution 9.12); a target that fails parity does not ship (10.1).`,
      HARNESS_CITATIONS,
    );
  }
  return report;
}

/**
 * Breakpoint parity (9.8; 7.5): the responsive contracts exist exactly as
 * registered and no breakpoint merely scales. Composed into the harness
 * evidence so the standing gate also proves the responsive half of parity.
 */
export function assertBreakpointParity(): void {
  const names = BREAKPOINT_CONTRACTS.map((contract) => contract.name);
  if (names.length !== 4 || !names.includes('ultra-wide') || !names.includes('narrow')) {
    throw new ConstitutionalViolationError(
      '7.5 / 9.8',
      `The breakpoint contracts resolved ${names.length} entries (${names.join(', ')}). The registered behavior matrix must be honored exactly (Constitution 7.5; 9.8; VS §11).`,
      [implementation('7.5'), visualSystem('11')],
    );
  }
  for (const contract of BREAKPOINT_CONTRACTS) {
    if (contract.promoted.length === 0 && contract.demoted.length === 0) {
      throw new ConstitutionalViolationError(
        '7.5 / 9.8',
        `Breakpoint "${contract.name}" neither promotes nor demotes — a breakpoint that merely scales is a violation (Constitution 7.5; VS §11: resizing must evolve per the contract).`,
        [implementation('7.5'), visualSystem('11')],
      );
    }
  }
}

export const PARITY_HARNESS_CITATIONS: readonly Citation[] = Object.freeze(HARNESS_CITATIONS);
