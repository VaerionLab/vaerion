/**
 * Phase 59.1 W1 — `vae create`: the zero-to-workspace path.
 *
 * Pins: a fresh developer goes `vae create my-first-agent` → cd → `vae run
 * demo` → `vae verify` with zero other steps; create refuses existing
 * directories and invalid names BEFORE touching the filesystem; --dry-run
 * is pure; the scaffolded README teaches real commands only.
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

async function runCode(argv: string[], dir: string): Promise<number> {
  return (await runCli(argv, captureIo().io, dir)).code;
}

async function lastJson(argv: string[], dir: string): Promise<{ code: number; payload: Record<string, unknown>; out: string[]; err: string[] }> {
  const { io, out, err } = captureIo();
  const code = (await runCli([...argv, "--json"], io, dir)).code;
  return { code, payload: JSON.parse(out[out.length - 1] as string) as Record<string, unknown>, out, err };
}

async function freshDir(label: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), `vae-create-${label}-`));
  rootsToClean.push(dir);
  return dir;
}

const exists = (p: string) => stat(p).then(() => true, () => false);

describe("`vae create` — the happy path is the taught path", () => {
  test("create my-first-agent → demo scaffold + README → run demo → verify", async () => {
    const dir = await freshDir("happy");
    const { code, payload } = await lastJson(["create", "my-first-agent"], dir);
    expect(code).toBe(ExitCode.ok);
    expect(payload["command"]).toBe("create");
    expect(payload["template"]).toBe("demo"); // the fastest verified journey is the default
    const project = join(dir, "my-first-agent");
    expect(await exists(join(project, "vaerion.yaml"))).toBe(true);
    expect(await exists(join(project, "sources", "demo.md"))).toBe(true);
    expect(await exists(join(project, ".vaerion", "journal"))).toBe(true);
    expect(await exists(join(project, ".vaerion", "blobs"))).toBe(true);
    const readme = await readFile(join(project, "README.md"), "utf8");
    expect(readme).toContain("# my-first-agent");
    expect(readme).toContain("vae run demo");
    expect(readme).toContain("vae verify");
    expect(readme).toContain("receipt folded from the journal");
    // The taught journey works AS TAUGHT, inside the created directory:
    const run = await lastJson(["run", "demo"], project);
    expect(run.code).toBe(ExitCode.ok);
    expect(run.payload["journal_verified"]).toBe(true);
    expect(typeof run.payload["run_id"]).toBe("string");
    // One-command verification, no RUN_ID needed:
    const verify = await lastJson(["verify"], project);
    expect(verify.code).toBe(ExitCode.ok);
    expect(verify.payload["verdict"]).toBe("VERIFIED");
    expect(verify.payload["ok"]).toBe(true);
    expect(verify.payload["torn"]).toBe(false);
  });

  test("create --template agent scaffolds the agent journey README", async () => {
    const dir = await freshDir("agent");
    expect(await runCode(["create", "my-agent", "--template", "agent"], dir)).toBe(ExitCode.ok);
    expect(await exists(join(dir, "my-agent", "docs", "overview.md"))).toBe(true);
    const readme = await readFile(join(dir, "my-agent", "README.md"), "utf8");
    expect(readme).toContain("vae run agent");
    expect(readme).toContain("--planner inline");
    expect(readme).toContain("--plan-json"); // inline planning is DECLARED by law
  });

  test("create --template automation ships a valid, executable DAG", async () => {
    const dir = await freshDir("auto");
    expect(await runCode(["create", "my-automation", "--template", "automation"], dir)).toBe(ExitCode.ok);
    const dag = JSON.parse(await readFile(join(dir, "my-automation", "workflow.json"), "utf8")) as { id: string };
    expect(dag.id).toBe("automation-flow");
    const readme = await readFile(join(dir, "my-automation", "README.md"), "utf8");
    expect(readme).toContain("vae run workflow --dag workflow.json");
  });
});

describe("`vae create` — the refusal laws", () => {
  test("an existing directory is never touched (E1600, exit 2)", async () => {
    const dir = await freshDir("refuse");
    expect(await runCode(["create", "twice"], dir)).toBe(ExitCode.ok);
    const { code, err } = await lastJsonRaw(["create", "twice"], dir);
    expect(code).toBe(ExitCode.usage);
    expect(err.join("\n")).toContain("already exists");
  });

  test("invalid names are refused before any write (E1600, exit 2)", async () => {
    const dir = await freshDir("badname");
    const { code, err } = await lastJsonRaw(["create", "Bad Name"], dir);
    expect(code).toBe(ExitCode.usage);
    expect(err.join("\n")).toContain("invalid project name");
    expect(await exists(join(dir, "Bad Name"))).toBe(false);
  });

  test("a missing name is a usage error with the usage in it", async () => {
    const dir = await freshDir("noname");
    const { code, err } = await lastJsonRaw(["create"], dir);
    expect(code).toBe(ExitCode.usage);
    expect(err.join("\n")).toContain("missing project name");
  });

  test("an unknown template is E1203 and writes nothing (exit 2)", async () => {
    const dir = await freshDir("badtpl");
    const { code, err } = await lastJsonRaw(["create", "nope", "--template", "vibes"], dir);
    expect(code).toBe(ExitCode.usage);
    expect(err.join("\n")).toContain("E1203");
    expect(await exists(join(dir, "nope"))).toBe(false);
  });

  test("--dry-run is pure: full plan, zero side effects", async () => {
    const dir = await freshDir("dry");
    const { code, payload } = await lastJson(["create", "planned", "--dry-run"], dir);
    expect(code).toBe(ExitCode.ok);
    expect(payload["dry_run"]).toBe(true);
    expect(payload["side_effects"]).toBe(0);
    const plan = payload["plan"] as Array<Record<string, unknown>>;
    expect(plan.some((p) => p["path"] === "planned/vaerion.yaml")).toBe(true);
    expect(plan.some((p) => p["path"] === "planned/README.md")).toBe(true);
    expect(await exists(join(dir, "planned"))).toBe(false);
  });
});

/** raw variant that returns BOTH streams without requiring JSON on out */
function lastJsonRaw(argv: string[], dir: string): Promise<{ code: number; out: string[]; err: string[] }> {
  return (async () => {
    const { io, out, err } = captureIo();
    const code = (await runCli(argv, io, dir)).code;
    return { code, out, err };
  })();
}
