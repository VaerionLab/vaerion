/**
 * Vaerion — Registry / Token Model
 *
 * The typed form of the seven-field token anatomy. Exactly seven fields, no
 * more, no fewer.
 *
 * Citations:
 * - Implementation Constitution 2.2 (token anatomy: systematic identifier;
 *   instrument name; value/formula; constraints; governing citation; version;
 *   status). "A token without a citation is invalid and must be rejected by
 *   every gate."
 * - Implementation Constitution 2.3 (dual naming: identifier and
 *   instrumentName resolve to the same record through one authority).
 * - Visual System §0 (dual naming; systematic id domain.property.variant).
 * - Visual System §4.1/§4.7 (the two chambers; chambered reference values).
 * - Implementation Constitution 2.5 (lifecycle statuses).
 * - Implementation Constitution 2.1 (values compiled only from the ratified
 *   Visual System text — never from memory or invention).
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import type { Citation } from '../foundation/citations';

/** The five lifecycle statuses. Citation: Constitution 2.5; authority §3. */
export const TOKEN_STATUSES = [
  'proposed',
  'ratified',
  'active',
  'deprecated',
  'retired',
] as const;
export type TokenStatus = (typeof TOKEN_STATUSES)[number];

/** The two registered chambers. Citation: Visual System §4.1. */
export const CHAMBERS = ['light', 'dark'] as const;
export type Chamber = (typeof CHAMBERS)[number];

/**
 * A token value: a scalar with unit, a chambered pair, or a formula string
 * referencing other token identifiers. Citation: Constitution 2.2 ("value or
 * formula"); Visual System §4.7 (chambered reference values).
 */
export type TokenValue = string | number | ChamberedValue;

export interface ChamberedValue {
  readonly light: string | number;
  readonly dark: string | number;
}

export function isChambered(value: TokenValue): value is ChamberedValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'light' in value &&
    'dark' in value
  );
}

/**
 * The token record — exactly seven fields (Constitution 2.2).
 * Instances are frozen at construction; the Registry is immutable at runtime.
 */
export interface TokenRecord {
  /** Systematic identifier, `domain.property.variant` (VS §0; Constitution 2.2). */
  readonly identifier: string;
  /** Instrument name — dual naming is inseparable (VS §0; Constitution 2.3). */
  readonly instrumentName: string;
  /** Value or formula. Citation: Constitution 2.2. */
  readonly value: TokenValue;
  /** Scale membership, contrast minima, usage restrictions (Constitution 2.2). */
  readonly constraints: readonly string[];
  /** At least one citation into ratified law (Constitution 2.2; P-4; Art. XI). */
  readonly governingCitation: readonly Citation[];
  /** The Registry version that introduced the current value (Constitution 2.2, 2.8). */
  readonly version: string;
  /** Exactly one lifecycle status (Constitution 2.5). */
  readonly status: TokenStatus;
}

/** The seven sub-registries, in registered order. Citation: Visual System §0. */
export const REGISTRY_DOMAINS = [
  'space',
  'type',
  'shape',
  'color',
  'motion',
  'elevation',
  'icon',
] as const;
export type RegistryDomain = (typeof REGISTRY_DOMAINS)[number];

/** The Registry version that introduced the initial ratified token set. */
export const REGISTRY_VERSION = '1.0.0';

/**
 * All initial tokens derive directly from the ratified Visual System text
 * (transcribed under F-001/DP-2 and digest-pinned by the Snapshot Authority);
 * ratified law is in force, so the initial compilation status is `active`
 * (Constitution 2.5 — transitions to active occur through governance; the
 * ratifying instruments are the ratified documents themselves, recorded in
 * constitution/amendments/LEDGER.md and the Stage 2 conformance report).
 */
export const INITIAL_STATUS: TokenStatus = 'active';

/** Constructs a frozen token record; rejects the record at construction if uncitabled (2.2). */
export function token(record: TokenRecord): TokenRecord {
  if (record.governingCitation.length === 0) {
    throw new Error(
      `[REGISTRY · 2.2] Token "${record.identifier}" is uncitabled. A token without a citation is invalid (Constitution 2.2; P-4; Bible Art. XI).`,
    );
  }
  return Object.freeze(record);
}

/** Resolves a token value for a chamber; chamber-invariant values pass through. */
export function resolveChamber(value: TokenValue, chamber: Chamber): string | number {
  return isChambered(value) ? value[chamber] : value;
}
