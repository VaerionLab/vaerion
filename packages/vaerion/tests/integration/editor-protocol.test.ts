/**
 * ASC XVIII Phase 7 — the Editor Ecosystem test suite.
 *
 * Editors are windows onto the CLI: this file is the proof. It executes
 * the VS Code extension's protocol client (editors/vscode/lib/protocol.js
 * and lib/view.js — pure Node, no `vscode` import) against the REAL CLI
 * through the SAME shim shape install.sh bakes into installations
 * (`exec bun run <vae.ts> "$@"`), and pins every JSON field the editor
 * protocol v1 consumes. It also binds the two representations of the
 * command surface (hand-crafted MAIN_HELP vs. the machine COMMAND_CATALOG)
 * and the bundled YAML schema to the engine's spec — the C4 law applied
 * to editor surfaces.
 *
 * Honesty law: what this file verifies is the protocol and the client.
 * The per-editor host wiring (extension.js vs. host, Lua vs. nvim, Kotlin
 * vs. IntelliJ SDK) has never executed in this environment and is marked
 * UNVERIFIED in editors/README.md — no test here claims otherwise.
 */

import { describe, expect, test } from "bun:test";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildArgs,
  catalogFromWelcome,
  diagnosticsFromDoctor,
  parseNdjson,
  reportHighlights,
  runJson,
  runsFromJournal,
  statusSummary,
  type RunOk,
  type RunResult,
} from "../../../../editors/vscode/lib/protocol.js";
import { buildRunHtml } from "../../../../editors/vscode/lib/view.js";
import { COMMAND_CATALOG } from "../../src/cli/catalog.ts";
import { MAIN_HELP, VERSION } from "../../src/cli/vae.ts";
import { COMMAND_HELP } from "../../src/cli/vae.ts";

const ROOT = join(import.meta.dir, "..", "..", "..", "..");
const VAE_TS = join(ROOT, "packages", "vaerion", "src", "cli", "vae.ts");
const CANARY = "sk-canary-NEVER-LEAK-9f3a";

/** Type-guard mirror of the protocol client's result (the d.ts is the typed
 *  contract; tests narrow with this guard). */
const isOk = <T,>(r: RunResult<T>): r is RunOk<T> => r.ok === true;

/** A production-shaped shim: identical law to packaging/install.sh line 236 —
 *  same entrypoint, same exit-code contract. */
async function makeShim(dir: string): Promise<string> {
  const shim = join(dir, "vae");
  await writeFile(shim, `#!/usr/bin/env bun\nimport { main } from ${JSON.stringify(VAE_TS)};\nprocess.exit(await main(Bun.argv.slice(2)));\n`);
  await chmod(shim, 0o755);
  return shim;
}

async function freshDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "vae-editor-"));
}

describe("editor protocol client — argument law", () => {
  test("buildArgs prepends --json and --cwd; the machine contract is not optional", () => {
    expect(buildArgs(["status"], { cwd: "/w" })).toEqual(["--json", "--cwd", "/w", "status"]);
    expect(buildArgs(["journal", "ls"])).toEqual(["--json", "journal", "ls"]);
  });

  test("buildArgs refuses unsafe arguments (no newlines, no NUL — injection is not a feature)", () => {
    expect(() => buildArgs(["status\nEJECT"])).toThrow();
    expect(() => buildArgs(["status\0"])).toThrow();
  });

  test("parseNdjson parses one object per line and skips empty lines", () => {
    expect(parseNdjson('{"a":1}\n{"b":2}\n')).toEqual([{ a: 1 }, { b: 2 }]);
    expect(parseNdjson("")).toEqual([]);
  });
});

describe("editor protocol client — failure paths teach", () => {
  test("cli-missing: ENOENT resolves with an install-teaching kind, never throws", async () => {
    const r = await runJson("definitely-not-vae-anywhere", ["status"], { cwd: "." });
    expect(r.ok).toBe(false);
    if (!isOk(r)) {
      expect(r.kind).toBe("cli-missing");
      expect(r.fix.length).toBeGreaterThan(10);
    }
  });

  test("timeout: bounded calls, killed cleanly (no background work law)", async () => {
    const dir = await mkdtemp(join(tmpdir(), "vae-editor-"));
    const slow = join(dir, "slow");
    await writeFile(slow, "#!/bin/sh\nsleep 5\n");
    await chmod(slow, 0o755);
    const r = await runJson(slow, ["status"], { cwd: dir, timeoutMs: 150 });
    expect(r.ok).toBe(false);
    if (!isOk(r)) expect(r.kind).toBe("timeout");
    await rm(dir, { recursive: true, force: true });
  });

  test("garbage stdout on success = contract violation (a non-Vaerion binary is configured)", async () => {
    const dir = await mkdtemp(join(tmpdir(), "vae-editor-"));
    const fake = join(dir, "fake-vae");
    await writeFile(fake, "#!/bin/sh\necho 'hello, human'\n");
    await chmod(fake, 0o755);
    const r = await runJson(fake, ["status"], { cwd: dir });
    expect(r.ok).toBe(false);
    if (!isOk(r)) expect(r.kind).toBe("contract");
    await rm(dir, { recursive: true, force: true });
  });

  test("nonzero exit without an error envelope = unknown, stderr becomes the fix", async () => {
    const dir = await mkdtemp(join(tmpdir(), "vae-editor-"));
    const fake = join(dir, "fake-vae");
    await writeFile(fake, "#!/bin/sh\necho 'boom' >&2\nexit 7\n");
    await chmod(fake, 0o755);
    const r = await runJson(fake, ["status"], { cwd: dir });
    expect(r.ok).toBe(false);
    if (!isOk(r)) {
      expect(r.kind).toBe("unknown");
      expect(r.fix).toContain("boom");
    }
    await rm(dir, { recursive: true, force: true });
  });
});

describe("editor protocol v1 — LIVE conformance against the real CLI", () => {
  let dir = "";
  let shim = "";
  const vae = async (args: string[], timeoutMs = 15000): Promise<RunResult> => runJson(shim, args, { cwd: dir, timeoutMs });

  // Fresh temp dir per test-group run; the shim is install.sh-shaped.
  const ready = (async () => {
    dir = await freshDir();
    shim = await makeShim(dir);
  })();

  test("bare `vae --json` publishes the machine command catalog", async () => {
    await ready;
    const r = await vae([]);
    expect(r.ok).toBe(true);
    if (!isOk(r)) return;
    const data = r.data as Record<string, unknown>;
    expect(data.command).toBe("welcome");
    expect(data.version).toBe(VERSION);
    expect(data.state).toBe("fresh");
    const catalog = catalogFromWelcome(data);
    expect(catalog.length).toBe(COMMAND_CATALOG.length);
    expect(catalog.map((c) => c.command)).toEqual(COMMAND_CATALOG.map((c) => c.command));
  });

  test("status --json carries the project intelligence the editor renders", async () => {
    await ready;
    const r = await vae(["status"]);
    expect(r.ok).toBe(true);
    if (!isOk(r)) return;
    const data = r.data as Record<string, any>;
    expect(data.command).toBe("status");
    expect(data.workspace.state).toBe("fresh");
    expect(data.workspace.name).toBe("adhoc");
    expect(Array.isArray(data.hints)).toBe(true);
    expect(typeof data.runs.total).toBe("number");
    const sum = statusSummary(data);
    expect(sum.text).toContain("Vaerion");
    expect(sum.tooltip).toContain("fresh");
    expect(sum.tooltip).toContain("Next:");
  });

  test("doctor --json findings carry the full cause → detail → impact → fix chain", async () => {
    await ready;
    const r = await vae(["doctor"], 30000);
    // The exit-code contract is honest: doctor completes and reports its
    // findings AND exits 5 (partial-with-repair-hint). The payload is the
    // result; the code is data. The client resolves ok:true with exit —
    // the editor renders diagnostics from the findings, never a fake pass.
    expect(r.ok).toBe(true);
    if (!isOk(r)) return;
    expect(r.exit).toBe(5);
    const data = r.data as Record<string, any>;
    expect(data.command).toBe("doctor");
    const configCheck = (data.checks as any[]).find((c) => c.check === "config");
    expect(configCheck.ok).toBe(false);
    expect(configCheck.code).toBe("E1200");
    expect(String(configCheck.fix).length).toBeGreaterThan(0);
    expect(String(configCheck.impact).length).toBeGreaterThan(0);
    const diags = diagnosticsFromDoctor(data);
    expect(diags.length).toBeGreaterThanOrEqual(1);
    const d = diags[0]!;
    expect(d.code).toBe("E1200");
    expect(d.message).toContain("Impact:");
    expect(d.message).toContain("Fix:");
    expect(d.source).toBe("vaerion doctor");
  });

  test("report / journal ls / ai status — the read-only set the editor consumes", async () => {
    await ready;
    const report = await vae(["report"]);
    expect(report.ok).toBe(true);
    if (isOk(report)) {
      const data = report.data as Record<string, any>;
      expect(typeof data.runs.total).toBe("number");
      expect(typeof data.metering.invocations).toBe("number");
      expect(reportHighlights(data).length).toBeGreaterThan(0);
    }
    const ls = await vae(["journal", "ls"]);
    expect(ls.ok).toBe(true);
    if (isOk(ls)) expect(Array.isArray((ls.data as Record<string, any>).runs)).toBe(true);
    const ai = await vae(["ai", "status"]);
    expect(ai.ok).toBe(true);
    if (isOk(ai)) {
      const providers = (ai.data as Record<string, any>).providers as any[];
      expect(providers.length).toBeGreaterThan(0);
      for (const p of providers) {
        expect(typeof p.provider).toBe("string");
        expect(typeof p.credential).toBe("string");
      }
    }
  });

  test("usage errors arrive as cli-error with the E-code contract intact", async () => {
    await ready;
    const r = await vae(["journal", "show", "not-a-run-id"]);
    expect(r.ok).toBe(false);
    if (!isOk(r)) {
      expect(r.kind).toBe("cli-error");
      expect(r.code).toBe("E1600");
      expect(r.message.length).toBeGreaterThan(5);
      expect(r.fix.length).toBeGreaterThan(5);
    }
  });

  test("canary law: a secret in the environment never appears in any editor call result", async () => {
    await ready;
    const r = await runJson(shim, ["status"], {
      cwd: dir,
      env: { ...process.env, ANTHROPIC_API_KEY: CANARY, OPENAI_API_KEY: CANARY },
    });
    const text = JSON.stringify(r);
    expect(text.includes(CANARY)).toBe(false);
  });
});

describe("run viewer (lib/view.js) — render-only, escape-everything", () => {
  test("record details are HTML-escaped; the webview has no scripts and a locked CSP", () => {
    const html = buildRunHtml("crn_run_X", [
      { kind: "run_started", ts: "t", detail: "<script>alert(1)</script>" },
      { kind: "model_call", ts: "t", detail: `secret: ${CANARY}` },
    ], { verified: true });
    expect(html.includes("<script>alert(1)</script>")).toBe(false);
    expect(html.includes("&lt;script&gt;")).toBe(true);
    expect(html.includes(CANARY)).toBe(true); // the data is rendered, but escaped...
    expect(html.match(/<script[\s>]/g)).toBe(null); // ...and no script tag exists
    expect(html.includes("default-src 'none'")).toBe(true);
    expect(html.includes("journal verified")).toBe(true);
  });

  test("unknown record kinds are counted, never invented", () => {
    const html = buildRunHtml("r", [{ nope: true }, { kind: "note", ts: "t", detail: "d" }]);
    expect(html.includes("1 not rendered")).toBe(true);
    expect(html.includes("note×1")).toBe(true);
  });
});

describe("catalog law — two representations of one command surface, bound by test", () => {
  test("every catalog usage line appears verbatim in MAIN_HELP", () => {
    for (const entry of COMMAND_CATALOG) {
      expect(MAIN_HELP.includes(entry.usage)).toBe(true);
    }
  });

  test("every dispatcher case in vae.ts is covered by the catalog", async () => {
    const src = await readFile(VAE_TS, "utf8");
    const cases = [...src.matchAll(/case "([a-z-]+)":/g)].map((m) => m[1]!);
    const covered = new Set(COMMAND_CATALOG.map((c) => c.command));
    const missing = cases.filter((c) => !covered.has(c));
    expect(missing).toEqual([]);
  });

  test("every COMMAND_HELP topic is a catalog command", () => {
    for (const topic of Object.keys(COMMAND_HELP)) {
      expect(COMMAND_CATALOG.some((c) => c.command === topic)).toBe(true);
    }
  });

  test("the catalog is deterministic (same object, same order, every run)", () => {
    // Phase 16: the pinned surface grew lawfully — repo/ci/release/center/help/
    // completions are real dispatcher cases with real implementations; the
    // catalog of record now carries all 25 and this pin tracks it exactly.
    expect(COMMAND_CATALOG.map((c) => `${c.family}/${c.command}`)).toEqual([
      "WORKSPACE/init", "WORKSPACE/status", "RUNS/run", "RUNS/resume", "RUNS/explain",
      "RUNS/journal", "HEALTH/doctor", "HEALTH/dev", "INSIGHT/report", "RECOVERY/snapshot",
      "RECOVERY/restore", "MAINTENANCE/clean", "IDENTITY & AI/account", "IDENTITY & AI/ai",
      "DISTRIBUTE/serve", "DISTRIBUTE/package", "DISTRIBUTE/provenance", "LEARN/tour", "LEARN/version",
      "HEALTH/repo", "HEALTH/ci", "DISTRIBUTE/release", "INSIGHT/center", "LEARN/help", "LEARN/completions",
    ]);
  });
});

describe("editor manifest law — the extension surface is internally consistent", () => {
  const VSCODE_DIR = join(ROOT, "editors", "vscode");

  test("the bundled YAML schema is byte-identical to the engine's spec schema", async () => {
    const spec = await readFile(join(ROOT, "spec", "schemas", "vaerion-yaml.schema.json"));
    const bundled = await readFile(join(VSCODE_DIR, "schemas", "vaerion-yaml.schema.json"));
    expect(bundled.equals(spec)).toBe(true);
  });

  test("every contributed command is wired in extension.js; every wired command is contributed", async () => {
    const manifest = JSON.parse(await readFile(join(VSCODE_DIR, "package.json"), "utf8"));
    const extension = await readFile(join(VSCODE_DIR, "extension.js"), "utf8");
    const contributed: string[] = manifest.contributes.commands.map((c: { command: string }) => c.command);
    expect(contributed.length).toBeGreaterThanOrEqual(15);
    const wired = new Set([...extension.matchAll(/"(vaerion\.[a-zA-Z]+)"/g)].map((m) => m[1]));
    for (const id of contributed) {
      expect(wired.has(id)).toBe(true);
    }
    const registered = [...extension.matchAll(/(?:registerCommand|register)\("([^"]+)"/g)].map((m) => m[1]!);
    for (const id of registered) {
      if (!id.startsWith("vaerion.")) continue;
      expect(contributed.includes(id)).toBe(true);
    }
  });

  test("the extension manifest declares the truth about itself", async () => {
    const manifest = JSON.parse(await readFile(join(VSCODE_DIR, "package.json"), "utf8"));
    expect(manifest.main).toBe("./extension.js");
    expect(manifest.engines.vscode.startsWith("^")).toBe(true);
    expect(manifest.version).toBe(VERSION); // version lockstep with the engine
  });

  test("the extension never reads the environment in host code (no secrets law)", async () => {
    const extension = await readFile(join(VSCODE_DIR, "extension.js"), "utf8");
    expect(extension.includes("process.env")).toBe(false);
    for (const file of ["lib/protocol.js", "lib/view.js"]) {
      const src = await readFile(join(VSCODE_DIR, file), "utf8");
      expect(src.includes("keytar")).toBe(false);
      expect(src.toLowerCase().includes("api_key")).toBe(false);
    }
  });
});
