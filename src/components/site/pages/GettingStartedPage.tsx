"use client";

import { PageHero, Section, Panel, Callout, CodeBlock, ArrowLink, Bullets } from "../primitives";
import DocsNav from "../DocsNav";

/* The real 15-minute journey, distilled from docs/QUICKSTART.md (§0–§7).
   Every command below is quoted from that document — nothing invented. */

const STEPS = [
  {
    n: "0",
    title: "Install — 2 minutes",
    text: "The engine executes on the Bun runtime; the quickstart requires Bun 1.3+. From a clone, the verification suite is the first thing you run — if a gate fails, the engine is not verified on your machine.",
    code: `git clone <repository-url> vaerion && cd vaerion
bun install
bun run tools/verify.ts        # all gates must be green
alias vae="bun run packages/vaerion/src/cli/vae.ts"
vae --version`,
  },
  {
    n: "1",
    title: "Look around, then create a workspace — 2 minutes",
    text: "The welcome and the tour are read-only: nothing is created, modified, or executed. The tour teaches by pointing at real commands — vae dev, vae journal ls, vae doctor, vae repo — never by running them. init scaffolds vaerion.yaml plus .vaerion/ (minimal is the default template; demo and agent exist too).",
    code: `vae                # welcome front door: measures this directory,
                   # points at the next step (exit 0)
vae tour           # a guided, read-only walk of the engine —
                   # nine steps measured against your machine
vae init --template demo   # scaffold vaerion.yaml + .vaerion/`,
  },
  {
    n: "2",
    title: "Run the demo pipeline — 3 minutes",
    text: "Local sources are indexed, the query executes through the broker-gated tool pipeline, every step lands on the journal, and the run closes with a receipt folded from that journal. The command prints the run id; note it down.",
    code: `vae run demo --sources ./sources --query "determinism"
# bare form also works — the default derives from the
# declared capabilities in vaerion.yaml:
# vae run demo --query "determinism"`,
  },
  {
    n: "3",
    title: "Inspect, verify, explain — 3 minutes",
    text: "The blake3 chain is verified on your machine, now — not taken on faith. The receipt on disk (.vaerion/receipts/) verifies independently of the process that produced it.",
    code: `vae journal ls                       # your run is here
vae journal show <RUN_ID>            # the full event narrative
vae journal verify <RUN_ID>          # the blake3 chain holds — measured
vae explain <RUN_ID>                 # the same run, as a human story`,
  },
  {
    n: "4",
    title: "Prove reproducibility yourself — 3 minutes",
    text: "Build the bundle twice: the two .vxn files are byte-identical — same inputs, same bytes. Compare the blake3 digests verify prints if you do not take the docs' word for it. verify is a pure check: digests recomputed, pins compared, content never executed.",
    code: `vae package build                          # → .vaerion/package/vaerion-demo.vxn + vaerion.lock
vae provenance .vaerion/package/vaerion-demo.vxn
vae package build --out second.vxn         # build it again
vae package verify .vaerion/package/vaerion-demo.vxn`,
  },
  {
    n: "5",
    title: "Health check — 1 minute",
    text: "doctor verifies config validity, every journal's hash chain, every referenced blob, evidence↔blob↔fingerprint triangulation, the audit ledger, the refusal log chain, and the gateway picture — with no network access and no secret values resolved.",
    code: `vae doctor    # config, journals, blobs, audit chain, gateway matrix — no phone-home`,
  },
  {
    n: "6",
    title: "Optional: the daemon and the SDK — 2 minutes",
    text: "vae serve starts the loopback HTTP/SSE daemon and prints a pairing token exactly once. The TypeScript SDK speaks the same contracts over that loopback — machine parity, tested in the repository.",
    code: `vae serve            # loopback HTTP/SSE; pairing token printed once

# second shell — same engine contracts from TypeScript:
#   import { VaeDaemonClient } from "@vaerion/sdk";
#   const vae = new VaeDaemonClient({ base: "http://127.0.0.1:<port>", token: "<pairing-token>" });
#   console.log(await vae.version());`,
  },
  {
    n: "7",
    title: "Know your repository — 2 minutes",
    text: "Git, CI, and release evidence are treated as part of the constitutional runtime — measured, never assumed. Every check carries an honesty label (VERIFIED / UNVERIFIED / NEVER EXECUTED) and readiness is fail-closed: unmeasurable means blocked. Exit 0 means READY; exit 5 prints the blocker list with a fix for each.",
    code: `vae repo              # branch, tree state, conflicts, identity audit, tags — read-only
vae ci validate       # workflows must re-run tools/verify.ts, never re-implement the gates
vae ci simulate --event tag --ref v1.0.0   # which jobs WOULD run, and why
vae release readiness # can this ship? gates, git trust, CI validity, artifacts`,
  },
] as const;

export default function GettingStartedPage() {
  return (
    <>
      <PageHero
        eyebrow="Docs · Getting started"
        title="Fifteen minutes to a verified run."
        lead="From a fresh clone to a verified journal, a receipt, and a byte-identical bundle pair — entirely on your machine. Every command below is real; the companion workspace is examples/vaerion-demo/."
      >
        <DocsNav route="/docs/getting-started" />
      </PageHero>

      <Section tight label="Before you start">
        <Callout kind="security" title="Zero telemetry, no account, no API key">
          Nothing leaves your machine unless you explicitly invoke a model provider through the gateway. The demo run is fully hermetic — the
          seeded mockbrain virtual provider answers locally, byte-identical for the same seed.
        </Callout>
      </Section>

      {STEPS.map((s) => (
        <Section key={s.n} tight label={`Step ${s.n}`} title={s.title}>
          <p className="-mt-4 max-w-3xl text-sm leading-relaxed text-mutedfg md:text-base">{s.text}</p>
          <CodeBlock code={s.code} title={`quickstart §${s.n}`} />
        </Section>
      ))}

      <Section label="Where to go next" title="The documentation trail.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Panel className="p-6">
            <h3 className="text-sm font-semibold text-body">Deepen the paths you just walked</h3>
            <div className="mt-4">
              <Bullets
                items={[
                  "examples/vaerion-demo/DEMO.md — the annotated walkthrough of the demo workspace",
                  "docs/INSTALL.md — release-tarball installation and signature verification",
                  "docs/TROUBLESHOOTING.md — exit codes and E-codes when something refuses",
                ]}
              />
            </div>
          </Panel>
          <Panel className="p-6">
            <h3 className="text-sm font-semibold text-body">Read the model itself</h3>
            <div className="mt-4">
              <Bullets
                items={[
                  "docs/security/THREAT-MODEL.md — what the engine guarantees, and how",
                  "docs/adr/README.md — every architectural decision and its status",
                  "CONTRIBUTING.md — the verification law for changes",
                ]}
              />
            </div>
          </Panel>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          <ArrowLink href="#/docs/installation">Installation guide</ArrowLink>
          <ArrowLink href="#/docs/cli">CLI reference</ArrowLink>
          <ArrowLink href="#/docs/troubleshooting">Troubleshooting</ArrowLink>
        </div>
      </Section>
    </>
  );
}
