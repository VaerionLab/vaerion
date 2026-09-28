"use client";

import { Ban, Scale, ShieldCheck, FileText, Cpu, Fingerprint, Boxes } from "lucide-react";
import { PageHero, Panel, Pill, Callout, ArrowLink } from "../primitives";
import { SealGlyph } from "../proof";

/* ════════════════════════════════════════════════════════════════════════
 * The Vaerion Laws — the engine's founding rules, written the way protocols
 * write them. Every law maps to a mechanism that exists in the repository
 * (broker, journal, receipts, layerlint, constitutional checks). Nothing
 * here is aspirational: each law is enforced by code that runs on builds.
 * ════════════════════════════════════════════════════════════════════════ */

type Law = {
  n: string;
  name: string;
  statement: string;
  input: string;
  process: string;
  output: string;
  mechanism: string;
  icon: typeof Scale;
};

const LAWS: Law[] = [
  {
    n: "001",
    name: "Attribution",
    statement: "Every action must have an actor.",
    input: "Agent request",
    process: "Identity binding against the capabilities declared in vaerion.yaml",
    output: "An actor-bound envelope on the journal",
    mechanism: "fail-closed broker · identity.v1",
    icon: Fingerprint,
  },
  {
    n: "002",
    name: "Fail-closed",
    statement: "An undecided action never runs.",
    input: "Ambiguous or unevaluable action",
    process: "The broker refuses by default — uncertainty resolves to no",
    output: "A journaled refusal — rejection is evidence too",
    mechanism: "broker · refusal log",
    icon: Ban,
  },
  {
    n: "003",
    name: "Decision before effect",
    statement: "Nothing executes before its decision is written.",
    input: "Action envelope",
    process: "decide → journal → act, in that order, always",
    output: "Execution permitted only by a journaled allow",
    mechanism: "broker sequence · hash-chained journal",
    icon: Scale,
  },
  {
    n: "004",
    name: "Append-only evidence",
    statement: "The journal accepts writes. It never accepts edits.",
    input: "Run events",
    process: "blake3-chained append by a single writer",
    output: "A chain any later process can recompute — no silent edits",
    mechanism: "journal · single-writer spine",
    icon: FileText,
  },
  {
    n: "005",
    name: "Independent verification",
    statement: "Proof does not trust its producer.",
    input: "Receipt + journal",
    process: "A pure check recomputes digests and compares pins — content never executes",
    output: "Verified, or a named E-code finding",
    mechanism: "receipts · pure check",
    icon: ShieldCheck,
  },
  {
    n: "006",
    name: "Determinism",
    statement: "Identical inputs produce identical bytes.",
    input: "Declared sources, pins, lockfile",
    process: "Hermetic build · sealed eval cassettes — no ambient network",
    output: "A byte-identical .vxn bundle, every time",
    mechanism: "vaerion.lock · cassette evals",
    icon: Cpu,
  },
  {
    n: "007",
    name: "One seam",
    statement: "One egress, one writer, one secrets port.",
    input: "All model I/O · all secrets",
    process: "A single gateway with pinned endpoints; OS keychain first",
    output: "No ambient network. No secrets in evidence.",
    mechanism: "ADR-0019 · ADR-0013 · constitutional checks",
    icon: Boxes,
  },
  {
    n: "008",
    name: "Mechanical honesty",
    statement: "Unmeasurable means blocked.",
    input: "Every claim on every surface",
    process: "Readiness is fail-closed: VERIFIED requires measurement",
    output: "Labels you can audit — VERIFIED · UNVERIFIED · NEVER EXECUTED",
    mechanism: "9 verification gates · LIMITATIONS.md",
    icon: ShieldCheck,
  },
];

export default function LawsPage() {
  return (
    <>
      <PageHero
        eyebrow="Vaerion laws"
        title="Eight rules the engine cannot break."
        lead="Protocols earn trust by stating their laws and enforcing them mechanically. These eight govern every action Vaerion handles — each one maps to code that runs on every build, not to a policy document."
      >
        <div className="flex flex-wrap gap-2">
          <Pill tone="gold">protocol rules</Pill>
          <Pill tone="trust">mechanically enforced</Pill>
          <Pill>auditable in the repository</Pill>
        </div>
      </PageHero>

      <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 md:px-12 md:py-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {LAWS.map((law) => (
            <Panel key={law.n} className="flex flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">Vaerion law {law.n}</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-body">{law.name}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-body/90">{law.statement}</p>
                </div>
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                  <law.icon className="h-5 w-5" aria-hidden />
                </span>
              </div>
              <dl className="mt-5 flex-1 space-y-2.5 rounded-xl border border-edge bg-surface-2/40 p-4 font-mono text-[12px] leading-relaxed">
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                  <dt className="shrink-0 uppercase tracking-[0.12em] text-mutedfg">input</dt>
                  <dd className="text-body">{law.input}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                  <dt className="shrink-0 uppercase tracking-[0.12em] text-mutedfg">process</dt>
                  <dd className="text-mutedfg">{law.process}</dd>
                </div>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                  <dt className="shrink-0 uppercase tracking-[0.12em] text-mutedfg">output</dt>
                  <dd className="text-gold">{law.output}</dd>
                </div>
              </dl>
              <p className="mt-4 font-mono text-[11px] text-mutedfg">
                <span className="text-mutedfg/70">mechanism · </span>
                {law.mechanism}
              </p>
            </Panel>
          ))}
        </div>

        {/* closing statement */}
        <div className="mt-14">
          <div className="rounded-2xl border border-gold/30 bg-gold/[0.04] px-6 py-10 text-center md:py-14">
            <SealGlyph className="mx-auto h-12 w-12" />
            <p className="mx-auto mt-6 max-w-2xl text-balance text-xl font-semibold tracking-tight text-body md:text-2xl">
              Proof before promises. Trust before autonomy. Engineering before marketing.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-mutedfg">
              These are not slogans — each clause above compiles, runs, and gates the build that ships it.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#/playground"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-[#0B0D10] transition-colors hover:bg-gold-bright"
              >
                Watch every law fire in the playground
              </a>
              <ArrowLink href="#/docs/security">Read the security documentation</ArrowLink>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Callout kind="honesty" title="Where the laws live in the code">
            The layer law is enforced by layerlint, the constitutional guarantees by the constitutional-check gate, and the broker's
            fail-closed behavior by its own test suite. docs/LIMITATIONS.md is the honest inventory of what is measured — and what is not.
          </Callout>
        </div>
      </div>
    </>
  );
}
