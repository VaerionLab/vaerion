'use client';

/**
 * Vaerion — State / Runtime State Contracts (the provider)
 *
 * Propagation (Constitution 5.5): "State flows in one direction: authority →
 * surface → primitive. A primitive must not propagate state sideways to a
 * sibling." Inheritance (5.6): "A container may declare a state for its
 * subtree (e.g., Restricted, Demo, Offline); descendants inherit unless they
 * hold an explicitly attested override. Inheritance must not mask
 * evidence-level restriction: a Verified receipt inside a restricted surface
 * renders its own seal and hatched evidence, not the container's state."
 * Ownership (5.4): "No primitive owns state; primitives render received
 * state."
 *
 * Mechanical enforcement in this module:
 *   - dispatch exists only through a scope token issued to the owning surface
 *     — a sibling cannot obtain it, so sibling mutation is structurally
 *     impossible (5.5);
 *   - primitives receive state read-only; no primitive dispatch API exists;
 *   - verdict-domain declarations require Verification Authority evidence
 *     (5.3) — inheritance never becomes a verdict factory;
 *   - record-level facts resolve from the record itself, never from the
 *     container (5.6 — evidence-level restriction is never masked).
 *
 * Citations: Implementation Constitution 5.4, 5.5, 5.6, 5.3, 1.6.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import {
  getStateDefinition,
  isVerdictDomain,
  type CanonicalState,
  type StateOwner,
} from './matrix';
import {
  createInitialSnapshot,
  dispatchStateEvent,
  type Dispatcher,
  type StateSnapshot,
} from './machine';
import type { StateEvent, TransitionPayload } from './transitions';
import type { VerdictAuthorityEvidence } from './honesty';
import { assertVerdictAuthority } from './honesty';

/** A scope declaration — the shape of the state scope tree (5.5; 5.6). */
export interface ScopeDeclaration {
  readonly id: string;
  /** The parent scope, for inheritance (5.6). Null for the chrome root. */
  readonly parentId: string | null;
  /** The owning role of the scope (5.4): surface or chrome. */
  readonly owner: Exclude<StateOwner, 'verification-authority' | 'chain-authority'>;
  readonly initialState: CanonicalState;
}

/** The opaque dispatch token — issued only to the owning surface (5.5). */
export interface ScopeToken {
  readonly scopeId: string;
  readonly bearer: ScopeDeclaration['owner'];
}

interface SubtreeDeclaration {
  readonly state: CanonicalState;
  readonly evidence: VerdictAuthorityEvidence | null;
  readonly citations: readonly Citation[];
}

interface ScopeEntry {
  readonly declaration: ScopeDeclaration;
  readonly snapshot: StateSnapshot;
  /** A state the container declared for its subtree (5.6). */
  readonly subtreeDeclaration: SubtreeDeclaration | null;
}

/** The engine API carried by the context (5.5 runtime contracts). */
export interface StateEngineApi {
  readonly scopes: ReadonlyMap<string, ScopeEntry>;
  readonly registerScope: (declaration: ScopeDeclaration) => ScopeToken;
  readonly dispatch: (
    token: ScopeToken,
    event: StateEvent,
    payload?: TransitionPayload,
    to?: CanonicalState,
  ) => void;
  readonly declareSubtreeState: (
    token: ScopeToken,
    state: CanonicalState,
    evidence?: VerdictAuthorityEvidence,
  ) => void;
}

const StateEngineContext = createContext<StateEngineApi | null>(null);

/**
 * The state engine provider. Mounts the chrome scope (Offline and Recovery
 * are chrome-scoped — 5.4) and holds every registered scope. Mount once,
 * above the surface host; the flow is authority → surface → primitive.
 */
export function StateAuthorityProvider({ children }: { children: ReactNode }) {
  const [scopes, setScopes] = useState<ReadonlyMap<string, ScopeEntry>>(() => {
    const chromeEntry: ScopeEntry = {
      declaration: { id: CHROME_SCOPE_ID, parentId: null, owner: 'chrome', initialState: 'idle' },
      snapshot: createInitialSnapshot({ scopeId: CHROME_SCOPE_ID, initialState: 'idle' }),
      subtreeDeclaration: null,
    };
    return new Map([[CHROME_SCOPE_ID, chromeEntry]]);
  });

  const registerScope = useCallback((declaration: ScopeDeclaration): ScopeToken => {
    getStateDefinition(declaration.initialState);
    setScopes((current) => {
      if (current.has(declaration.id)) {
        const registered = current.get(declaration.id)!;
        if (registered.declaration.owner !== declaration.owner) {
          throw new ConstitutionalViolationError(
            '5.5',
            `Scope "${declaration.id}" is owned by "${registered.declaration.owner}"; a second registration by "${declaration.owner}" is a sibling-mutation attempt (Constitution 5.5).`,
          );
        }
        return current; // idempotent re-registration by the same owner.
      }
      if (declaration.parentId !== null && !current.has(declaration.parentId)) {
        throw new ConstitutionalViolationError(
          '5.6',
          `Scope "${declaration.id}" declares parent "${declaration.parentId}", which is not registered. Inheritance requires a registered ancestor (Constitution 5.6).`,
        );
      }
      const entry: ScopeEntry = {
        declaration,
        snapshot: createInitialSnapshot({
          scopeId: declaration.id,
          initialState: declaration.initialState,
        }),
        subtreeDeclaration: null,
      };
      const next = new Map(current);
      next.set(declaration.id, entry);
      return next;
    });
    return { scopeId: declaration.id, bearer: declaration.owner };
  }, []);

  const dispatch = useCallback(
    (
      token: ScopeToken,
      event: StateEvent,
      payload?: TransitionPayload,
      to?: CanonicalState,
    ): void => {
      setScopes((current) => {
        const entry = current.get(token.scopeId);
        if (!entry) {
          throw new ConstitutionalViolationError(
            '5.4',
            `Scope "${token.scopeId}" is not registered. Unknown scopes are never improvised (Constitution 5.4; P-5).`,
          );
        }
        if (entry.declaration.owner !== token.bearer) {
          throw new ConstitutionalViolationError(
            '5.5',
            `Dispatch token for "${token.scopeId}" names bearer "${token.bearer}" but the scope is owned by "${entry.declaration.owner}" — no sibling mutation (Constitution 5.5).`,
          );
        }
        const snapshot = dispatchStateEvent({
          snapshot: entry.snapshot,
          event,
          payload,
          dispatcher: token.bearer as Dispatcher,
          to,
        });
        const next = new Map(current);
        next.set(token.scopeId, { ...entry, snapshot });
        return next;
      });
    },
    [],
  );

  /**
   * Declares a state for a scope's subtree (5.6). Verdict-domain declarations
   * (Restricted, Demo) require Verification Authority evidence — inheritance
   * never becomes a verdict factory (5.3). Offline declarations are
   * chrome-owned (5.4).
   */
  const declareSubtreeState = useCallback(
    (token: ScopeToken, state: CanonicalState, evidence?: VerdictAuthorityEvidence): void => {
      getStateDefinition(state);
      if (isVerdictDomain(state)) {
        assertVerdictAuthority(evidence);
      } else if (state === 'offline' || state === 'recovery') {
        if (token.bearer !== 'chrome') {
          throw new ConstitutionalViolationError(
            '5.4',
            `"${state}" is chrome-scoped (Constitution 5.4); scope "${token.scopeId}" declared it.`,
          );
        }
      }
      setScopes((current) => {
        const entry = current.get(token.scopeId);
        if (!entry) {
          throw new ConstitutionalViolationError('5.4', `Scope "${token.scopeId}" is not registered.`);
        }
        const next = new Map(current);
        next.set(token.scopeId, {
          ...entry,
          subtreeDeclaration: {
            state,
            evidence: evidence ?? null,
            citations: [
              implementation('5.6', 'a container may declare a state for its subtree'),
              ...(isVerdictDomain(state)
                ? [implementation('5.3', 'declared with Verification Authority evidence')]
                : []),
            ],
          },
        });
        return next;
      });
    },
    [],
  );

  const api = useMemo<StateEngineApi>(
    () => ({ scopes, registerScope, dispatch, declareSubtreeState }),
    [scopes, registerScope, dispatch, declareSubtreeState],
  );

  return <StateEngineContext.Provider value={api}>{children}</StateEngineContext.Provider>;
}

/** The chrome scope id — Offline and Recovery live here (5.4). */
export const CHROME_SCOPE_ID = 'chrome';

function useContextEngine(): StateEngineApi {
  const engine = useContext(StateEngineContext);
  if (!engine) {
    throw new ConstitutionalViolationError(
      '5.5',
      'The state engine is not mounted. State flows authority → surface → primitive through StateAuthorityProvider (Constitution 5.5); no local state machine may bypass constitutional ownership (5.4).',
    );
  }
  return engine;
}

/**
 * Reads a scope's own machine snapshot. Primitives use this — they render
 * received state and never own it (5.4; 5.5).
 */
export function useScopeState(scopeId: string): StateSnapshot {
  const engine = useContextEngine();
  const entry = engine.scopes.get(scopeId);
  if (!entry) {
    throw new ConstitutionalViolationError('5.4', `Scope "${scopeId}" is not registered.`);
  }
  return entry.snapshot;
}

/**
 * The dispatch bound — available only to the owning surface through its
 * token (5.5). There is deliberately no primitive dispatch API: primitives
 * render received state (5.4).
 */
export function useScopeDispatch(): StateEngineApi['dispatch'] {
  return useContextEngine().dispatch;
}

/** Registration — returns the scope token to the owning surface (5.5). */
export function useScopeRegistration(): StateEngineApi['registerScope'] {
  return useContextEngine().registerScope;
}

/** Subtree declaration (5.6). */
export function useSubtreeDeclaration(): StateEngineApi['declareSubtreeState'] {
  return useContextEngine().declareSubtreeState;
}

/**
 * Inheritance resolution (5.6). The first attested state wins:
 *   1. the scope's own machine state, once the machine has explicitly
 *      transitioned (an explicitly attested override);
 *   2. the nearest self-or-ancestor subtree declaration (Restricted, Demo,
 *      Offline — 5.6);
 *   3. the scope's initial state.
 */
export function resolveEffectiveState(
  scopes: ReadonlyMap<string, ScopeEntry>,
  scopeId: string,
): { state: CanonicalState; source: 'own' | 'inherited' | 'initial'; fromScopeId: string } {
  const entry = scopes.get(scopeId);
  if (!entry) {
    throw new ConstitutionalViolationError('5.4', `Scope "${scopeId}" is not registered.`);
  }
  if (entry.snapshot.revision > 0) {
    return { state: entry.snapshot.state, source: 'own', fromScopeId: scopeId };
  }
  let cursor: ScopeEntry | undefined = entry;
  while (cursor) {
    if (cursor.subtreeDeclaration) {
      return {
        state: cursor.subtreeDeclaration.state,
        source: 'inherited',
        fromScopeId: cursor.declaration.id,
      };
    }
    cursor = cursor.declaration.parentId ? scopes.get(cursor.declaration.parentId) : undefined;
  }
  return { state: entry.snapshot.state, source: 'initial', fromScopeId: scopeId };
}

/**
 * Record-level resolution (5.6): a record's own verdict fact is rendered from
 * the record — never from the container. Re-exported from the quarantine law,
 * which owns it; the provider exposes it for scope consumers.
 */
export { resolveRecordState } from './quarantine';
