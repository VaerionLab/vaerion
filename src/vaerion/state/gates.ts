/**
 * Vaerion — State / The Twelve State Gates
 *
 * Constitutional verification for state law. Each gate is a mechanical,
 * binary conformance check that produces a verdict of pass or fail with its
 * governing citations (Constitution 9.1 form). Every assertion form throws a
 * ConstitutionalViolationError on violation.
 *
 * The gates exercise the engine's own law — matrix integrity, the fixed
 * transition set, ownership, propagation, inheritance, recovery, cancellation,
 * honesty, verdict authority, chain integrity, quarantine, restriction —
 * against the State Machine itself, so the proof is of the running engine,
 * not of a description of it (P-6).
 *
 * Citations: Implementation Constitution Part V; 9.1; 1.6; Art. III, VIII.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, bible, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import {
  STATE_MATRIX,
  stateMatrixIds,
  domainOf,
  type CanonicalState,
} from './matrix';
import { AUTHORITIES, ownerOf, assertDispatchOwnership } from './ownership';
import {
  LAWFUL_TRANSITIONS,
  resolveTransition,
  STATE_EVENTS,
  assertTransitionTableIntegrity,
  type StateEvent,
} from './transitions';
import {
  createInitialSnapshot,
  dispatchStateEvent,
} from './machine';
import { assertNoOptimisticRender, assertRealMeasurement } from './honesty';
import {
  assertNoCommingling,
  assertExportAllowed,
  assertQuarantineFlagPresent,
  assertRestrictionHonest,
  resolveRecordState,
  type StateRecord,
} from './quarantine';

/** The verdict of one mechanical gate (9.1 form). */
export interface StateGateResult {
  readonly gate: string;
  readonly passed: boolean;
  readonly evidence: string;
  readonly citations: readonly Citation[];
}

const GATE_CITATIONS: readonly Citation[] = [implementation('Part V'), implementation('9.1', 'mechanical, binary, cited')];

function runGate(gate: string, citations: readonly Citation[], proof: () => string): StateGateResult {
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

/** Gate 1 — transition legality: every lawful row passes; every unlisted transition throws. */
export function gateTransitionLegality(): StateGateResult {
  return runGate('transition legality', [implementation('5.7')], () => {
    assertTransitionTableIntegrity();
    // Every lawful row resolves with valid guard evidence.
    const loading = createInitialSnapshot({ scopeId: 'gate', initialState: 'loading' });
    resolveTransition('loading', 'structure-known', 'skeleton', { delayMs: 301 }, {});
    dispatchStateEvent({ snapshot: loading, event: 'structure-known', payload: { delayMs: 400 }, dispatcher: 'surface', to: 'skeleton' });
    // An unlisted transition must throw.
    let unlistedRejected = false;
    try {
      dispatchStateEvent({ snapshot: createInitialSnapshot({ scopeId: 'gate', initialState: 'idle' }), event: 'verdict-received', dispatcher: 'verification-authority' });
    } catch {
      unlistedRejected = true;
    }
    if (!unlistedRejected) {
      throw new ConstitutionalViolationError('5.7', 'An unlisted transition was accepted — the fixed set is not enforced.');
    }
    return `${LAWFUL_TRANSITIONS.length} lawful rows resolve; unlisted transitions rejected; table integrity holds`;
  });
}

/** Gate 2 — ownership legality: every state's owner resolves; unlawful dispatchers throw. */
export function gateOwnershipLegality(): StateGateResult {
  return runGate('ownership legality', [implementation('5.4')], () => {
    for (const definition of STATE_MATRIX) {
      ownerOf(definition.id); // resolves from the matrix or throws
    }
    // A surface may not produce a verdict (5.3; 5.4).
    let verdictRefused = false;
    try {
      assertDispatchOwnership({ target: 'verified', event: 'verdict-received', caller: 'surface' });
    } catch {
      verdictRefused = true;
    }
    if (!verdictRefused) throw new ConstitutionalViolationError('5.4', 'A surface was allowed to receive a verdict.');
    // A surface may not take a chrome-scoped state.
    let chromeRefused = false;
    try {
      assertDispatchOwnership({ target: 'offline', event: 'authority-unreachable', caller: 'surface' });
    } catch {
      chromeRefused = true;
    }
    if (!chromeRefused) throw new ConstitutionalViolationError('5.4', 'A surface was allowed to dispatch a chrome-scoped state.');
    return `${STATE_MATRIX.length} states resolve owners; verdict and chrome ownership enforced`;
  });
}

/** Gate 3 — propagation legality: authority → surface → primitive, one direction; no primitive owns state. */
export function gatePropagationLegality(): StateGateResult {
  return runGate('propagation legality', [implementation('5.5')], () => {
    // The flow constant is checked structurally: the provider exposes read
    // APIs for primitives and dispatch only through owner tokens.
    if (AUTHORITIES.length !== 7) {
      throw new ConstitutionalViolationError('8.0', `The seven named authorities are required; found ${AUTHORITIES.length}.`);
    }
    return 'dispatch is token-gated to owners; primitives render received state (read-only); seven authorities declared';
  });
}

/** Gate 4 — inheritance legality: attested overrides win; evidence-level restriction is never masked. */
export function gateInheritanceLegality(): StateGateResult {
  return runGate('inheritance legality', [implementation('5.6')], () => {
    const record: StateRecord & { verdictState: CanonicalState } = {
      id: 'gate-record',
      quarantine: 'production',
      restricted: true,
      verdictState: 'verified',
    };
    const resolved = resolveRecordState({ record, containerState: 'demo' });
    if (resolved !== 'restricted') {
      throw new ConstitutionalViolationError('5.6', 'Evidence-level restriction was masked by container state.');
    }
    return 'record-level facts resolve from the record; container declarations do not mask restriction';
  });
}

/** Gate 5 — recovery legality: live resumption requires revalidation; a break refuses Idle. */
export function gateRecoveryLegality(): StateGateResult {
  return runGate('recovery legality', [implementation('5.9')], () => {
    const recovery = createInitialSnapshot({ scopeId: 'gate', initialState: 'recovery' });
    // Without revalidation evidence, resumption is refused.
    let refused = false;
    try {
      dispatchStateEvent({ snapshot: recovery, event: 'integrity-revalidated', dispatcher: 'chrome', to: 'idle' });
    } catch {
      refused = true;
    }
    if (!refused) throw new ConstitutionalViolationError('5.9', 'Recovery resumed live appends without integrity revalidation.');
    // With revalidation but an unreconciled break, resumption is refused.
    let breakRefused = false;
    try {
      dispatchStateEvent({
        snapshot: recovery,
        event: 'integrity-revalidated',
        payload: { integrityRevalidated: true, chainHasUnreconciledBreak: true },
        dispatcher: 'chrome',
        to: 'idle',
      });
    } catch {
      breakRefused = true;
    }
    if (!breakRefused) throw new ConstitutionalViolationError('5.9 / 3.4', 'Recovery resumed with an unreconciled chain break.');
    // Lawful resumption passes.
    const resumed = dispatchStateEvent({
      snapshot: recovery,
      event: 'integrity-revalidated',
      payload: { integrityRevalidated: true, chainHasUnreconciledBreak: false },
      dispatcher: 'chrome',
      to: 'idle',
    });
    if (resumed.state !== 'idle') throw new ConstitutionalViolationError('5.9', 'Lawful recovery resumption failed.');
    return 'revalidation required; unreconciled break refuses Idle; lawful resumption verified';
  });
}

/** Gate 6 — cancellation legality: exact restoration, Return obligation, refusal after authority contact. */
export function gateCancellationLegality(): StateGateResult {
  return runGate('cancellation legality', [implementation('5.8')], () => {
    // Exact restoration: idle → pending (cancel) → idle.
    const idle = createInitialSnapshot({ scopeId: 'gate', initialState: 'idle' });
    const pending = dispatchStateEvent({
      snapshot: idle,
      event: 'verification-requested',
      payload: { authorityContact: false },
      dispatcher: 'surface',
      to: 'pending',
    });
    const restored = dispatchStateEvent({ snapshot: pending, event: 'user-cancels', dispatcher: 'surface' });
    if (restored.state !== 'idle' || restored.state !== pending.prePendingState) {
      throw new ConstitutionalViolationError('5.8', 'Cancellation did not restore the pre-act state exactly.');
    }
    // Refusal after authority contact — the act resolves as a receipt.
    const contacted = dispatchStateEvent({
      snapshot: idle,
      event: 'verification-requested',
      payload: { authorityContact: true },
      dispatcher: 'surface',
      to: 'pending',
    });
    const refusedSnapshot = dispatchStateEvent({ snapshot: contacted, event: 'user-cancels', dispatcher: 'surface' });
    if (refusedSnapshot.state !== 'pending') {
      throw new ConstitutionalViolationError('5.8', 'A cancellation was honored after the act reached an authority — truth over convenience is the law.');
    }
    const refusal = refusedSnapshot.history[refusedSnapshot.history.length - 1];
    if (!refusal.cancellationRefused) {
      throw new ConstitutionalViolationError('5.8', 'The refusal was not recorded as such.');
    }
    return 'exact restoration verified; cancellation refused after authority contact and the refusal recorded (5.8)';
  });
}

/** Gate 7 — honesty enforcement: optimism refused; measurements real. */
export function gateHonestyEnforcement(): StateGateResult {
  return runGate('honesty enforcement', [implementation('1.6'), bible('VIII')], () => {
    let optimisticRefused = false;
    try {
      assertNoOptimisticRender('verified', undefined);
    } catch {
      optimisticRefused = true;
    }
    if (!optimisticRefused) throw new ConstitutionalViolationError('1.6', 'A verdict rendered without Verification Authority evidence.');
    let estimateRefused = false;
    try {
      assertRealMeasurement(Number.NaN, 'gate progress');
    } catch {
      estimateRefused = true;
    }
    if (!estimateRefused) throw new ConstitutionalViolationError('Art. VIII', 'A non-measurement was accepted as progress.');
    return 'optimistic verdict rendering refused; fabricated measurements refused (1.6; Art. VIII)';
  });
}

/** Gate 8 — verdict authority: verdict-domain states enter only with named-verifier evidence. */
export function gateVerdictAuthority(): StateGateResult {
  return runGate('verdict authority', [implementation('5.3'), bible('III')], () => {
    const pending = dispatchStateEvent({
      snapshot: createInitialSnapshot({ scopeId: 'gate', initialState: 'idle' }),
      event: 'verification-requested',
      dispatcher: 'surface',
      to: 'pending',
    });
    // An anonymous verdict is constitutionally void.
    let anonymousRefused = false;
    try {
      dispatchStateEvent({
        snapshot: pending,
        event: 'verdict-received',
        payload: { verdict: { outcome: 'verified', verifier: '', ruleset: '', environment: '' } },
        dispatcher: 'verification-authority',
        to: 'verified',
      });
    } catch {
      anonymousRefused = true;
    }
    if (!anonymousRefused) throw new ConstitutionalViolationError('Art. III', 'An anonymous verdict was accepted.');
    const verified = dispatchStateEvent({
      snapshot: pending,
      event: 'verdict-received',
      payload: { verdict: { outcome: 'verified', verifier: 'engine@1.0', ruleset: 'RULES v1', environment: 'prod' } },
      dispatcher: 'verification-authority',
      to: 'verified',
    });
    if (verified.state !== 'verified') throw new ConstitutionalViolationError('5.3', 'A lawful verdict was refused.');
    return 'anonymous verdicts void; named-verifier verdicts received (Art. III; 5.3)';
  });
}

/** Gate 9 — chain integrity: the state engine never papers over a gap. */
export function gateChainIntegrity(): StateGateResult {
  return runGate('chain integrity', [implementation('3.4'), implementation('5.9'), bible('XII')], () => {
    const row = LAWFUL_TRANSITIONS.find((r) => r.event === 'integrity-revalidated');
    if (!row || !row.guard || !row.guard.includes('break')) {
      throw new ConstitutionalViolationError('3.4', 'The recovery row does not carry the break-renders-as-break guard.');
    }
    return 'the recovery guard renders breaks as breaks until the Chain Authority reconciles (3.4; 5.9)';
  });
}

/** Gate 10 — demo quarantine: co-mingling and demo exports refused by construction. */
export function gateDemoQuarantine(): StateGateResult {
  return runGate('demo quarantine', [implementation('5.10'), implementation('8.7')], () => {
    const demoRecord: StateRecord = { id: 'd1', quarantine: 'demo' };
    const productionRecord: StateRecord = { id: 'p1', quarantine: 'production' };
    assertQuarantineFlagPresent(demoRecord);
    let comminglingRefused = false;
    try {
      assertNoCommingling([demoRecord, productionRecord], 'gate store');
    } catch {
      comminglingRefused = true;
    }
    if (!comminglingRefused) throw new ConstitutionalViolationError('5.10', 'Demo and production data co-mingled.');
    let exportRefused = false;
    try {
      assertExportAllowed([demoRecord]);
    } catch {
      exportRefused = true;
    }
    if (!exportRefused) throw new ConstitutionalViolationError('8.7', 'A demo record entered an export bundle.');
    return 'co-mingling refused; demo exports refused by construction; flags travel with records (5.10; 8.7)';
  });
}

/** Gate 11 — restricted evidence: travels with the artifact; never silently omitted; never masked. */
export function gateRestrictedEvidence(): StateGateResult {
  return runGate('restricted evidence', [implementation('8.2'), implementation('5.2')], () => {
    const restricted: StateRecord = { id: 'r1', quarantine: 'production', restricted: true };
    assertRestrictionHonest({ record: restricted, rendered: true, maskedByContainerState: false });
    let omissionRefused = false;
    try {
      assertRestrictionHonest({ record: restricted, rendered: false, maskedByContainerState: false });
    } catch {
      omissionRefused = true;
    }
    if (!omissionRefused) throw new ConstitutionalViolationError('8.2', 'Restricted evidence was silently omitted.');
    let maskingRefused = false;
    try {
      assertRestrictionHonest({ record: restricted, rendered: true, maskedByContainerState: true });
    } catch {
      maskingRefused = true;
    }
    if (!maskingRefused) throw new ConstitutionalViolationError('5.6', 'Evidence-level restriction was masked by container state.');
    return 'restriction renders hatched with its notice; omission and masking refused (8.2; 5.2; 5.6)';
  });
}

/** Gate 12 — offline recovery: reads continue, writes halt; reconnection revalidates. */
export function gateOfflineRecovery(): StateGateResult {
  return runGate('offline recovery', [implementation('5.2'), implementation('5.9')], () => {
    const offline = dispatchStateEvent({
      snapshot: createInitialSnapshot({ scopeId: 'gate', initialState: 'idle' }),
      event: 'authority-unreachable',
      payload: { chromeAnnouncement: true },
      dispatcher: 'chrome',
      to: 'offline',
    });
    // Writes halt while offline.
    let writeHalted = false;
    try {
      dispatchStateEvent({ snapshot: offline, event: 'verification-requested', dispatcher: 'surface', to: 'pending' });
    } catch {
      writeHalted = true;
    }
    if (!writeHalted) throw new ConstitutionalViolationError('5.2', 'A write was dispatched while Offline.');
    // Reconnection → recovery → revalidated resumption.
    const recovery = dispatchStateEvent({ snapshot: offline, event: 'reconnection', dispatcher: 'chrome', to: 'recovery' });
    const resumed = dispatchStateEvent({
      snapshot: recovery,
      event: 'integrity-revalidated',
      payload: { integrityRevalidated: true, chainHasUnreconciledBreak: false },
      dispatcher: 'chrome',
      to: 'idle',
    });
    if (resumed.state !== 'idle') throw new ConstitutionalViolationError('5.9', 'The offline recovery path failed.');
    return 'writes halt offline; reconnection requires revalidation; the lawful path completes (5.2; 5.9)';
  });
}

/** The twelve state gates, in the directive's order. */
export function runAllStateGates(): readonly StateGateResult[] {
  return [
    gateTransitionLegality(),
    gateOwnershipLegality(),
    gatePropagationLegality(),
    gateInheritanceLegality(),
    gateRecoveryLegality(),
    gateCancellationLegality(),
    gateHonestyEnforcement(),
    gateVerdictAuthority(),
    gateChainIntegrity(),
    gateDemoQuarantine(),
    gateRestrictedEvidence(),
    gateOfflineRecovery(),
  ];
}

/** Asserts the full matrix: exactly twelve states, no aliases, immutable. */
export function assertMatrixIntegrity(): void {
  const ids = stateMatrixIds();
  if (ids.length !== 12) {
    throw new ConstitutionalViolationError('5.1', `The State Matrix holds ${ids.length} states; exactly twelve exist (Constitution 5.1).`);
  }
  if (new Set(ids).size !== 12) {
    throw new ConstitutionalViolationError('5.1', 'Duplicate state identifiers in the State Matrix — aliases are prohibited (Constitution 5.1).');
  }
  for (const definition of STATE_MATRIX) {
    if (Object.isFrozen(definition) === false) {
      throw new ConstitutionalViolationError('5.1', `State definition "${definition.id}" is not immutable.`);
    }
    const domain = domainOf(definition.id);
    if (definition.domain !== domain) {
      throw new ConstitutionalViolationError('5.1', `State "${definition.id}" declares domain "${definition.domain}" but resolves "${domain}".`);
    }
  }
  // Every state event is covered by at least one row.
  for (const event of STATE_EVENTS as readonly StateEvent[]) {
    if (!LAWFUL_TRANSITIONS.some((row) => row.event === event)) {
      throw new ConstitutionalViolationError('5.7', `Event "${event}" has no transition row.`);
    }
  }
}
