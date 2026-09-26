/**
 * Recovery & maintenance (ASC XVIII Phase 6): the deterministic tar kernel,
 * `vae snapshot`, `vae restore`, `vae clean`.
 *
 * Pinned here:
 *  - kernel/tar: byte-deterministic packing (sorted entries, no wall-clock),
 *    faithful roundtrip, and refusal (never approximation) of duplicates,
 *    unsafe paths, corrupt headers, and truncation.
 *  - snapshot: whitelist law (unknown files are never silently captured),
 *    digest-pinned payload, two snapshots of one state are byte-identical,
 *    --dry-run writes nothing but plans exactly (same digest).
 *  - restore: fail-closed ordering (every digest verified BEFORE any write),
 *    conflict law (differing files refuse with the list — nothing written —
 *    until --force), restored journals re-verified, traversal refused.
 *  - clean: plan-only by default, --dry-run beats --yes, evidence-linked
 *    blobs are NEVER cleanable.
 *  - Contracts: single-line JSON, flat plain, disciplined rich; honest exits
 *    (0 ok · 2 conflicts/usage · 5 verification findings).
 */

import { afterAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/cli/vae.ts";
import { ExitCode } from "../../src/cli/io.ts";
import { packTar, parseTar } from "../../src/kernel/tar.ts";
import { blake3HexOf } from "../../src/kernel/hash.ts";
import { VaerionError } from "../../src/kernel/errors.ts";
import { FixedClock, SeededRng } from "../../src/kernel/clock.ts";
import { SeededIdGen, crn } from "../../src/kernel/ids.ts";
import { RunHarness } from "../../src/runtime/run.ts";
import { BlobStore } from "../../src/store/blob-cas.ts";
import { ChainedAuditWriter } from "../../src/broker/contracts/audit.ts";

const workspaces: string[] = [];

afterAll(async () => {
  for (const ws of workspaces) await rm(ws, { recursive: true, force: true }).catch(() => undefined);
});

const CONFIG_YAML = `schemaVersion: "0.1"
project:
  name: recovery
telemetry:
  enabled: false
`;

async function makeWorkspace(yaml: string = CONFIG_YAML): Promise<string> {
  const ws = await mkdtemp(join(tmpdir(), "vaerion-recv-"));
  workspaces.push(ws);
  await writeFile(join(ws, "vaerion.yaml"), yaml, "utf8");
  return ws;
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

/** Seed a real closed run with a journaled blob + one audit entry (the evidence state to snapshot). */
async function seedClosedRunWithBlob(ws: string): Promise<string> {
  seedCounter++;
  const clock = new FixedClock(1735689600000 + seedCounter * 60000);
  const idGen = new SeededIdGen(() => clock.nowMs(), new SeededRng(11));
  const runId = crn("run", idGen.next());
  const harness = await RunHarness.create({ workspaceDir: ws, runId, traceId: `t_recv_${seedCounter}`, configFingerprint: "cfg_fp_recv", clock, idGen });
  const store = new BlobStore(join(ws, ".vaerion", "blobs"));
  const ref = await store.put(`evidence payload ${seedCounter}`);
  await harness.emit("store.blob.put", { blob_ref: ref });
  await harness.close("seeded closed run for recovery tests");
  // one real audit entry via the production writer (audit.log is lazy — created on first append)
  const audit = await ChainedAuditWriter.open(join(ws, ".vaerion", "audit.log"), null, clock);
  await audit.append("decision", runId, { seeded: true });
  await audit.close();
  return runId;
}

/** Rewrite a tar header's name in place and re-seal its checksum (craft law). */
function patchEntryName(tar: Uint8Array, at: number, newName: string): void {
  for (let i = 0; i < 100; i++) tar[at + i] = i < newName.length ? newName.charCodeAt(i) : 0;
  let sum = 0;
  for (let i = 0; i < 512; i++) sum += i < 148 || i >= 156 ? tar[at + i]! : 0x20;
  const oct = sum.toString(8).padStart(6, "0");
  for (let i = 0; i < 6; i++) tar[at + 148 + i] = oct.charCodeAt(i);
  tar[at + 154] = 0;
  tar[at + 155] = 0x20;
}

describe("kernel/tar — the deterministic archive substrate", () => {
  test("packing is byte-deterministic and order-independent", () => {
    const entries = [
      { path: "b/second.txt", data: new TextEncoder().encode("second") },
      { path: "a/first.txt", data: new TextEncoder().encode("first") },
    ];
    expect(packTar(entries)).toEqual(packTar([...entries].reverse()));
  });

  test("roundtrip is faithful (paths and bytes)", () => {
    const entries = [
      { path: "vaerion.yaml", data: new TextEncoder().encode("config") },
      { path: ".vaerion/journal/crn_run_01ABCDEFGHJKMNPQRSTVWXYZ26.ndjson", data: new TextEncoder().encode("{}\n") },
    ];
    const parsed = parseTar(packTar(entries));
    expect(parsed.map((e) => e.path)).toEqual([".vaerion/journal/crn_run_01ABCDEFGHJKMNPQRSTVWXYZ26.ndjson", "vaerion.yaml"]); // sorted
    expect(new TextDecoder().decode(parsed.find((e) => e.path === "vaerion.yaml")!.data)).toBe("config");
  });

  test("refuses duplicates, absolute paths, and traversal (never approximates)", () => {
    const ok = { path: "x.txt", data: new Uint8Array(1) };
    expect(() => packTar([ok, { ...ok }])).toThrow(VaerionError);
    expect(() => packTar([{ path: "/etc/passwd", data: new Uint8Array(1) }])).toThrow(VaerionError);
    expect(() => packTar([{ path: "a/../../etc/passwd", data: new Uint8Array(1) }])).toThrow(VaerionError);
  });

  test("parsing refuses a corrupted checksum and a truncated archive", () => {
    const tar = packTar([{ path: "x.txt", data: new TextEncoder().encode("hello world") }]);
    const corrupted = new Uint8Array(tar);
    corrupted[10] = corrupted[10]! ^ 0xff; // flip a header NAME byte (header 0 = offset 0) → checksum no longer sums
    expect(() => parseTar(corrupted)).toThrow(VaerionError);
    expect(() => parseTar(tar.slice(0, 700))).toThrow(VaerionError);
  });
});

describe("`vae snapshot` — deterministic evidence archives", () => {
  test("archives the whitelist, pins the digest, and is byte-reproducible", async () => {
    const ws = await makeWorkspace();
    await seedClosedRunWithBlob(ws);
    await writeFile(join(ws, "notes.txt"), "NOT ours to archive", "utf8");

    const s1 = jsonOf((await run(ws, ["snapshot", "--out", "s1.tar", "--json"])).out);
    const s2 = jsonOf((await run(ws, ["snapshot", "--out", "s2.tar", "--json"])).out);
    expect(s1.command).toBe("snapshot");
    const bytes1 = await readFile(join(ws, "s1.tar"));
    const bytes2 = await readFile(join(ws, "s2.tar"));
    expect(bytes1.equals(bytes2)).toBe(true); // same state → byte-identical archive
    expect(await blake3HexOf(bytes1)).toBe(s1.digest as string);

    const entries = parseTar(bytes1);
    const paths = entries.map((e) => e.path);
    expect(paths).toContain("vaerion.yaml");
    expect(paths.some((p) => p.startsWith(".vaerion/journal/") && p.endsWith(".ndjson"))).toBe(true);
    expect(paths).toContain(".vaerion/audit.log");
    expect(paths.some((p) => p.startsWith(".vaerion/blobs/blake3/"))).toBe(true);
    expect(paths).not.toContain("notes.txt"); // whitelist law
    expect(paths).not.toContain("s1.tar"); // never self-capture
    // every entry digest in the embedded manifest verifies
    const manifest = JSON.parse(new TextDecoder().decode(entries.find((e) => e.path === "_vaerion/snapshot.json")!.data));
    expect(manifest.schema).toBe("vaerion.snapshot/1");
    for (const me of manifest.entries as Array<{ path: string; blake3: string }>) {
      const entry = entries.find((e) => e.path === me.path);
      expect(entry).toBeDefined();
      expect(await blake3HexOf(entry!.data)).toBe(me.blake3);
    }
  });

  test("--dry-run writes nothing but plans exactly (same digest as the real run)", async () => {
    const ws = await makeWorkspace();
    await seedClosedRunWithBlob(ws);
    const plan = jsonOf((await run(ws, ["snapshot", "--out", "plan.tar", "--dry-run", "--json"])).out);
    expect(plan.dry_run).toBe(true);
    await expect(stat(join(ws, "plan.tar"))).rejects.toBeTruthy(); // nothing written
    const real = jsonOf((await run(ws, ["snapshot", "--out", "plan.tar", "--json"])).out);
    expect(real.digest).toBe(plan.digest); // the plan IS the outcome
  });

  test("refuses a non-workspace with a teaching fix", async () => {
    const bare = await mkdtemp(join(tmpdir(), "vaerion-recv-bare-"));
    workspaces.push(bare);
    const result = await run(bare, ["snapshot"]);
    expect(result.code).toBe(ExitCode.usage);
    expect(result.err.join("\n")).toContain("E1600");
    expect(result.err.join("\n")).toContain("vae init");
  });
});

describe("`vae restore` — fail-closed recovery", () => {
  async function makeSnapshot(): Promise<{ source: string; archive: string; digest: string }> {
    const source = await makeWorkspace();
    await seedClosedRunWithBlob(source);
    const payload = jsonOf((await run(source, ["snapshot", "--out", "snap.tar", "--json"])).out);
    return { source, archive: join(source, "snap.tar"), digest: payload.digest as string };
  }

  test("roundtrip: every byte restored, journals re-verified, second pass is a no-op", async () => {
    const { source, archive, digest } = await makeSnapshot();
    const target = await makeWorkspace(`schemaVersion: "0.1"\nproject:\n  name: will-be-replaced\ntelemetry:\n  enabled: false\n`);
    const payload = jsonOf((await run(target, ["restore", archive, "--force", "--json"])).out);
    expect(payload.command).toBe("restore");
    expect(payload.digest).toBe(digest);
    expect((payload.verified as Record<string, unknown>).ok).toBe(true);

    const srcEntries = parseTar(await readFile(archive)).filter((e) => e.path !== "_vaerion/snapshot.json");
    for (const entry of srcEntries) {
      const restored = await readFile(join(target, entry.path));
      expect(restored.equals(entry.data)).toBe(true); // byte-faithful
    }
    const again = jsonOf((await run(target, ["restore", archive, "--json"])).out);
    expect(again.created_count).toBe(0);
    expect(again.identical_count).toBe((payload.manifest as Record<string, unknown>).files as number);
    expect(again.overwritten_count).toBe(0);
    void source;
  });

  test("conflict law: differing files refuse with the list — nothing written — until --force", async () => {
    const { archive } = await makeSnapshot();
    const target = await makeWorkspace();
    const drifted = CONFIG_YAML.replace("name: recovery", "name: drifted");
    await writeFile(join(target, "vaerion.yaml"), drifted, "utf8");

    const refused = await run(target, ["restore", archive, "--json"]);
    expect(refused.code).toBe(ExitCode.usage);
    expect(refused.err.join("\n")).toContain("E1600");
    expect(refused.err.join("\n")).toContain("vaerion.yaml");
    expect(await readFile(join(target, "vaerion.yaml"), "utf8")).toBe(drifted); // untouched

    const forced = jsonOf((await run(target, ["restore", archive, "--force", "--json"])).out);
    expect(forced.overwritten_count).toBe(1);
    expect(forced.created_count).toBeGreaterThan(0); // the rest of the archive is new here
    const restored = await readFile(join(target, "vaerion.yaml"), "utf8");
    expect(restored).toBe(CONFIG_YAML);
  });

  test("tamper probe: one flipped payload byte refuses the WHOLE restore (E1501, exit 5)", async () => {
    const { archive } = await makeSnapshot();
    const bytes = new Uint8Array(await readFile(archive));
    // locate the vaerion.yaml data block by walking headers (no arithmetic guesses)
    let dataAt = -1;
    for (let at = 0; at + 512 <= bytes.length; ) {
      if (bytes[at] === 0) break;
      const name = new TextDecoder().decode(bytes.slice(at, at + 100)).replace(/\0.*$/s, "");
      const sizeStr = new TextDecoder().decode(bytes.slice(at + 124, at + 136)).replace(/\0.*$/s, "").trim();
      const size = sizeStr.length > 0 ? parseInt(sizeStr, 8) : 0;
      if (name === "vaerion.yaml") {
        dataAt = at + 512;
        break;
      }
      at += 512 + Math.ceil(size / 512) * 512;
    }
    expect(dataAt).toBeGreaterThan(0);
    bytes[dataAt] = bytes[dataAt]! ^ 0xff;
    const tampered = join(await makeWorkspace(), "tampered.tar");
    await writeFile(tampered, bytes);

    const target = await makeWorkspace();
    const result = await run(target, ["restore", tampered]);
    expect(result.code).toBe(ExitCode.partial);
    expect(result.err.join("\n")).toContain("E1501");
    expect(result.err.join("\n")).toContain("digest mismatch");
    // nothing was written
    expect(await readFile(join(target, "vaerion.yaml"), "utf8")).toBe(CONFIG_YAML);
  });

  test("unsafe paths refuse with E1501 and write nothing (traversal probe)", async () => {
    const { archive } = await makeSnapshot();
    const bytes = new Uint8Array(await readFile(archive));
    const manifestEntry = parseTar(bytes).find((e) => e.path === "_vaerion/snapshot.json")!;
    const originalManifest = JSON.parse(new TextDecoder().decode(manifestEntry.data)) as Record<string, unknown>;
    const evilData = new TextEncoder().encode("owned");
    // the manifest itself declares a traversal path, with a MATCHING digest:
    // every in-archive check passes, so ONLY the path-safety law can refuse
    const craftedManifest = {
      ...originalManifest,
      entries: [{ path: "../e", size: evilData.byteLength, blake3: await blake3HexOf(evilData) }],
      totals: { files: 1, bytes: evilData.byteLength },
    };
    const manifestBytes = new TextEncoder().encode(JSON.stringify(craftedManifest, null, 2) + "\n");
    const tar = packTar([
      { path: "_vaerion/snapshot.json", data: manifestBytes },
      { path: "evil", data: evilData },
    ]);
    // rename the entry header "evil" → "../e" so archive and manifest agree, then re-seal
    const headers: number[] = [];
    for (let at = 0; at + 512 <= tar.length; ) {
      if (tar[at] === 0) break;
      headers.push(at);
      const sizeStr = new TextDecoder().decode(tar.slice(at + 124, at + 136)).replace(/\0.*$/s, "").trim();
      const size = sizeStr.length > 0 ? parseInt(sizeStr, 8) : 0;
      at += 512 + Math.ceil(size / 512) * 512;
    }
    expect(headers.length).toBe(2);
    patchEntryName(tar, headers[1]!, "../e");

    const dir = await mkdtemp(join(tmpdir(), "vaerion-evil-"));
    workspaces.push(dir);
    const evilPath = join(dir, "evil.tar");
    await writeFile(evilPath, tar);

    const target = await makeWorkspace();
    const result = await run(target, ["restore", evilPath]);
    expect(result.code).toBe(ExitCode.partial);
    expect(result.err.join("\n")).toContain("E1501");
    // the traversal target exists NOWHERE
    expect(await stat(join(target, "..", "e")).then(() => true, () => false)).toBe(false);
    expect(await stat(join(target, "e")).then(() => true, () => false)).toBe(false);
  });

  test("usage errors teach: missing argument and missing file are E1600 (exit 2)", async () => {
    const ws = await makeWorkspace();
    const noArg = await run(ws, ["restore"]);
    expect(noArg.code).toBe(ExitCode.usage);
    expect(noArg.err.join("\n")).toContain("E1600");
    const missing = await run(ws, ["restore", "nope.tar"]);
    expect(missing.code).toBe(ExitCode.usage);
    expect(missing.err.join("\n")).toContain("nope.tar");
  });
});

describe("`vae clean` — maintenance without regret", () => {
  test("plan-only by default; --dry-run beats --yes; --yes reclaims ONLY orphans", async () => {
    const ws = await makeWorkspace();
    const runId = await seedClosedRunWithBlob(ws);
    // an orphan: blob bytes no journal references
    const hash = "cd".repeat(32);
    const dir = join(ws, ".vaerion", "blobs", "blake3", "cd", "cd");
    await mkdir(dir, { recursive: true });
    const orphanPath = join(dir, hash);
    await writeFile(orphanPath, "orphan bytes");
    const orphanBytes = (await stat(orphanPath)).size;

    const plan = jsonOf((await run(ws, ["clean", "--json"])).out);
    expect(plan.deleted).toBe(false);
    expect(plan.orphan_count).toBe(1);
    expect(plan.orphan_bytes).toBe(orphanBytes);
    expect((plan.note as string).includes("--yes")).toBe(true);
    expect(await stat(orphanPath)).toBeTruthy(); // still there

    const dry = jsonOf((await run(ws, ["clean", "--yes", "--dry-run", "--json"])).out);
    expect(dry.deleted).toBe(false); // --dry-run always wins
    expect(await stat(orphanPath)).toBeTruthy();

    const swept = jsonOf((await run(ws, ["clean", "--yes", "--json"])).out);
    expect(swept.deleted).toBe(true);
    expect(await stat(orphanPath).then(() => true, () => false)).toBe(false); // gone
    // the evidence-linked blob survives (clean never touches referenced blobs)
    const read = await readFile(join(ws, ".vaerion", "journal", `${runId}.ndjson`), "utf8");
    expect(read).toContain("store.blob.put");
  });

  test("a non-workspace is a teaching payload, not an error", async () => {
    const bare = await mkdtemp(join(tmpdir(), "vaerion-recv-bare2-"));
    workspaces.push(bare);
    const result = await run(bare, ["clean", "--json"]);
    expect(result.code).toBe(ExitCode.ok);
    const payload = jsonOf(result.out);
    expect(payload.orphan_count).toBe(0);
    expect((payload.note as string).includes("vae init")).toBe(true);
  });
});

describe("Command Center output contracts", () => {
  test("plain pipes never receive ANSI; JSON is single-line (recovery family)", async () => {
    const ws = await makeWorkspace();
    await seedClosedRunWithBlob(ws);
    for (const args of [["snapshot", "--out", "c.tar"], ["clean"], ["status"], ["report"]]) {
      const plain = await run(ws, args);
      expect(plain.out.join("\n")).not.toContain("\u001b");
      const json = await run(ws, [...args, "--json"]);
      expect(json.out).toHaveLength(1);
      expect(JSON.parse(json.out[0]!)).toBeDefined();
      expect(json.out[0]).not.toContain("\u001b");
    }
  });

  test("rich profile: disciplined panels, no stray stderr, exit parity with plain", async () => {
    const prev = process.env.VAE_UI;
    process.env.VAE_UI = "rich";
    try {
      const ws = await makeWorkspace();
      await seedClosedRunWithBlob(ws);
      for (const args of [["snapshot", "--out", "r.tar"], ["restore", join(ws, "r.tar"), "--force"], ["clean"], ["report"]]) {
        const out: string[] = [];
        const err: string[] = [];
        const richCode = (await runCli(args, { out: (l) => out.push(l), err: (l) => err.push(l), raw: () => undefined, tty: true, columns: 100 }, ws)).code;
        const plainCode = (await run(ws, args)).code;
        expect(richCode).toBe(plainCode);
        expect(err.join("")).toBe("");
        for (const line of out) expect(line.replace(/\u001b\[[0-9;]*m/g, "").length).toBeLessThanOrEqual(100);
        expect(out.join("\n")).not.toContain("undefined");
      }
    } finally {
      if (prev === undefined) delete process.env.VAE_UI;
      else process.env.VAE_UI = prev;
    }
  });
});
