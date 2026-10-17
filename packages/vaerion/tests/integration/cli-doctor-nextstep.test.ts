/**
 * Phase 59.2 — `vae doctor` names the EXACT recovery command for the worst
 * finding (the next-step law).
 *
 * Pins: a green audit carries NO next_step (the byte-stable surface is
 * untouched); a missing config → `vae init`; a torn journal tail →
 * `vae journal recover <RUN_ID>` with the REAL run id interpolated; a
 * mid-file corruption (never a crash artifact) refuses recovery and teaches
 * verification instead; the field is present in both output modes and the
 * NDJSON guarantee holds.
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
    out,
    err,
    io: { out: (l: string) => out.push(l), err: (l: string) => err.push(l), raw: () => undefined, tty: false, columns: 100 },
  };
}

async function freshDir(label: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), `vae-doc-nx-${label}-`));
  rootsToClean.push(dir);
  return dir;
}

/** Doctor in json mode: exit code + the single payload of the last line. */
async function doctorJson(dir: string): Promise<{ code: number; payload: Record<string, unknown>; out: string[] }> {
  const s = captureIo();
  const code = (await runCli(["doctor", "--json"], s.io, dir)).code;
  const payload = JSON.parse(s.out[s.out.length - 1] as string) as Record<string, unknown>;
  return { code, payload, out: s.out };
}

describe("doctor next_step — green audits stay silent", () => {
  test("an all-green workspace carries NO next_step (byte-stable surface)", async () => {
    const dir = await freshDir("green");
    const init = captureIo();
    expect((await runCli(["init", "--template", "demo", "--name", "nx"], init.io, dir)).code).toBe(ExitCode.ok);
    const { code, payload, out } = await doctorJson(dir);
    expect(code).toBe(ExitCode.ok);
    expect(payload["next_step"]).toBeUndefined();
    expect(out.join("\n")).not.toContain("next_step");
  });
});

describe("doctor next_step — the worst finding names its exact recovery command", () => {
  test("missing config → `vae init`", async () => {
    const dir = await freshDir("no-config");
    const { code, payload } = await doctorJson(dir);
    expect(code).toBe(ExitCode.partial);
    expect(payload["next_step"]).toBe("vae init");
    const checks = payload["checks"] as Array<Record<string, unknown>>;
    expect(checks[0]?.["check"]).toBe("config");
    expect(checks[0]?.["ok"]).toBe(false);
  });

  test("torn journal tail → `vae journal recover <RUN_ID>` with the real run id", async () => {
    const dir = await freshDir("torn");
    const s = captureIo();
    expect((await runCli(["init", "--template", "demo", "--name", "nx-torn"], s.io, dir)).code).toBe(ExitCode.ok);
    expect((await runCli(["run", "demo"], captureIo().io, dir)).code).toBe(ExitCode.ok);
    const journalDir = join(dir, ".vaerion", "journal");
    const runId = (await readdir(journalDir)).find((f) => f.endsWith(".ndjson"))!.replace(".ndjson", "");
    // crash mid-append: a partial final line (the chaos suite's torn-tail law)
    const path = join(journalDir, `${runId}.ndjson`);
    await writeFile(path, (await readFile(path, "utf8")) + '{"k":"evt","i":99,"prev":"aa', "utf8");
    const { code, payload } = await doctorJson(dir);
    expect(code).toBe(ExitCode.partial);
    expect(payload["next_step"]).toBe(`vae journal recover ${runId}`);
    // plain mode carries the same line (the human face of the same law)
    const plain = captureIo();
    await runCli(["doctor"], plain.io, dir);
    expect(plain.out.join("\n")).toContain("next_step: vae journal recover");
  });

  test("mid-file corruption (NOT a crash artifact) teaches verification, never recovery", async () => {
    const dir = await freshDir("corrupt");
    const s = captureIo();
    expect((await runCli(["init", "--template", "demo", "--name", "nx-corrupt"], s.io, dir)).code).toBe(ExitCode.ok);
    expect((await runCli(["run", "demo"], captureIo().io, dir)).code).toBe(ExitCode.ok);
    const journalDir = join(dir, ".vaerion", "journal");
    const runId = (await readdir(journalDir)).find((f) => f.endsWith(".ndjson"))!.replace(".ndjson", "");
    const path = join(journalDir, `${runId}.ndjson`);
    const raw = await readFile(path, "utf8");
    const lines = raw.split("\n");
    // tamper INSIDE the receipt payload (same shape, same line) — the
    // chaos-suite corruption law: the chain breaks loudly (E1001) and
    // recovery REFUSES because this is evidence tampering, not a crash tail
    const idx = lines.findIndex((l) => l.includes('"k":"receipt"'));
    expect(idx).toBeGreaterThan(0);
    lines[idx] = (lines[idx] as string).replace("indexed 1 documents", "indexed 9 documents");
    await writeFile(path, lines.join("\n"), "utf8");
    const { code, payload } = await doctorJson(dir);
    expect(code).toBe(ExitCode.partial);
    expect(payload["next_step"]).toBe(`vae journal verify ${runId}`);
  });
});

async function readdir(dir: string): Promise<string[]> {
  const { readdir: rd } = await import("node:fs/promises");
  return rd(dir);
}
