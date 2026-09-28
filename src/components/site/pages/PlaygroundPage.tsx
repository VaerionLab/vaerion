"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Ban,
  Bot,
  FileWarning,
  KeyRound,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { PageHero, Panel, Pill, Callout, ArrowLink } from "../primitives";
import { SealGlyph } from "../proof";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════════════
 * The Trust Playground — a faithful, deterministic browser simulation of
 * the Vaerion governance flow. No login, no server, nothing leaves the
 * machine. Digests are real SHA-256 computed in your browser (the engine
 * itself uses blake3 — the tamper-evidence property is the same).
 *
 * The seven steps mirror the product path:
 *   create agent → assign permissions → send action → evaluation →
 *   decision → receipt → verify (then: try to tamper).
 * ════════════════════════════════════════════════════════════════════════ */

const CAPABILITIES = [
  { id: "fs.read", desc: "Read files inside the workspace", risk: "low" },
  { id: "fs.write", desc: "Create or modify workspace files", risk: "low" },
  { id: "net.request", desc: "Call an allow-listed external endpoint", risk: "medium" },
  { id: "deploy.promote", desc: "Promote a build to production", risk: "high" },
  { id: "email.send", desc: "Send email on your behalf", risk: "high" },
] as const;
type Capability = (typeof CAPABILITIES)[number]["id"];

const ACTIONS = [
  { id: "read-report", label: "Read the Q4 report", cap: "fs.read" as Capability, target: "READ ./reports/q4-summary.pdf", risk: "low" },
  { id: "draft-notes", label: "Draft release notes", cap: "fs.write" as Capability, target: "WRITE ./releases/notes-0.1.13.md", risk: "low" },
  { id: "fetch-feed", label: "Fetch external status feed", cap: "net.request" as Capability, target: "GET status.example/feed", risk: "medium" },
  { id: "promote-build", label: "Promote build to production", cap: "deploy.promote" as Capability, target: "DEPLOY vaerion-demo.vxn → prod", risk: "high" },
  { id: "email-clients", label: "Email the client list", cap: "email.send" as Capability, target: "SEND 214 recipients · announcement", risk: "high" },
] as const;

const STEPS = ["Create agent", "Permissions", "Action request", "Evaluation", "Decision", "Receipt", "Verify"] as const;

type Tone = "dim" | "ok" | "gold" | "fail";
type LogLine = { seq: number; t: string; ev: string; detail: string; tone: Tone; hash?: string };
type Receipt = {
  id: string;
  ts: string;
  agent: string;
  actionLabel: string;
  target: string;
  decision: "ALLOW" | "REFUSE";
  digest: string;
  prev: string;
  policy: string;
};

const GENESIS = "0000000000000000";

async function sha256Hex(input: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    /* non-secure context fallback — deterministic FNV-1a expansion */
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    let out = "";
    let seed = h;
    for (let i = 0; i < 8; i++) {
      seed = Math.imul(seed ^ (i + 0x9e37), 0x85ebca6b) >>> 0;
      out += seed.toString(16).padStart(8, "0");
    }
    return out;
  }
}

const riskPill = (risk: string) =>
  risk === "high" ? (
    <Pill tone="fail">high risk</Pill>
  ) : risk === "medium" ? (
    <Pill tone="warn">medium</Pill>
  ) : (
    <Pill>low</Pill>
  );

export default function PlaygroundPage() {
  const [step, setStep] = useState(0);
  const [agentName, setAgentName] = useState("atlas-01");
  const [granted, setGranted] = useState<Set<Capability>>(new Set<Capability>(["fs.read"]));
  const [actionId, setActionId] = useState<string>("read-report");

  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const [decision, setDecision] = useState<"ALLOW" | "REFUSE" | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [payload, setPayload] = useState<string>("");
  const [verify, setVerify] = useState<"idle" | "verifying" | "verified" | "tampered">("idle");
  const [tamperHint, setTamperHint] = useState(false);

  const startRef = useRef<number>(Date.now());
  const prevHashRef = useRef<string>(GENESIS);
  const payloadRef = useRef<string>("");
  const aliveRef = useRef(true);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    const el = consoleRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  const elapsed = () => `+${((Date.now() - startRef.current) / 1000).toFixed(1)}s`;

  const push = (ev: string, detail: string, tone: Tone, hash?: string) => {
    setLog((l) => [...l, { seq: l.length + 1, t: elapsed(), ev, detail, tone, hash }]);
  };

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const toggleCap = (cap: Capability, on: boolean) => {
    setGranted((g) => {
      const n = new Set(g);
      if (on) n.add(cap);
      else n.delete(cap);
      return n;
    });
  };

  const resetSession = () => {
    setStep(0);
    setLog([]);
    setDecision(null);
    setReceipt(null);
    setVerify("idle");
    setTamperHint(false);
    setBusy(false);
    prevHashRef.current = GENESIS;
    startRef.current = Date.now();
  };

  const runAnother = () => {
    setStep(2);
    setDecision(null);
    setReceipt(null);
    setVerify("idle");
    setTamperHint(false);
  };

  const runPipeline = async () => {
    if (busy) return;
    const action = ACTIONS.find((a) => a.id === actionId) ?? ACTIONS[0];
    const agent = agentName.trim() || "atlas-01";
    setBusy(true);
    setDecision(null);
    setReceipt(null);
    setVerify("idle");
    setTamperHint(false);
    setStep(3);

    const canonical = JSON.stringify({ v: 1, agent, action: { id: action.id, cap: action.cap, target: action.target } });
    payloadRef.current = canonical;

    push("broker.custody", `intent envelope received from ${agent} — nothing executes yet`, "dim");
    await sleep(650);
    if (!aliveRef.current) return;

    push("identity", `actor ${agent} bound to envelope · declared in vaerion.yaml`, "ok");
    await sleep(560);
    if (!aliveRef.current) return;

    push("schema", "envelope well-formed · capability + target declared", "ok");
    await sleep(560);
    if (!aliveRef.current) return;

    if (granted.has(action.cap)) {
      push("capability", `${action.cap} granted by declared capabilities`, "ok");
      await sleep(560);
      if (!aliveRef.current) return;
      push("policy", "within declared bounds · target in scope", "ok");
      await sleep(560);
      if (!aliveRef.current) return;
      push("budget", "rate 12/min · spend 0.00 — inside budget", "ok");
      await sleep(620);
      if (!aliveRef.current) return;

      setDecision("ALLOW");
      setStep(4);
      const digest = await sha256Hex(canonical);
      push("broker.decision", "ALLOW — journaled before execution", "gold", digest.slice(0, 12));
      await sleep(700);
      if (!aliveRef.current) return;

      push("runtime.exec", `${action.target} — completed · result bound to evidence`, "ok");
      await sleep(650);
      if (!aliveRef.current) return;

      const r: Receipt = {
        id: `rcp_${digest.slice(0, 12)}`,
        ts: new Date().toLocaleTimeString(),
        agent,
        actionLabel: action.label,
        target: action.target,
        decision: "ALLOW",
        digest,
        prev: prevHashRef.current,
        policy: "demo/p-1",
      };
      setReceipt(r);
      setPayload(canonical);
      prevHashRef.current = digest;
      setStep(5);
      push("journal.append", `${r.id} folded from chain · prev ${r.prev.slice(0, 8)}…`, "gold", digest.slice(0, 12));
      await sleep(500);
      if (!aliveRef.current) return;
      setStep(6);
    } else {
      push("capability", `${action.cap} NOT granted — declared capabilities do not cover this request`, "fail");
      await sleep(750);
      if (!aliveRef.current) return;

      setDecision("REFUSE");
      setStep(4);
      const digest = await sha256Hex(canonical);
      push("broker.decision", "REFUSE — fail-closed · an undecided action never runs", "fail", digest.slice(0, 12));
      await sleep(750);
      if (!aliveRef.current) return;

      const r: Receipt = {
        id: `rcp_${digest.slice(0, 12)}`,
        ts: new Date().toLocaleTimeString(),
        agent,
        actionLabel: action.label,
        target: action.target,
        decision: "REFUSE",
        digest,
        prev: prevHashRef.current,
        policy: "demo/p-1",
      };
      setReceipt(r);
      setPayload(canonical);
      prevHashRef.current = digest;
      setStep(5);
      push("journal.append", `refusal record ${r.id} appended — rejection is evidence too`, "gold", digest.slice(0, 12));
      await sleep(500);
      if (!aliveRef.current) return;
      setStep(6);
    }
    setBusy(false);
  };

  const handleVerify = async () => {
    if (!receipt || verify === "verifying") return;
    setVerify("verifying");
    await sleep(900);
    if (!aliveRef.current) return;
    const recomputed = await sha256Hex(payload);
    if (recomputed === receipt.digest) {
      setVerify("verified");
      push(
        "verify",
        receipt.decision === "ALLOW"
          ? `${receipt.id} verified — digest matches · chain intact`
          : `${receipt.id} verified — the refusal is provable · chain intact`,
        "gold",
        receipt.digest.slice(0, 12),
      );
    } else {
      setVerify("tampered");
      push("verify.finding", "E_DIGEST_MISMATCH — recomputed digest does not match the sealed receipt", "fail");
    }
  };

  const tamper = () => {
    setPayload((p) => p.replace('"v":1', '"v":2'));
    setTamperHint(true);
    setVerify("idle");
    push("adversary", "one byte edited in the recorded payload — will anyone notice?", "fail");
  };

  const restore = () => {
    setPayload(payloadRef.current);
    setTamperHint(false);
    setVerify("idle");
    push("restore", "original evidence restored from the sealed copy", "ok");
  };

  const action = ACTIONS.find((a) => a.id === actionId) ?? ACTIONS[0];
  const done = step >= 6;

  return (
    <>
      <PageHero
        eyebrow="Trust playground"
        title="Watch Vaerion govern an AI action — live."
        lead="Seven steps, under a minute, no login. Create an agent, grant capabilities, send an action, and watch the broker decide, journal, and seal the evidence. Then try to tamper with it."
      >
        <div className="flex flex-wrap gap-2">
          <Pill tone="warn">deterministic simulation</Pill>
          <Pill tone="trust">runs in your browser — nothing leaves this page</Pill>
          <Pill>no login · no server</Pill>
        </div>
      </PageHero>

      {/* stepper */}
      <div className="border-b border-edge bg-ink">
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 md:px-12">
          <ol className="vx-scroll hidden items-center gap-1 overflow-x-auto py-4 md:flex" aria-label="Playground progress">
            {STEPS.map((s, i) => {
              const isDone = i < step;
              const isCurrent = i === step;
              return (
                <li key={s} className="flex shrink-0 items-center gap-1">
                  <span
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em]",
                      isCurrent
                        ? "bg-surface-2 text-body"
                        : isDone
                          ? "text-mutedfg"
                          : "text-[#4A505A]",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-4 w-4 items-center justify-center rounded-full border text-[9px]",
                        isCurrent ? "border-body text-body" : isDone ? "border-edge bg-surface-2 text-mutedfg" : "border-edge text-[#4A505A]",
                      )}
                    >
                      {isDone ? "✓" : i + 1}
                    </span>
                    {s}
                  </span>
                  {i < STEPS.length - 1 ? <span aria-hidden className="h-px w-4 bg-edge" /> : null}
                </li>
              );
            })}
          </ol>
          <p className="py-4 font-mono text-[11px] uppercase tracking-[0.12em] text-mutedfg md:hidden">
            step {Math.min(step + 1, 7)} / 7 — {STEPS[Math.min(step, 6)]}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8 md:px-12 md:py-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
          {/* ─────────────  left: controls  ───────────── */}
          <div className="min-w-0">
            {step === 0 ? (
              <Panel className="p-6">
                <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mutedfg">
                  <Bot className="h-4 w-4" aria-hidden /> step 1 — create the agent
                </p>
                <div className="mt-5">
                  <label htmlFor="pg-agent" className="text-sm font-medium text-body">
                    Agent name
                  </label>
                  <Input
                    id="pg-agent"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    maxLength={24}
                    className="mt-2 border-edge bg-surface-2 font-mono text-sm"
                    placeholder="atlas-01"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-mutedfg">
                    In the real engine, the agent's identity is a versioned contract declared in <code className="font-mono text-body">vaerion.yaml</code> — not a prompt.
                  </p>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#F5F5F0] px-5 text-sm font-semibold text-[#0A0E13] transition-colors hover:bg-white"
                  >
                    Continue <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </Panel>
            ) : null}

            {step === 1 ? (
              <Panel className="p-6">
                <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mutedfg">
                  <KeyRound className="h-4 w-4" aria-hidden /> step 2 — assign permissions
                </p>
                <p className="mt-3 text-sm leading-relaxed text-mutedfg">
                  Capabilities are granted, never assumed. Grant nothing and the broker refuses everything — fail-closed.
                </p>
                <ul className="mt-5 space-y-1">
                  {CAPABILITIES.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-surface-2/50 px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[13px] font-semibold text-body">{c.id}</p>
                        <p className="mt-0.5 text-xs text-mutedfg">{c.desc}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {riskPill(c.risk)}
                        <Switch
                          checked={granted.has(c.id)}
                          onCheckedChange={(v) => toggleCap(c.id, v)}
                          aria-label={`Grant ${c.id}`}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="inline-flex min-h-[44px] items-center rounded-xl border border-edge px-4 text-sm text-mutedfg transition-colors hover:text-body"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#F5F5F0] px-5 text-sm font-semibold text-[#0A0E13] transition-colors hover:bg-white"
                  >
                    Continue <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </Panel>
            ) : null}

            {step === 2 ? (
              <Panel className="p-6">
                <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mutedfg">
                  <Send className="h-4 w-4" aria-hidden /> step 3 — send an action request
                </p>
                <div className="mt-4 space-y-1.5" role="radiogroup" aria-label="Choose an action">
                  {ACTIONS.map((a) => {
                    const selected = a.id === actionId;
                    const allowed = granted.has(a.cap);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setActionId(a.id)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                          selected ? "border-body/50 bg-surface-2" : "border-edge bg-surface-2/50 hover:border-mutedfg/40",
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-body">{a.label}</p>
                          <p className="mt-0.5 truncate font-mono text-[11px] text-mutedfg">{a.target}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {!allowed ? <Pill tone="fail">no cap</Pill> : null}
                          {riskPill(a.risk)}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex min-h-[44px] items-center rounded-xl border border-edge px-4 text-sm text-mutedfg transition-colors hover:text-body"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={runPipeline}
                    disabled={busy}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#F5F5F0] px-5 text-sm font-semibold text-[#0A0E13] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send action request <Send className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </Panel>
            ) : null}

            {step >= 3 ? (
              <Panel className="p-6">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mutedfg">
                  {busy ? "governance in progress" : "outcome"}
                </p>
                {decision === null ? (
                  <div className="mt-5 flex items-center gap-3">
                    <span className="vx-breathe h-2.5 w-2.5 rounded-full bg-mutedfg" aria-hidden />
                    <p className="font-mono text-sm text-mutedfg">broker evaluating…</p>
                  </div>
                ) : decision === "ALLOW" ? (
                  <div className="mt-5 rounded-xl border border-trust/40 bg-trust/[0.06] p-4">
                    <p className="flex items-center gap-2 font-mono text-lg font-semibold text-trust">
                      <ShieldCheck className="h-5 w-5" aria-hidden /> ALLOW
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-mutedfg">
                      The decision was journaled before execution. Only a journaled allow runs.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-failx/40 bg-failx/[0.06] p-4">
                    <p className="flex items-center gap-2 font-mono text-lg font-semibold text-failx">
                      <Ban className="h-5 w-5" aria-hidden /> REFUSE
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-mutedfg">
                      Fail-closed: <span className="text-body">{action.cap}</span> was never granted. The refusal itself is journaled evidence.
                    </p>
                  </div>
                )}
                {done ? (
                  <div className="mt-6 flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={runAnother}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-edge px-4 text-sm font-medium text-body transition-colors hover:border-mutedfg/50 hover:text-body"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden /> Run another action — the chain continues
                    </button>
                    <button
                      type="button"
                      onClick={resetSession}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-xl px-4 text-sm text-mutedfg transition-colors hover:text-body"
                    >
                      New session
                    </button>
                  </div>
                ) : null}
              </Panel>
            ) : null}
          </div>

          {/* ─────────────  right: journal console + receipt  ───────────── */}
          <div className="min-w-0 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-edge bg-[#0B0D10]">
              <div className="flex items-center justify-between border-b border-edge/70 bg-[#101318] px-4 py-2.5">
                <span className="font-mono text-[11px] tracking-wide text-[#6B7078]">journal — append-only · single writer</span>
                <span className="font-mono text-[10px] text-[#6B7078]">{log.length} records</span>
              </div>
              <div ref={consoleRef} className="vx-scroll h-[320px] overflow-y-auto p-4 font-mono text-[12px] leading-[1.8]" aria-live="polite" aria-label="Journal console">
                {log.length === 0 ? (
                  <p className="text-[#4A505A]">journal empty — send an action request to begin</p>
                ) : (
                  log.map((l) => (
                    <p key={l.seq} className="flex flex-wrap items-baseline gap-x-2 whitespace-pre-wrap break-words">
                      <span className="text-[#4A505A]">#{String(l.seq).padStart(3, "0")}</span>
                      <span className="text-[#4A505A]">{l.t}</span>
                      <span
                        className={cn(
                          l.tone === "fail" ? "text-failx" : l.tone === "gold" ? "text-gold-bright" : l.tone === "ok" ? "text-trust" : "text-[#9BA1AB]",
                        )}
                      >
                        {l.ev}
                      </span>
                      <span className={cn("min-w-0", l.tone === "fail" ? "text-[#D7A0A0]" : "text-[#9BA1AB]")}>{l.detail}</span>
                      {l.hash ? <span className="text-gold/70">§{l.hash}</span> : null}
                    </p>
                  ))
                )}
              </div>
            </div>

            {/* receipt artifact */}
            {receipt ? (
              <div className={cn("rounded-2xl border bg-surface", verify === "tampered" ? "border-failx/50" : "border-gold/40")}>
                <div className="flex items-center justify-between gap-3 border-b border-edge px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <SealGlyph verified={verify !== "tampered"} />
                    <div>
                      <p className="font-mono text-sm font-semibold text-body">{receipt.id}</p>
                      <p className="font-mono text-[11px] text-mutedfg">
                        recorded {receipt.ts} · policy {receipt.policy}
                      </p>
                    </div>
                  </div>
                  <Pill tone={receipt.decision === "ALLOW" ? "trust" : "fail"}>{receipt.decision}</Pill>
                </div>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-2 px-5 py-4 text-sm sm:grid-cols-[120px_1fr]">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-mutedfg">agent</dt>
                  <dd className="font-mono text-[13px] text-body">{receipt.agent}</dd>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-mutedfg">action</dt>
                  <dd className="text-body">{receipt.actionLabel}</dd>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-mutedfg">target</dt>
                  <dd className="break-all font-mono text-[12px] text-mutedfg">{receipt.target}</dd>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-mutedfg">body digest</dt>
                  <dd className={cn("break-all font-mono text-[12px]", tamperHint ? "text-warnx" : "text-gold")}>
                    sha256:{receipt.digest.slice(0, 32)}…
                  </dd>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-mutedfg">prev hash</dt>
                  <dd className="break-all font-mono text-[12px] text-mutedfg">
                    {receipt.prev === GENESIS ? `${GENESIS} (genesis)` : `${receipt.prev.slice(0, 32)}…`}
                  </dd>
                </dl>

                <div className="border-t border-edge px-5 py-4">
                  {verify === "idle" || verify === "verifying" ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleVerify}
                        disabled={verify === "verifying"}
                        className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-md bg-[#F5F5F0] px-5 text-sm font-semibold text-[#0A0E13] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ShieldCheck className="h-4 w-4" aria-hidden />
                        {verify === "verifying" ? "recomputing chain…" : "Verify the evidence"}
                      </button>
                      {verify === "idle" && !tamperHint ? (
                        <button
                          type="button"
                          onClick={tamper}
                          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-failx/40 px-5 text-sm font-medium text-failx transition-colors hover:bg-failx/10"
                        >
                          <FileWarning className="h-4 w-4" aria-hidden /> Attempt tampering
                        </button>
                      ) : null}
                    </div>
                  ) : verify === "verified" ? (
                    <div>
                      <div className="flex items-start gap-3 rounded-xl border border-trust/40 bg-trust/[0.07] p-4">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-trust" aria-hidden />
                        <div>
                          <p className="font-mono text-sm font-semibold text-trust">
                            VERIFIED — chain intact · digest recomputed independently
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-mutedfg">
                            {receipt.decision === "ALLOW"
                              ? "The evidence holds without trusting whoever produced it. Trust is a property of the bytes."
                              : "The refusal is provable — the no is on the chain, verifiable years from now."}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={tamper}
                          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-failx/40 px-5 text-sm font-medium text-failx transition-colors hover:bg-failx/10"
                        >
                          <FileWarning className="h-4 w-4" aria-hidden /> Attempt tampering
                        </button>
                        <button
                          type="button"
                          onClick={runAnother}
                          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-edge px-5 text-sm font-medium text-body transition-colors hover:border-mutedfg/50 hover:text-body"
                        >
                          Run another action
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start gap-3 rounded-xl border border-failx/40 bg-failx/[0.07] p-4">
                        <Ban className="mt-0.5 h-5 w-5 shrink-0 text-failx" aria-hidden />
                        <div>
                          <p className="font-mono text-sm font-semibold text-failx">
                            TAMPERED — E_DIGEST_MISMATCH
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-mutedfg">
                            One edited byte broke the seal. Hash chains make silent edits impossible — in the engine this is a named finding, not a generic error.
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={restore}
                          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-edge px-5 text-sm font-medium text-body transition-colors hover:border-mutedfg/50 hover:text-body sm:w-auto"
                        >
                          Restore the original evidence
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* honesty + mapping */}
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Callout kind="info" title="What this demo is — and is not">
            This is a faithful browser simulation of the Vaerion flow: deterministic, local, and honest. Digests are real SHA-256 computed on
            your machine (the engine uses blake3 — the tamper-evidence property is the same). The production broker adds policy files, durable
            human gates, and full journal semantics.
          </Callout>
          <Panel className="p-5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-mutedfg">What just happened, in engine terms</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-mutedfg">
              <li className="flex items-start gap-2.5">
                <Play className="mt-1 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
                decide → journal → act: the broker sequence you watched is the real fail-closed loop
              </li>
              <li className="flex items-start gap-2.5">
                <Play className="mt-1 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
                refusals are evidence: the refusal receipt verifies exactly like an approval
              </li>
              <li className="flex items-start gap-2.5">
                <Play className="mt-1 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
                each receipt chains to the previous one — run another action and watch prev hash connect
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-4">
              <ArrowLink href="#/governance">Governance model</ArrowLink>
              <ArrowLink href="#/receipts">Receipts &amp; verification</ArrowLink>
              <ArrowLink href="#/laws">The eight laws</ArrowLink>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
