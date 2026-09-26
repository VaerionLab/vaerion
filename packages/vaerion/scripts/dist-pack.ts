/**
 * Vaerion distribution pipeline (MS-6, blueprint §14/§15.1 M6 "installer
 * pipelines") — the network-free, fully hermetic pack → inspect → install →
 * smoke pipeline for the engine package.
 *
 * What it proves, step by step (every refusal fails the pipeline loudly):
 *
 *  1. PACK      `bun pm pack` produces the tarball from @vaerion/engine
 *               (files law: src + README.md + package.json only).
 *  2. INVENTORY the tarball entry set matches the allowlist exactly —
 *               no fixtures, no tests, no scripts, no dotfiles, no .env.
 *  3. SECRETS   every packed byte is scanned with the C5 secret patterns
 *               (defense in depth beyond the git-tree scan).
 *  4. INSTALL   a consumer tree is assembled OFFLINE: the extracted package
 *               placed at node_modules/@vaerion/engine plus its runtime
 *               dependency tree vendored from THIS workspace's resolved
 *               node_modules (no registry contact — the sandbox is
 *               network-free and the release channel needs a ratified ADR).
 *  5. SMOKE     the INSTALLED shim answers --help/--json, scaffolds a
 *               workspace (`vae init`), and doctor/dev/model runs exit 0
 *               through the same exit-code contract as development.
 *
 * The pipeline emits a measured dist report (sizes, entry counts, smoke
 * verdicts) and exits non-zero on any refusal. Reports are generated, never
 * narrated.
 */

import { spawnSync } from "node:child_process";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

/** Secret patterns — MUST stay in lockstep with constitutional check C5. */
const SECRET_RE = /\bgh[pousr]_[A-Za-z0-9]{20,}\b|\bAKIA[0-9A-Z]{16}\b|-----BEGIN [A-Z ]*PRIVATE KEY-----|\bxox[bpors]-[A-Za-z0-9-]{10,}\b/;

/** The engine's runtime dependencies (package.json `dependencies`) — asserted present after install. */
const RUNTIME_DEPS = ["ajv", "hash-wasm", "yaml"] as const;

export interface DistReport {
  ok: boolean;
  steps: Array<{ step: string; ok: boolean; detail: string }>;
  tarball: { filename: string; bytes: number; entries: number };
  inventory: { files: number; tsFiles: number };
  vendored: string[];
  smoke: Array<{ args: string[]; cwd: string; exitCode: number | null }>;
  refusals: string[];
}

export interface DistPipelineOptions {
  /** packages/vaerion (the pack root). */
  engineDir: string;
  /** Repository root (the workspace whose node_modules holds resolved deps). */
  workspaceRoot: string;
  /** Where the tarball + consumer tree + report are written. */
  outDir: string;
  log?: (line: string) => void;
}

function run(cmd: string[], opts: { cwd?: string } = {}): { status: number | null; stdout: string; stderr: string } {
  const p = spawnSync(cmd[0]!, cmd.slice(1), { cwd: opts.cwd, encoding: "utf8", env: { ...process.env, FORCE_COLOR: "0" } });
  return { status: p.status, stdout: p.stdout ?? "", stderr: p.stderr ?? "" };
}

async function walk(dir: string, out: string[] = []): Promise<string[]> {
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    const st = await stat(p);
    if (st.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

/** Run the full pipeline; every refusal is recorded, reported, and returned. */
export async function runDistPipeline(opts: DistPipelineOptions): Promise<DistReport> {
  const log = opts.log ?? (() => undefined);
  const report: DistReport = {
    ok: false,
    steps: [],
    tarball: { filename: "", bytes: 0, entries: 0 },
    inventory: { files: 0, tsFiles: 0 },
    vendored: [],
    smoke: [],
    refusals: [],
  };
  const refuse = (step: string, detail: string): void => {
    report.refusals.push(`${step}: ${detail}`);
    log(`REFUSED [${step}] ${detail}`);
  };
  /** Every exit path persists the report FIRST (evidence, never narration). */
  const finish = async (): Promise<DistReport> => {
    report.ok = report.refusals.length === 0;
    await writeFile(join(opts.outDir, "dist-report.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
    return report;
  };

  // 1 — PACK
  log("dist: packing @vaerion/engine …");
  const packed = run(["bun", "pm", "pack", "--destination", opts.outDir, "--quiet"], { cwd: opts.engineDir });
  // --quiet prints only the tarball path (bun refuses --filename together
  // with --destination, so the default lockstep name is used and parsed).
  const printed = packed.stdout.split("\n").map((l) => l.trim()).filter((l) => l.length > 0 && l.endsWith(".tgz"));
  if (packed.status !== 0) {
    refuse("pack", `bun pm pack exited ${packed.status}: ${packed.stderr.trim().slice(0, 200)}`);
    return finish();
  }
  if (printed.length !== 1) {
    refuse("pack", `could not determine the tarball path from output: ${packed.stdout.trim().slice(0, 200)}`);
    return finish();
  }
  const tarballPath = resolve(opts.engineDir, printed[0]!);
  const tarballStat = await stat(tarballPath).catch(() => null);
  if (tarballStat === null) {
    refuse("pack", "the tarball was not written to the destination");
    return finish();
  }
  report.tarball.filename = printed[0]!;
  report.tarball.bytes = tarballStat.size;
  report.steps.push({ step: "pack", ok: true, detail: `${tarballStat.size} bytes` });
  log(`dist: packed ${tarballStat.size} bytes`);

  // 2 — INVENTORY (allowlist law, fail-closed)
  const listing = run(["tar", "-tzf", tarballPath]);
  if (listing.status !== 0) {
    refuse("inventory", `tar -tzf exited ${listing.status}`);
    return finish();
  }
  const entries = listing.stdout.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  report.tarball.entries = entries.length;
  const ALLOW = [/^package\/package\.json$/, /^package\/README\.md$/, /^package\/src\/.*\.ts$/];
  const violations = entries.filter((e) => {
    const allowed = ALLOW.some((re) => re.test(e));
    const dotted = e.split("/").some((seg) => seg.startsWith(".") && seg !== "." && seg !== "..");
    return !allowed || dotted;
  });
  if (violations.length > 0) {
    refuse("inventory", `entries outside the files law: ${violations.slice(0, 10).join(", ")}`);
  } else {
    report.steps.push({ step: "inventory", ok: true, detail: `${entries.length} entries, all within the files law` });
    log(`dist: inventory law holds (${entries.length} entries)`);
  }
  report.inventory.files = entries.length;
  report.inventory.tsFiles = entries.filter((e) => e.startsWith("package/src/") && e.endsWith(".ts")).length;

  // 3 — SECRETS (defense in depth beyond the git-tree C5 scan)
  const stageDir = join(opts.outDir, "stage");
  await mkdir(stageDir, { recursive: true });
  const extracted = run(["tar", "-xzf", tarballPath, "-C", stageDir]);
  if (extracted.status !== 0) {
    refuse("extract", `tar -xzf exited ${extracted.status}`);
    return finish();
  }
  const packageDir = join(stageDir, "package");
  const files = await walk(packageDir);
  const secretHits: string[] = [];
  for (const f of files) {
    const text = await readFile(f, "utf8").catch(() => "");
    if (SECRET_RE.test(text)) secretHits.push(relative(packageDir, f));
  }
  if (secretHits.length > 0) {
    refuse("secrets", `secret-pattern hits in the tarball: ${secretHits.join(", ")}`);
  } else {
    report.steps.push({ step: "secrets", ok: true, detail: `0 hits across ${files.length} files` });
    log(`dist: secret scan clean across ${files.length} files`);
  }

  // 4 — INSTALL (the real installer: `bun install` resolves the tarball from
  // the warm package cache — no registry contact in this environment; a cold
  // cache fails loudly here instead of pretending the install happened).
  const consumerDir = join(opts.outDir, "consumer");
  const consumerModules = join(consumerDir, "node_modules");
  await mkdir(consumerDir, { recursive: true });
  await writeFile(
    join(consumerDir, "package.json"),
    JSON.stringify(
      { name: "vaerion-dist-smoke", version: "0.0.0", private: true, dependencies: { "@vaerion/engine": `file:${tarballPath}` } },
      null,
      2,
    ) + "\n",
    "utf8",
  );
  const installed = run(["bun", "install"], { cwd: consumerDir });
  if (installed.status !== 0) {
    refuse("install", `bun install of the tarball exited ${installed.status}: ${(installed.stderr || installed.stdout).trim().slice(0, 200)}`);
    return finish();
  }
  const engineInstalled = await stat(join(consumerModules, "@vaerion", "engine", "src", "cli", "vae.ts")).then(() => true, () => false);
  if (!engineInstalled) {
    refuse("install", "the engine package is not present in the consumer node_modules after install");
    return finish();
  }
  const depNames: string[] = [...RUNTIME_DEPS];
  const missingDeps: string[] = [];
  for (const dep of depNames) {
    if (!(await stat(join(consumerModules, dep, "package.json")).then(() => true, () => false))) missingDeps.push(dep);
  }
  if (missingDeps.length > 0) {
    refuse("install", `runtime dependencies missing from the consumer tree: ${missingDeps.join(", ")}`);
  } else {
    report.vendored = depNames;
    report.steps.push({ step: "install", ok: true, detail: `bun install resolved the tarball + runtime deps offline (${depNames.join(", ")})` });
    log("dist: installed via bun install (offline, warm cache)");
  }

  // 5 — SMOKE the installed shim
  const shim = join(consumerModules, "@vaerion", "engine", "src", "cli", "vae.ts");
  const smokeWs = join(opts.outDir, "smoke-ws");
  const smokeModelDir = join(opts.outDir, "smoke-model");
  const smokeCases: Array<{ args: string[]; cwd: string; expect: number; contains?: string }> = [
    { args: ["--help"], cwd: consumerDir, expect: 0, contains: "Usage: vae" },
    { args: ["version", "--json"], cwd: consumerDir, expect: 0, contains: '"version"' },
    { args: ["--cwd", smokeWs, "init", "--name", "dist-smoke"], cwd: consumerDir, expect: 0 },
    { args: ["--cwd", smokeWs, "doctor"], cwd: consumerDir, expect: 0 },
    { args: ["--cwd", smokeWs, "dev"], cwd: consumerDir, expect: 0 },
    { args: ["run", "model", "--model", "mockbrain/mock-1", "--prompt", "ping"], cwd: smokeModelDir, expect: 0 },
  ];
  // The model smoke needs a declared mockbrain provider + an allow rule.
  await mkdir(smokeModelDir, { recursive: true });
  await writeFile(
    join(smokeModelDir, "vaerion.yaml"),
    `schemaVersion: "0.1"
project:
  name: dist-smoke-model
gateway:
  providers:
    mockbrain: { enabled: true, models: ["mock-1"] }
policy:
  rules:
    - id: human-model-allow
      principalKinds: [human]
      domain: model.invoke
      scope: "mockbrain/mock-1"
      effect: allow
      rationale: "distribution smoke test"
telemetry:
  enabled: false
`,
    "utf8",
  );

  for (const c of smokeCases) {
    const r = run(["bun", shim, ...c.args], { cwd: c.cwd });
    report.smoke.push({ args: c.args, cwd: relative(opts.outDir, c.cwd), exitCode: r.status });
    const output = r.stdout + r.stderr;
    if (r.status !== c.expect) {
      refuse("smoke", `vae ${c.args.join(" ")} exited ${r.status} (expected ${c.expect}): ${output.trim().slice(0, 160)}`);
    } else if (c.contains !== undefined && !output.includes(c.contains)) {
      refuse("smoke", `vae ${c.args.join(" ")} output lacks "${c.contains}"`);
    } else {
      report.steps.push({ step: `smoke:${c.args.join(" ")}`, ok: true, detail: `exit ${r.status}` });
      log(`dist: smoke vae ${c.args.join(" ")} → exit ${r.status}`);
    }
  }

  await finish();
  return report;
}
