/**
 * Vaerion — Interaction / Act Resolution: Receipt · Return · Failure Receipt
 *
 * Constitution 6.5: "Every completed act resolves to a receipt or a Return;
 * every failed act resolves to a Failure Receipt; nothing resolves to
 * silence." The feedback inventory of VS §13 is exhaustive.
 *
 * The Silence Doctrine (6.13): routine appends notify no one — the
 * resolution instrument records; it does not dramatize.
 *
 * Citations: Implementation Constitution 6.5, 6.13, 5.2; VS §13; Bible
 * Art. II.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import type { ResolutionKind } from './commands';

/** A receipt reference — the record appended by the Ledger Authority (8.0). */
export interface ReceiptRef {
  readonly receiptId: string;
}

/** The resolution of one act (6.5 — the closed set). */
export type ActResolution =
  | { readonly kind: 'receipt'; readonly receipt: ReceiptRef }
  | { readonly kind: 'return'; readonly copyId: string; readonly machineId: string }
  | { readonly kind: 'failure-receipt'; readonly receipt: ReceiptRef; readonly copyId: string };

export const RESOLUTION_CITATIONS: readonly Citation[] = [
  implementation('6.5', 'every completed act resolves to a receipt or a Return; nothing resolves to silence'),
  implementation('6.13', 'the silence doctrine — routine appends notify no one'),
  visualSystem('13', 'the feedback inventory'),
];

/**
 * Validates an act resolution. Every act must resolve; a silent termination
 * is a violation (6.5). A Failure Receipt must carry its receipt id (5.2;
 * 5.7).
 */
export function assertResolution(resolution: ActResolution | null | undefined): ActResolution {
  if (!resolution) {
    throw new ConstitutionalViolationError(
      '6.5',
      'An act terminated silently. Every completed act resolves to a receipt or a Return; every failed act resolves to a Failure Receipt (Constitution 6.5).',
    );
  }
  if (!RESOLUTION_KIND_SET.has(resolution.kind)) {
    throw new ConstitutionalViolationError(
      '6.5',
      `"${String((resolution as { kind?: string }).kind)}" is not a lawful resolution. The set is closed: receipt, return, failure-receipt (Constitution 6.5).`,
    );
  }
  if (resolution.kind === 'failure-receipt' && !resolution.receipt.receiptId) {
    throw new ConstitutionalViolationError(
      '5.7',
      'A Failure Receipt without its receipt id — every Error carries a Failure Receipt with receipt id (Constitution 5.7; 5.2).',
    );
  }
  return resolution;
}

const RESOLUTION_KIND_SET: ReadonlySet<ResolutionKind> = new Set(['receipt', 'return', 'failure-receipt']);

/**
 * Act lifecycle (6.1; 6.2): declared → intent (when the ladder requires) →
 * confirmed → executing → resolved. The lifecycle is the interaction state
 * synchronization with the constitutional state machine (Part V): executing
 * acts drive lawful transitions (work issued → loading; act fails → error).
 */
export const INTERACTION_LIFECYCLE = ['declared', 'intent', 'confirmed', 'executing', 'resolved'] as const;
export type InteractionLifecycleStage = (typeof INTERACTION_LIFECYCLE)[number];

/**
 * Advances the lifecycle legally: no stage may be skipped, and resolution
 * must occur exactly once (6.5 — nothing silent, nothing twice).
 */
export function assertLifecycleAdvance(from: InteractionLifecycleStage, to: InteractionLifecycleStage): void {
  const fromIndex = INTERACTION_LIFECYCLE.indexOf(from);
  const toIndex = INTERACTION_LIFECYCLE.indexOf(to);
  if (toIndex !== fromIndex + 1) {
    throw new ConstitutionalViolationError(
      '6.1',
      `Illegal lifecycle advance ${from} → ${to}. The interaction lifecycle is declared → intent → confirmed → executing → resolved; stages may not be skipped (Constitution 6.1; 6.2).`,
    );
  }
}
