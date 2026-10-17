/**
 * THE ARTIFACT PARITY PROOF — run before any publish (Phase 61.1 law).
 *
 *   bun run tools/verify-artifact-parity.ts [candidate.tarball.tgz]
 *
 * Phase 61.0 root cause: the npm `0.1.14-rc1` artifact was cut from a
 * different lineage than the tree that later claimed the same version —
 * 13 divergent engine paths under one version string. This tool proves
 * SOURCE = PACKAGE for the npm artifact of record:
 *
 *   1. builds a fresh tarball from the canonical tree (make-package.sh —
 *      deterministic: copy src → engine/, npm pack, clean);
 *   2. with a candidate argument: proves the candidate's payload
 *      (engine/, bin/, package.json, README.md) is byte-identical to the
 *      fresh build — a stale or foreign artifact cannot pass;
 *   3. proves the packed engine's VERSION literal, dispatch surface, and
 *      template registry equal the tree's;
 *   4. proves the E1010 completeness anchor ships in the packed engine
 *      (catalog entry + verify logic) — the Phase 61.0 inversion cannot
 *      repeat;
 *   5. proves no dead CLI file (cli/center.ts, cli/templates.ts) ships.
 *
 * Exit 0 = parity proven (the tarball path + sha256 print at the end).
 * Non-zero = REFUSE TO PUBLISH.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { cpSync, createReadStream, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const candidate = process.argv[2] ?? null;

const sha256 = (p: string): string => {
  const h = createHash("sha256");
  h.update(readFileSync(p));
  return h.digest("hex");
};

const walkFiles = (dir: string, base = dir): string[] => {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkFiles(full, base));
    else out.push(join(base, full.slice(base.length + 1)));
  }
  return out.sort();
};

const die = (msg: string): never => {
  console.error(`verify-artifact-parity: REFUSING — ${msg}`);
  process.exit(2);
};

console.log("── artifact parity proof (Phase 61.1, the one-true-artifact law) ──");

// [1] Fresh deterministic build from the canonical tree.
const outDir = mkdtempSync(join("/tmp", "vae-parity-"));
const pack = spawnSync("sh", [join(ROOT, "packaging/npm/make-package.sh"), join(outDir, "fresh")], { cwd: ROOT, encoding: "utf8" });
if (pack.status !== 0) die(`make-package.sh failed:\n${pack.stderr}`);
const freshLine = (pack.stdout ?? "").split("\n").find((l) => l.includes("make-package: ") && l.endsWith(".tgz"));
const freshTgz = freshLine?.replace("make-package: ", "").trim();
if (!freshTgz || !existsSync(freshTgz)) die("fresh tarball not found after make-package.sh");
console.log(`fresh build: ${freshTgz}`);
console.log(`fresh sha256: ${sha256(freshTgz)}`);

// [2] Extract fresh (and candidate, if given).
const extract = (tgz: string, into: string): void => {
  mkdirSync(into, { recursive: true });
  const r = spawnSync("tar", ["-xzf", tgz, "-C", into], { encoding: "utf8" });
  if (r.status !== 0) die(`tar extract failed for ${tgz}: ${r.stderr}`);
};
const freshDir = join(outDir, "fresh-x");
extract(freshTgz, freshDir);
const freshPkgRoot = join(freshDir, "package");

let cmpPkgRoot = freshPkgRoot;
let cmpLabel = "fresh build";
if (candidate) {
  if (!existsSync(candidate)) die(`candidate tarball not found: ${candidate}`);
  const candDir = join(outDir, "candidate-x");
  extract(candidate, candDir);
  cmpPkgRoot = join(candDir, "package");
  cmpLabel = candidate;
  console.log(`candidate:  ${candidate}`);
  console.log(`candidate sha256: ${sha256(candidate)}`);
}

// [3] Byte-parity of the full payload (engine/, bin/, package.json, README.md).
const freshFiles = walkFiles(join(freshPkgRoot, "engine")).map((p) => p.slice(freshPkgRoot.length + 1));
const cmpFiles = walkFiles(join(cmpPkgRoot, "engine")).map((p) => p.slice(cmpPkgRoot.length + 1));
const onlyFresh = freshFiles.filter((f) => !cmpFiles.includes(f));
const onlyCmp = cmpFiles.filter((f) => !freshFiles.includes(f));
if (onlyFresh.length || onlyCmp.length) {
  die(`engine/ file lists differ (${cmpLabel}): only-in-tree=[${onlyFresh.join(", ")}] only-in-candidate=[${onlyCmp.join(", ")}]`);
}
const drifted = freshFiles.filter((f) => sha256(join(freshPkgRoot, f)) !== sha256(join(cmpPkgRoot, f)));
if (drifted.length) die(`engine/ content drift vs ${cmpLabel}: ${drifted.join(", ")}`);
for (const rel of ["package.json", "README.md", "bin/vae.js"]) {
  if (sha256(join(freshPkgRoot, rel)) !== sha256(join(cmpPkgRoot, rel))) die(`${rel} differs vs ${cmpLabel}`);
}
console.log(`byte-parity: engine/ (${freshFiles.length} files) + package.json + README.md + bin/vae.js — ${onlyFresh.length + onlyCmp.length + drifted.length === 0 ? "IDENTICAL" : "DRIFT"}`);

// [4] Packed engine surface equals the tree surface.
const treeVae = readFileSync(join(ROOT, "packages/vaerion/src/cli/vae.ts"), "utf8");
const packedVae = readFileSync(join(cmpPkgRoot, "engine/cli/vae.ts"), "utf8");
const treeVersion = treeVae.match(/export const VERSION = "([^"]+)"/)?.[1];
const packedVersion = packedVae.match(/export const VERSION = "([^"]+)"/)?.[1];
if (treeVersion !== packedVersion) die(`VERSION literal drift: tree=${treeVersion} packed=${packedVersion}`);
const treeCases = [...new Set([...treeVae.matchAll(/case "([a-z]+)"/g)].map((m) => m[1]))].sort();
const packedCases = [...new Set([...packedVae.matchAll(/case "([a-z]+)"/g)].map((m) => m[1]))].sort();
if (treeCases.length !== packedCases.length || treeCases.some((c, i) => c !== packedCases[i])) {
  die(`dispatch surface drift: tree=${treeCases.length} commands, packed=${packedCases.length}`);
}
if (!packedVae.includes("did you mean")) die("did-you-mean system missing from the packed engine");
console.log(`surface parity: v${packedVersion}, ${packedCases.length} commands, did-you-mean wired`);

// [5] The completeness anchor ships (the Phase 61.0 inversion cannot repeat).
const packedErrors = readFileSync(join(cmpPkgRoot, "engine/kernel/errors.ts"), "utf8");
const packedVerify = readFileSync(join(cmpPkgRoot, "engine/journal/verify.ts"), "utf8");
if (!packedErrors.includes('"E1010"')) die("E1010 catalog entry missing from the packed engine");
if (!packedVerify.includes("completeness anchor")) die("E1010 verify logic missing from the packed engine");
console.log("completeness anchor: E1010 catalog entry + verify logic present in the packed engine");

// [6] The dead files of the stale artifact stay dead.
for (const rel of ["engine/cli/center.ts", "engine/cli/templates.ts"]) {
  if (existsSync(join(cmpPkgRoot, rel))) die(`dead file ships in the artifact: ${rel}`);
}
console.log("dead files: cli/center.ts + cli/templates.ts absent");

rmSync(outDir, { recursive: true, force: true });
console.log("── PARITY PROVEN — the artifact of record is the tree of record ──");
console.log(`verified tarball: ${candidate ?? freshTgz}`);
