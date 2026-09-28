"use client";

import { BookOpen, TerminalSquare, Download, Braces, Boxes, ShieldCheck, CircleHelp, Wrench, ArrowRight } from "lucide-react";
import { FACTS } from "../facts";
import { PageHero, Section, Panel, Callout, ArrowLink, GoldButton, CTARow, Bullets } from "../primitives";
import DocsNav from "../DocsNav";

const PAGES = [
  {
    icon: BookOpen,
    href: "#/docs/getting-started",
    title: "Getting started",
    text: "The real 15-minute journey: install, init, run the demo, verify the journal, build and verify a bundle.",
  },
  {
    icon: Download,
    href: "#/docs/installation",
    title: "Installation",
    text: "The honest channel map — what is VERIFIED, what is Founder-gated, what is UNVERIFIED — and what installation does not do.",
  },
  {
    icon: TerminalSquare,
    href: "#/docs/cli",
    title: "CLI reference",
    text: `All ${FACTS.cli.commands.length} commands of the vae CLI with their flags, conventions, exit codes, and shell completions.`,
  },
  {
    icon: Braces,
    href: "#/docs/sdk",
    title: "TypeScript SDK",
    text: "@vaerion/sdk from source: VaeClient, VaeDaemonClient, the loopback pairing token, and the tested CLI parity law.",
  },
  {
    icon: Boxes,
    href: "#/docs/architecture",
    title: "Architecture",
    text: "Four layers, one spine — plus the full decision register (every ADR with its status) and the contracts-first philosophy.",
  },
  {
    icon: ShieldCheck,
    href: "#/docs/security",
    title: "Security",
    text: "The threat model distilled: what the engine guarantees, the risk ledger, the signing ceremony, and how to disclose.",
  },
  {
    icon: CircleHelp,
    href: "#/docs/faq",
    title: "FAQ",
    text: "Short answers with evidence you can run: telemetry, providers, receipts, bundles, license, substrate.",
  },
  {
    icon: Wrench,
    href: "#/docs/troubleshooting",
    title: "Troubleshooting",
    text: "Exit codes 0–5, the common E-codes with their fixes, journal recovery, and where your evidence lives on disk.",
  },
] as const;

export default function DocsHomePage() {
  return (
    <>
      <PageHero
        eyebrow="Documentation"
        title="Every claim in these pages is backed by a command you can run."
        lead="Operating documentation for the Vaerion engine: the CLI, the SDK, the architecture, and the security model — written the way the engine reports its own evidence. Start with the 15-minute journey or jump straight to the reference you need."
      >
        <DocsNav route="/docs" />
        <div className="mt-8">
          <CTARow
            primary={
              <GoldButton href="#/docs/getting-started">
                Start the 15-minute journey <ArrowRight className="h-4 w-4" aria-hidden />
              </GoldButton>
            }
          />
        </div>
      </PageHero>

      <Section
        label="The docs map"
        title="Eight documents, one engine."
        lead="Each page distills a document of record in the repository. Nothing here claims more than the engine can prove."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PAGES.map((p) => (
            <Panel key={p.href} className="group flex flex-col p-6 transition-colors hover:border-gold/30">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                <p.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-base font-semibold text-body">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-mutedfg">{p.text}</p>
              <div className="mt-5">
                <ArrowLink href={p.href}>
                  Read<span className="sr-only"> {p.title}</span>
                </ArrowLink>
              </div>
            </Panel>
          ))}

          <Panel className="flex flex-col justify-between p-6">
            <div>
              <h3 className="text-base font-semibold text-body">Repository pointers</h3>
              <p className="mt-2 text-sm leading-relaxed text-mutedfg">
                The engine ships its own manuals, generated from the command registry and the source of record:
              </p>
              <div className="mt-4">
                <Bullets
                  items={[
                    "docs/CLI.md — the vae manual, generated from the COMMAND_HELP registry",
                    "docs/SDK.md — the SDK surface, written from the source of record",
                    "docs/TROUBLESHOOTING.md — exit codes and E-code diagnostics",
                    "docs/adr/README.md — the full decision register",
                  ]}
                />
              </div>
            </div>
            <div className="mt-5">
              <ArrowLink href={FACTS.repoUrl} external>
                Browse the repository
              </ArrowLink>
            </div>
          </Panel>
        </div>
      </Section>

      <Section tight label="Of record" title="Docs of record.">
        <Callout kind="info" title="The repository markdown is canonical">
          The files under <code className="font-mono text-gold">docs/*.md</code> in the repository are the documents of record — this site
          distills them for reading, never replaces them. Where this page and the repository ever disagree, the repository wins and this site
          carries the defect.
        </Callout>
      </Section>
    </>
  );
}
