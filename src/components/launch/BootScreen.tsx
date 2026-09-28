"use client";

/**
 * Vaerion — the Boot Screen (Phase 12, order section 4: "loading screen
 * integration").
 *
 * A brief, skippable entry moment for the launch site. It asserts NO
 * measurements — only the identity, the thesis line, and the real
 * verification commands of record (the same commands a developer runs;
 * no fabricated output is ever printed). Reduced-motion users skip it
 * entirely; it shows once per browser session.
 *
 * The mark rendered is the Logo component's asset slot — the Founder's
 * official logo propagates here automatically (brand/official/MANIFEST.md).
 *
 * Citations: Phase 12 execution order section 4; FACTS (site law);
 * docs/operations/DEPLOYMENT.md (the command names).
 */

import { useEffect, useRef, useState } from "react";

import { Logo, Wordmark } from "./Logo";

const BOOT_LINES = [
  "vaerion:verify-constitution",
  "vaerion:verify-everything",
  "vaerion:verify-documentation",
] as const;

const BOOT_MS = 1900;

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const doneRef = useRef(false);

  const finish = useRef(() => {
    if (!doneRef.current) {
      doneRef.current = true;
      onDone();
    }
  });

  useEffect(() => {
    finish.current = () => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    };
  }, [onDone]);

  useEffect(() => {
    const lineInterval = Math.floor(BOOT_MS / (BOOT_LINES.length + 1));
    const timers = [
      ...BOOT_LINES.map((_, i) => window.setTimeout(() => setStep(i + 1), lineInterval * (i + 1))),
      window.setTimeout(() => finish.current(), BOOT_MS),
    ];
    const skip = (): void => finish.current();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-label="Vaerion — entering the archive"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
    >
      {/* the entry atmosphere — one gold light field behind the official mark */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.14) 0%, rgba(139,124,246,0.08) 42%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />
      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="vx-sheen relative mb-6 overflow-hidden rounded-2xl glass-raised edge-light p-2">
          <Logo size={52} />
        </div>
        <Wordmark className="text-base md:text-lg" />
        <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-mutedfg">
          Trust infrastructure for autonomous AI systems.
        </p>

        <div className="mt-8 h-px w-56 overflow-hidden rounded-full bg-edge" aria-hidden>
          <div
            className="h-full bg-gradient-to-r from-gold-soft via-gold to-gold-bright shadow-[0_0_12px_rgba(212,175,55,0.8)] transition-[width] ease-linear"
            style={{ width: `${Math.min(100, (step / BOOT_LINES.length) * 100)}%` }}
          />
        </div>

        <ul className="mt-6 min-h-[4.5rem] space-y-1.5" aria-hidden>
          {BOOT_LINES.map((line, i) => (
            <li
              key={line}
              className={`font-mono text-[11px] tracking-[0.08em] transition-opacity duration-300 ${
                i < step ? "opacity-100 text-mutedfg" : "opacity-0"
              }`}
            >
              <span className="text-gold/70">»</span> {line}
            </li>
          ))}
        </ul>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-mutedfg/60">
          press any key to enter
        </p>
      </div>
    </div>
  );
}

/** Gate deciding whether the boot screen may run at all (law, not preference). */
export function bootAllowed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.sessionStorage.getItem("vaerion-boot-shown") === "1") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  } catch {
    return false;
  }
  return true;
}

export function markBootShown(): void {
  try {
    window.sessionStorage.setItem("vaerion-boot-shown", "1");
  } catch {
    // storage unavailable — the boot simply may repeat; no state is invented
  }
}
