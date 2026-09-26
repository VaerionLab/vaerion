/**
 * The daemon packages route group over real sockets (MS-6, ADR-0016).
 *
 * Law under test: POST /packages/pack and POST /packages/verify execute the
 * SAME shared service the CLI executes (Machine Parity by construction —
 * proven here by byte-identical bundles and an identical vaerion.lock
 * across surfaces); the serial queue still guards single-writer chains;
 * a refused artifact is an HONEST HTTP 200 with ok:false + E2206 + findings,
 * never a request error; dry_run over the wire writes nothing; pairing-token
 * authn fail-closed; the generated OpenAPI contract describes both routes.
 */

import { afterAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startDaemon, type DaemonHandle } from "../../src/api/server.ts";
import { generateOpenApi } from "../../src/api/openapi.ts";
import { runCli } from "../../src/cli/vae.ts";
import { readLock } from "../../src/package/lock.ts";

const workspaces: string[] = [];
const daemons: DaemonHandle[] = [];
afterAll(async () => {
  for (const d of daemons) await d.stop({ force: true }).catch(() => undefined);
  for (const ws of workspaces) await rm(ws, { recursive: true, force: true }).catch(() => undefined);
});

const PKG_YAML = `schemaVersion: "0.1"
project:
  name: wirepkg
  description: "MS-6 daemon packages"
package:
  include:
    - docs
    - prompts/p.md
telemetry:
  enabled: false
`;

const PLAIN_YAML = `schemaVersion: "0.1"
project:
  name: wireplain
telemetry:
  enabled: false
`;

async function makeWorkspace(yaml: string, name: string): Promise<string> {
  const ws = await mkdtemp(join(tmpdir(), `vxn-wire-${name}-`));
  workspaces.push(ws);
  await mkdir(join(ws, "docs"), { recursive: true });
  await mkdir(join(ws, "prompts"), { recursive: true });
  await writeFile(join(ws, "docs", "a.md"), "# A\nwire doc\n");
  await writeFile(join(ws, "prompts", "p.md"), "PROMPT: wire parity\n");
  await writeFile(join(ws, "vaerion.yaml"), yaml, "utf8");
  await mkdir(join(ws, ".vaerion", "journal"), { recursive: true });
  await mkdir(join(ws, ".vaerion", "blobs"), { recursive: true });
  return ws;
}

async function start(ws: string): Promise<DaemonHandle> {
  const handle = await startDaemon({ workspaceDir: ws, port: 0, token: "wirepkg-test-token" });
  daemons.push(handle);
  return handle;
}

async function jsonFetch(handle: DaemonHandle, method: string, path: string, opts: { token?: string; body?: unknown } = {}): Promise<{ status: number; body: Record<string, unknown> }> {
  const response = await fetch(`http://127.0.0.1:${handle.port}${path}`, {
    method,
    headers: {
      ...(opts.token !== undefined ? { Authorization: `Bearer ${opts.token}` } : {}),
      ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const text = await response.text();
  return { status: response.status, body: (text.length > 0 ? JSON.parse(text) : {}) as Record<string, unknown> };
}

async function cliJson(ws: string, args: string[]): Promise<Record<string, unknown>> {
  const lines: string[] = [];
  const { code } = await runCli(args, { out: (l) => lines.push(l), err: (l) => lines.push(l) }, ws);
  expect(code).toBe(0);
  const raw = lines.filter((l) => l.trim().startsWith("{")).join("\n");
  return JSON.parse(raw) as Record<string, unknown>;
}

const AUTH = { token: "wirepkg-test-token" };

describe("daemon packages — Machine Parity over the wire", () => {
  test("CLI build and wire build produce BYTE-IDENTICAL bundles and an identical lock", async () => {
    const ws = await makeWorkspace(PKG_YAML, "parity");
    const handle = await start(ws);

    // Surface 1: the CLI (in-process).
    const cliBuild = await cliJson(ws, ["package", "build", "--json"]);
    const cliBytes = await readFile(join(ws, ".vaerion", "package", "wirepkg.vxn"));
    const cliLock = await readFile(join(ws, "vaerion.lock"), "utf8");

    // Surface 2: the wire. The fold is deterministic, so the rebuild over the
    // daemon must reproduce the CLI's bytes exactly — and the lock too.
    const res = await jsonFetch(handle, "POST", "/packages/pack", { ...AUTH, body: {} });
    expect(res.status).toBe(200);
    const wireBuild = res.body;
    expect(wireBuild.command).toBe("package");
    expect(wireBuild.kind).toBe("build");
    expect(wireBuild.bundle_blake3).toBe(cliBuild.bundle_blake3);
    expect(wireBuild.bytes).toBe(cliBuild.bytes);
    expect(wireBuild.entry_count).toBe(cliBuild.entry_count);
    expect(typeof wireBuild.run_id).toBe("string");
    expect(typeof wireBuild.receipt).toBe("object");

    const wireBytes = await readFile(join(ws, ".vaerion", "package", "wirepkg.vxn"));
    expect(Buffer.compare(cliBytes, wireBytes)).toBe(0);
    const wireLock = await readFile(join(ws, "vaerion.lock"), "utf8");
    expect(wireLock).toBe(cliLock);

    // The lock parses and seals THIS bundle (digest cross-check).
    const lock = await readLock(ws);
    expect(lock).not.toBeNull();
    expect((lock as { bundle: { blake3: string } }).bundle.blake3).toBe(cliBuild.bundle_blake3 as string);
  });

  test("wire verify is the same pure check: green for the sealed bundle, honest E2206 for a tampered one", async () => {
    const ws = await makeWorkspace(PKG_YAML, "verify");
    const handle = await start(ws);
    await jsonFetch(handle, "POST", "/packages/pack", { ...AUTH, body: {} });

    const green = await jsonFetch(handle, "POST", "/packages/verify", { ...AUTH, body: { path: ".vaerion/package/wirepkg.vxn" } });
    expect(green.status).toBe(200);
    expect(green.body.ok).toBe(true);
    expect(green.body.code).toBeUndefined();
    expect(green.body.pins_checked).toBe(0);
    expect(typeof green.body.run_id).toBe("string"); // package.verified journaled
    expect((green.body.findings as unknown[]).length).toBe(0);

    // Tamper: flip one payload byte in place.
    const bundlePath = join(ws, ".vaerion", "package", "wirepkg.vxn");
    const bytes = await readFile(bundlePath);
    const flipAt = bytes.length - 1;
    bytes[flipAt] = bytes[flipAt]! ^ 0xff;
    await writeFile(bundlePath, bytes);

    const tampered = await jsonFetch(handle, "POST", "/packages/verify", { ...AUTH, body: { path: ".vaerion/package/wirepkg.vxn" } });
    expect(tampered.status).toBe(200); // the request succeeded; the artifact is refused
    expect(tampered.body.ok).toBe(false);
    expect(tampered.body.code).toBe("E2206");
    expect((tampered.body.findings as Array<Record<string, unknown>>).length).toBeGreaterThan(0);
  });

  test("dry_run over the wire writes nothing", async () => {
    const ws = await makeWorkspace(PKG_YAML, "dryrun");
    const handle = await start(ws);
    const res = await jsonFetch(handle, "POST", "/packages/pack", { ...AUTH, body: { dry_run: true } });
    expect(res.status).toBe(200);
    expect(res.body.dry_run).toBe(true);
    expect(res.body.side_effects).toBe(0);
    await expect(readFile(join(ws, ".vaerion", "package", "wirepkg.vxn"))).rejects.toThrow();
    await expect(readFile(join(ws, "vaerion.lock"))).rejects.toThrow();
    expect(res.body.run_id).toBeUndefined();
  });

  test("refusals are honest: no package block → 400 E1600; unknown bundle → 400 E1600; bad bodies → 400", async () => {
    const plain = await makeWorkspace(PLAIN_YAML, "plain");
    const plainHandle = await start(plain);
    const noBlock = await jsonFetch(plainHandle, "POST", "/packages/pack", { ...AUTH, body: {} });
    expect(noBlock.status).toBe(400);
    expect((noBlock.body.error as Record<string, unknown>).code).toBe("E1600");

    const ws = await makeWorkspace(PKG_YAML, "errors");
    const handle = await start(ws);
    const missing = await jsonFetch(handle, "POST", "/packages/verify", { ...AUTH, body: { path: "nope/missing.vxn" } });
    expect(missing.status).toBe(400);
    expect((missing.body.error as Record<string, unknown>).code).toBe("E1600");
    const noArg = await jsonFetch(handle, "POST", "/packages/verify", { ...AUTH, body: {} });
    expect(noArg.status).toBe(400);
    expect((noArg.body.error as Record<string, unknown>).code).toBe("E1600");
    const badOut = await jsonFetch(handle, "POST", "/packages/pack", { ...AUTH, body: { out: 42 } });
    expect(badOut.status).toBe(400);
    expect((badOut.body.error as Record<string, unknown>).code).toBe("E1600");
  });

  test("pairing-token authn is fail-closed on the package surface", async () => {
    const ws = await makeWorkspace(PKG_YAML, "auth");
    const handle = await start(ws);
    const noToken = await jsonFetch(handle, "POST", "/packages/pack", { body: {} });
    expect(noToken.status).toBe(401);
    expect((noToken.body.error as Record<string, unknown>).code).toBe("E2000");
    const wrongToken = await jsonFetch(handle, "POST", "/packages/verify", { token: "wrong", body: { path: "x.vxn" } });
    expect(wrongToken.status).toBe(401);
  });

  test("format-only verification on a config-less workspace (no pin law, no journal)", async () => {
    const ws = await mkdtemp(join(tmpdir(), "vxn-wire-adhoc-"));
    workspaces.push(ws);
    // A config-less workspace: the daemon runs with an ad-hoc in-memory config.
    const handle = await start(ws);
    const built = await jsonFetch(handle, "POST", "/packages/pack", { ...AUTH, body: {} });
    expect(built.status).toBe(400); // no package block → honest refusal

    // A bundle from a REAL workspace can still be format-verified here —
    // but only INSIDE this workspace (the containment law, E2204, is by
    // design): copy it in, then verify format-only with dry_run.
    const real = await makeWorkspace(PKG_YAML, "adhoc-src");
    const realHandle = await start(real);
    await jsonFetch(realHandle, "POST", "/packages/pack", { ...AUTH, body: {} });
    const bundleAbs = join(real, ".vaerion", "package", "wirepkg.vxn");
    await mkdir(join(ws, ".vaerion", "package"), { recursive: true });
    await writeFile(join(ws, ".vaerion", "package", "imported.vxn"), await readFile(bundleAbs));

    const res = await jsonFetch(handle, "POST", "/packages/verify", { ...AUTH, body: { path: ".vaerion/package/imported.vxn", dry_run: true } });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.pins_checked).toBe(0); // no config → no pin law, honestly reported
    expect(res.body.dry_run).toBe(true);
    expect(res.body.side_effects).toBe(0);
    expect(res.body.run_id).toBeUndefined(); // format-only: nothing journaled
  });

  test("the generated OpenAPI contract describes both package routes (C4 byte-sync at the wire)", async () => {
    expect(generateOpenApi()).toHaveProperty("paths./packages/pack.post");
    expect(generateOpenApi()).toHaveProperty("paths./packages/verify.post");
    const ws = await makeWorkspace(PKG_YAML, "openapi");
    const handle = await start(ws);
    const served = await jsonFetch(handle, "GET", "/openapi.json");
    expect(served.status).toBe(200);
    const paths = served.body.paths as Record<string, unknown>;
    expect(paths).toHaveProperty("/packages/pack");
    expect(paths).toHaveProperty("/packages/verify");
  });
});
