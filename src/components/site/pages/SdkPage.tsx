"use client";

import { FACTS } from "../facts";
import { PageHero, Section, Panel, Callout, CodeBlock, Honesty, Bullets, ArrowLink } from "../primitives";
import DocsNav from "../DocsNav";

/* Distilled from docs/SDK.md — written from the source of record
   (sdks/typescript/src/index.ts). Only exports and methods that exist
   are documented. */

const VAE_METHODS: [string, string][] = [
  ["raw(args)", "Any CLI argv in stable --json machine mode — the parity anchor; returns { code, lines }"],
  ["runResearch({ sources, query, maxDocs? })", "vae run research — the full broker-gated pipeline, in-process"],
  ["journalList() / journalVerify(runId)", "vae journal ls / verify — the VerifyReport"],
  ["journalRecords(runId) / journalExport(runId, out?)", "the raw hash-chained records / a redacted derivation"],
  ["restoreState(runId, traceId)", "deterministic replay over the journal — no locks held"],
  ["resume({ runId, answer? })", "vae resume — pending-gate resolution"],
  ["refusals(runId?) / verifyRefusals()", "the workspace Refusal Log and its chain verification"],
  ["verifyRunEvidence(runId) / verifyAudit()", "evidence↔blob↔fingerprint triangulation / audit-ledger verification (parity with vae doctor)"],
  ["gatewayInvoke({ request, intent?, transport?, secrets? })", "vae run model through the gateway SINGLE GATE — broker decision → adapter → sanctioned transport → metering → receipt"],
  ["metering(runId) / gatewayMatrix()", "the metering rollup (identical to vae explain) / the declared capability matrix"],
  ["agentRun({ goal, steps?, tools?, ... })", "vae run agent — the supervised loop over journaled decisions"],
  ["workflowRun({ dag, ... })", "vae run workflow — fail-closed DAG, journaled topological execution"],
];

const DAEMON_METHODS: [string, string][] = [
  ["health() · version() · openapi()", "unauthenticated metadata — health, engine version, the generated contract"],
  ["startAgentRun({ goal, planner?, steps? }) · startWorkflowRun(dag)", "start runs over the same engine contracts"],
  ["listRuns() · getRun(runId)", "run state, pollable"],
  ["streamRunEvents(runId, { cursor?, follow?, signal? })", "SSE with journal cursor replay; ends when the run seals"],
  ["streamWorkspaceEvents({ after?, types?, follow? })", "the workspace event stream"],
  ["answerGate(runId, gateId, answer?) · continueRun(runId) · cancelRun(runId)", "durable gates surface over the API identically to the CLI (ADR-0010 §5)"],
  ["listModels() · getModel(logical) · listTools()", "capability surfaces — secret NAMES only"],
  ["shutdown()", "echoes the token in the body, per the CLI contract"],
];

export default function SdkPage() {
  return (
    <>
      <PageHero
        eyebrow="Docs · SDK"
        title="@vaerion/sdk — a projection of the engine, never a second implementation."
        lead="The programmatic TypeScript surface of the Vaerion engine: the same contracts the CLI exercises — same engine calls, same envelopes, same receipts. The parity guarantee is tested, not assumed."
      >
        <DocsNav route="/docs/sdk" />
      </PageHero>

      <Section tight label="Consumption" title="From source, today.">
        <p className="-mt-4 max-w-3xl text-sm leading-relaxed text-mutedfg">
          {FACTS.sdk.name} is a workspace package of the repository (<code className="font-mono">private: true</code>,{" "}
          <code className="font-mono">main: ./src/index.ts</code>), depending on the engine via <code className="font-mono">workspace:*</code>.
          Bun executes TypeScript directly, so today&apos;s supported consumption is from source inside the repository.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Honesty>npm publish — Founder-gated (release train)</Honesty>
          <span className="text-sm text-mutedfg">
            The publishable npm tarball is the CLI distribution; it does not ship the SDK. SDK publication is the release-train step.
          </span>
        </div>
        <CodeBlock title="install (repository supply-chain law)" code={`bun install --frozen-lockfile`} />
      </Section>

      <Section tight label="Entry point" title="VaeDaemonClient — speak to the local daemon.">
        <p className="-mt-4 max-w-3xl text-sm leading-relaxed text-mutedfg">
          Start the daemon and pair once — the token is printed exactly once at start; the daemon refuses any non-loopback bind.
        </p>
        <CodeBlock
          title="typescript — pairing with the loopback daemon"
          code={`# shell 1
vae serve            # loopback HTTP/SSE; pairing token printed once

# shell 2
import { VaeDaemonClient } from "@vaerion/sdk";

const vae = new VaeDaemonClient({ base: "http://127.0.0.1:<port>", token: "<pairing-token>" });
console.log(await vae.version());`}
        />
      </Section>

      <Section tight label="VaeClient" title="The in-process client — the engine, no network.">
        <p className="-mt-4 max-w-3xl text-sm leading-relaxed text-mutedfg">
          Binds directly to the engine over one workspace (<code className="font-mono">vaerion.yaml</code> +{" "}
          <code className="font-mono">.vaerion/</code>) resolved from <code className="font-mono">cwd</code>.
        </p>
        <CodeBlock
          title="typescript — in-process"
          code={`import { VaeClient } from "@vaerion/sdk";

const vae = new VaeClient({ cwd: "./my-workspace" });

// Machine-parity anchor: run any CLI argv in --json mode.
const help = await vae.raw(["init", "--name", "my-project"]);

// The full research pipeline — the same path vae run research takes.
const run = await vae.runResearch({ sources: ["./docs"], query: "journal deterministic", maxDocs: 8 });
// => { runId, traceId, documents, hits, receipt, journalVerified }`}
        />
        <div className="mt-6 overflow-hidden rounded-2xl border border-edge">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Verified VaeClient method surface</caption>
            <thead>
              <tr className="bg-surface-2/60">
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">Method</th>
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">Parity with the CLI</th>
              </tr>
            </thead>
            <tbody>
              {VAE_METHODS.map(([m, p]) => (
                <tr key={m} className="border-t border-edge bg-surface">
                  <th scope="row" className="px-4 py-3 align-top font-mono text-[12px] font-semibold text-gold">{m}</th>
                  <td className="px-4 py-3 text-mutedfg">{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-mutedfg">
          Transport and secrets are injectable on the gateway/agent/workflow surfaces; tests stay hermetic via cassettes and MockBrain, and
          production defaults to the sanctioned fetch site and keychain-first resolution. The SDK also re-exports the engine primitives it
          composes — the full list is the export block of <code className="font-mono">src/index.ts</code>.
        </p>
      </Section>

      <Section tight label={FACTS.sdk.daemonClient} title="The wire client — the same contracts over HTTP/SSE.">
        <CodeBlock
          title="typescript — wire client"
          code={`import { VaeDaemonClient } from "@vaerion/sdk";

const daemon = new VaeDaemonClient({ base: "http://127.0.0.1:7897", token: "<the pairing token>" });

await daemon.health();                          // unauthenticated
const started = await daemon.startAgentRun({ goal: "..." });
for await (const evt of daemon.streamRunEvents(started.run_id)) {
  // journaled events, SSE with journal cursor replay
}`}
        />
        <div className="mt-6 overflow-hidden rounded-2xl border border-edge">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Verified VaeDaemonClient method surface</caption>
            <thead>
              <tr className="bg-surface-2/60">
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">Surface</th>
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">Notes</th>
              </tr>
            </thead>
            <tbody>
              {DAEMON_METHODS.map(([m, p]) => (
                <tr key={m} className="border-t border-edge bg-surface">
                  <th scope="row" className="px-4 py-3 align-top font-mono text-[12px] font-semibold text-gold">{m}</th>
                  <td className="px-4 py-3 text-mutedfg">{p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tight label="Pairing law" title="Loopback only. Token once. No flag opens the network.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Panel className="p-6">
            <Bullets
              tone="trust"
              items={[
                "The daemon binds loopback only (default 127.0.0.1:7897) and refuses any non-loopback bind server-side (E2001) — thrown before listen.",
                "A pairing token is generated at start and printed once; clients send Authorization: Bearer on every state-changing call.",
                "The wire client refuses non-loopback bases in code before a single byte is sent (assertLoopbackBase, E2006).",
                "Headless starts pre-provision the token via VAE_TRUST=<token> — vae serve never prints it in that case.",
                "Remote attachment waits for a ratified transport-security ADR. There is no flag that opens the daemon to the network.",
              ]}
            />
          </Panel>
          <Callout kind="security" title="The parity law — quoted from the test of record">
            <p>
              &ldquo;Machine parity test (Sacred Invariant #7): SDK ⇄ CLI over the same engine. Both surfaces must agree on run ids, journal
              verification, receipts, and redacted exports — parity is tested, not assumed.&rdquo;
            </p>
            <p className="mt-3">
              The test drives the same workspace through both surfaces; a CLI-issued run is visible to SDK restore as byte-identical state. If
              the CLI contract moves, the SDK moves with it — the parity test fails before any doc or consumer could drift.
            </p>
          </Callout>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          <ArrowLink href="#/docs/cli">The same contracts, as a CLI</ArrowLink>
          <ArrowLink href="#/docs/architecture">Where the SDK sits in the layers</ArrowLink>
        </div>
      </Section>
    </>
  );
}
