/**
 * dist-pack CLI wrapper — `bun run packages/vaerion/scripts/dist-pack-cli.ts`.
 *
 * Kept separate from the pipeline so the measured library surface
 * (scripts/dist-pack.ts) stays fully test-covered; the release gate and the
 * test gate cannot drift because they import the same functions.
 */

import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { runDistPipeline } from "./dist-pack.ts";

const repoRoot = resolve(import.meta.dir, "..", "..", "..");
const engineDir = join(repoRoot, "packages", "vaerion");
const outDir = await mkdtemp(join(tmpdir(), "vaerion-dist-"));
const report = await runDistPipeline({
  engineDir,
  workspaceRoot: repoRoot,
  outDir,
  log: (l) => console.log(l),
});
console.log(`dist: report written to ${join(outDir, "dist-report.json")}`);
console.log(`dist: ${report.ok ? "PIPELINE GREEN" : `PIPELINE REFUSED (${report.refusals.length})`}`);
process.exit(report.ok ? 0 : 1);
