/**
 * The CLI porcelain for the MS-4 flagship flows (agent + workflow), driven
 * end-to-end through `runCli` exactly as a user drives them.
 *
 * Law under test: `run agent` executes the supervised loop from the COMMAND
 * SURFACE (declared plan → broker-admitted steps → journaled receipt);
 * human gates pause the CLI run and `resume --answer` continues it as the
 * SAME principal (elevation law); `run workflow` executes a DAG file
 * deterministically and closes receipted; refusals are honest (undeclared
 * tool E1801, broker denial exit 3).
 *
 * These paths were previously exercised only through the daemon registry;
 * this suite closes the gap so the CLI surface carries its own coverage.
 */

import { afterAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/cli/vae.ts";
import { ExitCode } from "../../src/cli/io.ts";
import { verifyJournal } from "../../src/journal/verify.ts";
import { listJournals } from "../../src/journal/ls.ts";

const workspaces: string[] = [];
afterAll(async () => {
  for (const ws of workspaces) await rm(ws, { recursive: true, force: true }).catch(() => undefined);
});

const AGENT_ALLOW_YAML = `schemaVersion: "0.1"
project:
  name: cli-agent
gateway:
  providers:
    mockbrain: { enabled: true, models: ["mock-1"] }
tools:
  - name: echo
agents:
  maxSteps: 12
policy:
  rules:
    - id: agent-echo-allow
      principalKinds: [agent]
      domain: tool.call
      scope: echo
      effect: allow
      rationale: "test"
    - id: agent-model-allow
      principalKinds: [agent]
      domain: model.invoke
      scope: "mockbrain/mock-1"
      effect: allow
      rationale: "test"
telemetry:
  enabled: false
`;

const AGENT_PROMPT_YAML = AGENT_ALLOW_YAML.replace(
  `    - id: agent-echo-allow
      principalKinds: [agent]
      domain: tool.call
      scope: echo
      effect: allow
      rationale: "test"
`,
  `    - id: agent-echo-prompt
      principalKinds: [agent]
      domain: tool.call
      scope: echo
      effect: prompt
      gateLabel: "Approve echo?"
      rationale: "human authority"
`,
);

const WORKFLOW_YAML = `schemaVersion: "0.1"
project:
  name: cli-workflow
tools:
  - name: echo
policy:
  rules:
    - id: agent-echo-allow
      principalKinds: [agent]
      domain: tool.call
      scope: echo
      effect: allow
      rationale: "test"
telemetry:
  enabled: false
`;

const WORKFLOW_DENY_YAML = WORKFLOW_YAML.replace("effect: allow", "effect: deny");

async function makeWorkspace(yaml: string, name: string): Promise<string> {
  const ws = await mkdtemp(join(tmpdir(), `vae-cli-aw-${name}-`));
  workspaces.push(ws);
  await writeFile(join(ws, "vaerion.yaml"), yaml, "utf8");
  await mkdir(join(ws, ".vaerion", "journal"), { recursive: true });
  await mkdir(join(ws, ".vaerion", "blobs"), { recursive: true });
  return ws;
}

async function cli(ws: string, args: string[]): Promise<{ code: number; json: Array<Record<string, unknown>>; out: string[] }> {
  const out: string[] = [];
  const { code } = await runCli(args, { out: (l) => out.push(l), err: (l) => out.push(l) }, ws);
  const json = out.filter((l) => l.trim().startsWith("{")).map((l) => JSON.parse(l) as Record<string, unknown>);
  return { code, json, out };
}

const ECHO_PLAN = JSON.stringify([
  { kind: "note", text: "cli smoke" },
  { kind: "tool", tool: "echo", args: { value: "via cli" } },
]);

describe("cli run agent — the supervised loop from the porcelain", () => {
  test("a declared plan runs, journals, and closes receipted (exit 0)", async () => {
    const ws = await makeWorkspace(AGENT_ALLOW_YAML, "allow");
    const r = await cli(ws, ["run", "agent", "--goal", "echo via cli", "--planner", "inline", "--plan-json", ECHO_PLAN, "--json"]);
    expect(r.code).toBe(ExitCode.ok);
    const result = r.json[0] as { run_id?: string; outcome?: string; steps?: number; receipt?: Record<string, unknown>; journal_verified?: boolean };
    expect(typeof result.run_id).toBe("string");
    expect(result.outcome).toBe("goal"); // the goal-reaching outcome
    expect(result.steps).toBeGreaterThan(0);
    expect(result.receipt?.summary).toContain("goal");
    expect(result.journal_verified).toBe(true);

    // The journal verifies independently.
    const runs = await listJournals(join(ws, ".vaerion", "journal"));
    expect(runs.length).toBe(1);
    const report = await verifyJournal(join(ws, ".vaerion", "journal", `${runs[0]!.run_id}.ndjson`));
    expect(report.ok).toBe(true);
  });

  test("a prompt policy pauses the CLI run; resume --answer continues it (elevation law)", async () => {
    const ws = await makeWorkspace(AGENT_PROMPT_YAML, "prompt");
    const started = await cli(ws, ["run", "agent", "--goal", "needs authority", "--planner", "inline", "--plan-json", JSON.stringify([{ kind: "tool", tool: "echo", args: { value: "authorized" } }]), "--json"]);
    expect(started.code).toBe(ExitCode.ok); // paused is not a crash
    const paused = started.json[0] as { run_id: string; awaiting: boolean; outcome: string; gate: { gate_id: string; state: string } };
    expect(paused.awaiting).toBe(true);
    expect(paused.outcome).toBe("awaiting_gate");
    expect(paused.gate.state).toBe("open");

    const resumed = await cli(ws, ["resume", paused.run_id, "--answer", JSON.stringify({ approved: true }), "--json"]);
    expect(resumed.code).toBe(ExitCode.ok);
    const done = resumed.json[0] as { run_id: string; continued: string; outcome: string; receipt: Record<string, unknown> };
    expect(done.run_id).toBe(paused.run_id);
    expect(done.continued).toBe("agent");
    expect(done.outcome).toBe("goal");
    expect(done.receipt).toBeTruthy();

    // The journal now verifies with the elevation recorded.
    const report = await verifyJournal(join(ws, ".vaerion", "journal", `${paused.run_id}.ndjson`));
    expect(report.ok).toBe(true);
  });

  test("an undeclared tool fails the run HONESTLY (outcome failed, journal verified)", async () => {
    const ws = await makeWorkspace(AGENT_ALLOW_YAML, "undeclared");
    const r = await cli(ws, ["run", "agent", "--goal", "sneak", "--planner", "inline", "--plan-json", JSON.stringify([{ kind: "tool", tool: "not-declared", args: {} }]), "--json"]);
    // The run completes; the honest outcome is "failed" with the refusal
    // journaled — the run does not lie about success and does not crash.
    expect(r.code).toBe(ExitCode.ok);
    const result = r.json[0] as { outcome: string; failures: number; journal_verified: boolean };
    expect(result.outcome).toBe("failed");
    expect(result.failures).toBe(1);
    expect(result.journal_verified).toBe(true);
  });
});

describe("cli run workflow — DAG execution from the porcelain", () => {
  const DAG = {
    id: "cli-dag",
    nodes: [
      { id: "a", deps: [], step: { kind: "note", text: "first" } },
      { id: "b", deps: ["a"], step: { kind: "tool", tool: "echo", args: { value: "after a" } } },
    ],
  };

  test("a DAG file runs topologically, journals, and closes receipted (exit 0)", async () => {
    const ws = await makeWorkspace(WORKFLOW_YAML, "dag-ok");
    await writeFile(join(ws, "dag.json"), JSON.stringify(DAG, null, 2), "utf8");
    const r = await cli(ws, ["run", "workflow", "--dag", "dag.json", "--json"]);
    expect(r.code).toBe(ExitCode.ok);
    const result = r.json[0] as { run_id?: string; outcome?: string; completed_nodes?: string[]; journal_verified?: boolean };
    expect(typeof result.run_id).toBe("string");
    expect(result.outcome).toBe("completed");
    expect(result.completed_nodes).toEqual(["a", "b"]);
    expect(result.journal_verified).toBe(true);

    const runs = await listJournals(join(ws, ".vaerion", "journal"));
    expect(runs.length).toBe(1);
    const report = await verifyJournal(join(ws, ".vaerion", "journal", `${runs[0]!.run_id}.ndjson`));
    expect(report.ok).toBe(true);
  });

  test("a deny policy fails the denied node honestly (exit 5 partial, refusal logged)", async () => {
    const ws = await makeWorkspace(WORKFLOW_DENY_YAML, "dag-deny");
    await writeFile(join(ws, "dag.json"), JSON.stringify(DAG, null, 2), "utf8");
    const r = await cli(ws, ["run", "workflow", "--dag", "dag.json", "--json"]);
    // The DAG is partial: the note node completed, the echo node was denied
    // by the broker (E1300), the refusal is in the hash-chained refusal log,
    // and the exit code is the honest partial-with-repair-hint.
    expect(r.code).toBe(ExitCode.partial);
    const result = r.json[0] as { outcome: string; completed_nodes: string[]; failed_nodes: Array<{ node: string; error_code: string }> };
    expect(result.outcome).toBe("failed");
    expect(result.completed_nodes).toEqual(["a"]);
    expect(result.failed_nodes).toEqual([{ node: "b", error_code: "E1300" }]);
    await expect(readFile(join(ws, ".vaerion", "refusals.log"), "utf8")).resolves.toContain("E1300");
  });

  test("a missing --dag flag is usage (exit 2); a missing DAG file is usage too", async () => {
    const ws = await makeWorkspace(WORKFLOW_YAML, "dag-missing");
    const noFlag = await cli(ws, ["run", "workflow"]);
    expect(noFlag.code).toBe(ExitCode.usage);
    const noFile = await cli(ws, ["run", "workflow", "--dag", "nope.json"]);
    expect(noFile.code).toBe(ExitCode.usage);
  });
});
