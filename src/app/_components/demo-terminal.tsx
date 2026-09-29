"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const MONO_FONT =
  "[font-family:var(--vx-provision-machine),ui-monospace,SFMono-Regular,Menlo,monospace]";

type Step = {
  node: React.ReactNode;
  /** ms before this step appears, after the previous one */
  delay: number;
};

const DIM = "text-zinc-600";
const TXT = "text-zinc-300";
const OK = "font-semibold text-emerald-400";

/**
 * The refused action — measured against vaerion@0.1.14-rc1.
 *
 * Source of truth: `examples/refused-action` in the public repository
 * and `docs/reference/errors.md` (E1300 · broker_denied). The broker is
 * fail-closed: no matching policy rule means the capability is denied,
 * the run stops, and the refusal itself lands in a hash-chained log
 * while the failed run's journal still verifies (`ok: true · torn: false`).
 */
const SCRIPT: Step[] = [
  {
    delay: 0,
    node: (
      <span className="block">
        <span className={DIM}>{"$ "}</span>
        <span className="text-zinc-200">
          {'vae run agent --goal "Ship the pricing change to production" --planner inline --plan-json \'[{"kind":"tool","tool":"deploy","args":{"env":"production"}}]\''}
        </span>
      </span>
    ),
  },
  { delay: 420, node: <span className={`block ${DIM}`}>{"  planner: inline · policy: production pack · fail-closed: on"}</span> },
  { delay: 300, node: <span className="block">{" "}</span> },
  {
    delay: 420,
    node: (
      <span className="block">
        <span className={TXT}>{"  step 02 · tool: "}</span>
        <span className="text-violet-300">{"deploy --env production"}</span>
        <span className="ml-3 rounded border border-amber-500/30 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-amber-400/90">
          {"restricted"}
        </span>
      </span>
    ),
  },
  { delay: 380, node: <span className="block"><span className={DIM}>{"  policy: "}</span><span className="text-zinc-500">{"no matching rule for deploy.production"}</span></span> },
  { delay: 300, node: <span className="block">{" "}</span> },
  { delay: 260, node: <span className={`block ${DIM}`}>{"  ┌─ BROKER DECISION ──────────────────────────────"}</span> },
  {
    delay: 420,
    node: (
      <span className="block">
        <span className={DIM}>{"  │  "}</span>
        <motion.span
          initial={{ opacity: 0, scale: 1.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="inline-block rounded border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 font-bold tracking-[0.22em] text-rose-400 shadow-[0_0_24px_-6px_rgba(244,63,94,0.55)]"
        >
          {"DENIED"}
        </motion.span>
      </span>
    ),
  },
  {
    delay: 380,
    node: (
      <span className="block">
        <span className={DIM}>{"  │  "}</span>
        <span className="text-rose-300">{"E1300 · broker_denied"}</span>
      </span>
    ),
  },
  {
    delay: 340,
    node: (
      <span className={`block ${TXT}`}>
        {"  │  the permission broker denied the requested"}
      </span>
    ),
  },
  {
    delay: 300,
    node: (
      <span className={`block ${TXT}`}>
        {"  │  capability — the agent stopped. nothing deployed."}
      </span>
    ),
  },
  { delay: 260, node: <span className={`block ${DIM}`}>{"  └────────────────────────────────────────────────"}</span> },
  { delay: 300, node: <span className="block">{" "}</span> },
  {
    delay: 420,
    node: (
      <span className="block">
        <span className={DIM}>{"  refusal log  "}</span>
        <span className="text-zinc-500">{".vaerion/refusals.log · "}</span>
        <span className={OK}>{"HASH VERIFIED ✓"}</span>
      </span>
    ),
  },
  {
    delay: 420,
    node: (
      <span className="block">
        <span className={DIM}>{"  run journal  "}</span>
        <span className="text-zinc-500">{"failed run · 14 records · "}</span>
        <span className={OK}>{"INTEGRITY VERIFIED ✓"}</span>
      </span>
    ),
  },
  {
    delay: 380,
    node: (
      <span className="block">
        <span className={DIM}>{"  vae journal verify <RUN_ID> → "}</span>
        <span className={OK}>{"ok: true"}</span>
        <span className="text-zinc-500">{" · torn: false · issues: []"}</span>
      </span>
    ),
  },
];

const TOTAL = SCRIPT.length;

export function DemoTerminal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: false, amount: 0.35 });
  const [shown, setShown] = useState(0);

  const replay = useCallback(() => setShown(0), []);

  /* The script advances only while the terminal is in view; leaving
   * mid-play pauses it, returning resumes. Shown === 0 + inView starts
   * the replay (first visit and manual restarts share the same path). */
  useEffect(() => {
    if (!inView || shown >= TOTAL) return;
    const t = setTimeout(
      () => setShown((s) => s + 1),
      shown === 0 ? 250 : SCRIPT[shown].delay
    );
    return () => clearTimeout(t);
  }, [inView, shown]);

  const complete = shown >= TOTAL;

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-[0_0_90px_-30px_rgba(91,140,255,0.4)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <div aria-hidden="true" className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-zinc-800" />
          <span className="size-2.5 rounded-full bg-zinc-800" />
          <span className="size-2.5 rounded-full bg-zinc-800" />
        </div>
        <span className={`${MONO_FONT} text-[11px] text-zinc-600`}>
          {"refusal · measured on vaerion@0.1.14-rc1"}
        </span>
        <button
          type="button"
          onClick={replay}
          className={`${MONO_FONT} tap-expand rounded-md border border-white/15 px-2 py-0.5 text-[11px] text-zinc-400 transition-colors hover:border-[#5B8CFF]/50 hover:text-[#9db4ff]`}
        >
          {complete ? "replay" : "restart"}
        </button>
      </div>
      <div
        ref={ref}
        aria-label="Animated replay of a measured Vaerion refusal: a restricted deploy step is denied by the broker with E1300, and both the refusal log and the failed run journal verify."
        role="img"
        className={`${MONO_FONT} min-h-[380px] overflow-x-auto p-4 text-[12.5px] leading-[1.8] sm:min-h-[360px] sm:text-[13px]`}
      >
        {SCRIPT.slice(0, shown).map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
          >
            {step.node}
          </motion.div>
        ))}
        {complete ? (
          <span className="block">
            <span className={DIM}>{"$ "}</span>
            <span className="animate-pulse text-zinc-400">{"▊"}</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
