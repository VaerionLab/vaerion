"use client";

import { FACTS } from "../facts";
import { PageHero, Section, Panel, Callout, CodeBlock, Bullets, ArrowLink } from "../primitives";
import DocsNav from "../DocsNav";

/* Distilled from docs/TROUBLESHOOTING.md (exit codes + E-codes),
   docs/CLI.md (output profiles), examples/vaerion-demo/DEMO.md (paths). */

const EXIT_CODES: [string, string, string][] = [
  ["0", "ok", "—"],
  ["1", "internal error", "The output names the site; if reproducible, file a report with the journal snippet."],
  ["2", "usage error", "Re-run with --help (help teaches and never executes)."],
  ["3", "broker-denied", "A permission rule denied the capability — see E1300."],
  ["4", "provider-down", "The gateway could not reach a provider — see E1601/E1705/E1706."],
  ["5", "partial success with a repair hint", "Follow the printed repair hint, then re-run the failed part."],
];

const ECODES: { group: string; items: [string, string, string][] }[] = [
  {
    group: "Workspace and config",
    items: [
      ["E1200", "config_missing — no vaerion.yaml here", "vae init, or cd into a workspace. Running outside a workspace uses an ad-hoc in-memory config; it is announced, and journalling stays local."],
      ["E1201", "config_unknown_key — a key outside the strict schema", "Remove it; the engine rejects drift rather than guessing intent."],
      ["E1202", "config_schema_invalid — the YAML violates the v0.1 schema", "The accepted shape is spec/schemas/vaerion-yaml.schema.json; schemaVersion: \"0.1\" is required."],
      ["E1203", "init_template_unknown — a template not in the registry", "Pick from the list in the error; bare vae init is exactly --template minimal."],
    ],
  },
  {
    group: "Journals and runs",
    items: [
      ["E1000", "journal_lock_held — another writer holds the journal", "Wait, or after confirming no writer is alive: vae journal recover <run>."],
      ["E1001 / E1002", "journal_chain_broken / journal_torn_tail — the blake3 chain is broken or the tail is torn (crash mid-write)", "vae journal recover <run> — truncates the torn tail, re-seals the chain. Never hand-edit records."],
      ["E1302", "gate_pending — a durable human gate is waiting for you", "vae resume <run> --answer '{...}'"],
      ["E1502", "run_not_found", "List runs with vae journal ls."],
    ],
  },
  {
    group: "Permission broker (exit 3)",
    items: [
      ["E1300", "broker_denied — the first matching policy rule denied the capability", "Inspect the recorded decision with vae explain <trace>, then request the narrowest grant you need in vaerion.yaml (policy.rules — each rule must state its rationale)."],
      ["E1301", "broker_fail_closed — the broker could not evaluate the request and refused", "Un-evaluable requests are never allowed by law; resolve the underlying error."],
    ],
  },
  {
    group: "Model gateway (exit 4)",
    items: [
      ["E1601 / E1706", "provider unreachable / transport refused", "Check connectivity; vae doctor reports the capability matrix and breaker state."],
      ["E1703", "gateway_budget_exceeded — the run hit its declared token or micro-USD ceiling", "Raise gateway.budgets deliberately."],
      ["E1704", "gateway_secret_unresolved — a declared secret resolved to nothing", "Store it in the OS keychain (service vae, account = secret name) or export it as an environment variable. Names live in config; values never do."],
      ["E1705", "gateway_breaker_open — repeated failures opened the circuit breaker", "Wait out the cooldown; investigate the journaled failures."],
    ],
  },
  {
    group: "Extensions",
    items: [
      ["E2100", "extension_artifact_digest_mismatch — the sha256 did not match its pin; it was NOT executed", "Fix the artifact or the pin; never disable the pin."],
      ["E2101", "extension_not_declared", "Declare the extension in vaerion.yaml (extensions)."],
      ["E2102 / E2103", "protocol violation or timeout — the host killed the child", "The lifecycle is journaled (extension.spawned / extension.exited)."],
    ],
  },
  {
    group: "Reproducible bundles",
    items: [
      ["E2200 / E2203", "not a valid .vxn (bad magic/canonical form) or an unsupported format version", "Do not repair bundles by hand; rebuild."],
      ["E2201 / E2202", "digest or pin mismatch — the bundle does not match its config/lock", "Rebuild from trusted inputs."],
      ["E2204", "vxn_input_missing — a declared input path is missing or illegal", "Absolute paths and globs are refused by law; use project-relative paths."],
      ["E2205", "vxn_lock_mismatch — the bundle is older than the current seal", "Re-run vae package build to regenerate vaerion.lock."],
      ["E2206", "vxn_verify_failed — verify found failures", "The per-check findings report says exactly which."],
    ],
  },
];

const PATHS: [string, string][] = [
  [".vaerion/journal/*.ndjson", "append-only event journals (blake3-chained)"],
  [".vaerion/blobs/", "the content-addressed store"],
  [".vaerion/receipts/", "receipts folded from the journals"],
  [".vaerion/package/*.vxn", "reproducible bundles"],
  [".vaerion/exports/", "redacted journal exports"],
  ["vaerion.lock", "the generated seal over config + pins + bundle digest"],
];

export default function TroubleshootingPage() {
  return (
    <>
      <PageHero
        eyebrow="Docs · Troubleshooting"
        title="The engine communicates through two stable channels: exit codes and E-codes."
        lead="When something goes wrong, the output names the E-code and a repair hint — what failed, why, the fix, the doc. This page maps the common ones."
      >
        <DocsNav route="/docs/troubleshooting" />
      </PageHero>

      <Section tight label="Exit codes" title="Zero through five, and what to do.">
        <div className="overflow-hidden rounded-2xl border border-edge">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">CLI exit codes and what to do</caption>
            <thead>
              <tr className="bg-surface-2/60">
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">Code</th>
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">Meaning</th>
                <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-mutedfg">What to do</th>
              </tr>
            </thead>
            <tbody>
              {EXIT_CODES.map(([code, meaning, action]) => (
                <tr key={code} className="border-t border-edge bg-surface">
                  <th scope="row" className="px-4 py-3 align-top font-mono text-sm font-semibold text-gold">{code}</th>
                  <td className="px-4 py-3 align-top text-body">{meaning}</td>
                  <td className="px-4 py-3 align-top text-mutedfg">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-mutedfg">
          The full catalog of record is <code className="font-mono text-gold">spec/errors.yaml</code> — {FACTS.contracts.ecodes} stable codes,
          additive-only within v1: never reused, never remapped.
        </p>
      </Section>

      <Section tight label="E-codes" title="The common ones, with their fixes.">
        <div className="space-y-8">
          {ECODES.map((g) => (
            <div key={g.group}>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-gold">{g.group}</h3>
              <div className="mt-3 space-y-2">
                {g.items.map(([code, meaning, fix]) => (
                  <div key={code} className="rounded-xl border border-edge bg-surface p-4">
                    <p className="font-mono text-xs font-semibold text-gold">{code}</p>
                    <p className="mt-1 text-sm text-body">{meaning}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-mutedfg">
                      <span className="font-semibold text-warnx">Fix:</span> {fix}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tight label="Journal recovery" title="A torn tail is the only thing recovery touches.">
        <CodeBlock code={`vae journal recover <RUN_ID>          # add --dry-run to see the plan first`} title="journal recovery" />
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-mutedfg">
          <code className="font-mono text-gold">vae journal recover</code> truncates <strong className="text-body">only</strong> a torn crash
          tail and re-seals the chain with an auditable note. It never rewrites history: records are never hand-edited, and the recovery itself
          is recorded. If the chain is broken beyond a torn tail, the output says so instead of guessing.
        </p>
      </Section>

      <Section tight label="Environment" title="Output modes and platform notes.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Panel className="p-6">
            <h3 className="text-sm font-semibold text-body">Color and rendering</h3>
            <div className="mt-4">
              <Bullets
                items={[
                  "NO_COLOR (set) — disables color; the rich profile is suppressed.",
                  "TERM=dumb or CI (set) — degrade to plain text; the non-interactive contract.",
                  "VAE_UI=plain — force byte-stable plain text; VAE_UI=rich — force rich rendering, including through pipes (intended for evidence capture).",
                  "Piped output is byte-free of ANSI by construction — pinned by tests.",
                ]}
              />
            </div>
          </Panel>
          <Panel className="p-6">
            <h3 className="text-sm font-semibold text-body">Platforms and runtime</h3>
            <div className="mt-4">
              <Bullets
                items={[
                  "Windows: use WSL2; the daemon binds loopback inside the WSL VM.",
                  "Keychain: on Linux without a secret service, the env-indirection port is the fallback (E1704 explains the resolution order).",
                  "Bun: 1.3+ required; bun run tools/verify.ts is the first thing to run after any environment change.",
                ]}
              />
            </div>
          </Panel>
        </div>
      </Section>

      <Section tight label="Where things land" title="Your evidence, on disk — all of it workspace-local.">
        <div className="overflow-hidden rounded-2xl border border-edge">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Workspace paths and their meaning</caption>
            <tbody>
              {PATHS.map(([p, meaning]) => (
                <tr key={p} className="border-t border-edge bg-surface first:border-t-0">
                  <th scope="row" className="px-4 py-3 align-top font-mono text-[12px] font-semibold text-gold">{p}</th>
                  <td className="px-4 py-3 text-mutedfg">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tight label="Getting help" title="What to include in every report.">
        <Callout kind="info" title="The evidence bundle">
          The exact command, the full output (it embeds the E-code and the repair hint), and <code className="font-mono">vae doctor</code>{" "}
          output. Security findings go privately to the project owner — never as a public issue.
        </Callout>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          <ArrowLink href={FACTS.issuesUrl} external>
            Open an issue
          </ArrowLink>
          <ArrowLink href="#/docs/faq">FAQ</ArrowLink>
          <ArrowLink href="#/community">Community and support paths</ArrowLink>
        </div>
      </Section>
    </>
  );
}
