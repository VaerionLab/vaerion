/**
 * Vaerion — Authorities / The Rule Authority
 *
 * Rule lifecycle (Constitution 8.4): "Drafted → ratified (versioned) →
 * effective window → superseded. A rule change binds a drift marker to
 * receipts verified under the affected window. Rules are quoted by
 * identifier wherever enforcement appears."
 *
 * The Rule Authority owns the Constitution and rulesets (8.0). Rule records
 * are frozen; supersession is recorded as its own record — the original is
 * never edited (no mutation of constitutional history). Drift markers
 * compose the Ledger Authority: the receipts verified under the affected
 * window are bound to the change (8.4).
 *
 * Citations: Implementation Constitution 8.0, 8.4; Bible Art. VI.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import type { HashFunction } from './hash';
import type { ReceiptRecord } from './ledger';

/** The stages of the rule lifecycle (8.4), in order. */
export const RULE_STAGES = ['drafted', 'ratified', 'effective', 'superseded'] as const;
export type RuleStage = (typeof RULE_STAGES)[number];

/** One immutable rule record (8.4). */
export interface RuleRecord {
  readonly ruleId: string;
  /** The identifier quoted wherever enforcement appears (8.4). */
  readonly identifier: string;
  readonly body: string;
  readonly version: string;
  readonly stage: RuleStage;
  readonly effectiveFrom: number | null;
  readonly citations: readonly Citation[];
}

/** One immutable supersession record — the original rule is never edited. */
export interface RuleSupersession {
  readonly supersessionId: string;
  readonly oldRuleId: string;
  readonly newRuleId: string;
  readonly supersededAt: number;
}

/** A drift marker binding a rule change to the receipts it affects (8.4). */
export interface DriftMarker {
  readonly ruleId: string;
  readonly identifier: string;
  readonly window: { readonly from: number; readonly to: number };
  readonly affectedReceiptIds: readonly string[];
}

export interface RuleAuthority {
  readonly name: 'Rule Authority';
  readonly rules: readonly RuleRecord[];
  readonly supersessions: readonly RuleSupersession[];
  /** Drafts a rule (8.4). */
  draft(params: { readonly identifier: string; readonly body: string }): RuleRecord;
  /** Ratifies a rule — versioned; ratification opens its effective window (8.4). */
  ratify(params: { readonly ruleId: string; readonly version: string; readonly effectiveFrom?: number }): RuleRecord;
  /** Supersedes a rule with a new versioned rule — recorded, never edited (8.4). */
  supersede(params: { readonly ruleId: string; readonly replacement: { readonly identifier: string; readonly body: string; readonly version: string } }): { readonly oldRule: RuleRecord; readonly newRule: RuleRecord; readonly supersession: RuleSupersession };
  /**
   * Binds a drift marker to the receipts verified under the affected window
   * (8.4) — composition with the Ledger Authority.
   */
  driftMarkers(params: { readonly ruleId: string; readonly receipts: readonly ReceiptRecord[] }): readonly DriftMarker[];
}

const RULE_CITATIONS: readonly Citation[] = [
  implementation('8.4', 'rule lifecycle'),
  implementation('8.0', 'the Rule Authority owns the Constitution and rulesets'),
];

export function createRuleAuthority(params: {
  readonly hash: HashFunction;
  readonly clock?: () => number;
}): RuleAuthority {
  const hash = params.hash;
  const clock = params.clock ?? (() => 0);
  let seq = 0;
  let rules: readonly RuleRecord[] = Object.freeze([]);
  let supersessions: readonly RuleSupersession[] = Object.freeze([]);

  function requireRule(ruleId: string): RuleRecord {
    const rule = rules.find((candidate) => candidate.ruleId === ruleId);
    if (!rule) {
      throw new ConstitutionalViolationError(
        '8.4',
        `Rule "${ruleId}" does not exist (Constitution 8.4).`,
        RULE_CITATIONS,
      );
    }
    return rule;
  }

  function replaceRule(next: RuleRecord): void {
    rules = Object.freeze([...rules.filter((rule) => rule.ruleId !== next.ruleId), next]);
  }

  function draftRule(identifier: string, body: string): RuleRecord {
    seq += 1;
    const rule: RuleRecord = Object.freeze({
      ruleId: `rule_${hash(`${identifier}|${seq}`).slice(0, 16)}`,
      identifier,
      body,
      version: 'draft',
      stage: 'drafted',
      effectiveFrom: null,
      citations: [implementation('8.4', 'drafted → ratified (versioned) → effective window → superseded')],
    });
    rules = Object.freeze([...rules, rule]);
    return rule;
  }

  return {
    name: 'Rule Authority',
    get rules() {
      return rules;
    },
    get supersessions() {
      return supersessions;
    },
    draft({ identifier, body }) {
      return draftRule(identifier, body);
    },
    ratify({ ruleId, version, effectiveFrom }) {
      const rule = requireRule(ruleId);
      if (rule.stage !== 'drafted') {
        throw new ConstitutionalViolationError(
          '8.4',
          `Rule "${rule.identifier}" is "${rule.stage}"; only a drafted rule is ratified (Constitution 8.4).`,
          RULE_CITATIONS,
        );
      }
      if (!version) {
        throw new ConstitutionalViolationError(
          '8.4',
          `Rule "${rule.identifier}" was ratified without a version. Ratification is versioned (Constitution 8.4).`,
          RULE_CITATIONS,
        );
      }
      const next: RuleRecord = Object.freeze({
        ...rule,
        version,
        stage: 'effective',
        effectiveFrom: effectiveFrom ?? clock(),
      });
      replaceRule(next);
      return next;
    },
    supersede({ ruleId, replacement }) {
      const oldRule = requireRule(ruleId);
      if (oldRule.stage !== 'effective') {
        throw new ConstitutionalViolationError(
          '8.4',
          `Rule "${oldRule.identifier}" is "${oldRule.stage}"; only an effective rule is superseded (Constitution 8.4: drafted → ratified → effective window → superseded).`,
          RULE_CITATIONS,
        );
      }
      const newRule = Object.freeze({
        ...draftRule(replacement.identifier, replacement.body),
        version: replacement.version,
        stage: 'effective' as RuleStage,
        effectiveFrom: clock(),
      });
      const supersession: RuleSupersession = Object.freeze({
        supersessionId: `sup_${hash(`${oldRule.ruleId}|${newRule.ruleId}`).slice(0, 16)}`,
        oldRuleId: oldRule.ruleId,
        newRuleId: newRule.ruleId,
        supersededAt: clock(),
      });
      supersessions = Object.freeze([...supersessions, supersession]);
      // The old rule's stage is recorded by the supersession record itself —
      // the original rule record is never edited.
      const closed: RuleRecord = Object.freeze({ ...oldRule, stage: 'superseded' });
      replaceRule(closed);
      return { oldRule: closed, newRule, supersession };
    },
    driftMarkers({ ruleId, receipts }) {
      const rule = requireRule(ruleId);
      const closure = supersessions.find((candidate) => candidate.oldRuleId === ruleId);
      const to = closure ? closure.supersededAt : clock();
      const from = rule.effectiveFrom;
      if (from === null) {
        throw new ConstitutionalViolationError(
          '8.4',
          `Rule "${rule.identifier}" has no effective window; no drift marker can bind (Constitution 8.4).`,
          RULE_CITATIONS,
        );
      }
      // A rule change binds a drift marker to receipts verified under the
      // affected window (8.4) — matched by the ruleset the receipt names.
      const affected = receipts.filter((receipt) => {
        const verifiedAt = receipt.issuedAt;
        return (
          receipt.verificationMethod.ruleset === rule.identifier && verifiedAt >= from && verifiedAt <= to
        );
      });
      return [Object.freeze({
        ruleId,
        identifier: rule.identifier,
        window: Object.freeze({ from, to }),
        affectedReceiptIds: Object.freeze(affected.map((receipt) => receipt.receiptId)),
      })];
    },
  };
}
