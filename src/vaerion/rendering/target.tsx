'use client';

/**
 * Vaerion — Rendering / The Rendering Target Binding
 *
 * The platform binding point for the operational rendering modes (VS §11;
 * Constitution 7.6–7.10). The chambers are declared by the Shell (Stage 4 —
 * untouched); the operational modes (grayscale, export) and the media modes
 * (print, forced-colors, reduced-motion) bind through the data-mode
 * attribute and the mode stylesheets of rendering.css.
 *
 * This component adds no behavior and no styling beyond the binding hook:
 * the renderers are contracts (rendering/modes.ts) plus their registered
 * stylesheets. The grayscale target suppresses chroma (7.7); the export
 * target renders the registered export treatment without interactive-only
 * affordances (7.10; VS §11.6).
 *
 * Citations: Implementation Constitution 7.6–7.10, 1.5; Visual System §11.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import type { ReactNode } from 'react';
import type { RenderingMode } from './modes';

export interface RenderingTargetProps {
  /** The declared rendering target (VS §11). */
  readonly mode: RenderingMode;
  readonly children: ReactNode;
}

/**
 * Declares a rendering target. The data-mode attribute scopes the mode
 * stylesheets; the attribute is a binding hook, not a state (derived
 * visibility is rendering, not state — 5.5).
 */
export function RenderingTarget({ mode, children }: RenderingTargetProps) {
  return (
    <div className="vx-render-target" data-mode={mode}>
      {children}
    </div>
  );
}

export const RENDERING_TARGET_CITATIONS = [
  'Constitution 7.6–7.10 (the renderers)',
  'Constitution 1.5 (binding to technology occurs in the generated layer)',
  'VS §11 (rendering modes)',
] as const;
