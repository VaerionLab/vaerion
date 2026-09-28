/**
 * Vaerion — State / The Constitutional State Machine
 *
 * A per-scope state machine over the twelve canonical states. Every dispatch
 * is validated against the fixed lawful transition set (5.7) before it
 * happens; snapshots are immutable — a transition produces a new snapshot and
 * the history is append-only, identical in discipline to the ledger the
 * product serves (8.1; 10.4).
 *
 * Runtime state contracts (Part V):
 *   - immutable state definitions (5.1 — the matrix is frozen);
 *   - no local state machine bypasses constitutional ownership (5.4; 5.5):
 *     the machine validates dispatcher ownership before every dispatch;
 *   - cancellation restores the pre-act state exactly and is refused once an
 *     act has reached an authority (5.8) — truth over convenience;
 *   - offline halts writes; reads continue (5.2);
 *   - a Failure Receipt id rides every Error (5.2; 5.7).
 *
 * Citations: Implementation Constitution Part V; 1.6; Art. VIII.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import {
  getStateDefinition,
  isVerdictDomain,
  type CanonicalState,
} from './matrix';
import { assertDispatchOwnership } from './ownership';
import {
  resolveTransition,
  STATE_EVENT_LABELS,
  type StateEvent,
  type TransitionPayload,
} from './transitions';

/** The lawful dispatchers, per Constitution 5.4. */
export type Dispatcher = 'verification-authority' | 'chain-authority' | 'surface' | 'chrome';

/** One immutable entry in the append-only transition history. */
export interface StateHistoryEntry {
  readonly seq: number;
  readonly from: CanonicalState | null;
  readonly event: StateEvent;
  readonly eventLabel: string;
  readonly to: CanonicalState;
  /** The receipt id carried by 'act-fails' (Failure Receipt — 5.2; 5.7). */
  readonly failureReceiptId?: string;
  /** The Return obligation of a cancellation (5.8). */
  readonly cancelledWithReturn?: boolean;
  /** Cancellation refused because the act already reached an authority (5.8). */
  readonly cancellationRefused?: boolean;
  readonly citations: readonly Citation[];
}

/** An immutable snapshot of one scope's state (runtime state contracts). */
export interface StateSnapshot {
  readonly scopeId: string;
  readonly state: CanonicalState;
  /** The pre-act state — recorded on entering Pending for exact restore (5.8). */
  readonly prePendingState: CanonicalState | null;
  /** Whether the in-flight act has reached an authority (5.8 cancellation law). */
  readonly actReachedAuthority: boolean;
  /** The active failure, kept rendered until superseded (5.7; Art. VIII). */
  readonly activeFailureReceiptId: string | null;
  /** The retry-in-flight flag: a failure remains rendered while a retry runs. */
  readonly retryInFlight: boolean;
  readonly history: readonly StateHistoryEntry[];
  /** Monotonic sequence of the snapshot. */
  readonly revision: number;
}

export interface StateMachineOptions {
  readonly scopeId: string;
  readonly initialState: CanonicalState;
  /**
   * Monotonic clock for measurable delays (the structure-known guard). The
   * engine never reads a wall clock implicitly; tooling injects a deterministic
   * clock (P-6 — two teams produce identical results).
   */
  readonly clock?: () => number;
}

const MACHINE_CITATIONS: readonly Citation[] = [
  implementation('Part V', 'state architecture'),
  implementation('5.7', 'the lawful transition set is fixed'),
  implementation('5.8', 'cancellation'),
];

export function createInitialSnapshot(options: StateMachineOptions): StateSnapshot {
  // The initial state must itself be canonical (5.1).
  getStateDefinition(options.initialState);
  return Object.freeze({
    scopeId: options.scopeId,
    state: options.initialState,
    prePendingState: null,
    actReachedAuthority: false,
    activeFailureReceiptId: null,
    retryInFlight: false,
    history: Object.freeze([]),
    revision: 0,
  });
}

/**
 * Dispatches one event. Throws ConstitutionalViolationError on any unlawful
 * transition, failed guard, ownership breach, or offline write halt. Returns
 * the next immutable snapshot — the current snapshot is never mutated.
 */
export function dispatchStateEvent(params: {
  readonly snapshot: StateSnapshot;
  readonly event: StateEvent;
  readonly payload?: TransitionPayload;
  /** Who is dispatching — validated against ownership law (5.4; 5.5). */
  readonly dispatcher: Dispatcher;
  /** Explicit lawful target, required where the table offers more than one. */
  readonly to?: CanonicalState;
}): StateSnapshot {
  const { snapshot, event, dispatcher } = params;
  const payload: TransitionPayload = params.payload ?? {};
  const from = snapshot.state;

  // Offline halts writes; reads continue (5.2). A state transition of a
  // running act is a write against an authority; only chrome may move a scope
  // while offline (the chrome announcement and reconnection rows).
  if (from === 'offline') {
    const writeEvents: StateEvent[] = ['work-issued', 'verification-requested', 'verdict-received', 'retry'];
    if (writeEvents.includes(event) && dispatcher !== 'chrome') {
      throw new ConstitutionalViolationError(
        '5.2',
        `Offline halts writes (Constitution 5.2): "${STATE_EVENT_LABELS[event]}" was dispatched to scope "${snapshot.scopeId}" while Offline. Reads continue; writes halt until reconnection and revalidation (5.9).`,
      );
    }
  }

  // The cancellation row: refused once the act has reached an authority (5.8).
  if (event === 'user-cancels' && snapshot.actReachedAuthority) {
    // The act resolves as a receipt — truth over convenience (5.8). The
    // machine records the refusal; the Pending state stands until the
    // authority returns the verdict.
    const refusalEntry: StateHistoryEntry = Object.freeze({
      seq: snapshot.revision + 1,
      from,
      event,
      eventLabel: STATE_EVENT_LABELS[event],
      to: from,
      cancellationRefused: true,
      citations: [implementation('5.8', 'cancellation refused — the act already reached an authority; it resolves as a receipt')],
    });
    return Object.freeze({
      ...snapshot,
      revision: snapshot.revision + 1,
      history: Object.freeze([...snapshot.history, refusalEntry]),
    });
  }

  const resolved = resolveTransition(
    from,
    event,
    params.to ?? null,
    payload,
    { prePendingState: snapshot.prePendingState ?? undefined },
  );

  // Ownership legality on the resolved target, before the snapshot exists
  // (5.4; 5.5 — no sibling mutation, no primitive owns state).
  assertDispatchOwnership({ target: resolved.to, event, caller: dispatcher });

  let nextPrePending = snapshot.prePendingState;
  let nextActReachedAuthority = snapshot.actReachedAuthority;
  let nextFailureReceiptId = snapshot.activeFailureReceiptId;
  let nextRetryInFlight = snapshot.retryInFlight;

  switch (event) {
    case 'verification-requested':
      // Record the pre-act state for exact restoration (5.8) and whether the
      // act has reached an authority (cancellation law).
      nextPrePending = from;
      nextActReachedAuthority = payload.authorityContact === true;
      break;
    case 'user-cancels':
      // Exact restoration; a Return naming the cancellation is issued by the
      // interaction layer (5.8; 6.5). No partial artifacts exist: the history
      // entry records the cancellation, the pre-act state is restored.
      nextPrePending = null;
      nextActReachedAuthority = false;
      break;
    case 'verdict-received':
      nextPrePending = null;
      nextActReachedAuthority = false;
      nextRetryInFlight = false;
      break;
    case 'retry':
      // Prior failure remains rendered until superseded (5.7; Art. VIII).
      nextRetryInFlight = true;
      break;
    case 'act-fails':
      nextFailureReceiptId = payload.failureReceiptId ?? null;
      break;
    case 'integrity-revalidated':
      nextRetryInFlight = false;
      break;
    default:
      break;
  }

  const entry: StateHistoryEntry = Object.freeze({
    seq: snapshot.revision + 1,
    from,
    event,
    eventLabel: STATE_EVENT_LABELS[event],
    to: resolved.to,
    failureReceiptId: event === 'act-fails' ? payload.failureReceiptId : undefined,
    cancelledWithReturn: event === 'user-cancels' ? true : undefined,
    citations: resolved.citations,
  });

  return Object.freeze({
    scopeId: snapshot.scopeId,
    state: resolved.to,
    prePendingState: nextPrePending,
    actReachedAuthority: nextActReachedAuthority,
    activeFailureReceiptId: nextFailureReceiptId,
    retryInFlight: nextRetryInFlight,
    history: Object.freeze([...snapshot.history, entry]),
    revision: snapshot.revision + 1,
  });
}

/**
 * Verdict-domain states enter the implementation only as received facts
 * (5.3). This helper is the single lawful path for presenting a received
 * verdict fact to a machine — the payload is the authority's evidence, and
 * the guard of the verdict-received row enforces the named verifier (Art. III).
 */
export function receiveVerdict(params: {
  readonly snapshot: StateSnapshot;
  readonly outcome: 'verified' | 'failed';
  readonly verifier: string;
  readonly ruleset: string;
  readonly environment: string;
}): StateSnapshot {
  if (!isVerdictDomain(params.outcome)) {
    throw new ConstitutionalViolationError('5.1', `"${params.outcome}" is not a canonical verdict state (5.1).`);
  }
  return dispatchStateEvent({
    snapshot: params.snapshot,
    event: 'verdict-received',
    payload: {
      verdict: {
        outcome: params.outcome,
        verifier: params.verifier,
        ruleset: params.ruleset,
        environment: params.environment,
      },
    },
    dispatcher: 'verification-authority',
    to: params.outcome,
  });
}

export { MACHINE_CITATIONS };
