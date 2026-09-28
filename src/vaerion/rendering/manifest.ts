/**
 * Vaerion — Rendering / The Stage 7 Manifest
 *
 * The Stage 7 artifact manifest with its governing citations (P-4: every
 * engineering decision traces; the trace index is maintained as part of the
 * completion report). The manifest declares what each module implements so
 * the conformance report and the pipeline verifier consume one declaration.
 *
 * Citations: Implementation Constitution P-4, Part VII.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import type { Citation } from '../foundation/citations';
import { implementation, visualSystem } from '../foundation/citations';

export interface RenderingModuleManifest {
  readonly module: string;
  readonly implements: string;
  readonly citations: readonly Citation[];
}

export const RENDERING_MANIFEST: readonly RenderingModuleManifest[] = Object.freeze([
  {
    module: 'layers.ts',
    implements: 'the ordinal layer system (7.2): ground.0–lens.6, stacking bindings, treatment law, shadow/glass prohibition',
    citations: [implementation('7.2'), visualSystem('3.4')],
  },
  {
    module: 'strata.ts',
    implements: 'the surface/chrome/region/primitive hierarchy (7.1): resolution chain, containment, scope law, restyle prohibitions, chrome authored once',
    citations: [implementation('7.1'), implementation('4.1'), implementation('4.3')],
  },
  {
    module: 'visibility.ts',
    implements: 'the visibility contracts (7.3): attested or honestly labeled; skeleton structure-only; demo stamped; restricted hatched; empty teaching; absence declared',
    citations: [implementation('7.3'), implementation('Part V'), visualSystem('5.24'), visualSystem('5.25')],
  },
  {
    module: 'measurement.ts',
    implements: 'measurement validation (7.4): Gauge Ladder membership, 4px baseline, intrinsic heights, ceremonial distances',
    citations: [implementation('7.4'), visualSystem('1.1'), visualSystem('1.2'), visualSystem('1.3')],
  },
  {
    module: 'responsive.ts',
    implements: 'responsive evolution (7.5): breakpoint contracts, Margin Rail at ultra-wide, honest degradation, protected rhythms, platform neutrality',
    citations: [implementation('7.5'), visualSystem('9'), visualSystem('1.4'), visualSystem('11', 'breakpoint contract reference')],
  },
  {
    module: 'modes.ts',
    implements: 'the rendering modes and their renderers (7.6–7.10; VS §11): print, grayscale, forced-colors, reduced-motion, export; parity and the export target plan',
    citations: [implementation('7.6'), implementation('7.7'), implementation('7.8'), implementation('7.9'), implementation('7.10'), visualSystem('11')],
  },
  {
    module: 'pipeline.ts',
    implements: 'the rendering pipeline (7.1–7.3): plan composition through the fixed strata with layer bindings and visibility obligations; nothing renders outside the contracts',
    citations: [implementation('7.1'), implementation('7.2'), implementation('7.3'), implementation('P-3')],
  },
  {
    module: 'target.tsx',
    implements: 'the rendering target binding — the platform binding hook for the operational modes (1.5)',
    citations: [implementation('1.5'), visualSystem('11')],
  },
  {
    module: 'gates.ts',
    implements: 'the fourteen rendering gates (9.1 form): layer ordering, hierarchy ownership, breakpoint evolution, print/grayscale/forced-colors/reduced-motion/export parity, measurement validation, visibility honesty, responsive evolution, token-only rendering, no literal values, layer integrity',
    citations: [implementation('9.1'), implementation('Part VII')],
  },
]);
