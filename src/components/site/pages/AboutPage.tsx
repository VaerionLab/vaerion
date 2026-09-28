"use client";

import { Scale, FileText, ShieldCheck, Compass } from "lucide-react";
import { FACTS } from "../facts";
import { PageHero, Section, Panel, Stat, Bullets, ArrowLink, GoldButton, CTARow, Callout } from "../primitives";

/* The thesis, the founder story (measured facts only — no invented
   biography), and the vision phases. Every number comes from FACTS. */

const PHASES = [
  {
    n: "01",
    name: "Proof",
    text: "An engine that proves what it claims: journals, receipts, bundles — each verified on the user's machine, not the vendor's word.",
  },
  {
    n: "02",
    name: "Adoption",
    text: "A release train that carries the engine to real users through honest channels: signed releases, verified builds, published packages when the gate opens.",
  },
  {
    n: "03",
    name: "Trust",
    text: "Trust as a property of bytes, not relationships: receipts that verify years later, signing keys with a recorded ceremony, a risk ledger that hides nothing.",
  },
  {
    n: "04",
    name: "Ecosystem",
    text: "Surfaces that others can build on: the CLI, the loopback daemon, the SDK, and contracts published additively so integrations do not rot.",
  },
  {
    n: "05",
    name: "Standard",
    text: "The long game: agent actions carrying verifiable evidence becomes the default expectation — the way transactions are the default expectation of a database.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="AI agents can act. Trust must be infrastructure."
        lead="Vaerion exists because belief is not a security model. When an autonomous agent reads your files, calls your tools, and ships your code, you should hold evidence of what it did — not a vendor's promise about what it probably did. Vaerion makes every action verifiable: locally, deterministically, without telemetry."
      />

      {/* ─────────── the thesis ─────────── */}
      <Section tight label="What Vaerion is" title="A constitutional engine for autonomous work.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              icon: Scale,
              title: "Governance is not prompt-language",
              text: "Permissions live in an engine that can refuse. A fail-closed broker decides before anything acts, and refusals are journaled evidence too.",
            },
            {
              icon: FileText,
              title: "Evidence over promises",
              text: "Every step lands on one append-only, blake3-chained journal. Receipts fold from that journal and verify independently of the process that produced them.",
            },
            {
              icon: ShieldCheck,
              title: "Local-first by construction",
              text: "One sanctioned network seam, secrets in your keychain, zero telemetry enforced mechanically. Your machine is the trust boundary — and the trust anchor.",
            },
          ].map((c) => (
            <Panel key={c.title} className="p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                <c.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-base font-semibold text-body">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mutedfg">{c.text}</p>
            </Panel>
          ))}
        </div>
      </Section>

      {/* ─────────── the founder story ─────────── */}
      <Section
        label="The founder"
        title="Auren built Vaerion the way an engine should be built: law first, evidence always."
        lead="Not a feature chasing a market — an answer to a real problem the founder kept hitting: intelligent systems that act, and no infrastructure that can show what they did. The response was to build the infrastructure, and to write its law down before writing its code."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-4">
            <Panel className="p-6 md:p-8">
              <h3 className="text-base font-semibold text-body">A constitution, then an engine</h3>
              <p className="mt-3 text-sm leading-relaxed text-mutedfg">
                Vaerion is governed by an explicit engineering constitution: deterministic behavior, contract-first evolution, and
                evidence-based verification. The law lives in the repository — {FACTS.contracts.adrs} architecture decision records with
                statuses stated, not implied, and verification gates that fail the build when a guarantee regresses. Honesty is structural:
                every check carries a label (VERIFIED, UNVERIFIED, NEVER EXECUTED), and readiness is fail-closed — unmeasurable means blocked.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-mutedfg">
                The founder&apos;s gate is part of the design, not a bottleneck: publication, key ceremonies, and substrate ratification are
                named human decisions, recorded as such. Automation proposes; humans dispose. Nothing ships on an assumption.
              </p>
            </Panel>
            <Panel className="p-6 md:p-8">
              <h3 className="text-base font-semibold text-body">The measured proof points</h3>
              <p className="mt-3 text-sm leading-relaxed text-mutedfg">
                Claims carry evidence or carry a marker. These are the engine&apos;s current measured surfaces:
              </p>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Stat value={`${FACTS.verification.tests.total}`} label="Tests, zero failing" sub={`${FACTS.verification.tests.expectations.toLocaleString()} expectations · ${FACTS.verification.tests.suites} suites`} />
                <Stat value={`${FACTS.verification.gates.length}`} label="Verification gates" sub="every build, in CI and locally" />
                <Stat value={`${FACTS.code.engineLines.toLocaleString()}`} label="Lines of engine" sub={`${FACTS.code.engineFiles} files · TypeScript on Bun`} />
                <Stat value={`${FACTS.contracts.ecodes}`} label="Stable E-codes" sub={`${FACTS.contracts.adrs} ADRs · ${FACTS.contracts.apiPaths} API paths`} />
                <Stat value={`${FACTS.verification.coverage.lines}%`} label="Line coverage" sub={`${FACTS.verification.coverage.branches}% branches · ${FACTS.verification.coverage.modulesRatcheted} modules ratcheted`} />
                <Stat value={FACTS.release.signing.split(" ")[0]} label="Release signing" sub={FACTS.release.status} />
              </div>
            </Panel>
          </div>
          <div className="flex flex-col gap-4">
            <Callout kind="security" title="Local-first is a stance">
              There is no cloud service. The engine runs on your machine; the cloud seams are reserved in the architecture (ADR-0017) and
              intentionally unimplemented. Your journals, receipts, and bundles never leave your workspace unless you move them.
            </Callout>
            <Callout kind="info" title="Governance in public">
              The constitution, the decision register, the risk ledger, and the signing ceremony are all readable documents in the repository —
              the same ones the gates enforce. Governance you can read is governance you can check.
            </Callout>
            <Panel className="flex-1 p-6">
              <h3 className="text-sm font-semibold text-body">Read the records</h3>
              <div className="mt-4">
                <Bullets
                  items={[
                    `${FACTS.contracts.adrs} ADRs — the decision register, each record with its status`,
                    "docs/security/ — threat model, mitigation record, risk ledger, signing ceremony",
                    "docs/adr/0018 — the provisional substrate, with its recorded migration path",
                  ]}
                />
              </div>
              <div className="mt-5">
                <ArrowLink href={`${FACTS.repoUrl}/tree/main/docs/adr`} external>
                  The decision register
                </ArrowLink>
              </div>
            </Panel>
          </div>
        </div>
      </Section>

      {/* ─────────── the vision ─────────── */}
      <Section
        label="The vision"
        title="Five phases: Proof → Adoption → Trust → Ecosystem → Standard."
        lead="Each phase is gated by the same law the engine enforces on itself: a phase is entered when its claims are measured, not announced."
      >
        <ol className="space-y-3">
          {PHASES.map((p) => (
            <li key={p.n} className="flex gap-4 rounded-2xl border border-edge bg-surface p-5">
              <span className="inline-flex h-9 shrink-0 items-center rounded-lg border border-gold/30 bg-gold/10 px-3 font-mono text-xs font-semibold text-gold">
                {p.n}
              </span>
              <div>
                <p className="font-mono text-sm font-semibold uppercase tracking-[0.12em] text-body">{p.name}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-mutedfg">{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* ─────────── contact ─────────── */}
      <Section tight label="Contact" title="Reach the project.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-mutedfg">
            The project identity is <span className="font-mono text-gold">{FACTS.author}</span> &lt;
            <a href={`mailto:${FACTS.contactEmail}`} className="text-gold underline-offset-4 hover:underline">
              {FACTS.contactEmail}
            </a>
            &gt;. Defects go to the public issue tracker; security findings go privately to the address above.
          </p>
          <CTARow
            primary={
              <GoldButton href={FACTS.issuesUrl} external>
                GitHub issues
              </GoldButton>
            }
            secondary={
              <a
                href={`mailto:${FACTS.contactEmail}`}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-edge bg-surface px-5 text-sm font-medium text-body transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <Compass className="h-4 w-4" aria-hidden /> Email the founder
              </a>
            }
          />
        </div>
      </Section>
    </>
  );
}
