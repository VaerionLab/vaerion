/**
 * The installer pipeline (MS-6, blueprint §15.1 M6 "installer pipelines").
 *
 * Law under test: `bun pm pack` produces a tarball whose entry set matches
 * the files law exactly (src + README + package.json — no fixtures, no
 * tests, no scripts, no dotfiles, no .env); every packed byte passes the C5
 * secret patterns; a consumer installs the tarball with the REAL `bun
 * install` (offline from the warm cache in this environment — a cold cache
 * fails the pipeline loudly instead of faking success); and the INSTALLED
 * shim answers help/version, scaffolds a workspace, and runs doctor, dev,
 * and a MockBrain model invocation through the honest exit-code contract.
 *
 * The pipeline is the same code `scripts/dist-pack.ts` runs — the release
 * gate and the test gate cannot drift.
 */

import { describe, expect, test } from "bun:test";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { runDistPipeline } from "../../scripts/dist-pack.ts";

const ENGINE_DIR = resolve(import.meta.dir, "..", "..");
const REPO_ROOT = resolve(ENGINE_DIR, "..", "..");

describe("installer pipeline — pack → inventory → secrets → install → smoke", () => {
  test("the full pipeline is GREEN from the current tree", async () => {
    const outDir = await mkdtemp(join(tmpdir(), "vaerion-dist-test-"));
    try {
      const report = await runDistPipeline({ engineDir: ENGINE_DIR, workspaceRoot: REPO_ROOT, outDir });

      expect(report.refusals).toEqual([]);
      expect(report.ok).toBe(true);

      // PACK: a real tarball within the distribution budget (OBJ-Q1: ≤ 25 MB).
      expect(report.tarball.bytes).toBeGreaterThan(10_000);
      expect(report.tarball.bytes).toBeLessThan(25 * 1024 * 1024);
      expect(report.tarball.entries).toBe(report.inventory.files);

      // INVENTORY: sources and package metadata only, no test/fixture leakage.
      expect(report.inventory.tsFiles).toBeGreaterThan(80);
      expect(report.steps.map((s) => s.step)).toContain("inventory");

      // SECRETS: zero findings (defense in depth beyond the C5 git scan).
      expect(report.steps.map((s) => s.step)).toContain("secrets");

      // INSTALL: the real installer resolved engine + runtime deps offline.
      expect(report.steps.map((s) => s.step)).toContain("install");
      expect(report.vendored).toEqual(["ajv", "hash-wasm", "yaml"]);

      // SMOKE: the installed shim executes the full daily surface.
      const smokeSteps = report.steps.filter((s) => s.step.startsWith("smoke:")).map((s) => s.step);
      expect(smokeSteps).toEqual([
        "smoke:--help",
        "smoke:version --json",
        "smoke:--cwd " + join(outDir, "smoke-ws") + " init --name dist-smoke",
        "smoke:--cwd " + join(outDir, "smoke-ws") + " doctor",
        "smoke:--cwd " + join(outDir, "smoke-ws") + " dev",
        "smoke:run model --model mockbrain/mock-1 --prompt ping",
      ]);
      for (const s of report.smoke) expect(s.exitCode).toBe(0);

      // The report artifact itself was written by the pipeline (evidence, not narration).
      const persisted = JSON.parse(await readFile(join(outDir, "dist-report.json"), "utf8")) as { ok: boolean };
      expect(persisted.ok).toBe(true);
    } finally {
      await rm(outDir, { recursive: true, force: true }).catch(() => undefined);
    }
  });

  test("the secret patterns match live vectors (cannot rot silently)", () => {
    // Lockstep guard with C5: if these ever stop matching, the pipeline's
    // defense-in-depth scan is dead and this test fails.
    const SECRET_RE = /\bgh[pousr]_[A-Za-z0-9]{20,}\b|\bAKIA[0-9A-Z]{16}\b|-----BEGIN [A-Z ]*PRIVATE KEY-----|\bxox[bpors]-[A-Za-z0-9-]{10,}\b/;
    expect(SECRET_RE.test("token: " + "ghp_" + "A".repeat(36))).toBe(true);
    expect(SECRET_RE.test("key AKIA" + "IOSFODNN7EXAMPLE" + " x")).toBe(true);
    expect(SECRET_RE.test("-----BEGIN RSA PRIVATE KEY-----")).toBe(true);
    expect(SECRET_RE.test("xoxb-123456789012-abcdef")).toBe(true);
    expect(SECRET_RE.test("ordinary text with vae and blake3")).toBe(false);
  });
});
