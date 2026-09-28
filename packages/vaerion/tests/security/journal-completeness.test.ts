/**
 * PHASE 51 — journal completeness attack suite.
 *
 * The Phase 50 war simulation found W-1: tail deletion passed verification.
 * This suite proves the completeness anchor (E1010) closes that gap and that
 * every other attack family stays blocked. Scenario 4 (middle deletion +
 * full re-chain) is the strongest case: chain checks alone cannot see it —
 * only the receipt's embedded head commitment can.
 *
 * Attack table (mission Part 4):
 *   1. semantic forgery          → BLOCKED (E1001)
 *   2. hash corruption           → BLOCKED (E1001)
 *   3. tail deletion             → BLOCKED (E1010)   [was W-1]
 *   4. middle deletion + rechain → BLOCKED (E1010)
 *   5. receipt mismatch          → BLOCKED (E1001 / E1010)
 *   6. normal operation          → PASS (anchored, complete)
 * plus compatibility: recovery re-certification, torn-receipt recovery,
 * in-flight journals (no false positives), and redacted exports.
 */

import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FixedClock, SeededRng } from "../../src/kernel/clock.ts";
import { SeededIdGen, crn } from "../../src/kernel/ids.ts";
import { RunHarness } from "../../src/runtime/run.ts";
import { readJournal } from "../../src/journal/reader.ts";
import { verifyJournal } from "../../src/journal/verify.ts";
import { recoverJournal } from "../../src/journal/recovery.ts";
import { exportRedacted } from "../../src/journal/export.ts";
import { sealRecord, GENESIS_HASH } from "../../src/journal/hashchain.ts";
import type { JournalRecord } from "../../src/journal/records.ts";

const ws = await mkdtemp(join(tmpdir(), "vae-p51-security-"));
const clock = new FixedClock(1735689600000);
const idGen = new SeededIdGen(() => clock.nowMs(), new SeededRng(51));

afterAll(async () => {
  await rm(ws, { recursive: true, force: true });
});

/** Build a real closed run (header → events → run.closed → terminal receipt). */
async function makeClosedRun(label: string): Promise<{ runId: string; journalPath: string; records: JournalRecord[] }> {
  const runId = crn("run", idGen.next());
  const harness = await RunHarness.create({ workspaceDir: ws, runId, traceId: `t_p51_${label}`, configFingerprint: "cfg_fp_p51_security", clock, idGen });
  await harness.emit("run.state.changed", { to: "working" });
  await harness.emit("run.state.changed", { to: "almost-done" });
  const { verify } = await harness.close(`${label}: measured, not promised`);
  expect(verify.ok).toBe(true);
  const journalPath = RunHarness.journalPathFor(ws, runId);
  const read = await readJournal(journalPath);
  return { runId, journalPath, records: read.records };
}

async function rewriteJournal(journalPath: string, records: JournalRecord[]): Promise<void> {
  const text = records.map((r) => JSON.stringify(r)).join("\n") + "\n";
  await writeFile(journalPath, text, "utf8");
}

/** Deterministic full re-chain after surgical mutation (the strong attacker). */
async function rechain(records: JournalRecord[]): Promise<JournalRecord[]> {
  let prev: string = GENESIS_HASH;
  const out: JournalRecord[] = [];
  for (let idx = 0; idx < records.length; idx++) {
    const rec = records[idx] as JournalRecord;
    const { hash: _stale, ...rest } = rec;
    const sealed = await sealRecord({ ...rest, i: idx + 1, prev } as Parameters<typeof sealRecord>[0]);
    out.push(sealed);
    prev = sealed.hash;
  }
  return out;
}

describe("PHASE 51 — completeness anchor: attack suite", () => {
  test("6. normal operation: closed run verifies anchored and complete", async () => {
    const { journalPath } = await makeClosedRun("normal");
    const report = await verifyJournal(journalPath);
    expect(report.ok).toBe(true);
    expect(report.anchored).toBe(true);
    expect(report.complete).toBe(true);
    expect(report.issues.length).toBe(0);
  });

  test("1. semantic forgery (body edited + re-hashed) → BLOCKED at the chain", async () => {
    const { journalPath, records } = await makeClosedRun("forgery");
    // Forge an evt record: change its claim AND recompute its own hash (the
    // competent liar). The successor's prev still points at the OLD hash.
    const evtIdx = records.findIndex((r) => r.k === "evt");
    const forged: JournalRecord[] = records.map((r, i) => {
      if (i !== evtIdx || r.k !== "evt") return r;
      const { hash: _h, ...rest } = r;
      return { ...rest, env: { ...r.env, payload: { to: "FORGED-BY-ATTACKER" } } } as unknown as JournalRecord;
    });
    // re-seal ONLY the forged record (keep its original prev and index)
    const victim = forged[evtIdx] as JournalRecord;
    const { hash: _h2, ...unsealed } = victim;
    forged[evtIdx] = await sealRecord(unsealed as unknown as Parameters<typeof sealRecord>[0]);
    await rewriteJournal(journalPath, forged);
    const report = await verifyJournal(journalPath);
    expect(report.ok).toBe(false);
    expect(report.issues[0]?.code).toBe("E1001");
  });

  test("2. hash corruption (recorded hash flipped) → BLOCKED", async () => {
    const { journalPath, records } = await makeClosedRun("corruption");
    const victim = records[2] as JournalRecord;
    const corrupted = records.map((r, i) => (i === 2 ? { ...r, hash: ("deadbeef" + victim.hash.slice(8)) as typeof victim.hash } : r)) as JournalRecord[];
    await rewriteJournal(journalPath, corrupted);
    const report = await verifyJournal(journalPath);
    expect(report.ok).toBe(false);
    expect(report.issues[0]?.code).toBe("E1001");
  });

  test("3. tail deletion (the Phase 50 W-1 attack) → BLOCKED by E1010", async () => {
    const { journalPath, records } = await makeClosedRun("tail-deletion");
    expect(records[records.length - 1]?.k).toBe("receipt"); // the anchor is the terminal record
    const truncated = records.slice(0, -1); // clean deletion — not torn, chain intact
    await rewriteJournal(journalPath, truncated);
    const report = await verifyJournal(journalPath);
    expect(report.ok).toBe(false);
    expect(report.complete).toBe(false);
    expect(report.issues[0]?.code).toBe("E1010");
    expect(report.issues[0]?.message).toContain("completeness anchor missing");
  });

  test("4a. middle deletion of an event + FULL re-chain → BLOCKED (seq gap)", async () => {
    const { journalPath, records } = await makeClosedRun("middle-deletion");
    const surgically = records.filter((_, i) => i !== 3); // drop an internal evt (seq gap results)
    const resealed = await rechain(surgically); // recompute every hash — chain is perfect
    await rewriteJournal(journalPath, resealed);
    const report = await verifyJournal(journalPath);
    expect(report.ok).toBe(false);
    // layered defense: the seq-gap check fires first for evt deletions
    const code = report.issues[0]?.code ?? "";
    expect(["E1005", "E1010"]).toContain(code);
  });

  test("4b. deletion of run.closed + FULL re-chain → BLOCKED by receipt count commitment (E1010)", async () => {
    const { journalPath, records } = await makeClosedRun("closed-deletion");
    const closedIdx = records.findIndex((r) => r.k === "evt" && r.env.type === "run.closed");
    expect(closedIdx).toBeGreaterThan(0);
    const surgically = records.filter((_, i) => i !== closedIdx); // remaining evts stay gapless
    const resealed = await rechain(surgically);
    await rewriteJournal(journalPath, resealed);
    const report = await verifyJournal(journalPath);
    expect(report.ok).toBe(false);
    expect(report.issues[0]?.code).toBe("E1010");
    expect(report.issues[0]?.message).toContain("completeness anchor mismatch");
  });

  test("4c. record substitution + FULL re-chain → BLOCKED by receipt head commitment (E1010)", async () => {
    // The pure V2 case: same record COUNT (so V1 passes) but different
    // content — only the receipt's embedded head commitment can catch it.
    const { journalPath, records } = await makeClosedRun("substitution");
    expect(records[0]?.k).toBe("meta");
    const substituted = records.map((r, i) => {
      if (i !== 0) return r;
      const rec = r as Extract<JournalRecord, { k: "meta" }>;
      return { ...rec, engine_version: "0.0.0-ATTACKER" } as JournalRecord; // same shape, new content
    });
    const resealed = await rechain(substituted);
    await rewriteJournal(journalPath, resealed);
    const report = await verifyJournal(journalPath);
    expect(report.ok).toBe(false);
    expect(report.issues[0]?.code).toBe("E1010");
    expect(report.issues[0]?.message).toContain("certified tail was replaced");
  });

  test("5a. receipt count claim edited in place → BLOCKED (content hash)", async () => {
    const { journalPath, records } = await makeClosedRun("receipt-claim");
    const last = records.length - 1;
    const victim = records[last] as JournalRecord & { receipt: { journal: { records: number } } };
    const edited = records.map((r, i) =>
      i === last
        ? ({ ...r, receipt: { ...victim.receipt, journal: { ...victim.receipt.journal, records: victim.receipt.journal.records - 1 } } } as unknown as JournalRecord)
        : r,
    ) as JournalRecord[];
    await rewriteJournal(journalPath, edited);
    const report = await verifyJournal(journalPath);
    expect(report.ok).toBe(false);
    expect(report.issues[0]?.code).toBe("E1001");
  });

  test("5b. receipt claim edited AND re-sealed → BLOCKED (E1010 anchor mismatch)", async () => {
    const { journalPath, records } = await makeClosedRun("receipt-claim-2");
    const last = records.length - 1;
    const victim = records[last] as JournalRecord & { receipt: { journal: { records: number } } };
    const tampered = records.map((r, i) =>
      i === last
        ? ({ ...r, receipt: { ...victim.receipt, journal: { ...victim.receipt.journal, records: 1 } } } as unknown as JournalRecord)
        : r,
    ) as JournalRecord[];
    const { hash: _h, ...unsealedLast } = tampered[last] as JournalRecord;
    tampered[last] = await sealRecord(unsealedLast as unknown as Parameters<typeof sealRecord>[0]);
    await rewriteJournal(journalPath, tampered);
    const report = await verifyJournal(journalPath);
    expect(report.ok).toBe(false);
    expect(report.issues[0]?.code).toBe("E1010");
    expect(report.issues[0]?.message).toContain("completeness anchor mismatch");
  });

  test("compat: recovery after receipt lost to torn tail re-certifies and verifies", async () => {
    const { runId, journalPath, records } = await makeClosedRun("torn-receipt");
    // Crash simulation: the terminal receipt is half-written.
    const truncated = records.slice(0, -1);
    await rewriteJournal(journalPath, truncated);
    const current = await readFile(journalPath, "utf8");
    await writeFile(journalPath, current + '{"k":"receipt","receipt":{"run_i', "utf8"); // torn tail
    const recovery = await recoverJournal(journalPath, runId, "cfg_fp_p51_security", clock);
    expect(recovery.tornTailRemoved).toBe(true);
    expect(recovery.recertified).toBe(true); // the new law: recovery re-certifies
    const report = await verifyJournal(journalPath);
    expect(report.ok).toBe(true);
    expect(report.anchored).toBe(true);
    expect(report.complete).toBe(true);
  });

  test("compat: in-flight run (no close) stays green with no completeness claim", async () => {
    const runId = crn("run", idGen.next());
    const harness = await RunHarness.create({ workspaceDir: ws, runId, traceId: "t_p51_inflight", configFingerprint: "cfg_fp_p51_security", clock, idGen });
    await harness.emit("run.state.changed", { to: "working" });
    await harness.release();
    const report = await verifyJournal(RunHarness.journalPathFor(ws, runId));
    expect(report.ok).toBe(true);
    expect(report.anchored).toBe(false);
    expect(report.complete).toBe(null);
  });

  test("compat: redacted export re-certifies its own receipt and verifies", async () => {
    const { runId, journalPath } = await makeClosedRun("export");
    const outPath = join(ws, ".vaerion", "exports", `${runId}.redacted.ndjson`);
    const report = await exportRedacted({ sourceJournalPath: journalPath, exportPath: outPath, runId });
    expect(report.verified).toBe(true);
    const verify = await verifyJournal(outPath);
    expect(verify.ok).toBe(true);
    expect(verify.anchored).toBe(true);
    expect(verify.complete).toBe(true);
  });
});
