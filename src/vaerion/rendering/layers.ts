/**
 * Vaerion — Rendering / The Ordinal Layer System
 *
 * Layer ordering law (Constitution 7.2): "Ordinal layers are fixed: ground
 * (layer.0), surface (layer.1), sticky (layer.2), veil (layer.3), floating
 * (layer.4), ceremony (layer.5), lens plane (layer.6). Platforms bind these
 * ordinals to numeric stacking values; the ordinals themselves never change.
 * Shadows are prohibited in all strata."
 *
 * The ratified ordinal set is consumed from the Registry scales (LAYER_SYSTEM
 * — Visual System §3.4). This module never re-declares it (Constitution 2.1 —
 * no mirror registry may exist); it adds the rendering-engine binding and the
 * mechanical layer law.
 *
 * Platform binding (7.2): the ordinals bind to stacking values of
 * ordinal × 10. This is a technology binding, lawful under 1.5 ("Binding to
 * any technology occurs exclusively in the generated layer") — the generated
 * CSS binding (--vx-elevation-<name>-<ordinal>) compiles the same multiplier
 * (registry compiler). The pipeline verifier cross-checks both bindings.
 *
 * Citations: Implementation Constitution 7.2, 1.5, 2.1; Visual System §3.4;
 * Bible Art. XI.
 *
 * No visual values may appear in this file beyond the transcribed layer
 * system itself. Citation: Constitution 1.3.
 */

import { implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { LAYER_SYSTEM } from '../registry/scales';

/** The ratified layer names, in ordinal order (Visual System §3.4). */
export type LayerName = (typeof LAYER_SYSTEM)[number]['name'];

/** One ratified layer: its constitutional ordinal and purpose. */
export interface LayerDefinition {
  readonly name: LayerName;
  readonly ordinal: number;
  /** The ratified purpose, transcribed from Visual System §3.4. */
  readonly purpose: string;
  readonly citations: readonly Citation[];
}

/** Visual System §3.4 — the ratified purpose of each stratum, transcribed. */
const LAYER_PURPOSES: Readonly<Record<LayerName, string>> = Object.freeze({
  ground: 'the page ground',
  surface: 'panels and content planes',
  sticky: 'chrome that holds position while records move',
  veil: 'the Proof Lens dimming stratum',
  floating: 'Caliper, Returns, transient controls',
  ceremony: 'Receipt Viewer, confirmations, the Lens panel itself',
  lens: 'the illuminated evidence chain state',
});

/**
 * The layer system with its ratified purposes, transcribed from Visual
 * System §3.4 ("Depth is expressed by registered layers, never by shadows
 * or glass"). The ordinals come from the Registry scales — the sole source.
 */
export const LAYERS: readonly LayerDefinition[] = Object.freeze(
  LAYER_SYSTEM.map((layer) => ({
    name: layer.name as LayerName,
    ordinal: layer.ordinal,
    purpose: LAYER_PURPOSES[layer.name as LayerName],
    citations: [
      visualSystem('3.4', `the ${layer.name} stratum (layer.${layer.ordinal})`),
      implementation('7.2', 'ordinal layers are fixed'),
    ],
  })),
);

/**
 * Resolves a layer by name. An unknown layer does not exist and is never
 * improvised (7.2 — the ordinals are fixed; no aliases may be coined).
 */
export function resolveLayer(name: string): LayerDefinition {
  const layer = LAYERS.find((candidate) => candidate.name === name);
  if (!layer) {
    throw new ConstitutionalViolationError(
      '7.2',
      `"${name}" is not a ratified layer. The ordinal layer system is fixed at ground.0, surface.1, sticky.2, veil.3, floating.4, ceremony.5, lens plane.6 (Constitution 7.2; VS §3.4); inventing a layer is a violation.`,
      layerCitations(),
    );
  }
  return layer;
}

/** The ratified ordinal of a layer. */
export function layerOrdinal(name: LayerName): number {
  return resolveLayer(name).ordinal;
}

/**
 * The platform binding of an ordinal to a stacking value (7.2): ordinal × 10.
 * Must remain identical to the generated CSS binding; the pipeline verifier
 * cross-checks the committed bindings against this function.
 */
export const STACKING_MULTIPLIER = 10;

export function layerStackingValue(name: LayerName): number {
  return layerOrdinal(name) * STACKING_MULTIPLIER;
}

function layerCitations(): readonly Citation[] {
  return [visualSystem('3.4', 'the layer system'), implementation('7.2', 'ordinal layers are fixed')];
}

/**
 * Layer ordering integrity (7.2): the ratified system resolves exactly the
 * seven ordinals 0–6 in canonical order, and every stacking binding resolves
 * to ordinal × STACKING_MULTIPLIER in strictly ascending order. Throws on
 * any defect.
 */
export function assertLayerOrdering(): void {
  if (LAYERS.length !== 7) {
    throw new ConstitutionalViolationError(
      '7.2',
      `The layer system holds ${LAYERS.length} strata; exactly seven are ratified (ground through lens — Constitution 7.2; VS §3.4).`,
      layerCitations(),
    );
  }
  LAYERS.forEach((layer, index) => {
    if (layer.ordinal !== index) {
      throw new ConstitutionalViolationError(
        '7.2',
        `Layer "${layer.name}" sits at ordinal ${layer.ordinal} but position ${index}. The ordinals are fixed and contiguous (Constitution 7.2).`,
        layer.citations,
      );
    }
    if (layerStackingValue(layer.name) !== layer.ordinal * STACKING_MULTIPLIER) {
      throw new ConstitutionalViolationError(
        '7.2',
        `Layer "${layer.name}" binds to stacking value ${layerStackingValue(layer.name)}; the platform binding is ordinal × ${STACKING_MULTIPLIER} (Constitution 7.2).`,
        layer.citations,
      );
    }
  });
}

/**
 * The lawful elevation treatments (VS §3.4): depth is communicated by layer
 * position plus hairline edges. The veil/fog strength is the interim IR-008
 * reading; the treatment vocabulary itself is ratified.
 */
export const LAWFUL_LAYER_TREATMENTS = ['layer-position', 'hairline-edge', 'ink-veil (IR-008 interim reading)'] as const;
export type LayerTreatment = (typeof LAWFUL_LAYER_TREATMENTS)[number];

/**
 * Treatment law (VS §3.4; 7.2): shadows are prohibited in all strata; glass
 * is prohibited. A layer's treatment must be a registered treatment. Throws
 * on any shadow, glass, or unregistered treatment.
 */
export function assertLayerTreatmentLawful(params: {
  readonly layer: LayerName;
  readonly treatment: string;
}): void {
  const layer = resolveLayer(params.layer);
  if (params.treatment === 'shadow' || params.treatment === 'glass') {
    throw new ConstitutionalViolationError(
      '7.2 / Art. XI',
      `Layer "${layer.name}" declares a "${params.treatment}" treatment. Shadows are prohibited in all strata and glass is prohibited (Constitution 7.2; VS §3.4): elevation above surface.1 is communicated by layer position plus hairline edges.`,
      layer.citations,
    );
  }
  if (!(LAWFUL_LAYER_TREATMENTS as readonly string[]).includes(params.treatment)) {
    throw new ConstitutionalViolationError(
      '7.2',
      `Layer "${layer.name}" declares treatment "${params.treatment}", which is not a registered treatment. Lawful treatments: ${LAWFUL_LAYER_TREATMENTS.join(', ')} (VS §3.4; IR-008).`,
      layer.citations,
    );
  }
}

export const LAYER_CITATIONS: readonly Citation[] = [
  visualSystem('3.4', 'the layer system; shadows and glass prohibited'),
  implementation('7.2', 'ordinal layers are fixed; platforms bind ordinals to stacking values'),
];
