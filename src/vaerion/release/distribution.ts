/**
 * Vaerion — Release / The Distribution Engine
 *
 * "Generate: NPM, PyPI, VS Code, JetBrains, Neovim, CLI, Documentation
 * Bundle, Offline Bundle. Every package carries constitutional identity."
 * (order Deliverable 7.)
 *
 * The eight channels are the order's declared set — the execution order is
 * the ruling instrument for the channel registry (IR-002 precedent). Every
 * package is prepared through the Export Authority's own manifest lifecycle
 * (8.7–8.8) by composition: criteria → assembled → manifest computed →
 * signed. The final 'delivered' stage requires delivery evidence from an
 * external channel — a proof this environment cannot produce, so the
 * lifecycle stops honestly at 'signed' and the silence is filed (IR-019;
 * Art. VIII — no fabricated deployment history).
 *
 * Citations: Constitution 8.7, 8.8, 5.10, 10.3, P-5; Bible Art. III, VIII;
 * order Deliverable 7.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import type { HashFunction } from '../authorities/hash';
import {
  computeManifest,
  signManifest,
  verifyBundle,
  type ExportManifest,
  type ManifestVerification,
} from '../authorities/manifest';

/** The eight declared distribution channels, in the order's enumeration. */
export const DISTRIBUTION_CHANNELS = [
  'npm',
  'pypi',
  'vscode',
  'jetbrains',
  'neovim',
  'cli',
  'docs-bundle',
  'offline-bundle',
] as const;
export type DistributionChannel = (typeof DISTRIBUTION_CHANNELS)[number];

/** Lifecycle stages. 'delivered' is reachable only with external delivery evidence (IR-019). */
export const DISTRIBUTION_STAGES = ['criteria-set', 'assembled', 'manifest-computed', 'signed'] as const;
export type DistributionStage = (typeof DISTRIBUTION_STAGES)[number];

/** One immutable distribution record (order Deliverable 7). */
export interface DistributionRecord {
  readonly distributionId: string;
  readonly channel: DistributionChannel;
  /** The constitutional identity the package carries (order: "Every package carries constitutional identity"). */
  readonly packageIdentity: string;
  readonly stage: DistributionStage;
  /** The hashed contents of the package (path:digest lines, canonically sorted). */
  readonly contentHashes: readonly string[];
  readonly bundleHash: string;
  readonly manifest: ExportManifest | null;
  readonly citations: readonly Citation[];
}

export interface DistributionEngine {
  readonly name: 'Distribution Engine';
  readonly records: readonly DistributionRecord[];
  /** Prepares a channel package: criteria set → assembled (8.7). */
  preparePackage(params: {
    readonly channel: DistributionChannel;
    readonly packageIdentity: string;
    readonly contents: readonly { readonly name: string; readonly sha256: string }[];
  }): DistributionRecord;
  /** Computes the manifest (8.7; 8.8). */
  computePackageManifest(params: {
    readonly channel: DistributionChannel;
    readonly timestampAuthority: string;
    readonly issuingEngine: string;
    readonly ruleset: string;
  }): DistributionRecord;
  /** Signs the manifest — immutable after signing (8.8). */
  signPackage(params: { readonly channel: DistributionChannel; readonly signature: string }): DistributionRecord;
  /**
   * Marks delivered — REFUSED without external delivery evidence (8.7;
   * IR-019): this environment cannot produce the proof, so honest tooling
   * refuses to claim the stage.
   */
  markDelivered(params: { readonly channel: DistributionChannel; readonly deliveryEvidence?: string }): DistributionRecord;
  /** Third-party verification of a prepared package against its manifest (8.8) — pure. */
  verifyPackage(params: { readonly record: DistributionRecord; readonly contentHashes: readonly string[] }): ManifestVerification;
}

const DISTRIBUTION_CITATIONS: readonly Citation[] = Object.freeze([
  implementation('8.7', 'export lifecycle — composition, never duplication'),
  implementation('8.8', 'manifest lifecycle — immutable after signing; third-party verification'),
  implementation('5.10', 'quarantined content never enters a package'),
  implementation('10.3', 'packages carry the release constitutional identity'),
]);

export function createDistributionEngine(params: { readonly hash: HashFunction }): DistributionEngine {
  const hash = params.hash;
  let records: readonly DistributionRecord[] = Object.freeze([]);

  function replaceRecord(next: DistributionRecord): void {
    records = Object.freeze([...records.filter((record) => record.channel !== next.channel), next]);
  }

  function requireRecord(channel: DistributionChannel, stage: DistributionStage): DistributionRecord {
    const record = records.find((candidate) => candidate.channel === channel);
    if (!record) {
      throw new ConstitutionalViolationError(
        '8.7',
        `Channel "${channel}" has no distribution record. Prepare the package before operating on it (Constitution 8.7).`,
        DISTRIBUTION_CITATIONS,
      );
    }
    if (record.stage !== stage) {
      throw new ConstitutionalViolationError(
        '8.7',
        `Channel "${channel}" is "${record.stage}"; this operation requires "${stage}". The lifecycle is criteria set → assembled → manifest computed → signed → delivered (Constitution 8.7; order Deliverable 7).`,
        DISTRIBUTION_CITATIONS,
      );
    }
    return record;
  }

  function requireChannel(channel: string): DistributionChannel {
    if (!DISTRIBUTION_CHANNELS.includes(channel as DistributionChannel)) {
      throw new ConstitutionalViolationError(
        '8.0 / Part X',
        `"${channel}" is not a declared distribution channel. The declared set is: ${DISTRIBUTION_CHANNELS.join(', ')} (order Deliverable 7; Constitution 8.0 — unambiguous ownership).`,
        DISTRIBUTION_CITATIONS,
      );
    }
    return channel as DistributionChannel;
  }

  return {
    name: 'Distribution Engine',
    get records() {
      return records;
    },
    preparePackage({ channel, packageIdentity, contents }) {
      const lawfulChannel = requireChannel(channel);
      if (!packageIdentity) {
        throw new ConstitutionalViolationError(
          '10.3 / Art. III',
          `A ${lawfulChannel} package was prepared without constitutional identity. Every package carries constitutional identity (order Deliverable 7; Art. III).`,
          DISTRIBUTION_CITATIONS,
        );
      }
      if (contents.length === 0) {
        throw new ConstitutionalViolationError(
          'Art. II',
          `A ${lawfulChannel} package was assembled from no contents. Evidence or silence (Bible Art. II).`,
          DISTRIBUTION_CITATIONS,
        );
      }
      for (const item of contents) {
        if (item.name.toLowerCase().includes('demo') || item.name.toLowerCase().includes('quarantine')) {
          throw new ConstitutionalViolationError(
            '5.10 / 8.7',
            `A ${lawfulChannel} package attempted to carry quarantined content "${item.name}". Quarantined material never enters a package (Constitution 5.10; 8.7).`,
            DISTRIBUTION_CITATIONS,
          );
        }
        if (!/^[0-9a-f]{64}$/.test(item.sha256)) {
          throw new ConstitutionalViolationError(
            'Art. II',
            `Package content "${item.name}" carries no valid digest. Every package content is hashed at capture (Constitution 8.1; 8.2).`,
            DISTRIBUTION_CITATIONS,
          );
        }
      }
      const contentHashes = [...contents]
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .map((item) => `${item.name}:${item.sha256}`);
      // The bundle hash adopts the manifest authority's canonical join (8.8
      // — composition: verifyBundle recomputes with the same convention).
      const bundleHash = hash(contentHashes.join('|'));
      const record: DistributionRecord = Object.freeze({
        distributionId: `dist_${lawfulChannel}_${hash(bundleHash).slice(0, 12)}`,
        channel: lawfulChannel,
        packageIdentity,
        stage: 'assembled',
        contentHashes: Object.freeze(contentHashes),
        bundleHash,
        manifest: null,
        citations: DISTRIBUTION_CITATIONS,
      });
      replaceRecord(record);
      return record;
    },
    computePackageManifest({ channel, timestampAuthority, issuingEngine, ruleset }) {
      const record = requireRecord(requireChannel(channel), 'assembled');
      const manifest = computeManifest({
        bundleHash: record.bundleHash,
        recordHashes: record.contentHashes,
        timestampAuthority,
        issuingEngine,
        ruleset,
        hash,
      });
      const next: DistributionRecord = Object.freeze({ ...record, stage: 'manifest-computed', manifest });
      replaceRecord(next);
      return next;
    },
    signPackage({ channel, signature }) {
      const record = requireRecord(requireChannel(channel), 'manifest-computed');
      if (!record.manifest) {
        throw new ConstitutionalViolationError(
          '8.8',
          `Channel "${channel}" has no manifest to sign. Compute the manifest first (Constitution 8.8).`,
          DISTRIBUTION_CITATIONS,
        );
      }
      const signed = signManifest({ manifest: record.manifest, signature, signedAt: 0 });
      const next: DistributionRecord = Object.freeze({ ...record, stage: 'signed', manifest: signed });
      replaceRecord(next);
      return next;
    },
    markDelivered({ channel, deliveryEvidence }) {
      requireChannel(channel);
      // Honest refusal (Art. VIII; IR-019): without external delivery
      // evidence the 'delivered' stage is not claimable. Not a warning — a
      // refusal. Deployment history is never fabricated.
      throw new ConstitutionalViolationError(
        'Art. VIII / IR-019',
        `Delivery of the ${channel} package cannot be asserted: no external delivery evidence exists in this environment. The lifecycle stops honestly at 'signed'; deployment history is never fabricated (Bible Art. VIII; Constitution 8.7; IR-019).`,
        DISTRIBUTION_CITATIONS,
      );
    },
    verifyPackage({ record, contentHashes }) {
      if (!record.manifest) {
        return Object.freeze({ verifiable: false, reason: 'the package has no manifest (Constitution 8.8)' });
      }
      return verifyBundle({ recordHashes: contentHashes, manifest: record.manifest, hash });
    },
  };
}
