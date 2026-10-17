/**
 * Vaerion — the init template registry (ASCENSION XVIII Phase 5; constitution
 * v1.3 A3, D-M′ template face; P2 determinism, L0 config-adjacent).
 *
 * Law: there is exactly ONE source of scaffold intent. Every template is a
 * static, byte-stable document parameterized ONLY by the project name; no
 * wall-clock, no ambient state, no computed content. Bare `vae init` is
 * EXACTLY `--template minimal` — the pre-A3 default bytes, preserved. Every
 * rendered template must validate against the strict schema-0.1 config law
 * (unknown keys are rejected by law), and every template sets
 * `telemetry.enabled: false` — zero telemetry is structural (P10).
 *
 * This module is the single source of truth for the template surface; the
 * CLI porcelain only resolves names and renders bytes.
 */

import { VaerionError } from "../kernel/errors.ts";

export interface InitTemplate {
  /** Registry name (`^[a-z][a-z0-9-]{0,62}$`), the `--template` value. */
  readonly name: string;
  /** One honest sentence: what this scaffold is for. */
  readonly description: string;
  /** The byte-stable body; the single `{{NAME}}` token receives the project name. */
  readonly body: string;
}

const minimalTemplate: string = `# Vaerion project configuration (schema 0.1)
# Unknown keys are rejected by law — see spec/schemas/vaerion-yaml.schema.json
schemaVersion: "0.1"
project:
  name: {{NAME}}
  description: "Vaerion project"
research:
  capabilities:
    - name: project-docs
      sources:
        - { kind: local, path: "./docs" }
      fencing: untrusted
      maxItems: 100
# Broker policy rules (MS-2) — first match wins; unmatched requests deny fail-closed.
# Every rule must state its rationale:
# policy:
#   rules:
#     - id: deny-secret-read
#       principalKinds: [agent]
#       domain: secret.read
#       scope: "*"
#       effect: deny
#       rationale: "agents never read secrets; humans use the keychain directly"
telemetry:
  enabled: false
`;

const demoTemplate: string = `# Vaerion demo workspace (schema 0.1) — ready for 'vae run demo'
# Unknown keys are rejected by law — see spec/schemas/vaerion-yaml.schema.json
schemaVersion: "0.1"
project:
  name: {{NAME}}
  description: "A Vaerion demo workspace: a scaffolded local source, journaled research runs"
research:
  capabilities:
    - name: sources
      sources:
        - { kind: local, path: "./sources" }
      fencing: untrusted
      maxItems: 32
# Try: vae run demo --query "event spine journal deterministic"
#      (no --sources needed: the run derives its paths from the declared
#       capabilities above — the workspace config is the only authority)
# Or be explicit: vae run demo --sources ./sources --query "..."
telemetry:
  enabled: false
`;

/**
 * The scaffold files a template installs BESIDES its vaerion.yaml (D-B: the
 * registry of record is the only authority on what a template creates — the
 * declared capabilities and the scaffolded files can never disagree, because
 * both derive from this registry; XX-D6: the demo journey must work as
 * taught on an empty machine, D-Y).
 */
export const TEMPLATE_SCAFFOLD_FILES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  minimal: {
    "docs/overview.md": [
      "# Project overview",
      "",
      "This workspace is governed by Vaerion: vaerion.yaml declares the intent,",
      ".vaerion/ keeps the journals, and every run closes with a receipt.",
      "",
      "Docs under ./docs feed the research pipeline (declared in vaerion.yaml).",
      "Replace this overview with the real thing — the journal keeps the evidence.",
      "",
    ].join("\n"),
  },
  agent: {
    "docs/overview.md": [
      "# Agent workspace overview",
      "",
      "This workspace runs the supervised agent loop: a planner, declared tools,",
      "fail-closed grants. Every step (model, tool, note) crosses its",
      "constitutional path and lands on the journal; the run closes with a receipt.",
      "",
      "First run (declared plan — inline planning is deterministic):",
      "",
      "  vae run agent --goal \"your goal\" --planner inline --plan-json '[{\"kind\":\"note\",\"text\":\"do the thing\"}]'",
      "",
      "Then:  vae verify",
      "",
    ].join("\n"),
  },
  demo: {
    "sources/demo.md": [
      "# Demo source",
      "",
      "The journal is an append-only hash chain: every record carries the blake3",
      "hash of its predecessor, so verification is deterministic and replay is",
      "faithful. Damaged tails are recovered; corrupted chains are refused.",
      "",
      "Every run closes with a receipt — evidence, not branding.",
      "",
    ].join("\n"),
  },
  tool: {
    "docs/overview.md": [
      "# Tool-agent workspace overview",
      "",
      "This workspace runs the supervised agent loop with a declared tool belt",
      "(echo, clock.read). Every tool call crosses the broker (fail-closed),",
      "lands on the journal, and the run closes with a receipt.",
      "",
      "First run:  vae run agent --goal \"summarize this project\" --planner inline --plan-json '[{\"kind\":\"tool\",\"tool\":\"echo\",\"args\":{\"value\":\"hello from the tool belt\"}},{\"kind\":\"tool\",\"tool\":\"clock.read\",\"args\":{}}]'",
      "Then:       vae verify   (or vae journal verify <RUN_ID>)",
      "",
    ].join("\n"),
  },
  automation: {
    "workflow.json": [
      "{",
      "  \"id\": \"automation-flow\",",
      "  \"nodes\": [",
      "    { \"id\": \"prepare\", \"deps\": [], \"step\": { \"kind\": \"tool\", \"tool\": \"echo\", \"args\": { \"value\": \"automation step one (journaled)\" } } },",
      "    { \"id\": \"timestamp\", \"deps\": [\"prepare\"], \"step\": { \"kind\": \"tool\", \"tool\": \"clock.read\", \"args\": {} } },",
      "    { \"id\": \"finish\", \"deps\": [\"timestamp\"], \"step\": { \"kind\": \"note\", \"text\": \"automation-flow complete\" } }",
      "  ]",
      "}",
      "",
    ].join("\n"),
    "docs/overview.md": [
      "# Automation workspace overview",
      "",
      "Deterministic tool DAGs — no model calls, no network, no keys. Every node",
      "crosses the broker, lands on the journal, and the run closes with a",
      "receipt folded from the chain.",
      "",
      "First run:  vae run workflow --dag workflow.json",
      "Then:       vae verify",
      "",
    ].join("\n"),
  },
  "multi-agent": {
    "workflow.json": [
      "{",
      "  \"id\": \"crew-flow\",",
      "  \"nodes\": [",
      "    { \"id\": \"researcher\", \"deps\": [], \"step\": { \"kind\": \"tool\", \"tool\": \"echo\", \"args\": { \"value\": \"collect the brief (replace with your own tool steps)\" } } },",
      "    { \"id\": \"analyst\", \"deps\": [\"researcher\"], \"step\": { \"kind\": \"model\", \"model\": \"mockbrain/mock-1\", \"messages\": [{ \"role\": \"user\", \"content\": \"Reply with exactly: crew ok\" }] } },",
      "    { \"id\": \"auditor\", \"deps\": [\"analyst\"], \"step\": { \"kind\": \"tool\", \"tool\": \"clock.read\", \"args\": {} } },",
      "    { \"id\": \"signoff\", \"deps\": [\"auditor\"], \"step\": { \"kind\": \"note\", \"text\": \"crew-flow complete\" } }",
      "  ]",
      "}",
      "",
    ].join("\n"),
    "docs/overview.md": [
      "# Multi-agent workspace overview",
      "",
      "A researcher → analyst → auditor crew as ONE journaled DAG: tool steps",
      "and a model step, each broker-checked, each on the blake3 chain, the",
      "run closed by a receipt. Interrupted? Resume with:",
      "",
      "  vae run workflow --dag workflow.json --resume RUN_ID",
      "",
      "First run:  vae run workflow --dag workflow.json",
      "Then:       vae verify",
      "",
    ].join("\n"),
  },
  enterprise: {
    "workflow.json": [
      "{",
      "  \"id\": \"governance-flow\",",
      "  \"nodes\": [",
      "    { \"id\": \"brief\", \"deps\": [], \"step\": { \"kind\": \"tool\", \"tool\": \"echo\", \"args\": { \"value\": \"collect the governed brief (replace with your own tool steps)\" } } },",
      "    { \"id\": \"attest\", \"deps\": [\"brief\"], \"step\": { \"kind\": \"tool\", \"tool\": \"clock.read\", \"args\": {} } },",
      "    { \"id\": \"record\", \"deps\": [\"attest\"], \"step\": { \"kind\": \"note\", \"text\": \"governance-flow complete — evidence sealed on the journal\" } }",
      "  ]",
      "}",
      "",
    ].join("\n"),
    "docs/overview.md": [
      "# Enterprise workspace overview — governance in three moves",
      "",
      "This workspace is governed by a deny-by-default policy: every rule in",
      "vaerion.yaml states WHO may do WHAT over WHICH scope and WHY (its",
      "rationale). Anything no rule matches is refused fail-closed (E1301) —",
      "there is no allow-by-default to configure away.",
      "",
      "1. POLICY FIRST — read the `policy.rules` block in vaerion.yaml before",
      "   running anything. The scaffold grants the human the budgeted planner",
      "   model, grants agents exactly the two declared tools the DAG uses, and",
      "   denies agents secret reads outright. Change the law there, deliberately.",
      "2. RUN SECOND — `vae run workflow --dag workflow.json`: every node crosses",
      "   the broker (decision → journal → act), lands on the blake3 chain.",
      "   A request the policy refuses is journaled as evidence, never silent.",
      "3. VERIFY THIRD — `vae verify` recomputes the entire chain from the bytes",
      "   on disk and proves the receipt's head-hash commitment still holds.",
      "",
      "THE RECEIPT — every run closes with one: counts, blob refs, and the",
      "journal head hash. It is evidence, not branding: the fold over the exact",
      "records that were journaled, verifiable by anyone with the directory.",
      "",
      "Governance vocabulary: `vae doctor` audits config, journals, blobs, and",
      "both integrity chains; the refusal log records what the broker refused;",
      "`vae explain <RUN_ID>` reconstructs a run's decisions from its journal.",
      "",
    ].join("\n"),
    "README.md": [
      "# Governance-first Vaerion workspace",
      "",
      "This scaffold ships with its law already written: `vaerion.yaml` carries",
      "a deny-by-default `policy.rules` block where every grant states its",
      "rationale. The order of operations is always the same:",
      "",
      "1. **Policy first** — read (and if needed, amend) `policy.rules` in",
      "   `vaerion.yaml`. Unmatched requests are refused fail-closed (E1301);",
      "   enabling a provider is a ceiling, not a grant.",
      "2. **Run second** —",
      "",
      "   ```sh",
      "   vae run workflow --dag workflow.json",
      "   ```",
      "",
      "   Every node crosses the broker and lands on the journal.",
      "3. **Verify third** —",
      "",
      "   ```sh",
      "   vae verify",
      "   ```",
      "",
      "   Full chain recomputation; exit 0 only when the evidence holds.",
      "",
      "**The receipt**: each run closes with a receipt folded from its journal —",
      "counts, blob refs, and the `journal.head_hash` commitment. Anyone with",
      "this directory can recompute it; that is the point.",
      "",
      "Housekeeping: `vae doctor` audits the workspace end-to-end; the refusal",
      "log and audit ledger are hash-chained like the journals — never edit them.",
      "",
    ].join("\n"),
  },
};

const agentTemplate: string = `# Vaerion agent workspace (schema 0.1) — the supervised agent loop, wired
# Unknown keys are rejected by law — see spec/schemas/vaerion-yaml.schema.json
schemaVersion: "0.1"
project:
  name: {{NAME}}
  description: "A Vaerion agent workspace: declared tools, a planner model, fail-closed grants"
research:
  capabilities:
    - name: project-docs
      sources:
        - { kind: local, path: "./docs" }
      fencing: untrusted
      maxItems: 100
gateway:
  providers:
    mockbrain:
      enabled: true
      models:
        - mock-1
  budgets:
    tokensPerRun: 100000
agents:
  maxSteps: 24
  plannerModel: mockbrain/mock-1
tools:
  - name: echo
    description: "Echoes its input back (the hermetic builtin)"
policy:
  rules:
    - id: agent-inline-planning
      principalKinds: [agent]
      domain: model.invoke
      scope: "mockbrain/mock-1"
      effect: allow
      rationale: "the declared planner model is the only model agents may invoke"
telemetry:
  enabled: false
`;

const toolTemplate: string = `# Vaerion tool-agent workspace (schema 0.1) — the supervised agent loop with a
# real tool belt: echo + clock.read, every call broker-checked and journaled
# Unknown keys are rejected by law — see spec/schemas/vaerion-yaml.schema.json
schemaVersion: "0.1"
project:
  name: {{NAME}}
  description: "A Vaerion tool-agent workspace: declared tool belt, planner model, fail-closed grants"
research:
  capabilities:
    - name: project-docs
      sources:
        - { kind: local, path: "./docs" }
      fencing: untrusted
      maxItems: 100
gateway:
  providers:
    mockbrain:
      enabled: true
      models:
        - mock-1
  budgets:
    tokensPerRun: 100000
agents:
  maxSteps: 24
  plannerModel: mockbrain/mock-1
tools:
  - name: echo
    description: "Echoes its input back (the hermetic builtin)"
  - name: clock.read
    description: "Reads the injected engine clock (deterministic under FixedClock)"
policy:
  rules:
    - id: agent-inline-planning
      principalKinds: [agent]
      domain: model.invoke
      scope: "mockbrain/mock-1"
      effect: allow
      rationale: "the declared planner model is the only model agents may invoke"
    - id: agent-echo-tool
      principalKinds: [agent]
      domain: tool.call
      scope: echo
      effect: allow
      rationale: "the declared echo builtin is agent-callable; everything else denies"
    - id: agent-clock-read
      principalKinds: [agent]
      domain: tool.call
      scope: clock.read
      effect: allow
      rationale: "agents may read the injected clock; writes deny fail-closed"
telemetry:
  enabled: false
`;

const automationTemplate: string = `# Vaerion automation workspace (schema 0.1) — deterministic tool DAGs, zero model calls
# Unknown keys are rejected by law — see spec/schemas/vaerion-yaml.schema.json
schemaVersion: "0.1"
project:
  name: {{NAME}}
  description: "A Vaerion automation workspace: journaled tool DAGs, deterministic, model-free"
research:
  capabilities:
    - name: project-docs
      sources:
        - { kind: local, path: "./docs" }
      fencing: untrusted
      maxItems: 100
tools:
  - name: echo
    description: "Echoes its input back (the hermetic builtin)"
  - name: clock.read
    description: "Reads the injected engine clock (deterministic under FixedClock)"
policy:
  rules:
    - id: automation-echo-tool
      principalKinds: [agent]
      domain: tool.call
      scope: echo
      effect: allow
      rationale: "the automation DAG's echo steps are its only tool writes"
    - id: automation-clock-read
      principalKinds: [agent]
      domain: tool.call
      scope: clock.read
      effect: allow
      rationale: "the automation DAG timestamps its summary with the injected clock"
# Try: vae run workflow --dag workflow.json
# Every node crosses the broker, lands on the journal, and the run closes with
# a receipt folded from the chain — automation with evidence, not vibes.
telemetry:
  enabled: false
`;

const multiAgentTemplate: string = `# Vaerion multi-agent workspace (schema 0.1) — a researcher → analyst → auditor
# crew as ONE journaled DAG: tool steps, a model step, and a human-readable note
# Unknown keys are rejected by law — see spec/schemas/vaerion-yaml.schema.json
schemaVersion: "0.1"
project:
  name: {{NAME}}
  description: "A Vaerion multi-agent workspace: a crew pipeline on the journal, fail-closed grants"
research:
  capabilities:
    - name: project-docs
      sources:
        - { kind: local, path: "./docs" }
      fencing: untrusted
      maxItems: 100
gateway:
  providers:
    mockbrain:
      enabled: true
      models:
        - mock-1
  budgets:
    tokensPerRun: 100000
tools:
  - name: echo
    description: "Echoes its input back (the hermetic builtin)"
  - name: clock.read
    description: "Reads the injected engine clock (deterministic under FixedClock)"
policy:
  rules:
    - id: crew-model-step
      principalKinds: [agent]
      domain: model.invoke
      scope: "mockbrain/mock-1"
      effect: allow
      rationale: "the analyst node runs the declared hermetic planner model"
    - id: crew-echo-tool
      principalKinds: [agent]
      domain: tool.call
      scope: echo
      effect: allow
      rationale: "the researcher node uses the declared echo builtin"
    - id: crew-clock-read
      principalKinds: [agent]
      domain: tool.call
      scope: clock.read
      effect: allow
      rationale: "the auditor node stamps completion time from the injected clock"
# Try: vae run workflow --dag workflow.json
# Nodes run in topological order on the journal; outputs are content-addressed;
# an interrupted run resumes with --resume RUN_ID.
telemetry:
  enabled: false
`;

const enterpriseTemplate: string = `# Vaerion enterprise workspace (schema 0.1) — governance first: explicit
# grants with rationales, deny-by-default policy, budgeted model ceilings,
# every run journaled and receipted
# Unknown keys are rejected by law — see spec/schemas/vaerion-yaml.schema.json
schemaVersion: "0.1"
project:
  name: {{NAME}}
  description: "A Vaerion enterprise workspace: deny-by-default policy, explicit grants, auditable evidence"
research:
  capabilities:
    - name: project-docs
      sources:
        - { kind: local, path: "./docs" }
      fencing: untrusted
      maxItems: 100
gateway:
  providers:
    mockbrain:
      enabled: true
      models:
        - mock-1
  budgets:
    tokensPerRun: 100000
    microUsdPerRun: 5000000
agents:
  maxSteps: 24
  plannerModel: mockbrain/mock-1
tools:
  - name: echo
    description: "Echoes its input back (the hermetic builtin)"
  - name: clock.read
    description: "Reads the injected engine clock (deterministic under FixedClock)"
policy:
  rules:
    - id: gov-human-model-invoke
      principalKinds: [human]
      domain: model.invoke
      scope: "mockbrain/mock-1"
      effect: allow
      rationale: "declared human authority: operators may invoke the budgeted planner model directly"
    - id: gov-agent-echo-tool
      principalKinds: [agent]
      domain: tool.call
      scope: echo
      effect: allow
      rationale: "the governance DAG's brief step uses the declared echo builtin"
    - id: gov-agent-clock-read
      principalKinds: [agent]
      domain: tool.call
      scope: clock.read
      effect: allow
      rationale: "the governance DAG stamps its attestation from the injected clock"
    - id: gov-deny-agent-secrets
      principalKinds: [agent]
      domain: secret.read
      scope: "*"
      effect: deny
      rationale: "org law: agents never read secrets; humans use the keychain directly"
# DENY-BY-DEFAULT IS STRUCTURAL: any request no rule above matches is refused
# fail-closed (E1301) — there is no allow-by-default to configure away. Note
# that enabling a provider is a CEILING, not a grant: agents get model.invoke
# only through an explicit allow rule added here (the human grant above is
# already scoped to the budgeted planner model).
# The scaffolded workflow.json, docs/overview.md and README.md teach the
# governance journey: policy first, run second, verify third, receipt explained.
# Try: vae run workflow --dag workflow.json
# Every node crosses the broker, lands on the journal, and the run closes with
# a receipt folded from the chain.
telemetry:
  enabled: false
`;

/** The registry of record. Sorted output derives from this object's keys. */
export const INIT_TEMPLATES: Readonly<Record<string, InitTemplate>> = {
  minimal: {
    name: "minimal",
    description: "the default scaffold: declared project docs, policy examples in comments",
    body: minimalTemplate,
  },
  demo: {
    name: "demo",
    description: "a demo workspace: a scaffolded ./sources capability, ready for 'vae run demo'",
    body: demoTemplate,
  },
  agent: {
    name: "agent",
    description: "an agent workspace: mockbrain planner, declared tools, explicit grants",
    body: agentTemplate,
  },
  tool: {
    name: "tool",
    description: "a tool-agent workspace: mockbrain planner + the echo/clock.read tool belt, explicit grants",
    body: toolTemplate,
  },
  automation: {
    name: "automation",
    description: "an automation workspace: deterministic tool DAGs (no model calls), ready for 'vae run workflow --dag workflow.json'",
    body: automationTemplate,
  },
  "multi-agent": {
    name: "multi-agent",
    description: "a multi-agent workspace: a researcher→analyst→auditor crew as one journaled DAG",
    body: multiAgentTemplate,
  },
  enterprise: {
    name: "enterprise",
    description: "an enterprise workspace: deny-by-default policy with explicit grants, budgeted model ceilings, a governance DAG",
    body: enterpriseTemplate,
  },
};

/** Deterministic template names (sorted). */
export function initTemplateNames(): string[] {
  return Object.keys(INIT_TEMPLATES).sort();
}

/** The default template name — bare `vae init` is exactly this template. */
export const DEFAULT_INIT_TEMPLATE = "minimal";

/** The project-name law of record (create/init/start prompts share it — one
 *  rule, every surface that names a workspace). Throws E1600 when invalid. */
export function assertValidProjectName(name: string): void {
  if (!/^[a-z][a-z0-9-]{1,62}$/.test(name)) {
    throw new VaerionError("E1600", `invalid project name "${name}" (must match ^[a-z][a-z0-9-]{1,62}$)`, { name });
  }
}

/** Render a template deterministically: the ONLY parameter is the name. */
export function renderInitTemplate(templateName: string, projectName: string): string {
  const template = INIT_TEMPLATES[templateName];
  if (template === undefined) {
    throw new VaerionError(
      "E1203",
      `unknown init template "${templateName}" (available: ${initTemplateNames().join(", ")})`,
      { template: templateName, available: initTemplateNames() },
    );
  }
  assertValidProjectName(projectName);
  return template.body.replace("{{NAME}}", projectName);
}
