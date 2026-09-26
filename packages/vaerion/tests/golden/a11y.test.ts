/**
 * Accessibility goldens (MS-6 a11y, blueprint §15.1 M6: "a11y NO_COLOR modes;
 * a11y snapshots clean").
 *
 * The Vaerion CLI contract for accessibility, PROVEN here byte-for-byte:
 *
 *  A1. PLAIN TEXT IS THE BASELINE. The renderer never emits ANSI escapes in
 *      any mode, on any surface — so NO_COLOR, TERM=dumb, a non-TTY pipe, and
 *      a screen reader all see exactly the same characters. There is no color
 *      mode to turn off; there is nothing to turn off. (Proven by A1 below.)
 *  A2. STABILITY. The same command in the same state emits byte-identical
 *      output — screen readers, line-indexed tooling, and snapshots can rely
 *      on line order. (Proven by A2 below.)
 *  A3. MACHINE MODE. --json emits stable NDJSON: one JSON object per line,
 *      every line independently parseable. (Proven by A3 below.)
 *  A4. GOVERNED SURFACES. Help text, version output, and the error contract
 *      (code + Fix line) are golden fixtures under VAE_BLESS governance —
 *      any wording change is a reviewed contract change. (A4.)
 *
 * Goldens regenerate ONLY via `VAE_BLESS=1 bun test tests/golden/a11y.test.ts`.
 */

import { afterAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli, MAIN_HELP, COMMAND_HELP, VERSION } from "../../src/cli/vae.ts";
import type { CliIo } from "../../src/cli/io.ts";

const FIXTURE_DIR = join(import.meta.dir, "..", "..", "fixtures", "golden", "a11y");
const BLESS = process.env.VAE_BLESS === "1";

const HELP_TOPICS = Object.keys(COMMAND_HELP).sort();

async function capture(ws: string, args: string[]): Promise<{ code: number; out: string; err: string }> {
  let out = "";
  let err = "";
  const io: CliIo = { out: (l) => { out += l + "\n"; }, err: (l) => { err += l + "\n"; } };
  const { code } = await runCli(args, io, ws);
  return { code, out, err };
}

async function golden(name: string, actual: string): Promise<void> {
  const file = join(FIXTURE_DIR, name);
  if (BLESS) {
    const { writeFile: w, mkdir: md } = await import("node:fs/promises");
    await md(FIXTURE_DIR, { recursive: true });
    await w(file, actual, "utf8");
    return;
  }
  const expected = await readFile(file, "utf8");
  expect(`${name}\n${actual}`).toBe(`${name}\n${expected}`);
}

const workspaces: string[] = [];
afterAll(async () => {
  for (const ws of workspaces) await rm(ws, { recursive: true, force: true }).catch(() => undefined);
});

async function freshWorkspace(): Promise<string> {
  const ws = await mkdtemp(join(tmpdir(), "vae-a11y-"));
  workspaces.push(ws);
  await writeFile(join(ws, "vaerion.yaml"), `schemaVersion: "0.1"\nproject:\n  name: a11y\npackage:\n  include:\n    - docs\ntelemetry:\n  enabled: false\n`, "utf8");
  await mkdir(join(ws, "docs"), { recursive: true });
  await writeFile(join(ws, "docs", "a.md"), "# A\n", "utf8");
  await mkdir(join(ws, ".vaerion", "journal"), { recursive: true });
  await mkdir(join(ws, ".vaerion", "blobs"), { recursive: true });
  return ws;
}

describe("a11y A4 — governed surfaces are golden fixtures", () => {
  test("main help is byte-stable", async () => {
    await golden("main-help.golden.txt", MAIN_HELP);
  });

  test("every command help topic is byte-stable", async () => {
    for (const topic of HELP_TOPICS) {
      await golden(`help-${topic}.golden.txt`, COMMAND_HELP[topic] as string);
    }
  });

  test("version line is byte-stable", async () => {
    const ws = await freshWorkspace();
    const r = await capture(ws, ["version"]);
    expect(r.code).toBe(0);
    expect(r.err).toBe("");
    await golden("version.golden.txt", r.out);
    expect(r.out).toBe(`vae ${VERSION}\n`);
  });

  test("the error contract (code + Fix) is byte-stable in both modes", async () => {
    const ws = await freshWorkspace();
    const unknown = await capture(ws, ["definitely-not-a-command"]);
    expect(unknown.code).toBe(2);
    await golden("error-unknown-command.golden.txt", unknown.err);
    const unknownJson = await capture(ws, ["definitely-not-a-command", "--json"]);
    expect(unknownJson.code).toBe(2);
    await golden("error-unknown-command.json.golden.txt", unknownJson.err);
    const missing = await capture(ws, ["run", "research"]);
    expect(missing.code).toBe(2);
    await golden("error-missing-flag.golden.txt", missing.err);
  });
});

describe("a11y A1 — zero ANSI across the command matrix", () => {
  const MATRIX: Array<{ name: string; args: string[]; json?: boolean }> = [
    { name: "help", args: ["--help"] },
    { name: "version", args: ["version"] },
    { name: "dev", args: ["dev"] },
    { name: "doctor", args: ["doctor"] },
    { name: "journal-ls", args: ["journal", "ls"] },
    { name: "package-help", args: ["package", "--help"] },
    { name: "unknown-command", args: ["nope"] },
    { name: "dev-json", args: ["dev", "--json"], json: true },
    { name: "doctor-json", args: ["doctor", "--json"], json: true },
    { name: "unknown-json", args: ["nope", "--json"], json: true },
  ];

  test("no ANSI escape bytes in any captured surface (plain, json, stdout, stderr)", async () => {
    const ws = await freshWorkspace();
    for (const item of MATRIX) {
      const r = await capture(ws, item.args);
      expect(r.out).not.toMatch(/\x1b/);
      expect(r.err).not.toMatch(/\x1b/);
    }
  });

  test("the REAL process surface honors NO_COLOR/TERM=dumb over a pipe (spawned shim)", async () => {
    const ws = await freshWorkspace();
    for (const args of [["--help"], ["version"], ["nope"]]) {
      const proc = Bun.spawnSync(["bun", join(import.meta.dir, "..", "..", "src", "cli", "vae.ts"), ...args], {
        cwd: ws,
        env: { ...process.env, NO_COLOR: "1", TERM: "dumb", FORCE_COLOR: "0" },
        stdout: "pipe",
        stderr: "pipe",
      });
      const text = new TextDecoder().decode(proc.stdout) + new TextDecoder().decode(proc.stderr);
      expect(text).not.toMatch(/\x1b/);
    }
  });
});

describe("a11y A2 — determinism: identical state ⇒ byte-identical output", () => {
  test("dev and doctor double-runs are byte-identical (plain and json)", async () => {
    const ws = await freshWorkspace();
    for (const args of [["dev"], ["doctor"], ["dev", "--json"], ["doctor", "--json"]]) {
      const r1 = await capture(ws, args);
      const r2 = await capture(ws, args);
      expect(r1.out).toBe(r2.out);
      expect(r1.err).toBe(r2.err);
    }
  });
});

describe("a11y A3 — --json is stable NDJSON (one parseable object per line)", () => {
  test("every --json line parses independently", async () => {
    const ws = await freshWorkspace();
    for (const args of [["version", "--json"], ["dev", "--json"], ["doctor", "--json"]]) {
      const r = await capture(ws, args);
      expect(r.code).toBe(0);
      const lines = r.out.split("\n").filter((l) => l.length > 0);
      expect(lines.length).toBeGreaterThan(0);
      for (const line of lines) {
        expect(() => JSON.parse(line)).not.toThrow();
      }
    }
  });
});
