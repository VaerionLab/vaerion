/**
 * Vaerion — Testing / Snapshot Authority Engine
 *
 * The Snapshot Authority (Foundation Amendment F-002; Constitution 9.3;
 * implementation necessity P-6) is the organ that defines and preserves the
 * fidelity canon — the ratified reference renderings against which "two
 * teams, working independently, produce the same product" (P-6) is
 * mechanically judged. This module is the engine of that authority:
 *
 *   - Snapshot creation        — a capture is an immutable record of
 *                                structural invariants, frozen at capture.
 *   - Snapshot comparison      — digest-first; divergence is a difference,
 *                                never a judgment call (9.1 form).
 *   - Integrity verification   — SHA-256 identity binding over the record's
 *                                canonical content AND its citations.
 *   - Drift detection          — fail closed: any divergence from the pinned
 *                                manifest is a ConstitutionalViolationError.
 *   - Immutable records        — records are frozen at construction; the
 *                                store appends; nothing edits.
 *   - Constitutional citations — an uncitable snapshot is invalid (P-4;
 *                                Art. XI — nothing unmeasured ships).
 *
 * Law of this engine (order Deliverable 1; F-002):
 *   "Snapshots are evidence, not opinions."  — a record holds what was
 *     captured, never an assessment of it.
 *   "Drift must fail closed."                — drift throws; nothing
 *     continues past an unresolved divergence (10.1 form).
 *   "No manual approval bypass."             — no approval API exists here.
 *     The canon evolves only through the governance pathway: a superseding
 *     manifest, appended with its own citations (correction by superseding
 *     records — the receipt law of 8.1 applied to the canon itself).
 *
 * The ratified canon lives in the constitution tree
 * (constitution/snapshot-authority/). Working capture sets are pipeline
 * artifacts under tools/vaerion-pipeline/snapshots/ (snapshot/store.ts) —
 * the constitution tree holds ratified law only (F-002, "What Does Not
 * Belong Here"). Promotion of a working set into the canon is a Founder
 * ruling (filed as IR-015).
 *
 * Citations: Implementation Constitution 9.3, 9.1, P-4, P-6, 10.1, 8.1
 * (supersession precedent); Foundation Amendment F-002; Bible Art. XI.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../../foundation/citations';
import { assertTraceable, ConstitutionalViolationError } from '../../foundation/authority';
import type { HashFunction } from '../../authorities/hash';

/** The subject a snapshot captures — a structural rendering question (9.3). */
export interface SnapshotSubject {
  /** The surface (or engine unit) captured — e.g. a registered surface id. */
  readonly surface: string;
  /** The rendering target: screen-desktop, screen-mobile, print, grayscale, forced-colors, reduced-motion, export. */
  readonly target: string;
  /** The registered rendering mode the target resolves (VS §11), where applicable. */
  readonly mode: string | null;
  /** The breakpoint contract applied, where applicable (7.5; IR-010 pins). */
  readonly breakpoint: string | null;
  /** The canonical states the subject renders (Part V). */
  readonly states: readonly string[];
}

/** What a snapshot binds — canonical structural invariants, not pixels. */
export interface SnapshotContent {
  /**
   * The canonical invariant lines of the capture — the structural identity
   * of the rendering (strata chain, layer bindings, anatomy order, visible
   * obligations). Snapshots are evidence of structure, not of opinions
   * about appearance (9.3; P-6 — "visually identical" is judged against the
   * ratified canonical rendering set, and structure is what two independent
   * teams must hold identical for fidelity to be provable).
   */
  readonly invariants: readonly string[];
  /** The constitutional citations the capture asserts (P-4). */
  readonly citations: readonly Citation[];
}

/** One immutable snapshot record. Frozen at construction (F-002 law 1). */
export interface SnapshotRecord {
  readonly snapshotId: string;
  readonly subject: SnapshotSubject;
  readonly invariants: readonly string[];
  readonly citations: readonly Citation[];
  /** Injected capture time (P-6 — the clock is never read implicitly). */
  readonly capturedAt: number;
  /**
   * SHA-256 identity binding: hash over the canonical form of the subject,
   * the invariants, and the citations. Any change to any of the three
   * breaks identity and is detected (order Deliverable 1 — SHA-256 identity
   * binding; F-002 law 2 — comparison is digest-first).
   */
  readonly sha256: string;
}

/** A pinned manifest: the digest record of a capture set. Immutable. */
export interface SnapshotManifest {
  readonly manifestId: string;
  readonly algorithm: 'sha256';
  readonly pinnedAt: number;
  /** The pinned records: snapshotId → digest. */
  readonly pins: readonly { readonly snapshotId: string; readonly sha256: string }[];
  /** The manifest this one supersedes, if any (correction by supersession). */
  readonly supersedes: string | null;
  /** The governance citations under which this manifest was pinned (P-4). */
  readonly citations: readonly Citation[];
}

const ENGINE_CITATIONS: readonly Citation[] = [
  implementation('9.3', 'Snapshot Authority — divergence without an amendment is failure'),
  implementation('P-6', 'fidelity standard'),
  implementation('P-4', 'an uncitable artifact is a violation'),
];

function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, item) => {
    if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
      const record = item as Record<string, unknown>;
      const sorted: Record<string, unknown> = {};
      for (const key of Object.keys(record).sort()) sorted[key] = record[key];
      return sorted;
    }
    return item;
  });
}

/** The canonical identity of a snapshot: content and citations, bound. */
export function snapshotIdentity(subject: SnapshotSubject, content: SnapshotContent): string {
  return canonicalJson({ subject, invariants: content.invariants, citations: content.citations });
}

/**
 * Captures one snapshot (order Deliverable 1 — snapshot creation). The
 * record is frozen at construction; the clock and hash are injected (P-6).
 * An uncitable capture is rejected — snapshots are evidence, and evidence
 * without citation is not evidence (P-4; Art. XI).
 */
export function captureSnapshot(params: {
  readonly snapshotId: string;
  readonly subject: SnapshotSubject;
  readonly content: SnapshotContent;
  readonly clock: () => number;
  readonly hash: HashFunction;
}): SnapshotRecord {
  if (params.content.citations.length === 0) {
    throw new ConstitutionalViolationError(
      'P-4 / 9.3',
      `Snapshot "${params.snapshotId}" was captured without constitutional citations. An uncitable snapshot is an unmeasured artifact (P-4; Art. XI); every capture carries its governing citations.`,
      ENGINE_CITATIONS,
    );
  }
  for (const citation of params.content.citations) {
    assertTraceable(`snapshot:${params.snapshotId}`, [citation]);
  }
  const identity = snapshotIdentity(params.subject, params.content);
  const record: SnapshotRecord = Object.freeze({
    snapshotId: params.snapshotId,
    subject: Object.freeze({ ...params.subject, states: Object.freeze([...params.subject.states]) }),
    invariants: Object.freeze([...params.content.invariants]),
    citations: Object.freeze([...params.content.citations]),
    capturedAt: params.clock(),
    sha256: params.hash(identity),
  });
  return Object.freeze(record);
}

/**
 * Verifies the integrity of one snapshot record (order Deliverable 1 —
 * integrity verification). The identity digest is recomputed from the
 * record's own content and compared to its bound digest; an optional pin
 * compares against a manifest. Any mismatch is a violation — a modified
 * snapshot is not a snapshot (F-002 law 3 — never hand-edited).
 */
export function verifySnapshotIntegrity(
  record: SnapshotRecord,
  hash: HashFunction,
  pin?: { readonly sha256: string },
): void {
  const recomputed = hash(snapshotIdentity(record.subject, { invariants: record.invariants, citations: record.citations }));
  if (recomputed !== record.sha256) {
    throw new ConstitutionalViolationError(
      '9.3 / F-002',
      `Snapshot "${record.snapshotId}" failed integrity verification: the record's content does not hash to its bound identity. A modified snapshot is a constitutional event — snapshots are never hand-edited (F-002 law 3); the capture must be re-taken through the governance pathway.`,
      ENGINE_CITATIONS,
    );
  }
  if (pin && pin.sha256 !== record.sha256) {
    throw new ConstitutionalViolationError(
      '9.3 / F-002',
      `Snapshot "${record.snapshotId}" does not match its pinned digest (pinned ${pin.sha256.slice(0, 16)}…, found ${record.sha256.slice(0, 16)}…). Comparison is digest-first (F-002 law 2); divergence without a ratified amendment is failure (Constitution 9.3).`,
      ENGINE_CITATIONS,
    );
  }
}

/** The structural difference between two captures of one subject. */
export interface SnapshotDifference {
  readonly kind: 'invariant-added' | 'invariant-removed' | 'citation-added' | 'citation-removed';
  readonly detail: string;
}

/**
 * Compares a candidate capture against a baseline (order Deliverable 1 —
 * snapshot comparison). Returns the difference list; identical captures
 * return an empty list. Comparison is structural and exhaustive: invariants
 * and citations both (a divergence in claimed citations is drift too).
 */
export function compareSnapshots(baseline: SnapshotRecord, candidate: SnapshotRecord): readonly SnapshotDifference[] {
  const differences: SnapshotDifference[] = [];
  for (const line of baseline.invariants) {
    if (!candidate.invariants.includes(line)) {
      differences.push({ kind: 'invariant-removed', detail: line });
    }
  }
  for (const line of candidate.invariants) {
    if (!baseline.invariants.includes(line)) {
      differences.push({ kind: 'invariant-added', detail: line });
    }
  }
  const format = (citations: readonly Citation[]): readonly string[] =>
    citations.map((citation) => `${citation.document}:${citation.reference}`);
  for (const citation of format(baseline.citations)) {
    if (!format(candidate.citations).includes(citation)) {
      differences.push({ kind: 'citation-removed', detail: citation });
    }
  }
  for (const citation of format(candidate.citations)) {
    if (!format(baseline.citations).includes(citation)) {
      differences.push({ kind: 'citation-added', detail: citation });
    }
  }
  return Object.freeze(differences);
}

/**
 * Drift detection (order Deliverable 1 — fail closed). Any difference
 * between the baseline and the candidate throws — drift is never approved
 * here, never waived, never silenced (10.1 — no waivers; F-002 law 2).
 * The lawful path forward is the governance pathway, not this engine.
 */
export function assertNoDrift(params: {
  readonly baseline: SnapshotRecord;
  readonly candidate: SnapshotRecord;
}): void {
  const differences = compareSnapshots(params.baseline, params.candidate);
  if (differences.length > 0) {
    const detail = differences.map((d) => `${d.kind}: ${d.detail}`).join('; ');
    throw new ConstitutionalViolationError(
      '9.3',
      `Snapshot drift detected for "${params.baseline.snapshotId}" — ${detail}. Divergence from the reference rendering without a ratified amendment is failure (Constitution 9.3); drift fails closed and no manual approval path exists (order Deliverable 1; F-002 law 2).`,
      ENGINE_CITATIONS,
    );
  }
}

/**
 * Pins a capture set into a manifest (order Deliverable 1 — immutable
 * snapshot records). The manifest is frozen; a changed canon is a new
 * ratification — a superseding manifest — never an edit (F-002 law 3;
 * 8.1 supersession precedent).
 */
export function pinManifest(params: {
  readonly manifestId: string;
  readonly records: readonly SnapshotRecord[];
  readonly clock: () => number;
  readonly citations: readonly Citation[];
  readonly supersedes?: string | null;
}): SnapshotManifest {
  if (params.records.length === 0) {
    throw new ConstitutionalViolationError(
      '9.3 / F-002',
      `Manifest "${params.manifestId}" pins no records. An empty canon cannot be ratified; capture before pinning (F-002; 9.3).`,
      ENGINE_CITATIONS,
    );
  }
  if (params.citations.length === 0) {
    throw new ConstitutionalViolationError(
      'P-4',
      `Manifest "${params.manifestId}" carries no governance citations. A pin without its ratification citations is an uncitable instrument (P-4).`,
      ENGINE_CITATIONS,
    );
  }
  const seen = new Set<string>();
  for (const record of params.records) {
    if (seen.has(record.snapshotId)) {
      throw new ConstitutionalViolationError(
        '9.3',
        `Manifest "${params.manifestId}" pins snapshot "${record.snapshotId}" twice. One subject, one pin — duplicates are ambiguity, and ambiguity is violation (P-3).`,
        ENGINE_CITATIONS,
      );
    }
    seen.add(record.snapshotId);
  }
  return Object.freeze({
    manifestId: params.manifestId,
    algorithm: 'sha256' as const,
    pinnedAt: params.clock(),
    pins: Object.freeze(params.records.map((record) => Object.freeze({ snapshotId: record.snapshotId, sha256: record.sha256 }))),
    supersedes: params.supersedes ?? null,
    citations: Object.freeze([...params.citations]),
  });
}

/** The drift report over a pinned set vs the current captures. */
export interface DriftReport {
  readonly manifestId: string;
  readonly missing: readonly string[];
  readonly unpinned: readonly string[];
  readonly modified: readonly string[];
  readonly drifted: boolean;
}

/**
 * Detects drift between a pinned manifest and the current capture set
 * (order Deliverable 1 — drift detection): pinned records that are missing,
 * captures that are unpinned, and records whose identity no longer matches
 * their pin. The report is factual evidence; enforcement lives in
 * `assertNoManifestDrift`, which fails closed.
 */
export function detectManifestDrift(params: {
  readonly manifest: SnapshotManifest;
  readonly records: readonly SnapshotRecord[];
  readonly hash: HashFunction;
}): DriftReport {
  const byId = new Map(params.records.map((record) => [record.snapshotId, record]));
  const missing: string[] = [];
  const modified: string[] = [];
  for (const pin of params.manifest.pins) {
    const record = byId.get(pin.snapshotId);
    if (!record) {
      missing.push(pin.snapshotId);
      continue;
    }
    const recomputed = params.hash(
      snapshotIdentity(record.subject, { invariants: record.invariants, citations: record.citations }),
    );
    if (recomputed !== pin.sha256 || record.sha256 !== pin.sha256) {
      modified.push(pin.snapshotId);
    }
  }
  const pinnedIds = new Set(params.manifest.pins.map((pin) => pin.snapshotId));
  const unpinned = params.records.filter((record) => !pinnedIds.has(record.snapshotId)).map((record) => record.snapshotId);
  return Object.freeze({
    manifestId: params.manifest.manifestId,
    missing: Object.freeze(missing),
    unpinned: Object.freeze(unpinned),
    modified: Object.freeze(modified),
    drifted: missing.length > 0 || unpinned.length > 0 || modified.length > 0,
  });
}

/**
 * Fails closed on manifest drift (order Deliverable 1 — "drift must fail
 * closed"). Any missing, unpinned, or modified record is a violation.
 */
export function assertNoManifestDrift(params: {
  readonly manifest: SnapshotManifest;
  readonly records: readonly SnapshotRecord[];
  readonly hash: HashFunction;
}): void {
  const report = detectManifestDrift(params);
  if (report.drifted) {
    const parts: string[] = [];
    if (report.missing.length > 0) parts.push(`missing from captures: ${report.missing.join(', ')}`);
    if (report.unpinned.length > 0) parts.push(`unpinned captures: ${report.unpinned.join(', ')}`);
    if (report.modified.length > 0) parts.push(`identity diverged from pin: ${report.modified.join(', ')}`);
    throw new ConstitutionalViolationError(
      '9.3 / F-002',
      `Snapshot manifest "${report.manifestId}" has drifted — ${parts.join('; ')}. The canon and the captures must agree; divergence fails closed (Constitution 9.3; F-002 law 2) and is resolved only through the governance pathway (superseding manifest with citations — F-002 law 3).`,
      ENGINE_CITATIONS,
    );
  }
}

/**
 * A superseding manifest (correction by superseding records only — the
 * receipt law of 8.1 applied to the canon). The superseded manifest is
 * never edited or withdrawn; the new manifest names what it supersedes and
 * carries its own governance citations. There is no other way to change the
 * canon — and no approval function, because approval is not this engine's
 * to give (order Deliverable 1 — no manual approval bypass; Part XI).
 */
export function supersedeManifest(params: {
  readonly manifestId: string;
  readonly superseded: SnapshotManifest;
  readonly records: readonly SnapshotRecord[];
  readonly clock: () => number;
  readonly citations: readonly Citation[];
}): SnapshotManifest {
  if (params.citations.length === 0) {
    throw new ConstitutionalViolationError(
      'P-4 / 11.2',
      `Superseding manifest "${params.manifestId}" carries no citations. A supersession is a governance act and must name its authority (Part XI; P-4).`,
      ENGINE_CITATIONS,
    );
  }
  return pinManifest({
    manifestId: params.manifestId,
    records: params.records,
    clock: params.clock,
    citations: params.citations,
    supersedes: params.superseded.manifestId,
  });
}

export const SNAPSHOT_ENGINE_CITATIONS: readonly Citation[] = Object.freeze([
  implementation('9.3', 'Snapshot Authority — the canon of "visually identical"'),
  implementation('9.1', 'mechanical, binary, cited'),
  implementation('P-6', 'the fidelity standard'),
  implementation('10.1', 'no waivers — drift fails closed'),
  implementation('8.1', 'correction by superseding records (supersession precedent)'),
]);
