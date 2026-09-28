/**
 * Vaerion — Interaction / Public Barrel
 *
 * The interaction engine (Part VI): the command registry, keyboard / pointer
 * / gesture / focus engines, intent declaration and the confirmation ladder,
 * hold-to-affirm, the undo system, act resolution, latency contracts, the
 * announcement system, the Lens interaction engine, the command dispatcher,
 * the interaction copy module, and the fifteen interaction gates.
 *
 * Citations: Implementation Constitution Part VI; P-4.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

export {
  CALIPER_VERBS,
  FRICTION_CLASSES,
  RESOLUTION_KINDS,
  COMMAND_REGISTRY,
  getCommand,
  routeInput,
  assertCommandLawful,
  assertCommandRegistryIntegrity,
  type CaliperVerb,
  type CommandRegistration,
  type FrictionClass,
  type ResolutionKind,
} from './commands';

export {
  CANONICAL_KEY_MAP,
  CONSTITUTIONAL_KEYS,
  resolveKeyEvent,
  assertKeyNotShadowed,
  assertKeyboardReachability,
  KEYBOARD_CITATIONS,
  type KeyEventDescriptor,
} from './keys';

export {
  HOVER_GRANTS,
  POINTER_HOLD_RESERVATIONS,
  GESTURES,
  assertHoverLawful,
  assertPointerHoldLawful,
  assertPointerNeverSolePath,
  assertGestureLawful,
  assertScrubPairing,
  INTERACTION_HOLD_AFFIRM_MS,
  INTERACTION_HOLD_CITATIONS,
  POINTER_CITATIONS,
  GESTURE_CITATIONS,
  type Gesture,
  type HoverGrant,
  type PointerHoldReservation,
} from './pointer';

export {
  assertSingleFocusOwner,
  assertFocusTreatmentLawful,
  assertFocusRestored,
  assertDialogTrapsFocus,
  FOCUS_CITATIONS,
  type FocusOwnership,
  type FocusRestoration,
} from './focus';

export {
  assertConfirmationLawful,
  assertLadderIntegrity,
  LADDER_CITATIONS,
  type IntentDeclaration,
} from './confirm';

export {
  HOLD_DURATION_MS,
  HOLD_PATHS,
  completeHold,
  assertPathEquivalence,
  HOLD_CITATIONS,
  type HoldPath,
  type HoldState,
} from './hold';

export {
  UNDO_WINDOW_MS,
  UNDO_WINDOW_CITATIONS,
  isUndoWindowOpen,
  executeUndo,
  UNDO_RETURN_COPY_ID,
  UNDO_EXECUTED_COPY_ID,
  UNDO_CITATIONS,
  type UndoableAct,
} from './undo';

export {
  assertResolution,
  assertLifecycleAdvance,
  INTERACTION_LIFECYCLE,
  RESOLUTION_CITATIONS,
  type ActResolution,
  type InteractionLifecycleStage,
  type ReceiptRef,
} from './receipts';

export {
  ACKNOWLEDGMENT_BOUND_MS,
  GAUGE_THRESHOLD_MS,
  RETURN_LIFE_S,
  assertAcknowledgment,
  assertGaugeDelayLawful,
  assertReturnLifeLawful,
  assertNavigationWithoutTransition,
  LATENCY_CITATIONS,
} from './latency';

export {
  assertAnnouncementLawful,
  assertBatchWindowLawful,
  ANNOUNCEMENT_CITATIONS,
  ANNOUNCEMENT_BATCH_CITATIONS,
  type AnnouncementPoliteness,
  type AnnouncementRequest,
  type AnnouncementVoice,
} from './announce';

export {
  LENS_ACTIVATION_PATHS,
  assertActivationLawful,
  assertLensFocusLaw,
  assertLensHonorsRestrictions,
  LENS_CITATIONS,
  type LensActivation,
  type LensActivationPath,
} from './lens';

export {
  assertDispatchLawful,
  assertExecutionEventLawful,
  cancelAct,
  failureResolution,
  DISPATCHER_CITATIONS,
  type DispatchedAct,
} from './dispatcher';

export { INTERACTION_COPY, interactionCopy, type InteractionCopyEntry, type InteractionVoice } from './copy';

export {
  runAllInteractionGates,
  gateAccessibilityAnnouncements,
  gateCommandRegistryIntegrity,
  gateDialogTrapping,
  gateEscapeRestoration,
  gateFailureReceipts,
  gateFocusOwnership,
  gateHoldToAffirmTiming,
  gateInteractionHonesty,
  gateKeyboardReachability,
  gateLatencyContracts,
  gateLensInteraction,
  gateReceiptGeneration,
  gateReturnGeneration,
  gateShortcutConflicts,
  gateUndoContracts,
  type InteractionGateResult,
} from './gates';
