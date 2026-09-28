"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FACTS } from "../facts";
import { PageHero, Section, Panel, Callout, CodeBlock, Honesty, Pill, Bullets } from "../primitives";
import DocsNav from "../DocsNav";

/* Command reference — distilled from docs/CLI.md, which was generated from
   the COMMAND_HELP registry in packages/vaerion/src/cli/vae.ts. Only flags
   that exist in the registry are listed. */

const COMMANDS: { name: string; purpose: string; synopsis: string; flags: string[]; note?: string }[] = [
  {
    name: "vae init",
    purpose: "Scaffold a workspace: vaerion.yaml (strict schema 0.1) + .vaerion/ from a deterministic template.",
    synopsis: "vae init [--template minimal|demo|agent] [--name NAME] [--dry-run]",
    flags: [
      "--template minimal — the default; bare vae init is exactly this template",
      "--template demo — a demo workspace (./docs + ./sources capabilities), ready for vae run demo",
      "--template agent — mockbrain planner, declared tools, an explicit policy rule for model.invoke",
      "--name NAME — the only parameter; every template is byte-stable",
      "--dry-run — print the plan, write nothing",
    ],
    note: "Refuses to overwrite an existing vaerion.yaml. Unknown templates are a usage error (E1203). Telemetry is structurally false in every template.",
  },
  {
    name: "vae run",
    purpose: "Execute the constitutional pipelines: research, demo, model, agent, workflow.",
    synopsis:
      "vae run research --sources P[,P] --query Q [--max-docs N] [--dry-run]\nvae run demo [--sources P,P] [--query Q]\nvae run model --model P/M [--prompt TEXT] [--system TEXT] [--seed N] [--op chat|embed|rerank] [--max-tokens N] [--intent TEXT] [--dry-run]\nvae run agent --goal TEXT [--planner inline|model] [--steps N] [--plan-json JSON]\nvae run workflow --dag FILE [--resume RUN_ID]",
    flags: [
      "research / demo — capability → broker decision per source (journaled) → fingerprint → fence → blob CAS → evidence → index → query → citations → context pack → snapshot → receipt",
      "model — through the gateway single gate: broker decision, keychain-first secret resolution (names journaled, values never), metered usage, receipt",
      "agent — supervised loop; every step journaled; --planner inline requires --plan-json (the hermetic determinism device)",
      "workflow — fail-closed DAG validation (E1803), deterministic topological scheduling, crash-safe --resume",
    ],
    note: "Exit 3 if the broker denies; exit 5 if the journal fails final verification; budget overrun exits E1703; undeclared tool calls refused fail-closed (E1801).",
  },
  {
    name: "vae resume",
    purpose: "Restore a run deterministically from its journal; resolve pending durable human gates.",
    synopsis: "vae resume RUN_ID [--answer JSON]",
    flags: [
      "without --answer — renders the human review: question, options, the linked decision, a review diff when present",
      "--answer JSON — resolve the gate (default when omitted: {\"approved\":true})",
    ],
    note: "Approval of a broker prompt records an elevation (journaled + audited); a denial ends the run (exit 3).",
  },
  {
    name: "vae explain",
    purpose: "Reconstruct a run's narrative — decisions, gates, events, receipt — from its hash-chained journal.",
    synopsis: "vae explain RUN_ID",
    flags: ["Includes the gateway metering rollup: tokens and integer micro-USD per model, folded from the same journal"],
    note: "Exit 5 if the journal fails verification.",
  },
  {
    name: "vae journal",
    purpose: "Append-only journal operations over the blake3-chained run records.",
    synopsis:
      "vae journal ls\nvae journal show RUN_ID\nvae journal verify RUN_ID\nvae journal recover RUN_ID [--dry-run]\nvae journal export RUN_ID [--out PATH] [--dry-run]",
    flags: [
      "recover — truncates ONLY a torn crash tail and re-seals the chain with an auditable note",
      "export — a redacted, independently verifiable derivation (default: .vaerion/exports/<run>.redacted.ndjson)",
    ],
  },
  {
    name: "vae doctor",
    purpose: "The health check: config, journals, blobs, evidence triangulation, audit ledger, refusal log, gateway matrix.",
    synopsis: "vae doctor",
    flags: [
      "Verifies every journal's hash chain and every referenced blob in the CAS",
      "Reports the gateway picture: provider capability matrix, declared providers/secret NAMES/budgets",
    ],
    note: "Performs no network access and resolves no secret values — zero telemetry is constitutional. Exit 5 with Fix: hints on failures.",
  },
  {
    name: "vae dev",
    purpose: "Engine status, read-only: version, substrate (ADR-0018), layer map, workspace state, milestone position.",
    synopsis: "vae dev",
    flags: [],
  },
  {
    name: "vae serve",
    purpose: "Start the local API daemon — loopback HTTP/SSE over the same engine contracts the CLI exercises.",
    synopsis: "vae serve [--port N] [--host ADDR]",
    flags: [
      "Pairing token generated at start, printed ONCE (Authorization: Bearer on every call except /health, /version, /openapi.json)",
      "VAE_TRUST=<token> pre-provisions the token for headless starts — it is then never printed",
      "POST /shutdown with the token echoed in the body",
      "Default listener 127.0.0.1:7897; port 0 asks the OS for an ephemeral port",
    ],
    note: "Non-loopback binds are refused (E2001); remote exposure requires a ratified transport-security ADR, never a flag. Generated OpenAPI at /openapi.json.",
  },
  {
    name: "vae package",
    purpose: "Build and verify reproducible .vxn bundles (ADR-0016).",
    synopsis: "vae package build [--out PATH] [--dry-run]\nvae package verify BUNDLE [--dry-run]",
    flags: [
      "build — canonically ordered entries, zstd at the pinned level, blake3 content identity; identical inputs produce byte-identical bundles; regenerates vaerion.lock",
      "verify — the pure check: digests recomputed, pins compared against config AND lock both ways, content never executed",
    ],
    note: "Exit 0 verified; exit 5 with E2206 + per-check findings when the bundle must be refused. The build run is journaled and closes with a receipt.",
  },
  {
    name: "vae provenance",
    purpose: "Permanent provenance for anything Vaerion created — evidence recomputed from the bytes, not branding.",
    synopsis: "vae provenance ARTIFACT",
    flags: [
      ".vxn bundle — full pure format check",
      "vaerion.lock — seal cross-checked against the on-disk bundle (E2205 findings when evidence does not hold)",
      "redacted *.ndjson export — derivation header; release MANIFEST.json — displayed as recorded",
    ],
    note: "Exit 0 when the evidence holds; exit 5 with findings when it does not.",
  },
  {
    name: "vae repo",
    purpose: "Repository intelligence, measured never assumed — read-only (git runs with --no-optional-locks and fixed argv).",
    synopsis: "vae repo\nvae repo verify",
    flags: [
      "Branch, detached HEAD, staged/unstaged/untracked paths, conflicts, merge/rebase/cherry-pick/bisect state, worktrees, submodules, tags at HEAD",
      "Commit-identity audit of the last 50 commits; canonical remote state (reachability, main sync, tag push, protection hook)",
    ],
    note: "Each check is VERIFIED when measured here and UNVERIFIED when it cannot be. Exit 0 when no blocker-severity finding exists; exit 5 otherwise.",
  },
  {
    name: "vae ci",
    purpose: "CI understanding: workflows are the remote projection of the single verification authority (tools/verify.ts).",
    synopsis: "vae ci validate\nvae ci simulate --event push|pull_request|workflow_dispatch|tag [--ref NAME]",
    flags: [
      "validate — structural findings with stable codes: unparsable YAML (E2307), shape defects (E2304), gate logic without the authority (E2305), step-own-env-in-if drift (E2306), unpinned substrate versions, secret material echoed toward logs",
      "simulate — which workflows trigger and which jobs WOULD run, deterministically from the workflow text alone",
    ],
    note: "A projection is NOT an execution; remote outcomes are never claimed.",
  },
  {
    name: "vae release",
    purpose: "The constitutional release evaluator: can this repository ship — measured only, fail-closed.",
    synopsis: "vae release readiness [--live-gates]",
    flags: [
      "--live-gates — re-runs the verification gates live through the single authority",
      "Checks: verification-gates, git-tree-clean, git-identity-head/history, release-tag binding, version-lockstep, ci-validity, canonical-sync, release-artifacts, worklog-ledger, reports-present",
    ],
    note: "Every check carries an honesty label; unmeasurable means blocked. Exit 0 READY; exit 5 BLOCKED with the blocker list. The evaluation is journaled with a receipt when the repository is a Vaerion workspace.",
  },
  {
    name: "vae tour",
    purpose: "A guided, read-only walk of the engine — nine steps measured against this machine and this directory.",
    synopsis: "vae tour",
    flags: ["What Vaerion is · this directory · the config law · the journal · doctor · the gateway single gate · your first run · the trust surface · where to go next"],
    note: "It teaches by pointing at real commands; it never executes them. The same directory yields byte-identical --json output.",
  },
  {
    name: "vae account",
    purpose: "The identity and attribution surface, read-only: who acts here.",
    synopsis: "vae account",
    flags: [
      "The actor law (canonical local actor and broker principal ids), actors observed in this workspace's journals",
      "Commit identity (HEAD author + recent-commit audit); declared secret PROFILES — names only, never values",
    ],
    note: "Vaerion has no cloud accounts: your identity is local, attributed, and yours.",
  },
  {
    name: "vae ai",
    purpose: "The grounded question over your own sources, and the gateway capability matrix.",
    synopsis:
      "vae ai ask --question TEXT [--sources P,P | --capability NAME] [--model P/M] [--seed N] [--max-tokens N] [--max-docs N] [--intent TEXT] [--dry-run]\nvae ai models",
    flags: [
      "ask — a declared capability or explicit --sources (never ambient, never network) → one broker decision per source (journaled) → the one research pipeline → the answer crosses the gateway single gate with the fenced pack as the system prompt",
      "models — the gateway capability matrix (secret NAMES only), read-only",
    ],
    note: "Default model mockbrain/mock-1 — the local seeded virtual provider: no network, byte-identical answers for the same question, sources, and seed. Deny exits 3; a prompt policy pauses with a durable gate for vae resume.",
  },
  {
    name: "vae center",
    purpose: "The operator cockpit, read-only: one measured core folds this workspace into an honest operations snapshot.",
    synopsis: "vae center",
    flags: [
      "Operations: runs, gateway metering rollup, referenced blobs",
      "Integrity: audit-ledger and refusal-log hash chains; release readiness digest when this workspace is a repository checkout",
    ],
    note: "Exit 0 when journals, both chains, and every blob verify; exit 5 with the failing section otherwise.",
  },
] as const;

const EXIT_CODES = [
  { code: "0", meaning: "ok" },
  { code: "1", meaning: "internal error (an engine bug or an unmapped failure)" },
  { code: "2", meaning: "usage error (bad invocation, unknown command, unknown template)" },
  { code: "3", meaning: "broker-denied (a policy deny, a refused gate answer)" },
  { code: "4", meaning: "provider-down (gateway transport failures)" },
  { code: "5", meaning: "partial — completed with findings; the output carries repair hints" },
] as const;

const ECODE_RANGES = [
  { range: "1xxx", area: "journal & persistence" },
  { range: "11xx", area: "event spine" },
  { range: "12xx", area: "configuration" },
  { range: "13xx", area: "permission broker" },
  { range: "14xx", area: "research" },
  { range: "15xx", area: "runtime/restore" },
  { range: "16xx", area: "surface/usage" },
  { range: "17xx", area: "model gateway" },
  { range: "18xx", area: "agents, workflow, evals" },
  { range: "19xx", area: "internal invariants (always engine bugs)" },
  { range: "20xx", area: "local API daemon" },
  { range: "21xx", area: "extension host" },
  { range: "22xx", area: "reproducible bundles" },
  { range: "23xx", area: "CI surface" },
] as const;

const COMPLETIONS: { shell: string; verified: boolean }[] = FACTS.cli.shells.map((s) => ({
  shell: s,
  verified: s === "bash",
}));

export default function CliPage() {
  return (
    <>
      <PageHero
        eyebrow="Docs · CLI"
        title={`vae — ${FACTS.cli.commands.length} commands, one contract.`}
        lead="Help always teaches and never executes; --json switches every command to stable NDJSON; exit codes are honest. This reference mirrors the COMMAND_HELP registry — the one source of truth for the command surface."
      >
        <DocsNav route="/docs/cli" />
      </PageHero>

      {/* ─────────── conventions ─────────── */}
      <Section tight label="Conventions" title="The guarantees every command carries.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Panel className="p-6">
            <h3 className="text-sm font-semibold text-body">Help-first and machine mode</h3>
            <div className="mt-4">
              <Bullets
                items={[
                  "--help (or -h) is parsed before any side effect — before config, workspace, or filesystem access. Help always teaches, never executes.",
                  "--json switches every command to stable NDJSON — the byte-stable machine mode the SDK and tests consume.",
                  "--dry-run is threaded into every mutating command: it prints the plan and writes nothing.",
                  "Exit codes are honest (0–5).",
                ]}
              />
            </div>
          </Panel>
          <Panel className="p-6">
            <h3 className="text-sm font-semibold text-body">Global flags</h3>
            <div className="mt-4">
              <Bullets
                items={[
                  "--json — stable NDJSON output (machine mode, guaranteed)",
                  "--plain — human-readable output (default)",
                  "--dry-run — zero side effects: plan only, nothing written",
                  "--cwd DIR — operate on DIR as the workspace (default: .)",
                  "--help, -h — help for the topic, exit 0, never executes",
                ]}
              />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-mutedfg">
              There is no --version global flag; the version is printed by the welcome banner and <code className="font-mono">vae dev</code>.
            </p>
          </Panel>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-edge">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Output profiles</caption>
            <thead>
              <tr className="bg-surface-2/60">
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">Profile</th>
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">When</th>
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">Behavior</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["json", "--json passed", "Stable NDJSON; never painted, never decorated"],
                ["plain", "default when stdout is not a TTY", "Byte-stable text, zero ANSI — the pipe/CI contract"],
                ["rich", "stdout is an interactive TTY", "Unicode panels, truecolor, badges — decoration only in a real terminal"],
              ].map(([p, when, behavior]) => (
                <tr key={p} className="border-t border-edge bg-surface">
                  <th scope="row" className="px-4 py-3 font-mono text-[12px] font-semibold text-gold">{p}</th>
                  <td className="px-4 py-3 text-mutedfg">{when}</td>
                  <td className="px-4 py-3 text-mutedfg">{behavior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-mutedfg">
          The rich profile is suppressed when <code className="font-mono">NO_COLOR</code> is set, <code className="font-mono">TERM=dumb</code>,{" "}
          <code className="font-mono">CI</code> is set, or stdout is not a TTY. Explicit beats ambient:{" "}
          <code className="font-mono">VAE_UI=rich</code> forces rich rendering even through pipes (intended for evidence capture);{" "}
          <code className="font-mono">VAE_UI=plain</code> forces plain. Render width clamps to 56–120 columns.
        </p>
      </Section>

      {/* ─────────── command reference ─────────── */}
      <Section label="Command reference" title="Every command, its purpose, and its real flags.">
        <Accordion type="single" collapsible className="rounded-2xl border border-edge bg-surface px-5">
          {COMMANDS.map((c) => (
            <AccordionItem key={c.name} value={c.name}>
              <AccordionTrigger className="min-h-[44px] py-4 text-left hover:no-underline">
                <span className="font-mono text-sm font-semibold text-gold">{c.name}</span>
                <span className="hidden text-sm text-mutedfg sm:ml-4 sm:inline sm:flex-1">{c.purpose}</span>
              </AccordionTrigger>
              <AccordionContent className="border-t border-edge/60 pt-4">
                <CodeBlock code={c.synopsis} title="synopsis" />
                {c.flags.length > 0 ? (
                  <div className="mt-4">
                    <Bullets items={c.flags} />
                  </div>
                ) : null}
                {c.note ? (
                  <p className="mt-4 border-l-2 border-gold/40 pl-4 text-sm leading-relaxed text-mutedfg">{c.note}</p>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {/* ─────────── exit codes ─────────── */}
      <Section tight label="Exit codes" title="Honest exit codes are law.">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-edge">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">CLI exit codes</caption>
              <thead>
                <tr className="bg-surface-2/60">
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">Code</th>
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {EXIT_CODES.map((e) => (
                  <tr key={e.code} className="border-t border-edge bg-surface">
                    <th scope="row" className="px-4 py-3 font-mono text-sm font-semibold text-gold">{e.code}</th>
                    <td className="px-4 py-3 text-mutedfg">{e.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Panel className="p-6">
            <h3 className="text-sm font-semibold text-body">How E-codes map to exits</h3>
            <div className="mt-4">
              <Bullets
                items={[
                  "exit 2 — E1600 (unknown command/usage), E1203 (unknown template), E1700, E1701, E2204, E2300",
                  "exit 3 — E1300, E1301, E1302 (the permission-broker deny family)",
                  "exit 4 — E1601, E1702, E1704, E1705, E1706 (the gateway/provider-down family)",
                  "exit 5 — E1703 (budget), E2200–E2203, E2205, E2206 (bundle/refusal findings), all E23xx (CI surface findings)",
                  "exit 1 — everything else",
                ]}
              />
            </div>
          </Panel>
        </div>
      </Section>

      {/* ─────────── E-codes ─────────── */}
      <Section tight label="Error codes" title={`${FACTS.contracts.ecodes} stable E-codes, additive-only.`}>
        <p className="-mt-4 max-w-3xl text-sm leading-relaxed text-mutedfg">
          The catalog of record is <code className="font-mono text-gold">spec/errors.yaml</code>; within v1 codes are never reused and never
          remapped. Every entry carries a stable name, a summary, and a fix hint; the CLI renders errors with their{" "}
          <code className="font-mono">Fix:</code> and a <code className="font-mono">Docs:</code> anchor. The common ones are mapped in{" "}
          <a href="#/docs/troubleshooting" className="text-gold underline-offset-4 hover:underline">Troubleshooting</a>.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ECODE_RANGES.map((r) => (
            <div key={r.range} className="flex items-baseline gap-3 rounded-xl border border-edge bg-surface px-4 py-2.5">
              <span className="font-mono text-xs font-semibold text-gold">{r.range}</span>
              <span className="text-xs text-mutedfg">{r.area}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ─────────── completions ─────────── */}
      <Section tight label="Completions" title="Six shells, generated from one completion model.">
        <div className="flex flex-wrap gap-2">
          {COMPLETIONS.map((c) =>
            c.verified ? (
              <Pill key={c.shell} tone="trust">
                {c.shell} — VERIFIED (bash -n)
              </Pill>
            ) : (
              <Honesty key={c.shell}>{c.shell} — UNVERIFIED</Honesty>
            ),
          )}
        </div>
        <div className="mt-5">
          <CodeBlock code={`vae completions <bash|zsh|fish|powershell|nushell|xonsh>`} title="shell completions" />
        </div>
        <div className="mt-5">
          <Callout kind="honesty" title="The honesty marker, applied">
            All six generators render from the one completion model pinned against the command registry. bash is bash -n-measured on the
            generating host; the other five carry UNVERIFIED markers until their hosts run them.
          </Callout>
        </div>
      </Section>

      {/* ─────────── environment ─────────── */}
      <Section tight label="Environment" title="Variables the CLI recognizes.">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            ["VAE_UI", "Force the render profile: rich or plain (overrides TTY detection)"],
            ["VAE_TRUST", "Pre-provision the daemon pairing token for headless vae serve starts (the token is then never printed)"],
            ["NO_COLOR", "Disable color (rich profile suppressed)"],
            ["TERM=dumb", "Degrade to plain text"],
            ["CI", "Degrade to plain text (non-interactive contract)"],
          ].map(([name, effect]) => (
            <div key={name} className="rounded-xl border border-edge bg-surface px-4 py-3">
              <p className="font-mono text-xs font-semibold text-gold">{name}</p>
              <p className="mt-1 text-xs leading-relaxed text-mutedfg">{effect}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
