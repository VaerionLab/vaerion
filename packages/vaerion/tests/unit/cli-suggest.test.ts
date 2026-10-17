/**
 * Phase 59.1 DX — the did-you-mean engine.
 *
 * Pins: edit distance is correct; suggestions are deterministic (catalog
 * order, first-lowest wins); the unknown-command path teaches (`did you
 * mean`) in plain AND --json NDJSON modes; far misses suggest nothing.
 */

import { describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/cli/vae.ts";
import { COMMAND_CATALOG } from "../../src/cli/catalog.ts";
import { editDistance, suggestCommand } from "../../src/cli/suggest.ts";
import { ExitCode } from "../../src/cli/io.ts";

const COMMANDS = COMMAND_CATALOG.map((c) => c.command);

describe("editDistance", () => {
  test("identical strings are distance 0", () => {
    expect(editDistance("journal", "journal")).toBe(0);
  });

  test("classic pairs", () => {
    expect(editDistance("kitten", "sitting")).toBe(3);
    expect(editDistance("abc", "")).toBe(3);
    expect(editDistance("", "abc")).toBe(3);
    expect(editDistance("flaw", "lawn")).toBe(2);
  });

  test("the cap is honored (early exit)", () => {
    expect(editDistance("kitten", "sitting", 2)).toBe(3); // returns cap+1 signal
    expect(editDistance("kitten", "sitting", 3)).toBe(3);
  });
});

describe("suggestCommand", () => {
  test("near misses resolve to the ratified command", () => {
    expect(suggestCommand("journl", COMMANDS)).toBe("journal");
    expect(suggestCommand("iniy", COMMANDS)).toBe("init");
    expect(suggestCommand("vresion", COMMANDS)).toBe("version");
    expect(suggestCommand("creat", COMMANDS)).toBe("create");
    expect(suggestCommand("verrify", COMMANDS)).toBe("verify");
    expect(suggestCommand("strt", COMMANDS)).toBe("start");
    expect(suggestCommand("mcpc", COMMANDS)).toBe("mcp");
  });

  test("deterministic: same input, same suggestion, every run", () => {
    const a = suggestCommand("jounral", COMMANDS);
    const b = suggestCommand("jounral", COMMANDS);
    expect(a).toBe(b);
    expect(a).toBe("journal");
  });

  test("far misses suggest nothing (never a wrong hint)", () => {
    expect(suggestCommand("definitely-not-a-command", COMMANDS)).toBeNull();
    expect(suggestCommand("xyzzy", COMMANDS)).toBeNull();
  });

  test("empty input suggests nothing", () => {
    expect(suggestCommand("", COMMANDS)).toBeNull();
  });
});

describe("the unknown-command path teaches (E1600 + did-you-mean)", () => {
  function capture(tty = false) {
    const out: string[] = [];
    const err: string[] = [];
    return {
      io: { out: (l: string) => out.push(l), err: (l: string) => err.push(l), raw: () => undefined, tty, columns: 100 },
      out,
      err,
    };
  }

  test("plain mode: the suggestion rides the E1600 line", async () => {
    const c = capture();
    const code = (await runCli(["journl"], c.io, mkdtempSync(join(tmpdir(), "vae-suggest-")))).code;
    expect(code).toBe(ExitCode.usage);
    const text = c.err.join("\n");
    expect(text).toContain("E1600");
    expect(text).toContain("unknown command: journl");
    expect(text).toContain("did you mean `journal`?");
    expect(text).toContain("Fix:");
  });

  test("--json mode: ONE stable NDJSON line, suggestion in the message, fix present", async () => {
    const c = capture();
    const code = (await runCli(["iniy", "--json"], c.io, mkdtempSync(join(tmpdir(), "vae-suggest-")))).code;
    expect(code).toBe(ExitCode.usage);
    expect(c.err).toHaveLength(1);
    const parsed = JSON.parse(c.err[0] as string) as { error: { code: string; message: string; fix: string } };
    expect(parsed.error.code).toBe("E1600");
    expect(parsed.error.message).toContain("did you mean `init`?");
    expect(parsed.error.fix.length).toBeGreaterThan(0);
  });

  test("a far miss stays honest: no suggestion is invented", async () => {
    const c = capture();
    const code = (await runCli(["definitely-not-a-command"], c.io, mkdtempSync(join(tmpdir(), "vae-suggest-")))).code;
    expect(code).toBe(ExitCode.usage);
    expect(c.err.join("\n")).not.toContain("did you mean");
  });
});
