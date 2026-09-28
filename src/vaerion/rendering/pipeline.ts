/**
 * Vaerion — Rendering / The Rendering Pipeline
 *
 * The pipeline resolves a surface's rendering through the fixed strata
 * (7.1), binds each node to a ratified layer (7.2), and attaches the
 * visibility obligation of every state it renders (7.3). Nothing renders
 * outside the plan: a node without a stratum, a layer, and citations is a
 * violation of P-3 (no behavior, value, or visual decision exists outside a
 * registry, a contract, or a citation).
 *
 * Primitive layer assignments: a primitive renders at surface.1 unless its
 * constitutional registration elevates it — Dialog and confirmations at
 * ceremony.5 over veil.3; Returns and transient controls at floating.4; the
 * Lens veil at veil.3 and the illuminated chain at lens.6 (VS §3.4; Part
 * III contracts 3.12–3.15).
 *
 * Citations: Implementation Constitution 7.1–7.3, P-3; Visual System §3.4;
 * Part III.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import type { SkeletonKind } from './skeletons';
import { STRATA, type StratumName } from './strata';
import { LAYERS, resolveLayer, type LayerName } from './layers';
import { RENDERING_MODES, type RenderingMode } from './modes';
import { visibilityObligationOf } from './visibility';
import type { CanonicalState } from '../state/matrix';

/** A node of the rendering plan: stratum, layer, and citations. */
export interface RenderingPlanNode {
  readonly stratum: StratumName;
  readonly layer: LayerName;
  /** What the node renders (its constitutional registration). */
  readonly renders: string;
  readonly citations: readonly Citation[];
}

/** The elevated primitives (VS §3.4; Part III 3.12–3.15). */
export const ELEVATED_PRIMITIVES = {
  dialog: { layer: 'ceremony' as LayerName, veil: 'veil' as LayerName, citation: [visualSystem('3.4', 'ceremony.5 — Receipt Viewer, confirmations'), implementation('3.12', 'Dialog — mandatory veil')] },
  return: { layer: 'floating' as LayerName, citation: [visualSystem('3.4', 'floating.4 — Caliper, Returns, transient controls'), implementation('3.13', 'Toast (Return)')] },
  lensVeil: { layer: 'veil' as LayerName, citation: [visualSystem('3.4', 'veil.3 — the Proof Lens dimming stratum'), implementation('3.15', 'Lens')] },
  lensPlane: { layer: 'lens' as LayerName, citation: [visualSystem('3.4', 'lens.6 — the illuminated evidence chain state'), implementation('3.15', 'Lens')] },
} as const;

/**
 * Composes the rendering plan for one surface (7.1): chrome → surface →
 * region → primitive, each node bound to its ratified layer. The plan is
 * frozen and immutable.
 */
export function composeRenderingPlan(params: {
  readonly skeleton: SkeletonKind;
  readonly modes: readonly RenderingMode[];
  readonly states: readonly CanonicalState[];
}): {
  readonly skeleton: SkeletonKind;
  readonly modes: readonly RenderingMode[];
  readonly nodes: readonly RenderingPlanNode[];
  readonly visibility: readonly CanonicalState[];
} {
  for (const mode of params.modes) {
    if (!(RENDERING_MODES as readonly string[]).includes(mode)) {
      throw new ConstitutionalViolationError(
        '11',
        `"${String(mode)}" is not a registered rendering mode (VS §11). The pipeline renders only registered modes.`,
      );
    }
  }
  const chrome = resolveLayer('sticky');
  const surface = resolveLayer('surface');
  const nodes: RenderingPlanNode[] = [
    {
      stratum: 'chrome',
      layer: chrome.name,
      renders: 'the Environment Stamp and the Spine — chrome authored once, inherited everywhere (4.3); chrome holds position (sticky.2 — VS §3.4)',
      citations: [implementation('4.3'), visualSystem('3.4', 'sticky.2')],
    },
    {
      stratum: 'surface',
      layer: surface.name,
      renders: `the ${params.skeleton} skeleton — exactly one of the three canonical skeletons (4.1; VS §1.4)`,
      citations: [implementation('4.1'), visualSystem('1.4')],
    },
    {
      stratum: 'region',
      layer: surface.name,
      renders: 'the bounded content areas the surface declares; regions live on the surface plane (7.1)',
      citations: [implementation('7.1')],
    },
    {
      stratum: 'primitive',
      layer: surface.name,
      renders: 'primitives rendering received state at surface.1 unless their constitutional registration elevates them (Part III; VS §3.4)',
      citations: [implementation('7.1'), implementation('5.4', 'primitives render received state'), visualSystem('3.4')],
    },
  ];
  return Object.freeze({
    skeleton: params.skeleton,
    modes: Object.freeze([...params.modes]),
    nodes: Object.freeze(nodes),
    visibility: Object.freeze([...params.states]),
  });
}

/**
 * Plan conformance (P-3; 7.1–7.3): every node resolves a stratum of the
 * fixed chain, a ratified layer, and citations; every rendered state
 * resolves its visibility obligation. Anything else renders outside the
 * constitutional contracts and throws.
 */
export function assertPlanConformant(plan: {
  readonly nodes: readonly RenderingPlanNode[];
  readonly visibility: readonly CanonicalState[];
}): void {
  for (const node of plan.nodes) {
    if (!(STRATA as readonly string[]).includes(node.stratum)) {
      throw new ConstitutionalViolationError(
        '7.1 / P-3',
        `A plan node declares stratum "${String(node.stratum)}", which is not a stratum of the fixed resolution chain (Constitution 7.1). No rendering exists outside the constitutional contracts (P-3).`,
      );
    }
    if (!LAYERS.some((layer) => layer.name === node.layer)) {
      throw new ConstitutionalViolationError(
        '7.2 / P-3',
        `A plan node binds layer "${String(node.layer)}", which is not a ratified layer (Constitution 7.2; VS §3.4). No rendering exists outside the constitutional contracts (P-3).`,
      );
    }
    if (node.citations.length === 0) {
      throw new ConstitutionalViolationError(
        'P-4 / P-3',
        `A plan node for "${node.renders}" is uncitable. No rendering exists outside a registry, a contract, or a citation (P-3; P-4; Art. XI).`,
      );
    }
  }
  for (const state of plan.visibility) {
    visibilityObligationOf(state);
  }
}

/**
 * No rendering outside the plan (P-3): a resolution that introduces a node
 * beyond the composed plan's contract set is a violation.
 */
export function assertNothingOutsideContracts(params: {
  readonly planNodeCount: number;
  readonly declaredNodeCount: number;
}): void {
  if (params.declaredNodeCount > params.planNodeCount) {
    throw new ConstitutionalViolationError(
      'P-3 / 7.1',
      `${params.declaredNodeCount - params.planNodeCount} rendering node(s) exist outside the composed plan. Nothing renders outside the constitutional contracts (P-3); the pipeline resolves chrome → surface → region → primitive (7.1).`,
      [implementation('P-3', 'conformance — nothing outside registry, contract, or citation')],
    );
  }
}

export const PIPELINE_CITATIONS: readonly Citation[] = [
  implementation('7.1', 'the rendering resolution chain'),
  implementation('7.2', 'layer ordering'),
  implementation('7.3', 'visibility'),
  implementation('P-3', 'no rendering outside registry, contract, or citation'),
];
