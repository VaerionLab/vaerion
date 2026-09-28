"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════════════
 * The Governance Console — the signature interface of the site.
 *
 * A live session ledger plus an append-only journal stream. Every event
 * type shown here is real vocabulary from spec/events/registry.json —
 * nothing invented. The console walks three deterministic scenarios:
 *
 *   A · ALLOW    — a granted action runs and folds a receipt
 *   B · REFUSE   — a fail-closed denial; the no is journaled evidence
 *   C · FAILED   — an execution failure; the chain survives and proves it
 *
 * Honesty law: this is labeled a deterministic simulation. It demonstrates
 * the documented pipeline; it does not run the engine.
 *
 * Motion law: one loop — the stage advance. The active stage pulses.
 * Reduced motion renders the completed allow session, statically.
 * ════════════════════════════════════════════════════════════════════════ */

type Outcome = "allow" | "refuse" | "failed";

type Row = {
  label: string;
  event: string; // real event type from spec/events/registry.json
  detail: string;
  kind?: "decision" | "evidence";
};

type JournalLine = { ts: string; text: string };

type Scenario = {
  id: string;
  outcome: Outcome;
  runId: string;
  rows: Row[];
  journal: JournalLine[];
  receipt: { id: string; prev: string; records: number };
};

const SCENARIOS: Scenario[] = [
  {
    id: "A",
    outcome: "allow",
    runId: "run_7c21k3 · session open",
    rows: [
      { label: "Session", event: "run.opened", detail: "run_7c21k3 opened — journal chain starts at genesis" },
      { label: "Agent", event: "agent.run.started", detail: "research-agent-01 · capabilities pinned in vaerion.yaml" },
      { label: "Intent", event: "tool.call.requested", detail: "read ./sources/*.md — 4 declared paths" },
      { label: "Governance", event: "broker.audit.appended", detail: "identity ✓ · capability ✓ · bounds ✓ · budget ✓" },
      { label: "Decision", event: "broker.decision.recorded", detail: "ALLOW — journaled before anything executes", kind: "decision" },
      { label: "Execution", event: "tool.call.completed", detail: "result content-addressed · blob b3:91ce…stored" },
      { label: "Evidence", event: "receipt.issued", detail: "receipt rcp_8f92a71d folded from the journal chain", kind: "evidence" },
      { label: "Verification", event: "journal.verified", detail: "chain recomputed · 42 records · valid", kind: "evidence" },
    ],
    journal: [
      { ts: "14:02:11.204", text: "run.opened — chain genesis b3:a4f2…9d10" },
      { ts: "14:02:11.588", text: "agent.run.started — research-agent-01 · planner: supervised" },
      { ts: "14:02:11.962", text: "tool.call.requested — read ./sources/*.md" },
      { ts: "14:02:12.341", text: "broker.audit.appended — 4 checks passed" },
      { ts: "14:02:12.719", text: "broker.decision.recorded — ALLOW" },
      { ts: "14:02:13.107", text: "tool.call.completed — blob b3:91ce…44d2" },
      { ts: "14:02:13.488", text: "receipt.issued — rcp_8f92a71d47c2" },
      { ts: "14:02:13.861", text: "journal.verified — chain intact · 42 records" },
    ],
    receipt: { id: "rcp_8f92a71d47c2", prev: "b3:4d1f…9a02", records: 42 },
  },
  {
    id: "B",
    outcome: "refuse",
    runId: "run_9e04m8 · session open",
    rows: [
      { label: "Session", event: "run.opened", detail: "run_9e04m8 opened — journal chain starts at genesis" },
      { label: "Agent", event: "agent.run.started", detail: "deploy-agent-02 · deploy.promote was never granted" },
      { label: "Intent", event: "tool.call.requested", detail: "deploy.promote → production" },
      { label: "Governance", event: "broker.audit.appended", detail: "identity ✓ · capability ✗ — not in declared grants" },
      { label: "Decision", event: "broker.decision.recorded", detail: "REFUSE — fail-closed · an undecided action never runs", kind: "decision" },
      { label: "Execution", event: "tool.call.denied", detail: "nothing executed · the denial itself is journaled", kind: "decision" },
      { label: "Evidence", event: "journal.record.appended", detail: "refusal record appended — rejection is evidence too", kind: "evidence" },
      { label: "Verification", event: "journal.verified", detail: "the refusal chain verifies — the no is provable", kind: "evidence" },
    ],
    journal: [
      { ts: "09:17:03.112", text: "run.opened — chain genesis b3:c80e…71f4" },
      { ts: "09:17:03.507", text: "agent.run.started — deploy-agent-02 · planner: supervised" },
      { ts: "09:17:03.881", text: "tool.call.requested — deploy.promote → production" },
      { ts: "09:17:04.254", text: "broker.audit.appended — capability check failed" },
      { ts: "09:17:04.636", text: "broker.decision.recorded — REFUSE (fail-closed)" },
      { ts: "09:17:05.012", text: "tool.call.denied — no execution, no side effects" },
      { ts: "09:17:05.393", text: "journal.record.appended — refusal record b3:77aa…e19c" },
      { ts: "09:17:05.772", text: "journal.verified — refusal chain intact" },
    ],
    receipt: { id: "rcp_2b60c9e15d84", prev: "b3:c80e…71f4", records: 8 },
  },
  {
    id: "C",
    outcome: "failed",
    runId: "run_5b77t2 · session open",
    rows: [
      { label: "Session", event: "run.opened", detail: "run_5b77t2 opened — journal chain starts at genesis" },
      { label: "Agent", event: "agent.run.started", detail: "atlas-03 · publish capability granted" },
      { label: "Intent", event: "tool.call.requested", detail: "bundle.publish --registry" },
      { label: "Governance", event: "broker.audit.appended", detail: "identity ✓ · capability ✓ · budget ✓ — allowed" },
      { label: "Decision", event: "broker.decision.recorded", detail: "ALLOW — journaled before anything executes", kind: "decision" },
      { label: "Execution", event: "agent.step.failed", detail: "E_EXEC_TIMEOUT · retries exhausted — the step failed", kind: "decision" },
      { label: "Evidence", event: "receipt.issued", detail: "the failure folds into the receipt — nothing hidden", kind: "evidence" },
      { label: "Verification", event: "journal.verified", detail: "chain intact through failure — failures are provable", kind: "evidence" },
    ],
    journal: [
      { ts: "22:41:57.034", text: "run.opened — chain genesis b3:e2b9…04ac" },
      { ts: "22:41:57.421", text: "agent.run.started — atlas-03 · planner: supervised" },
      { ts: "22:41:57.799", text: "tool.call.requested — bundle.publish --registry" },
      { ts: "22:41:58.176", text: "broker.audit.appended — allowed · budget reserved" },
      { ts: "22:41:58.553", text: "broker.decision.recorded — ALLOW" },
      { ts: "22:42:03.918", text: "agent.step.failed — E_EXEC_TIMEOUT · retries exhausted" },
      { ts: "22:42:04.307", text: "receipt.issued — rcp_c73a5f02be91 · failure included" },
      { ts: "22:42:04.684", text: "journal.verified — chain intact · state: failed" },
    ],
    receipt: { id: "rcp_c73a5f02be91", prev: "b3:e2b9…04ac", records: 27 },
  },
];

const STAGE_MS = 1150;
const HOLD_TICKS = 2; // the beat after each session completes
const TICKS_PER = SCENARIOS[0].rows.length + HOLD_TICKS;
const CYCLE = TICKS_PER * SCENARIOS.length;

/* reduced-motion as an external store — hydration-safe, no setState-in-effect */
function subscribeReducedMotion(cb: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

const OUTCOME_LABEL: Record<Outcome, string> = { allow: "ALLOW", refuse: "REFUSE", failed: "FAILED" };

function outcomeCls(o: Outcome): string {
  if (o === "allow") return "border-trust/40 bg-trust/10 text-trust";
  if (o === "refuse") return "border-failx/40 bg-failx/10 text-failx";
  return "border-warnx/40 bg-warnx/10 text-warnx";
}

function journalLineCls(event: string, outcome: Outcome): string {
  if (event === "broker.decision.recorded") return outcome === "allow" ? "text-trust" : outcome === "refuse" ? "text-failx" : "text-warnx";
  if (event === "receipt.issued" || event === "journal.verified") return "text-gold-bright";
  if (event === "agent.step.failed") return "text-warnx";
  if (event === "tool.call.denied") return "text-failx";
  return "text-mutedfg";
}

export function GovernanceConsole() {
  const [tick, setTick] = useState(0);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((t) => (t + 1) % CYCLE), STAGE_MS);
    return () => clearInterval(id);
  }, [reduced]);

  const sIdx = reduced ? 0 : Math.floor(tick / TICKS_PER) % SCENARIOS.length;
  const s = SCENARIOS[sIdx];
  const ROWS = s.rows.length;
  const t = reduced ? ROWS : tick % TICKS_PER; // stages completed; active = t when t < ROWS
  const activeRow = t < ROWS ? t : -1;
  const decided = t >= 5; // the decision row has completed
  const receiptShown = t >= 7;

  return (
    <div className="min-w-0 overflow-hidden rounded-md border border-edge bg-well">
      {/* ── console header ── */}
      <div className="flex items-center justify-between gap-3 border-b border-edge/70 bg-surface px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-body">
            Vaerion governance runtime
          </span>
          <span className="hidden truncate font-mono text-[10.5px] text-mutedfg sm:inline">{s.runId}</span>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-sm border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]",
            decided ? outcomeCls(s.outcome) : "border-edge bg-surface-2 text-mutedfg",
          )}
        >
          {decided ? OUTCOME_LABEL[s.outcome] : "PENDING"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        {/* ── session ledger ── */}
        <ol
          className="border-b border-edge/70 px-4 py-4 lg:border-b-0 lg:border-r"
          aria-label="Live governance session — deterministic simulation from agent intent to verification proof"
        >
          {s.rows.map((row, i) => {
            const done = i < t;
            const active = i === activeRow;
            const last = i === ROWS - 1;
            const dotDone =
              row.kind === "evidence"
                ? "border-gold bg-gold"
                : row.kind === "decision"
                  ? s.outcome === "allow"
                    ? "border-trust bg-trust"
                    : s.outcome === "refuse"
                      ? "border-failx bg-failx"
                      : "border-warnx bg-warnx"
                  : "border-mutedfg/50 bg-mutedfg/40";
            const detailCls = active
              ? "text-body"
              : done
                ? row.kind === "evidence"
                  ? "text-gold-bright"
                  : row.kind === "decision"
                    ? s.outcome === "allow"
                      ? "text-trust"
                      : s.outcome === "refuse"
                        ? "text-failx"
                        : "text-warnx"
                    : "text-mutedfg"
                : "text-mutedfg/30";
            return (
              <li key={row.label} className="relative flex gap-3.5 pb-4 last:pb-0">
                {!last ? <span aria-hidden className="absolute left-[5px] top-[20px] -bottom-[2px] w-px bg-edge/70" /> : null}
                <span
                  aria-hidden
                  className={cn(
                    "relative z-10 mt-[3px] inline-flex h-[11px] w-[11px] shrink-0 rotate-45 items-center justify-center rounded-[1px] border transition-colors duration-500",
                    done ? dotDone : active ? row.kind === "evidence" ? "border-gold bg-transparent" : "border-body bg-transparent" : "border-edge bg-surface-2",
                  )}
                >
                  {active ? (
                    <span className={cn("vx-breathe h-[4px] w-[4px]", row.kind === "evidence" ? "bg-gold" : "bg-body/70")} />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1 pt-px">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={cn(
                        "font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] transition-colors duration-500",
                        done || active ? "text-body" : "text-mutedfg/50",
                      )}
                    >
                      {row.label}
                    </p>
                    <span className="shrink-0 font-mono text-[9.5px] text-mutedfg/50" aria-hidden>
                      {row.event}
                    </span>
                  </div>
                  <p className={cn("mt-0.5 font-mono text-[11px] leading-relaxed transition-colors duration-500", detailCls)}>
                    {done || active ? row.detail : "· · ·"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* ── journal stream ── */}
        <div className="flex min-w-0 flex-col" aria-label="Append-only journal stream — deterministic simulation">
          <div className="flex items-center justify-between px-4 pb-1 pt-3">
            <span className="font-mono text-[9.5px] font-medium uppercase tracking-[0.16em] text-mutedfg">Journal — append-only</span>
            <span className="font-mono text-[9.5px] text-mutedfg/60">blake3</span>
          </div>
          <div className="vx-scroll min-h-[248px] flex-1 overflow-y-auto px-4 pb-3 pt-1 font-mono text-[10.5px] leading-[1.8]">
            {s.journal.slice(0, Math.max(t, 0)).map((line, i) => (
              <p key={`${s.id}-${i}`} className="flex gap-2.5 whitespace-pre-wrap break-words">
                <span className="shrink-0 text-mutedfg/50">{line.ts}</span>
                <span className={journalLineCls(s.rows[i]?.event ?? "", s.outcome)}>{line.text}</span>
              </p>
            ))}
            {t === 0 ? <p className="text-mutedfg/30">awaiting first record…</p> : null}
          </div>
          {receiptShown ? (
            <div className="border-t border-gold/25 bg-gold/[0.04] px-4 py-2.5 font-mono text-[10.5px]">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-mutedfg">
                  RECEIPT_ID <span className="text-body">{s.receipt.id}</span>
                </span>
                <span className="shrink-0 font-semibold tracking-[0.18em] text-gold">VERIFIED</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-mutedfg">
                <span className="min-w-0 truncate">
                  CHAIN <span className="text-body">CONNECTED</span> · prev {s.receipt.prev}
                </span>
                <span className="shrink-0">{s.receipt.records} records</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── console footer ── */}
      <div className="flex items-center justify-between gap-3 border-t border-edge/70 bg-surface px-4 py-2">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-mutedfg">
          Deterministic simulation · runs locally · zero telemetry
        </span>
        <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.14em] text-mutedfg/70">
          {reduced ? "static view — motion reduced" : `cycle ${s.id} · ${s.outcome}`}
        </span>
      </div>
    </div>
  );
}

/* ─────────  The deposit seal — the official mark as artifact glyph (receipts, laws)  ───────── */

/**
 * PHASE 16.1 brand enforcement: the previously drawn inline V glyph (a
 * generated "Ledger V" mark) is REMOVED. This glyph now renders the
 * official Founder-provided mark only — no drawn symbols, no fallbacks.
 * The verified/unverified distinction is carried by the official tile's
 * saturation, never by a redrawn mark.
 */
export function SealGlyph({ className, verified = true }: { className?: string; verified?: boolean }) {
  return (
    <img
      src="/icon-192.png"
      alt=""
      aria-hidden
      className={cn(
        "h-9 w-9 rounded-md border border-edge/60 object-cover",
        verified ? "" : "opacity-45 grayscale",
        className,
      )}
    />
  );
}
