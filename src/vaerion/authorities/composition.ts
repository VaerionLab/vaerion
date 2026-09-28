/**
 * Vaerion — Authorities / The Composition Root
 *
 * Wires the seven authorities with their declared compositions (8.0) and
 * the investigation lifecycle (8.6). The hash and clock are injected (P-6);
 * the default binding is the integrity substrate (hash.ts).
 *
 * The composition root is wiring, not an authority: it owns no records and
 * holds no lifecycle. The identity receipt path composes the full receipt
 * lifecycle of 8.1 — the verification is mechanical (the presented event
 * content must hash to the captured artifact), never assumed.
 *
 * Citations: Implementation Constitution 8.0–8.9; P-6.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { sha256, type HashFunction } from './hash';
import { createChainAuthority, type ChainAuthority } from './chain';
import { createEvidenceAuthority, type EvidenceAuthority } from './evidence';
import { createVerificationAuthority, type VerificationAuthority, type VerificationMethod } from './verification';
import { createLedgerAuthority, type LedgerAuthority } from './ledger';
import { createRuleAuthority, type RuleAuthority } from './rule';
import { createIdentityAuthority, type IdentityAuthority } from './identity';
import { createExportAuthority, type ExportAuthority } from './export';
import { createInvestigationEngine, type InvestigationEngine } from './investigation';
import type { ReceiptRecord } from './ledger';

export interface AuthoritySystem {
  readonly hash: HashFunction;
  readonly chain: ChainAuthority;
  readonly evidence: EvidenceAuthority;
  readonly verification: VerificationAuthority;
  readonly ledger: LedgerAuthority;
  readonly rule: RuleAuthority;
  readonly identity: IdentityAuthority;
  readonly export: ExportAuthority;
  readonly investigation: InvestigationEngine;
  /** The full receipt lifecycle (8.1) — the composition other authorities use for receipts. */
  readonly submitAdminReceipt: (request: {
    readonly claim: string;
    readonly subject: string;
    readonly eventContent: string;
    readonly method: VerificationMethod;
  }) => ReceiptRecord;
}

export const COMPOSITION_CITATIONS: readonly Citation[] = [
  implementation('8.0', 'the seven named authorities; composition declared'),
  implementation('P-6', 'deterministic, injectable clock and hash'),
];

export function createAuthorities(config: { readonly clock?: () => number } = {}): AuthoritySystem {
  const hash = sha256;
  const clock = config.clock ?? (() => 0);

  const chain = createChainAuthority({ hash, clock });
  const evidence = createEvidenceAuthority({ hash, clock });
  const verification = createVerificationAuthority({ hash });
  const ledger = createLedgerAuthority({ hash, clock, chain, evidence, verification });
  const rule = createRuleAuthority({ hash, clock });

  // The admin receipt path: identity events become receipts only through
  // the full receipt lifecycle of 8.1 (8.9 — composition with the Ledger,
  // Evidence, and Verification authorities).
  function submitAdminReceipt(request: {
    readonly claim: string;
    readonly subject: string;
    readonly eventContent: string;
    readonly method: VerificationMethod;
  }): ReceiptRecord {
    const draft = ledger.draft({ claim: request.claim, subject: request.subject, quarantine: 'production' });
    const artifact = evidence.capture({ type: 'identity-event', source: 'Identity Authority', content: request.eventContent });
    ledger.gatherEvidence({ draftId: draft.draftId, evidenceIds: [artifact.evidenceId] });
    const queued = verification.queue({ claim: request.claim, subject: request.subject });
    verification.bindMethod({ verificationId: queued.verificationId, method: request.method });
    // The verification is mechanical: the presented event content must hash
    // to the captured artifact. The fact is proven, never assumed (Art. II).
    const captured = evidence.stateOf(artifact.evidenceId);
    const outcome = hash(request.eventContent) === captured.hash ? 'verified' : 'failed';
    verification.issue({ verificationId: queued.verificationId, outcome });
    ledger.recordVerdict({ draftId: draft.draftId, verificationId: queued.verificationId });
    return ledger.append({ draftId: draft.draftId });
  }

  const identity = createIdentityAuthority({ hash, clock, submitAdminReceipt });
  const exportAuthority = createExportAuthority({ hash, clock });
  const investigation = createInvestigationEngine({ hash, clock, chain, evidence });

  return Object.freeze({
    hash,
    chain,
    evidence,
    verification,
    ledger,
    rule,
    identity,
    export: exportAuthority,
    investigation,
    submitAdminReceipt,
  });
}
