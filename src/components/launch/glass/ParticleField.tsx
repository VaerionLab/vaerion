"use client";

/**
 * Vaerion — the Particle Field (PHASE 17 — EXPERIENCE AWAKENING).
 *
 * A single <canvas> of drifting light dust: gold (trust), violet
 * (intelligence), porcelain (precision). The particles are atmosphere
 * around the official mark — they never form, replace, or suggest any
 * symbol (ABSOLUTE BRAND LAW).
 *
 * Performance law:
 *   - ≤ 64 particles, one rAF loop, transform-free draw (arc fills only)
 *   - devicePixelRatio-aware, capped at 2
 *   - pauses on document.hidden and when scrolled out of view
 *     (IntersectionObserver)
 *   - does not run at all under prefers-reduced-motion
 *   - cleans up every handle on unmount
 *
 * Citations: PHASE 17 mission (animated particles, performance law);
 * brand/official/MANIFEST.md (palette of record).
 */

import { useEffect, useRef } from "react";

type Dust = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  a: number;
  tw: number;
  twSpeed: number;
  color: string;
};

const PALETTE = ["212, 175, 55", "139, 124, 246", "245, 244, 239"] as const;

export function ParticleField({ density = 1, className }: { density?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let width = 0;
    let height = 0;
    let dust: Dust[] = [];
    let raf = 0;
    let running = true;
    let inView = true;

    const seed = (): void => {
      const count = Math.min(64, Math.round(((width * height) / 26000) * density));
      dust = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.6 + Math.random() * 1.7,
        vy: -(0.06 + Math.random() * 0.22),
        vx: (Math.random() - 0.5) * 0.08,
        a: 0.08 + Math.random() * 0.4,
        tw: Math.random() * Math.PI * 2,
        twSpeed: 0.004 + Math.random() * 0.012,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      }));
    };

    const resize = (): void => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = (): void => {
      ctx.clearRect(0, 0, width, height);
      for (const p of dust) {
        p.y += p.vy;
        p.x += p.vx;
        p.tw += p.twSpeed;
        if (p.y < -6) {
          p.y = height + 6;
          p.x = Math.random() * width;
        }
        if (p.x < -6) p.x = width + 6;
        else if (p.x > width + 6) p.x = -6;
        const alpha = p.a * (0.55 + 0.45 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha.toFixed(3)})`;
        ctx.fill();
      }
    };

    const loop = (): void => {
      if (running && inView && !document.hidden) draw();
      raf = window.requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.02 },
    );
    observer.observe(canvas);

    const onVisibility = (): void => {
      // draw loop self-gates on document.hidden; nothing to store
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    raf = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density]);

  return <canvas ref={canvasRef} aria-hidden className={className} style={{ display: "block" }} />;
}
