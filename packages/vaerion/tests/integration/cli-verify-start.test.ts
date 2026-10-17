/**
 * Phase 59.1 W1 — `vae verify` and `vae start`.
 *
 * verify pins: latest-run resolution (ULIDs sort monotonically), full-chain
 * recomputation, honest exits (0/5), teaching errors when the workspace is
 * empty. start pins: ONE command executes init → run → verify → summary;
 * existing workspaces are continued, never overwritten; non-demo templates
 * get their exact first command instead of a guess; --dry-run is pure.
 */

import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm, stat, readFile } from "node:fs/promises";
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

async function freshDir(label: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), `vae-vs-${label}-`));
  rootsToClean.push(dir);
  return dir;
}

const exists = (p: string) => stat(p).then(() => true, () => false);

/** Run argv with --json; return every parsed NDJSON line + exit code. */
async function jsonRun(argv: string[], dir: string): Promise<{ code: number; lines: Array<Record<string, unknown>>; err: string[] }> {
  const { io, out, err } = captureIo();
  const code = (await runCli([...argv, "--json"], io, dir)).code;
  return { code, lines: out.map((l) => JSON.parse(l) as Record<string, unknown>), err };
}

describe("`vae verify` — one-command verification", () => {
  test("an empty workspace teaches instead of failing cryptically", async () => {
    const dir = await freshDir("empty");
    const { io, err } = captureIo();
    const code = (await runCli(["verify"], io, dir)).code;
    expect(code).toBe(ExitCode.usage);
    const text = err.join("\n");
    expect(text).toContain("no runs in this workspace yet");
    expect(text).toContain("vae run demo");
  });

  test("a malformed RUN_ID is a usage error (E1600)", async () => {
    const dir = await freshDir("badid");
    const { io, err } = captureIo();
    const code = (await runCli(["verify", "not-a-run-id"], io, dir)).code;
    expect(code).toBe(ExitCode.usage);
    expect(err.join("\n")).toContain("expected crn_run_");
  });

  test("after a run: latest-run verification is green, byte-honest", async () => {
    const dir = await freshDir("verify");
    expect(await jsonRunCode(["init", "--template", "demo", "--name", "v-probe"], dir)).toBe(ExitCode.ok);
    const run = await jsonRun(["run", "demo"], dir);
    expect(run.code).toBe(ExitCode.ok);
    const runId = run.lines.find((l) => l["command"] === "run")?.["run_id"] as string;
    expect(typeof runId).toBe("string");

    const v = await jsonRun(["verify"], dir);
    expect(v.code).toBe(ExitCode.ok);
    const payload = v.lines.find((l) => l["command"] === "verify")!;
    expect(payload["run_id"]).toBe(runId); // the LATEST run is the one just created
    expect(payload["verdict"]).toBe("VERIFIED");
    expect(payload["ok"]).toBe(true);
    expect(payload["torn"]).toBe(false);
    expect((payload["records"] as number)).toBeGreaterThan(0);
    expect(payload["head_hash"]).toMatch(/^[0-9a-f]{64}$/);
    expect(payload["issues"]).toEqual([]);

    // Explicit RUN_ID: the same verdict, by name.
    const v2 = await jsonRun(["verify", runId], dir);
    expect(v2.code).toBe(ExitCode.ok);
    expect(v2.lines.find((l) => l["command"] === "verify")?.["run_id"]).toBe(runId);
  });
});

describe("`vae start` — the five-minute first agent", () => {
  test("ONE command: init → run demo → verify → done summary", async () => {
    const dir = await freshDir("start");
    const { code, lines } = await jsonRun(["start"], dir);
    expect(code).toBe(ExitCode.ok);
    // every stage rendered its own result
    expect(lines.some((l) => l["command"] === "init")).toBe(true);
    expect(lines.some((l) => l["command"] === "run" && l["kind"] === "demo")).toBe(true);
    expect(lines.some((l) => l["command"] === "verify" && l["ok"] === true)).toBe(true);
    const summary = lines.find((l) => l["command"] === "start" && l["done"] !== undefined);
    expect(summary).toBeTruthy();
    expect(summary?.["done"]).toBe(true);
    expect(summary?.["journal_verified"]).toBe(true);
    expect(typeof summary?.["run_id"]).toBe("string");
    expect(String(summary?.["head_hash"])).toMatch(/^[0-9a-f]{64}$/);
    // the workspace is real
    expect(await exists(join(dir, "vaerion.yaml"))).toBe(true);
    expect(await exists(join(dir, ".vaerion", "journal"))).toBe(true);
  });

  test("re-running start continues an existing workspace — never overwrites", async () => {
    const dir = await freshDir("again");
    expect(await jsonRunCode(["start"], dir)).toBe(ExitCode.ok);
    const { code, lines } = await jsonRun(["start"], dir);
    expect(code).toBe(ExitCode.ok);
    expect(lines.some((l) => l["command"] === "start" && l["label"] === "workspace")).toBe(true);
    const summary = lines.find((l) => l["command"] === "start" && l["done"] !== undefined);
    expect(summary?.["done"]).toBe(true); // a SECOND verified run
  });

  test("start --template automation teaches the exact first command (no guessing)", async () => {
    const dir = await freshDir("auto");
    const { code, lines } = await jsonRun(["start", "--template", "automation"], dir);
    expect(code).toBe(ExitCode.ok);
    const runStep = lines.find((l) => l["command"] === "start" && l["label"] === "run");
    expect(runStep?.["run_command"]).toBe("vae run workflow --dag workflow.json");
    const summary = lines.find((l) => l["command"] === "start" && l["done"] !== undefined);
    expect(summary?.["done"]).toBe(false); // honest: nothing ran yet
  });

  test("start --dry-run is pure: plan only, nothing written", async () => {
    const dir = await freshDir("dry");
    const { code, lines } = await jsonRun(["start", "--dry-run"], dir);
    expect(code).toBe(ExitCode.ok);
    const plan = lines.find((l) => l["command"] === "start")!;
    expect(plan["dry_run"]).toBe(true);
    expect(plan["side_effects"]).toBe(0);
    expect(await exists(join(dir, "vaerion.yaml"))).toBe(false);
  });
});

async function jsonRunCode(argv: string[], dir: string): Promise<number> {
  return (await jsonRun(argv, dir)).code;
}

// readFile import retained for parity with sibling suites (tree-shaken unused).
void readFile;
