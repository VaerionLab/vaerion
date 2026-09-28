/**
 * Vaerion — State / The Canonical State Matrix
 *
 * Twelve canonical states exist. No others may be rendered; no aliases may be
 * coined (Constitution 5.1). Every definition below is the ratified wording of
 * Constitution 5.2; every definition is immutable and cited (P-4; Art. XI).
 *
 * Verdict-domain states are received, never computed (5.1; 5.3; 1.6). The
 * four-verdict Seal vocabulary (Bible Part Three) is a Seal concern and is not
 * re-declared here: UNVERIFIED is a verdict, not a matrix state — a record's
 * seal renders it inside whatever canonical state the hosting scope lawfully
 * holds. No alias is coined in either direction.
 *
 * Citations: Implementation Constitution 5.1, 5.2, 5.3, 5.4; Bible Art. III,
 * VIII; Visual System §5.24, §3.3, §12.6, §5.25, §5.26.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';

/** The two state domains (Constitution 5.1). */
export const STATE_DOMAINS = ['verdict', 'system'] as const;
export type StateDomain = (typeof STATE_DOMAINS)[number];

/**
 * Verdict-domain states — received, never computed (Constitution 5.1).
 * Entered only from the Verification Authority (5.3).
 */
export const VERDICT_DOMAIN_STATES = [
  'verified',
  'failed',
  'pending',
  'restricted',
  'demo',
] as const;

/**
 * System-domain states — owned by the runtime (Constitution 5.1).
 * Offline and Recovery are chrome-scoped (5.4).
 */
export const SYSTEM_DOMAIN_STATES = [
  'idle',
  'loading',
  'skeleton',
  'empty',
  'offline',
  'recovery',
  'error',
] as const;

export type VerdictDomainState = (typeof VERDICT_DOMAIN_STATES)[number];
export type SystemDomainState = (typeof SYSTEM_DOMAIN_STATES)[number];
export type CanonicalState = VerdictDomainState | SystemDomainState;

/** The domain of a canonical state, resolved mechanically (5.1). */
export function domainOf(state: CanonicalState): StateDomain {
  return (VERDICT_DOMAIN_STATES as readonly string[]).includes(state) ? 'verdict' : 'system';
}

/** The owning authority names of Part VIII — ownership identities only (8.0). */
export const STATE_AUTHORITIES = [
  'Verification Authority',
  'Chain Authority',
  'Ledger Authority',
  'Evidence Authority',
  'Rule Authority',
  'Identity Authority',
  'Export Authority',
] as const;
export type StateAuthority = (typeof STATE_AUTHORITIES)[number];

/** The owning scopes of state (Constitution 5.4). */
export const STATE_OWNERS = ['verification-authority', 'chain-authority', 'surface', 'chrome'] as const;
export type StateOwner = (typeof STATE_OWNERS)[number];

/** One immutable state definition (Constitution 5.2 — ratified substance). */
export interface StateDefinition {
  readonly id: CanonicalState;
  readonly domain: StateDomain;
  /** The ratified definition (5.2). */
  readonly definition: string;
  /** The rendering obligations the state carries (5.2; 7.3 — visibility law). */
  readonly rendering: readonly string[];
  /** The owner per Constitution 5.4. */
  readonly owner: StateOwner;
  /** The authority whose fact the state renders, when applicable (5.3; 5.4). */
  readonly factAuthority: StateAuthority | null;
  readonly citations: readonly Citation[];
}

const STANDING_STATE_CITATIONS: readonly Citation[] = [
  implementation('5.1', 'the State Matrix — twelve canonical states, no aliases'),
  implementation('P-4', 'traceability'),
  bible('XI', 'nothing unmeasured ships'),
];

function defineState(
  def: Omit<StateDefinition, 'citations'> & { readonly citations?: readonly Citation[] },
): StateDefinition {
  return Object.freeze({
    ...def,
    citations: [...(def.citations ?? []), ...STANDING_STATE_CITATIONS],
  });
}

/**
 * The State Matrix — exactly twelve states, in the registered order of
 * Constitution 5.1. Frozen; definitions are immutable (runtime state
 * contracts — nothing may mutate a definition at runtime).
 */
export const STATE_MATRIX: readonly StateDefinition[] = Object.freeze([
  // ── Verdict-domain states (received, never computed) ──────────────────────
  defineState({
    id: 'verified',
    domain: 'verdict',
    definition: 'Engine-issued verdict: the claim was checked by a named verifier against a named rule set, and the check holds.',
    rendering: [
      'renders only with its verifier named — an anonymous verdict is constitutionally void (Art. III)',
      'renders only as received from the Verification Authority (5.3)',
    ],
    owner: 'verification-authority',
    factAuthority: 'Verification Authority',
    citations: [implementation('5.2', 'Verified / Failed — engine-issued verdicts'), bible('III', 'a verdict names its verifier')],
  }),
  defineState({
    id: 'failed',
    domain: 'verdict',
    definition: 'Engine-issued verdict: the claim was checked and did not hold. A failed measurement, not an accusation.',
    rendering: [
      'always names what failed and which verifier refuted it (Art. III)',
      'renders only as received from the Verification Authority (5.3)',
    ],
    owner: 'verification-authority',
    factAuthority: 'Verification Authority',
    citations: [implementation('5.2', 'Verified / Failed — engine-issued verdicts'), bible('III')],
  }),
  defineState({
    id: 'pending',
    domain: 'verdict',
    definition: 'A verdict is in flight; pulse sanctioned. Never rounded forward to VERIFIED, never silently dropped, always cancellable with exact restoration of the prior state.',
    rendering: [
      'the UI shows Pending — never the anticipated outcome (5.3)',
      'the pulse is the only element permitted to breathe (Bible Part Three)',
      'reduced motion: static dot with its word (7.9; VS §7.3)',
    ],
    owner: 'verification-authority',
    factAuthority: 'Verification Authority',
    citations: [implementation('5.2', 'Pending — a verdict is in flight'), implementation('5.3', 'the verdict boundary'), bible('Part Three', 'the pulse')],
  }),
  defineState({
    id: 'restricted',
    domain: 'verdict',
    definition: 'Evidence exists and is withheld; rendered hatched with its honest notice.',
    rendering: [
      'rendered hatched with its honest notice — never silently omitted (5.2; 8.2)',
      'the Lens illuminates only what the viewer is authorized to see (3.15; Art. XII)',
      'never masked by container inheritance (5.6)',
    ],
    owner: 'verification-authority',
    factAuthority: 'Evidence Authority',
    citations: [implementation('5.2', 'Restricted'), implementation('8.2', 'restriction is a first-class state that travels with the artifact'), visualSystem('3.3', 'hatch geometry'), implementation('3.15', 'the Lens honors restrictions')],
  }),
  defineState({
    id: 'demo',
    domain: 'verdict',
    definition: 'Quarantined demonstration data, stamped, export-forbidden.',
    rendering: [
      'the DEMO stamp travels with the record and renders wherever the record appears, forever (5.10)',
      'exports from Demo quarantines are refused by construction (8.7)',
    ],
    owner: 'verification-authority',
    factAuthority: 'Verification Authority',
    citations: [implementation('5.2', 'Demo'), implementation('5.10', 'demo quarantine'), implementation('8.7', 'exports refused by construction'), visualSystem('12.6', 'demo quarantine registration')],
  }),
  // ── System-domain states (owned by the runtime) ───────────────────────────
  defineState({
    id: 'idle',
    domain: 'system',
    definition: 'Populated, awaiting user.',
    rendering: ['populated content renders; no progress display is sanctioned below the registered delay (VS §10)'],
    owner: 'surface',
    factAuthority: null,
    citations: [implementation('5.2', 'Idle — populated, awaiting user')],
  }),
  defineState({
    id: 'loading',
    domain: 'system',
    definition: 'Work in flight, Gauge sanctioned after 300 ms.',
    rendering: [
      'the Gauge renders only after the registered 300 ms delay (3.14; VS §5, §10)',
      'loading states state what is loading and never imply completion (Art. VIII)',
    ],
    owner: 'surface',
    factAuthority: null,
    citations: [implementation('5.2', 'Loading'), implementation('3.14', 'Gauge — after the 300 ms delay'), visualSystem('10', 'latency contract')],
  }),
  defineState({
    id: 'skeleton',
    domain: 'system',
    definition: 'Structure-only placeholder, numbers and text prohibited.',
    rendering: [
      'structure only — numbers and text are prohibited (5.2; VS §5.24)',
      'skeletons and countdowns are the only sanctioned companions of the Gauge (3.14)',
    ],
    owner: 'surface',
    factAuthority: null,
    citations: [implementation('5.2', 'Skeleton'), visualSystem('5.24', 'skeleton registration')],
  }),
  defineState({
    id: 'empty',
    domain: 'system',
    definition: 'Lawful absence, rendered as teaching.',
    rendering: [
      'empty states state the truth of the emptiness (Art. VIII)',
      'copy resolves from the Announcement & Copy Registry (4.7; 6.11)',
    ],
    owner: 'surface',
    factAuthority: null,
    citations: [implementation('5.2', 'Empty'), visualSystem('5.25', 'teaching empty states'), bible('VIII', 'absence rendered as absence')],
  }),
  defineState({
    id: 'offline',
    domain: 'system',
    definition: 'Authority unreachable; reads continue, writes halt.',
    rendering: [
      'chrome-scoped — announced by chrome (5.4; 5.7)',
      'reads continue; writes halt (5.2)',
    ],
    owner: 'chrome',
    factAuthority: null,
    citations: [implementation('5.2', 'Offline'), implementation('5.4', 'Offline and Recovery are chrome-scoped')],
  }),
  defineState({
    id: 'recovery',
    domain: 'system',
    definition: 'Reconnection in progress; integrity revalidation before live resumption.',
    rendering: [
      'chrome-scoped (5.4)',
      'a detected gap renders as a visible break and remains until the Chain Authority reconciles (5.9; 3.4)',
    ],
    owner: 'chrome',
    factAuthority: 'Chain Authority',
    citations: [implementation('5.2', 'Recovery'), implementation('5.9', 'recovery revalidates integrity'), implementation('3.4', 'a break renders as a break')],
  }),
  defineState({
    id: 'error',
    domain: 'system',
    definition: 'An act failed; rendered as Failure Receipt.',
    rendering: [
      'every Error renders as a Failure Receipt with its receipt id (5.2; 6.5)',
      'the prior failure remains rendered until superseded (5.7; Art. VIII)',
    ],
    owner: 'surface',
    factAuthority: null,
    citations: [implementation('5.2', 'Error'), visualSystem('5.26', 'failure receipt registration'), bible('VIII')],
  }),
]);

const BY_ID: ReadonlyMap<CanonicalState, StateDefinition> = new Map(
  STATE_MATRIX.map((definition) => [definition.id, definition]),
);

/** Resolves a state definition. Unknown states do not exist and are never improvised (5.1). */
export function getStateDefinition(state: string): StateDefinition {
  const definition = BY_ID.get(state as CanonicalState);
  if (!definition) {
    throw new ConstitutionalViolationError(
      '5.1',
      `"${state}" is not one of the twelve canonical states. No others may be rendered; no aliases may be coined (Constitution 5.1). Request a new state through the amendment pathway (Part XI).`,
    );
  }
  return definition;
}

/** The matrix, exactly — a mechanical reference for the state gates (5.1). */
export function stateMatrixIds(): readonly CanonicalState[] {
  return STATE_MATRIX.map((definition) => definition.id);
}

/** True when the state is verdict-domain (received, never computed — 5.1; 5.3). */
export function isVerdictDomain(state: CanonicalState): boolean {
  return domainOf(state) === 'verdict';
}
