/**
 * Vaerion — Interaction / Intent Declaration & The Confirmation Ladder
 *
 * Constitution 6.2 — Intent: "Acts at friction rungs four and five must
 * declare intent before execution: consequence sentence, governing rule
 * quotation, explicit confirmation. Intent declaration is a rendering
 * obligation, not a suggestion."
 *
 * Constitution 6.3 — Confirmation: "The confirmation ladder is fixed: single
 * act for reversible; ceremony dialog for consequential; typed identifier for
 * destructive. Destructive confirmation must reference the exact record
 * identifier — vague destruction is prohibited."
 *
 * The friction ladder of VS §13.1 maps to the ladder rungs: browsing (0),
 * reversible (10 s undo), significant (ceremony), destructive (receipt id).
 *
 * Citations: Implementation Constitution 6.2, 6.3, 3.12; VS §5.18, §13.1;
 * Bible Art. X (ceremony).
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import type { FrictionClass } from './commands';

/** The declaration of intent an act at the ceremony rungs must carry (6.2). */
export interface IntentDeclaration {
  /** The consequence sentence, in the Human Voice (6.2; Art. VII). */
  readonly consequence: string;
  /** The governing rule quotation (6.2). */
  readonly ruleQuote: string;
  /** Whether explicit confirmation is required and rendered (6.2). */
  readonly explicitConfirm: boolean;
}

const LADDER_CITATIONS: readonly Citation[] = [
  implementation('6.2', 'intent declaration'),
  implementation('6.3', 'the confirmation ladder is fixed'),
];

/**
 * The lawful confirmation requirement per friction class (6.3; VS §13.1):
 *   - browse: no confirmation;
 *   - reversible: single act — the 10 s undo window is the safety (6.4);
 *   - significant: ceremony dialog (consequence, rule quote, explicit confirm);
 *   - destructive: typed identifier referencing the exact record.
 */
export function assertConfirmationLawful(params: {
  readonly friction: FrictionClass;
  /** The intent declaration presented (required for significant and destructive). */
  readonly intent?: IntentDeclaration;
  /** The typed identifier presented (required for destructive). */
  readonly typedIdentifier?: string;
  /** The exact record identifier the typed input must match. */
  readonly exactIdentifier?: string;
}): void {
  switch (params.friction) {
    case 'browse':
      return; // browsing is never taxed (VS §13.1)
    case 'reversible':
      return; // single act; the undo window is the registered safety (6.4)
    case 'significant':
      if (!params.intent) {
        throw new ConstitutionalViolationError(
          '6.2',
          'A significant act without a declared intent. Acts at the ceremony rungs must declare intent before execution: consequence sentence, governing rule quotation, explicit confirmation (Constitution 6.2).',
        );
      }
      if (!params.intent.consequence || !params.intent.ruleQuote || params.intent.explicitConfirm !== true) {
        throw new ConstitutionalViolationError(
          '6.2',
          'The intent declaration is incomplete — a consequence sentence, a governing rule quotation, and an explicit confirmation are all required (Constitution 6.2).',
        );
      }
      return;
    case 'destructive':
      if (!params.intent) {
        throw new ConstitutionalViolationError(
          '6.2',
          'A destructive act without a declared intent (Constitution 6.2).',
        );
      }
      if (params.typedIdentifier === undefined || params.exactIdentifier === undefined) {
        throw new ConstitutionalViolationError(
          '6.3',
          'A destructive act without a typed identifier. Destructive confirmation must reference the exact record identifier — vague destruction is prohibited (Constitution 6.3; VS §13.1).',
        );
      }
      if (params.typedIdentifier !== params.exactIdentifier) {
        throw new ConstitutionalViolationError(
          '6.3',
          `The typed identifier does not reference the exact record. Vague destruction is prohibited (Constitution 6.3).`,
        );
      }
      return;
    default: {
      // The friction vocabulary is closed; this branch is unreachable.
      throw new ConstitutionalViolationError('6.3', `Unknown friction class "${String(params.friction)}".`);
    }
  }
}

/** Ladder integrity — the ladder is fixed (6.3; VS §13.1). */
export function assertLadderIntegrity(): void {
  // Destructive without an exact identifier must throw.
  let vagueRefused = false;
  try {
    assertConfirmationLawful({
      friction: 'destructive',
      intent: { consequence: 'c', ruleQuote: 'q', explicitConfirm: true },
      typedIdentifier: 'other-record',
      exactIdentifier: 'rcpt_target',
    });
  } catch {
    vagueRefused = true;
  }
  if (!vagueRefused) {
    throw new ConstitutionalViolationError('6.3', 'A destructive act was confirmed without referencing the exact record identifier.');
  }
  // Significant without ceremony must throw.
  let ceremonyRefused = false;
  try {
    assertConfirmationLawful({ friction: 'significant' });
  } catch {
    ceremonyRefused = true;
  }
  if (!ceremonyRefused) {
    throw new ConstitutionalViolationError('6.2', 'A significant act was executed without the ceremony contract.');
  }
}

export { LADDER_CITATIONS };
