/**
 * Vaerion — Authorities / The Ledger Authority
 *
 * Receipt lifecycle (Constitution 8.1): "Drafted (claim stated in human
 * voice) → evidence gathered (each item hashed at capture) → verdict issued
 * by the Verification Authority → appended by the Chain Authority →
 * immutable. Correction is never mutation: a superseding receipt is appended
 * and linked by chain parent. Extension fields are additive only."
 *
 * The Ledger Authority owns receipt records (8.0). It composes the Chain
 * Authority (append), the Evidence Authority (hashed evidence), and the
 * Verification Authority (verdict facts). It never accepts a verdict fact as
 * a parameter — it reads the Verification Authority's own recorded fact, so
 * no fabricated verdict can enter a receipt (5.3; Art. III).
 *
 * Appended receipts are immutable; the supersession link lives on the
 * superseding receipt — constitutional history is never mutated (8.1; 11.4).
 *
 * Citations: Implementation Constitution 8.0, 8.1; 5.3; 5.10; Bible Art.
 * II, III, VI.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { assertVerdictAuthority } from '../state/honesty';
import { assertQuarantineFlagPresent, type QuarantineFlag } from '../state/quarantine';
import type { HashFunction } from './hash';
import type { ChainAuthority } from './chain';
import type { EvidenceAuthority } from './evidence';
import type { VerificationAuthority, VerificationMethod, VerdictFact } from './verification';

/** The stages of the receipt lifecycle before immutability (8.1), in order. */
export const RECEIPT_DRAFT_STAGES = ['drafted', 'evidence-gathered', 'verdict-recorded'] as const;
export type ReceiptDraftStage = (typeof RECEIPT_DRAFT_STAGES)[number];

/** A receipt under construction — immutable stage states, advancing only. */
export interface ReceiptDraft {
  readonly draftId: string;
  readonly claim: string;
  readonly subject: string;
  readonly stage: ReceiptDraftStage;
  readonly evidenceIds: readonly string[];
  readonly verdict: VerdictFact | null;
  readonly method: VerificationMethod | null;
  readonly quarantine: QuarantineFlag;
  /** The receipt this draft supersedes, if it is a correction (8.1). */
  readonly supersedes: string | null;
  /** Extension fields — additive only (8.1; Art. VI). */
  readonly extensions: Readonly<Record<string, string>>;
}

/** An appended receipt — immutable forever (8.1). */
export interface ReceiptRecord {
  readonly receiptId: string;
  readonly claim: string;
  readonly subject: string;
  readonly verdict: VerdictFact;
  readonly verificationMethod: VerificationMethod;
  readonly evidenceIds: readonly string[];
  readonly issuedAt: number;
  /** The chain hash the receipt was appended under (Art. VI chain parent). */
  readonly chainParent: string;
  readonly quarantine: QuarantineFlag;
  readonly supersedes: string | null;
  readonly extensions: Readonly<Record<string, string>>;
}

export interface LedgerAuthority {
  readonly name: 'Ledger Authority';
  readonly records: readonly ReceiptRecord[];
  readonly drafts: readonly ReceiptDraft[];
  /** Drafts a receipt — the claim stated in human voice (8.1). */
  draft(params: {
    readonly claim: string;
    readonly subject: string;
    readonly quarantine: QuarantineFlag;
    readonly supersedes?: string;
    readonly extensions?: Readonly<Record<string, string>>;
  }): ReceiptDraft;
  /** Gathers evidence — each item already hashed at capture (8.1; 8.2). */
  gatherEvidence(params: { readonly draftId: string; readonly evidenceIds: readonly string[] }): ReceiptDraft;
  /** Records the verdict — read from the Verification Authority's own fact (8.1; 5.3). */
  recordVerdict(params: { readonly draftId: string; readonly verificationId: string }): ReceiptDraft;
  /** Appends through the Chain Authority — the receipt becomes immutable (8.1). */
  append(params: { readonly draftId: string }): ReceiptRecord;
  /** The record, or null. */
  get(receiptId: string): ReceiptRecord | null;
  /** Resolves the supersession chain to its current record (8.1). */
  current(receiptId: string): ReceiptRecord | null;
  /** The whole and the count — the sliced ledger states its measurement (Art. X). */
  list(): { readonly records: readonly ReceiptRecord[]; readonly total: number };
}

const LEDGER_CITATIONS: readonly Citation[] = [
  implementation('8.1', 'receipt lifecycle'),
  implementation('8.0', 'the Ledger Authority owns receipt records'),
];

export function createLedgerAuthority(params: {
  readonly hash: HashFunction;
  readonly clock?: () => number;
  readonly chain: ChainAuthority;
  readonly evidence: EvidenceAuthority;
  readonly verification: VerificationAuthority;
}): LedgerAuthority {
  const hash = params.hash;
  const clock = params.clock ?? (() => 0);
  const { chain, evidence, verification } = params;
  let seq = 0;
  let drafts: readonly ReceiptDraft[] = Object.freeze([]);
  let records: readonly ReceiptRecord[] = Object.freeze([]);

  function requireDraft(draftId: string): ReceiptDraft {
    const draft = drafts.find((candidate) => candidate.draftId === draftId);
    if (!draft) {
      throw new ConstitutionalViolationError(
        '8.1',
        `Receipt draft "${draftId}" does not exist (Constitution 8.1).`,
        LEDGER_CITATIONS,
      );
    }
    return draft;
  }

  function replaceDraft(next: ReceiptDraft): void {
    drafts = Object.freeze([...drafts.filter((draft) => draft.draftId !== next.draftId), next]);
  }

  return {
    name: 'Ledger Authority',
    get records() {
      return records;
    },
    get drafts() {
      return drafts;
    },
    draft({ claim, subject, quarantine, supersedes = null, extensions = {} }) {
      // The demo flag travels with the record through every authority,
      // forever (5.10). A record without its flag is unrenderable. At draft
      // time the receipt is identified by its claim.
      assertQuarantineFlagPresent({ id: `draft:${claim}`, quarantine });
      if (supersedes) {
        const original = records.find((record) => record.receiptId === supersedes);
        if (!original) {
          throw new ConstitutionalViolationError(
            '8.1',
            `A correction was drafted against "${supersedes}", which does not exist. Correction is never mutation: a superseding receipt is appended and linked (Constitution 8.1).`,
            LEDGER_CITATIONS,
          );
        }
      }
      seq += 1;
      const draft: ReceiptDraft = Object.freeze({
        draftId: `rcpt_draft_${hash(`${claim}|${subject}|${seq}`).slice(0, 16)}`,
        claim,
        subject,
        stage: 'drafted',
        evidenceIds: [],
        verdict: null,
        method: null,
        quarantine,
        supersedes,
        extensions: Object.freeze({ ...extensions }),
      });
      drafts = Object.freeze([...drafts, draft]);
      return draft;
    },
    gatherEvidence({ draftId, evidenceIds }) {
      const draft = requireDraft(draftId);
      if (draft.stage !== 'drafted') {
        throw new ConstitutionalViolationError(
          '8.1',
          `Draft "${draftId}" is "${draft.stage}"; evidence is gathered at the "drafted" stage (Constitution 8.1: drafted → evidence gathered → verdict issued → appended).`,
          LEDGER_CITATIONS,
        );
      }
      if (evidenceIds.length === 0) {
        throw new ConstitutionalViolationError(
          '8.1 / Art. II',
          'No evidence was gathered. Every claim carries its evidence or an explicit UNVERIFIED mark; a verdict-carrying receipt records at least one evidence item (Constitution 8.1; Art. II).',
          LEDGER_CITATIONS,
        );
      }
      for (const evidenceId of evidenceIds) {
        // Attests the artifact into this receipt (8.2 composition); the
        // Evidence Authority refuses missing evidence itself.
        evidence.attest({ evidenceId, receiptId: draftId });
      }
      const next: ReceiptDraft = Object.freeze({ ...draft, stage: 'evidence-gathered', evidenceIds: Object.freeze([...evidenceIds]) });
      replaceDraft(next);
      return next;
    },
    recordVerdict({ draftId, verificationId }) {
      const draft = requireDraft(draftId);
      if (draft.stage !== 'evidence-gathered') {
        throw new ConstitutionalViolationError(
          '8.1',
          `Draft "${draftId}" is "${draft.stage}"; the verdict is recorded after the evidence is gathered (Constitution 8.1: drafted → evidence gathered → verdict issued → appended).`,
          LEDGER_CITATIONS,
        );
      }
      // The fact is READ from the Verification Authority — never accepted as
      // a parameter. A fabricated verdict cannot enter a receipt (5.3).
      const fact = verification.factOf(verificationId);
      // Composition with the state engine's verdict-boundary law (5.3): the
      // fact must carry the named verifier, ruleset, and environment.
      assertVerdictAuthority({
        engineVersion: fact.verifier,
        ruleset: fact.ruleset,
        environment: fact.environment,
        issuedBy: fact.issuedBy,
      });
      const next: ReceiptDraft = Object.freeze({
        ...draft,
        stage: 'verdict-recorded',
        verdict: fact,
        method: Object.freeze({
          engineVersion: fact.verifier,
          ruleset: fact.ruleset,
          environment: fact.environment,
        }),
      });
      replaceDraft(next);
      return next;
    },
    append({ draftId }) {
      const draft = requireDraft(draftId);
      if (draft.stage !== 'verdict-recorded' || !draft.verdict || !draft.method) {
        throw new ConstitutionalViolationError(
          '8.1',
          `Draft "${draftId}" is "${draft.stage}"; a receipt is appended only after its verdict is recorded by the Verification Authority (Constitution 8.1).`,
          LEDGER_CITATIONS,
        );
      }
      if (draft.evidenceIds.length === 0) {
        throw new ConstitutionalViolationError(
          '8.1 / Art. II',
          'A receipt was appended without evidence. Every claim carries its evidence (Constitution 8.1; Art. II — evidence or silence).',
          LEDGER_CITATIONS,
        );
      }
      const receiptId = draft.draftId.replace('draft_', '');
      if (records.some((record) => record.receiptId === receiptId)) {
        throw new ConstitutionalViolationError(
          '8.1',
          `Receipt "${receiptId}" is already appended. Appended receipts are immutable; a draft appends exactly once — correction is a superseding receipt, never a re-append (Constitution 8.1).`,
          LEDGER_CITATIONS,
        );
      }
      // The Chain Authority owns the append (8.0) — the ledger composes it.
      const chainRecord = chain.append({
        payload: hash(`${draft.claim}|${draft.subject}|${draft.verdict.outcome}|${draft.evidenceIds.join(',')}`),
      });
      const record: ReceiptRecord = Object.freeze({
        receiptId,
        claim: draft.claim,
        subject: draft.subject,
        verdict: draft.verdict,
        verificationMethod: draft.method,
        evidenceIds: draft.evidenceIds,
        issuedAt: clock(),
        chainParent: chainRecord.hash,
        quarantine: draft.quarantine,
        supersedes: draft.supersedes,
        extensions: draft.extensions,
      });
      records = Object.freeze([...records, record]);
      return record;
    },
    get(receiptId) {
      return records.find((record) => record.receiptId === receiptId) ?? null;
    },
    current(receiptId) {
      // Walk the supersession chain forward — the link lives on the
      // superseding receipt; history is never edited (8.1).
      let record = records.find((candidate) => candidate.receiptId === receiptId) ?? null;
      let guard = 0;
      while (record) {
        const successor = records.find((candidate) => candidate.supersedes === record!.receiptId);
        if (!successor) break;
        record = successor;
        guard += 1;
        if (guard > records.length) {
          throw new ConstitutionalViolationError(
            '8.1',
            'The supersession chain is cyclic. Supersession links form a forward chain, never a cycle (Constitution 8.1).',
            LEDGER_CITATIONS,
          );
        }
      }
      return record;
    },
    list() {
      return Object.freeze({ records, total: records.length });
    },
  };
}
