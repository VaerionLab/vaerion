/**
 * @vaerion/sdk — minimal in-process journey (the README's "Minimal example",
 * runnable). Init → research → verify → receipt, entirely in-process over
 * the same engine contract the CLI drives. No network, no daemon.
 *
 * Run: bun run sdks/typescript/examples/quickstart.ts
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { VaeClient } from "../src/index.ts";

const ws = await mkdtemp(join(tmpdir(), "vae-sdk-quickstart-"));

try {
  // A document for the research pipeline to index.
  mkdirSync(join(ws, "docs"), { recursive: true });
  writeFileSync(
    join(ws, "docs", "one.md"),
    "# One\nThe journal is append-only and blake3 hash chained.\n",
  );

  const vae = new VaeClient({ cwd: ws }); // in-process binding — §1(a)

  // 1. Scaffold the governed workspace (vaerion.yaml + .vaerion/ stores).
  await vae.init("quickstart");

  // 2. The journaled research pipeline: index declared sources, answer, close.
  const run = await vae.runResearch({
    sources: ["./docs"],
    query: "journal deterministic",
    maxDocs: 4,
  });

  console.log("run_id          :", run.runId);
  console.log("documents       :", run.documents);
  console.log("journalVerified :", run.journalVerified);

  // 3. Verification is a first-class SDK surface (same fold the CLI performs).
  const report = await vae.journalVerify(run.runId);
  console.log("journalVerify.ok:", report.ok);

  // 4. The receipt — the terminal journal record of the closed run.
  const records = await vae.journalRecords(run.runId);
  const receipt = records[records.length - 1];
  console.log("last record kind:", receipt?.k); // "receipt"

  // 5. Refusals (if any) are evidence, not errors to hide — their chain verifies.
  const refusals = await vae.verifyRefusals();
  console.log("refusal log ok  :", refusals.ok);
} finally {
  await rm(ws, { recursive: true, force: true });
}
