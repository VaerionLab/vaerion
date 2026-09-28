/**
 * Vaerion — State / Ownership & Authority Registry
 *
 * Ownership law (Constitution 5.4):
 *   "Verdict-domain states are owned by the Verification Authority. Chain
 *    integrity is owned by the Chain Authority. System-domain states are
 *    owned by the surface hosting them, except Offline and Recovery, which
 *    are chrome-scoped. No primitive owns state; primitives render received
 *    state."
 *
 * The named authorities are the constitutional ownership identities of
 * Constitution 8.0. Their data lifecycles are Stage 8 scope; this registry
 * declares ownership only — the mapping of a name to storage or service is
 * free by law, provided ownership is unambiguous (8.0).
 *
 * Citations: Implementation Constitution 5.4, 5.5, 8.0; Part III (no primitive
 * owns state).
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import {
  STATE_MATRIX,
  domainOf,
  type CanonicalState,
  type StateOwner,
} from './matrix';

/** A constitutional authority identity (8.0 — the names are constitutional). */
export interface AuthorityIdentity {
  /** The constitutional name, exactly as written in Constitution 8.0. */
  readonly name: string;
  /** The single domain the authority owns (8.0: "ownership is unambiguous"). */
  readonly owns: string;
  readonly citations: readonly Citation[];
}

/**
 * The seven named authorities of Constitution 8.0, in registered order.
 * Ownership identities only — implementations live at Stage 8.
 */
export const AUTHORITIES: readonly AuthorityIdentity[] = Object.freeze([
  {
    name: 'Verification Authority',
    owns: 'issues verdicts',
    citations: [implementation('8.0'), implementation('5.4', 'verdict-domain states are owned by the Verification Authority'), implementation('5.3')],
  },
  {
    name: 'Chain Authority',
    owns: 'append order and integrity',
    citations: [implementation('8.0'), implementation('5.4', 'chain integrity is owned by the Chain Authority'), implementation('5.9')],
  },
  {
    name: 'Ledger Authority',
    owns: 'receipt records',
    citations: [implementation('8.0')],
  },
  {
    name: 'Evidence Authority',
    owns: 'artifacts and restrictions',
    citations: [implementation('8.0'), implementation('8.2', 'restriction travels with the artifact')],
  },
  {
    name: 'Rule Authority',
    owns: 'the Constitution and rulesets',
    citations: [implementation('8.0'), implementation('8.4')],
  },
  {
    name: 'Identity Authority',
    owns: 'actors and credentials',
    citations: [implementation('8.0'), implementation('8.9')],
  },
  {
    name: 'Export Authority',
    owns: 'bundles and manifests',
    citations: [implementation('8.0'), implementation('8.7'), implementation('8.8')],
  },
]);

function getAuthority(name: string): AuthorityIdentity {
  const authority = AUTHORITIES.find((a) => a.name === name);
  if (!authority) {
    throw new ConstitutionalViolationError(
      '8.0',
      `"${name}" is not one of the seven named authorities. The names are constitutional; inventing an authority is a violation (Constitution 8.0).`,
    );
  }
  return authority;
}

/**
 * Resolves the lawful owner of a canonical state directly from the State
 * Matrix (5.4). The matrix is the single declaration of ownership; this
 * function adds the mechanical lookup, not a second opinion (P-6).
 */
export function ownerOf(state: CanonicalState): StateOwner {
  return STATE_MATRIX.find((definition) => definition.id === state)!.owner;
}

/**
 * The owning authority of a canonical state: verdict-domain states are owned
 * by the Verification Authority (5.4); a state's fact authority (the authority
 * whose received fact the state renders) is declared per definition.
 * System-domain states without a fact authority are runtime-owned (surface or
 * chrome — 5.4) and have no data authority; they return null.
 */
export function owningAuthorityOf(state: CanonicalState): AuthorityIdentity | null {
  const definition = STATE_MATRIX.find((d) => d.id === state)!;
  if (domainOf(state) === 'verdict') {
    return getAuthority('Verification Authority');
  }
  if (definition.factAuthority) {
    return getAuthority(definition.factAuthority);
  }
  return null;
}

/**
 * Ownership legality (5.4 read with the transition table of 5.7):
 *   - the verdict OUTCOME ('verdict-received') may be dispatched only by the
 *     Verification Authority (5.3; 5.4 — received, never computed; Art. III);
 *   - the verification REQUEST ('verification-requested') is dispatched by
 *     the surface hosting the scope — 5.7 grants the row Idle/Empty → Pending
 *     without a verifier guard, and 5.3 keeps the outcome Pending until the
 *     authority records the fact;
 *   - chrome-scoped states (Offline, Recovery) are dispatched by chrome
 *     (5.4), including the completion of the chrome-scoped recovery flow
 *     ('integrity-revalidated' → Idle or Error — 5.4 + 5.7 read together);
 *   - every other system-domain state is dispatched by the surface hosting
 *     the scope (5.4). No sibling mutation (5.5); no primitive owns state.
 * Every violation throws.
 */
export function assertDispatchOwnership(params: {
  /** The canonical state the dispatch transitions into. */
  readonly target: CanonicalState;
  /** The event being dispatched (ownership is event-aware — 5.7). */
  readonly event: string;
  /** The identity of the dispatching party (5.4 vocabulary). */
  readonly caller: StateOwner;
}): void {
  if (params.event === 'verdict-received') {
    if (params.caller !== 'verification-authority') {
      throw new ConstitutionalViolationError(
        '5.4 / 5.3',
        `A verdict may be received only from the Verification Authority (Constitution 5.3; 5.4); a "${params.caller}" dispatched "verdict received". No surface, primitive, or interaction may produce, predict, or optimistically render a verdict (5.3; 1.6; Art. VIII).`,
      );
    }
    return;
  }
  if (params.event === 'integrity-revalidated' && params.caller === 'chrome') {
    // The chrome-scoped recovery flow completes into Idle or Error (5.4 + 5.7).
    return;
  }
  if (params.event === 'verification-requested' && (params.caller === 'surface' || params.caller === 'chrome')) {
    // The lawful request row Idle/Empty → Pending (5.7), dispatched by the
    // scope-hosting runtime. The outcome stays Pending until the Verification
    // Authority records the fact (5.3).
    return;
  }
  const lawfulOwner = ownerOf(params.target);
  if (params.caller === lawfulOwner) return;
  if (lawfulOwner === 'chrome') {
    throw new ConstitutionalViolationError(
      '5.4',
      `"${params.target}" is chrome-scoped (Constitution 5.4); a "${params.caller}" may not dispatch it.`,
    );
  }
  if (lawfulOwner === 'verification-authority') {
    throw new ConstitutionalViolationError(
      '5.4 / 5.3',
      `Verdict-domain state "${params.target}" is owned by the Verification Authority (Constitution 5.4); a "${params.caller}" may not produce it.`,
    );
  }
  throw new ConstitutionalViolationError(
    '5.4 / 5.5',
    `State "${params.target}" is owned by the surface hosting the scope (Constitution 5.4); a "${params.caller}" dispatched it. No sibling mutation (5.5); no primitive owns state (5.4).`,
  );
}
