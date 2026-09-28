/**
 * Vaerion — Rendering / The Surface Hierarchy (Strata)
 *
 * Surface hierarchy law (Constitution 7.1): "Rendering resolves through
 * fixed strata: chrome → surface → region → primitive. Each stratum may
 * consume only tokens and contracts from its own scope. A primitive must
 * never restyle chrome; a surface must never restyle a primitive's anatomy."
 *
 * The chrome hierarchy, region hierarchy, and primitive hierarchy are the
 * same law read per stratum: chrome is authored once and inherited
 * everywhere (4.3); surfaces instantiate one of the three skeletons (4.1);
 * regions are the bounded content areas a surface declares; primitives
 * render received state and own their anatomy (Part III).
 *
 * Citations: Implementation Constitution 7.1, 4.1, 4.3, Part III; Visual
 * System §1.4, §5.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';

/** The fixed strata of the rendering resolution, in resolution order (7.1). */
export const STRATA = ['chrome', 'surface', 'region', 'primitive'] as const;
export type StratumName = (typeof STRATA)[number];

export interface StratumContract {
  readonly name: StratumName;
  /** What this stratum owns, per constitutional law. */
  readonly owns: string;
  /** What this stratum must never do (7.1 boundaries). */
  readonly boundaries: readonly string[];
  readonly citations: readonly Citation[];
}

/** The stratum contracts of 7.1, with their governing citations. */
export const STRATUM_CONTRACTS: readonly StratumContract[] = Object.freeze([
  {
    name: 'chrome',
    owns: 'the Environment Stamp and the Spine — authored once, inherited everywhere (4.3; 3.10, 3.11)',
    boundaries: [
      'chrome is never page content — pages must not re-render, restyle, or omit it (4.3)',
    ],
    citations: [implementation('7.1'), implementation('4.3'), implementation('3.10'), implementation('3.11')],
  },
  {
    name: 'surface',
    owns: 'the instantiated skeleton — exactly one of the three canonical skeletons (4.1; VS §1.4) — and the regions it declares',
    boundaries: [
      'a surface must never restyle a primitive\'s anatomy (7.1)',
      'a surface must never restyle chrome (4.3; 7.1)',
      'a fourth layout pattern is a violation (4.1)',
    ],
    citations: [implementation('7.1'), implementation('4.1'), visualSystem('1.4')],
  },
  {
    name: 'region',
    owns: 'the bounded content area a surface declares; hosts primitives in constitutional composition order (4.2)',
    boundaries: [
      'a region must never re-parent or re-render chrome (4.3; 7.1)',
      'layout may compress; it may never reorder (4.2)',
    ],
    citations: [implementation('7.1'), implementation('4.2'), implementation('4.3')],
  },
  {
    name: 'primitive',
    owns: 'exactly the one responsibility of its Part III contract; renders received state (5.4)',
    boundaries: [
      'a primitive must never restyle chrome (7.1)',
      'no primitive owns state; primitives render received state (5.4)',
      'no primitive may hold responsibility, boundary, or behavior assigned to another (3.0)',
    ],
    citations: [implementation('7.1'), implementation('3.0'), implementation('5.4')],
  },
]);

function stratumContract(name: StratumName): StratumContract {
  const contract = STRATUM_CONTRACTS.find((candidate) => candidate.name === name);
  if (!contract) {
    throw new ConstitutionalViolationError(
      '7.1',
      `"${name}" is not a stratum of the rendering resolution (chrome → surface → region → primitive — Constitution 7.1).`,
    );
  }
  return contract;
}

/**
 * Rendering resolution order (7.1): chrome → surface → region → primitive.
 * A resolution chain that skips, repeats, or reorders strata is a violation.
 */
export function assertStratumResolution(order: readonly StratumName[]): void {
  if (order.length !== STRATA.length) {
    throw new ConstitutionalViolationError(
      '7.1',
      `The rendering resolution declares ${order.length} strata; the fixed chain is exactly ${STRATA.length}: ${STRATA.join(' → ')} (Constitution 7.1).`,
    );
  }
  order.forEach((stratum, index) => {
    if (stratum !== STRATA[index]) {
      throw new ConstitutionalViolationError(
        '7.1',
        `Rendering resolves through fixed strata in fixed order: ${STRATA.join(' → ')} (Constitution 7.1). Position ${index} declares "${stratum}".`,
      );
    }
  });
}

/**
 * Containment law (7.1): each stratum may host only the next stratum of the
 * chain. chrome ⊃ surface ⊃ region ⊃ primitive. A primitive hosting a
 * surface, or a region hosting chrome, breaks the hierarchy.
 */
export function assertStratumContainment(params: {
  readonly container: StratumName;
  readonly contained: StratumName;
}): void {
  const containerIndex = STRATA.indexOf(params.container);
  const containedIndex = STRATA.indexOf(params.contained);
  if (containedIndex !== containerIndex + 1) {
    throw new ConstitutionalViolationError(
      '7.1',
      `A "${params.container}" may host only a "${STRATA[containerIndex + 1]}" (the next stratum of chrome → surface → region → primitive); it was asked to host a "${params.contained}" (Constitution 7.1).`,
    );
  }
}

/**
 * Scope law (7.1): each stratum may consume only tokens and contracts from
 * its own scope. Tokens are global by 2.1 (the Registry is the sole source);
 * the stratum scope governs the *contracts* a stratum binds to.
 */
export function assertStratumScope(params: {
  readonly stratum: StratumName;
  readonly consumedScope: StratumName;
}): void {
  if (params.stratum !== params.consumedScope) {
    throw new ConstitutionalViolationError(
      '7.1',
      `A "${params.stratum}" attempted to consume the contracts of the "${params.consumedScope}" scope. Each stratum may consume only tokens and contracts from its own scope (Constitution 7.1).`,
    );
  }
}

/**
 * Restyle prohibitions (7.1): a primitive must never restyle chrome; a
 * surface must never restyle a primitive's anatomy. Any detected restyle
 * throws.
 */
export function assertNoRestyle(params: {
  readonly primitiveRestylesChrome: boolean;
  readonly surfaceRestylesPrimitiveAnatomy: boolean;
}): void {
  if (params.primitiveRestylesChrome) {
    throw new ConstitutionalViolationError(
      '7.1',
      'A primitive restyled chrome. A primitive must never restyle chrome (Constitution 7.1); chrome is authored once and inherited everywhere (4.3).',
      stratumContract('primitive').citations,
    );
  }
  if (params.surfaceRestylesPrimitiveAnatomy) {
    throw new ConstitutionalViolationError(
      '7.1',
      'A surface restyled a primitive\'s anatomy. A surface must never restyle a primitive\'s anatomy (Constitution 7.1; Part III — anatomy order is composition law, 4.2).',
      stratumContract('surface').citations,
    );
  }
}

/**
 * Chrome inheritance law (4.3; 7.1): the chrome — Environment Stamp and
 * Spine — is authored once and inherited everywhere. A rendering resolution
 * declaring more than one chrome instance is a violation.
 */
export function assertChromeAuthoredOnce(params: { readonly chromeInstances: number }): void {
  if (params.chromeInstances !== 1) {
    throw new ConstitutionalViolationError(
      '4.3 / 7.1',
      `The rendering resolution declares ${params.chromeInstances} chrome instances. Chrome is authored once and inherited everywhere (Constitution 4.3; 7.1).`,
      stratumContract('chrome').citations,
    );
  }
}

export const STRATA_CITATIONS: readonly Citation[] = [
  implementation('7.1', 'surface hierarchy: chrome → surface → region → primitive'),
  implementation('4.3', 'chrome is not page content'),
];
