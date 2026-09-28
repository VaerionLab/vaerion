/**
 * Vaerion — Testing / Visual Regression (public barrel)
 *
 * The visual regression engine (order Deliverable 3): meaning-based
 * structural verification across registry token usage, primitive geometry,
 * surface composition, layer ordering, measurement contracts, responsive
 * evolution, seal integrity, and lens behavior — with the forbidden list
 * (pixel matching without meaning; ignoring constitutional structure;
 * approving drift manually) enforced by construction.
 *
 * Citations: Implementation Constitution 9.2, 9.3, 9.8, 9.10; order
 * Deliverable 3.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

export {
  runVisualVerification,
  assertVisualStructure,
  composeVisualInvariants,
  verifyRegistryTokenUsage,
  verifyPrimitiveGeometry,
  verifySurfaceComposition,
  verifyLayerOrdering,
  verifyMeasurementContracts,
  verifyResponsiveEvolution,
  verifySealIntegrity,
  verifyLensBehavior,
  VISUAL_ENGINE_CITATIONS,
  type VisualAreaResult,
  type VisualRegressionReport,
} from './engine';
