"use client";

/**
 * Vaerion — the Trust Engine View (PHASE 17 — EXPERIENCE AWAKENING).
 *
 * Mission-control presentation of Vaerion's one advantage: EVIDENCE.
 * Three instruments, all fed by the live `/api/knowledge` record —
 * nothing here is invented, simulated, or decorated:
 *
 *   TrustConsoles   four glass consoles — Permissions, Journals,
 *                   Receipts, Verification — the measured state at a
 *                   glance, each with a live-system beacon.
 *   JournalChain    the release ledger rendered as cryptographic
 *                   evidence FLOWING: genesis → ledger sequence →
 *                   signed receipts → provenanced artifacts →
 *                   channels, connected by animated gold evidence
 *                   lines (dash-flow), the diamond checkpoints of the
 *                   mark's own motif. Not a table.
 *   EvidenceStream  the build order as an agent-activity timeline —
 *                   every stage a verification checkpoint with its
 *                   measured conformance state.
 *
 * Honesty law: absence renders as absence (no release → an explicit
 * absence panel), loading renders as skeletons, errors render as
 * errors. Numbers come from the record of record.
 *
 * Citations: PHASE 17 mission (trust visualization, agent activity,
 * premium dashboard); src/components/launch/api.ts (the measured-data
 * contract); FACTS (site law); brand/official/MANIFEST.md.
 */

import { ArrowRight, BadgeCheck, Database, Lock, ReceiptText, ShieldCheck } from "lucide-react";

import type { KnowledgeData } from "../api";
import { releaseDate } from "../api";
import { FACTS } from "../../site/facts";
import { GlassPanel, Reveal } from "./Glass";

/* ── the live-system beacon ───────────────────────────────────────────── */

function Beacon({ tone = "bg-trust text-trust" }: { tone?: string }) {
  return <span aria-hidden className={`vx-beacon vx-blink inline-block h-1.5 w-1.5 rounded-full ${tone}`} />;
}

/* ── the four consoles ────────────────────────────────────────────────── */

export function TrustConsoles({ data }: { data: KnowledgeData }) {
  const { counts, release } = data;
  const latestReceipt = release?.receipts?.[0] ?? null;

  const consoles = [
    {
      icon: Lock,
      label: "Permissions",
      tone: "bg-violet text-violet",
      value: "fail-closed",
      valueClass: "text-[1.35rem] md:text-2xl",
      rows: ["the broker weighs every request against declared capabilities", "a durable human gate survives process death"],
      foot: "nothing executes before it is journaled",
    },
    {
      icon: Database,
      label: "Journals",
      tone: "bg-gold text-gold",
      value: String(counts.traceEntries),
      valueClass: "",
      unit: "trace entries",
      rows: ["append-only · blake3 hash-chained", "every decision written before anything runs"],
      foot: "the chain recomputes — locally, deterministically",
    },
    {
      icon: ReceiptText,
      label: "Receipts",
      tone: "bg-gold text-gold",
      value: String(counts.receipts),
      valueClass: "",
      unit: "release receipts",
      rows: latestReceipt ? [`${latestReceipt.kind} · ${latestReceipt.receiptId}`, `${latestReceipt.signatureAlgorithm} · ${latestReceipt.sha256Prefix}`] : ["folded from the journal alone", "compact, portable, tamper-evident"],
      foot: latestReceipt ? `authority: ${latestReceipt.authority}` : "no receipt of record",
    },
    {
      icon: ShieldCheck,
      label: "Verification",
      tone: "bg-trust text-trust",
      value: `${counts.stagesConformant}/${counts.stages}`,
      valueClass: "",
      unit: "stages conformant",
      rows: ["nine verification gates stand guard", "independent of the process that made the evidence"],
      foot: `artifacts of record: ${counts.artifacts} · channels: ${counts.channels}`,
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {consoles.map((c, i) => (
        <Reveal key={c.label} delay={i * 0.07}>
          <GlassPanel edgeLight className="h-full p-5 transition-transform duration-500 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-mutedfg">
                <c.icon className="h-3.5 w-3.5 text-gold" aria-hidden />
                {c.label}
              </span>
              <Beacon tone={c.tone} />
            </div>
            <p className={`mt-4 font-mono font-semibold tracking-tight text-body ${c.valueClass}`}>
              {c.value}
              {"unit" in c && c.unit ? <span className="ml-2 text-[11px] font-normal text-mutedfg">{c.unit}</span> : null}
            </p>
            <ul className="mt-3 space-y-1.5">
              {c.rows.map((row) => (
                <li key={row} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-mutedfg">
                  <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-mutedfg/60" />
                  {row}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-edge pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-mutedfg/70">{c.foot}</p>
          </GlassPanel>
        </Reveal>
      ))}
    </div>
  );
}

/* ── the evidence flow connectors ─────────────────────────────────────── */

function FlowLink({ dir }: { dir: "h" | "v" }) {
  return dir === "h" ? (
    <svg aria-hidden className="hidden h-3 w-12 shrink-0 self-center lg:block" viewBox="0 0 48 12" fill="none">
      <line x1="0" y1="6" x2="48" y2="6" stroke="rgba(212,175,55,0.5)" strokeWidth="1" className="vx-flow-line vx-dash-flow" />
      <path d="M42 2 L48 6 L42 10" stroke="rgba(212,175,55,0.7)" strokeWidth="1" fill="none" />
    </svg>
  ) : (
    <svg aria-hidden className="mx-auto h-12 w-3 shrink-0 lg:hidden" viewBox="0 0 12 48" fill="none">
      <line x1="6" y1="0" x2="6" y2="48" stroke="rgba(212,175,55,0.5)" strokeWidth="1" className="vx-flow-line vx-dash-flow" />
      <path d="M2 42 L6 48 L10 42" stroke="rgba(212,175,55,0.7)" strokeWidth="1" fill="none" />
    </svg>
  );
}

const NODE_TONES = {
  genesis: { diamond: "border-mutedfg/50 bg-surface-2", label: "text-mutedfg" },
  ledger: { diamond: "border-violet/70 bg-violet/15", label: "text-violet-soft" },
  receipt: { diamond: "border-gold bg-gold", label: "text-gold" },
  artifacts: { diamond: "border-gold/60 bg-gold/10", label: "text-gold-soft" },
  channels: { diamond: "border-trust/60 bg-trust/10", label: "text-trust" },
} as const;

type ChainNode = {
  kind: keyof typeof NODE_TONES;
  title: string;
  sub: string;
  meta?: string;
};

/* ── the journal chain — cryptographic evidence flowing ───────────────── */

export function JournalChain({ data }: { data: KnowledgeData }) {
  const { release, counts } = data;

  const nodes: ChainNode[] = [];
  nodes.push({ kind: "genesis", title: "GENESIS", sub: "ledger origin · parent of record" });
  if (release) {
    nodes.push({
      kind: "ledger",
      title: `SEQ ${release.seq}`,
      sub: `${release.releaseId} · v${release.version}`,
      meta: `issued ${releaseDate(release.appendedAt)} · parent ${release.parentReleaseId ?? "genesis"}`,
    });
    for (const r of release.receipts) {
      nodes.push({ kind: "receipt", title: r.kind.toUpperCase(), sub: r.receiptId, meta: `${r.signatureAlgorithm} · sha256 ${r.sha256Prefix}` });
    }
    nodes.push({ kind: "artifacts", title: `${counts.artifacts} ARTIFACTS`, sub: "every artifact names its origin", meta: "provenance carried on the record" });
    nodes.push({ kind: "channels", title: `${counts.channels} CHANNELS`, sub: "signed distribution of record", meta: "delivery is Founder-gated" });
  }

  return (
    <GlassPanel edgeLight className="overflow-hidden p-5 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-mutedfg">
          <BadgeCheck className="h-3.5 w-3.5 text-gold" aria-hidden />
          the journal chain — evidence, flowing
        </p>
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mutedfg/70">
          <Beacon />
          live from /api/knowledge
        </p>
      </div>

      {!release ? (
        <p className="mt-6 rounded-xl border border-warnx/30 bg-warnx/[0.06] p-4 font-mono text-[12px] leading-relaxed text-warnx">
          no release of record is folded yet — the chain has nothing to render, and nothing is invented in its place.
        </p>
      ) : (
        <ol className="mt-6 flex flex-col gap-1 lg:flex-row lg:items-stretch lg:gap-0" aria-label="The release ledger as a cryptographic chain">
          {nodes.map((n, i) => {
            const tone = NODE_TONES[n.kind];
            const last = i === nodes.length - 1;
            return (
              <li key={`${n.kind}-${i}-${n.title}`} className="flex flex-col lg:flex-row lg:items-stretch">
                <Reveal delay={Math.min(i * 0.06, 0.42)} className="min-w-0">
                  <div className="group relative h-full rounded-xl border border-edge bg-well/60 p-4 transition-colors duration-300 hover:border-gold/30 lg:w-[172px]">
                    <span aria-hidden className={`inline-block h-2.5 w-2.5 rotate-45 rounded-[2px] border ${tone.diamond}`} />
                    <p className={`mt-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] ${tone.label}`}>{n.title}</p>
                    <p className="mt-1 break-all font-mono text-[10.5px] leading-relaxed text-mutedfg">{n.sub}</p>
                    {n.meta ? <p className="mt-1.5 font-mono text-[9.5px] leading-relaxed text-mutedfg/60">{n.meta}</p> : null}
                  </div>
                </Reveal>
                {!last ? <FlowLink dir="h" /> : null}
              </li>
            );
          })}
        </ol>
      )}

      <p className="mt-6 border-t border-edge pt-4 font-mono text-[10.5px] leading-relaxed text-mutedfg/70">
        verification recomputes the chain — blake3, locally, byte-for-byte. the process ends; the evidence remains.
      </p>
    </GlassPanel>
  );
}

/* ── the agent activity stream — the build order, measured ────────────── */

export function EvidenceStream({ data }: { data: KnowledgeData }) {
  const { stages } = data;

  return (
    <GlassPanel edgeLight className="overflow-hidden p-5 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-mutedfg">
          <ShieldCheck className="h-3.5 w-3.5 text-gold" aria-hidden />
          agent activity — the build order, measured
        </p>
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mutedfg/70">
          <Beacon />
          {data.counts.stagesConformant}/{data.counts.stages} conformant
        </p>
      </div>

      <ol className="relative mt-6 space-y-0" aria-label="The Volume IV build order as verification checkpoints">
        {stages.map((s, i) => {
          const last = i === stages.length - 1;
          const ok = s.status === "conformant";
          return (
            <li key={s.id} className="relative flex gap-4 pb-5 last:pb-0">
              {!last ? (
                <span aria-hidden className="absolute bottom-0 left-[7.5px] top-[24px] w-px bg-gradient-to-b from-gold/40 via-edge to-edge" />
              ) : null}
              <span
                aria-hidden
                className={`relative z-10 mt-[6px] inline-flex h-[15px] w-[15px] shrink-0 rotate-45 rounded-[2px] border ${
                  ok ? "border-trust bg-trust/20 shadow-[0_0_10px_rgba(52,178,123,0.45)]" : "border-warnx bg-warnx/10"
                }`}
              />
              <Reveal delay={Math.min(i * 0.05, 0.3)} className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.1em] text-body">
                    <span className="text-mutedfg/50">{String(s.id).padStart(2, "0")} · </span>
                    {s.name}
                  </p>
                  <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${ok ? "text-trust" : "text-warnx"}`}>{s.status}</span>
                </div>
                <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-mutedfg">{s.purpose}</p>
              </Reveal>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex items-center justify-between border-t border-edge pt-4">
        <p className="font-mono text-[10.5px] text-mutedfg/70">stage manifest of record · live</p>
        <a
          href="#/observatory"
          className="group inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-bright"
        >
          Release Observatory
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </a>
      </div>
    </GlassPanel>
  );
}

/* ── loading skeletons (glass) ────────────────────────────────────────── */

export function TrustEngineSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Reading the trust record">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="vx-skeleton h-3 w-20 rounded" />
            <div className="vx-skeleton mt-4 h-7 w-24 rounded" />
            <div className="vx-skeleton mt-3 h-3 w-full rounded" />
            <div className="vx-skeleton mt-1.5 h-3 w-2/3 rounded" />
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl p-5 md:p-7">
        <div className="vx-skeleton h-3 w-48 rounded" />
        <div className="mt-6 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="vx-skeleton h-28 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── the nine gates (fail-closed law, from FACTS) ─────────────────────── */

export function GateChips({ className }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className ?? ""}`} aria-label="The nine verification gates">
      {FACTS.verification.gates.map((gate) => (
        <li
          key={gate}
          className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-well/70 px-3 py-1.5 font-mono text-[10.5px] tracking-[0.06em] text-mutedfg transition-colors duration-300 hover:border-gold/30 hover:text-body"
        >
          <ShieldCheck className="h-3 w-3 text-trust" aria-hidden />
          {gate}
        </li>
      ))}
    </ul>
  );
}
