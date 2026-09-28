/**
 * Vaerion — State / Public Barrel
 *
 * The constitutional state engine (Part V): the canonical State Matrix,
 * ownership, the lawful transition set and validator, the state machine,
 * honesty enforcement, quarantine and restriction law, the runtime state
 * contracts (provider), and the twelve state gates.
 *
 * Citations: Implementation Constitution Part V; P-4.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

export {
  STATE_DOMAINS,
  VERDICT_DOMAIN_STATES,
  SYSTEM_DOMAIN_STATES,
  STATE_AUTHORITIES,
  STATE_OWNERS,
  STATE_MATRIX,
  domainOf,
  getStateDefinition,
  stateMatrixIds,
  isVerdictDomain,
  type CanonicalState,
  type StateDefinition,
  type StateDomain,
  type StateAuthority,
  type StateOwner,
  type SystemDomainState,
  type VerdictDomainState,
} from './matrix';

export {
  AUTHORITIES,
  ownerOf,
  owningAuthorityOf,
  assertDispatchOwnership,
  type AuthorityIdentity,
} from './ownership';

export {
  STATE_EVENTS,
  STATE_EVENT_LABELS,
  LAWFUL_TRANSITIONS,
  resolveTransition,
  assertTransitionTableIntegrity,
  type ResolvedTransition,
  type StateEvent,
  type TransitionPayload,
  type TransitionRow,
} from './transitions';

export {
  createInitialSnapshot,
  dispatchStateEvent,
  receiveVerdict,
  type Dispatcher,
  type StateHistoryEntry,
  type StateMachineOptions,
  type StateSnapshot,
} from './machine';

export {
  assertVerdictAuthority,
  assertNoOptimisticRender,
  assertNoAnticipatedOutcome,
  assertRealMeasurement,
  HONESTY_CITATIONS,
  type VerdictAuthorityEvidence,
} from './honesty';

export {
  assertNoCommingling,
  assertExportAllowed,
  assertQuarantineFlagPresent,
  assertRestrictionHonest,
  resolveRecordState,
  QUARANTINE_CITATIONS,
  RESTRICTION_CITATIONS,
  type QuarantineFlag,
  type StateRecord,
} from './quarantine';

export {
  StateAuthorityProvider,
  CHROME_SCOPE_ID,
  useScopeState,
  useScopeDispatch,
  useScopeRegistration,
  useSubtreeDeclaration,
  resolveEffectiveState,
  type ScopeDeclaration,
  type ScopeToken,
  type StateEngineApi,
} from './context';

export {
  runAllStateGates,
  assertMatrixIntegrity,
  gateCancellationLegality,
  gateChainIntegrity,
  gateDemoQuarantine,
  gateHonestyEnforcement,
  gateInheritanceLegality,
  gateOfflineRecovery,
  gateOwnershipLegality,
  gatePropagationLegality,
  gateRecoveryLegality,
  gateRestrictedEvidence,
  gateTransitionLegality,
  gateVerdictAuthority,
  type StateGateResult,
} from './gates';
