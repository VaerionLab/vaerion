"use client";

/**
 * Vaerion — the Aurora (PHASE 17 — EXPERIENCE AWAKENING).
 *
 * The cinematic deep-space atmosphere behind the entire console: three
 * GPU-composited light fields (violet intelligence, founder-gold trust,
 * steel precision), a masked technical grid, and a vignette that returns
 * every edge of the screen to true OLED black.
 *
 * Laws it obeys:
 *   - It is ATMOSPHERE, never identity. It paints the room; it never
 *     touches, redraws, or stands in for the official mark.
 *   - Drift animations are transform-only, slow (46–64s), and fully
 *     disabled under prefers-reduced-motion (the grid and vignette
 *     remain as a static, calm foundation).
 *   - Fixed + pointer-events-none + z-index -10: zero interaction cost,
 *     zero layout participation, one paint layer.
 *
 * Citations: PHASE 17 mission (OLED dark foundation); brand/official/
 * MANIFEST.md (palette of record — gold · ink · steel · porcelain ·
 * violet); globals.css console system v5.
 */

export function Aurora() {
  return (
    <div aria-hidden className="vx-aurora">
      <div className="vx-aurora-blob vx-aurora-violet vx-aurora-drift-a" />
      <div className="vx-aurora-blob vx-aurora-gold vx-aurora-drift-b" />
      <div className="vx-aurora-blob vx-aurora-steel vx-aurora-drift-c" />
      <div className="vx-aurora-grid" />
      <div className="vx-aurora-vignette" />
    </div>
  );
}
