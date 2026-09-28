"use client";

import { FACTS } from "../facts";
import { Section, Panel, CodeBlock, Terminal, GoldButton, GhostButton, ArrowLink } from "../primitives";
import { TrustPipeline } from "../diagrams";
import { GovernanceConsole } from "../proof";

/* ════════════════════════════════════════════════════════════════════════
 * The console page — five movements, product before explanation.
 *
 *   00 CONSOLE   the system entry: a live governance session
 *   01 PROTOCOL  the one diagram: action → verification
 *   02 EVIDENCE  one receipt, annotated
 *   03 OPERATE   install · run · verify
 *   04 LIMITS    what is not built, stated by the project itself
 *
 * Every claim comes from facts.ts. The console is labeled a simulation.
 * ════════════════════════════════════════════════════════════════════════ */

const RECEIPT_ROWS: { label: string; value: string; tone?: "gold" | "body" }[] = [
  { label: "RECEIPT_ID", value: "rcp_8f92a71d47c2", tone: "body" },
  { label: "STATUS", value: "VERIFIED", tone: "gold" },
  { label: "CHAIN", value: "CONNECTED · blake3 · append-only" },
  { label: "PREV_HASH", value: "b3:4d1f…9a02" },
  { label: "RECORDS", value: "42 journaled events" },
  { label: "FOLDED_FROM", value: "run_7c21k3 journal" },
  { label: "ALGORITHM", value: "recomputable by any process, years later" },
];

export default function HomePage() {
  return (
    <>
      {/* ═════════════════════  00 — system entry  ═════════════════════ */}
      <section aria-label="00 — System entry" className="relative overflow-hidden border-b border-edge bg-ink">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(32,40,54,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(32,40,54,0.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 75%)",
          }}
        />
        <div className="relative mx-auto grid min-h-[calc(100svh-3.5rem)] w-full max-w-[1200px] content-center gap-10 px-5 py-14 sm:px-8 md:px-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-14">
          {/* left rail — compact, technical */}
          <div className="flex flex-col justify-center">
            <p className="vx-reveal font-mono text-[11px] uppercase tracking-[0.16em] text-mutedfg">
              v{FACTS.version} · 9/9 gates green · {FACTS.license}
            </p>
            <h1 className="vx-reveal vx-reveal-1 mt-5 max-w-xl text-balance text-[1.7rem] font-medium leading-[1.18] tracking-[-0.01em] text-body md:text-[2.1rem]">
              AI can act. Vaerion makes those actions accountable.
            </h1>
            <p className="vx-reveal vx-reveal-2 mt-5 max-w-lg text-sm leading-relaxed text-mutedfg md:text-[15px]">
              A local-first governance runtime. Every agent action is brokered before it runs, every decision is journaled to a hash chain,
              every outcome folds into a receipt that verifies independently — trust becomes a property of the evidence, not the vendor.
            </p>
            <div className="vx-reveal vx-reveal-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <GoldButton href="#/docs/installation">Install</GoldButton>
              <GhostButton href="#/playground">Run the live demo</GhostButton>
            </div>
            <p className="vx-reveal vx-reveal-4 mt-8 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mutedfg/70">
              identity → governance → evidence → verification · nothing leaves this machine
            </p>
          </div>

          {/* the product — before any explanation */}
          <div className="vx-reveal vx-reveal-2 min-w-0 self-center">
            <GovernanceConsole />
          </div>
        </div>
      </section>

      {/* ═════════════════════  01 — protocol  ═════════════════════ */}
      <div className="border-b border-edge">
        <Section
          index="01"
          label="Protocol"
          title="Action → Governance → Decision → Execution → Receipt → Verification."
          lead="Six mechanical stages between an agent's intent and something you can believe. The last one is gold: the deposit. It verifies without believing anything."
        >
          <TrustPipeline />
        </Section>
      </div>

      {/* ═════════════════════  02 — evidence  ═════════════════════ */}
      <div className="border-b border-edge bg-surface/30">
        <Section
          index="02"
          label="Evidence"
          title="One receipt. Independently verifiable."
          lead="The receipt is not a promise. It is a fold over the journal chain — recompute it with any process and the bytes either match, or they name exactly where they were broken."
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            {/* the artifact */}
            <Panel className="min-w-0 overflow-hidden">
              <div className="flex items-center justify-between border-b border-edge px-4 py-2.5">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-mutedfg">Receipt — run_7c21k3</span>
                <span className="font-mono text-[9.5px] text-mutedfg/60">spec/schemas/receipt.schema.json</span>
              </div>
              <dl className="divide-y divide-edge/60 px-4">
                {RECEIPT_ROWS.map((r) => (
                  <div key={r.label} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.12em] text-mutedfg">{r.label}</dt>
                    <dd
                      className={
                        "min-w-0 truncate text-right font-mono text-[11.5px] " +
                        (r.tone === "gold" ? "font-semibold tracking-[0.14em] text-gold" : r.tone === "body" ? "text-body" : "text-mutedfg")
                      }
                    >
                      {r.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Panel>
            {/* the audit trail */}
            <div className="flex min-w-0 flex-col justify-center">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-mutedfg">The audit trail</p>
              <p className="mt-3 text-sm leading-relaxed text-mutedfg">
                Single writer. Append-only. Every step attributed to an actor and chained to the one before it. Verification is a pure check —
                it recomputes digests and never executes content, so the process that produced the evidence is irrelevant to whether it holds.
              </p>
              <div className="mt-5 rounded-md border border-edge bg-surface px-4 py-3">
                <p className="font-mono text-[11px] leading-relaxed text-mutedfg">
                  <span className="text-body">{FACTS.verification.tests.total}</span> tests ·{" "}
                  <span className="text-body">{FACTS.verification.gates.length}</span> gates ·{" "}
                  <span className="text-body">{FACTS.code.engineLines.toLocaleString()}</span> engine lines ·{" "}
                  <span className="text-body">{FACTS.contracts.ecodes}</span> E-codes ·{" "}
                  <span className="text-body">{FACTS.contracts.apiPaths}</span> API paths ·{" "}
                  <span className="text-body">{FACTS.contracts.adrs}</span> ADRs
                </p>
              </div>
              <div className="mt-5">
                <ArrowLink href="#/receipts">Inspect the evidence model</ArrowLink>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* ═════════════════════  03 — operate  ═════════════════════ */}
      <div className="border-b border-edge">
        <Section
          index="03"
          label="Operate"
          title="Install. Run. Verify."
          lead="No account, no API key — MockBrain is deterministic. The demo pipeline runs entirely on your machine."
        >
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <CodeBlock
              title="01 · install → run → verify"
              code={`# install (from source — verified channel)
git clone https://github.com/VaerionLab/vaerion
cd vaerion && bun install --frozen-lockfile

# create a workspace and run the demo
vae init --template demo
vae run demo --sources ./sources --query "determinism"

# receive proof
vae journal verify <RUN_ID>        # ok: true · chain intact
vae package build                  # byte-identical .vxn bundle`}
            />
            <Terminal title="vae — a verified run" lines={[...FACTS.heroTerminal]} />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <ArrowLink href="#/docs/installation">Installation guide</ArrowLink>
            <ArrowLink href="#/docs/getting-started">Quick start</ArrowLink>
            <ArrowLink href="#/docs/cli">CLI reference</ArrowLink>
          </div>
        </Section>
      </div>

      {/* ═════════════════════  04 — limits  ═════════════════════ */}
      <Section
        index="04"
        label="Limits"
        title="What is not built — stated by the project itself."
        lead="Honesty is a mechanism here: unmeasurable means blocked. This is the current, measured state — the full ledger lives in the repository."
      >
        <div className="divide-y divide-edge/60 border-y border-edge">
          {FACTS.notYet.map((n, i) => (
            <div key={n} className="flex items-start gap-4 py-3">
              <span className="mt-0.5 shrink-0 font-mono text-[10.5px] text-mutedfg/50" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm leading-relaxed text-mutedfg">{n}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <ArrowLink
            href="https://github.com/VaerionLab/vaerion/blob/main/docs/LIMITATIONS.md"
            external
          >
            Read the limitations ledger
          </ArrowLink>
          <ArrowLink href="#/status">Engine status — live measurements</ArrowLink>
        </div>
      </Section>

      {/* closing statement */}
      <div className="border-t border-edge">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-center px-5 py-10 sm:px-8 md:px-12">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.22em] text-mutedfg">
            Proof before promises · Trust before autonomy
          </p>
        </div>
      </div>
    </>
  );
}
