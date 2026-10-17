/**
 * THE ARTIFACT PARITY GATE — Phase 61.1 (the one-true-artifact law).
 *
 * Phase 61.0 proved the P0: npm `0.1.14-rc1` and the tree `0.1.14-rc1` were
 * TWO DIFFERENT ENGINES — the published artifact lacked verify/create/start/
 * mcp, the did-you-mean system, and 4 of 7 templates, and still shipped the
 * dead CLI files the tree had deleted. This gate makes that class of failure
 * impossible to commit silently:
 *
 *   1. the dispatch surface of record (29 commands) is pinned — and equals
 *      the site facts of record, so a command can never disappear from the
 *      engine and the website claims at the same time without a failure;
 *   2. the template registry of record (7 templates) matches the site facts;
 *   3. the did-you-mean module exists and is wired into the E1600 path;
 *   4. the dead CLI files of the stale artifact stay dead;
 *   5. the docs of record only teach commands the dispatch actually has;
 *   6. the site facts version and error-code count equal the engine's
 *      (website claims cannot drift from source).
 *
 * Tarball-level parity (the PACKED artifact equals the tree — the exact
 * failure mode of Phase 61.0) is proven by tools/verify-artifact-parity.ts,
 * which the release workflow runs as a hard gate before any publish.
 */

import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");

const readRepo = async (rel: string): Promise<string> => readFile(join(ROOT, rel), "utf8");

const cliSource = await readRepo("packages/vaerion/src/cli/vae.ts");
const VERSION = cliSource.match(/export const VERSION = "([^"]+)"/)?.[1] ?? "";

/** The pinned dispatch surface of record — the 29 commands of `vae`. */
const PINNED_COMMANDS = [
  "init", "create", "start", "status", "report", "clean",
  "run", "resume", "explain", "verify", "journal",
  "doctor", "dev", "serve", "mcp",
  "package", "snapshot", "restore", "provenance",
  "repo", "ci", "release", "tour", "account", "ai", "center",
  "completions", "help", "version",
] as const;

/** The pinned template registry of record. */
const PINNED_TEMPLATES = ["minimal", "demo", "agent", "tool", "automation", "multi-agent", "enterprise"] as const;

describe("artifact parity — SOURCE = PACKAGE = DOCUMENTATION = WEBSITE CLAIMS", () => {
  test("the dispatch surface is exactly the pinned 29 commands", () => {
    const cases = [...cliSource.matchAll(/case "([a-z]+)"/g)].map((m) => m[1]);
    expect(new Set(cases).size).toBe(PINNED_COMMANDS.length);
    for (const cmd of PINNED_COMMANDS) {
      expect(cases).toContain(cmd);
    }
  });

  test("the dispatch surface equals the site facts of record", async () => {
    const facts = await readRepo("src/components/site/facts.ts");
    const listed = facts.match(/commands: \[([^\]]+)\]/)?.[1] ?? "";
    const names = [...listed.matchAll(/"([a-z]+)"/g)].map((m) => m[1]);
    expect(names.sort()).toEqual([...PINNED_COMMANDS].sort());
  });

  test("the template registry is exactly the pinned 7 templates — and matches the site facts", async () => {
    const { INIT_TEMPLATES } = await import("../../src/config/templates.ts");
    const keys = Object.keys(INIT_TEMPLATES);
    expect(keys.sort()).toEqual([...PINNED_TEMPLATES].sort());
    const facts = await readRepo("src/components/site/facts.ts");
    const listed = facts.match(/templates: \[([^\]]+)\]/)?.[1] ?? "";
    const names = [...listed.matchAll(/"([a-z-]+)"/g)].map((m) => m[1]);
    expect(names.sort()).toEqual([...PINNED_TEMPLATES].sort());
  });

  test("did-you-mean exists and is wired into the E1600 path", () => {
    expect(existsSync(join(ROOT, "packages/vaerion/src/cli/suggest.ts"))).toBe(true);
    expect(cliSource).toContain('import { suggestCommand } from "./suggest.ts"');
    expect(cliSource).toContain("did you mean");
  });

  test("the dead CLI files of the stale artifact stay dead", () => {
    // Phase 61.0: the published 0.1.14-rc1 artifact still shipped these.
    expect(existsSync(join(ROOT, "packages/vaerion/src/cli/center.ts"))).toBe(false);
    expect(existsSync(join(ROOT, "packages/vaerion/src/cli/templates.ts"))).toBe(false);
  });

  test("the docs of record only teach commands the dispatch actually has", async () => {
    const quickstart = await readRepo("docs/QUICKSTART.md");
    const readme = await readRepo("README.md");
    const cases = new Set([...cliSource.matchAll(/case "([a-z]+)"/g)].map((m) => m[1]));
    for (const [name, text] of [["docs/QUICKSTART.md", quickstart], ["README.md", readme]] as const) {
      const taught = [...text.matchAll(/`vae\s+([a-z][a-z-]*)/g)].map((m) => m[1]);
      const unknown = [...new Set(taught)].filter((cmd) => !cases.has(cmd));
      expect(unknown).toEqual([]);
      expect(name).toBeDefined();
    }
  });

  test("the site facts version and error-code count equal the engine's", async () => {
    const facts = await readRepo("src/components/site/facts.ts");
    const factsVersion = facts.match(/version: "([^"]+)"/)?.[1];
    expect(factsVersion).toBe(VERSION);
    const { ERROR_CATALOG } = await import("../../src/kernel/errors.ts");
    const engineCodes = Object.keys(ERROR_CATALOG).length;
    const factsEcades = Number(facts.match(/ecodes: (\d+)/)?.[1]);
    expect(factsEcades).toBe(engineCodes);
    // the catalog of record (spec/errors.yaml) mirrors the runtime catalog
    const yaml = await readRepo("spec/errors.yaml");
    const yamlCodes = [...yaml.matchAll(/^  (E\d{4}):$/gm)].length;
    expect(yamlCodes).toBe(engineCodes);
  });

  test("install-honesty is pinned: the registry-lag disclosure ships on every teach-install surface (Phase 61.2)", async () => {
    // Phase 61.2: three living surfaces silently taught `npm install -g
    // vaerion@rc` while the registry still serves the OLD engine. The
    // disclosure is now part of the docs of record — and if any of these
    // surfaces loses it, the gate refuses (the class cannot regress).
    const PINS: Array<[string, string]> = [
      ["README.md", "the npm registry delivers the current engine"],
      ["docs/QUICKSTART.md", "the npm registry delivers the current engine"],
      ["docs/getting-started/installation.md", "Founder-gated"],
      ["integrations/mcp/README.md", "no `mcp` command"],
    ];
    for (const [rel, anchor] of PINS) {
      const text = await readRepo(rel);
      expect(text).toContain(anchor);
    }
    // The launcher's taught refusal must be real, not folklore: a machine
    // without Bun reaches the E1600 body (node-executable shebang), matching
    // the taught-error promise in docs/getting-started/installation.md.
    const shim = await readRepo("packaging/npm/bin/vae.js");
    expect(shim.startsWith("#!/usr/bin/env node")).toBe(true);
    expect(shim).toContain("E1600");
    // The corrected "N-code" claims in the prose of record are tied to the
    // engine's actual catalog size — they cannot silently go stale again.
    const yaml = await readRepo("spec/errors.yaml");
    const codeCount = [...yaml.matchAll(/^  (E\d{4}):$/gm)].length;
    const readme = await readRepo("README.md");
    expect(readme).toContain(`${codeCount}-code E-diagnostics`);
    const standard = await readRepo("VAERION_SDK_STANDARD.md");
    expect(standard).toContain(`${codeCount} codes in \`ERROR_CATALOG\``);
    const engineApi = await readRepo("docs/reference/engine-api.md");
    expect(engineApi).toContain(`(${codeCount} codes`);
  });

  test("the completeness anchor of record ships in the tree (E1010)", async () => {
    const errors = await readRepo("packages/vaerion/src/kernel/errors.ts");
    expect(errors).toContain("E1010");
    const verify = await readRepo("packages/vaerion/src/journal/verify.ts");
    expect(verify).toContain("completeness anchor");
    const attackSuite = existsSync(join(ROOT, "packages/vaerion/tests/security/journal-completeness.test.ts"));
    expect(attackSuite).toBe(true);
  });
});
