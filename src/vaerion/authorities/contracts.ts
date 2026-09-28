/**
 * Vaerion — Authorities / The Authority Contracts
 *
 * The seven named authorities of Constitution 8.0 with their contracts:
 * ownership, lifecycle, boundaries, and composition. The names are
 * constitutional; the identities are consumed from the state engine's
 * ownership registry (state/ownership.ts AUTHORITIES) — never renamed,
 * never re-declared (5.4; 8.0; no duplicated authority).
 *
 * "No authority overlap. No authority ambiguity. No mutation of
 * constitutional history. Correction by superseding records only." Every
 * boundary below is transcribed from the Constitution's own ownership
 * language (8.0–8.9).
 *
 * Citations: Implementation Constitution 8.0–8.9; 5.4; Bible Art. III, VI.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { AUTHORITIES } from '../state/ownership';

/** The seven constitutional authority names (8.0 — the names are law). */
export type AuthorityName =
  | 'Verification Authority'
  | 'Chain Authority'
  | 'Ledger Authority'
  | 'Evidence Authority'
  | 'Rule Authority'
  | 'Identity Authority'
  | 'Export Authority';

export interface AuthorityContract {
  readonly name: AuthorityName;
  /** The single owned domain (8.0 — consumed from the ownership registry). */
  readonly owns: string;
  /** The lifecycle stages the Constitution names for this authority. */
  readonly lifecycle: readonly string[];
  /** The clause citations of the lifecycle stages. */
  readonly lifecycleCitations: readonly Citation[];
  /** What this authority must never do (no overlap; no ambiguity — 8.0). */
  readonly boundaries: readonly string[];
  /** The other authorities this authority composes with. */
  readonly composes: readonly AuthorityName[];
  readonly citations: readonly Citation[];
}

/**
 * The seven authority contracts, in registered order (the order of 8.0).
 */
export const AUTHORITY_CONTRACTS: readonly AuthorityContract[] = Object.freeze([
  {
    name: 'Verification Authority',
    owns: 'issues verdicts',
    lifecycle: ['queued', 'method-bound', 'verdict-issued', 'final'],
    lifecycleCitations: [implementation('8.3', 'verification lifecycle'), implementation('8.0', 'issues verdicts')],
    boundaries: [
      'no other authority issues, predicts, or edits a verdict (5.3; Art. III)',
      'verdicts are never edited in place — re-verification issues a new verification (8.3)',
      'the engine version and ruleset are pinned at verification time (8.3; Art. III)',
    ],
    composes: [],
    citations: [implementation('8.0'), implementation('8.3'), implementation('5.3')],
  },
  {
    name: 'Chain Authority',
    owns: 'append order and integrity',
    lifecycle: ['genesis', 'append-only growth', 'continuously attestable integrity'],
    lifecycleCitations: [implementation('8.5', 'chain lifecycle')],
    boundaries: [
      'no other authority appends to the chain (8.0 — unambiguous ownership)',
      'appended records are never edited; correction is a superseding append (8.1; 8.5)',
      'a break is a first-class event; reconciliation is explicit, recorded, never implicit (8.5)',
    ],
    composes: [],
    citations: [implementation('8.0'), implementation('8.5')],
  },
  {
    name: 'Ledger Authority',
    owns: 'receipt records',
    lifecycle: ['drafted', 'evidence gathered', 'verdict issued', 'appended', 'immutable'],
    lifecycleCitations: [implementation('8.1', 'receipt lifecycle'), implementation('8.0', 'receipt records')],
    boundaries: [
      'no other authority stores receipt records (8.0)',
      'correction is never mutation — a superseding receipt is appended and linked by chain parent (8.1)',
      'verdicts are recorded only from the Verification Authority\'s issued facts (5.3; 8.1; Art. III)',
      'extension fields are additive only (8.1; Art. VI)',
    ],
    composes: ['Chain Authority', 'Evidence Authority', 'Verification Authority'],
    citations: [implementation('8.0'), implementation('8.1'), bible('VI', 'the receipt is sacred')],
  },
  {
    name: 'Evidence Authority',
    owns: 'artifacts and restrictions',
    lifecycle: ['captured', 'attested', 'referenced'],
    lifecycleCitations: [implementation('8.2', 'evidence lifecycle')],
    boundaries: [
      'no other authority owns artifacts or their restrictions (8.0)',
      'restriction is a first-class state that travels with the artifact (8.2)',
      'missing evidence is a recorded state, never silent deletion (8.2; Art. VIII)',
      'each item is hashed at capture (8.1; 8.2)',
    ],
    composes: [],
    citations: [implementation('8.0'), implementation('8.2')],
  },
  {
    name: 'Rule Authority',
    owns: 'the Constitution and rulesets',
    lifecycle: ['drafted', 'ratified', 'effective window', 'superseded'],
    lifecycleCitations: [implementation('8.4', 'rule lifecycle')],
    boundaries: [
      'no other authority owns rules or rulesets (8.0)',
      'a rule change binds a drift marker to receipts verified under the affected window (8.4)',
      'rules are quoted by identifier wherever enforcement appears (8.4)',
    ],
    composes: ['Ledger Authority'],
    citations: [implementation('8.0'), implementation('8.4')],
  },
  {
    name: 'Identity Authority',
    owns: 'actors and credentials',
    lifecycle: [],
    lifecycleCitations: [implementation('8.9', 'identity lifecycle — obligations, not stages')],
    boundaries: [
      'no other authority owns actors or credentials (8.0)',
      'actors are human, machine, or engine — no fourth kind (8.9; Art. III)',
      'credentials are reveal-once with mandatory ceremony (8.9)',
      'identity events enter the admin log as receipts (8.9)',
    ],
    composes: ['Ledger Authority'],
    citations: [implementation('8.0'), implementation('8.9'), bible('III', 'every verdict names its verifier')],
  },
  {
    name: 'Export Authority',
    owns: 'bundles and manifests',
    lifecycle: ['criteria set', 'bundle assembled from source records', 'manifest computed', 'signed', 'delivered'],
    lifecycleCitations: [implementation('8.7', 'export lifecycle'), implementation('8.8', 'manifest lifecycle')],
    boundaries: [
      'no other authority owns bundles or manifests (8.0)',
      'exports from Demo quarantines are refused by construction (8.7; 5.10)',
      'manifests are immutable after signing (8.8)',
      'brokenness must be detectable, never silent (8.8)',
    ],
    composes: ['Ledger Authority'],
    citations: [implementation('8.0'), implementation('8.7'), implementation('8.8')],
  },
]);

/** Resolves an authority contract by constitutional name. */
export function getAuthorityContract(name: string): AuthorityContract {
  const contract = AUTHORITY_CONTRACTS.find((candidate) => candidate.name === name);
  if (!contract) {
    throw new ConstitutionalViolationError(
      '8.0',
      `"${name}" is not one of the seven named authorities. The names are constitutional; inventing an authority is a violation (Constitution 8.0).`,
    );
  }
  return contract;
}

/**
 * Contract integrity (8.0): exactly seven authorities; the names and owned
 * domains are identical to the state engine's ownership registry (no
 * reinterpretation, no duplicate ownership); boundaries are declared; every
 * composition target is a named authority and never the authority itself.
 */
export function assertAuthorityContractIntegrity(): void {
  if (AUTHORITY_CONTRACTS.length !== AUTHORITIES.length) {
    throw new ConstitutionalViolationError(
      '8.0',
      `${AUTHORITY_CONTRACTS.length} authority contracts declared; the ownership registry holds ${AUTHORITIES.length}. Exactly seven authorities exist (Constitution 8.0).`,
    );
  }
  const owned = new Set<string>();
  for (let index = 0; index < AUTHORITY_CONTRACTS.length; index += 1) {
    const contract = AUTHORITY_CONTRACTS[index];
    const identity = AUTHORITIES[index];
    if (contract.name !== identity.name) {
      throw new ConstitutionalViolationError(
        '8.0',
        `Authority at position ${index} is "${contract.name}"; the ownership registry declares "${identity.name}". The names are constitutional (Constitution 8.0).`,
      );
    }
    if (contract.owns !== identity.owns) {
      throw new ConstitutionalViolationError(
        '8.0',
        `"${contract.name}" owns "${contract.owns}"; the ownership registry declares "${identity.owns}". Ownership language is constitutional (Constitution 8.0).`,
      );
    }
    if (owned.has(contract.owns)) {
      throw new ConstitutionalViolationError(
        '8.0',
        `"${contract.owns}" is owned by more than one authority. No authority overlap (Constitution 8.0).`,
      );
    }
    owned.add(contract.owns);
    if (contract.boundaries.length === 0) {
      throw new ConstitutionalViolationError(
        '8.0',
        `"${contract.name}" declares no boundaries. No authority ambiguity (Constitution 8.0).`,
      );
    }
    for (const composed of contract.composes) {
      if (composed === contract.name) {
        throw new ConstitutionalViolationError(
          '8.0',
          `"${contract.name}" composes itself. Authority composition is declared between distinct authorities (Constitution 8.0).`,
        );
      }
      getAuthorityContract(composed);
    }
  }
}

export const CONTRACTS_CITATIONS: readonly Citation[] = [
  implementation('8.0', 'the seven named authorities'),
  implementation('5.4', 'ownership law'),
];
