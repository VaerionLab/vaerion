/**
 * Vaerion — The Canonical Registry
 *
 * There is exactly one canonical Registry of tokens, holding exactly seven
 * sub-registries. The Registry is the sole source of every visual value. No
 * mirror, copy, or derivative registry may exist.
 *
 * Citations:
 * - Implementation Constitution 2.1 (source of truth), 2.3 (dual naming), 2.4
 *   (ownership — Design Systems Authority), 2.5 (lifecycle), 2.8 (versioning).
 * - Visual System §0 (seven registries; dual naming).
 * - Foundation Amendment F-004 (authority/execution separation — this tree
 *   executes the law defined in constitution/registry/).
 *
 * Access API law: implementations bind only to identifiers (Constitution 2.3);
 * every record is frozen; the Registry is immutable at runtime.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { ConstitutionalViolationError } from '../foundation/authority';
import { SPACE_REGISTRY } from './registries/space';
import { TYPE_REGISTRY } from './registries/type';
import { SHAPE_REGISTRY } from './registries/shape';
import { COLOR_REGISTRY } from './registries/color';
import { MOTION_REGISTRY } from './registries/motion';
import { ELEVATION_REGISTRY } from './registries/elevation';
import { ICON_REGISTRY } from './registries/icon';
import {
  CHAMBERS,
  REGISTRY_VERSION,
  TOKEN_STATUSES,
  isChambered,
  resolveChamber,
  type Chamber,
  type ChamberedValue,
  type RegistryDomain,
  type TokenRecord,
  type TokenStatus,
  type TokenValue,
} from './token';

/** The seven sub-registries in registered order. Citation: Visual System §0. */
export const REGISTRIES: Readonly<Record<RegistryDomain, readonly TokenRecord[]>> =
  Object.freeze({
    space: SPACE_REGISTRY,
    type: TYPE_REGISTRY,
    shape: SHAPE_REGISTRY,
    color: COLOR_REGISTRY,
    motion: MOTION_REGISTRY,
    elevation: ELEVATION_REGISTRY,
    icon: ICON_REGISTRY,
  });

const BY_IDENTIFIER: ReadonlyMap<string, TokenRecord> = (() => {
  const map = new Map<string, TokenRecord>();
  for (const domain of Object.keys(REGISTRIES) as RegistryDomain[]) {
    for (const record of REGISTRIES[domain]) {
      const existing = map.get(record.identifier);
      if (existing) {
        throw new ConstitutionalViolationError(
          '2.3 / 2.6',
          `Duplicate token identifier "${record.identifier}" — dual naming requires that identifier and instrument name resolve to one record through one authority.`,
        );
      }
      map.set(record.identifier, record);
    }
  }
  return map;
})();

export { CHAMBERS, REGISTRY_VERSION, TOKEN_STATUSES, isChambered, resolveChamber };
export type { Chamber, ChamberedValue, RegistryDomain, TokenRecord, TokenStatus, TokenValue };
export { PENDING_INDEX_RAMP_VALUES } from './registries/space';
export { PENDING_TYPE_SCALE } from './registries/type';
export { PENDING_ICON_SLOTS } from './registries/icon';

/** All token records across the seven registries, in registered order. */
export function allTokens(): readonly TokenRecord[] {
  return (Object.keys(REGISTRIES) as RegistryDomain[]).flatMap(
    (domain) => REGISTRIES[domain],
  );
}

/** Resolves a token by systematic identifier. Unknown identifiers are violations, never undefined lookups (2.1: a value that does not resolve through a registry does not exist). */
export function getToken(identifier: string): TokenRecord {
  const record = BY_IDENTIFIER.get(identifier);
  if (!record) {
    throw new ConstitutionalViolationError(
      '2.1',
      `Unknown token "${identifier}". Only Registry-resolved values exist (Constitution 2.1; VS §0). Request new tokens through the amendment pathway (Constitution 2.4).`,
    );
  }
  if (record.status === 'retired') {
    throw new ConstitutionalViolationError(
      '2.5',
      `Token "${identifier}" is retired and must not resolve (Constitution 2.5).`,
    );
  }
  return record;
}

/** Resolves a token value for a chamber (VS §4.1). */
export function getTokenValue(identifier: string, chamber: Chamber = 'light'): string | number {
  return resolveChamber(getToken(identifier).value, chamber);
}

/** Resolves a token by instrument name — dual naming through one authority (2.3). */
export function getByInstrumentName(name: string): TokenRecord {
  for (const record of BY_IDENTIFIER.values()) {
    if (record.instrumentName === name) return record;
  }
  throw new ConstitutionalViolationError(
    '2.3',
    `No token is registered under the instrument name "${name}".`,
  );
}

/** Resolves a deprecated token to its successor alias. Deprecated tokens must alias (2.5). */
export function getDeprecatedAlias(identifier: string): string | null {
  const record = BY_IDENTIFIER.get(identifier);
  if (!record || record.status !== 'deprecated') return null;
  const alias = record.constraints.find((c) => c.startsWith('alias:'));
  return alias ? alias.slice('alias:'.length).trim() : null;
}

/** Registry version declaration for surfaces (2.8: surfaces must declare which Registry version they conform to). */
export function registryDeclaration(): {
  readonly registryVersion: string;
  readonly tokenCount: number;
  readonly domains: readonly RegistryDomain[];
} {
  return {
    registryVersion: REGISTRY_VERSION,
    tokenCount: BY_IDENTIFIER.size,
    domains: Object.keys(REGISTRIES) as RegistryDomain[],
  };
}

/**
 * The CSS custom-property name for a token identifier in the generated CSS
 * binding: `domain.property.variant` → `--vx-domain-property-variant`, with
 * camelCase segments kebab-cased (a deterministic binding-layer naming rule,
 * Constitution 2.7 — shared by the compiler, the generated TypeScript
 * bindings, and all consumers).
 */
export function cssVarName(identifier: string): string {
  const kebab = identifier
    .replaceAll('.', '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
  return `--vx-${kebab}`;
}

/**
 * Resolves a formula value ("ink.100 @ 0.16 alpha") against the Registry for
 * a chamber. The grammar is: `<token-id> @ <alpha> alpha`. The compiler and
 * the validators share this resolver so formula handling exists in exactly
 * one place (P-6 — two teams produce identical results).
 */
export function resolveFormula(formula: string, chamber: Chamber): string {
  const match = /^([a-z]+(?:\.[A-Za-z0-9]+)+)\s*@\s*([0-9.]+)\s*alpha$/.exec(formula.trim());
  if (!match) {
    throw new ConstitutionalViolationError(
      '2.2',
      `Unresolvable token formula: "${formula}".`,
    );
  }
  const [, baseId, alpha] = match;
  const base = getTokenValue(baseId, chamber);
  if (typeof base !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(base)) {
    throw new ConstitutionalViolationError(
      '2.2',
      `Formula base "${baseId}" must resolve to a 6-digit hex color; got "${String(base)}".`,
    );
  }
  const r = parseInt(base.slice(1, 3), 16);
  const g = parseInt(base.slice(3, 5), 16);
  const b = parseInt(base.slice(5, 7), 16);
  const a = Number(alpha);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Resolves any token value (scalar, chambered, or formula) to a concrete string for a chamber. */
export function resolveTokenValue(identifier: string, chamber: Chamber = 'light'): string {
  const record = getToken(identifier);
  const value = record.value;
  if (isChambered(value)) return String(value[chamber]);
  if (typeof value === 'string' && value.includes('@') && value.includes('alpha')) {
    return resolveFormula(value, chamber);
  }
  return String(value);
}
