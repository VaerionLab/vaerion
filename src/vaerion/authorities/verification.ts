/**
 * Vaerion — Authorities / The Verification Authority
 *
 * Verification lifecycle (Constitution 8.3): "Queued → method bound (engine
 * version and ruleset pinned at verification time) → verdict issued → final.
 * Re-verification issues a new receipt; verdicts are never edited in place."
 *
 * The Verification Authority issues verdicts (8.0). No other authority —
 * and no surface, primitive, or interaction — may produce, predict, or
 * optimistically render one (5.3; 1.6; Art. VIII). The verdict facts this
 * authority mints are the only verdict facts in the system; the state
 * engine's verdict boundary (5.3) and the ledger's recording law (8.1)
 * compose with them.
 *
 * Citations: Implementation Constitution 8.0, 8.3, 5.3, 1.6; Bible Art.
 * III, VIII.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import type { HashFunction } from './hash';

/** The method bound at verification time (8.3; Art. III). */
export interface VerificationMethod {
  readonly engineVersion: string;
  readonly ruleset: string;
  readonly environment: string;
}

/** The stages of the verification lifecycle (8.3), in order. */
export const VERIFICATION_STAGES = ['queued', 'method-bound', 'final'] as const;
export type VerificationStage = (typeof VERIFICATION_STAGES)[number];

/** The verdict fact — the only lawful form of a verdict in the system. */
export interface VerdictFact {
  readonly outcome: 'verified' | 'failed';
  readonly verifier: string;
  readonly ruleset: string;
  readonly environment: string;
  readonly issuedBy: 'Verification Authority';
  readonly verificationId: string;
}

/** One immutable verification record (8.3). */
export interface VerificationRecord {
  readonly verificationId: string;
  readonly claim: string;
  readonly subject: string;
  readonly stage: VerificationStage;
  readonly method: VerificationMethod | null;
  readonly verdict: VerdictFact | null;
  readonly reverifiedFrom: string | null;
}

export interface VerificationAuthority {
  readonly name: 'Verification Authority';
  readonly records: readonly VerificationRecord[];
  /** Queues a verification (8.3). */
  queue(params: { readonly claim: string; readonly subject: string }): VerificationRecord;
  /** Binds the method — pinned at verification time; binding again throws (8.3). */
  bindMethod(params: { readonly verificationId: string; readonly method: VerificationMethod }): VerificationRecord;
  /** Issues the verdict of the bound method's run (8.3; Art. III). */
  issue(params: { readonly verificationId: string; readonly outcome: 'verified' | 'failed' }): VerdictFact;
  /** Re-verification issues a NEW verification; verdicts are never edited (8.3). */
  reverify(params: { readonly verificationId: string }): VerificationRecord;
  /** The authority's own recorded fact for a verification — the anti-fabrication check. */
  factOf(verificationId: string): VerdictFact;
}

const VERIFICATION_CITATIONS: readonly Citation[] = [
  implementation('8.3', 'verification lifecycle'),
  implementation('8.0', 'the Verification Authority issues verdicts'),
  implementation('5.3', 'the verdict boundary'),
];

export function createVerificationAuthority(params: { readonly hash: HashFunction }): VerificationAuthority {
  const hash = params.hash;
  let seq = 0;
  let records: readonly VerificationRecord[] = Object.freeze([]);

  function replaceRecord(next: VerificationRecord): void {
    records = Object.freeze([...records.filter((record) => record.verificationId !== next.verificationId), next]);
  }

  function requireRecord(verificationId: string): VerificationRecord {
    const record = records.find((candidate) => candidate.verificationId === verificationId);
    if (!record) {
      throw new ConstitutionalViolationError(
        '8.3',
        `Verification "${verificationId}" does not exist. Verifications are owned by the Verification Authority (Constitution 8.0).`,
        VERIFICATION_CITATIONS,
      );
    }
    return record;
  }

  return {
    name: 'Verification Authority',
    get records() {
      return records;
    },
    queue({ claim, subject }) {
      seq += 1;
      const verificationId = `vrf_${hash(`${claim}|${subject}|${seq}`).slice(0, 16)}`;
      const record: VerificationRecord = Object.freeze({
        verificationId,
        claim,
        subject,
        stage: 'queued',
        method: null,
        verdict: null,
        reverifiedFrom: null,
      });
      records = Object.freeze([...records, record]);
      return record;
    },
    bindMethod({ verificationId, method }) {
      const record = requireRecord(verificationId);
      if (record.stage !== 'queued') {
        throw new ConstitutionalViolationError(
          '8.3',
          `Verification "${verificationId}" is "${record.stage}"; its method was already bound. The engine version and ruleset are pinned at verification time — re-binding is a violation (Constitution 8.3).`,
          VERIFICATION_CITATIONS,
        );
      }
      for (const field of ['engineVersion', 'ruleset', 'environment'] as const) {
        if (!method[field]) {
          throw new ConstitutionalViolationError(
            'Art. III',
            `The bound method is missing "${field}". Every verdict names the engine version, the rule set, and the environment (Bible Art. III; Constitution 8.3).`,
            VERIFICATION_CITATIONS,
          );
        }
      }
      const next: VerificationRecord = Object.freeze({ ...record, stage: 'method-bound', method: Object.freeze({ ...method }) });
      replaceRecord(next);
      return next;
    },
    issue({ verificationId, outcome }) {
      const record = requireRecord(verificationId);
      if (!record.method) {
        throw new ConstitutionalViolationError(
          '8.3 / Art. III',
          `A verdict was requested for verification "${verificationId}" with no bound method. The engine version and ruleset are pinned at verification time; an anonymous verdict is constitutionally void (Constitution 8.3; Art. III).`,
          VERIFICATION_CITATIONS,
        );
      }
      if (record.verdict) {
        throw new ConstitutionalViolationError(
          '8.3',
          `Verification "${verificationId}" already issued its verdict. Verdicts are final; re-verification issues a new verification — verdicts are never edited in place (Constitution 8.3).`,
          VERIFICATION_CITATIONS,
        );
      }
      const fact: VerdictFact = Object.freeze({
        outcome,
        verifier: record.method.engineVersion,
        ruleset: record.method.ruleset,
        environment: record.method.environment,
        issuedBy: 'Verification Authority',
        verificationId,
      });
      const next: VerificationRecord = Object.freeze({ ...record, stage: 'final', verdict: fact });
      replaceRecord(next);
      return fact;
    },
    reverify({ verificationId }) {
      const record = requireRecord(verificationId);
      if (!record.verdict) {
        throw new ConstitutionalViolationError(
          '8.3',
          `Re-verification requested for "${verificationId}" before any verdict exists. Re-verification follows a final verdict (Constitution 8.3).`,
          VERIFICATION_CITATIONS,
        );
      }
      // Re-verification issues a new verification — the original is never
      // edited (8.3; no mutation of constitutional history).
      seq += 1;
      const newId = `vrf_${hash(`${record.claim}|${record.subject}|${seq}|reverification`).slice(0, 16)}`;
      const next: VerificationRecord = Object.freeze({
        verificationId: newId,
        claim: record.claim,
        subject: record.subject,
        stage: 'queued',
        method: null,
        verdict: null,
        reverifiedFrom: verificationId,
      });
      records = Object.freeze([...records, next]);
      return next;
    },
    factOf(verificationId) {
      const record = requireRecord(verificationId);
      if (!record.verdict) {
        throw new ConstitutionalViolationError(
          '8.3',
          `Verification "${verificationId}" has issued no verdict (Constitution 8.3).`,
          VERIFICATION_CITATIONS,
        );
      }
      return record.verdict;
    },
  };
}
