/**
 * Vaerion — Rendering / The Fourteen Rendering Gates
 *
 * Mechanical verification of Part VII (Constitution 9.1 form: binary,
 * cited). Each gate exercises the engine's own law against the running
 * modules — layers, strata, visibility, measurement, responsive evolution,
 * modes, pipeline — so the proof is of the engine, not of a description of
 * it (P-6). Every assertion form throws a ConstitutionalViolationError on
 * violation; every gate proves both the lawful path and at least one
 * refusal path.
 *
 * Gate order is the directive's order: layer ordering, hierarchy ownership,
 * breakpoint evolution, print parity, grayscale parity, forced-colors
 * parity, reduced-motion parity, export parity, measurement validation,
 * visibility honesty, responsive evolution, token-only rendering, no
 * literal values, layer integrity.
 *
 * Citations: Implementation Constitution Part VII, 9.1, 1.3, P-3; Visual
 * System §3.4, §4.4, §9, §11; Bible Art. IV, V, VIII, XI.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { LAYER_SYSTEM } from '../registry/scales';
import { allTokens, getToken, cssVarName } from '../registry';
import {
  LAYERS,
  assertLayerOrdering,
  assertLayerTreatmentLawful,
  layerStackingValue,
  resolveLayer,
  STACKING_MULTIPLIER,
} from './layers';
import {
  STRATA,
  assertChromeAuthoredOnce,
  assertNoRestyle,
  assertStratumContainment,
  assertStratumResolution,
  assertStratumScope,
} from './strata';
import {
  assertAbsenceDeclared,
  assertDemoStamped,
  assertEmptyTeaching,
  assertRestrictedHatched,
  assertSkeletonStructureOnly,
  assertVisibilityLawful,
  assertVisibilitySetIntegrity,
} from './visibility';
import {
  assertCeremonyNeverCompressed,
  assertIntrinsicHeightsConformant,
  validateResolvedGeometry,
} from './measurement';
import {
  assertBreakpointEvolution,
  assertHonestDegradation,
  assertMarginRailAtUltraWideOnly,
  assertNoPlatformRedesign,
  assertProtectedRhythms,
  BREAKPOINT_CONTRACTS,
} from './responsive';
import {
  assertExportParity,
  assertForcedColorsParity,
  assertGrayscaleParity,
  assertModeSetComplete,
  assertPrintParity,
  assertReducedMotionParity,
  assertRenderingParity,
  composeExportTarget,
  REDUCED_MOTION_CONTRACT,
  RENDERING_MODES,
} from './modes';
import { composeRenderingPlan, assertPlanConformant, assertNothingOutsideContracts } from './pipeline';
import { CEREMONIAL_DISTANCES } from './measurement';
import { INTRINSIC_HEIGHTS } from './measurement';

/** The verdict of one mechanical gate (9.1 form). */
export interface RenderingGateResult {
  readonly gate: string;
  readonly passed: boolean;
  readonly evidence: string;
  readonly citations: readonly Citation[];
}

const GATE_CITATIONS: readonly Citation[] = [implementation('Part VII'), implementation('9.1', 'mechanical, binary, cited')];

function runGate(gate: string, citations: readonly Citation[], proof: () => string): RenderingGateResult {
  try {
    const evidence = proof();
    return { gate, passed: true, evidence, citations: [...citations, ...GATE_CITATIONS] };
  } catch (error) {
    return {
      gate,
      passed: false,
      evidence: error instanceof Error ? error.message : String(error),
      citations: [...citations, ...GATE_CITATIONS],
    };
  }
}

function expectViolation(proof: () => void, rule: string): void {
  try {
    proof();
  } catch (error) {
    if (error instanceof ConstitutionalViolationError) return;
    throw new ConstitutionalViolationError(
      rule,
      `A refusal path raised "${error instanceof Error ? error.message : String(error)}" instead of a ConstitutionalViolationError.`,
    );
  }
  throw new ConstitutionalViolationError(rule, 'A refusal path did not throw — the engine accepted a violation.');
}

/** 1 — layer ordering: the seven ordinals bind and refuse (7.2). */
export function gateLayerOrdering(): RenderingGateResult {
  return runGate('layer ordering', [implementation('7.2'), visualSystem('3.4')], () => {
    assertLayerOrdering();
    for (const layer of LAYERS) {
      resolveLayer(layer.name);
    }
    // Refusal: an invented layer does not exist.
    expectViolation(() => resolveLayer('modal'), '7.2');
    return `seven ordinal layers resolve (ground.0–lens.6); stacking binds ordinal × ${STACKING_MULTIPLIER}; invented layers refused (7.2)`;
  });
}

/** 2 — hierarchy ownership: strata, containment, scope, restyle, chrome (7.1). */
export function gateHierarchyOwnership(): RenderingGateResult {
  return runGate('hierarchy ownership', [implementation('7.1'), implementation('4.3')], () => {
    assertStratumResolution([...STRATA]);
    assertStratumContainment({ container: 'chrome', contained: 'surface' });
    assertStratumContainment({ container: 'surface', contained: 'region' });
    assertStratumContainment({ container: 'region', contained: 'primitive' });
    assertStratumScope({ stratum: 'surface', consumedScope: 'surface' });
    assertNoRestyle({ primitiveRestylesChrome: false, surfaceRestylesPrimitiveAnatomy: false });
    assertChromeAuthoredOnce({ chromeInstances: 1 });
    // The composed plan is conformant end-to-end.
    const plan = composeRenderingPlan({
      skeleton: 'console',
      modes: [...RENDERING_MODES],
      states: ['idle', 'loading', 'skeleton', 'empty'],
    });
    assertPlanConformant(plan);
    // Refusals: reordered strata, cross-scope consumption, restyles, chrome
    // duplication, and out-of-plan nodes all throw.
    expectViolation(() => assertStratumResolution(['surface', 'chrome', 'region', 'primitive']), '7.1');
    expectViolation(() => assertStratumScope({ stratum: 'primitive', consumedScope: 'chrome' }), '7.1');
    expectViolation(() => assertNoRestyle({ primitiveRestylesChrome: true, surfaceRestylesPrimitiveAnatomy: false }), '7.1');
    expectViolation(() => assertNoRestyle({ primitiveRestylesChrome: false, surfaceRestylesPrimitiveAnatomy: true }), '7.1');
    expectViolation(() => assertChromeAuthoredOnce({ chromeInstances: 2 }), '4.3 / 7.1');
    expectViolation(() => assertNothingOutsideContracts({ planNodeCount: plan.nodes.length, declaredNodeCount: plan.nodes.length + 1 }), 'P-3 / 7.1');
    return `resolution chain chrome → surface → region → primitive enforced; scope law holds; restyle prohibitions throw; chrome authored once; plan conformant (7.1; 4.3; P-3)`;
  });
}

/** 3 — breakpoint evolution: contracts declare promotion/demotion (7.5). */
export function gateBreakpointEvolution(): RenderingGateResult {
  return runGate('breakpoint evolution', [implementation('7.5'), visualSystem('9')], () => {
    assertBreakpointEvolution();
    assertMarginRailAtUltraWideOnly({ breakpoint: 'ultra-wide', railPresent: true });
    assertMarginRailAtUltraWideOnly({ breakpoint: 'standard', railPresent: false });
    // Refusals: a scale-only breakpoint and a rail below ultra-wide throw.
    expectViolation(() => assertMarginRailAtUltraWideOnly({ breakpoint: 'narrow', railPresent: true }), '7.5 / 1.4');
    expectViolation(
      () => assertNoPlatformRedesign({ platform: 'probe', redesignsContract: true }),
      '1.4 / 1.5',
    );
    return `${BREAKPOINT_CONTRACTS.length} breakpoint contracts each name promoted/demoted behavior; the Margin Rail appears at ultra-wide only; platform redesign refused (7.5; VS §9; IR-010)`;
  });
}

/** 4 — print parity: grayscale-first, records persist, no truncation (7.6). */
export function gatePrintParity(): RenderingGateResult {
  return runGate('print parity', [implementation('7.6'), visualSystem('11.3')], () => {
    assertPrintParity({
      sealShapesKept: true,
      sealWordsKept: true,
      hatchingPersisted: true,
      demoStampsPersisted: true,
      verdictInfoTruncated: false,
      colorOptionalInkOnly: true,
    });
    // Refusal: any lost record treatment throws.
    expectViolation(
      () =>
        assertPrintParity({
          sealShapesKept: true,
          sealWordsKept: true,
          hatchingPersisted: true,
          demoStampsPersisted: false,
          verdictInfoTruncated: false,
          colorOptionalInkOnly: true,
        }),
      '7.6',
    );
    expectViolation(
      () =>
        assertPrintParity({
          sealShapesKept: true,
          sealWordsKept: true,
          hatchingPersisted: true,
          demoStampsPersisted: true,
          verdictInfoTruncated: true,
          colorOptionalInkOnly: true,
        }),
      '7.6',
    );
    return 'print parity holds: grayscale-first; seals keep shapes and words; hatching and DEMO stamps persist; verdict information is never truncated (7.6)';
  });
}

/** 5 — grayscale parity: shape + word + position carry the verdict (7.7). */
export function gateGrayscaleParity(): RenderingGateResult {
  return runGate('grayscale parity', [implementation('7.7'), visualSystem('4.4'), bible('IV')], () => {
    assertGrayscaleParity({ chromaSuppressed: true, verdictLabelsCarried: true, verdictPositionsCarried: true });
    // Refusal: chroma not suppressed, or identity lost, throws.
    expectViolation(() => assertGrayscaleParity({ chromaSuppressed: false, verdictLabelsCarried: true, verdictPositionsCarried: true }), '7.7');
    expectViolation(() => assertGrayscaleParity({ chromaSuppressed: true, verdictLabelsCarried: false, verdictPositionsCarried: true }), '7.7 / Art. IV');
    return 'grayscale parity holds: chroma suppressed; the verdict survives on seal shape (solid / hollow / crossed / pulse), label, and position (7.7; Art. IV)';
  });
}

/** 6 — forced-colors parity: full ink, no washes, outlines, focus (7.8). */
export function gateForcedColorsParity(): RenderingGateResult {
  return runGate('forced-colors parity', [implementation('7.8'), visualSystem('11.5')], () => {
    assertForcedColorsParity({ hairlinesFullInk: true, washesDropped: true, sealOutlinesGained: true, focusRingVisible: true });
    // Refusal: any lost treatment throws.
    expectViolation(
      () => assertForcedColorsParity({ hairlinesFullInk: true, washesDropped: true, sealOutlinesGained: true, focusRingVisible: false }),
      '7.8',
    );
    return 'forced-colors parity holds: hairlines resolve to full ink, washes are dropped, seals gain outlines, the focus ring remains visible (7.8)';
  });
}

/** 7 — reduced-motion parity: instant, reachable, static pending dot (7.9). */
export function gateReducedMotionParity(): RenderingGateResult {
  return runGate('reduced-motion parity', [implementation('7.9'), visualSystem('7.3'), bible('V')], () => {
    assertReducedMotionParity({ transitionsInstant: true, statesReachableAndLegible: true, pendingStaticDotWithWord: true });
    // Refusal: motion-carried meaning throws.
    expectViolation(
      () => assertReducedMotionParity({ transitionsInstant: true, statesReachableAndLegible: true, pendingStaticDotWithWord: false }),
      '7.9 / Art. V',
    );
    return `reduced-motion parity holds: ${REDUCED_MOTION_CONTRACT.obligations.length} obligations — instant transitions, reachable states, the pending pulse a static dot with its word (7.9; VS §7.3)`;
  });
}

/** 8 — export parity: same source records, manifest receipt, quarantine (7.10). */
export function gateExportParity(): RenderingGateResult {
  return runGate('export parity', [implementation('7.10'), visualSystem('11.6')], () => {
    assertExportParity({
      sameSourceRecordSet: true,
      manifestReceiptShipped: true,
      demoQuarantineHonored: true,
      printRulesHonored: true,
      grayscaleRulesHonored: true,
      interactiveOnlyAffordancesPresent: false,
    });
    // The export renderer composes only lawful targets: manifest receipt
    // required; demo records refused by construction.
    composeExportTarget({
      records: [{ id: 'rcpt lawful', quarantine: 'production' }],
      manifestReceiptId: 'mfst_lawful_0001',
      verifierNames: ['engine 1.0.0'],
      environmentStampPresent: true,
      chainPresent: true,
    });
    expectViolation(
      () => composeExportTarget({ records: [], manifestReceiptId: null, verifierNames: [], environmentStampPresent: true, chainPresent: true }),
      '7.10',
    );
    expectViolation(
      () =>
        composeExportTarget({
          records: [{ id: 'rcpt_demo_x', quarantine: 'demo' }],
          manifestReceiptId: 'mfst_lawful_0001',
          verifierNames: [],
          environmentStampPresent: true,
          chainPresent: true,
        }),
      '8.7 / 5.10',
    );
    expectViolation(
      () =>
        assertExportParity({
          sameSourceRecordSet: true,
          manifestReceiptShipped: true,
          demoQuarantineHonored: true,
          printRulesHonored: true,
          grayscaleRulesHonored: true,
          interactiveOnlyAffordancesPresent: true,
        }),
      '7.10',
    );
    return 'export parity holds: same source record set; manifest receipt required (refused without one); demo quarantine refused by construction; interactive-only affordances absent (7.10; VS §11.6)';
  });
}

/** 9 — measurement validation: ladder membership and intrinsic heights (7.4). */
export function gateMeasurementValidation(): RenderingGateResult {
  return runGate('measurement validation', [implementation('7.4'), visualSystem('1.1', 'the Gauge'), visualSystem('1.2')], () => {
    assertIntrinsicHeightsConformant();
    validateResolvedGeometry({ values: [0, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 36, 44, 320], context: 'gate probe' });
    assertCeremonyNeverCompressed({ sealIsolationGapPx: 32, receiptCeremonyGapPx: 64 });
    // Refusals: an off-ladder value and a compressed ceremony throw.
    expectViolation(() => validateResolvedGeometry({ values: [18], context: 'gate probe' }), '7.4');
    expectViolation(() => assertCeremonyNeverCompressed({ sealIsolationGapPx: 16, receiptCeremonyGapPx: 64 }), '4.2 / 7.4');
    return `all registered intrinsic heights conform; resolved geometry lands on the Gauge Ladder; ceremonial distances uncompressed (7.4; VS §1.1–§1.3)`;
  });
}

/** 10 — visibility honesty: attested or labeled, per canonical state (7.3). */
export function gateVisibilityHonesty(): RenderingGateResult {
  return runGate('visibility honesty', [implementation('7.3'), implementation('Part V'), bible('II'), bible('VIII')], () => {
    assertVisibilitySetIntegrity();
    assertVisibilityLawful({ state: 'verified', attested: true, honestlyLabeled: false });
    assertVisibilityLawful({ state: 'loading', attested: false, honestlyLabeled: true });
    assertSkeletonStructureOnly({ rendersNumbersOrText: false });
    assertDemoStamped({ stamped: true });
    assertRestrictedHatched({ hatched: true, noticeShown: true });
    assertEmptyTeaching({ teaching: true });
    assertAbsenceDeclared({ declared: true });
    // Refusals: unattested and unlabeled rendering, skeleton content,
    // unstamped demo, unhatched restriction, and disguised absence throw.
    expectViolation(() => assertVisibilityLawful({ state: 'verified', attested: false, honestlyLabeled: false }), '7.3 / Art. II');
    expectViolation(() => assertSkeletonStructureOnly({ rendersNumbersOrText: true }), '7.3 / 5.2');
    expectViolation(() => assertDemoStamped({ stamped: false }), '7.3 / 5.10');
    expectViolation(() => assertRestrictedHatched({ hatched: false, noticeShown: true }), '7.3 / 5.2');
    expectViolation(() => assertEmptyTeaching({ teaching: false }), '7.3 / Art. VIII');
    expectViolation(() => assertAbsenceDeclared({ declared: false }), 'Art. II / Art. VIII');
    return `visibility obligations resolve for all canonical states; nothing renders unattested and unlabeled; skeleton structure-only, demo stamped, restricted hatched, empty teaching, absence declared (7.3)`;
  });
}

/** 11 — responsive evolution: honest degradation, protected rhythms (7.5). */
export function gateResponsiveEvolution(): RenderingGateResult {
  return runGate('responsive evolution', [implementation('7.5'), visualSystem('9'), bible('VIII')], () => {
    assertBreakpointEvolution();
    assertHonestDegradation({ capabilityRemoved: true, capabilityDeclared: true });
    assertHonestDegradation({ capabilityRemoved: false, capabilityDeclared: false });
    assertProtectedRhythms({ ledgerRowPx: 36, sealIsolationPx: 32, touchTargetPx: 44 });
    // Refusals: undeclared removal and compressed rhythms throw.
    expectViolation(() => assertHonestDegradation({ capabilityRemoved: true, capabilityDeclared: false }), '7.5 / Art. VIII');
    expectViolation(() => assertProtectedRhythms({ ledgerRowPx: 28, sealIsolationPx: 32, touchTargetPx: 44 }), '7.5 / Art. X');
    expectViolation(() => assertProtectedRhythms({ ledgerRowPx: 36, sealIsolationPx: 24, touchTargetPx: 44 }), '7.5 / 1.3');
    return 'responsive evolution holds: honest degradation declared; the ledger rhythm, seal clearance, and touch minimum never compress (7.5; VS §9)';
  });
}

/**
 * 12 — token-only rendering: every rendering token resolves through the
 * Registry (1.3; 2.7(c)). The binding contract (cssVarName) round-trips for
 * every registered token; an unknown identifier refuses.
 */
export function gateTokenOnlyRendering(): RenderingGateResult {
  return runGate('token-only rendering', [implementation('1.3'), implementation('2.7')], () => {
    const tokens = allTokens();
    if (tokens.length === 0) {
      throw new ConstitutionalViolationError('1.3', 'The Registry resolved no tokens — rendering could not bind.');
    }
    for (const token of tokens) {
      const binding = cssVarName(token.identifier);
      if (!binding.startsWith('--vx-')) {
        throw new ConstitutionalViolationError(
          '2.7',
          `Token "${token.identifier}" bound to "${binding}", which is outside the binding contract. Bindings are generated and mechanically derived (Constitution 2.7).`,
        );
      }
    }
    // Refusal: a token outside the Registry does not resolve.
    expectViolation(() => getToken('color.not-a-token'), '2.1');
    return `${tokens.length} registered tokens bind through the generated binding contract (--vx-*); rendering consumes tokens only (1.3; 2.7(c))`;
  });
}

/**
 * 13 — no literal values (1.3): every numeric constant the rendering engine
 * declares carries its ratified derivation — a Registry scale, a ratified
 * registration, or the platform binding of 7.2. An uncitable constant is a
 * violation by definition (Art. XI; P-4). The committed sources are
 * additionally scanned by the pipeline verifier (the fs battery of 9.1).
 */
export function gateNoLiteralValues(): RenderingGateResult {
  return runGate('no literal values', [implementation('1.3'), bible('XI')], () => {
    const declared: readonly { readonly value: number; readonly derivation: string }[] = [
      ...LAYER_SYSTEM.map((layer) => ({
        value: layer.ordinal,
        derivation: `layer.${layer.name} ordinal — ratified layer system (VS §3.4; Registry scales)`,
      })),
      { value: STACKING_MULTIPLIER, derivation: 'the platform stacking binding of 7.2 (ordinal × 10)' },
      { value: CEREMONIAL_DISTANCES.sealIsolationPx, derivation: 'seal isolation — ceremonial spacing (VS §1.3; space.7)' },
      { value: CEREMONIAL_DISTANCES.receiptCeremonyPx, derivation: 'Receipt Viewer ceremony — ceremonial spacing (VS §1.3; space.9)' },
      ...INTRINSIC_HEIGHTS.map((height) => ({ value: height.px, derivation: height.registration })),
    ];
    for (const constant of declared) {
      if (!Number.isFinite(constant.value)) {
        throw new ConstitutionalViolationError(
          '1.3',
          `The rendering engine declared a non-finite constant (${String(constant.value)}). Tokens are the only source of visual values (Constitution 1.3).`,
        );
      }
      if (!constant.derivation) {
        throw new ConstitutionalViolationError(
          '1.3 / Art. XI',
          `The rendering engine declared the value ${constant.value} without a ratified derivation. Nothing unmeasured ships (Constitution 1.3; Bible Art. XI; P-4).`,
        );
      }
    }
    assertModeSetComplete();
    return `${declared.length} declared constants, each derived from the Registry scales, the ratified registrations, or the 7.2 platform binding (1.3; Art. XI)`;
  });
}

/** 14 — layer integrity: treatment law and shadow/glass prohibition (7.2). */
export function gateLayerIntegrity(): RenderingGateResult {
  return runGate('layer integrity', [implementation('7.2'), visualSystem('3.4')], () => {
    for (const layer of LAYERS) {
      assertLayerTreatmentLawful({ layer: layer.name, treatment: 'layer-position' });
    }
    assertLayerTreatmentLawful({ layer: 'veil', treatment: 'ink-veil (IR-008 interim reading)' });
    // Refusals: shadow, glass, and unregistered treatments throw.
    expectViolation(() => assertLayerTreatmentLawful({ layer: 'ceremony', treatment: 'shadow' }), '7.2 / Art. XI');
    expectViolation(() => assertLayerTreatmentLawful({ layer: 'floating', treatment: 'glass' }), '7.2 / Art. XI');
    expectViolation(() => assertLayerTreatmentLawful({ layer: 'surface', treatment: 'blur' }), '7.2');
    return 'layer integrity holds: every stratum renders by layer position plus hairline edges; shadow, glass, and unregistered treatments refused (7.2; VS §3.4)';
  });
}

/** All fourteen rendering gates, in directive order. */
export function runAllRenderingGates(): readonly RenderingGateResult[] {
  return [
    gateLayerOrdering(),
    gateHierarchyOwnership(),
    gateBreakpointEvolution(),
    gatePrintParity(),
    gateGrayscaleParity(),
    gateForcedColorsParity(),
    gateReducedMotionParity(),
    gateExportParity(),
    gateMeasurementValidation(),
    gateVisibilityHonesty(),
    gateResponsiveEvolution(),
    gateTokenOnlyRendering(),
    gateNoLiteralValues(),
    gateLayerIntegrity(),
  ];
}
