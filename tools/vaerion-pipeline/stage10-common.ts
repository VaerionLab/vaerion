/**
 * VAERION PIPELINE — Stage 10 shared machinery
 *
 * Node-side helpers for the release gates: the signing key identity, the
 * protocol version reader (11.3), the deterministic source manifest, and
 * the registered announcement ids (F-003).
 *
 * Citations: Constitution Part X, 10.3, 11.3, 2.8, P-6; F-003; F-006;
 * order Deliverables 1–10.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import type { BuildInput } from '../../src/vaerion/release/build';
import type { SigningKey } from '../../src/vaerion/release/receipt';

const ROOT = process.cwd();

/** The release signing key identity — fingerprint over the public key material (Art. III; IR-017). */
export function loadSigningKey(): SigningKey {
  const pemPath = join(ROOT, 'keys', 'release-signing.pub');
  if (!existsSync(pemPath)) {
    throw new Error(
      'The release signing key is missing at keys/release-signing.pub. A release whose receipt cannot be produced does not ship (Constitution 10.3).',
    );
  }
  const pem = readFileSync(pemPath, 'utf8');
  return {
    keyId: 'release-signing',
    fingerprint: createHash('sha256').update(pem, 'utf8').digest('hex'),
  };
}

/** The constitutional changelog protocol version at runtime (11.3 — versioned like a protocol). */
export function readProtocolVersion(): string {
  const changelogPath = join(ROOT, 'constitution', 'CHANGELOG.md');
  const text = readFileSync(changelogPath, 'utf8');
  const match = text.match(/^## \[(\d+\.\d+\.\d+)\]/m);
  if (!match) {
    throw new Error(
      'The constitutional changelog carries no protocol version. The changelog is versioned like a protocol (Constitution 11.3).',
    );
  }
  return match[1];
}

/** Walks a directory recursively collecting file paths. */
function walk(dir: string, into: string[]): void {
  for (const item of readdirSync(dir)) {
    const full = join(dir, item);
    if (statSync(full).isDirectory()) {
      walk(full, into);
    } else {
      into.push(full);
    }
  }
}

/**
 * The deterministic source manifest of the constitutional tree: every file
 * under constitution/, src/vaerion/, and generated/, hashed and sorted
 * canonically (order Deliverable 3 — identical sources, identical outputs).
 */
export function computeSourceManifest(): BuildInput[] {
  const roots = ['constitution', join('src', 'vaerion'), 'generated'];
  const files: string[] = [];
  for (const root of roots) {
    const full = join(ROOT, root);
    if (existsSync(full)) walk(full, files);
  }
  return files
    .map((file) => ({
      path: relative(ROOT, file).split('\\').join('/'),
      sha256: createHash('sha256').update(readFileSync(file)).digest('hex'),
    }))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/** Hashes one file's bytes (pipeline-side artifact digests). */
export function fileSha256(relativePath: string): string {
  return createHash('sha256').update(readFileSync(join(ROOT, relativePath))).digest('hex');
}

/** The registered announcement ids of the Announcement & Copy Registry (F-003). */
export function registeredAnnouncementIds(): string[] {
  const dir = join(ROOT, 'constitution', 'announcement-registry');
  const ids: string[] = [];
  for (const file of ['stage4-proposed-strings.json', 'stage6-proposed-strings.json']) {
    const path = join(dir, file);
    if (!existsSync(path)) continue;
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as {
      strings?: readonly { readonly id: string }[];
    };
    for (const entry of parsed.strings ?? []) ids.push(entry.id);
  }
  return ids;
}

/** Resolves the pipeline directory (for artifact and observatory paths). */
export function pipelineDir(): string {
  return resolve(join(ROOT, 'tools', 'vaerion-pipeline'));
}

/**
 * The real package contents each distribution channel carries, hashed from
 * the repository (order Deliverable 7 — packages assembled from real,
 * hashed contents).
 */
export function realPackageContents(): Record<string, { name: string; sha256: string }[]> {
  return {
    npm: [
      { name: 'packaging/npm/package.json', sha256: fileSha256('packaging/npm/package.json') },
      { name: 'packaging/npm/bin/vae.js', sha256: fileSha256('packaging/npm/bin/vae.js') },
      { name: 'packaging/npm/make-package.sh', sha256: fileSha256('packaging/npm/make-package.sh') },
    ],
    pypi: [
      { name: 'packaging/python/pyproject.toml', sha256: fileSha256('packaging/python/pyproject.toml') },
      { name: 'packaging/python/vaerion/cli.py', sha256: fileSha256('packaging/python/vaerion/cli.py') },
    ],
    vscode: [
      { name: 'editors/vscode/extension.js', sha256: fileSha256('editors/vscode/extension.js') },
      { name: 'editors/vscode/package.json', sha256: fileSha256('editors/vscode/package.json') },
    ],
    jetbrains: [
      { name: 'editors/jetbrains/build.gradle.kts', sha256: fileSha256('editors/jetbrains/build.gradle.kts') },
      { name: 'editors/jetbrains/settings.gradle.kts', sha256: fileSha256('editors/jetbrains/settings.gradle.kts') },
    ],
    neovim: [{ name: 'editors/nvim/lua/vaerion/init.lua', sha256: fileSha256('editors/nvim/lua/vaerion/init.lua') }],
    cli: [
      { name: 'packages/vaerion/src/cli/vae.ts', sha256: fileSha256('packages/vaerion/src/cli/vae.ts') },
      { name: 'packages/vaerion/src/cli/commands.ts', sha256: fileSha256('packages/vaerion/src/cli/commands.ts') },
    ],
    'docs-bundle': [
      { name: 'docs/book/README.md', sha256: fileSha256('docs/book/README.md') },
      { name: 'docs/SDK.md', sha256: fileSha256('docs/SDK.md') },
    ],
    'offline-bundle': [
      { name: 'llms.txt', sha256: fileSha256('llms.txt') },
      { name: 'llms-full.txt', sha256: fileSha256('llms-full.txt') },
    ],
  };
}
