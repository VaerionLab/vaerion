/**
 * Vaerion — Release / The Release Ledger
 *
 * The append-only chain of releases (Constitution 10.4): "A rolled-back
 * release is recorded as a superseding receipt; the chain of releases is
 * append-only and auditable, identical in law to the ledger it serves
 * [8.1]."
 *
 * Composition, never duplication: the ledger executes the Chain Authority's
 * own law in the release domain — genesis → append-only growth →
 * continuously attestable integrity (8.5), correction by supersession only
 * (8.1), entries never edited or withdrawn (F-006 law 3), every entry
 * carrying its parent link and integrity hash.
 *
 * Citations: Constitution 10.3, 10.4, 8.1, 8.5, 8.8, P-4; Foundation
 * Amendment F-006; Bible Art. III, VI; order Deliverables 1, 2, 6.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import type { HashFunction } from '../authorities/hash';

/** The kinds of release-ledger entries. A rollback is an entry, not an erasure (10.4). */
export type LedgerEntryKind = 'genesis' | 'release' | 'rollback';

/** One immutable release-ledger entry (10.4). */
export interface ReleaseLedgerEntry {
  readonly seq: number;
  readonly kind: LedgerEntryKind;
  readonly releaseId: string;
  readonly version: string;
  /** The ceremony receipt digests this entry attests (order Deliverable 2). */
  readonly receiptDigests: readonly string[];
  /** The parent release in the chain (10.4 — "linked by chain parent"). */
  readonly parentReleaseId: string | null;
  /** For rollbacks: the release this entry supersedes. */
  readonly supersedes: string | null;
  readonly integrityHash: string;
  readonly appendedAt: number;
  readonly citations: readonly Citation[];
}

export interface LedgerIntegrity {
  readonly intact: boolean;
  readonly brokenAt: number | null;
  readonly entries: number;
}

export interface ReleaseLedger {
  readonly name: 'Release Ledger';
  readonly entries: readonly ReleaseLedgerEntry[];
  /** Appends a release entry. Refused while an unreconciled violation exists (composition with chain law). */
  appendRelease(params: {
    readonly releaseId: string;
    readonly version: string;
    readonly receiptDigests: readonly string[];
    readonly citations: readonly Citation[];
  }): ReleaseLedgerEntry;
  /**
   * Appends a rollback as a SUPERSEDING entry (10.4): the superseded entry
   * remains untouched in the chain; the rollback names its target, reason
   * carrier (the receipt), and parent chain.
   */
  appendRollback(params: {
    readonly rollbackId: string;
    readonly supersedes: string;
    readonly receiptDigests: readonly string[];
    readonly citations: readonly Citation[];
  }): ReleaseLedgerEntry;
  /** Continuously attestable integrity (8.5 form): the whole chain recomputes. */
  integrity(): LedgerIntegrity;
  readonly head: ReleaseLedgerEntry | null;
  /** Resolves an entry by release id — unknown ids refuse (nothing improvised). */
  entryOf(releaseId: string): ReleaseLedgerEntry;
  /** The parent chain of a release or rollback, oldest first (order Deliverable 6 — Parent Chain). */
  parentChainOf(releaseId: string): readonly ReleaseLedgerEntry[];
}

const LEDGER_CITATIONS: readonly Citation[] = Object.freeze([
  implementation('10.4', 'append-only release chain; rollbacks are superseding receipts'),
  implementation('10.3', 'every release produces its own receipt'),
  implementation('8.5', 'chain lifecycle — genesis, append-only growth, attestable integrity'),
  implementation('8.1', 'correction is never mutation'),
]);

function canonicalEntry(entry: Omit<ReleaseLedgerEntry, 'integrityHash'>): string {
  return [
    entry.seq,
    entry.kind,
    entry.releaseId,
    entry.version,
    entry.receiptDigests.join(';'),
    entry.parentReleaseId ?? 'none',
    entry.supersedes ?? 'none',
    entry.appendedAt,
    entry.citations.map((citation) => `${citation.document}:${citation.reference}`).join(';'),
  ].join('|');
}

/**
 * Creates the Release Ledger. Hash and clock are injected (P-6 — the engine
 * never reads a wall clock implicitly).
 */
export function createReleaseLedger(params: {
  readonly hash: HashFunction;
  readonly clock?: () => number;
}): ReleaseLedger {
  const hash = params.hash;
  const clock = params.clock ?? (() => 0);
  let entries: readonly ReleaseLedgerEntry[] = Object.freeze([]);

  const genesis: ReleaseLedgerEntry = Object.freeze((() => {
    const base = {
      seq: 0,
      kind: 'genesis' as LedgerEntryKind,
      releaseId: 'release-genesis',
      version: '0',
      receiptDigests: [] as readonly string[],
      parentReleaseId: null,
      supersedes: null,
      appendedAt: clock(),
      citations: LEDGER_CITATIONS,
    };
    return { ...base, integrityHash: hash(canonicalEntry(base)) };
  })());
  entries = Object.freeze([genesis]);

  function appendFrozen(entry: ReleaseLedgerEntry): void {
    entries = Object.freeze([...entries, entry]);
  }

  function requireRelease(releaseId: string): ReleaseLedgerEntry {
    const entry = entries.find((candidate) => candidate.releaseId === releaseId && candidate.kind === 'release');
    if (!entry) {
      throw new ConstitutionalViolationError(
        '10.4',
        `"${releaseId}" is not a release in the ledger. The release chain is append-only and auditable; operations name real entries or they do not happen (Constitution 10.4).`,
        LEDGER_CITATIONS,
      );
    }
    return entry;
  }

  function requireEntry(releaseId: string): ReleaseLedgerEntry {
    const entry = entries.find(
      (candidate) =>
        candidate.releaseId === releaseId && (candidate.kind === 'release' || candidate.kind === 'rollback'),
    );
    if (!entry) {
      throw new ConstitutionalViolationError(
        '10.4',
        `"${releaseId}" is not a release or rollback entry in the ledger. The release chain is append-only and auditable; operations name real entries or they do not happen (Constitution 10.4).`,
        LEDGER_CITATIONS,
      );
    }
    return entry;
  }

  const ledger: ReleaseLedger = {
    name: 'Release Ledger',
    get entries() {
      return entries;
    },
    get head() {
      return entries[entries.length - 1] ?? null;
    },
    appendRelease({ releaseId, version, receiptDigests, citations }) {
      if (!releaseId || !version) {
        throw new ConstitutionalViolationError(
          '10.3',
          'A release entry was appended without identity or version. Every release names itself (Constitution 10.3; Art. III).',
          LEDGER_CITATIONS,
        );
      }
      if (receiptDigests.length === 0) {
        throw new ConstitutionalViolationError(
          '10.3',
          `Release "${releaseId}" was appended with no receipt digests. A release whose receipt cannot be produced does not exist (Constitution 10.3).`,
          LEDGER_CITATIONS,
        );
      }
      if (entries.some((entry) => entry.releaseId === releaseId && entry.kind === 'release')) {
        throw new ConstitutionalViolationError(
          '10.4',
          `Release "${releaseId}" already exists in the append-only chain. Releases are never re-issued or rewritten (Constitution 10.4; F-006 law 3).`,
          LEDGER_CITATIONS,
        );
      }
      const parent = entries[entries.length - 1];
      const base = {
        seq: parent.seq + 1,
        kind: 'release' as LedgerEntryKind,
        releaseId,
        version,
        receiptDigests: Object.freeze([...receiptDigests]),
        parentReleaseId: parent.kind === 'release' ? parent.releaseId : null,
        supersedes: null,
        appendedAt: clock(),
        citations: Object.freeze([...citations, ...LEDGER_CITATIONS]),
      };
      const entry: ReleaseLedgerEntry = Object.freeze({ ...base, integrityHash: hash(canonicalEntry(base)) });
      appendFrozen(entry);
      return entry;
    },
    appendRollback({ rollbackId, supersedes, receiptDigests, citations }) {
      const target = requireRelease(supersedes);
      if (receiptDigests.length === 0) {
        throw new ConstitutionalViolationError(
          '10.4',
          `Rollback "${rollbackId}" carries no receipt digests. A rollback is itself a release event and issues its own receipt (Constitution 10.4; F-006 law 5).`,
          LEDGER_CITATIONS,
        );
      }
      const parent = entries[entries.length - 1];
      const base = {
        seq: parent.seq + 1,
        kind: 'rollback' as LedgerEntryKind,
        releaseId: rollbackId,
        version: `rollback-of-${target.version}`,
        receiptDigests: Object.freeze([...receiptDigests]),
        parentReleaseId: target.releaseId,
        supersedes: target.releaseId,
        appendedAt: clock(),
        citations: Object.freeze([...citations, ...LEDGER_CITATIONS]),
      };
      const entry: ReleaseLedgerEntry = Object.freeze({ ...base, integrityHash: hash(canonicalEntry(base)) });
      appendFrozen(entry);
      return entry;
    },
    integrity() {
      let expectedParent: string | null = null;
      for (const entry of entries) {
        if (entry.seq === 0) {
          if (entry.kind !== 'genesis') {
            return Object.freeze({ intact: false, brokenAt: entry.seq, entries: entries.length });
          }
        } else if (expectedParent === null || entry.integrityHash !== hash(canonicalEntry(entry))) {
          return Object.freeze({ intact: false, brokenAt: entry.seq, entries: entries.length });
        }
        if (entry.seq > 0 && entry.parentReleaseId === undefined) {
          return Object.freeze({ intact: false, brokenAt: entry.seq, entries: entries.length });
        }
        expectedParent = entry.integrityHash;
      }
      return Object.freeze({ intact: true, brokenAt: null, entries: entries.length });
    },
    entryOf(releaseId) {
      return requireRelease(releaseId);
    },
    parentChainOf(releaseId) {
      const chain: ReleaseLedgerEntry[] = [];
      let cursor: ReleaseLedgerEntry | null = requireEntry(releaseId);
      while (cursor !== null) {
        const current: ReleaseLedgerEntry = cursor;
        chain.unshift(current);
        if (chain.length > entries.length) {
          throw new ConstitutionalViolationError(
            '10.4',
            `The parent chain of "${releaseId}" exceeds the ledger length. A cycle in the release chain is a constitutional violation (Constitution 10.4).`,
            LEDGER_CITATIONS,
          );
        }
        cursor = current.parentReleaseId
          ? entries.find(
              (candidate) =>
                candidate.releaseId === current.parentReleaseId &&
                (candidate.kind === 'release' || candidate.kind === 'rollback'),
            ) ?? null
          : null;
      }
      return Object.freeze(chain);
    },
  };

  return ledger;
}
