/**
 * Vaerion — Registry / Elevation Registry
 *
 * The layer system and its ordinals (VS §3.4). Depth is expressed by
 * registered layers, never by shadows or glass. Ordinals are fixed
 * (ground.0 → lens.6); platforms bind the ordinals to numeric stacking values
 * in the generated binding layer — the ordinals themselves never change
 * (Constitution 7.2).
 *
 * No visual values originate in this file — only transcriptions of ratified
 * values. Citation: Constitution 1.3, 2.1.
 */

import { visualSystem } from '../../foundation/citations';
import { LAYER_SYSTEM, SCALE_CITATIONS } from '../scales';
import { INITIAL_STATUS, REGISTRY_VERSION, token, type TokenRecord } from '../token';

const layerRoles: Record<string, string> = {
  ground: 'the page ground',
  surface: 'panels and content planes',
  sticky: 'chrome that holds position while records move',
  veil: 'the Proof Lens dimming stratum',
  floating: 'Caliper, Returns, transient controls',
  ceremony: 'Receipt Viewer, confirmations, the Lens panel itself',
  lens: 'the illuminated evidence chain state',
};

export const ELEVATION_REGISTRY: readonly TokenRecord[] = Object.freeze(
  LAYER_SYSTEM.map((layer) =>
    token({
      identifier: `elevation.${layer.name}.${layer.ordinal}`,
      instrumentName: `The ${layer.name.charAt(0).toUpperCase()}${layer.name.slice(1)} Stratum`,
      value: layer.ordinal,
      constraints: [
        `registered role: ${layerRoles[layer.name]} (VS §3.4)`,
        'elevation above surface.1 is communicated by layer position plus hairline edges (VS §3.4)',
        'shadows are prohibited; glass is prohibited (VS §3.4)',
        'the ordinal never changes; platforms bind ordinals to numeric stacking values (Constitution 7.2)',
      ],
      governingCitation: SCALE_CITATIONS.layerSystem,
      version: REGISTRY_VERSION,
      status: INITIAL_STATUS,
    }),
  ),
);
