/**
 * Vaerion — Rendering / Public Barrel
 *
 * The constitutional rendering engine (Part VII): the ordinal layer system,
 * the surface hierarchy (strata), the visibility contracts, measurement
 * validation, responsive evolution, the rendering modes and their
 * renderers, the rendering pipeline, the rendering target binding, and the
 * fourteen rendering gates.
 *
 * The Stage 4 skeletons (skeletons.tsx) and the rendering stylesheet
 * (rendering.css) remain the canonical skeleton layer; the Stage 7 modules
 * extend the rendering root without altering ratified behavior.
 *
 * Citations: Implementation Constitution Part VII; P-4.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

export {
  LAYERS,
  resolveLayer,
  layerOrdinal,
  layerStackingValue,
  STACKING_MULTIPLIER,
  LAWFUL_LAYER_TREATMENTS,
  assertLayerOrdering,
  assertLayerTreatmentLawful,
  LAYER_CITATIONS,
  type LayerDefinition,
  type LayerName,
  type LayerTreatment,
} from './layers';

export {
  STRATA,
  STRATUM_CONTRACTS,
  assertStratumResolution,
  assertStratumContainment,
  assertStratumScope,
  assertNoRestyle,
  assertChromeAuthoredOnce,
  STRATA_CITATIONS,
  type StratumName,
  type StratumContract,
} from './strata';

export {
  VISIBILITY_OBLIGATIONS,
  visibilityObligationOf,
  assertVisibilityLawful,
  assertSkeletonStructureOnly,
  assertDemoStamped,
  assertRestrictedHatched,
  assertEmptyTeaching,
  assertAbsenceDeclared,
  assertVisibilitySetIntegrity,
  VISIBILITY_CITATIONS,
  type VisibilityObligation,
} from './visibility';

export {
  GAUGE_BASE_PX,
  GAUGE_REGISTERED_HALF_STEP_PX,
  isOnGaugeLadder,
  isOnGaugeBaseline,
  INTRINSIC_HEIGHTS,
  CEREMONIAL_DISTANCES,
  assertIntrinsicHeightsConformant,
  validateResolvedGeometry,
  assertCeremonyNeverCompressed,
  MEASUREMENT_CITATIONS,
  type IntrinsicHeight,
} from './measurement';

export {
  BREAKPOINTS,
  BREAKPOINT_CONTRACTS,
  assertBreakpointEvolution,
  assertMarginRailAtUltraWideOnly,
  assertHonestDegradation,
  assertProtectedRhythms,
  assertNoPlatformRedesign,
  RESPONSIVE_CITATIONS,
  type BreakpointName,
  type BreakpointContract,
} from './responsive';

export {
  RENDERING_MODES,
  MODE_CONTRACTS,
  modeContractOf,
  REDUCED_MOTION_CONTRACT,
  VERDICT_SHAPE_IDENTITY,
  assertModeSetComplete,
  assertPrintParity,
  assertGrayscaleParity,
  assertForcedColorsParity,
  assertReducedMotionParity,
  composeExportTarget,
  assertExportParity,
  assertRenderingParity,
  MODES_CITATIONS,
  type RenderingMode,
  type ModeContract,
  type ExportTargetPlan,
} from './modes';

export {
  composeRenderingPlan,
  assertPlanConformant,
  assertNothingOutsideContracts,
  ELEVATED_PRIMITIVES,
  PIPELINE_CITATIONS,
  type RenderingPlanNode,
} from './pipeline';

export { RenderingTarget, RENDERING_TARGET_CITATIONS, type RenderingTargetProps } from './target';

export { RENDERING_MANIFEST, type RenderingModuleManifest } from './manifest';

export {
  runAllRenderingGates,
  gateLayerOrdering,
  gateHierarchyOwnership,
  gateBreakpointEvolution,
  gatePrintParity,
  gateGrayscaleParity,
  gateForcedColorsParity,
  gateReducedMotionParity,
  gateExportParity,
  gateMeasurementValidation,
  gateVisibilityHonesty,
  gateResponsiveEvolution,
  gateTokenOnlyRendering,
  gateNoLiteralValues,
  gateLayerIntegrity,
  type RenderingGateResult,
} from './gates';

export { Shell, ConsoleSkeleton, DocumentSkeleton, StatusSkeleton, SKELETON_CITATIONS, type SkeletonKind, type ShellProps } from './skeletons';
