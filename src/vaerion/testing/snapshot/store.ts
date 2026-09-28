/**
 * Vaerion — Testing / Snapshot Store (Node)
 *
 * The persistence of the Snapshot Authority's working capture set — a
 * pipeline artifact under tools/vaerion-pipeline/snapshots/ (F-002: "build
 * outputs … belong to pipeline tooling, never to the constitution tree").
 * The store is append-only in law:
 *
 *   - Records are written once; writing a record that already exists with a
 *     different identity is refused (a modified snapshot is a constitutional
 *     event, never a silent overwrite).
 *   - The pinned manifest is written once; a changed canon is a SUPERSEDING
 *     manifest (F-002 law 3; 8.1) — the store refuses to overwrite a pin.
 *
 * NODE-ONLY: imports node:fs. Import from pipeline tooling
 * (tools/vaerion-pipeline/*), never from the pure engine.
 *
 * Citations: Implementation Constitution 9.3, 8.1 (supersession), 1.6
 * (honesty); Foundation Amendment F-002 laws 1–5; order Deliverable 1.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ConstitutionalViolationError } from '../../foundation/authority';
import type { SnapshotManifest, SnapshotRecord } from './engine';

const TESTING_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
/** Pipeline artifact root — working captures, never the constitution canon. */
export const SNAPSHOT_STORE_ROOT = join(TESTING_DIR, 'tools', 'vaerion-pipeline', 'snapshots');
const RECORDS_FILE = join(SNAPSHOT_STORE_ROOT, 'working-captures.json');
const MANIFEST_FILE = join(SNAPSHOT_STORE_ROOT, 'manifest.json');

interface StoreShape {
  readonly storeId: 'vaerion-snapshot-working-captures';
  readonly law: string;
  readonly records: readonly SnapshotRecord[];
}

function ensureDir(path: string): void {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function readStore(): StoreShape {
  if (!existsSync(RECORDS_FILE)) {
    return {
      storeId: 'vaerion-snapshot-working-captures',
      law: 'working capture set — pipeline artifacts pending Founder ratification into the fidelity canon (IR-015); snapshots are evidence, drift fails closed, no manual approval (F-002; 9.3)',
      records: [],
    };
  }
  return JSON.parse(readFileSync(RECORDS_FILE, 'utf8')) as StoreShape;
}

/** Loads the working capture set. */
export function loadWorkingCaptures(): readonly SnapshotRecord[] {
  return Object.freeze(readStore().records);
}

/**
 * Appends a record to the working capture set. A snapshotId that already
 * exists must carry the identical record (idempotent capture); any other
 * re-write is refused — the store appends, it never edits (F-002 law 3).
 */
export function appendWorkingCapture(record: SnapshotRecord): void {
  const store = readStore();
  const existing = store.records.find((candidate) => candidate.snapshotId === record.snapshotId);
  if (existing) {
    if (existing.sha256 !== record.sha256) {
      throw new ConstitutionalViolationError(
        '9.3 / F-002',
        `Snapshot "${record.snapshotId}" already exists in the working capture set with a different identity (stored ${existing.sha256.slice(0, 16)}…, attempted ${record.sha256.slice(0, 16)}…). The store appends and never edits; a changed capture is a new governed capture, not an overwrite (F-002 law 3).`,
      );
    }
    return;
  }
  const next: StoreShape = { ...store, records: Object.freeze([...store.records, record]) };
  ensureDir(SNAPSHOT_STORE_ROOT);
  writeFileSync(RECORDS_FILE, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

/** Loads the pinned manifest, or null while nothing is pinned. */
export function loadPinnedManifest(): SnapshotManifest | null {
  if (!existsSync(MANIFEST_FILE)) return null;
  return JSON.parse(readFileSync(MANIFEST_FILE, 'utf8')) as SnapshotManifest;
}

/**
 * Pins the manifest. A pinned manifest is immutable: the store refuses to
 * overwrite it. A changed canon goes through `supersedePinnedManifest`,
 * which appends a superseding manifest naming what it supersedes (F-002
 * law 3; 8.1) — there is no edit path.
 */
export function pinWorkingManifest(manifest: SnapshotManifest): void {
  if (existsSync(MANIFEST_FILE)) {
    throw new ConstitutionalViolationError(
      '9.3 / F-002',
      'A manifest is already pinned for the working capture set. Pinned manifests are immutable (F-002 law 3); a changed canon is a superseding manifest, never an overwrite (8.1 supersession law).',
    );
  }
  ensureDir(SNAPSHOT_STORE_ROOT);
  writeFileSync(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

/**
 * Appends a superseding manifest after rotating the previous pin to the
 * append-only history file. The previous manifest is preserved verbatim —
 * historical truth is never retired (11.4).
 */
export function supersedePinnedManifest(next: SnapshotManifest): void {
  const current = loadPinnedManifest();
  if (!current) {
    throw new ConstitutionalViolationError(
      '9.3 / F-002',
      'No manifest is pinned; there is nothing to supersede. Pin the initial manifest first (F-002 law 1 — ratified, never casual).',
    );
  }
  if (next.supersedes !== current.manifestId) {
    throw new ConstitutionalViolationError(
      '8.1 / F-002',
      `Superseding manifest "${next.manifestId}" does not name the pinned manifest it supersedes ("${current.manifestId}"). A supersession must link its parent (8.1; F-002 law 3).`,
    );
  }
  const historyFile = join(SNAPSHOT_STORE_ROOT, 'manifest-history.json');
  const history: { readonly historyId: string; readonly manifests: readonly SnapshotManifest[] } = existsSync(historyFile)
    ? (JSON.parse(readFileSync(historyFile, 'utf8')) as { historyId: string; manifests: SnapshotManifest[] })
    : { historyId: 'vaerion-snapshot-manifest-history', manifests: [] };
  const updated = { ...history, manifests: [...history.manifests, current] };
  writeFileSync(historyFile, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');
  writeFileSync(MANIFEST_FILE, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}
