/**
 * Vaerion packaging — shared package operations (MS-6, ADR-0016).
 *
 * The SINGLE composition both surfaces execute: `vae package build|verify`
 * (CLI, L4) and POST /package/build|verify (daemon, L4 via the run
 * registry's serial queue) call THESE functions — Machine Parity for the
 * packaging subsystem is construction, not convention.
 *
 * Law carried over unchanged from the MS-6 bundle-build sprint:
 *   - build refuses an ad-hoc workspace / a missing package block (E1600)
 *   - build writes the bundle, regenerates vaerion.lock, journals
 *     `package.built` on a real run harness, and closes with a receipt
 *   - --dry-run computes the entire fold in memory and writes NOTHING
 *     (no bundle, no lock, no journal)
 *   - verify is the PURE check (content NEVER executed); it journals
 *     `package.verified` only when a real config exists and dry-run is off
 *   - a refused verification is an HONEST result (ok:false + code + findings),
 *     not an exception — the request/command succeeded; the artifact failed
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { VaerionError } from "../kernel/errors.ts";
import { SystemClock } from "../kernel/clock.ts";
import { SystemIdGen, crn } from "../kernel/ids.ts";
import { RunHarness } from "../runtime/run.ts";
import { graphFromConfig } from "../broker/engine.ts";
import type { VaerionConfig } from "../config/config.ts";
import { buildBundle, resolveBundleOutPath, type BuiltBundle } from "./build.ts";
import type { BundleManifest } from "./format.ts";
import type { VerifyFinding } from "./verify.ts";
import { verifyBundleBytes } from "./verify.ts";
import { lockFromBundle, serializeLock } from "./lock.ts";

export interface PackageBuildPayload {
  command: "package";
  kind: "build";
  out: string;
  entries: Array<{ path: string; bytes: number; blake3: string }>;
  entry_count: number;
  pins: BundleManifest["pins"];
  bundle_blake3: string;
  bytes: number;
  lock: string;
  dry_run?: boolean;
  side_effects?: number;
  run_id?: string;
  trace_id?: string;
  receipt?: unknown;
}

export interface PackageVerifyPayload {
  command: "package";
  kind: "verify";
  bundle: string;
  ok: boolean;
  code?: string;
  bundle_blake3: string;
  bytes: number;
  entries: number;
  entries_verified: number;
  pins_checked: number;
  findings: VerifyFinding[];
  checks_passed: string[];
  dry_run?: boolean;
  side_effects?: number;
  run_id?: string;
  trace_id?: string;
  receipt?: unknown;
}

export interface PackageBuildInput {
  workspaceRoot: string;
  config: VaerionConfig;
  configFingerprint: string;
  /** Ad-hoc (config-less) workspaces have no package block by definition. */
  adhoc: boolean;
  /** Bundle path override (workspace-relative or absolute), as the caller received it. */
  out?: string;
  dryRun: boolean;
}

export interface PackageVerifyInput {
  workspaceRoot: string;
  /** undefined = ad-hoc workspace → format-only verification (no pin law). */
  config: VaerionConfig | undefined;
  configFingerprint: string | null;
  /** Absolute bundle path. */
  bundlePath: string;
  /** The path as the caller displayed/received it (payload honesty). */
  bundleDisplay: string;
  dryRun: boolean;
}

/** Build the bundle (the deterministic fold), seal it with vaerion.lock, journal, receipt. */
export async function packageBuildService(input: PackageBuildInput): Promise<PackageBuildPayload> {
  const { workspaceRoot, config, configFingerprint, adhoc, dryRun } = input;
  if (adhoc || !config.package) {
    throw new VaerionError("E1600", "package build requires vaerion.yaml with a package block (Fix: declare package.include in vaerion.yaml — `vae init` scaffolds the file)");
  }
  const outRel = resolveBundleOutPath(workspaceRoot, config, input.out);
  const built: BuiltBundle = await buildBundle(workspaceRoot, config, configFingerprint);
  const payload: PackageBuildPayload = {
    command: "package",
    kind: "build",
    out: outRel,
    entries: built.manifest.entries.map((e) => ({ path: e.path, bytes: e.size, blake3: e.blake3.slice(0, 12) + "…" })),
    entry_count: built.manifest.entries.length,
    pins: built.manifest.pins,
    bundle_blake3: built.bundleBlake3,
    bytes: built.bytes.length,
    lock: "vaerion.lock (regenerated)",
  };
  if (dryRun) {
    return { ...payload, dry_run: true, side_effects: 0 };
  }
  await mkdir(join(workspaceRoot, ".vaerion", "journal"), { recursive: true });
  await mkdir(join(workspaceRoot, ".vaerion", "blobs"), { recursive: true });
  await mkdir(join(workspaceRoot, ".vaerion", "package"), { recursive: true });
  const clock = new SystemClock();
  const idGen = new SystemIdGen();
  const runId = crn("run", idGen.next());
  const traceId = `t_${idGen.next().slice(-10).toLowerCase()}`;
  const graph = graphFromConfig(config, `graph_${configFingerprint.slice(0, 12)}`);
  const harness = await RunHarness.create({ workspaceDir: workspaceRoot, runId, traceId, configFingerprint, clock, idGen, permissionGraph: graph });
  try {
    await writeFile(join(workspaceRoot, outRel), built.bytes);
    const lock = lockFromBundle(config, configFingerprint, outRel, built.manifest, built.bundleBlake3, built.bytes.length);
    await writeFile(join(workspaceRoot, "vaerion.lock"), serializeLock(lock));
    await harness.emit(
      "package.built",
      {
        bundle_blake3: built.bundleBlake3,
        path: outRel,
        bytes: built.bytes.length,
        entries: built.manifest.entries.length,
        pins: built.manifest.pins,
        config_fingerprint: configFingerprint,
      },
      { kind: "human", id: "local-user" },
      { kind: "origin", ref: null },
    );
    const closed = await harness.close(`package build ${outRel}: ${built.manifest.entries.length} entry(ies), ${built.bytes.length} bytes, digest ${built.bundleBlake3.slice(0, 12)}…; vaerion.lock regenerated`);
    return {
      ...payload,
      run_id: runId,
      trace_id: traceId,
      receipt: closed?.receipt ?? null,
    };
  } catch (err) {
    await harness.close(`package build failed: ${(err as Error).message.slice(0, 120)}`).catch(() => undefined);
    throw err;
  } finally {
    await harness.release().catch(() => undefined);
  }
}

/** The pure verification check — honest findings, content never executed. */
export async function packageVerifyService(input: PackageVerifyInput): Promise<PackageVerifyPayload> {
  const { workspaceRoot, config, configFingerprint, bundlePath, bundleDisplay, dryRun } = input;
  const bytes = new Uint8Array(await readFile(bundlePath).catch((err: NodeJS.ErrnoException) => {
    if (err?.code === "ENOENT") throw new VaerionError("E1600", `bundle not found at ${bundleDisplay}`);
    throw err;
  }));
  const report = await verifyBundleBytes(bytes, { config, configFingerprint, root: workspaceRoot });
  const payload: PackageVerifyPayload = {
    command: "package",
    kind: "verify",
    bundle: bundleDisplay,
    ok: report.ok,
    code: report.ok ? undefined : "E2206",
    bundle_blake3: report.bundleBlake3,
    bytes: report.bundleSize,
    entries: report.entryCount,
    entries_verified: report.entriesVerified,
    pins_checked: report.pinsChecked,
    findings: report.findings,
    checks_passed: report.checksPassed,
  };
  if (dryRun) {
    // Verification reads nothing it writes — the check itself is already pure;
    // --dry-run only suppresses the journal record.
    return { ...payload, dry_run: true, side_effects: 0 };
  }
  if (config !== undefined && configFingerprint !== null) {
    await mkdir(join(workspaceRoot, ".vaerion", "journal"), { recursive: true });
    await mkdir(join(workspaceRoot, ".vaerion", "blobs"), { recursive: true });
    const clock = new SystemClock();
    const idGen = new SystemIdGen();
    const runId = crn("run", idGen.next());
    const traceId = `t_${idGen.next().slice(-10).toLowerCase()}`;
    const graph = graphFromConfig(config, `graph_${configFingerprint.slice(0, 12)}`);
    const harness = await RunHarness.create({ workspaceDir: workspaceRoot, runId, traceId, configFingerprint, clock, idGen, permissionGraph: graph });
    try {
      await harness.emit(
        "package.verified",
        {
          bundle_blake3: report.bundleBlake3,
          path: bundleDisplay,
          ok: report.ok,
          findings: report.findings,
          entries_verified: report.entriesVerified,
          pins_checked: report.pinsChecked,
        },
        { kind: "human", id: "local-user" },
        { kind: "origin", ref: null },
      );
      const closed = await harness.close(`package verify ${bundleDisplay}: ${report.ok ? "VERIFIED" : "NOT VERIFIED"} (${report.findings.length} finding(s), ${report.entriesVerified}/${report.entryCount} entries, ${report.pinsChecked} pins)`);
      return { ...payload, run_id: runId, trace_id: traceId, receipt: closed?.receipt ?? null };
    } catch (err) {
      await harness.close(`package verify failed: ${(err as Error).message.slice(0, 120)}`).catch(() => undefined);
      throw err;
    } finally {
      await harness.release().catch(() => undefined);
    }
  }
  return payload;
}
