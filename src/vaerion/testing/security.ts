/**
 * Vaerion — Testing / Security & Honesty Test Engine
 *
 * Verifies refusal behavior (order Deliverable 8): the system must reject
 * fake verdicts, missing evidence, broken chains, unauthorized exports,
 * unregistered tokens, unregistered commands, fabricated receipts, and
 * modified snapshots — and EVERY refusal must throw
 * ConstitutionalViolationError (the single violation class of
 * foundation/authority.ts).
 *
 * Honesty is an engineering property (1.6): the implementation never
 * fabricates, simulates, or presumes a verdict, an amount of progress, a
 * chain state, or a data condition that has not been received from an
 * authority. This engine proves the refusals mechanically — each proof
 * executes the unlawful act against the real engine and requires the
 * ConstitutionalViolationError; an accepted violation is itself a violation
 * of this gate.
 *
 * Citations: Implementation Constitution 1.6, 5.3, 5.10, 6.1, 8.1, 8.2,
 * 8.5, 8.7, 8.8, 9.1, Part VIII, Part XI; Bible Art. II, III, VI, VIII,
 * XI, XII; Foundation Amendment F-002; order Deliverable 8.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { getToken } from '../registry';
import { assertCommandLawful } from '../interaction/commands';
import { createAuthorities, sha256, type ReceiptRecord } from '../authorities';
import { captureSnapshot, verifySnapshotIntegrity, snapshotIdentity } from './snapshot';

const ENGINE_CITATIONS: readonly Citation[] = [
  implementation('1.6', 'honesty is an engineering property'),
  implementation('9.1', 'mechanical, binary, cited'),
  bible('VIII', 'honesty over comfort'),
];

/** One refusal proof (order Deliverable 8). */
export interface RefusalProof {
  readonly refusal: string;
  readonly passed: boolean;
  readonly evidence: string;
  readonly citations: readonly Citation[];
}

/**
 * Proves one refusal: the unlawful act must throw ConstitutionalViolationError.
 * A refusal that throws a different error, or no error at all, fails.
 */
function proveRefusal(
  refusal: string,
  citations: readonly Citation[],
  unlawfulAct: () => void,
): RefusalProof {
  try {
    unlawfulAct();
    return {
      refusal,
      passed: false,
      evidence: 'the unlawful act was ACCEPTED — no refusal was raised (ConstitutionalViolationError required)',
      citations: [...citations, ...ENGINE_CITATIONS],
    };
  } catch (error) {
    if (error instanceof ConstitutionalViolationError) {
      return {
        refusal,
        passed: true,
        evidence: `refused with ConstitutionalViolationError: ${error.message.split('\n')[0].slice(0, 180)}`,
        citations: [...citations, ...ENGINE_CITATIONS],
      };
    }
    return {
      refusal,
      passed: false,
      evidence: `the refusal raised "${error instanceof Error ? error.message : String(error)}" instead of a ConstitutionalViolationError (9.1; Part XI)`,
      citations: [...citations, ...ENGINE_CITATIONS],
    };
  }
}

/** The eight ordered refusal proofs (order Deliverable 8). */
export function runRefusalProofs(): readonly RefusalProof[] {
  const proofs: RefusalProof[] = [];

  /* 1 — Fake verdicts: an unissued verdict cannot enter the ledger
         (5.3; Art. III — a verdict names its verifier, and the fact is the
         Verification Authority's own record, never a parameter). */
  proofs.push(
    proveRefusal('fake verdicts', [implementation('5.3'), implementation('8.1'), bible('III')], () => {
      const system = createAuthorities({ clock: () => 0 });
      const draft = system.ledger.draft({ claim: 'security probe', subject: 'sec-1', quarantine: 'production' });
      const artifact = system.evidence.capture({ type: 'sec-probe', source: 'Stage 9', content: 'content' });
      system.ledger.gatherEvidence({ draftId: draft.draftId, evidenceIds: [artifact.evidenceId] });
      system.ledger.recordVerdict({ draftId: draft.draftId, verificationId: 'verification-fabricated' });
    }),
  );

  /* 2 — Missing evidence: a receipt cannot append before evidence is
         gathered (8.1: drafted → evidence gathered → verdict → appended;
         Art. II — evidence or silence). */
  proofs.push(
    proveRefusal('missing evidence', [implementation('8.1'), bible('II')], () => {
      const system = createAuthorities({ clock: () => 0 });
      const draft = system.ledger.draft({ claim: 'evidence-less receipt', subject: 'sec-2', quarantine: 'production' });
      system.ledger.append({ draftId: draft.draftId });
    }),
  );

  /* 3 — Broken chains: appends halt while a break is unreconciled
         (8.5; 5.9 — recovery never papers over a gap; Art. XII). */
  proofs.push(
    proveRefusal('broken chains', [implementation('8.5'), implementation('5.9'), bible('XII')], () => {
      const system = createAuthorities({ clock: () => 0 });
      system.chain.recordBreak({ atSeq: 2, reason: 'security probe — simulated divergence' });
      system.chain.append({ payload: 'append across a break' });
    }),
  );

  /* 4 — Unauthorized exports: demo quarantines are refused by construction
         (8.7; 5.10) and exports without a manifest receipt do not render
         (7.10). */
  proofs.push(
    proveRefusal('unauthorized exports (demo quarantine)', [implementation('8.7'), implementation('5.10'), implementation('7.10')], () => {
      const system = createAuthorities({ clock: () => 0 });
      const demoDraft = system.ledger.draft({ claim: 'demo record', subject: 'sec-3', quarantine: 'demo' });
      const artifact = system.evidence.capture({ type: 'sec-probe', source: 'Stage 9', content: 'demo-content' });
      system.ledger.gatherEvidence({ draftId: demoDraft.draftId, evidenceIds: [artifact.evidenceId] });
      const queued = system.verification.queue({ claim: 'demo record', subject: 'sec-3' });
      system.verification.bindMethod({ verificationId: queued.verificationId, method: { engineVersion: 'stage9', ruleset: 'Part IX', environment: 'pipeline' } });
      system.verification.issue({ verificationId: queued.verificationId, outcome: 'verified' });
      system.ledger.recordVerdict({ draftId: demoDraft.draftId, verificationId: queued.verificationId });
      const demoReceipt: ReceiptRecord = system.ledger.append({ draftId: demoDraft.draftId });
      const record = system.export.setCriteria({ criteria: ['security probe'] });
      system.export.assemble({ exportId: record.exportId, sourceRecords: [demoReceipt] });
    }),
  );

  /* 5 — Unregistered tokens: a value outside the Registry does not resolve
         (1.3; 2.1 — tokens are the only source of visual values; Art. XI). */
  proofs.push(
    proveRefusal('unregistered tokens', [implementation('1.3'), implementation('2.1'), bible('XI')], () => {
      getToken('color.unregistered-improvisation');
    }),
  );

  /* 6 — Unregistered commands: no interaction exists outside the command
         registry (6.1 — free-form handlers are prohibited). */
  proofs.push(
    proveRefusal('unregistered commands', [implementation('6.1')], () => {
      assertCommandLawful('self-invented-unregistered-command');
    }),
  );

  /* 7 — Fabricated receipts: re-appending a consumed draft is refused;
         receipts are immutable, correction is supersession (8.1; Art. VI). */
  proofs.push(
    proveRefusal('fabricated receipts (re-append of a consumed draft)', [implementation('8.1'), bible('VI')], () => {
      const system = createAuthorities({ clock: () => 0 });
      const draft = system.ledger.draft({ claim: 'double-append probe', subject: 'sec-4', quarantine: 'production' });
      const artifact = system.evidence.capture({ type: 'sec-probe', source: 'Stage 9', content: 'append-content' });
      system.ledger.gatherEvidence({ draftId: draft.draftId, evidenceIds: [artifact.evidenceId] });
      const queued = system.verification.queue({ claim: 'double-append probe', subject: 'sec-4' });
      system.verification.bindMethod({ verificationId: queued.verificationId, method: { engineVersion: 'stage9', ruleset: 'Part IX', environment: 'pipeline' } });
      system.verification.issue({ verificationId: queued.verificationId, outcome: 'verified' });
      system.ledger.recordVerdict({ draftId: draft.draftId, verificationId: queued.verificationId });
      system.ledger.append({ draftId: draft.draftId });
      system.ledger.append({ draftId: draft.draftId });
    }),
  );

  /* 8 — Modified snapshots: identity verification refuses a tampered record
         (9.3; F-002 law 3 — snapshots are never hand-edited; drift fails
         closed). */
  proofs.push(
    proveRefusal('modified snapshots', [implementation('9.3'), bible('XI')], () => {
      const snapshot = captureSnapshot({
        snapshotId: 'sec-probe-snapshot',
        subject: { surface: 'security-probe', target: 'screen-desktop', mode: null, breakpoint: null, states: ['idle'] },
        content: { invariants: ['an invariant line (7.1)'], citations: [implementation('7.1')] },
        clock: () => 0,
        hash: sha256,
      });
      const tampered = {
        ...snapshot,
        invariants: ['a DIFFERENT invariant line — tampered (9.3)'],
      } as typeof snapshot;
      // The recomputation inside verifySnapshotIntegrity hashes the tampered
      // content; the bound identity no longer matches and must refuse.
      void snapshotIdentity;
      verifySnapshotIntegrity(tampered, sha256, { sha256: snapshot.sha256 });
    }),
  );

  return Object.freeze(proofs);
}

/** The full security & honesty report (order Deliverable 8). */
export interface SecurityReport {
  readonly passed: boolean;
  readonly proofs: readonly RefusalProof[];
  readonly citations: readonly Citation[];
}

/** Runs the eight refusal proofs. */
export function runSecurityVerification(): SecurityReport {
  const proofs = runRefusalProofs();
  return Object.freeze({
    passed: proofs.every((proof) => proof.passed),
    proofs,
    citations: ENGINE_CITATIONS,
  });
}

/** The gate form: throws a ConstitutionalViolationError on any failed refusal. */
export function assertSecurity(): SecurityReport {
  const report = runSecurityVerification();
  const failed = report.proofs.filter((proof) => !proof.passed);
  if (failed.length > 0) {
    throw new ConstitutionalViolationError(
      '1.6 / Part VIII / order Deliverable 8',
      `Security & honesty verification failed: ${failed.map((proof) => `${proof.refusal} — ${proof.evidence}`).join(' | ')}. Every refusal must terminate with a ConstitutionalViolationError (order Deliverable 8; 9.1).`,
      ENGINE_CITATIONS,
    );
  }
  return report;
}

export const SECURITY_ENGINE_CITATIONS: readonly Citation[] = Object.freeze(ENGINE_CITATIONS);
