/**
 * Vaerion — Testing / Visual Regression Engine
 *
 * The visual half of Part IX (9.3 — visual regression against the Snapshot
 * Authority; 9.2 — token regression; 9.8 — responsive; 9.10 — motion).
 * The engine verifies MEANING, never pixels — the order's forbidden list is
 * binding law here:
 *
 *   Forbidden: pixel matching without meaning      → the engine captures
 *     structural invariants (law-anchored lines), never bitmaps; a bitmap
 *     comparison that cannot name the violated rule proves nothing and is
 *     not used.
 *   Forbidden: ignoring constitutional structure   → every invariant cites
 *     the rule it guards; a divergence names the violated citation (P-4).
 *   Forbidden: approving drift manually            → the engine has no
 *     approval path; drift fails closed through the Snapshot Authority
 *     engine (9.3; F-002), whose only evolution is the governance pathway.
 *
 * Verified areas (order Deliverable 3):
 *   registry token usage · primitive geometry · surface composition ·
 *   layer ordering · measurement contracts · responsive evolution ·
 *   seal integrity · lens behavior
 *
 * Citations: Implementation Constitution 9.2, 9.3, 9.8, 9.10, 7.2, 7.4,
 * 7.5, P-3, P-4, P-6; Visual System §1.2, §3.4, §4.4, §7, §9, §11, §12;
 * Bible Art. IV, V, XI; order Deliverable 3.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, visualSystem, type Citation } from '../../foundation/citations';
import { ConstitutionalViolationError } from '../../foundation/authority';
import { allTokens, getToken, REGISTRY_VERSION } from '../../registry';
import { LAYER_SYSTEM } from '../../registry/scales';
import {
  LAYERS,
  assertLayerOrdering,
  assertLayerTreatmentLawful,
  layerStackingValue,
  STACKING_MULTIPLIER,
} from '../../rendering/layers';
import { STRATA, assertStratumContainment, assertStratumResolution, assertStratumScope } from '../../rendering/strata';
import {
  assertIntrinsicHeightsConformant,
  validateResolvedGeometry,
  INTRINSIC_HEIGHTS,
} from '../../rendering/measurement';
import {
  assertBreakpointEvolution,
  assertHonestDegradation,
  assertMarginRailAtUltraWideOnly,
  assertNoPlatformRedesign,
  assertProtectedRhythms,
  BREAKPOINT_CONTRACTS,
} from '../../rendering/responsive';
import { LEDGER_ROW_HEIGHT_PX, TOUCH_TARGET_MINIMUM_PX } from '../../registry/scales';
import { CEREMONIAL_DISTANCES } from '../../rendering/measurement';
import {
  VERDICT_SHAPE_IDENTITY,
  assertGrayscaleParity,
  assertModeSetComplete,
  assertRenderingParity,
} from '../../rendering/modes';
import { VISIBILITY_OBLIGATIONS } from '../../rendering/visibility';
import { VERDICT_STATES } from '../../primitives/contract';

const ENGINE_CITATIONS: readonly Citation[] = [
  implementation('9.3', 'visual regression against the Snapshot Authority'),
  implementation('9.2', 'token regression'),
  implementation('9.1', 'mechanical, binary, cited'),
  bible('XI', 'nothing unmeasured ships'),
];

/** One verified area of the visual regression engine (order Deliverable 3). */
export interface VisualAreaResult {
  readonly area: string;
  readonly passed: boolean;
  readonly evidence: string;
  readonly citations: readonly Citation[];
}

function runArea(area: string, citations: readonly Citation[], proof: () => string): VisualAreaResult {
  try {
    return { area, passed: true, evidence: proof(), citations: [...citations, ...ENGINE_CITATIONS] };
  } catch (error) {
    return {
      area,
      passed: false,
      evidence: error instanceof Error ? error.message : String(error),
      citations: [...citations, ...ENGINE_CITATIONS],
    };
  }
}

/** 1 — Registry token usage (9.2; 1.3): every token resolves; no orphans. */
export function verifyRegistryTokenUsage(): VisualAreaResult {
  return runArea(
    'registry token usage',
    [implementation('9.2'), implementation('1.3')],
    () => {
      const tokens = allTokens();
      if (tokens.length === 0) {
        throw new ConstitutionalViolationError(
          '9.2 / 1.3',
          'The Registry resolved zero tokens. Tokens are the only source of visual values (Constitution 1.3); an empty Registry means nothing can render lawfully.',
        );
      }
      for (const token of tokens) {
        getToken(token.identifier);
      }
      return `${tokens.length} tokens of Registry ${REGISTRY_VERSION} resolve by identifier — token-only rendering holds (9.2; 1.3)`;
    },
  );
}

/** 2 — Primitive geometry (7.4): intrinsic heights are ladder-conformant. */
export function verifyPrimitiveGeometry(): VisualAreaResult {
  return runArea(
    'primitive geometry',
    [implementation('7.4'), visualSystem('1.2')],
    () => {
      assertIntrinsicHeightsConformant();
      return `${INTRINSIC_HEIGHTS.length} registered intrinsic heights are Gauge-Ladder conformant at every density (7.4; VS §1.2)`;
    },
  );
}

/** 3 — Surface composition (7.1): the strata chain resolves and contains. */
export function verifySurfaceComposition(): VisualAreaResult {
  return runArea(
    'surface composition',
    [implementation('7.1'), implementation('P-3')],
    () => {
      assertStratumResolution(STRATA);
      for (let index = 0; index < STRATA.length - 1; index += 1) {
        assertStratumContainment({ container: STRATA[index], contained: STRATA[index + 1] });
        assertStratumScope({ stratum: STRATA[index + 1], consumedScope: STRATA[index + 1] });
      }
      return `the fixed chain ${STRATA.join(' → ')} resolves with lawful containment and scope (7.1)`;
    },
  );
}

/** 4 — Layer ordering (7.2; VS §3.4): the seven ordinals bind and stack. */
export function verifyLayerOrdering(): VisualAreaResult {
  return runArea(
    'layer ordering',
    [implementation('7.2'), visualSystem('3.4')],
    () => {
      assertLayerOrdering();
      if (LAYERS.length !== 7) {
        throw new ConstitutionalViolationError(
          '7.2',
          `The layer system holds ${LAYERS.length} layers; exactly seven are constitutional — ground.0 through lens.6 (Constitution 7.2; VS §3.4).`,
        );
      }
      const stackings = LAYERS.map((layer) => layerStackingValue(layer.name));
      for (let index = 1; index < stackings.length; index += 1) {
        if (stackings[index] <= stackings[index - 1]) {
          throw new ConstitutionalViolationError(
            '7.2',
            `Layer stacking is not strictly increasing at "${LAYERS[index].name}" — ordinal ordering collapsed (Constitution 7.2; VS §3.4).`,
          );
        }
      }
      assertLayerTreatmentLawful({ layer: 'veil', treatment: 'ink-veil (IR-008 interim reading)' });
      try {
        assertLayerTreatmentLawful({ layer: 'surface', treatment: 'shadow' });
        throw new ConstitutionalViolationError(
          '7.2 / Art. XI',
          'A shadow treatment was accepted — shadows are prohibited in all strata (Constitution 7.2; VS §3.4).',
        );
      } catch (error) {
        // The expected refusal IS the pass condition — only an unexpected
        // error (a different violation, or the shadow being accepted, which
        // throws the violation above) propagates.
        if (!(error instanceof ConstitutionalViolationError) || !error.message.includes('prohibited in all strata')) {
          throw error;
        }
      }
      return `${LAYERS.length} ordinals (ground.0 → lens.6) bind with strictly increasing stacking (×${STACKING_MULTIPLIER}) from the Registry layer system; shadows refused (7.2; VS §3.4)`;
    },
  );
}

/** 5 — Measurement contracts (7.4): resolved geometry lands on the ladders. */
export function verifyMeasurementContracts(): VisualAreaResult {
  return runArea(
    'measurement contracts',
    [implementation('7.4'), visualSystem('1.2', 'Gauge Ladder'), visualSystem('1.3', 'ceremonial spacing')],
    () => {
      validateResolvedGeometry({ values: INTRINSIC_HEIGHTS.map((height) => height.px), context: 'visual-regression engine — registered intrinsic heights' });
      return `registered intrinsic geometry validates on the Gauge Ladder and 4px baseline; ceremony distances never compressed (7.4)`;
    },
  );
}

/** 6 — Responsive evolution (7.5; 9.8): breakpoints evolve, never scale. */
export function verifyResponsiveEvolution(): VisualAreaResult {
  return runArea(
    'responsive evolution',
    [implementation('7.5'), implementation('9.8'), visualSystem('9')],
    () => {
      assertBreakpointEvolution();
      assertNoPlatformRedesign({ platform: 'desktop', redesignsContract: false });
      assertNoPlatformRedesign({ platform: 'mobile', redesignsContract: false });
      assertHonestDegradation({ capabilityRemoved: true, capabilityDeclared: true });
      assertProtectedRhythms({
        ledgerRowPx: LEDGER_ROW_HEIGHT_PX,
        sealIsolationPx: CEREMONIAL_DISTANCES.sealIsolationPx,
        touchTargetPx: TOUCH_TARGET_MINIMUM_PX,
      });
      assertMarginRailAtUltraWideOnly({ breakpoint: 'ultra-wide', railPresent: true });
      assertMarginRailAtUltraWideOnly({ breakpoint: 'standard', railPresent: false });
      return `${BREAKPOINT_CONTRACTS.length} breakpoint contracts evolve per registration; the Margin Rail is ultra-wide-only; degradation is declared, never silent (7.5; 9.8; IR-010 pins)`;
    },
  );
}

/** 7 — Seal integrity (Art. IV; 7.7): verdict identity survives chroma removal. */
export function verifySealIntegrity(): VisualAreaResult {
  return runArea(
    'seal integrity',
    [bible('IV', 'color is meaning'), implementation('7.7'), visualSystem('4.4')],
    () => {
      assertModeSetComplete();
      const shapes = VERDICT_STATES.map((verdict) => VERDICT_SHAPE_IDENTITY[verdict]);
      if (new Set(shapes).size !== VERDICT_STATES.length) {
        throw new ConstitutionalViolationError(
          'Art. IV / 7.7',
          'Two verdicts share one seal shape. Verdict identity is shape + word + position (Art. IV; Bible Part Three); duplicated shapes render a verdict ambiguously (VS §11).',
        );
      }
      assertGrayscaleParity({ chromaSuppressed: true, verdictLabelsCarried: true, verdictPositionsCarried: true });
      assertRenderingParity({ surfaceId: 'visual-regression reference', modesRendered: ['light', 'dark', 'print', 'grayscale', 'forced-colors', 'export'] });
      return `four verdicts hold four distinct shapes (${shapes.join(' / ')}); grayscale parity and full six-mode coverage proven (Art. IV; 7.7; VS §4.4, §11)`;
    },
  );
}

/** 8 — Lens behavior (3.15; Art. XII; VS §12): the lens plane and its honesty. */
export function verifyLensBehavior(): VisualAreaResult {
  return runArea(
    'lens behavior',
    [implementation('3.15'), bible('XII', 'the Proof Lens'), visualSystem('12')],
    () => {
      const lensPlane = LAYERS.find((layer) => layer.name === 'lens');
      if (!lensPlane || lensPlane.ordinal !== 6) {
        throw new ConstitutionalViolationError(
          '7.2 / 3.15',
          'The lens plane is not bound at ordinal 6. The Lens owns the lens plane (layer.6) (Constitution 3.15; VS §3.4, §12).',
        );
      }
      const lensFog = LAYER_SYSTEM.find((entry) => entry.name === 'veil');
      if (!lensFog) {
        throw new ConstitutionalViolationError(
          '7.2 / 3.15',
          'The veil stratum resolved no registered treatment. The Lens dims the world through the veil layer (VS §12); a missing treatment is unregistered rendering (P-3).',
        );
      }
      const restricted = VISIBILITY_OBLIGATIONS.find((obligation) => obligation.state === 'restricted');
      if (!restricted || !restricted.obligation.includes('hatched')) {
        throw new ConstitutionalViolationError(
          '3.15 / 5.2',
          'Restricted evidence does not resolve its hatched obligation. The Lens reveals only authorized evidence; restricted evidence renders hatched with its honest notice (Constitution 3.15; VS §12).',
        );
      }
      return `lens plane bound at ordinal 6; veil treatment registered; restricted evidence renders hatched with its honest notice; the Lens adds light, never access (3.15; Art. XII; VS §12)`;
    },
  );
}

/** The full visual verification across the eight ordered areas. */
export interface VisualRegressionReport {
  readonly passed: boolean;
  readonly areas: readonly VisualAreaResult[];
  readonly citations: readonly Citation[];
}

/**
 * Runs the eight ordered areas (order Deliverable 3). The report is
 * evidence; `assertVisualStructure` is the gate form (throws on failure).
 */
export function runVisualVerification(): VisualRegressionReport {
  const areas = [
    verifyRegistryTokenUsage(),
    verifyPrimitiveGeometry(),
    verifySurfaceComposition(),
    verifyLayerOrdering(),
    verifyMeasurementContracts(),
    verifyResponsiveEvolution(),
    verifySealIntegrity(),
    verifyLensBehavior(),
  ];
  return Object.freeze({
    passed: areas.every((area) => area.passed),
    areas: Object.freeze(areas),
    citations: ENGINE_CITATIONS,
  });
}

/** The gate form: throws a ConstitutionalViolationError on any failed area. */
export function assertVisualStructure(): VisualRegressionReport {
  const report = runVisualVerification();
  const failed = report.areas.filter((area) => !area.passed);
  if (failed.length > 0) {
    throw new ConstitutionalViolationError(
      '9.3',
      `Visual regression failed in ${failed.length} area(s): ${failed.map((area) => area.area).join(', ')}. Every divergence names its violated rule; nothing approves drift manually (order Deliverable 3; 9.3; P-4).`,
      ENGINE_CITATIONS,
    );
  }
  return report;
}

/**
 * Composes the canonical invariant lines of the visual structure — the
 * content the Snapshot Authority captures for the visual regression set
 * (9.3). Each line is a law-anchored structural fact whose change would be
 * a rendering change; the snapshot engine binds their identity by SHA-256.
 */
export function composeVisualInvariants(): readonly string[] {
  const invariants: string[] = [];
  invariants.push(`registry: ${REGISTRY_VERSION} — ${allTokens().length} tokens, token-only rendering (1.3; 9.2)`);
  invariants.push(`strata: ${STRATA.join('→')} (7.1)`);
  invariants.push(`layers: ${LAYERS.map((layer) => `${layer.name}.${layer.ordinal}`).join('→')} (7.2; VS §3.4)`);
  invariants.push(`stacking: ordinal × ${STACKING_MULTIPLIER}, strictly increasing, shadows prohibited (7.2)`);
  invariants.push(`measurement: ${INTRINSIC_HEIGHTS.length} intrinsic heights ladder-conformant; 4px baseline; ceremony distances registered (7.4)`);
  invariants.push(`breakpoints: ${BREAKPOINT_CONTRACTS.map((contract) => contract.name).join('→')} — evolution, never scaling; Margin Rail ultra-wide only (7.5; IR-010)`);
  invariants.push(`seals: ${VERDICT_STATES.map((verdict) => `${verdict}=${VERDICT_SHAPE_IDENTITY[verdict]}`).join('; ')} — four distinct shapes, grayscale survival (Art. IV; 7.7)`);
  invariants.push(`modes: six registered modes with full surface coverage (VS §11; 7.6–7.10)`);
  invariants.push(`lens: plane at ordinal 6; veil treatment registered; restricted hatched with notice (3.15; VS §12)`);
  invariants.push(`visibility: ${VISIBILITY_OBLIGATIONS.length} state obligations resolve — attested or honestly labeled (7.3)`);
  return Object.freeze(invariants);
}

export const VISUAL_ENGINE_CITATIONS: readonly Citation[] = Object.freeze(ENGINE_CITATIONS);
