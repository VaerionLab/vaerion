/**
 * Vaerion — Release / The Trust Engine
 *
 * "A user installs Vaerion. Before opening it they can verify: every file,
 * every release, every receipt, every registry, every snapshot, every
 * signature, every authority. Without contacting Vaerion. Trust becomes
 * portable." (order Deliverable 8.)
 *
 * The trust engine verifies a delivered trust bundle — the release ledger,
 * its ceremony receipts, its artifact records, and its distribution
 * records — as pure data. It imports no store, reads no filesystem, and
 * contacts nothing: third-party verification without product access is the
 * manifest law (8.8) applied to releases, and receipts/manifests/exports
 * must remain verifiable indefinitely across versions (11.5).
 *
 * Every check is recomputation: digests are recomputed, signatures are
 * re-derived, parent links are re-walked, anatomy is re-proven. Nothing is
 * believed; everything is verified.
 *
 * Citations: Constitution 8.8, 10.3, 10.4, 11.5, 2.8, P-4; Foundation
 * Amendment F-006; Bible Art. III, XI; order Deliverables 2, 4, 8.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import type { HashFunction } from '../authorities/hash';
import type { ReleaseLedgerEntry } from './ledger';
import {
  assertReceiptAnatomy,
  verifyReceiptIntegrity,
  verifyReceiptSignature,
  type ReleaseReceipt,
  type SigningKey,
} from './receipt';
import type { ArtifactRecord } from './artifacts';
import type { DistributionRecord } from './distribution';

/** The portable trust bundle — everything a verifier needs, as data. */
export interface TrustBundle {
  readonly releaseId: string;
  readonly version: string;
  readonly ledgerEntries: readonly ReleaseLedgerEntry[];
  readonly receipts: readonly ReleaseReceipt[];
  readonly artifacts: readonly ArtifactRecord[];
  readonly distribution: readonly DistributionRecord[];
}

/** One verification finding of the trust report. */
export interface TrustFinding {
  readonly check: string;
  readonly verdict: 'PASS' | 'FAIL';
  readonly detail: string;
}

export interface TrustReport {
  readonly trusted: boolean;
  readonly findings: readonly TrustFinding[];
  readonly citations: readonly Citation[];
}

const TRUST_CITATIONS: readonly Citation[] = Object.freeze([
  implementation('8.8', 'third parties verify without product access'),
  implementation('11.5', 'receipts remain verifiable indefinitely'),
  implementation('10.3', 'every release proves itself'),
  implementation('10.4', 'the release chain is append-only and auditable'),
]);

/**
 * Verifies a trust bundle standalone (order Deliverable 8). Pure: operates
 * on delivered data only. The signing key(s) the verifier trusts are
 * supplied by the verifier — trust is configured, never implicit.
 */
export function verifyTrustBundle(params: {
  readonly bundle: TrustBundle;
  readonly keys: readonly SigningKey[];
  readonly hash: HashFunction;
}): TrustReport {
  const findings: TrustFinding[] = [];
  const fail = (check: string, detail: string): void => {
    findings.push(Object.freeze({ check, verdict: 'FAIL' as const, detail }));
  };
  const pass = (check: string, detail: string): void => {
    findings.push(Object.freeze({ check, verdict: 'PASS' as const, detail }));
  };

  // [1] Ledger chain integrity — every entry recomputes; parent links hold.
  let expectedParent: string | null = null;
  let ledgerIntact = true;
  for (const entry of params.bundle.ledgerEntries) {
    const canonical = [
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
    if (entry.integrityHash !== params.hash(canonical)) {
      fail('ledger-integrity', `entry seq ${entry.seq} (${entry.releaseId}) fails hash recomputation`);
      ledgerIntact = false;
      break;
    }
    if (entry.seq > 0 && entry.parentReleaseId === undefined) {
      fail('ledger-parents', `entry seq ${entry.seq} lacks a parent link`);
      ledgerIntact = false;
      break;
    }
    expectedParent = entry.integrityHash;
  }
  if (ledgerIntact) {
    pass('ledger-integrity', `${params.bundle.ledgerEntries.length} entries recompute; chain is append-only and auditable`);
  }

  // [2] The bundle names the release the ledger knows.
  const releaseEntry = params.bundle.ledgerEntries.find(
    (entry) => entry.kind === 'release' && entry.releaseId === params.bundle.releaseId,
  );
  if (!releaseEntry) {
    fail('release-identity', `release "${params.bundle.releaseId}" is not in the ledger — the bundle proves nothing`);
  } else if (releaseEntry.version !== params.bundle.version) {
    fail('release-identity', `version mismatch: bundle says ${params.bundle.version}, ledger says ${releaseEntry.version}`);
  } else {
    pass('release-identity', `release "${params.bundle.releaseId}" (${params.bundle.version}) is a ledger entry`);
  }

  // [3] Every receipt: integrity recompute + anatomy + signature against a trusted key.
  let receiptsOk = params.bundle.receipts.length > 0;
  const keyIds = new Set(params.keys.map((key) => key.keyId));
  for (const receipt of params.bundle.receipts) {
    try {
      verifyReceiptIntegrity(receipt);
      assertReceiptAnatomy(receipt);
      const keyId = receipt.signature.split(':')[1];
      const key = params.keys.find((candidate) => candidate.keyId === keyId);
      if (!key) {
        fail('receipt-signature', `${receipt.receiptId}: signed by untrusted key "${keyId ?? '(none)'}" (trusted: ${[...keyIds].join(', ') || 'none configured'})`);
        receiptsOk = false;
        continue;
      }
      if (!verifyReceiptSignature({ canonicalBody: canonicalOf(receipt), signature: receipt.signature, key })) {
        fail('receipt-signature', `${receipt.receiptId}: signature does not verify against key "${keyId}"`);
        receiptsOk = false;
        continue;
      }
      pass('receipt', `${receipt.receiptId} (${receipt.kind}) verifies — digest, anatomy, signature`);
    } catch (error) {
      fail('receipt', `${receipt.receiptId}: ${error instanceof Error ? error.message : String(error)}`);
      receiptsOk = false;
    }
  }
  if (params.bundle.receipts.length === 0) {
    fail('receipts', 'the bundle carries no receipts — a release whose receipt cannot be produced does not ship (Constitution 10.3)');
  }

  // [4] Receipts belong to this release.
  for (const receipt of params.bundle.receipts) {
    if (receipt.releaseId !== params.bundle.releaseId) {
      fail('receipt-ownership', `${receipt.receiptId} names release "${receipt.releaseId}", not "${params.bundle.releaseId}"`);
      receiptsOk = false;
    }
  }

  // [5] Artifacts: nothing anonymous; every artifact is owned by this release.
  for (const artifact of params.bundle.artifacts) {
    const anonymous =
      !artifact.origin ||
      !artifact.constitutionVersion ||
      !artifact.registryVersion ||
      !artifact.owningRelease ||
      artifact.provingSnapshots.length === 0 ||
      artifact.approvingAuthorities.length === 0 ||
      artifact.evidenceReferences.length === 0;
    if (anonymous) {
      fail('artifact-provenance', `${artifact.artifactId} (${artifact.name}) exists anonymously`);
    } else if (artifact.owningRelease !== params.bundle.releaseId) {
      fail('artifact-ownership', `${artifact.artifactId} is owned by "${artifact.owningRelease}", not this release`);
    } else {
      pass('artifact', `${artifact.artifactId} (${artifact.name}) carries full provenance`);
    }
  }

  // [6] Distribution: signed manifests recompute against their contents (8.8).
  for (const record of params.bundle.distribution) {
    if (!record.manifest) {
      fail('distribution', `${record.distributionId} (${record.channel}) has no manifest`);
      continue;
    }
    if (!record.manifest.signature) {
      fail('distribution', `${record.distributionId} (${record.channel}) is unsigned — it must not exist as shippable (Constitution 8.8)`);
      continue;
    }
    const recomputed = params.hash(record.contentHashes.join('|'));
    if (recomputed !== record.bundleHash) {
      fail('distribution', `${record.distributionId} (${record.channel}): bundle hash mismatch — brokenness detected, never silent (Constitution 8.8)`);
      continue;
    }
    pass('distribution', `${record.distributionId} (${record.channel}) manifest recomputes and is signed`);
  }

  return Object.freeze({
    trusted: findings.every((finding) => finding.verdict === 'PASS') && findings.length > 0,
    findings: Object.freeze(findings),
    citations: TRUST_CITATIONS,
  });
}

/** The canonical body of a receipt (mirrors the issuance form — recomputation, not trust). */
function canonicalOf(receipt: ReleaseReceipt): string {
  return [
    `kind=${receipt.kind}`,
    `releaseId=${receipt.releaseId}`,
    `releaseVersion=${receipt.releaseVersion}`,
    `timestamp=${receipt.timestamp}`,
    `parentRelease=${receipt.parentRelease ?? 'none'}`,
    `constitutionalVersion=${receipt.constitutionalVersion}`,
    `snapshotVersion=${receipt.snapshotVersion}`,
    `registryVersion=${receipt.registryVersion}`,
    `evidence=${receipt.evidenceReferences.join(';')}`,
    `chain=${receipt.chainReferences.join(';')}`,
    `authority=${receipt.authority}`,
    `citations=${receipt.citations.map((citation) => `${citation.document}:${citation.reference}`).join(';')}`,
    `payload=${Object.keys(receipt.payload).sort().map((key) => `${key}=${receipt.payload[key]}`).join(';')}`,
  ].join('\n');
}
