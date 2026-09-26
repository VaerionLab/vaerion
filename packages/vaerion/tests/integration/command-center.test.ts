/**
 * The Developer Command Center (ASC XVIII Phase 6): `vae status`, `vae report`,
 * and doctor's taught findings.
 *
 * Pinned here:
 *  - status teaches instead of failing: a fresh directory gets exit 0 and a
 *    next-step hint, never an error.
 *  - status/report are read-only deterministic folds: same state → identical
 *    output bytes in every mode.
 *  - report reuses the ONE receipt fold (lifecycleCounts) and the ONE metering
 *    fold (meteringFromRecords): numbers come from journals, never side
 *    ledgers; unpriced calls are counted, never faked as 0-cost.
 *  - Contracts: pure single-line JSON, flat plain (no ANSI), disciplined rich.
 *  - Secret law: credential PRESENCE only — a canary value never surfaces.
 *  - doctor findings teach: failing checks carry impact, not just code+fix;
 *    orphaned blobs point at `vae clean` instead of being silently ignored.
 */

import { afterAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/cli/vae.ts";
import { ExitCode } from "../../src/cli/io.ts";
import { FixedClock, SeededRng } from "../../src/kernel/clock.ts";
import { SeededIdGen, crn } from "../../src/kernel/ids.ts";
import { RunHarness } from "../../src/runtime/run.ts";
import { BlobStore } from "../../src/store/blob-cas.ts";

const workspaces: string[] = [];
const savedEnv: Record<string, string | undefined> = {};
const CANARY = "sk-canary-NEVER-LEAK-9f3a";

afterAll(async () => {
  for (const [k, v] of Object.entries(savedEnv)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  for (const ws of workspaces) await rm(ws, { recursive: true, force: true }).catch(() => undefined);
});

const CONFIG_YAML = `schemaVersion: "0.1"
project:
  name: command-center
telemetry:
  enabled: false
`;

async function makeWorkspace(yaml: string = CONFIG_YAML): Promise<string> {
  const ws = await mkdtemp(join(tmpdir(), "vaerion-cc-"));
  workspaces.push(ws);
  await writeFile(join(ws, "vaerion.yaml"), yaml, "utf8");
  return ws;
}

function setEnv(key: string, value: string | undefined): void {
  if (!(key in savedEnv)) savedEnv[key] = process.env[key];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

async function run(ws: string, args: string[]): Promise<{ code: number; out: string[]; err: string[] }> {
  const out: string[] = [];
  const err: string[] = [];
  const code = (await runCli(args, { out: (l) => out.push(l), err: (l) => err.push(l) }, ws)).code;
  return { code, out, err };
}

function jsonOf(out: string[]): Record<string, unknown> {
  const line = out.find((l) => l.startsWith("{"));
  expect(line).toBeDefined();
  return JSON.parse(line as string) as Record<string, unknown>;
}

let seedCounter = 0;

/** Seed a REAL journal (RunHarness = the production writer path). */
async function seedRun(ws: string, opts: { close: boolean; modelEvents?: boolean; blob?: boolean; unpriced?: boolean; fail?: boolean; evidence?: boolean }): Promise<string> {
  seedCounter++;
  const clock = new FixedClock(1735689600000 + seedCounter * 60000);
  const idGen = new SeededIdGen(() => clock.nowMs(), new SeededRng(7));
  const runId = crn("run", idGen.next());
  const harness = await RunHarness.create({ workspaceDir: ws, runId, traceId: `t_cc_${seedCounter}`, configFingerprint: "cfg_fp_cc", clock, idGen });
  if (opts.blob) {
    const store = new BlobStore(join(ws, ".vaerion", "blobs"));
    const ref = await store.put("evidence bytes for the command center tests");
    await harness.emit("store.blob.put", { blob_ref: ref });
  }
  if (opts.evidence) {
    await harness.emit("research.evidence.recorded", { evidence: { evidence_id: `ev_${seedCounter}`, blob: { alg: "blake3", hash: "0".repeat(64), size: 4 }, fingerprint: "fp" } });
  }
  if (opts.modelEvents) {
    await harness.emit("gateway.invoke.recorded", { model: "mockbrain/mock-1", usage: { inputTokens: 10, outputTokens: 5 }, cost: { totalMicroUsd: 33 } });
    await harness.emit("gateway.invoke.recorded", { model: "mockbrain/mock-1", usage: { inputTokens: 12, outputTokens: 7 }, cost: opts.unpriced ? null : { totalMicroUsd: 33 } });
    if (opts.fail) await harness.emit("gateway.invoke.failed", { model: "mockbrain/mock-1", error: "synthetic failure for the fold" });
  }
  if (opts.close) await harness.close("seeded run for command-center tests");
  return runId;
}

describe("`vae status` — the project dashboard", () => {
  test("teaches on a fresh directory: exit 0, fresh state, init hint", async () => {
    const ws = await mkdtemp(join(tmpdir(), "vaerion-cc-fresh-"));
    workspaces.push(ws);
    const result = await run(ws, ["status", "--json"]);
    expect(result.code).toBe(ExitCode.ok);
    const payload = jsonOf(result.out);
    expect(payload.command).toBe("status");
    expect((payload.workspace as Record<string, unknown>).state).toBe("fresh");
    expect((payload.account as Record<string, unknown>).present).toBe(false);
    expect((payload.runs as Record<string, unknown>).total).toBe(0);
    const hints = payload.hints as string[];
    expect(hints.some((h) => h.includes("vae init"))).toBe(true);
  });

  test("JSON is one pure line; plain is flat with no ANSI; both deterministic", async () => {
    const ws = await makeWorkspace();
    const j1 = await run(ws, ["status", "--json"]);
    const j2 = await run(ws, ["status", "--json"]);
    expect(j1.out).toHaveLength(1);
    expect(j1.out[0]).toBe(j2.out[0]); // deterministic: same state, same bytes
    expect(j1.out[0]).not.toContain("\u001b");

    const p = await run(ws, ["status"]);
    expect(p.code).toBe(ExitCode.ok);
    expect(p.out[0]).toBe("command: status");
    expect(p.out.join("\n")).not.toContain("\u001b");
  });

  test("reads real journals: closed vs open, kind inference, newest-first recent", async () => {
    const ws = await makeWorkspace();
    const closedId = await seedRun(ws, { close: true, modelEvents: true });
    await seedRun(ws, { close: false, modelEvents: true });
    const payload = jsonOf((await run(ws, ["status", "--json"])).out);
    const runs = payload.runs as Record<string, number>;
    expect(runs.total).toBe(2);
    expect(runs.closed).toBe(1);
    expect(runs.open).toBe(1);
    const recent = payload.recent as Array<Record<string, unknown>>;
    expect(recent).toHaveLength(2);
    // newest first: the open run was created after the closed one (ULID order)
    expect(recent[0]!.state).toBe("open");
    expect(recent[0]!.closed_at).toBeNull();
    expect(recent[1]!.state).toBe("closed");
    expect(recent[1]!.closed_at).not.toBeNull();
    expect(recent[1]!.kind).toBe("model");
    expect(recent[1]!.run_id).toBe(closedId);
  });

  test("credential presence without values: canary never leaks (secret law)", async () => {
    setEnv("ANTHROPIC_API_KEY", CANARY);
    try {
      const ws = await makeWorkspace();
      const result = await run(ws, ["status", "--json"]);
      const payload = jsonOf(result.out);
      const ai = payload.ai as Record<string, unknown>;
      const creds = ai.credentials as Array<{ provider: string; credential: string }>;
      const anthropic = creds.find((c) => c.provider === "anthropic");
      expect(anthropic?.credential).toBe("set");
      const everything = result.out.join("\n") + result.err.join("\n");
      expect(everything).not.toContain(CANARY);
      const plain = await run(ws, ["status"]);
      expect((plain.out.join("\n") + plain.err.join("\n"))).not.toContain(CANARY);
    } finally {
      setEnv("ANTHROPIC_API_KEY", undefined);
    }
  });

  test("rich profile: disciplined panels over the same payload", async () => {
    setEnv("VAE_UI", "rich");
    try {
      const ws = await makeWorkspace();
      await seedRun(ws, { close: true, modelEvents: true });
      const out: string[] = [];
      const err: string[] = [];
      const code = (await runCli(["status"], { out: (l) => out.push(l), err: (l) => err.push(l), raw: () => undefined, tty: true, columns: 100 }, ws)).code;
      expect(code).toBe(ExitCode.ok);
      const text = out.join("\n");
      expect(text).toContain("Workspace");
      expect(text).toContain("Identity");
      expect(text).toContain("Runs —");
      expect(text).toContain("Next");
      // width discipline: nothing exceeds the terminal width
      for (const line of out) expect(line.replace(/\u001b\[[0-9;]*m/g, "").length).toBeLessThanOrEqual(100);
      expect(err.join("")).toBe("");
    } finally {
      setEnv("VAE_UI", undefined);
    }
  });
});

describe("`vae report` — insight, not vanity", () => {
  test("teaches on an empty workspace and stays deterministic", async () => {
    const ws = await makeWorkspace();
    const r1 = await run(ws, ["report", "--json"]);
    const r2 = await run(ws, ["report", "--json"]);
    expect(r1.code).toBe(ExitCode.ok);
    expect(r1.out[0]).toBe(r2.out[0]);
    const payload = jsonOf(r1.out);
    expect((payload.runs as Record<string, unknown>).total).toBe(0);
    const reads = payload.reads as string[];
    expect(reads.some((l) => l.includes("no runs yet"))).toBe(true);
    expect(payload.note).toContain("pure fold");
  });

  test("metering numbers ARE the journal fold: tokens, cost, failures, unpriced", async () => {
    const ws = await makeWorkspace();
    await seedRun(ws, { close: true, modelEvents: true, fail: true, unpriced: true });
    const payload = jsonOf((await run(ws, ["report", "--json"])).out);
    const metering = payload.metering as Record<string, unknown>;
    expect(metering.invocations).toBe(2);
    expect(metering.failed).toBe(1);
    expect(metering.input_tokens).toBe(22);
    expect(metering.output_tokens).toBe(12);
    expect(metering.total_micro_usd).toBe(33); // one priced + one unpriced: counted, never faked
    expect(metering.unpriced).toBe(1);
    const byModel = (metering.by_model as Record<string, Record<string, number>>)["mockbrain/mock-1"];
    expect(byModel).toBeDefined();
    expect(byModel!.invocations).toBe(2);
    expect((payload.runs as Record<string, unknown>).by_kind).toEqual(expect.objectContaining({ model: 1 }));
  });

  test("span, evidence, and reads teach the next action", async () => {
    const ws = await makeWorkspace();
    await seedRun(ws, { close: true, blob: true, evidence: true });
    await seedRun(ws, { close: false });
    const payload = jsonOf((await run(ws, ["report", "--json"])).out);
    const span = payload.span as { first: string | null; last: string | null };
    expect(span.first).not.toBeNull();
    expect(span.last).not.toBeNull();
    expect((payload.evidence as Record<string, unknown>).recorded).toBe(1);
    const reads = payload.reads as string[];
    expect(reads.some((l) => l.includes("resume"))).toBe(true); // an open run exists
    expect(reads.some((l) => l.includes("vae doctor"))).toBe(true); // evidence exists
  });
});

describe("doctor teaches: impact on failures, orphans point at clean", () => {
  test("a failing config check carries an impact line (cause → impact → fix)", async () => {
    const ws = await makeWorkspace(`schemaVersion: "0.1"\nproject:\n  name: broken\n  unknownKey: true\ntelemetry:\n  enabled: false\n`);
    const result = await run(ws, ["doctor", "--json"]);
    expect(result.code).toBe(ExitCode.partial);
    const payload = jsonOf(result.out);
    const checks = payload.checks as Array<Record<string, unknown>>;
    const config = checks.find((c) => c.check === "config");
    expect(config?.ok).toBe(false);
    expect(typeof config?.impact).toBe("string");
    expect((config?.impact as string).length).toBeGreaterThan(10);
    expect(config?.fix).toBeDefined();
  });

  test("the blob-orphans check exists and points at `vae clean` when orphans exist", async () => {
    const ws = await makeWorkspace();
    await seedRun(ws, { close: true, blob: true });
    // an orphan: bytes in the CAS no journal references
    const hash = "ab".repeat(32);
    const dir = join(ws, ".vaerion", "blobs", "blake3", "ab", "ab");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, hash), "orphan bytes");
    const plain = await run(ws, ["doctor"]);
    expect(plain.code).toBe(ExitCode.ok);
    const text = plain.out.join("\n");
    expect(text).toContain("blob-orphans");
    expect(text).toContain("vae clean --yes");
    // exactly ONE orphan: two blobs exist on disk, but the referenced one is never counted
    expect(text).toContain("1 orphaned blob(s)");
  });
});
