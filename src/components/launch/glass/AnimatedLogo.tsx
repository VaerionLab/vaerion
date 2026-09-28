"use client";

/**
 * Vaerion — the Animated official Logo (PHASE 17 — EXPERIENCE AWAKENING).
 *
 * OFFICIAL-ONLY LAW (ABSOLUTE BRAND LAW, restated): this component renders
 * the official Founder raster of record — `/icon-512.png` or
 * `/official-mark-gold.png`'s derived `/icon-192.png` family — the pixels
 * of record from `brand/official/MANIFEST.md`. Nothing here draws,
 * replaces, traces, or distorts the mark:
 *
 *   - entrance      a uniform scale/opacity/blur arrival of the FRAME
 *                   (the artwork inside is untouched)
 *   - glow          an ambient radial light field BEHIND the frame —
 *                   stage lighting, not alteration
 *   - sheen         one light sweep across the glass frame (globals.css)
 *   - float         a slow transform-only levitation of the frame
 *
 * Reduced motion: entrance, sheen, float and pulse all collapse to a
 * calm, still presentation of the official mark.
 *
 * Citations: PHASE 17 mission (logo animation — elegant entrance, soft
 * glow pulse, never distort); PHASE 16.2 ABSOLUTE BRAND LAW; PHASE 16.4
 * brand/official/MANIFEST.md; globals.css console system v5.
 */

import { motion, useReducedMotion } from "framer-motion";

export function AnimatedLogo({
  size = 96,
  src = "/icon-512.png",
  glow = true,
  float = false,
  className,
}: {
  size?: number;
  src?: string;
  glow?: boolean;
  float?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`relative inline-block ${className ?? ""}`}
      initial={reduce ? false : { opacity: 0, scale: 0.92, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {glow ? (
        <span
          aria-hidden
          className={`absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full ${reduce ? "" : "vx-glow-pulse"}`}
          style={{
            width: size * 2.1,
            height: size * 2.1,
            background:
              "radial-gradient(circle, rgba(212,175,55,0.34) 0%, rgba(212,175,55,0.12) 38%, rgba(139,124,246,0.08) 58%, transparent 72%)",
            filter: "blur(6px)",
          }}
        />
      ) : null}

      <motion.div
        className="vx-sheen relative overflow-hidden rounded-2xl glass-raised edge-light p-[7px]"
        animate={reduce || !float ? undefined : { y: [0, -7, 0] }}
        transition={reduce || !float ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src={src}
          alt="Vaerion — the official mark of record"
          width={size}
          height={size}
          decoding="async"
          className="block rounded-xl"
          style={{ width: size, height: size }}
        />
      </motion.div>
    </motion.div>
  );
}
