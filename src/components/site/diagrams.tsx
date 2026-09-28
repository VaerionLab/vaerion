"use client";

import { Fingerprint, Scale, FileText, ShieldCheck, ArrowDown, ArrowRight, Ban, Lock, KeyRound, GitBranch, Database, ReceiptText, Boxes, Cpu, TerminalSquare, Globe, Braces, UserCheck, FileWarning, Bot, Play, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════════════
 * Diagrams for the Vaerion site. All visuals are drawn from the measured
 * architecture (docs/adr/, packages/vaerion/src layout, layerlint law).
 * No invented layers, no invented steps.
 * ════════════════════════════════════════════════════════════════════════ */

/* ─────────  The trust pipeline: agent → verification (publication form)  ───────── */
/* The six stages every agent action passes through. The first five are the
 * action in motion — outlined nodes on the spine. The sixth is the deposit:
 * rendered as the solid gold node, the same stroke-and-deposit statement as
 * the mark itself. Action happens. Evidence remains.                     */

const PIPELINE = [
  {
    icon: Bot,
    name: "AI agent",
    text: "The agent requests an action — a file write, a tool call, a package build.",
  },
  {
    icon: ShieldCheck,
    name: "Governance",
    text: "The request meets the fail-closed broker and is weighed against the capabilities declared in vaerion.yaml.",
  },
  {
    icon: Scale,
    name: "Policy decision",
    text: "Allow or refuse. The decision is written to the hash-chained journal before anything executes.",
  },
  {
    icon: Play,
    name: "Execution",
    text: "Only a journaled allow runs. Destructive work can require a durable human gate that survives process death.",
  },
  {
    icon: ReceiptText,
    name: "Receipt",
    text: "Steps land on the append-only journal; a receipt folds from the chain — compact, portable, tamper-evident.",
  },
  {
    icon: BadgeCheck,
    name: "Verification",
    text: "Any later process recomputes the chain and verifies the receipt — independent of the process that made it.",
  },
] as const;

export function TrustPipeline() {
  return (
    <div className="mx-auto w-full max-w-[760px]">
      <ol aria-label="The six stages from agent action to verified evidence">
        {PIPELINE.map((s, i) => {
          const last = i === PIPELINE.length - 1;
          return (
            <li key={s.name} className="relative flex gap-4 pb-7 last:pb-0 md:gap-5">
              {!last ? <span aria-hidden className="absolute left-[7px] top-[28px] -bottom-1 w-px bg-edge" /> : null}
              <span
                aria-hidden
                className={cn(
                  "relative z-10 mt-[5px] inline-flex h-[15px] w-[15px] shrink-0 rotate-45 rounded-[2px] border",
                  last ? "border-gold bg-gold" : "border-mutedfg/50 bg-surface-2",
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-body">{s.name}</p>
                  <span className="font-mono text-[10px] text-mutedfg/60" aria-hidden>
                    0{i + 1}
                  </span>
                </div>
                <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-mutedfg">{s.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-8 flex items-center justify-center gap-2.5 text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-mutedfg">
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
          <path d="M6,0 L12,6 L6,12 L0,6 Z" fill="var(--vx-gold)" />
        </svg>
        the process ends — the evidence remains
      </p>
    </div>
  );
}

/* ───────────  The proof pipeline: Identity → Governance → Evidence → Verification  ─────────── */

const FLOW = [
  {
    icon: Fingerprint,
    name: "Identity",
    text: "Declared capabilities in vaerion.yaml — what the agent may do, pinned and versioned.",
  },
  {
    icon: Scale,
    name: "Governance",
    text: "The fail-closed permission broker decides before anything acts. Refusals are journaled too.",
  },
  {
    icon: FileText,
    name: "Evidence",
    text: "Every step lands on an append-only, blake3-chained journal — single writer, no silent edits.",
  },
  {
    icon: ShieldCheck,
    name: "Verification",
    text: "Receipts fold from the journal and verify independently of the process that produced them.",
  },
] as const;

export function ProofFlow({ compact }: { compact?: boolean }) {
  return (
    <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {FLOW.map((stage, i) => (
        <li key={stage.name} className="relative">
          <div className="h-full rounded-md border border-edge bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-edge bg-surface-2 text-mutedfg">
                <stage.icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="font-mono text-[10px] text-mutedfg/60">0{i + 1}</span>
            </div>
            <p className="mt-4 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-body">{stage.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-mutedfg">{compact ? stage.text.split(" — ")[0] : stage.text}</p>
          </div>
          {i < FLOW.length - 1 ? (
            <>
              <ArrowRight className="absolute -right-[26px] top-1/2 hidden h-5 w-5 -translate-y-1/2 text-mutedfg/40 lg:block" aria-hidden />
              <ArrowDown className="absolute -bottom-[26px] left-1/2 h-5 w-5 -translate-x-1/2 text-mutedfg/40 sm:bottom-auto sm:left-auto sm:-right-[26px] sm:top-1/2 sm:h-4 sm:w-4 sm:-translate-y-1/2 sm:translate-x-0 lg:hidden" aria-hidden />
            </>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/* ───────────  Engine layers (L0 → L4, the layerlint law)  ─────────── */

const LAYERS = [
  {
    id: "L4",
    name: "Surfaces",
    icon: TerminalSquare,
    modules: ["CLI — vae", "daemon — loopback HTTP/SSE", "TypeScript SDK (@vaerion/sdk)"],
    note: "Everything a developer touches; thin over L1–L2.",
  },
  {
    id: "L2",
    name: "Runtime & intelligence",
    icon: Cpu,
    modules: ["runtime", "research", "agents", "extensions — WASI-P2 sandbox"],
    note: "Capability-brokered execution; extensions run sha256-pin-verified in a subprocess host.",
  },
  {
    id: "L1",
    name: "The spine",
    icon: Database,
    modules: ["journal — blake3 chain", "store — SQLite WAL", "receipts", "broker — fail-closed", "gateway — single egress seam"],
    note: "One event spine, one writer, one permission authority, one network seam.",
  },
  {
    id: "L0",
    name: "Kernel",
    icon: Boxes,
    modules: ["envelope", "clock", "errors — E-codes", "config — VaerYaml"],
    note: "Deterministic primitives; nothing ambient, nothing hidden.",
  },
] as const;

export function LayerDiagram() {
  return (
    <div className="space-y-3">
      {LAYERS.map((l) => (
        <div key={l.id} className="rounded-md border border-edge bg-surface p-4 md:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-8 items-center gap-2 rounded-md border border-edge bg-surface-2 px-3 font-mono text-[11px] font-semibold tracking-[0.08em] text-body">
              <l.icon className="h-3.5 w-3.5 text-mutedfg" aria-hidden />
              {l.id}
            </span>
            <span className="font-mono text-[12px] font-medium text-body">{l.name}</span>
            <span className="hidden text-xs text-mutedfg md:inline">{l.note}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {l.modules.map((m) => (
              <span key={m} className="rounded-sm border border-edge bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-mutedfg">
                {m}
              </span>
            ))}
          </div>
        </div>
      ))}
      <p className="rounded-xl border border-edge bg-surface-2/50 px-4 py-3 font-mono text-[11px] leading-relaxed text-mutedfg">
        no L3 · the dependency law is enforced by layerlint on every build — a module may only depend downward
      </p>
    </div>
  );
}

/* ───────────  Broker law: decide → journal → act (fail-closed)  ─────────── */

export function BrokerSequence() {
  return (
    <div className="rounded-md border border-edge bg-surface p-5 md:p-6">
      <ol className="space-y-4">
        {[
          { icon: Scale, title: "1 · decide", text: "The broker evaluates the requested action against declared capabilities and policy." },
          { icon: FileText, title: "2 · journal", text: "The decision — allow OR refuse — is written to the hash-chained journal before anything executes." },
          { icon: UserCheck, title: "3 · act (or gate)", text: "Only a journaled allow executes. Destructive work can require a durable human gate that survives process death." },
        ].map((s, i) => (
          <li key={s.title} className="relative flex gap-4 pb-1 last:pb-0">
            {i < 2 ? <ArrowDown className="absolute -bottom-[22px] left-[17px] h-4 w-4 text-mutedfg/40" aria-hidden /> : null}
            <span className="relative z-10 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-edge bg-surface-2 text-mutedfg">
              <s.icon className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="font-mono text-sm font-semibold text-body">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-mutedfg">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-failx/30 bg-failx/[0.06] p-4">
        <Ban className="mt-0.5 h-4 w-4 shrink-0 text-failx" aria-hidden />
        <p className="text-sm leading-relaxed text-mutedfg">
          <span className="font-semibold text-failx">Fail-closed:</span> an undecided or refused action never runs. Refusals land on a
          separate hash-chained refusal log — rejections are evidence too.
        </p>
      </div>
    </div>
  );
}

/* ───────────  Receipt chain: run → journal → receipt → verify  ─────────── */

export function ReceiptChain() {
  const steps = [
    { icon: GitBranch, title: "Run", text: "An agent action executes through the broker-gated pipeline." },
    { icon: FileText, title: "Journal", text: "Each step appends a blake3-chained record — single writer, append-only." },
    { icon: ReceiptText, title: "Receipt", text: "A receipt folds from the journal: compact, portable, tamper-evident." },
    { icon: ShieldCheck, title: "Verify", text: "Any later process recomputes the chain — the receipt verifies independently." },
  ] as const;
  return (
    <div>
      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} className="relative">
            <div className="h-full rounded-md border border-edge bg-surface p-5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-edge bg-surface-2 text-mutedfg">
                <s.icon className="h-4 w-4" aria-hidden />
              </span>
              <p className="mt-4 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-body">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-mutedfg">{s.text}</p>
            </div>
            {i < steps.length - 1 ? (
              <ArrowRight className="absolute -right-[26px] top-1/2 hidden h-5 w-5 -translate-y-1/2 text-mutedfg/40 lg:block" aria-hidden />
            ) : null}
          </li>
        ))}
      </ol>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-trust/30 bg-trust/[0.06] p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-trust" aria-hidden />
          <p className="text-sm leading-relaxed text-mutedfg">
            <span className="font-semibold text-trust">Pure check:</span> verification recomputes digests and compares pins — it never
            executes bundle or journal content.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-failx/30 bg-failx/[0.06] p-4">
          <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-failx" aria-hidden />
          <p className="text-sm leading-relaxed text-mutedfg">
            <span className="font-semibold text-failx">Tamper is a named finding:</span> flipped bytes, swapped pins, or a torn chain fail
            with a specific E-code, not a generic error.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───────────  Security seams (for the security page)  ─────────── */

export function SecuritySeams() {
  const seams = [
    {
      icon: Globe,
      title: "One egress seam",
      text: "All model I/O passes a single sanctioned gateway gate (ADR-0019); endpoints are pinned in code. Nothing else dials out.",
    },
    {
      icon: Lock,
      title: "Secrets never enter evidence",
      text: "OS-keychain-first resolution (ADR-0013); secrets never enter journals, receipts, or bundles — enforced by constitutional checks.",
    },
    {
      icon: KeyRound,
      title: "Loopback daemon + pairing token",
      text: "The daemon refuses any non-loopback bind; every state-changing call requires a pairing token printed once (ADR-0010).",
    },
    {
      icon: Boxes,
      title: "Capability-brokered extensions",
      text: "Extensions run in a subprocess host with sha256 pin verification and WASI-P2 capability scoping (ADR-0009).",
    },
  ] as const;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {seams.map((s) => (
        <div key={s.title} className="rounded-md border border-edge bg-surface p-5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-edge bg-surface-2 text-mutedfg">
            <s.icon className="h-4 w-4" aria-hidden />
          </span>
          <p className="mt-4 font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-body">{s.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-mutedfg">{s.text}</p>
        </div>
      ))}
    </div>
  );
}

/* ───────────  Braces helper (SDK snippet header chip)  ─────────── */

export function SurfaceChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm border border-edge bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-mutedfg", className)}>
      <Braces className="h-3 w-3 text-mutedfg" aria-hidden />
      {children}
    </span>
  );
}
