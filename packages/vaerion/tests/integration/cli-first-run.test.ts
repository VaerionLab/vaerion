/**
 * The empty-laptop experience — bare `vae` welcome + `vae tour` (ASC XVIII Phase 2).
 *
 * Contracts pinned here:
 *  - bare `vae` is the front door (exit 0 in EVERY profile — the exit code
 *    must not depend on whether a human or a pipe is asking);
 *  - `--json` emits ONE pure JSON line (the old non-JSON leak is dead);
 *  - rich is panel-disciplined (visible-width law) and TTY-gated;
 *  - unknown commands are still E1600 exit 2 (the boundary did not move);
 *  - a tour is read-only by law: deterministic, no workspace needed.
 */

import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli, VERSION } from "../../src/cli/vae.ts";
import { ExitCode } from "../../src/cli/io.ts";

const workspaces: string[] = [];
afterAll(async () => {
  for (const ws of workspaces) await rm(ws, { recursive: true, force: true }).catch(() => undefined);
});

const CONFIG_YAML = `schemaVersion: "0.1"
project:
  name: first-run
  description: "welcome state detection"
telemetry:
  enabled: false
`;

const RICH_COLUMNS = 100;

function richIo() {
  const out: string[] = [];
  const err: string[] = [];
  return {
    out: (l: string): void => void out.push(l),
    err: (l: string): void => void err.push(l),
    raw: (): void => undefined,
    tty: true,
    columns: RICH_COLUMNS,
    lines: { out, err },
  };
}

async function withRichEnv<T>(fn: () => Promise<T>): Promise<T> {
  const prev = process.env.VAE_UI;
  process.env.VAE_UI = "rich";
  try {
    return await fn();
  } finally {
    if (prev === undefined) delete process.env.VAE_UI;
    else process.env.VAE_UI = prev;
  }
}

/** Visible length (ANSI-free) — the alignment assertions measure this. */
function visible(s: string): number {
  return s.replace(/\u001b\[[0-9;]*m/g, "").length;
}

function assertPanelsDisciplined(lines: string[]): void {
  let block: string[] = [];
  const flush = (): void => {
    if (block.length >= 2 && block[0]!.startsWith("╭") && block[block.length - 1]!.startsWith("╰")) {
      const widths = new Set(block.map(visible));
      expect(widths.size).toBe(1);
    }
    for (const l of block) expect(visible(l)).toBeLessThanOrEqual(RICH_COLUMNS);
    block = [];
  };
  for (const line of lines) {
    if (line.startsWith("│") || line.startsWith("╭") || line.startsWith("╰")) block.push(line);
    else flush();
  }
  flush();
  expect(lines.length).toBeGreaterThan(0);
}

describe("bare `vae` — the welcome front door", () => {
  test("plain (fresh directory): exit 0, structured welcome, no E1600", async () => {
    const out: string[] = [];
    const err: string[] = [];
    const fresh = await mkdtemp(join(tmpdir(), "vaerion-first-fresh-"));
    workspaces.push(fresh);
    const result = await runCli([], { out: (l) => out.push(l), err: (l) => err.push(l) }, fresh);
    expect(result.code).toBe(ExitCode.ok);
    expect(err).toEqual([]);
    const text = out.join("\n");
    expect(text).toContain("command: welcome");
    expect(text).toContain(`version: ${VERSION}`);
    expect(text).toContain("state: fresh");
    expect(text).toContain("vae tour");
    expect(text).not.toContain("E1600");
  });

  test("--json: ONE pure JSON line with the welcome payload", async () => {
    const out: string[] = [];
    const fresh = await mkdtemp(join(tmpdir(), "vaerion-first-json-"));
    workspaces.push(fresh);
    const result = await runCli(["--json"], { out: (l) => out.push(l), err: () => undefined }, fresh);
    expect(result.code).toBe(ExitCode.ok);
    expect(out).toHaveLength(1);
    const payload = JSON.parse(out[0]!) as Record<string, unknown>;
    expect(payload.command).toBe("welcome");
    expect(payload.version).toBe(VERSION);
    expect(Array.isArray(payload.next)).toBe(true);
    expect((payload.next as string[]).length).toBeGreaterThanOrEqual(3);
    expect(payload.state).toBe("fresh");
  });

  test("inside a workspace the state flips to workspace and the suggestions adapt", async () => {
    const ws = await mkdtemp(join(tmpdir(), "vaerion-first-"));
    workspaces.push(ws);
    await writeFile(join(ws, "vaerion.yaml"), CONFIG_YAML, "utf8");
    const out: string[] = [];
    const result = await runCli(["--json"], { out: (l) => out.push(l), err: () => undefined }, ws);
    expect(result.code).toBe(ExitCode.ok);
    const payload = JSON.parse(out[0]!) as Record<string, unknown>;
    expect(payload.state).toBe("workspace");
    const next = payload.next as string[];
    expect(next.some((c) => c.startsWith("vae doctor"))).toBe(true);
    expect(next.some((c) => c.startsWith("vae init —"))).toBe(false);
  });

  test("rich (TTY): brand banner, disciplined panels, environment rows, footer", async () => {
    await withRichEnv(async () => {
      const io = richIo();
      const result = await runCli([], io, process.cwd());
      expect(result.code).toBe(ExitCode.ok);
      const text = io.lines.out.join("\n");
      expect(text).toContain("V A E R I O N");
      expect(text).toContain("Welcome to Vaerion");
      expect(text).toContain("Your environment");
      expect(text).toContain("Start here");
      assertPanelsDisciplined(io.lines.out);
    });
  });

  test("the boundary did not move: unknown commands are still E1600 exit 2", async () => {
    const err: string[] = [];
    const result = await runCli(["definitely-not-a-command"], { out: () => undefined, err: (l) => err.push(l) }, process.cwd());
    expect(result.code).toBe(ExitCode.usage);
    expect(err.join("\n")).toContain("E1600");
  });
});

describe("`vae tour` — the guided first run", () => {
  test("plain: exit 0, nine steps, concrete commands, read-only note", async () => {
    const out: string[] = [];
    const result = await runCli(["tour"], { out: (l) => out.push(l), err: () => undefined }, process.cwd());
    expect(result.code).toBe(ExitCode.ok);
    const text = out.join("\n");
    expect(text).toContain("command: tour");
    expect(text).toContain("vae init");
    expect(text).toContain("vae doctor");
    expect(text).toContain("vae provenance <ARTIFACT>");
  });

  test("--json: one line, steps array fully typed (n/title/detail/command)", async () => {
    const out: string[] = [];
    const result = await runCli(["tour", "--json"], { out: (l) => out.push(l), err: () => undefined }, process.cwd());
    expect(result.code).toBe(ExitCode.ok);
    expect(out).toHaveLength(1);
    const payload = JSON.parse(out[0]!) as { command: string; version: string; steps: Array<Record<string, unknown>> };
    expect(payload.command).toBe("tour");
    expect(payload.version).toBe(VERSION);
    expect(payload.steps).toHaveLength(9);
    for (const s of payload.steps) {
      expect(typeof s.n).toBe("number");
      expect(typeof s.title).toBe("string");
      expect((s.detail as string).length).toBeGreaterThan(10);
      expect((s.command as string).length).toBeGreaterThan(3);
    }
    expect(payload.steps[8]!.command).toBe("vae serve --help");
  });

  test("rich (TTY): intro + nine step panels + next panel, all disciplined", async () => {
    await withRichEnv(async () => {
      const io = richIo();
      const result = await runCli(["tour"], io, process.cwd());
      expect(result.code).toBe(ExitCode.ok);
      const text = io.lines.out.join("\n");
      expect(text).toContain("The guided tour");
      expect(text).toContain("read-only by law");
      expect(text).toContain("$ vae init");
      expect(text).toContain("Where to go next");
      assertPanelsDisciplined(io.lines.out);
    });
  });

  test("--help teaches the tour without executing (Guarantee #1)", async () => {
    const out: string[] = [];
    const result = await runCli(["tour", "--help"], { out: (l) => out.push(l), err: () => undefined }, process.cwd());
    expect(result.code).toBe(ExitCode.ok);
    const text = out.join("\n");
    expect(text).toContain("vae tour");
    expect(text).toContain("Read-only by law");
    expect(text).not.toContain("command: tour");
  });
});
