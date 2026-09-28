/**
 * Vaerion — Release / The Rollback Engine
 *
 * "Rollback is not undo. Rollback is constitutional history." (order
 * Deliverable 6.) Every rollback creates: a Rollback Receipt, a Reason, the
 * Parent Chain, Affected Artifacts, an Integrity Proof, Evidence Links, and
 * a Recovery Chain reference.
 *
 * Law (Constitution 10.4; F-006 law 5): a rollback is recorded as a
 * SUPERSEDING receipt; the superseded release receipt remains in the
 * append-only chain untouched — historical truth is never retired (11.4).
 * A rollback without a recorded reason, without affected artifacts, or
 * against an unknown target is refused — history is never improvised.
 *
 * Citations: Constitution 10.4, 10.3, 8.1, 11.4, P-4; Foundation Amendment
 * F-006; Bible Art. III, VI, VIII; order Deliverable 6.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { sha256 } from '../authorities/hash';
import {
  RELEASE_AUTHORITY,
  RELEASE_SIGNATURE_ALGORITHM,
} from './identity';
import { signReceiptBody, type SigningKey } from './receipt';
import { createReleaseLedger, type ReleaseLedger, type ReleaseLedgerEntry } from './ledger';

/** One immutable rollback receipt — a superseding receipt in release form (10.4). */
export interface RollbackReceipt {
  readonly rollbackId: string;
  /** The reason is mandatory — an unexplained rollback is a violation (Art. VIII applied to the process). */
  readonly reason: string;
  readonly supersedes: string;
  /** The parent chain, oldest first (order Deliverable 6). */
  readonly parentChain: readonly string[];
  readonly affectedArtifacts: readonly string[];
  /** SHA-256 over the canonical receipt body — the integrity proof (order Deliverable 6). */
  readonly integrityProof: string;
  readonly evidenceLinks: readonly string[];
  /** The recovery chain reference — how the system returns to a verified state. */
  readonly recoveryChain: string;
  readonly timestamp: number;
  readonly authority: string;
  readonly signature: string;
  readonly signatureAlgorithm: string;
  readonly citations: readonly Citation[];
}

export interface RollbackResult {
  readonly receipt: RollbackReceipt;
  readonly entry: ReleaseLedgerEntry;
}

const ROLLBACK_CITATIONS: readonly Citation[] = Object.freeze([
  implementation('10.4', 'rollback is a superseding receipt on an append-only chain'),
  implementation('10.3', 'every release event issues its own receipt'),
  implementation('11.4', 'historical truth is never retired'),
]);

function canonicalRollbackBody(
  receipt: Omit<RollbackReceipt, 'integrityProof' | 'signature' | 'signatureAlgorithm' | 'citations'>,
): string {
  return [
    `rollbackId=${receipt.rollbackId}`,
    `reason=${receipt.reason}`,
    `supersedes=${receipt.supersedes}`,
    `parentChain=${receipt.parentChain.join(';')}`,
    `affectedArtifacts=${receipt.affectedArtifacts.join(';')}`,
    `evidenceLinks=${receipt.evidenceLinks.join(';')}`,
    `recoveryChain=${receipt.recoveryChain}`,
    `timestamp=${receipt.timestamp}`,
    `authority=${receipt.authority}`,
  ].join('|');
}

/**
 * Creates a rollback against a release in the ledger. The ledger parameter
 * is mutated only by appending — the superseded release entry is untouched
 * (10.4). Hash and clock are injected; the signing key binds the integrity
 * proof to the release signing identity (Art. III).
 */
export function createRollback(params: {
  readonly ledger: ReleaseLedger;
  readonly reason: string;
  readonly supersedes: string;
  readonly affectedArtifacts: readonly string[];
  readonly evidenceLinks: readonly string[];
  readonly recoveryChain: string;
  readonly key: SigningKey;
  readonly clock?: () => number;
  readonly rollbackIdSalt?: string;
}): RollbackResult {
  if (!params.reason || params.reason.trim().length === 0) {
    throw new ConstitutionalViolationError(
      '10.4 / Art. VIII',
      'A rollback was attempted without a recorded reason. Rollback is constitutional history; unexplained history is fabrication (Constitution 10.4; Bible Art. VIII).',
      ROLLBACK_CITATIONS,
    );
  }
  if (params.affectedArtifacts.length === 0) {
    throw new ConstitutionalViolationError(
      '10.4',
      'A rollback was attempted without affected artifacts. The blast radius of a rollback is recorded, never guessed (order Deliverable 6; Constitution 10.4).',
      ROLLBACK_CITATIONS,
    );
  }
  if (params.evidenceLinks.length === 0) {
    throw new ConstitutionalViolationError(
      'Art. II',
      'A rollback was attempted without evidence links. Evidence or silence (Bible Art. II).',
      ROLLBACK_CITATIONS,
    );
  }
  if (!params.recoveryChain) {
    throw new ConstitutionalViolationError(
      '10.4',
      'A rollback was attempted without a recovery chain reference. A rollback that cannot name how the system recovers is not a rollback (order Deliverable 6).',
      ROLLBACK_CITATIONS,
    );
  }
  // The target must exist — the parent chain is derived from the real ledger.
  const parentChain = params.ledger.parentChainOf(params.supersedes);
  const clock = params.clock ?? (() => 0);
  const rollbackId = `rback_${sha256(`${params.supersedes}|${params.reason}|${params.rollbackIdSalt ?? ''}`).slice(0, 16)}`;
  const base = {
    rollbackId,
    reason: params.reason,
    supersedes: params.supersedes,
    parentChain: Object.freeze(parentChain.map((entry) => entry.releaseId)),
    affectedArtifacts: Object.freeze([...params.affectedArtifacts]),
    evidenceLinks: Object.freeze([...params.evidenceLinks]),
    recoveryChain: params.recoveryChain,
    timestamp: clock(),
    authority: RELEASE_AUTHORITY,
  };
  const integrityProof = sha256(canonicalRollbackBody(base));
  const signature = signReceiptBody({
    canonicalBody: canonicalRollbackBody(base),
    key: params.key,
  });
  const receipt: RollbackReceipt = Object.freeze({
    ...base,
    integrityProof,
    signature,
    signatureAlgorithm: RELEASE_SIGNATURE_ALGORITHM,
    citations: ROLLBACK_CITATIONS,
  });
  const entry = params.ledger.appendRollback({
    rollbackId,
    supersedes: params.supersedes,
    receiptDigests: [integrityProof],
    citations: ROLLBACK_CITATIONS,
  });
  return Object.freeze({ receipt, entry });
}

/** Verifies a rollback receipt's integrity proof — alteration is detected, never silent (8.8 form). */
export function verifyRollbackReceipt(receipt: RollbackReceipt): void {
  const { integrityProof, signature, ...rest } = receipt;
  const recomputed = sha256(canonicalRollbackBody(rest));
  if (recomputed !== integrityProof) {
    throw new ConstitutionalViolationError(
      '8.8 / 10.4',
      `Rollback receipt "${receipt.rollbackId}" fails integrity recomputation. Rollback history is immutable; alteration is a constitutional violation (Constitution 10.4; 8.8).`,
      ROLLBACK_CITATIONS,
    );
  }
  if (!signature.startsWith('sig1:')) {
    throw new ConstitutionalViolationError(
      '10.4',
      `Rollback receipt "${receipt.rollbackId}" is unsigned. A rollback whose receipt cannot be produced does not happen (Constitution 10.3 form).`,
      ROLLBACK_CITATIONS,
    );
  }
}

/**
 * Demonstrates the rollback law on a live demonstration ledger: the
 * superseded release remains, the rollback entry supersedes, and integrity
 * holds across the whole chain (order Deliverable 6; used by verify-rollback).
 */
export function demonstrateRollbackLaw(params: { readonly key: SigningKey }): {
  readonly ledger: ReleaseLedger;
  readonly result: RollbackResult;
  readonly supersededEntry: ReleaseLedgerEntry;
} {
  const demoLedger = createReleaseLedger({ hash: sha256 });
  demoLedger.appendRelease({
    releaseId: 'rel_demo_stage10',
    version: '1.0.10.r1',
    receiptDigests: ['demo-digest-0'],
    citations: ROLLBACK_CITATIONS,
  });
  const supersededEntry = demoLedger.entryOf('rel_demo_stage10');
  const result = createRollback({
    ledger: demoLedger,
    reason: 'demonstration: mechanical proof of the 10.4 supersession law',
    supersedes: 'rel_demo_stage10',
    affectedArtifacts: ['art_demo_bundle'],
    evidenceLinks: ['evidence:rollback-law-demonstration'],
    recoveryChain: 'release-ledger: append next verified release',
    key: params.key,
  });
  verifyRollbackReceipt(result.receipt);
  const integrity = demoLedger.integrity();
  if (!integrity.intact) {
    throw new ConstitutionalViolationError(
      '10.4 / 8.5',
      `The demonstration ledger does not verify after the rollback (broken at seq ${integrity.brokenAt}). The rollback law must hold on the whole chain (Constitution 10.4).`,
      ROLLBACK_CITATIONS,
    );
  }
  if (demoLedger.entryOf('rel_demo_stage10') !== supersededEntry) {
    throw new ConstitutionalViolationError(
      '11.4 / 10.4',
      'The superseded release entry was altered by the rollback. Historical truth is never retired; correction is supersession only (Constitution 11.4; 10.4).',
      ROLLBACK_CITATIONS,
    );
  }
  return { ledger: demoLedger, result, supersededEntry };
}
