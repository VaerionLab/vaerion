/**
 * Vaerion — Interaction / The Command Dispatcher
 *
 * The dispatcher binds the interaction engine to the constitutional state
 * machine (Part V): a command's lifecycle drives lawful state transitions,
 * and every act terminates in a receipt, a Return, or a Failure Receipt
 * (6.5) — the interaction state synchronization (6.1; Part V).
 *
 * Free-form handlers are prohibited (6.1): the dispatcher executes only
 * registered commands, validates the confirmation ladder before execution,
 * and resolves every outcome through the resolution law.
 *
 * Citations: Implementation Constitution 6.1, 6.2, 6.3, 6.5, Part V; VS §13.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { assertCommandLawful, type CommandRegistration } from './commands';
import {
  assertConfirmationLawful,
  type IntentDeclaration,
} from './confirm';
import {
  assertResolution,
  INTERACTION_LIFECYCLE,
  type ActResolution,
  type InteractionLifecycleStage,
} from './receipts';
import type { StateEvent, TransitionPayload } from '../state/transitions';
import type { CanonicalState } from '../state/matrix';

export const DISPATCHER_CITATIONS: readonly Citation[] = [
  implementation('6.1', 'the command dispatcher executes registered commands only'),
  implementation('6.5', 'every act terminates in a receipt, a Return, or a Failure Receipt'),
];

/** The lawful state events a command's execution may drive (Part V — the fixed set). */
const LAWFUL_EXECUTION_EVENTS: readonly StateEvent[] = [
  'work-issued',
  'verification-requested',
  'user-cancels',
  'act-fails',
];

/**
 * The interaction state synchronization contract (Part V; 6.1): executing a
 * command may drive only lawful state events, dispatched through the
 * constitutional state machine with its own ownership validation. The
 * dispatcher refuses any event outside the fixed execution set.
 */
export function assertExecutionEventLawful(event: StateEvent): void {
  if (!LAWFUL_EXECUTION_EVENTS.includes(event)) {
    throw new ConstitutionalViolationError(
      'Part V / 6.1',
      `Event "${event}" is not a lawful execution event. Verdict facts arrive only from the Verification Authority (5.3); the dispatcher may not fabricate one.`,
    );
  }
}

/** One dispatched act — the dispatcher's record of a lawful interaction. */
export interface DispatchedAct {
  readonly command: CommandRegistration;
  readonly stage: InteractionLifecycleStage;
  readonly intent: IntentDeclaration | null;
  readonly resolution: ActResolution | null;
}

/**
 * Validates one full dispatch: the command exists, the ladder is satisfied
 * for its friction class, and the resolution — when present — is lawful.
 * This is the mechanical core of "free-form handlers are prohibited" (6.1).
 */
export function assertDispatchLawful(params: {
  readonly commandId: string;
  readonly intent?: IntentDeclaration;
  readonly typedIdentifier?: string;
  readonly exactIdentifier?: string;
  readonly resolution?: ActResolution | null;
}): DispatchedAct {
  const command = assertCommandLawful(params.commandId);
  assertConfirmationLawful({
    friction: command.friction,
    intent: params.intent,
    typedIdentifier: params.typedIdentifier,
    exactIdentifier: params.exactIdentifier,
  });
  if (params.resolution !== undefined) {
    assertResolution(params.resolution ?? null);
  }
  const stage: InteractionLifecycleStage = params.resolution ? 'resolved' : 'declared';
  if (params.resolution && !INTERACTION_LIFECYCLE.includes(stage)) {
    throw new ConstitutionalViolationError('6.1', 'The interaction lifecycle stage is not registered.');
  }
  return {
    command,
    stage,
    intent: params.intent ?? null,
    resolution: params.resolution ?? null,
  };
}

/**
 * The failure resolution helper: an act that throws resolves as a Failure
 * Receipt (6.5; 5.2) with its receipt id — never silently. The caller
 * supplies the receipt id issued by the failure.
 */
export function failureResolution(receiptId: string): ActResolution {
  const resolution: ActResolution = {
    kind: 'failure-receipt',
    receipt: { receiptId },
    copyId: 'interaction.actFailed',
  };
  return assertResolution(resolution);
}

/**
 * The cancel helper: a user cancellation issues a Return naming the
 * cancellation and drives the lawful 'user-cancels' transition (5.8; 5.7).
 */
export function cancelAct(params: {
  readonly dispatchStateEvent: (event: StateEvent, payload?: TransitionPayload, to?: CanonicalState) => void;
}): void {
  assertExecutionEventLawful('user-cancels');
  params.dispatchStateEvent('user-cancels');
}
