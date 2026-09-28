"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy, ArrowRight, AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────  layout primitives  ─────────────────────────
 * Control-surface law (console v5 — PHASE 17): surfaces are frosted
 * glass carrying luminous hairlines and internal highlights; gold only
 * marks verified evidence and the one primary action. Depth is light,
 * not gray fill.  */

export function Section({
  id,
  index,
  label,
  title,
  lead,
  children,
  className,
  tight,
}: {
  id?: string;
  index?: string;
  label?: string;
  title?: string;
  lead?: string;
  children?: ReactNode;
  className?: string;
  tight?: boolean;
}) {
  return (
    <section id={id} aria-label={label ?? title} className={cn(tight ? "py-10" : "py-14 md:py-20", className)}>
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 md:px-12">
        {label ? (
          <p className="mb-4 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-mutedfg">
            {index ? <span aria-hidden>{index}</span> : null}
            {index ? <span aria-hidden className="h-px w-8 bg-edge" /> : null}
            {label}
          </p>
        ) : null}
        {title ? (
          <h2 className="max-w-3xl text-balance text-xl font-medium tracking-[-0.01em] text-body md:text-2xl">{title}</h2>
        ) : null}
        {lead ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mutedfg">{lead}</p> : null}
        {children ? <div className="mt-8 md:mt-10">{children}</div> : null}
      </div>
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-edge bg-ink">
      <div className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-12 sm:px-8 md:px-12 md:pb-16 md:pt-16">
        <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-mutedfg">{eyebrow}</p>
        <h1 className="max-w-3xl text-balance text-2xl font-medium tracking-[-0.01em] text-body md:text-[2rem] md:leading-[1.15]">
          {title}
        </h1>
        {lead ? <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mutedfg md:text-[15px]">{lead}</p> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </header>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass rounded-2xl", className)}>{children}</div>;
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "gold" | "trust" | "warn" | "fail" | "info";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-edge bg-surface-2 text-mutedfg",
    gold: "border-gold/40 bg-gold/10 text-gold",
    trust: "border-trust/40 bg-trust/10 text-trust",
    warn: "border-warnx/40 bg-warnx/10 text-warnx",
    fail: "border-failx/40 bg-failx/10 text-failx",
    info: "border-signal/40 bg-signal/10 text-signal",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Honesty marker — UNVERIFIED / Founder-gated / rc status. Part of the brand. */
export function Honesty({ children, tone = "warn" }: { children: ReactNode; tone?: "warn" | "fail" | "info" | "neutral" }) {
  return (
    <Pill tone={tone} className="uppercase">
      <AlertTriangle className="h-3 w-3" aria-hidden />
      {children}
    </Pill>
  );
}

/* ─────────────────────────  content primitives  ──────────────────────── */

export function Stat({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="glass rounded-2xl p-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-gold/25">
      <p className="font-mono text-xl font-semibold tracking-tight text-body md:text-2xl">{value}</p>
      <p className="mt-1 text-[13px] font-medium text-body">{label}</p>
      {sub ? <p className="mt-0.5 font-mono text-[11px] text-mutedfg">{sub}</p> : null}
    </div>
  );
}

export function Bullets({ items, tone = "gold" }: { items: string[]; tone?: "gold" | "trust" }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-mutedfg">
          <span aria-hidden className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-[1px]", tone === "gold" ? "bg-mutedfg/50" : "bg-trust/70")} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ArrowLink({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group inline-flex items-center gap-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-mutedfg transition-colors hover:text-body"
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </a>
  );
}

export function Callout({
  kind = "info",
  title,
  children,
}: {
  kind?: "info" | "honesty" | "security";
  title: string;
  children: ReactNode;
}) {
  const map = {
    info: { icon: Info, cls: "border-signal/30 bg-signal/[0.06]", iconCls: "text-signal" },
    honesty: { icon: AlertTriangle, cls: "border-warnx/30 bg-warnx/[0.06]", iconCls: "text-warnx" },
    security: { icon: ShieldCheck, cls: "border-trust/30 bg-trust/[0.06]", iconCls: "text-trust" },
  } as const;
  const m = map[kind];
  const Icon = m.icon;
  return (
    <div className={cn("rounded-md border p-4", m.cls)}>
      <p className={cn("flex items-center gap-2 font-mono text-[12px] font-semibold uppercase tracking-[0.1em]", m.iconCls)}>
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {title}
      </p>
      <div className="mt-2 text-sm leading-relaxed text-mutedfg">{children}</div>
    </div>
  );
}

/* ─────────────────────────  code & terminal  ─────────────────────────── */

export function CodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    // Clipboard API first; textarea fallback for restricted contexts —
    // the check state only shows on a real copy (honest feedback).
    let ok = false;
    try {
      await navigator.clipboard.writeText(code);
      ok = true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };
  return (
    <div className="min-w-0 w-full overflow-hidden rounded-md border border-edge bg-well">
      <div className="flex items-center justify-between border-b border-edge/70 px-3.5 py-2">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mutedfg">{title ?? "shell"}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-mutedfg transition-colors hover:bg-surface-2 hover:text-body focus-visible:outline-2 focus-visible:outline-gold"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-trust" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
        </button>
      </div>
      <pre className="vx-scroll overflow-x-auto p-3.5 text-[12.5px] leading-relaxed text-[#C9CED6]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export type TermLine = { kind: "cmd" | "out" | "ok" | "gold" | "dim" | "fail"; text: string };

export function Terminal({ title = "vae — terminal", lines, className }: { title?: string; lines: TermLine[]; className?: string }) {
  const colors: Record<TermLine["kind"], string> = {
    cmd: "text-[#EDEFF3]",
    out: "text-[#8A919C]",
    ok: "text-trust",
    gold: "text-gold-bright",
    dim: "text-[#5A616C]",
    fail: "text-failx",
  };
  return (
    <div className={cn("min-w-0 w-full overflow-hidden rounded-md border border-edge bg-well", className)}>
      <div className="flex items-center gap-2 border-b border-edge/70 bg-surface px-3.5 py-2">
        <span className="h-1.5 w-1.5 rounded-[1px] bg-edge" aria-hidden />
        <span className="ml-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mutedfg">{title}</span>
      </div>
      <pre className="vx-scroll overflow-x-auto p-3.5 font-mono text-[12px] leading-[1.75]">
        <code>
          {lines.map((l, i) => (
            <span key={i} className={cn("block whitespace-pre", colors[l.kind])}>
              {l.kind === "cmd" ? <span className="text-mutedfg">$ </span> : null}
              {l.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

/* ─────────────────────────  buttons  ─────────────────────────────────── */

export function GoldButton({ href, children, external, className }: { href: string; children: ReactNode; external?: boolean; className?: string }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-5 text-[13px] font-semibold tracking-[0.01em] text-[#181204] transition-all duration-300 hover:shadow-[0_0_34px_-6px_rgba(212,175,55,0.55),inset_0_1px_0_rgba(255,255,255,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        "[background:linear-gradient(135deg,#f0d86a,#d4af37_52%,#c19b2f)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_30px_-12px_rgba(212,175,55,0.45)] hover:brightness-110 active:brightness-95",
        className,
      )}
    >
      {children}
    </a>
  );
}

export function GhostButton({ href, children, external, className }: { href: string; children: ReactNode; external?: boolean; className?: string }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "glass inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-5 text-[13px] font-medium text-body transition-all duration-300 hover:border-violet/40 hover:text-violet-soft hover:shadow-[0_0_28px_-10px_rgba(139,124,246,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        className,
      )}
    >
      {children}
    </a>
  );
}

export function CTARow({ primary, secondary }: { primary: ReactNode; secondary?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {primary}
      {secondary}
    </div>
  );
}
