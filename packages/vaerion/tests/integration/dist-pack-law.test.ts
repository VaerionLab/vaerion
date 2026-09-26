/**
 * The distribution pipeline's REFUSAL law (MS-6 installer, negative cases).
 *
 * The green path is proven by tests/integration/installer.test.ts; this
 * suite proves the pipeline FAILS LOUDLY when the artifact would violate the
 * law — a poisoned tree (secret material + entries outside the files law)
 * must produce honest refusals and never a green report. The same law the
 * release gate enforces is the law the tests enforce.
 */

import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { runDistPipeline } from "../../scripts/dist-pack.ts";

const REPO_ROOT = resolve(import.meta.dir, "..", "..", "..");

async function makeFakeEngine(poison: { secret?: boolean; extraEntry?: boolean }): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "vxn-fake-engine-"));
  await mkdir(join(dir, "src"), { recursive: true });
  await writeFile(
    join(dir, "package.json"),
    JSON.stringify(
      {
        name: "@vaerion/engine",
        version: "0.0.0-test",
        private: true,
        type: "module",
        // The real engine's runtime deps — the install step asserts they
        // resolve, so a lawful-but-foreign tree reaches the smoke refusal.
        dependencies: { ajv: "^8.17.1", "hash-wasm": "^4.12.0", yaml: "^2.8.0" },
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );
  await writeFile(join(dir, "src", "ok.ts"), "export const ok = 1;\n", "utf8");
  // A foreign CLI shim: the install-shim check passes, the smoke refuses —
  // the pipeline must never fake a green for an engine that does not run.
  await mkdir(join(dir, "src", "cli"), { recursive: true });
  await writeFile(join(dir, "src", "cli", "vae.ts"), "process.exit(2);\n", "utf8");
  if (poison.secret) {
    // A live-shaped vector (never a real credential — matches the C5 patterns).
    await writeFile(join(dir, "src", "poisoned.ts"), `export const token = "${"ghp_" + "A".repeat(36)}";\n`, "utf8");
  }
  if (poison.extraEntry) {
    await mkdir(join(dir, "fixtures"), { recursive: true });
    await writeFile(join(dir, "fixtures", "leak.json"), "{}\n", "utf8");
  }
  return dir;
}

describe("dist pipeline refusal law", () => {
  test("a poisoned tree is refused: secret material + inventory violation, never green", async () => {
    const fake = await makeFakeEngine({ secret: true, extraEntry: true });
    const outDir = await mkdtemp(join(tmpdir(), "vxn-refuse-"));
    try {
      const report = await runDistPipeline({ engineDir: fake, workspaceRoot: REPO_ROOT, outDir });
      expect(report.ok).toBe(false);
      expect(report.refusals.length).toBeGreaterThan(0);
      const steps = report.refusals.map((r) => r.slice(0, r.indexOf(":")));
      expect(steps).toContain("secrets");
      expect(steps).toContain("inventory");
      // The report is still persisted — evidence, not narration.
      const persisted = await import("node:fs/promises").then((fs) => fs.readFile(join(outDir, "dist-report.json"), "utf8"));
      expect(JSON.parse(persisted).ok).toBe(false);
    } finally {
      await rm(fake, { recursive: true, force: true }).catch(() => undefined);
      await rm(outDir, { recursive: true, force: true }).catch(() => undefined);
    }
  });

  test("a clean-but-foreign tree fails honestly at the smoke step (not a fake green)", async () => {
    // The tree satisfies the files law but is NOT the engine — the smoke must
    // refuse instead of pretending the install works.
    const fake = await makeFakeEngine({});
    const outDir = await mkdtemp(join(tmpdir(), "vxn-smoke-refuse-"));
    try {
      const report = await runDistPipeline({ engineDir: fake, workspaceRoot: REPO_ROOT, outDir });
      expect(report.ok).toBe(false);
      expect(report.refusals.map((r) => r.slice(0, r.indexOf(":")))).toContain("smoke");
      expect(report.refusals.map((r) => r.slice(0, r.indexOf(":")))).not.toContain("secrets");
      expect(report.refusals.map((r) => r.slice(0, r.indexOf(":")))).not.toContain("inventory");
    } finally {
      await rm(fake, { recursive: true, force: true }).catch(() => undefined);
      await rm(outDir, { recursive: true, force: true }).catch(() => undefined);
    }
  });

  test("a directory without a package.json fails the PACK step loudly", async () => {
    const empty = await mkdtemp(join(tmpdir(), "vxn-no-manifest-"));
    const outDir = await mkdtemp(join(tmpdir(), "vxn-pack-fail-"));
    try {
      const report = await runDistPipeline({ engineDir: empty, workspaceRoot: REPO_ROOT, outDir });
      expect(report.ok).toBe(false);
      expect(report.refusals.map((r) => r.slice(0, r.indexOf(":")))).toContain("pack");
      expect(report.tarball.bytes).toBe(0);
    } finally {
      await rm(empty, { recursive: true, force: true }).catch(() => undefined);
      await rm(outDir, { recursive: true, force: true }).catch(() => undefined);
    }
  });
});
