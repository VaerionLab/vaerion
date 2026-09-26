/**
 * Vaerion CLI — the recovery surface (snapshot / restore).
 *
 * `vae snapshot` archives the workspace evidence whitelist into a
 * byte-deterministic tar pinned by its blake3 digest: identical state,
 * identical bytes. A `_vaerion/snapshot.json` manifest embeds per-entry
 * digests so a restore can verify BEFORE it writes.
 *
 * `vae restore` is fail-closed: digest law first (E1501 on any mismatch),
 * conflict law second (differing files refuse with the list until
 * --force), journals re-verified after the bytes land.
 */
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import type { CommandContext } from "./commands.ts";
import { ExitCode } from "./io.ts";
import { VaerionError } from "../kernel/errors.ts";
import { blake3HexOf } from "../kernel/hash.ts";
import { packTar, parseTar, type TarEntry } from "../kernel/tar.ts";
import { workspaceAt } from "./workspace.ts";
import { Renderer } from "./render.ts";
import { verifyJournal } from "../journal/verify.ts";

const MANIFEST_PATH = "_vaerion/snapshot.json";
const MANIFEST_SCHEMA = "vaerion.snapshot/1";

interface SnapshotManifest {
  schema: string;
  files: number;
  entries: Array<{ path: string; blake3: string }>;
}

function ioLine(ctx: CommandContext, line: string): void {
  ctx.io.out(line);
}

/** Not-a-workspace teaching refusal (E1600 + `vae init`, the standing law). */
async function requireWorkspace(ctx: CommandContext): Promise<ReturnType<typeof workspaceAt>> {
  const ws = workspaceAt(ctx.cwd);
  const exists = await stat(ws.configPath).then(
    () => true,
    () => false,
  );
  if (!exists) {
    throw new VaerionError("E1600", "not a Vaerion workspace (no vaerion.yaml found). Fix: run `vae init`");
  }
  return ws;
}

/** Recursive byte-walk used for the blob store whitelist leg. */
async function walkFiles(root: string, dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const item of (await readdir(dir, { withFileTypes: true })).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const full = join(dir, item.name);
    if (item.isDirectory()) out.push(...(await walkFiles(root, full)));
    else if (item.isFile()) out.push(relative(root, full).split("\\").join("/"));
  }
  return out.sort();
}

/** The evidence whitelist: config, journals, audit chain, blob CAS. Nothing else. */
async function whitelistEntries(ctx: CommandContext, ws: ReturnType<typeof workspaceAt>, excludeAbs: string | null): Promise<TarEntry[]> {
  const paths: string[] = [];
  paths.push("vaerion.yaml");
  const journalDir = join(ws.vaerionDir, "journal");
  if ((await stat(journalDir).then(() => true, () => false))) {
    for (const f of (await readdir(journalDir)).filter((f) => f.endsWith(".ndjson")).sort()) {
      paths.push(relative(ws.root, join(journalDir, f)).split("\\").join("/"));
    }
  }
  if ((await stat(ws.auditPath).then(() => true, () => false))) paths.push(".vaerion/audit.log");
  const blobsDir = join(ws.vaerionDir, "blobs");
  if ((await stat(blobsDir).then(() => true, () => false))) paths.push(...(await walkFiles(ws.root, blobsDir)));

  const entries: TarEntry[] = [];
  for (const p of [...new Set(paths)].sort()) {
    const abs = resolve(ws.root, p);
    if (excludeAbs !== null && abs === excludeAbs) continue; // never self-capture
    const data = new Uint8Array(await readFile(abs));
    entries.push({ path: p, data });
  }
  return entries;
}

/** The manifest pins every whitelisted entry by its blake3 digest. */
function buildManifest(entries: readonly TarEntry[], digests: ReadonlyMap<string, string>): SnapshotManifest {
  return {
    schema: MANIFEST_SCHEMA,
    files: entries.length,
    entries: entries.map((e) => ({ path: e.path, blake3: digests.get(e.path)! })),
  };
}

/** Output payload law: one machine line in JSON mode; teaching lines otherwise. */
function emit(ctx: CommandContext, payload: Record<string, unknown>, plain: string[]): number {
  if (ctx.mode === "json") {
    new Renderer(ctx.io, ctx.mode, ctx.env).result(payload);
  } else {
    for (const line of plain) ioLine(ctx, line);
  }
  return ExitCode.ok;
}

export async function cmdSnapshot(ctx: CommandContext): Promise<number> {
  const ws = await requireWorkspace(ctx);
  const spin = new Renderer(ctx.io, ctx.mode, ctx.env).spinner();
  spin?.start?.("planning the evidence archive");
  const outFlag = typeof ctx.flags.out === "string" ? String(ctx.flags.out) : "vaerion-snapshot.tar";
  const outAbs = resolve(ctx.cwd, outFlag);
  const dryRun = ctx.flags["dry-run"] === true || ctx.dryRun === true;

  const entries = await whitelistEntries(ctx, ws, outAbs);
  // Digests first (async law), then the manifest, then the archive bytes.
  const digestByPath = new Map<string, string>();
  for (const e of entries) digestByPath.set(e.path, await blake3HexOf(e.data));
  const manifest = buildManifest(entries, digestByPath);
  const manifestData = new TextEncoder().encode(JSON.stringify(manifest, null, 2) + "\n");
  const archive = packTar([...entries, { path: MANIFEST_PATH, data: manifestData }]);
  const digest = await blake3HexOf(archive);
  spin?.succeed?.(`archive planned: ${entries.length + 1} entries, digest ${digest.slice(0, 12)}…`);

  if (!dryRun) {
    await writeFile(outAbs, archive);
  }
  return emit(
    ctx,
    { command: "snapshot", out: relative(ctx.cwd, outAbs).split("\\").join("/"), dry_run: dryRun, digest, manifest },
    dryRun
      ? [`plan: ${entries.length + 1} entries would be archived (digest ${digest})`, "dry-run: nothing written (the plan IS the outcome)"]
      : [`snapshot written: ${outFlag} (digest ${digest.slice(0, 12)}…)`, "identical state → identical bytes; restore with `vae restore <archive>`"],
  );
}

export async function cmdRestore(ctx: CommandContext): Promise<number> {
  const ws = await requireWorkspace(ctx);
  const archiveArg = ctx.flags._positional1;
  if (typeof archiveArg !== "string" || archiveArg.length === 0) {
    throw new VaerionError("E1600", "missing ARCHIVE path (Fix: `vae restore <archive.tar> [--force]`)");
  }
  const archiveAbs = resolve(ctx.cwd, archiveArg);
  const bytes = new Uint8Array(
    await readFile(archiveAbs).catch((err: NodeJS.ErrnoException) => {
      if (err?.code === "ENOENT") throw new VaerionError("E1600", `archive not found at ${archiveArg}`);
      throw err;
    }),
  );
  const force = ctx.flags.force === true;
  const dryRun = ctx.flags["dry-run"] === true;
  const spin = new Renderer(ctx.io, ctx.mode, ctx.env).spinner();
  spin?.start?.(`verifying ${archiveArg}`);

  const digest = await blake3HexOf(bytes);
  const entries = parseTar(bytes); // checksum + truncation law (E1501) enforced here
  const manifestEntry = entries.find((e) => e.path === MANIFEST_PATH);
  if (!manifestEntry) throw new VaerionError("E1501", `digest mismatch: ${MANIFEST_PATH} missing — the archive is not a Vaerion snapshot`);
  let manifest: SnapshotManifest;
  try {
    manifest = JSON.parse(new TextDecoder().decode(manifestEntry.data)) as SnapshotManifest;
  } catch {
    throw new VaerionError("E1501", `digest mismatch: ${MANIFEST_PATH} is not valid JSON`);
  }
  if (manifest?.schema !== MANIFEST_SCHEMA || !Array.isArray(manifest.entries)) {
    throw new VaerionError("E1501", `digest mismatch: manifest schema is not ${MANIFEST_SCHEMA}`);
  }

  // Path-safety law BEFORE anything else: a crafted archive whose manifest
  // digests match may still carry traversal or absolute paths — only this
  // law refuses it, and it refuses the WHOLE restore (E1501).
  for (const entry of entries) {
    const p = entry.path;
    if (p.length === 0 || p.startsWith("/") || p.split("/").some((part, i, parts) => part === ".." && parts.slice(0, i).filter((q) => q.length > 0 && q !== ".").length === 0)) {
      throw new VaerionError("E1501", `unsafe archive path: ${p.length === 0 ? "(empty)" : p} — the archive is not the state it pins`);
    }
    let depth = 0;
    for (const part of p.split("/")) {
      if (part === "..") depth--;
      else if (part.length > 0 && part !== ".") depth++;
      if (depth < 0) throw new VaerionError("E1501", `unsafe archive path: ${p} — the archive is not the state it pins`);
    }
  }

  // Digest law BEFORE any byte lands: every manifest entry verifies, every
  // non-manifest archive entry is manifest-pinned. Nothing partial escapes.
  const byPath = new Map(entries.map((e) => [e.path, e]));
  for (const pinned of manifest.entries) {
    const actual = byPath.get(pinned.path);
    if (!actual) throw new VaerionError("E1501", `digest mismatch: manifest pins "${pinned.path}" but the archive lacks it`);
    if ((await blake3HexOf(actual.data)) !== pinned.blake3) {
      throw new VaerionError("E1501", `digest mismatch for ${pinned.path} — the archive is not the state it pins`);
    }
  }
  for (const entry of entries) {
    if (entry.path !== MANIFEST_PATH && !manifest.entries.some((m) => m.path === entry.path)) {
      throw new VaerionError("E1501", `digest mismatch: archive carries unpinned entry ${entry.path}`);
    }
  }
  spin?.succeed?.(`verified: ${manifest.entries.length} pinned entries, digest ${digest.slice(0, 12)}…`);

  // Conflict law: differing files refuse with the list — nothing written — until --force.
  let created = 0;
  let overwritten = 0;
  let identical = 0;
  const conflicts: string[] = [];
  for (const pinned of manifest.entries) {
    const abs = resolve(ws.root, pinned.path);
    const existing = await stat(abs).then(() => true, () => false);
    if (!existing) continue;
    const same = new Uint8Array(await readFile(abs)).every((b, i) => b === byPath.get(pinned.path)!.data[i]);
    if (same) identical++;
    else conflicts.push(pinned.path);
  }
  if (conflicts.length > 0 && !force) {
    throw new VaerionError(
      "E1600",
      `restore refuses ${conflicts.length} differing file(s): ${conflicts.join(", ")}. Fix: re-run with --force to overwrite them`,
    );
  }

  if (!dryRun) {
    for (const pinned of manifest.entries) {
      const abs = resolve(ws.root, pinned.path);
      const data = byPath.get(pinned.path)!.data;
      const existing = await stat(abs).then(() => true, () => false);
      if (!existing) created++;
      else if (conflicts.includes(pinned.path)) overwritten++;
      await mkdir(join(abs, ".."), { recursive: true });
      if (!existing || conflicts.includes(pinned.path)) await writeFile(abs, data);
    }
    // Journals re-verified after the bytes land (the recovery contract).
    for (const f of ((await readdir(join(ws.vaerionDir, "journal")).catch(() => [] as string[])) as string[]).filter((f) => f.endsWith(".ndjson")).sort()) {
      const report = await verifyJournal(join(ws.vaerionDir, "journal", f));
      if (!report.ok) {
        throw new VaerionError("E1501", `digest mismatch: restored journal ${f} fails verification — ${report.issues[0]?.message ?? "unknown issue"}`);
      }
    }
  }

  return emit(
    ctx,
    { command: "restore", archive: archiveArg, digest, dry_run: dryRun, manifest, verified: { ok: true }, created_count: created, identical_count: identical, overwritten_count: overwritten, forced: force },
    [
      `restore ${dryRun ? "plan" : "complete"}: ${created} created, ${overwritten} overwritten, ${identical} identical (digest ${digest.slice(0, 12)}…)`,
      "journals re-verified — the restored state is the pinned state",
    ],
  );
}
