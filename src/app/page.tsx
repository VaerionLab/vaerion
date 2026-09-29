import type { ReactNode } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Code2,
  EyeOff,
  FileSignature,
  FlaskConical,
  Github,
  Lock,
  Package,
  Play,
  Repeat,
  Scale,
  ShieldAlert,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { CopyCommand } from "./_components/copy-command";
import { DemoTerminal } from "./_components/demo-terminal";
import { Reveal } from "./_components/reveal";

const GITHUB_REPO = "https://github.com/VaerionLab/vaerion";
const NPM_PACKAGE = "https://www.npmjs.com/package/vaerion";

/* The page loads the two registered type voices provisioned in layout.tsx:
 * the human voice (Instrument Sans) on the root, the machine voice
 * (Spline Sans Mono) on every terminal, command and metric. */
const SANS_FONT =
  "[font-family:var(--vx-provision-human),ui-sans-serif,system-ui,sans-serif]";
const MONO_FONT =
  "[font-family:var(--vx-provision-machine),ui-monospace,SFMono-Regular,Menlo,monospace]";

function cnMono(extra: string) {
  return `${MONO_FONT} ${extra}`;
}

const EYEBROW = cnMono(
  "text-[11px] font-medium uppercase tracking-[0.22em] text-[#8fa4ff]"
);

/* ── Hero terminal — the exact measured receipt from a fresh install ──── */

function HeroTerminal() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-[0_0_90px_-30px_rgba(91,140,255,0.45)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <div aria-hidden="true" className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-zinc-800" />
          <span className="size-2.5 rounded-full bg-zinc-800" />
          <span className="size-2.5 rounded-full bg-zinc-800" />
        </div>
        <span className={cnMono("text-[11px] text-zinc-600")}>
          receipt · measured on 0.1.14-rc1
        </span>
      </div>
      <pre
        className={cnMono(
          "overflow-x-auto p-4 text-[12.5px] leading-[1.75] text-zinc-300 sm:text-[13px]"
        )}
      >
        <span className="block">
          <span className="select-none text-zinc-600">{"$ "}</span>
          <span className="text-zinc-200">
            {'vae run demo --query "What guarantees does Vaerion make about evidence?"'}
          </span>
        </span>
        <span className="block text-zinc-500">{"receipt:"}</span>
        <span className="block">
          {"  "}
          <span className="text-zinc-500">{"run_id: "}</span>
          <span className="text-[#9db4ff]">crn_run_01M3F2460N5TEREDSJX9HJRE49</span>
        </span>
        <span className="block text-zinc-500">{"  counts:"}</span>
        <span className="block">{"    records: 13"}</span>
        <span className="block">{"    decisions_allow: 1"}</span>
        <span className="block">{"    snapshots: 1"}</span>
        <span className="block text-zinc-500">{"  journal:"}</span>
        <span className="block">{"    records: 13"}</span>
        <span className="block">
          {"    "}
          <span className="text-zinc-500">{"head_hash: "}</span>
          <span className="text-[#b9afff]">{"7b5e8d78c56306e3…"}</span>
        </span>
        <span className="block">
          <span className="text-zinc-500">{"journal_verified: "}</span>
          <span className="font-semibold text-emerald-400">{"true"}</span>
        </span>
        <span className="block">{" "}</span>
        <span className="block">
          <span className="select-none text-zinc-600">{"$ "}</span>
          <span className="text-zinc-200">{"vae journal verify <RUN_ID>"}</span>
        </span>
        <span className="block text-zinc-500">{"report:"}</span>
        <span className="block">
          {"  "}
          <span className="text-zinc-500">{"ok: "}</span>
          <span className="font-semibold text-emerald-400">{"true"}</span>
          <span className="text-zinc-500">{"   torn: "}</span>
          <span className="text-zinc-300">{"false"}</span>
          <span className="text-zinc-500">{"   issues: "}</span>
          <span className="text-zinc-300">{"[]"}</span>
        </span>
      </pre>
    </div>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-heading" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_30%_0%,rgba(91,140,255,0.10),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_85%_20%,rgba(139,92,246,0.08),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,black_30%,transparent_75%)]"
      />
      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:items-center lg:gap-10 lg:pb-24">
        <Reveal>
          <p className={EYEBROW}>{"signed release · apache-2.0 · zero telemetry"}</p>
          <h1
            id="hero-heading"
            className="mt-4 text-4xl font-bold leading-[1.06] tracking-tight text-zinc-50 sm:text-5xl lg:text-[3.4rem]"
          >
            The <span className="bg-gradient-to-r from-[#5B8CFF] to-[#A78BFA] bg-clip-text text-transparent">verification layer</span> for AI agents.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            {
              "Build AI systems that can explain what happened, prove what was allowed, and verify every decision."
            }
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="tap-expand-sm bg-[#5B8CFF] font-semibold text-[#04060f] hover:bg-[#7aa0ff] focus-visible:ring-[#5B8CFF]/50"
            >
              <a href="#install">Install Vaerion</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="tap-expand-sm border-white/15 bg-transparent text-zinc-200 hover:border-white/30 hover:bg-white/5 hover:text-zinc-50"
            >
              <a href={GITHUB_REPO} target="_blank" rel="noreferrer">
                <Github className="mr-1 size-4" aria-hidden="true" />
                View GitHub
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="tap-expand-sm text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              <a href="#demo">
                <Play className="mr-1 size-4" aria-hidden="true" />
                Run Demo
              </a>
            </Button>
          </div>
          <p className={cnMono("mt-6 text-[11px] tracking-[0.08em] text-zinc-600")}>
            {"npm install -g vaerion@rc — requires Bun 1.3+ · runs entirely on your machine"}
          </p>
        </Reveal>
        <Reveal delay={0.12} className="min-w-0">
          <HeroTerminal />
        </Reveal>
      </div>
      <div aria-hidden="true" className="relative border-y border-white/5 bg-black/40">
        <div
          className={cnMono(
            "mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-3.5 text-[10.5px] uppercase tracking-[0.2em] text-zinc-600 sm:px-6"
          )}
        >
          <span>{"blake3-chained journals"}</span>
          <span className="text-zinc-800">{"/"}</span>
          <span>{"fail-closed broker"}</span>
          <span className="text-zinc-800">{"/"}</span>
          <span>{"deterministic replay"}</span>
          <span className="text-zinc-800">{"/"}</span>
          <span>{"zero telemetry"}</span>
        </div>
      </div>
    </section>
  );
}

/* ── The problem ───────────────────────────────────────────────────────── */

type FlowStep = { label: string; tone: "plain" | "vault" | "broken" | "proven" };

const FLOW_BEFORE: FlowStep[] = [
  { label: "Agent decides", tone: "plain" },
  { label: "Action happens", tone: "plain" },
  { label: "Nobody can prove why", tone: "broken" },
];

const FLOW_AFTER: FlowStep[] = [
  { label: "Agent decides", tone: "plain" },
  { label: "Policy evaluates", tone: "vault" },
  { label: "Decision recorded", tone: "proven" },
  { label: "Evidence verified", tone: "proven" },
];

function FlowRow({ step, last }: { step: FlowStep; last: boolean }) {
  const styles: Record<FlowStep["tone"], string> = {
    plain: "border-white/10 bg-white/[0.03] text-zinc-200",
    vault: "border-[#5B8CFF]/30 bg-[#5B8CFF]/[0.06] text-[#b7c6ff]",
    proven: "border-emerald-500/25 bg-emerald-500/[0.05] text-emerald-300/90",
    broken: "border-rose-500/30 bg-rose-500/[0.06] text-rose-300",
  };
  return (
    <li>
      <div
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${styles[step.tone]}`}
      >
        {step.tone === "broken" ? (
          <X className="size-4 shrink-0 text-rose-400" aria-hidden="true" />
        ) : step.tone === "proven" ? (
          <Check className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
        ) : step.tone === "vault" ? (
          <ShieldAlert className="size-4 shrink-0 text-[#8fa4ff]" aria-hidden="true" />
        ) : (
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-zinc-500" />
        )}
        <span className="text-sm font-medium">{step.label}</span>
      </div>
      {!last ? (
        <div aria-hidden="true" className="flex justify-center py-1">
          <ArrowDown className="size-3.5 text-zinc-700" />
        </div>
      ) : null}
    </li>
  );
}

function Problem() {
  return (
    <section
      id="problem"
      aria-labelledby="problem-heading"
      className="scroll-mt-16 border-t border-white/5"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <p className={EYEBROW}>{"the problem"}</p>
          <h2
            id="problem-heading"
            className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl"
          >
            {"AI systems need memory, accountability, and proof."}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {
              "Agents act in the world. When something goes wrong, an explanation that nobody can verify is worth nothing."
            }
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Reveal className="min-w-0">
            <div className="h-full rounded-xl border border-white/10 bg-white/[0.015] p-5 sm:p-6">
              <p className={cnMono("text-[10.5px] uppercase tracking-[0.2em] text-zinc-500")}>
                {"today — unverified autonomy"}
              </p>
              <ol className="mt-5">
                {FLOW_BEFORE.map((step, i) => (
                  <FlowRow key={step.label} step={step} last={i === FLOW_BEFORE.length - 1} />
                ))}
              </ol>
              <p className="mt-5 text-sm leading-relaxed text-zinc-500">
                {"The action is done. The reasoning is gone. Trust me is not an audit trail."}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="min-w-0">
            <div className="h-full rounded-xl border border-[#5B8CFF]/25 bg-gradient-to-b from-[#5B8CFF]/[0.05] to-transparent p-5 sm:p-6">
              <p className={cnMono("text-[10.5px] uppercase tracking-[0.2em] text-[#8fa4ff]")}>
                {"with vaerion — evidenced autonomy"}
              </p>
              <ol className="mt-5">
                {FLOW_AFTER.map((step, i) => (
                  <FlowRow key={step.label} step={step} last={i === FLOW_AFTER.length - 1} />
                ))}
              </ol>
              <p className="mt-5 text-sm leading-relaxed text-zinc-400">
                {
                  "Every step lands on a hash-chained journal, every permission crosses a fail-closed broker, every run closes with a receipt."
                }
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── The core proof — four pillars ─────────────────────────────────────── */

const PILLARS = [
  {
    n: "01",
    icon: Lock,
    title: "Immutable Journals",
    line: "Every action becomes verifiable evidence.",
    body: "Append-only NDJSON per run, blake3-chained record by record. Verification recomputes the chain; nothing is rewritten.",
  },
  {
    n: "02",
    icon: ShieldAlert,
    title: "Fail-Closed Governance",
    line: "Unknown permission = denied.",
    body: "Shape → ceiling → policy. Unmatched means denied — and every decision, allow or deny, is journaled.",
  },
  {
    n: "03",
    icon: Repeat,
    title: "Deterministic Execution",
    line: "Same input. Same result. Every time.",
    body: "Runs fold state from the journal. Crashes resume where they stopped, and replays are faithful.",
  },
  {
    n: "04",
    icon: Scale,
    title: "Constitutional Runtime",
    line: "Rules are enforced by the system.",
    body: "A layer-governed engine: lower layers never import higher, and every privileged path crosses the broker.",
  },
] as const;

function CoreProof() {
  return (
    <section
      id="proof"
      aria-labelledby="proof-heading"
      className="scroll-mt-16 border-t border-white/5"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <p className={EYEBROW}>{"the core proof"}</p>
          <h2
            id="proof-heading"
            className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl"
          >
            {"Trust is a property of the mechanism, not a promise."}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.n} delay={i * 0.08} className="min-w-0">
              <div className="group h-full rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors duration-200 hover:border-[#5B8CFF]/35 hover:bg-white/[0.035]">
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className={cnMono(
                      "flex size-9 items-center justify-center rounded-lg border border-[#5B8CFF]/25 bg-[#5B8CFF]/[0.07]"
                    )}
                  >
                    <pillar.icon className="size-4 text-[#9db4ff]" />
                  </span>
                  <span className={cnMono("text-[11px] text-zinc-700")}>{pillar.n}</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-zinc-100">{pillar.title}</h3>
                <p className="mt-1.5 text-sm font-medium leading-snug text-zinc-300">
                  {pillar.line}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-zinc-500">{pillar.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Demo ──────────────────────────────────────────────────────────────── */

function Demo() {
  return (
    <section
      id="demo"
      aria-labelledby="demo-heading"
      className="scroll-mt-16 border-t border-white/5"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#5B8CFF]/40 to-transparent"
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <p className={EYEBROW}>{"the demo"}</p>
          <h2
            id="demo-heading"
            className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl"
          >
            {"The system says no — and proves it."}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {
              "A restricted deploy crosses the broker. No matching policy rule, so the engine refuses — fail-closed. Then watch the part nobody else has: the refusal itself becomes verifiable evidence."
            }
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-10 min-w-0">
          <DemoTerminal />
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-4 max-w-3xl text-[13px] leading-relaxed text-zinc-500">
            {
              "Measured against vaerion@0.1.14-rc1 — E1300 · broker_denied, from the shipped error catalog. Run it yourself:"
            }
            <code
              className={cnMono(
                "mt-2 block w-fit max-w-full break-words rounded border border-white/10 bg-black px-2 py-1 text-[12px] text-[#9db4ff]"
              )}
            >
              {"cp -r examples/vaerion/demo-workspace refused-action && cd refused-action"}
              <br />
              {"vae run agent --goal \"Ship the pricing change to production\" --planner inline --plan-json '[{\"kind\":\"tool\",\"tool\":\"deploy\",\"args\":{\"env\":\"production\"}}]'"}
            </code>
            <a
              href={`${GITHUB_REPO}/blob/main/examples/refused-action/README.md`}
              target="_blank"
              rel="noreferrer"
              className="tap-expand mt-2 inline-block text-[#9db4ff] underline decoration-[#5B8CFF]/40 underline-offset-4 transition-colors hover:text-[#b7c6ff]"
            >
              full walkthrough
            </a>
            {"."}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Installation ──────────────────────────────────────────────────────── */

const INSTALL_STEPS: { title: string; command: string; note?: ReactNode }[] = [
  {
    title: "Install the CLI",
    command: "npm install -g vaerion@rc",
    note: (
      <>
        {"Requires "}
        <a
          href="https://bun.sh"
          target="_blank"
          rel="noreferrer"
          className="tap-expand text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-[#9db4ff]"
        >
          {"Bun 1.3+"}
        </a>
        {" · installs from the npm registry of record"}
      </>
    ),
  },
  { title: "Create a governed workspace", command: "vae init --template demo" },
  {
    title: "Run the demo",
    command: 'vae run demo --query "What guarantees does Vaerion make about evidence?"',
  },
  {
    title: "Verify the proof",
    command: "vae journal verify <RUN_ID>",
    note: <>{"the blake3 chain holds — ok: true, torn: false, issues: []"}</>,
  },
] as const;

function Install() {
  return (
    <section
      id="install"
      aria-labelledby="install-heading"
      className="scroll-mt-16 border-t border-white/5"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12">
        <div className="min-w-0">
          <Reveal>
            <p className={EYEBROW}>{"installation"}</p>
            <h2
              id="install-heading"
              className="mt-3 text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl"
            >
              {"First proof in 60 seconds."}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              {"Four commands from a clean machine to a verified journal. Measured end-to-end on 0.1.14-rc1 — not storyboarded."}
            </p>
          </Reveal>
          <ol className="mt-8 grid gap-4">
            {INSTALL_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors duration-200 hover:border-white/20 sm:p-5 md:grid-cols-[auto_minmax(0,1fr)] md:gap-5"
              >
                <span
                  aria-hidden="true"
                  className={cnMono(
                    "flex size-8 items-center justify-center rounded-full border border-[#5B8CFF]/30 text-xs text-[#9db4ff]"
                  )}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-100">{step.title}</h3>
                  <div className="mt-3">
                    <CopyCommand command={step.command} />
                  </div>
                  {step.note ? (
                    <p className="mt-2.5 text-xs leading-relaxed text-zinc-500">{step.note}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
        <Reveal delay={0.1} className="min-w-0 lg:pt-24">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
            <p className={cnMono("text-[10.5px] uppercase tracking-[0.2em] text-zinc-500")}>
              {"what you just proved"}
            </p>
            <ul className="mt-4 space-y-3">
              {[
                "a run executed under a signed, fingerprinted config",
                "every step journaled with a blake3 hash chain",
                "a receipt folded from the journal — not written by hand",
                "independent verification: ok: true, torn: false",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-zinc-300">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-white/5 pt-4 text-xs leading-relaxed text-zinc-500">
              {"Your run ids and hashes will differ. The shape — and the ok: true — will not."}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Trust ─────────────────────────────────────────────────────────────── */

const TRUST_ITEMS = [
  {
    icon: Scale,
    title: "Apache-2.0",
    body: "The license of record. Open source, no asterisks.",
    href: `${GITHUB_REPO}/blob/main/LICENSE`,
  },
  {
    icon: FileSignature,
    title: "Signed releases",
    body: "Ed25519-signed artifacts; the public key of record ships in the repository.",
    href: `${GITHUB_REPO}/blob/main/keys/release-signing.pub`,
  },
  {
    icon: ShieldAlert,
    title: "Security model",
    body: "Known limitations are documented, not hidden — see docs/LIMITATIONS.md.",
    href: `${GITHUB_REPO}/blob/main/docs/LIMITATIONS.md`,
  },
  {
    icon: FlaskConical,
    title: "Deterministic verification",
    body: "Nine verification gates, all green on the release of record.",
    href: `${GITHUB_REPO}/blob/main/docs/verification/README.md`,
  },
  {
    icon: Code2,
    title: "Open source",
    body: "The full engine is the public repository of record — nothing hidden behind a demo.",
    href: GITHUB_REPO,
  },
  {
    icon: EyeOff,
    title: "Zero telemetry",
    body: "No analytics, no undeclared network. The config guard accepts exactly one value: telemetry.enabled: false.",
    href: `${GITHUB_REPO}/blob/main/docs/concepts/security.md`,
  },
] as const;

function Trust() {
  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
      className="scroll-mt-16 border-t border-white/5"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <p className={EYEBROW}>{"trust"}</p>
          <h2
            id="trust-heading"
            className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl"
          >
            {"Built to be audited."}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06} className="min-w-0">
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="group block h-full rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors duration-200 hover:border-[#5B8CFF]/35 hover:bg-white/[0.035]"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="size-4 text-[#9db4ff]" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-zinc-100">{item.title}</h3>
                </div>
                <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-500">{item.body}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Documentation ─────────────────────────────────────────────────────── */

const DOC_CARDS = [
  {
    icon: Github,
    title: "GitHub",
    body: "The repository of record — engine, spec, ADRs, evidence index.",
    href: GITHUB_REPO,
  },
  {
    icon: Package,
    title: "npm",
    body: "vaerion@0.1.14-rc1 — installable today, dist-tag rc.",
    href: NPM_PACKAGE,
  },
  {
    icon: Code2,
    title: "Docs",
    body: "Quickstart, guides, concepts, CLI and error reference.",
    href: `${GITHUB_REPO}/blob/main/docs/README.md`,
  },
  {
    icon: FlaskConical,
    title: "Examples",
    body: "Three two-minute proofs: Verifiable Agent, Refused Action, Replay Machine.",
    href: `${GITHUB_REPO}/tree/main/examples`,
  },
] as const;

function Docs() {
  return (
    <section
      id="docs"
      aria-labelledby="docs-heading"
      className="scroll-mt-16 border-t border-white/5"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <p className={EYEBROW}>{"documentation"}</p>
          <h2
            id="docs-heading"
            className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl"
          >
            {"Everything a stranger needs."}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DOC_CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.06} className="min-w-0">
              <a
                href={card.href}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.02] p-5 transition-colors duration-200 hover:border-[#5B8CFF]/35 hover:bg-white/[0.035]"
              >
                <div className="flex items-center justify-between">
                  <card.icon className="size-4 text-[#9db4ff]" aria-hidden="true" />
                  <ArrowUpRight
                    className="size-4 text-zinc-700 transition-colors group-hover:text-[#9db4ff]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-zinc-100">{card.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{card.body}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Honest status ─────────────────────────────────────────────────────── */

function StatusStrip() {
  return (
    <section
      aria-labelledby="status-heading"
      className="border-y border-white/5 bg-white/[0.015]"
    >
      <h2 id="status-heading" className="sr-only">
        Honest status
      </h2>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 sm:px-6 md:flex-row md:items-center md:gap-4">
        <Badge
          variant="outline"
          className={cnMono(
            "shrink-0 border-[#5B8CFF]/40 bg-[#5B8CFF]/10 px-2 py-0.5 text-[10px] font-normal uppercase tracking-[0.14em] text-[#9db4ff]"
          )}
        >
          release candidate
        </Badge>
        <p className="text-sm leading-relaxed text-zinc-400">
          <span className="text-zinc-200">{"v0.1.14-rc1"}</span>
          {
            " is a release candidate: 9/9 verification gates green, Ed25519-signed release artifacts, installable from the npm registry. Known limitations are documented, not hidden — see "
          }
          <a
            href={`${GITHUB_REPO}/blob/main/docs/LIMITATIONS.md`}
            target="_blank"
            rel="noreferrer"
            className="tap-expand text-[#9db4ff] underline decoration-[#5B8CFF]/40 underline-offset-4 transition-colors hover:text-[#b7c6ff]"
          >
            docs/LIMITATIONS.md
          </a>
          {"."}
        </p>
      </div>
    </section>
  );
}

/* ── Header ────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { href: "#problem", label: "The problem" },
  { href: "#proof", label: "Core proof" },
  { href: "#demo", label: "Demo" },
  { href: "#install", label: "Install" },
  { href: "#docs", label: "Docs" },
] as const;

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050507]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href="#hero"
          className="flex min-w-0 items-center gap-2.5 self-stretch rounded-md"
          aria-label="Vaerion — back to top"
        >
          <Image
            src="/vaerion-mark.png"
            alt=""
            width={24}
            height={24}
            className="size-6 shrink-0"
          />
          <span className="text-[15px] font-semibold tracking-tight text-zinc-100">
            Vaerion
          </span>
          <Badge
            variant="outline"
            className={cnMono(
              "hidden border-white/15 px-1.5 py-0 text-[10px] font-normal text-zinc-500 sm:inline-flex"
            )}
          >
            v0.1.14-rc1
          </Badge>
        </a>
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hidden rounded-md px-2 py-1 text-sm text-zinc-400 transition-colors hover:text-zinc-100 md:inline-block"
            >
              {link.label}
            </a>
          ))}
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
            aria-label="Vaerion on GitHub"
            className="tap-expand-sm rounded-md p-2 text-zinc-400 transition-colors hover:text-zinc-100"
          >
            <Github className="size-4" aria-hidden="true" />
          </a>
          <Button
            asChild
            size="sm"
            className="tap-expand-sm bg-[#5B8CFF] font-semibold text-[#04060f] hover:bg-[#7aa0ff] focus-visible:ring-[#5B8CFF]/50"
          >
            <a href="#install">Get started</a>
          </Button>
        </nav>
      </div>
    </header>
  );
}

/* ── Footer ────────────────────────────────────────────────────────────── */

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http") || href.startsWith("/");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="inline-block -mx-2 px-2 py-[12px] text-sm text-zinc-400 transition-colors hover:text-[#9db4ff] sm:-mx-0 sm:px-0 sm:py-0"
    >
      {children}
    </a>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/5">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Learn
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <FooterLink href={GITHUB_REPO}>GitHub</FooterLink>
              </li>
              <li>
                <FooterLink href={NPM_PACKAGE}>npm</FooterLink>
              </li>
              <li>
                <FooterLink href={`${GITHUB_REPO}/blob/main/docs/README.md`}>
                  Documentation
                </FooterLink>
              </li>
              <li>
                <FooterLink href={`${GITHUB_REPO}/blob/main/docs/reference/cli.md`}>
                  CLI reference
                </FooterLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Project
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <FooterLink href="#problem">The problem</FooterLink>
              </li>
              <li>
                <FooterLink href="#proof">Core proof</FooterLink>
              </li>
              <li>
                <FooterLink href="#demo">Demo</FooterLink>
              </li>
              <li>
                <FooterLink href="#trust">Trust</FooterLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Legal
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <FooterLink href={`${GITHUB_REPO}/blob/main/LICENSE`}>
                  Apache-2.0 license
                </FooterLink>
              </li>
              <li>
                <FooterLink href={`${GITHUB_REPO}/blob/main/SECURITY.md`}>
                  Security policy
                </FooterLink>
              </li>
              <li>
                <FooterLink href={`${GITHUB_REPO}/blob/main/docs/LIMITATIONS.md`}>
                  Limitations
                </FooterLink>
              </li>
            </ul>
          </div>
        </div>
        <div aria-hidden="true" className="my-8 h-px bg-white/5" />
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className={cnMono("text-[11px] tracking-[0.18em] text-zinc-600")}>
            {"THE VERIFICATION LAYER FOR AI AGENTS"}
          </p>
          <p className={cnMono("text-[11px] tracking-[0.18em] text-zinc-600")}>
            {"© 2026 VAERION · APACHE-2.0"}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function Page() {
  return (
    <div
      className={`${SANS_FONT} flex min-h-screen flex-col bg-[#050507] text-zinc-300 antialiased`}
    >
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:border focus:border-[#5B8CFF]/50 focus:bg-[#050507] focus:px-3 focus:py-2 focus:text-sm focus:text-[#9db4ff]"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <CoreProof />
        <Demo />
        <Install />
        <Trust />
        <Docs />
        <StatusStrip />
      </main>
      <SiteFooter />
    </div>
  );
}
