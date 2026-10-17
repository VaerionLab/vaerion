"use client";

import { FACTS } from "../facts";
import { PageHero, Section, Panel, Callout, CodeBlock, Pill, Bullets, ArrowLink } from "../primitives";
import DocsNav from "../DocsNav";

/* Distilled from integrations/README.md (the alliance index) and
   integrations/mcp/README.md (the host guide), both measured 2026-10-01
   against engine 0.1.14-rc1. The MCP config snippet below is copied
   verbatim from the host guide; the six tool names are verbatim from
   `tools/list`. Nothing here is aspirational. */

export default function IntegrationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Docs · Integrations"
        title="The trust layer beneath every agent framework."
        lead="Vaerion does not replace agent frameworks — frameworks are where agents are built, and Vaerion is the verification layer beneath them: every action that crosses it is brokered (fail-closed policy), journaled (append-only blake3 chain), and closes with a receipt that vae verify re-computes from the bytes on disk. The alliance pattern is one server, many hosts: the official MCP server ships inside the engine (vae mcp), a framework attaches once, and it inherits the whole constitutional path."
      >
        <DocsNav route="/integrations" />
      </PageHero>

      {/* ─────────── the five hosts ─────────── */}
      <Section
        label="The alliance"
        title="Five ratified hosts. Every suite spawns the real engine."
        lead="Each row below is a shipped adapter with a provenance header, an executed example (captured output checked in), and a test suite that asserts real on-disk evidence — journals, receipts, refusal ledgers, chain verification. No mocks of the engine exist anywhere in this tree."
      >
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <caption className="sr-only">The five ratified integration hosts</caption>
              <thead>
                <tr className="bg-surface-2/60">
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">Integration</th>
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">Surface</th>
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">Framework (measured)</th>
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">Repository path</th>
                </tr>
              </thead>
              <tbody>
                {FACTS.integrations.map((i) => (
                  <tr key={i.name} className="border-t border-edge bg-surface align-top">
                    <th scope="row" className="px-4 py-4 font-medium text-body">
                      {i.name}
                      <p className="mt-1 max-w-[26rem] text-xs font-normal leading-relaxed text-mutedfg">{i.value}</p>
                    </th>
                    <td className="px-4 py-4 font-mono text-xs text-gold">{i.surface}</td>
                    <td className="px-4 py-4 font-mono text-xs text-mutedfg">{i.framework}</td>
                    <td className="px-4 py-4">
                      <a
                        href={`${FACTS.repoUrl}/tree/main/${i.path.replace(/\/$/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center font-mono text-xs text-mutedfg underline-offset-4 transition-colors hover:text-body hover:underline sm:min-h-[28px]"
                      >
                        {i.path} ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <div className="mt-6">
          <CodeBlock
            title="install matrix (from a repo checkout — publication is release-train gated)"
            code={`pip install integrations/python/vaerion_openai_agents
pip install integrations/python/vaerion_langgraph
pip install integrations/python/vaerion_crewai
pip install integrations/python/vaerion_autogen

# The MCP host guide needs no install beyond the engine itself:
vae mcp                      # installed CLI
# bun run packages/vaerion/src/cli/vae.ts mcp   # dev checkout`}
          />
        </div>
      </Section>

      {/* ─────────── verification story ─────────── */}
      <Section
        label="Verification"
        title="Every run exposes the proof. vae verify recomputes it from disk."
        lead="The same three facts hold for all five hosts, because all of them cross the same engine path — the broker, the journal, the receipt."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Panel className="p-6">
            <Bullets
              tone="trust"
              items={[
                "Receipts — every run closes with run_id, receipt.journal.head_hash, and journal_verified; even a refused run closes with its receipt (refusals are evidence, not exceptions).",
                "Fail-closed refusals — no matching policy rule is a deny (E1301); every denial is journaled AND ledgered in .vaerion/refusals.log, its own blake3 chain.",
                "Verification trusts bytes, not processes — vae verify (or the vaerion_verify_journal tool) recomputes the full chain from the bytes on disk, independent of any process, model, or host.",
                "Real execution, everywhere — every alliance suite spawns the real vae mcp / vae serve in temp workspaces and asserts real evidence; the six-tool surface is pinned by test.",
              ]}
            />
          </Panel>
          <div className="flex flex-col gap-4">
            <CodeBlock
              title="the host's verification loop"
              code={`vae verify                 # latest run: ok:true / ok:false, exit 0/5
vae journal ls             # every run: run_id, records, events, head_hash
vae doctor                 # config, chains, blobs, audit + refusal ledgers`}
            />
            <Callout kind="security" title="Verify from inside the session too">
              The same three checks are available to the agent itself as <code className="font-mono">vaerion_verify_journal</code>,{" "}
              <code className="font-mono">vaerion_journal_ls</code>, and <code className="font-mono">vaerion_doctor</code> — a framework agent
              can verify its own work, but the hash chain means it cannot forge it.
            </Callout>
          </div>
        </div>
      </Section>

      {/* ─────────── attach a host: vae mcp ─────────── */}
      <Section
        label="Attach"
        title="vae mcp — the official server ships inside the engine."
        lead={`Any MCP host attaches to the same stdio server: ${FACTS.mcp.transport}, protocol ${FACTS.mcp.protocolVersion}, serverInfo ${FACTS.mcp.serverInfo}. Every tool call executes the real CLI contract in-process — nothing bypasses the constitutional path.`}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <CodeBlock
              title="Claude Desktop — claude_desktop_config.json (installed CLI) — verbatim from integrations/mcp/README.md"
              code={`{
  "mcpServers": {
    "vaerion": {
      "command": "vae",
      "args": ["mcp"]
    }
  }
}`}
            />
            <p className="mt-4 text-sm leading-relaxed text-mutedfg">
              One server process serves exactly one workspace — the <code className="font-mono">cwd</code> of the host process. The host guide
              ships the dev-checkout variant, a Cursor/Cline config with the auto-approve trade-off discussed, and a dependency-free demo
              script with its captured output.
            </p>
          </div>
          <Panel className="p-6">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">The six ratified tools (verbatim from tools/list)</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {FACTS.mcp.tools.map((t) => (
                <Pill key={t} tone="gold">
                  {t}
                </Pill>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-mutedfg">
              Two read tools (<code className="font-mono">vaerion_status</code>, <code className="font-mono">vaerion_journal_ls</code>), a
              verifier (<code className="font-mono">vaerion_verify_journal</code>), an auditor (<code className="font-mono">vaerion_doctor</code>
              ), and the two journaled runners (<code className="font-mono">vaerion_run_demo</code>,{" "}
              <code className="font-mono">vaerion_run_agent</code>). Bad params are protocol errors; tool execution failures are results with{" "}
              <code className="font-mono">isError: true</code> — never protocol errors.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <ArrowLink href={`${FACTS.repoUrl}/tree/main/integrations/mcp`} external>
                The full host guide
              </ArrowLink>
              <ArrowLink href="#/docs/cli">vae mcp in the CLI reference</ArrowLink>
            </div>
          </Panel>
        </div>
      </Section>

      {/* ─────────── where next ─────────── */}
      <Section tight label="Where next" title="Bind your code directly, or bring your framework.">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <ArrowLink href="#/docs/sdk">The five SDKs</ArrowLink>
          <ArrowLink href="#/developers">The developer entry point</ArrowLink>
          <ArrowLink href={`${FACTS.repoUrl}/tree/main/integrations`} external>
            integrations/ in the repository
          </ArrowLink>
        </div>
      </Section>
    </>
  );
}
