/**
 * The committed example is law, not illustration.
 *
 * examples/vaerion/demo-workspace is copied to a live workspace and executed
 * end-to-end through the CLI exactly as examples/vaerion/README.md shows:
 * the agent run (inline plan → broker-admitted steps → receipt), the
 * workflow DAG (tool → model-through-the-gateway → note), journal
 * verification for every run, and the packaging law (two builds produce
 * byte-identical bundles + an identical vaerion.lock, verify green).
 *
 * If this suite fails, the README lies — fix the world, not the docs.
 */

import { afterAll, describe, expect, test } from "bun:test";
import { cp, mkdir, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { runCli } from "../../src/cli/vae.ts";
import { ExitCode } from "../../src/cli/io.ts";
import { verifyJournal } from "../../src/journal/verify.ts";
import { listJournals } from "../../src/journal/ls.ts";

const EXAMPLE = resolve(import.meta.dir, "..", "..", "..", "..", "examples", "vaerion", "demo-workspace");
const workspaces: string[] = [];
afterAll(async () => {
  for (const ws of workspaces) await rm(ws, { recursive: true, force: true }).catch(() => undefined);
});

async function copyExampleWorkspace(): Promise<string> {
  const ws = await mkdtemp(join(tmpdir(), "vae-example-"));
  workspaces.push(ws);
  await cp(EXAMPLE, ws, { recursive: true });
  // `vae init` scaffolds the workspace state dirs; the example ships the
  // config, so mirror init's directory law here (mkdir is idempotent).
  await mkdir(join(ws, ".vaerion", "journal"), { recursive: true });
  await mkdir(join(ws, ".vaerion", "blobs"), { recursive: true });
  return ws;
}

async function cli(ws: string, args: string[]): Promise<{ code: number; json: Array<Record<string, unknown>> }> {
  const out: string[] = [];
  const { code } = await runCli(args, { out: (l) => out.push(l), err: (l) => out.push(l) }, ws);
  const json = out.filter((l) => l.trim().startsWith("{")).map((l) => JSON.parse(l) as Record<string, unknown>);
  return { code, json };
}

async function verifyAllJournals(ws: string): Promise<void> {
  const runs = await listJournals(join(ws, ".vaerion", "journal"));
  expect(runs.length).toBeGreaterThan(0);
  for (const run of runs) {
    const report = await verifyJournal(join(ws, ".vaerion", "journal", `${run.run_id}.ndjson`));
    expect(report.ok).toBe(true);
  }
}

describe("examples/vaerion — the committed demo workspace is executed, not narrated", () => {
  test("the example files exist and parse before anything runs", async () => {
    await stat(join(EXAMPLE, "vaerion.yaml"));
    const plan = JSON.parse(await readFile(join(EXAMPLE, "plans", "echo-plan.json"), "utf8")) as unknown[];
    expect(Array.isArray(plan)).toBe(true);
    expect(plan.length).toBe(2);
    const dag = JSON.parse(await readFile(join(EXAMPLE, "workflow.json"), "utf8")) as { id: string; nodes: unknown[] };
    expect(dag.id).toBe("demo-flow");
    expect(dag.nodes.length).toBe(3);
  });

  test("the README's agent run: inline plan → broker-admitted steps → receipted goal", async () => {
    const ws = await copyExampleWorkspace();
    const plan = (await readFile(join(ws, "plans", "echo-plan.json"), "utf8")).trim();
    const r = await cli(ws, ["run", "agent", "--goal", "demo the committed example", "--planner", "inline", "--plan-json", plan, "--json"]);
    expect(r.code).toBe(ExitCode.ok);
    const result = r.json[0] as { run_id?: string; outcome?: string; steps?: number; journal_verified?: boolean; receipt?: Record<string, unknown> };
    expect(typeof result.run_id).toBe("string");
    expect(result.outcome).toBe("goal");
    expect(result.steps).toBe(2);
    expect(result.journal_verified).toBe(true);
    expect(result.receipt).toBeTruthy();
    await verifyAllJournals(ws);
  });

  test("the README's workflow run: tool → model through the gateway → note, topological, receipted", async () => {
    const ws = await copyExampleWorkspace();
    const r = await cli(ws, ["run", "workflow", "--dag", "workflow.json", "--json"]);
    expect(r.code).toBe(ExitCode.ok);
    const result = r.json[0] as { run_id?: string; outcome?: string; completed_nodes?: string[]; journal_verified?: boolean };
    expect(typeof result.run_id).toBe("string");
    expect(result.outcome).toBe("completed");
    expect(result.completed_nodes).toEqual(["hello", "ask-model", "signoff"]);
    expect(result.journal_verified).toBe(true);
    await verifyAllJournals(ws);
  });

  test("the README's packaging law: two builds → byte-identical bundle + identical lock; verify green", async () => {
    const ws = await copyExampleWorkspace();
    const b1 = await cli(ws, ["package", "build", "--json"]);
    expect(b1.code).toBe(ExitCode.ok);
    const b2 = await cli(ws, ["package", "build", "--json"]);
    expect(b2.code).toBe(ExitCode.ok);
    const outPath = (b1.json[0] as { out?: string }).out;
    expect(typeof outPath).toBe("string");

    const bytes1 = new Uint8Array(await readFile(join(ws, outPath!)));
    const bytes2 = new Uint8Array(await readFile(join(ws, outPath!)));
    expect(Buffer.from(bytes1).equals(Buffer.from(bytes2))).toBe(true); // P2, in your hands

    const lock1 = await readFile(join(ws, "vaerion.lock"), "utf8");
    expect(lock1.length).toBeGreaterThan(0);

    const v = await cli(ws, ["package", "verify", outPath!, "--json"]);
    expect(v.code).toBe(ExitCode.ok);
    await verifyAllJournals(ws);
  });
});
