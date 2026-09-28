"use client";

/**
 * Vaerion — the Glass Kit (PHASE 17 — EXPERIENCE AWAKENING).
 *
 * The interactive glass language of the console:
 *
 *   Reveal          — one arrival movement per element (opacity +
 *                     ≤10px travel), framer-motion, reduced-motion safe.
 *   GlassPanel      — static frosted surface (the .glass utility, bound).
 *   GlassCard       — a panel that answers the cursor: a ≤3.2° depth tilt
 *                     with spring return, a luminous edge that follows the
 *                     pointer, and a gold hairline on hover. Pointer-fine
 *                     devices only; stillness is the reduced-motion state.
 *   Magnetic        — a small magnetic pull toward the cursor (≤6px),
 *                     spring-damped, for primary actions.
 *
 * Every movement here is transform/opacity only. Nothing loops in this
 * file — loops live in globals.css under reduced-motion guards.
 *
 * Citations: PHASE 17 mission (glassmorphism system, dashboard
 * interactions, micro interactions, performance law).
 */

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useCallback, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ── Reveal — the single arrival ──────────────────────────────────────── */

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const reduce = useReducedMotion();
  const Comp = as === "section" ? motion.section : as === "li" ? motion.li : as === "span" ? motion.span : motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

/* ── GlassPanel — the static frosted surface ──────────────────────────── */

export function GlassPanel({
  children,
  className,
  raised,
  edgeLight,
  style,
}: {
  children: ReactNode;
  className?: string;
  raised?: boolean;
  edgeLight?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div className={cn(raised ? "glass-raised" : "glass", edgeLight && "edge-light", "rounded-2xl", className)} style={style}>
      {children}
    </div>
  );
}

/* ── GlassCard — the cursor-aware surface ─────────────────────────────── */

/* A minimal structural pointer event — wide enough for both anchor and
 * div hosts, so one cursor handler serves GlassCard's two shapes. */
type CursorMoveEvent = {
  readonly clientX: number;
  readonly clientY: number;
  readonly pointerType: string;
  readonly currentTarget: Element;
};

export function GlassCard({
  children,
  className,
  href,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 180, damping: 22 });
  const sry = useSpring(ry, { stiffness: 180, damping: 22 });

  const onMove = useCallback(
    (e: CursorMoveEvent) => {
      if (reduce || e.pointerType !== "mouse") return;
      const rect = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      ry.set((px - 0.5) * 6.4);
      rx.set(-(py - 0.5) * 6.4);
      gx.set(px * 100);
      gy.set(py * 100);
    },
    [reduce, rx, ry, gx, gy],
  );

  const onLeave = useCallback(() => {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(50);
  }, [rx, ry, gx, gy]);

  const glow = useMotionTemplate`radial-gradient(340px circle at ${gx}% ${gy}%, rgba(212,175,55,0.09), rgba(139,124,246,0.05) 45%, transparent 70%)`;

  const inner = (
    <>
      <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: glow }} />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      {children}
    </>
  );

  const cls = cn(
    "group relative block overflow-hidden rounded-2xl glass edge-light transition-[border-color,box-shadow] duration-500",
    "hover:border-gold/25 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_30px_80px_-36px_rgba(0,0,0,0.95),0_0_44px_-18px_rgba(212,175,55,0.22)]",
    className,
  );

  if (href) {
    return (
      <motion.a
        href={href}
        aria-label={ariaLabel}
        className={cls}
        style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        whileHover={reduce ? undefined : { y: -3 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        {inner}
      </motion.a>
    );
  }
  return (
    <motion.div
      className={cls}
      aria-label={ariaLabel}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      {inner}
    </motion.div>
  );
}

/* ── Magnetic — the primary action answers the hand ───────────────────── */

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 18 });
  const sy = useSpring(y, { stiffness: 240, damping: 18 });

  return (
    <motion.span
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(((e.clientX - rect.left) / rect.width - 0.5) * 10);
        y.set(((e.clientY - rect.top) / rect.height - 0.5) * 8);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
