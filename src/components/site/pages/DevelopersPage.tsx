"use client";

import { TerminalSquare, ArrowRight, Braces, Package, Workflow, FolderTree } from "lucide-react";
import { FACTS } from "../facts";
import {
  Section,
  PageHero,
  Panel,
  Pill,
  Honesty,
  Bullets,
  CodeBlock,
  Stat,
  ArrowLink,
  Callout,
  CTARow,
  GoldButton,
  GhostButton,
} from "../primitives";
import { SurfaceChip } from "../diagrams";

/* Real API paths from spec/openapi.json (17 paths — a representative subset shown). */
const API_PATHS = [
  "/health",
  "/version",
  "/openapi.json",
  "/runs",
  "/runs/{run_id}",
  "/runs/{run_id}/events",
  "/models",
  "/tools",
  "/packages/pack",
  "/packages/verify",
  "/packages/import",
] as const;

export default function DevelopersPage() {
  return (
    <>
      <PageHero
        eyebrow="Developers"
        title="Install it. Run it. Verify it. Everything else is optional."
        lead="One CLI, one SDK, one local daemon — all projections of the same engine contracts. This page is the honest entry point: what is verified, what is gated, and the fastest path to your first verified run."
      >
        <CTARow
          primary={
            <GoldButton href="#/how-it-works">
              Take the 15-minute tour <ArrowRight className="h-4 w-4" aria-hidden />
            </GoldButton>
          }
          secondary={<GhostButton href="#/docs/cli">CLI reference</GhostButton>}
        />
      </PageHero>

      {/* ───────────────────  install  ─────────────────── */}
      <Section
        label="Install"
        title="Two verified channels today. The rest are marked, not hidden."
        lead="Requires Bun 1.3+. The channel map below mirrors docs/INSTALL.md — a channel is listed as available only when it was measured working."
      >
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-edge">
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">
                    Channel
                  </th>
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">
                    Command
                  </th>
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {FACTS.install.channels.map((c) => (
                  <tr key={c.name} className="border-b border-edge/60 last:border-b-0 align-top">
                    <td className="px-4 py-4 font-medium text-body">{c.name}</td>
                    <td className="px-4 py-4 font-mono text-xs text-mutedfg">{c.command}</td>
                    <td className="px-4 py-4">
                      {c.status === "VERIFIED" ? (
                        <Pill tone="trust">VERIFIED · available</Pill>
                      ) : c.status.startsWith("UNVERIFIED") ? (
                        <Honesty>UNVERIFIED — host-gated</Honesty>
                      ) : (
                        <Pill tone="warn">{c.status}</Pill>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <div className="mt-6">
          <Callout kind="honesty" title="Until the release train runs">
            npm / PyPI publish is Founder-gated. Until then, install from source or the signed release tarball — and verify the signature
            before you trust it. vaerion.dev installer URLs go live with the release train.
          </Callout>
        </div>
      </Section>

      {/* ───────────────────  quickstart  ─────────────────── */}
      <Section
        label="Quickstart"
        title="Zero to a verified run in about 15 minutes."
        lead="The condensed path from docs/QUICKSTART.md — clone, verify the gates, scaffold a workspace, run the demo pipeline, and hold the proof in your hands."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <CodeBlock
            title="the 15-minute journey"
            code={`# 1 — install (Bun 1.3+)
git clone ${FACTS.repoUrl} vaerion && cd vaerion
bun install
bun run tools/verify.ts        # all gates must be green
alias vae="bun run packages/vaerion/src/cli/vae.ts"

# 2 — create a workspace (templates: minimal | demo | agent)
vae init --template demo

# 3 — run the demo pipeline
vae run demo --sources ./sources --query "determinism"

# 4 — verify the evidence
vae journal verify <RUN_ID>    # the blake3 chain holds
vae package build              # byte-identical .vxn + vaerion.lock
vae doctor                     # whole-workspace health — no network`}
          />
          <div className="flex flex-col justify-center gap-5">
            <Bullets
              items={[
                "Bare vae is the welcome front door: it measures the directory read-only and points at the next step.",
                "vae tour is a guided, nine-step walk of the engine — it points at real commands and never executes them.",
                "The demo pipeline needs no account and no API key: MockBrain is a deterministic local provider.",
                "Nothing leaves your machine unless you explicitly invoke a model provider through the gateway.",
              ]}
            />
            <ArrowLink href="#/docs/installation">Full installation guide</ArrowLink>
          </div>
        </div>
      </Section>

      {/* ───────────────────  first agent run  ─────────────────── */}
      <Section
        label="First agent run"
        title="An agent workspace with a declared model.invoke grant."
        lead="The agent template scaffolds a mockbrain planner, declared tools, and an explicit policy rule for the agent's model.invoke grant — governance you can read before anything runs."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col justify-center gap-5">
            <Bullets
              items={[
                "Every step of the supervised loop — model, tool, note, context — is journaled with round/index coordinates.",
                "Tools must be declared in vaerion.yaml AND granted by policy rules; undeclared calls are refused fail-closed (E1801).",
                "Broker refusals are fatal; the step ceiling stops loudly (E1804); gates pause for vae resume.",
                "The default planner runs mockbrain/mock-1 — local, seeded, byte-identical for the same goal and seed.",
              ]}
            />
            <CodeBlock
              title="agent commands (docs/CLI.md)"
              code={`vae init --template agent
vae run agent --goal "summarize the declared sources" --steps 4
vae resume <RUN_ID>            # if a durable human gate is pending`}
            />
          </div>
          <Panel className="p-6">
            <div className="flex items-center gap-3">
              <Workflow className="h-5 w-5 text-gold" aria-hidden />
              <h3 className="text-sm font-semibold text-body">What the loop guarantees</h3>
            </div>
            <div className="mt-4">
              <Bullets
                tone="trust"
                items={[
                  "Decisions before actions — the broker evaluates each tool call, and the decision is journaled first.",
                  "Deterministic planning when you want it: --planner inline takes a declared JSON step array (the hermetic determinism device).",
                  "Workflows run as fail-closed DAGs with deterministic topological scheduling and --resume for interrupted runs.",
                ]}
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Pill>vae run agent</Pill>
              <Pill>vae run workflow --dag FILE</Pill>
              <Pill>vae resume</Pill>
            </div>
          </Panel>
        </div>
      </Section>

      {/* ───────────────────  sdk  ─────────────────── */}
      <Section
        label="TypeScript SDK"
        title="One engine, two clients, tested parity."
        lead="@vaerion/sdk is a projection of the engine, never a second implementation. The CLI ⇄ SDK parity guarantee is enforced by an integration test, not asserted in a README."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CodeBlock
            title="speak to the daemon (docs/QUICKSTART.md §6)"
            code={`import { VaeDaemonClient } from "@vaerion/sdk";

const vae = new VaeDaemonClient({
  base: "http://127.0.0.1:<port>",
  token: "<pairing-token>",
});
console.log(await vae.version());`}
          />
          <div className="flex flex-col justify-center gap-5">
            <Bullets
              items={[
                "VaeClient — in-process: binds directly to the engine over one workspace (runResearch, journalVerify, resume, refusals…).",
                "VaeDaemonClient — wire client for vae serve: startAgentRun, streamRunEvents (SSE with journal cursor replay), answerGate.",
                "Loopback and pairing token are enforced in code: the wire client refuses non-loopback bases before a single byte is sent (E2006).",
                `${FACTS.sdk.parity}.`,
              ]}
            />
            <div className="flex flex-wrap gap-2">
              {["runResearch", "journalVerify", "gatewayInvoke", "agentRun", "workflowRun", "streamRunEvents"].map((m) => (
                <SurfaceChip key={m}>{m}</SurfaceChip>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Honesty>ships from source — registry publication Founder-gated</Honesty>
              <ArrowLink href="#/docs/sdk">SDK reference</ArrowLink>
            </div>
          </div>
        </div>
      </Section>

      {/* ───────────────────  examples  ─────────────────── */}
      <Section
        label="Examples"
        title="A workspace you can run, an eval methodology you can trust."
        lead="Everything below works from a fresh clone or a release tarball — nothing in the demo requires private context."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Panel className="p-6">
            <div className="flex items-center gap-3">
              <FolderTree className="h-5 w-5 text-gold" aria-hidden />
              <h3 className="text-base font-semibold text-body">examples/vaerion-demo</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-mutedfg">
              The canonical external-tester workspace: a minimal valid vaerion.yaml, local sources to index, and an annotated walkthrough.
              Use it in place, or scaffold from it — the same steps work in any directory.
            </p>
            <div className="mt-4">
              <ArrowLink href={`${FACTS.repoUrl}/tree/main/examples/vaerion-demo`} external>
                Browse the demo workspace
              </ArrowLink>
            </div>
          </Panel>
          <Panel className="p-6">
            <div className="flex items-center gap-3">
              <Braces className="h-5 w-5 text-gold" aria-hidden />
              <h3 className="text-base font-semibold text-body">Cassette-based hermetic evals</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-mutedfg">
              Recorded provider transcripts replay verbatim; MockBrain produces scripted, seed-deterministic outputs with no network. A
              failure report is reproducible: rerun with this seed against this cassette.
            </p>
            <div className="mt-4">
              <ArrowLink href="#/architecture">How determinism is maintained</ArrowLink>
            </div>
          </Panel>
        </div>
      </Section>

      {/* ───────────────────  api + cli  ─────────────────── */}
      <Section
        label="Reference"
        title="The surfaces, as generated."
        lead="The daemon's route surface is generated from the same service contracts the CLI uses, and the machine-readable description is published at /openapi.json — an API gap is impossible by construction (ADR-0010)."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={`${FACTS.contracts.apiPaths}`} label="API paths" sub="loopback HTTP/SSE, pairing-token authn" />
          <Stat value={`${FACTS.cli.commands.length}`} label="CLI commands" sub={`the ${FACTS.cli.bin} surface`} />
          <Stat value={`${FACTS.contracts.ecodes}`} label="Stable E-codes" sub="additive-only, never remapped" />
          <Stat value={`${FACTS.code.sdkLines}`} label="Lines of SDK" sub="a projection, not a re-implementation" />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel className="p-6">
            <h3 className="text-sm font-semibold text-body">Daemon endpoints (subset of 17)</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {API_PATHS.map((p) => (
                <SurfaceChip key={p}>{p}</SurfaceChip>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-mutedfg">
              Unauthenticated: /health, /version, /openapi.json. Every state-changing route requires the pairing token.
            </p>
          </Panel>
          <Panel className="p-6">
            <div className="flex items-center gap-3">
              <TerminalSquare className="h-5 w-5 text-gold" aria-hidden />
              <h3 className="text-sm font-semibold text-body">The CLI — vae</h3>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["run", "journal", "resume", "package", "provenance", "doctor", "serve", "explain"].map((c) => (
                <Pill key={c}>{c}</Pill>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-mutedfg">
              Help-first (parsed before any side effect), machine mode (--json), dry-run threaded through every mutating command, honest
              exit codes 0–5. Completions for six shells.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <GhostButton href="#/docs/cli">
                <TerminalSquare className="h-4 w-4" aria-hidden /> CLI reference
              </GhostButton>
              <GhostButton href={`${FACTS.repoUrl}`} external>
                <Package className="h-4 w-4" aria-hidden /> Repository
              </GhostButton>
            </div>
          </Panel>
        </div>
      </Section>
    </>
  );
}
