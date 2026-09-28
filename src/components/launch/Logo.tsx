"use client";

/**
 * Vaerion — the Logo component (Phase 12, order section 4; PHASE 16.1
 * official-brand enforcement; PHASE 16.2 ABSOLUTE BRAND LAW).
 *
 * OFFICIAL-ONLY LAW: the Founder-provided official assets are the single
 * Vaerion identity. This component renders the official raster of record
 * at `/icon-192.png` (derived directly from the Founder upload —
 * `brand/official/MANIFEST.md`). PHASE 16.2 removed every SVG identity
 * carrier: the site renders the official pixels directly — no containers,
 * no wrappers, no redraws, no alternatives.
 *
 * Citations: Phase 12 execution order section 4 ("Do NOT create or invent
 * the Vaerion logo… Wait for the official logo asset"); Phase 16 TASK 1;
 * PHASE 16.1; PHASE 16.2 (ABSOLUTE BRAND LAW); PHASE 16.3 (BRAND PURGE —
 * brand/ = brand/official/ only); brand/official/MANIFEST.md.
 */

export function Logo({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <img
      src="/icon-192.png"
      alt="Vaerion"
      width={size}
      height={size}
      className={className}
      decoding="async"
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`font-mono text-[13px] font-semibold uppercase tracking-[0.22em] text-body ${className ?? ""}`}>
      VAERION
    </span>
  );
}
