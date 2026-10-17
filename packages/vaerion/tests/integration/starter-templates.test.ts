/**
 * Phase 59.1 W2 — the starter template ecosystem.
 *
 * Pins: every NEW template (tool, automation, multi-agent) scaffolds a
 * workspace that RUNS AS TAUGHT on an empty machine — init → first run →
 * verify, all through the real CLI. No template ships a journey we have not
 * executed here.
 */

import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/cli/vae.ts";
import { ExitCode } from "../../src/cli/io.ts";

const rootsToClean: string[] = [];
afterAll(async () => {
  for (const r of rootsToClean) await rm(r, { recursive: true, force: true }).catch(() => undefined);
});

function captureIo() {
  const out: string[] = [];
  const err: string[] = [];
  return {
    io: { out: (l: string) => out.push(l), err: (l: string) => err.push(l), raw: () => undefined, tty: false, columns: 100 },
    out,
    err,
  };
}

async function runCode(argv: string[], dir: string): Promise<number> {
  return (await runCli(argv, captureIo().io, dir)).code;
}

async function runJson(argv: string[], dir: string): Promise<{ code: number; payload: Record<string, unknown> }> {
  const { io, out } = captureIo();
  const code = (await runCli([...argv, "--json"], io, dir)).code;
  expect(out.length).toBeGreaterThanOrEqual(1);
  return { code, payload: JSON.parse(out[out.length - 1] as string) as Record<string, unknown> };
}

async function freshDir(label: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), `vaerion-tpl-${label}-`));
  rootsToClean.push(dir);
  return dir;
}

describe("the automation template — deterministic tool DAGs, zero model calls", () => {
  test("init → run workflow --dag workflow.json → verified receipt", async () => {
    const dir = await freshDir("automation");
    expect(await runCode(["init", "--template", "automation", "--name", "auto-probe"], dir)).toBe(ExitCode.ok);
    // The scaffold is exactly what the config law declares: the DAG exists.
    const dag = JSON.parse(await readFile(join(dir, "workflow.json"), "utf8")) as { id: string; nodes: unknown[] };
    expect(dag.id).toBe("automation-flow");
    expect(dag.nodes.length).toBe(3);
    const { code, payload } = await runJson(["run", "workflow", "--dag", "workflow.json"], dir);
    expect(code).toBe(ExitCode.ok);
    expect(payload["kind"]).toBe("workflow");
    expect(payload["workflow"]).toBe("automation-flow");
    expect(payload["journal_verified"]).toBe(true);
    expect(payload["failed_nodes"]).toEqual([]);
    // The one-command verification lands green.
    const v = await runJson(["verify"], dir);
    expect(v.code).toBe(ExitCode.ok);
    expect(v.payload["ok"]).toBe(true);
    expect(v.payload["verdict"]).toBe("VERIFIED");
  });
});

describe("the tool template — the supervised agent loop with a real tool belt", () => {
  test("init → run agent (declared plan, broker-checked tools) → verified receipt", async () => {
    const dir = await freshDir("tool");
    expect(await runCode(["init", "--template", "tool", "--name", "tool-probe"], dir)).toBe(ExitCode.ok);
    expect(await readFile(join(dir, "docs", "overview.md"), "utf8")).toContain("tool belt");
    // doctor passes end-to-end (config + gateway matrix) — same law as the agent template.
    expect(await runCode(["doctor", "--json"], dir)).toBe(ExitCode.ok);
    // The TAUGHT first run: a declared plan through the tool belt — every
    // tool call crosses the broker (allow rules), lands on the journal.
    const { code, payload } = await runJson(
      ["run", "agent", "--goal", "probe the tool belt", "--planner", "inline",
       "--plan-json", '[{"kind":"tool","tool":"echo","args":{"value":"hello from the tool belt"}},{"kind":"tool","tool":"clock.read","args":{}}]'],
      dir,
    );
    expect(code).toBe(ExitCode.ok);
    expect(payload["kind"]).toBe("agent");
    expect(payload["journal_verified"]).toBe(true);
    const v = await runJson(["verify"], dir);
    expect(v.code).toBe(ExitCode.ok);
    expect(v.payload["ok"]).toBe(true);
  });
});

describe("the multi-agent template — a crew as ONE journaled DAG", () => {
  test("init → run workflow (tool + model + tool nodes) → verified receipt", async () => {
    const dir = await freshDir("crew");
    expect(await runCode(["init", "--template", "multi-agent", "--name", "crew-probe"], dir)).toBe(ExitCode.ok);
    const dag = JSON.parse(await readFile(join(dir, "workflow.json"), "utf8")) as { id: string; nodes: Array<{ id: string }> };
    expect(dag.id).toBe("crew-flow");
    expect(dag.nodes.map((n) => n.id)).toEqual(["researcher", "analyst", "auditor", "signoff"]);
    const { code, payload } = await runJson(["run", "workflow", "--dag", "workflow.json"], dir);
    expect(code).toBe(ExitCode.ok);
    expect(payload["workflow"]).toBe("crew-flow");
    expect(payload["journal_verified"]).toBe(true);
    expect(payload["failed_nodes"]).toEqual([]);
    expect(payload["completed_nodes"]).toEqual(["researcher", "analyst", "auditor", "signoff"]);
    const v = await runJson(["verify"], dir);
    expect(v.code).toBe(ExitCode.ok);
    expect(v.payload["torn"]).toBe(false);
  });
});

describe("the enterprise template — governance first, deny-by-default, actually brokering", () => {
  test("init → declared governance DAG → verified receipt; doctor green; the README teaches the order", async () => {
    const dir = await freshDir("enterprise");
    expect(await runCode(["init", "--template", "enterprise", "--name", "gov-probe"], dir)).toBe(ExitCode.ok);
    // D-B: the DAG is declared in the template body and ships exactly as declared
    const dag = JSON.parse(await readFile(join(dir, "workflow.json"), "utf8")) as { id: string; nodes: Array<{ id: string }> };
    expect(dag.id).toBe("governance-flow");
    expect(dag.nodes.map((n) => n.id)).toEqual(["brief", "attest", "record"]);
    // the governance README: policy first, run second, verify third, receipt explained
    const readme = await readFile(join(dir, "README.md"), "utf8");
    expect(readme).toContain("Policy first");
    expect(readme).toContain("Run second");
    expect(readme).toContain("Verify third");
    expect(readme).toContain("receipt");
    // doctor passes end-to-end (strict schema 0.1 config + policy + gateway picture)
    expect(await runCode(["doctor", "--json"], dir)).toBe(ExitCode.ok);
    // the declared journey runs on the journal and closes with a receipt
    const { code, payload } = await runJson(["run", "workflow", "--dag", "workflow.json"], dir);
    expect(code).toBe(ExitCode.ok);
    expect(payload["workflow"]).toBe("governance-flow");
    expect(payload["journal_verified"]).toBe(true);
    expect(payload["failed_nodes"]).toEqual([]);
    const v = await runJson(["verify"], dir);
    expect(v.code).toBe(ExitCode.ok);
    expect(v.payload["ok"]).toBe(true);
    expect(v.payload["verdict"]).toBe("VERIFIED");
  });

  test("the scaffold's policy ACTUALLY brokers: the human grant allows, the agent default-deny refuses", async () => {
    const dir = await freshDir("enterprise-broker");
    expect(await runCode(["init", "--template", "enterprise", "--name", "gov-law"], dir)).toBe(ExitCode.ok);
    // POSITIVE: the rationale-backed human rule admits the budgeted planner model
    const human = await runJson(["run", "model", "--model", "mockbrain/mock-1", "--prompt", "governed hello", "--seed", "3"], dir);
    expect(human.code).toBe(ExitCode.ok);
    expect(human.payload["journal_verified"]).toBe(true);
    // NEGATIVE: agents were never granted model.invoke — the deny-by-default
    // law refuses the model node fail-closed; the run still closes WITH a
    // receipt (evidence, not an exception) and the chain verifies.
    await writeFile(join(dir, "model-probe.json"), JSON.stringify({
      id: "probe-model",
      nodes: [{ id: "m", deps: [], step: { kind: "model", model: "mockbrain/mock-1", messages: [{ role: "user", content: "hi" }] } }],
    }) + "\n", "utf8");
    const denied = await runJson(["run", "workflow", "--dag", "model-probe.json"], dir);
    expect(denied.code).toBe(ExitCode.partial);
    // fail-closed, named node, named code: agents were never granted
    // model.invoke (the policy admits no agent rule) → the permission-graph
    // ceiling refuses (E1300) before policy even consults
    expect(denied.payload["failed_nodes"]).toEqual([{ node: "m", error_code: "E1300" }]);
    expect(denied.payload["journal_verified"]).toBe(true); // receipt folded from the journal
    // the journaled evidence: the refusal is ON THE RECORD (a broker deny
    // decision with a fail-closed reason code), never silent, never skipped
    const journalText = await readFile(join(dir, ".vaerion", "journal", (denied.payload["run_id"] as string) + ".ndjson"), "utf8");
    expect(journalText).toContain('"kind":"deny"');
    expect(/"reason_code":"E130[01]"/.test(journalText)).toBe(true); // ceiling or policy default-deny — both fail-closed
  });

  test("`vae create` ships the governance README verbatim (the template's declared README wins)", async () => {
    const dir = await freshDir("enterprise-create");
    expect(await runCode(["create", "gov-project", "--template", "enterprise"], dir)).toBe(ExitCode.ok);
    const readme = await readFile(join(dir, "gov-project", "README.md"), "utf8");
    expect(readme).toContain("# Governance-first Vaerion workspace");
    expect(readme).toContain("vae run workflow --dag workflow.json");
  });
});
