"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FACTS } from "../facts";
import { PageHero, Section, Callout, ArrowLink } from "../primitives";
import DocsNav from "../DocsNav";

/* Answers distilled from docs/FAQ.md and the documents of record. */

const QA: { q: string; a: React.ReactNode }[] = [
  {
    q: "What is Vaerion, in one sentence?",
    a: (
      <p>
        A local-first AI development engine that runs AI-assisted work the way a database engine runs transactions: every step lands on an
        append-only, hash-chained journal, every privileged action passes a fail-closed broker, and every finished run closes with a verifiable
        receipt.
      </p>
    ),
  },
  {
    q: "Does it phone home?",
    a: (
      <p>
        No. Zero telemetry is constitutional and mechanically enforced: the engine contains exactly one sanctioned network egress site (the
        gateway&apos;s <code className="font-mono">transport.ts</code>), reachable only behind a journaled broker decision.{" "}
        <code className="font-mono">vae doctor</code> verifies the picture without touching the network. The constitutional-check gate fails the
        build if that ever changes.
      </p>
    ),
  },
  {
    q: "What model providers are supported?",
    a: (
      <p>
        Providers connect through the gateway seam: {FACTS.providers.join(", ")}. Real providers must be declared under{" "}
        <code className="font-mono">gateway.providers</code> in <code className="font-mono">vaerion.yaml</code>; their secret NAMES resolve at
        call time from your OS keychain or environment — values never enter config, journals, or bundles.
      </p>
    ),
  },
  {
    q: "Do I need API keys to try it?",
    a: (
      <p>
        No. <code className="font-mono">vae run demo</code>, <code className="font-mono">vae run research</code>, and{" "}
        <code className="font-mono">vae run agent --planner inline</code> are fully hermetic — the seeded{" "}
        <code className="font-mono">mockbrain</code> virtual provider answers locally, byte-identical for the same seed. No network, no
        credentials, no account.
      </p>
    ),
  },
  {
    q: "Is Vaerion on npm yet?",
    a: (
      <>
        <p>
          Honest answer: not yet. The npm and PyPI package builds are verified (build + local install pass), but registry publication is a
          release-train step and remains Founder-gated. Until it lands, install from source or from the signed tarballs on GitHub Releases.
        </p>
        <p className="mt-3">
          See <a href="#/docs/installation" className="text-gold underline-offset-4 hover:underline">Installation</a> for the honest channel
          map.
        </p>
      </>
    ),
  },
  {
    q: "What is a receipt?",
    a: (
      <p>
        The terminal record of a run: counts (events, decisions, gates, snapshots), the journal&apos;s head hash, and a summary — folded FROM
        the journal, so it cannot disagree with it. Receipts live in <code className="font-mono">.vaerion/receipts/</code> and verify
        independently of the process that produced them. Read one with <code className="font-mono">vae explain &lt;RUN_ID&gt;</code>.
      </p>
    ),
  },
  {
    q: "What is a .vxn bundle?",
    a: (
      <p>
        The reproducible output format (ADR-0016): <code className="font-mono">vae package build</code> folds the declared inputs with no
        wall-clock and no ambient paths into a canonically ordered, zstd-compressed bundle whose content identity is blake3. Identical inputs
        produce byte-identical bytes. <code className="font-mono">vaerion.lock</code> seals the digest;{" "}
        <code className="font-mono">vae package verify</code> recomputes everything and never executes content.
      </p>
    ),
  },
  {
    q: "Why did my command exit with code 3 (or 5)?",
    a: (
      <p>
        Exit codes are honest: <code className="font-mono">0</code> ok · <code className="font-mono">1</code> internal ·{" "}
        <code className="font-mono">2</code> usage · <code className="font-mono">3</code> broker-denied (the permission broker refused; the
        refusal is journaled) · <code className="font-mono">4</code> provider-down · <code className="font-mono">5</code>
        {" "}partial-with-repair-hint (verification failed; the output carries the finding and the fix). Every error names its E-code — look it
        up in the <a href="#/docs/troubleshooting" className="text-gold underline-offset-4 hover:underline">troubleshooting table</a>.
      </p>
    ),
  },
  {
    q: "Can the CLI output break my scripts?",
    a: (
      <p>
        The pipe contract is stable: without a TTY (or with <code className="font-mono">VAE_UI=plain</code>) every command prints plain text,
        and with <code className="font-mono">--json</code> it emits NDJSON — one JSON object per line. Rich panels, color, and badges appear
        ONLY on interactive terminals. <code className="font-mono">NO_COLOR</code> is always honored.
      </p>
    ),
  },
  {
    q: "Is the TypeScript-on-Bun substrate permanent?",
    a: (
      <p>
        It is explicitly <strong className="text-body">provisional</strong> (ADR-0018): the constitutional law binds behavior, not the language.
        The journal format, envelope schema, error catalog, and bundle format are defined language-neutrally in <code className="font-mono">spec/</code>,
        and a recorded migration path exists — replay the golden fixtures, rebuild the reference bundle byte-identically, pass the parity
        suites. Final ratification is a named Founder decision, not an engineering assumption.
      </p>
    ),
  },
  {
    q: `What license does Vaerion use?`,
    a: (
      <p>
        {FACTS.license}. By contributing, you agree that your contributions are licensed under the Apache License 2.0 (
        <code className="font-mono">LICENSE</code> at the repository root).
      </p>
    ),
  },
  {
    q: "How do I report a bug?",
    a: (
      <p>
        Attach: the exact command, the E-code from the output, <code className="font-mono">vae doctor --json</code>, and — for run bugs —{" "}
        <code className="font-mono">vae journal export &lt;RUN_ID&gt;</code> (redacted, independently verifiable). The beta program&apos;s
        severity ladder is defined in <code className="font-mono">BETA-ONBOARDING.md</code>. Security findings are the exception: they go
        privately to {FACTS.contactEmail}, never as a public issue.
      </p>
    ),
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Docs · FAQ"
        title="Short answers, with evidence you can run."
        lead="The questions new users and beta testers actually ask. Nothing here is a promise — every answer points at a command, a document, or a measured state."
      >
        <DocsNav route="/docs/faq" />
      </PageHero>

      <Section tight label="Questions">
        <Accordion type="single" collapsible className="rounded-2xl border border-edge bg-surface px-5">
          {QA.map((item, i) => (
            <AccordionItem key={item.q} value={`q-${i}`}>
              <AccordionTrigger className="min-h-[44px] py-4 text-left text-sm font-semibold text-body hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="border-t border-edge/60 pt-4 text-sm leading-relaxed text-mutedfg">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <Section tight label="More">
        <Callout kind="info" title="Where to read more">
          Quickstart (<code className="font-mono">docs/QUICKSTART.md</code>) · installation (<code className="font-mono">docs/INSTALL.md</code>)
          · troubleshooting (<code className="font-mono">docs/TROUBLESHOOTING.md</code>) · decisions (
          <code className="font-mono">docs/adr/README.md</code>) · security (<code className="font-mono">docs/security/</code>).
        </Callout>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          <ArrowLink href="#/docs/getting-started">Getting started</ArrowLink>
          <ArrowLink href="#/docs/cli">CLI reference</ArrowLink>
          <ArrowLink href="#/docs/troubleshooting">Troubleshooting</ArrowLink>
        </div>
      </Section>
    </>
  );
}
