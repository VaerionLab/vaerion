"use client";

/**
 * Vaerion — Launch Home (Phase 12, order section 3; PHASE 17 —
 * EXPERIENCE AWAKENING).
 *
 * The front door of the launch site, rebuilt as the entry to a trust
 * operating environment:
 *
 *   - HERO — the official Founder logo (the ONE identity, rendered from
 *     `brand/official/MANIFEST.md` pixels, never redrawn), floating in
 *     OLED space over the particle field, under the headline "Trust
 *     Runtime for AI Agents". Atmosphere is layered behind it — the
 *     mark itself is never distorted, redrawn, or replaced.
 *   - THE RECORD — every number is either (a) fetched live from
 *     /api/knowledge (the stage manifest and the F-006 release record —
 *     absence renders as absence), or (b) transcribed in FACTS from the
 *     measured records of record. The page claims nothing the
 *     repository cannot prove.
 *   - TRUST ENGINE VIEW — the four consoles (Permissions, Journals,
 *     Receipts, Verification) and the journal chain rendered as
 *     cryptographic evidence flowing (glass/TrustEngine.tsx).
 *   - AGENT ACTIVITY — the build order as verification checkpoints,
 *     with the nine gates of record.
 *
 * Citations: Phase 12 execution order section 3; IR-021; Bible Art. VIII
 * (honesty), XI; FACTS site law; /api/knowledge (Stage 11); PHASE 17
 * mission (hero, trust visualization, agent activity, performance law);
 * brand/official/MANIFEST.md.
 */

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FileText, Github, Radio, ShieldCheck, TerminalSquare } from "lucide-react";

import { releaseDate, useKnowledge } from "../api";
import { TrustPipeline } from "../../site/diagrams";
import { FACTS } from "../../site/facts";
import { ArrowLink, Bullets, CTARow, GhostButton, GoldButton, Section, Terminal } from "../../site/primitives";
import { AnimatedLogo } from "../glass/AnimatedLogo";
import { GlassCard, GlassPanel, Magnetic, Reveal } from "../glass/Glass";
import { ParticleField } from "../glass/ParticleField";
import { EvidenceStream, GateChips, JournalChain, TrustConsoles, TrustEngineSkeleton } from "../glass/TrustEngine";

const ENTRIES = [
  {
    href: "#/vision",
    label: "Vision",
    icon: FileText,
    line: "Why Vaerion exists: autonomous AI that shows its work — cryptographically, locally, forever.",
  },
  {
    href: "#/runtime",
    label: "Runtime",
    icon: TerminalSquare,
    line: "From a declared capability to a byte-identical bundle — five moves, all local.",
  },
  {
    href: "#/architecture",
    label: "Architecture",
    icon: Github,
    line: "One event spine. One permission authority. One sanctioned network seam.",
  },
  {
    href: "#/developers",
    label: "Developers",
    icon: ArrowRight,
    line: "17 measured API paths, the vae CLI, the SDK — everything a builder needs, cited.",
  },
  {
    href: "#/security",
    label: "Security",
    icon: ShieldCheck,
    line: "A threat model first. Architecture second. Marketing never.",
  },
  {
    href: "#/observatory",
    label: "Release Observatory",
    icon: Radio,
    line: "The release record of the civilization — receipts, artifacts, channels — as issued.",
  },
] as const;

/* ── the hero — entering a trust operating environment ────────────────── */

function Hero() {
  const reduce = useReducedMotion();

  const stagger = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.22, 0.61, 0.36, 1] as const },
        };

  return (
    <section aria-label="Vaerion — trust runtime for AI agents" className="relative overflow-hidden">
      {/* the particle field — atmosphere around the mark, never a symbol */}
      <ParticleField className="absolute inset-0 h-full w-full" />
      {/* the horizon: a single gold light-line where the console begins */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-24 -z-[-1] h-[420px] w-[720px] max-w-[92vw] -translate-x-1/2 rounded-full opacity-60"
        style={{ background: "radial-gradient(ellipse at center, rgba(212,175,55,0.1), rgba(139,124,246,0.07) 45%, transparent 72%)", filter: "blur(30px)" }}
      />

      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center px-5 pb-20 pt-16 text-center sm:px-8 md:pb-28 md:pt-24">
        <motion.div {...stagger(0)}>
          <AnimatedLogo size={104} float glow />
        </motion.div>

        <motion.div {...stagger(1)} className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.07] px-3.5 py-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-gold">
            <span aria-hidden className="vx-beacon vx-blink inline-block h-1.5 w-1.5 rounded-full bg-gold text-gold" />
            trust runtime for AI agents
          </span>
          <span className="rounded-full border border-edge bg-well/60 px-3.5 py-1.5 font-mono text-[10.5px] tracking-[0.1em] text-mutedfg">
            v{FACTS.version}
          </span>
          <span className="hidden rounded-full border border-edge bg-well/60 px-3.5 py-1.5 font-mono text-[10.5px] tracking-[0.1em] text-mutedfg sm:inline">
            {FACTS.license}
          </span>
        </motion.div>

        <motion.h1
          {...stagger(2)}
          className="mt-7 max-w-3xl text-balance text-4xl font-medium leading-[1.06] tracking-[-0.02em] text-body md:text-6xl"
        >
          Certainty without drama.
        </motion.h1>

        <motion.p {...stagger(3)} className="mt-6 max-w-2xl text-balance text-[15px] leading-relaxed text-mutedfg md:text-base">
          {FACTS.hero} {FACTS.promise}
        </motion.p>

        <motion.div {...stagger(4)} className="mt-10">
          <CTARow
            primary={
              <Magnetic>
                <GoldButton href="#/download">Get Vaerion</GoldButton>
              </Magnetic>
            }
            secondary={
              <Magnetic>
                <GhostButton href="#/knowledge">Enter the Knowledge Interface</GhostButton>
              </Magnetic>
            }
          />
          <div className="mt-6 flex justify-center">
            <ArrowLink href="#/playground">Watch the engine govern a live action — the Playground</ArrowLink>
          </div>
        </motion.div>

        <motion.p
          {...stagger(5)}
          className="mt-14 font-mono text-[10px] uppercase tracking-[0.22em] text-mutedfg/50"
          aria-hidden
        >
          local-first · zero telemetry · evidence remains
        </motion.p>
      </div>
    </section>
  );
}

/* ── the page ─────────────────────────────────────────────────────────── */

export function LaunchHome() {
  const { state } = useKnowledge();

  return (
    <>
      <Hero />

      {/* The measured band — live from the stage manifest and the release record. */}
      <Section tight label="The record" title="Measured, not narrated.">
        {state.phase === "loading" ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy="true" aria-label="Loading the measured record">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl p-4">
                <div className="vx-skeleton h-7 w-20 rounded" />
                <div className="vx-skeleton mt-2 h-3.5 w-28 rounded" />
                <div className="vx-skeleton mt-1.5 h-3 w-24 rounded" />
              </div>
            ))}
          </div>
        ) : state.phase === "error" ? (
          <GlassPanel className="border-failx/40 p-5">
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-failx">the record is unreachable</p>
            <p className="mt-2 text-sm text-mutedfg">
              /api/knowledge responded: {state.message}. Nothing is shown in its place — no cached numbers, no estimates.
            </p>
            <div className="mt-4">
              <ArrowLink href="#/knowledge">Open the Knowledge Interface directly</ArrowLink>
            </div>
          </GlassPanel>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                {
                  value: `${state.data.counts.stagesConformant}/${state.data.counts.stages}`,
                  label: "stages conformant",
                  sub: "the Volume IV build order",
                },
                {
                  value: String(state.data.counts.receipts),
                  label: "release receipts",
                  sub: state.data.release ? `rel ${state.data.release.releaseId}` : "none recorded",
                },
                {
                  value: String(state.data.counts.artifacts),
                  label: "provenanced artifacts",
                  sub: "every one names its origin",
                },
                {
                  value: String(state.data.counts.channels),
                  label: "distribution channels",
                  sub: "signed — delivery is Founder-gated",
                },
              ].map((s, i) => (
                <Reveal key={s.label} delay={i * 0.06}>
                  <div className="glass group h-full rounded-2xl p-4 transition-all duration-500 hover:-translate-y-1 hover:border-gold/25 hover:shadow-[0_0_36px_-14px_rgba(212,175,55,0.25)]">
                    <p className="font-mono text-xl font-semibold tracking-tight text-body md:text-2xl">{s.value}</p>
                    <p className="mt-1 text-[13px] font-medium text-body">{s.label}</p>
                    {s.sub ? <p className="mt-0.5 font-mono text-[11px] text-mutedfg">{s.sub}</p> : null}
                  </div>
                </Reveal>
              ))}
            </div>
            {state.data.release ? (
              <Reveal delay={0.2}>
                <p className="mt-5 font-mono text-[11.5px] leading-relaxed text-mutedfg">
                  release of record <span className="text-gold">{state.data.release.releaseId}</span> · version{" "}
                  {state.data.release.version} · ledger seq {state.data.release.seq} · issued {releaseDate(state.data.release.appendedAt)} ·
                  parent {state.data.release.parentReleaseId ?? "genesis"}
                </p>
              </Reveal>
            ) : null}
          </>
        )}
      </Section>

      {/* The trust engine — mission control for the one advantage: evidence. */}
      <Section tight label="The trust engine" title="Permissions, journals, receipts, verification — mission control.">
        {state.phase === "ready" ? (
          <div className="space-y-4">
            <TrustConsoles data={state.data} />
            <JournalChain data={state.data} />
          </div>
        ) : state.phase === "error" ? (
          <GlassPanel className="p-5">
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-failx">the engine view is unreachable</p>
            <p className="mt-2 text-sm text-mutedfg">
              the consoles render only from the live record — {state.message}. nothing simulated is shown in its place.
            </p>
          </GlassPanel>
        ) : (
          <TrustEngineSkeleton />
        )}
      </Section>

      {/* Agent activity — the build order as verification checkpoints. */}
      <Section tight label="Agent activity" title="The build order, as measured.">
        {state.phase === "ready" ? (
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] lg:items-start">
            <EvidenceStream data={state.data} />
            <GlassPanel edgeLight className="p-5 md:p-7">
              <p className="flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-mutedfg">
                <ShieldCheck className="h-3.5 w-3.5 text-trust" aria-hidden />
                the nine gates
              </p>
              <GateChips className="mt-5" />
              <p className="mt-5 font-mono text-[11px] leading-relaxed text-mutedfg">
                {FACTS.verification.tests.total} tests · {FACTS.verification.tests.suites} suites ·{" "}
                {FACTS.verification.tests.expectations.toLocaleString("en-US")} expectations · {FACTS.verification.tests.failed} failed ·
                coverage {FACTS.verification.coverage.lines}% lines
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-mutedfg/60">
                transcribed from the measured verification record (FACTS site law)
              </p>
            </GlassPanel>
          </div>
        ) : state.phase === "error" ? (
          <GlassPanel className="p-5">
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-failx">the stream is unreachable</p>
            <p className="mt-2 text-sm text-mutedfg">the timeline renders only from the live stage manifest — nothing simulated.</p>
          </GlassPanel>
        ) : (
          <div className="glass rounded-2xl p-5 md:p-7" aria-busy="true">
            <div className="vx-skeleton h-3 w-56 rounded" />
            <div className="mt-6 space-y-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="vx-skeleton h-[15px] w-[15px] shrink-0 rotate-45 rounded-[2px]" />
                  <div className="flex-1 space-y-2">
                    <div className="vx-skeleton h-3 w-40 rounded" />
                    <div className="vx-skeleton h-3 w-3/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* The 15-minute journey — real commands. */}
      <Section tight label="The journey" title="The 15-minute journey — real commands.">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <p className="max-w-xl text-sm leading-relaxed text-mutedfg">
              Install Vaerion, connect an agent, run an action, verify the evidence. Every command below exists in the CLI of record — the
              terminal shows the honest shape of the journey, never a fabricated transcript.
            </p>
            <div className="mt-6">
              <ArrowLink href="#/docs/getting-started">Read the quickstart</ArrowLink>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {FACTS.flow.map((f, i) => (
                <Reveal key={f} delay={i * 0.07}>
                  <div className="glass rounded-xl p-3.5 text-center">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">{f}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Terminal title="the 15-minute journey — real commands" lines={[...FACTS.heroTerminal]} />
        </div>
      </Section>

      <Section tight label="The movement" title="Action → Governance → Decision → Execution → Receipt → Verification.">
        <TrustPipeline />
        <p className="mx-auto mt-5 max-w-3xl text-center text-sm leading-relaxed text-mutedfg">
          Every AI action passes the same pipeline: declared capabilities are governed by the fail-closed broker, every decision is journaled on
          an append-only blake3 chain, receipts are folded from the journal alone, and verification recomputes everything — locally,
          deterministically, with zero telemetry.
        </p>
      </Section>

      <Section tight label="The archive" title="Nine ways in.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENTRIES.map((entry, i) => (
            <Reveal key={entry.href} delay={Math.min(i * 0.05, 0.3)}>
              <GlassCard href={entry.href} ariaLabel={entry.label} className="h-full">
                <div className="h-full p-5">
                  <entry.icon className="h-4 w-4 text-gold" aria-hidden />
                  <h3 className="mt-3 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-body">{entry.label}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-mutedfg">{entry.line}</p>
                  <ArrowRight className="mt-3 h-3.5 w-3.5 text-mutedfg transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </div>
              </GlassCard>
            </Reveal>
          ))}
          <Reveal delay={0.3}>
            <GlassCard href="#/download" ariaLabel="Download" className="h-full border-gold/25">
              <div className="h-full p-5">
                <h3 className="font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-gold">Download</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-mutedfg">
                  Signed release artifacts, source, npm and PyPI — with the honest status of every channel.
                </p>
                <ArrowRight className="mt-3 h-3.5 w-3.5 text-gold transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </Section>

      <Section tight label="What Vaerion is not" title="Limitations are facts too.">
        <GlassPanel className="p-6">
          <Bullets items={[...FACTS.notYet]} />
          <p className="mt-5 font-mono text-[11px] leading-relaxed text-mutedfg">
            sources of record: site-data/vaerion-status.json · constitution/releases/index.json · /api/knowledge (live) · src/components/site/facts.ts
          </p>
        </GlassPanel>
      </Section>
    </>
  );
}
