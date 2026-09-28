/**
 * Vaerion — Interaction / The Fifteen Interaction Gates
 *
 * Mechanical verification of Part VI (Constitution 9.1 form: binary, cited).
 * Each gate exercises the engine's own law against the running modules —
 * registry, keyboard, pointer, gesture, focus, ladder, hold, undo,
 * resolution, latency, announcements, Lens — so the proof is of the engine,
 * not of a description of it (P-6).
 *
 * Citations: Implementation Constitution Part VI, 9.1; VS §5, §10, §12, §13.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, bible, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { COMMAND_REGISTRY, assertCommandRegistryIntegrity, assertCommandLawful, CALIPER_VERBS, routeInput } from './commands';
import { CANONICAL_KEY_MAP, CONSTITUTIONAL_KEYS, assertKeyNotShadowed, assertKeyboardReachability, resolveKeyEvent } from './keys';
import { HOVER_GRANTS, GESTURES, assertHoverLawful, assertGestureLawful, assertPointerNeverSolePath, assertScrubPairing, INTERACTION_HOLD_AFFIRM_MS } from './pointer';
import { assertSingleFocusOwner, assertFocusTreatmentLawful, assertFocusRestored, assertDialogTrapsFocus } from './focus';
import { assertLadderIntegrity, assertConfirmationLawful } from './confirm';
import { completeHold, assertPathEquivalence, HOLD_DURATION_MS } from './hold';
import { executeUndo, isUndoWindowOpen, UNDO_WINDOW_MS } from './undo';
import { assertResolution, assertLifecycleAdvance } from './receipts';
import { assertAcknowledgment, assertGaugeDelayLawful, assertReturnLifeLawful, assertNavigationWithoutTransition, ACKNOWLEDGMENT_BOUND_MS, GAUGE_THRESHOLD_MS, RETURN_LIFE_S } from './latency';
import { assertAnnouncementLawful, assertBatchWindowLawful } from './announce';
import { assertActivationLawful, assertLensFocusLaw, assertLensHonorsRestrictions, LENS_ACTIVATION_PATHS } from './lens';
import { interactionCopy } from './copy';
import { assertDispatchLawful, assertExecutionEventLawful, failureResolution } from './dispatcher';

/** The verdict of one mechanical gate (9.1 form). */
export interface InteractionGateResult {
  readonly gate: string;
  readonly passed: boolean;
  readonly evidence: string;
  readonly citations: readonly Citation[];
}

const GATE_CITATIONS: readonly Citation[] = [implementation('Part VI'), implementation('9.1', 'mechanical, binary, cited')];

function runGate(gate: string, citations: readonly Citation[], proof: () => string): InteractionGateResult {
  try {
    const evidence = proof();
    return { gate, passed: true, evidence, citations: [...citations, ...GATE_CITATIONS] };
  } catch (error) {
    return {
      gate,
      passed: false,
      evidence: error instanceof Error ? error.message : String(error),
      citations: [...citations, ...GATE_CITATIONS],
    };
  }
}

/** 1 — keyboard reachability: every command is keyboard-reachable (6.7). */
export function gateKeyboardReachability(): InteractionGateResult {
  return runGate('keyboard reachability', [implementation('6.7'), bible('XIV')], () => {
    assertKeyboardReachability();
    for (const command of COMMAND_REGISTRY) {
      // 6.7 — every command is keyboard-reachable: either through a
      // constitutional key in the central map, or through standard activation
      // on a focused control (dialogs, Returns, ceremony flows are fully
      // keyboard-operable by Tab + Enter/Space).
      if (command.keyboardReachableVia === 'canonical-key' && !command.key) {
        throw new ConstitutionalViolationError('6.7', `Command "${command.id}" declares canonical-key reachability but binds no key.`);
      }
      if (command.keyboardReachableVia !== 'canonical-key' && command.keyboardReachableVia !== 'standard-activation') {
        throw new ConstitutionalViolationError('6.7', `Command "${command.id}" declares an unknown reachability form.`);
      }
    }
    return `${COMMAND_REGISTRY.length} commands, all keyboard-reachable (canonical keys + standard activation) (6.7)`;
  });
}

/** 2 — command registry integrity: verbs, names, resolutions, citations (6.1). */
export function gateCommandRegistryIntegrity(): InteractionGateResult {
  return runGate('command registry integrity', [implementation('6.1'), visualSystem('5')], () => {
    assertCommandRegistryIntegrity();
    for (const command of COMMAND_REGISTRY) {
      if (!CALIPER_VERBS.includes(command.verb)) {
        throw new ConstitutionalViolationError('6.1', `Command "${command.id}" speaks an unregistered verb.`);
      }
    }
    return `${COMMAND_REGISTRY.length} commands registered; verbs go/get/verify/attest only (VS §5 Caliper)`;
  });
}

/** 3 — shortcut conflicts: no two commands share a binding; constitutional keys unshadowed (6.7). */
export function gateShortcutConflicts(): InteractionGateResult {
  return runGate('shortcut conflicts', [implementation('6.7')], () => {
    const claims = new Map<string, number>();
    for (const [key, commands] of Object.entries(CANONICAL_KEY_MAP)) {
      if (key !== 'e' && commands.length > 1) {
        throw new ConstitutionalViolationError('6.7', `Key "${key}" resolves to ${commands.length} commands without a lawful focus context.`);
      }
      claims.set(key, commands.length);
    }
    // The only lawful double meaning is E (evidence / criteria edit) — 6.7.
    if (CANONICAL_KEY_MAP.e.length !== 2) {
      throw new ConstitutionalViolationError('6.7', 'The canonical map lost the lawful E double meaning (evidence traversal; criteria edit).');
    }
    // Shadow refusal is enforced.
    let shadowRefused = false;
    try {
      assertKeyNotShadowed('escape', true);
    } catch {
      shadowRefused = true;
    }
    if (!shadowRefused) throw new ConstitutionalViolationError('6.7', 'A surface handler was allowed to shadow a constitutional key.');
    return `${CONSTITUTIONAL_KEYS.length} constitutional keys; no conflicts; shadowing refused (the lawful E duality intact)`;
  });
}

/** 4 — focus ownership: exactly one focus owner per surface (6.8). */
export function gateFocusOwnership(): InteractionGateResult {
  return runGate('focus ownership', [implementation('6.8')], () => {
    let multiRefused = false;
    try {
      assertSingleFocusOwner('gate', ['a', 'b']);
    } catch {
      multiRefused = true;
    }
    if (!multiRefused) throw new ConstitutionalViolationError('6.8', 'Two focus owners were accepted on one surface.');
    assertFocusTreatmentLawful({ visible: true, animated: false, removed: false });
    let invisibleRefused = false;
    try {
      assertFocusTreatmentLawful({ visible: false, animated: false, removed: false });
    } catch {
      invisibleRefused = true;
    }
    if (!invisibleRefused) throw new ConstitutionalViolationError('6.8', 'Invisible focus was accepted.');
    return 'one owner per surface; focus visible, never animated, never removed (6.8; VS §3.5)';
  });
}

/** 5 — dialog trapping: focus trapped while open, restored on close (6.8; 3.12). */
export function gateDialogTrapping(): InteractionGateResult {
  return runGate('dialog trapping', [implementation('6.8'), implementation('3.12')], () => {
    assertDialogTrapsFocus(true, true);
    let untrappedRefused = false;
    try {
      assertDialogTrapsFocus(true, false);
    } catch {
      untrappedRefused = true;
    }
    if (!untrappedRefused) throw new ConstitutionalViolationError('6.8', 'An untrapped dialog was accepted.');
    assertFocusRestored({ originatorId: 'gate-origin', restoredToOriginator: true });
    let unrestoredRefused = false;
    try {
      assertFocusRestored({ originatorId: 'gate-origin', restoredToOriginator: false });
    } catch {
      unrestoredRefused = true;
    }
    if (!unrestoredRefused) throw new ConstitutionalViolationError('6.8', 'A lost focus restoration was accepted.');
    return 'traps enforced while open; restoration to the originator enforced on close (6.8; 3.12)';
  });
}

/** 6 — accessibility announcements: registry-consumed strings only (6.11; F-003). */
export function gateAccessibilityAnnouncements(): InteractionGateResult {
  return runGate('accessibility announcements', [implementation('6.11'), implementation('F-003', 'the copy authority')], () => {
    for (const entry of ['interaction.undoWindow', 'interaction.cancelled', 'state.offline', 'interaction.actFailed']) {
      interactionCopy(entry); // unregistered ids throw
    }
    assertAnnouncementLawful({
      copyId: 'explainer.verified',
      text: 'A named verifier checked this claim against a named rule set, and the check holds.',
      voice: 'human',
      politeness: 'assertive',
      userTriggered: true,
      fullFact: { verdict: 'VERIFIED', verifier: 'engine@1.0', ruleset: 'RULES v1' },
    });
    let assertiveRefused = false;
    try {
      assertAnnouncementLawful({ copyId: 'x', text: 'x', voice: 'human', politeness: 'assertive', userTriggered: false });
    } catch {
      assertiveRefused = true;
    }
    if (!assertiveRefused) throw new ConstitutionalViolationError('6.11', 'An assertive announcement was accepted for a non-user-triggered fact.');
    return 'strings consumed by identifier; assertive reserved to user-triggered verdict changes; full fact announced (6.11)';
  });
}

/** 7 — latency contracts: 100 ms acknowledgment, 300 ms Gauge, 6 s Returns (6.12). */
export function gateLatencyContracts(): InteractionGateResult {
  return runGate('latency contracts', [implementation('6.12'), visualSystem('10')], () => {
    assertAcknowledgment(ACKNOWLEDGMENT_BOUND_MS - 1);
    let ackRefused = false;
    try {
      assertAcknowledgment(ACKNOWLEDGMENT_BOUND_MS + 1);
    } catch {
      ackRefused = true;
    }
    if (!ackRefused) throw new ConstitutionalViolationError('6.12', 'A breach of the acknowledgment bound was accepted.');
    let gaugeRefused = false;
    try {
      assertGaugeDelayLawful(GAUGE_THRESHOLD_MS - 1);
    } catch {
      gaugeRefused = true;
    }
    if (!gaugeRefused) throw new ConstitutionalViolationError('3.14', 'A progress display under the Gauge delay was accepted.');
    assertReturnLifeLawful(RETURN_LIFE_S, false);
    assertNavigationWithoutTransition(false);
    let navRefused = false;
    try {
      assertNavigationWithoutTransition(true);
    } catch {
      navRefused = true;
    }
    if (!navRefused) throw new ConstitutionalViolationError('6.12', 'A navigation transition was accepted.');
    return `acknowledgment < ${ACKNOWLEDGMENT_BOUND_MS} ms; Gauge after ${GAUGE_THRESHOLD_MS} ms; Returns live ${RETURN_LIFE_S} s; navigation without transition — breaches refused (6.12)`;
  });
}

/** 8 — undo contracts: ten seconds, reversible only, exact restoration (6.4; 5.8). */
export function gateUndoContracts(): InteractionGateResult {
  return runGate('undo contracts', [implementation('6.4'), implementation('5.8')], () => {
    const act = { actId: 'gate-act', dispatchedAtMs: 0, preActState: { selection: 2 }, friction: 'reversible' as const };
    if (!isUndoWindowOpen(act, UNDO_WINDOW_MS - 1)) throw new ConstitutionalViolationError('6.4', 'The undo window closed early.');
    executeUndo({ act, nowMs: UNDO_WINDOW_MS - 1, offeredRestoreState: { selection: 2 } });
    // An inexact restore is refused — restoration must be exact (5.8).
    let inexactRefused = false;
    try {
      executeUndo({ act, nowMs: UNDO_WINDOW_MS - 1, offeredRestoreState: { selection: 3 } });
    } catch {
      inexactRefused = true;
    }
    if (!inexactRefused) throw new ConstitutionalViolationError('5.8', 'An inexact restore was accepted.');
    // Consequential acts have no undo (6.4).
    let consequentialRefused = false;
    try {
      executeUndo({ act: { ...act, actId: 'gate-significant', friction: 'significant' }, nowMs: UNDO_WINDOW_MS - 1, offeredRestoreState: { selection: 2 } });
    } catch {
      consequentialRefused = true;
    }
    if (!consequentialRefused) throw new ConstitutionalViolationError('6.4', 'A consequential act was undone.');
    // A closed window refuses undo (6.4).
    let closedRefused = false;
    try {
      executeUndo({ act, nowMs: UNDO_WINDOW_MS, offeredRestoreState: { selection: 2 } });
    } catch {
      closedRefused = true;
    }
    if (!closedRefused) throw new ConstitutionalViolationError('6.4', 'An undo after the window was accepted.');
    return `the ${UNDO_WINDOW_MS} ms window holds for reversible acts only; exact restoration enforced; closed windows refuse (6.4; 5.8)`;
  });
}

/** 9 — receipt generation: completed acts resolve to receipts or Returns (6.5). */
export function gateReceiptGeneration(): InteractionGateResult {
  return runGate('receipt generation', [implementation('6.5')], () => {
    assertResolution({ kind: 'receipt', receipt: { receiptId: 'rcpt_gate_0001' } });
    assertResolution({ kind: 'return', copyId: 'interaction.undoWindow', machineId: 'gate.act' });
    let silentRefused = false;
    try {
      assertResolution(null);
    } catch {
      silentRefused = true;
    }
    if (!silentRefused) throw new ConstitutionalViolationError('6.5', 'A silent termination was accepted.');
    let skippedRefused = false;
    try {
      assertLifecycleAdvance('declared', 'executing');
    } catch {
      skippedRefused = true;
    }
    if (!skippedRefused) throw new ConstitutionalViolationError('6.1', 'A lifecycle stage skip was accepted.');
    return 'receipts, Returns, and the lifecycle resolve lawfully; silence and skips refused (6.5; 6.1)';
  });
}

/** 10 — return generation: Returns carry machine id and human message (6.5; 3.13). */
export function gateReturnGeneration(): InteractionGateResult {
  return runGate('return generation', [implementation('6.5'), implementation('3.13')], () => {
    const entry = interactionCopy('interaction.cancelled');
    if (!entry.text || entry.voice !== 'human') {
      throw new ConstitutionalViolationError('6.11', 'A Return message without its registered voice or text.');
    }
    assertResolution({ kind: 'return', copyId: entry.id, machineId: 'gate.act' });
    return 'Returns resolve from the registry by identifier with machine id + human message (6.5; 3.13; 6.11)';
  });
}

/** 11 — failure receipts: every failed act resolves to a Failure Receipt with receipt id (6.5; 5.2). */
export function gateFailureReceipts(): InteractionGateResult {
  return runGate('failure receipts', [implementation('6.5'), implementation('5.2')], () => {
    const resolution = failureResolution('rcpt_gate_failure_0001');
    if (resolution.kind !== 'failure-receipt' || !resolution.receipt.receiptId) {
      throw new ConstitutionalViolationError('6.5', 'The failure resolution lost its receipt id.');
    }
    let idLessRefused = false;
    try {
      assertResolution({ kind: 'failure-receipt', receipt: { receiptId: '' }, copyId: 'interaction.actFailed' });
    } catch {
      idLessRefused = true;
    }
    if (!idLessRefused) throw new ConstitutionalViolationError('5.7', 'A Failure Receipt without a receipt id was accepted.');
    return 'failure receipts carry receipt ids; nothing resolves to silence (6.5; 5.2; 5.7)';
  });
}

/** 12 — hold-to-affirm timing: the registered hold; early release cancels (6.6). */
export function gateHoldToAffirmTiming(): InteractionGateResult {
  return runGate('hold-to-affirm timing', [implementation('6.6'), visualSystem('13.2')], () => {
    if (HOLD_DURATION_MS !== INTERACTION_HOLD_AFFIRM_MS) {
      throw new ConstitutionalViolationError('6.6', 'The hold duration does not match the registered scale constant.');
    }
    const completed = completeHold({ path: 'pointer-hold', heldMs: HOLD_DURATION_MS, completed: true });
    if (!completed.affirmed) throw new ConstitutionalViolationError('6.6', 'A completed hold did not affirm.');
    let earlyRefused = false;
    try {
      completeHold({ path: 'pointer-hold', heldMs: HOLD_DURATION_MS - 1, completed: true });
    } catch {
      earlyRefused = true;
    }
    if (!earlyRefused) throw new ConstitutionalViolationError('6.6', 'An early release was affirmed — releasing early must cancel with no partial effect.');
    assertPathEquivalence({
      pointer: { receiptId: 'rcpt_same', announcement: 'same announcement' },
      clickPath: { receiptId: 'rcpt_same', announcement: 'same announcement' },
    });
    let inequitableRefused = false;
    try {
      assertPathEquivalence({
        pointer: { receiptId: 'rcpt_a', announcement: 'a' },
        clickPath: { receiptId: 'rcpt_b', announcement: 'b' },
      });
    } catch {
      inequitableRefused = true;
    }
    if (!inequitableRefused) throw new ConstitutionalViolationError('6.6', 'Unequal path outcomes were accepted.');
    return `the ${HOLD_DURATION_MS} ms hold affirmed only complete; early release cancels; both paths identical (6.6)`;
  });
}

/** 13 — Lens interaction: registered activation paths, ACL honesty, focus law (3.15; Art. XII). */
export function gateLensInteraction(): InteractionGateResult {
  return runGate('Lens interaction', [implementation('3.15'), bible('XII'), visualSystem('12')], () => {
    for (const path of LENS_ACTIVATION_PATHS) {
      assertActivationLawful({ path, keyboardPathAvailable: true });
    }
    let unknownPathRefused = false;
    try {
      assertActivationLawful({ path: 'double-click' as never, keyboardPathAvailable: true });
    } catch {
      unknownPathRefused = true;
    }
    if (!unknownPathRefused) throw new ConstitutionalViolationError('3.15', 'An unregistered Lens activation path was accepted.');
    let pointerOnlyRefused = false;
    try {
      assertActivationLawful({ path: 'pointer-hold', keyboardPathAvailable: false });
    } catch {
      pointerOnlyRefused = true;
    }
    if (!pointerOnlyRefused) throw new ConstitutionalViolationError('6.9', 'The Lens was offered without its keyboard path.');
    assertLensFocusLaw({ activation: { path: 'focus-plus-l', claimId: 'gate-claim', originatingFocusId: 'gate-claim' }, focusMovedToChain: true, escapeRestoredToOriginator: true });
    assertLensHonorsRestrictions({ restrictedCount: 2, restrictedRenderedHatched: true });
    let revealRefused = false;
    try {
      assertLensHonorsRestrictions({ restrictedCount: 1, restrictedRenderedHatched: false });
    } catch {
      revealRefused = true;
    }
    if (!revealRefused) throw new ConstitutionalViolationError('3.15', 'The Lens was allowed to reveal restricted evidence.');
    return 'four registered activation paths; keyboard path mandatory; focus law holds; restrictions render hatched (3.15; 6.8; 6.9)';
  });
}

/** 14 — Escape restoration: Escape dismisses fog/dialog and restores focus (6.7; 6.8). */
export function gateEscapeRestoration(): InteractionGateResult {
  return runGate('Escape restoration', [implementation('6.7'), implementation('6.8')], () => {
    const command = resolveKeyEvent({ key: 'escape' });
    if (command.id !== 'attest.dismiss') {
      throw new ConstitutionalViolationError('6.7', 'Escape does not resolve to the dismiss command in the canonical map.');
    }
    assertFocusRestored({ originatorId: 'gate-claim', restoredToOriginator: true });
    let unrestoredRefused = false;
    try {
      assertFocusRestored({ originatorId: 'gate-claim', restoredToOriginator: false });
    } catch {
      unrestoredRefused = true;
    }
    if (!unrestoredRefused) throw new ConstitutionalViolationError('6.8', 'An unrestored Escape was accepted.');
    return 'Escape resolves to attest.dismiss; focus restores to the originator; violations refused (6.7; 6.8)';
  });
}

/** 15 — interaction honesty: registered commands only; lawful execution events; every act resolves (6.1; 6.5; Part V). */
export function gateInteractionHonesty(): InteractionGateResult {
  return runGate('interaction honesty', [implementation('6.1'), implementation('6.5'), implementation('Part V')], () => {
    const act = assertDispatchLawful({
      commandId: 'attest.destroy',
      intent: { consequence: 'The record and its chain position are removed.', ruleQuote: 'Destructive confirmation must reference the exact record identifier. (Constitution 6.3)', explicitConfirm: true },
      typedIdentifier: 'rcpt_target',
      exactIdentifier: 'rcpt_target',
      resolution: { kind: 'receipt', receipt: { receiptId: 'rcpt_gate_destroy' } },
    });
    if (act.stage !== 'resolved') throw new ConstitutionalViolationError('6.5', 'A resolved act did not reach the resolved stage.');
    assertExecutionEventLawful('work-issued');
    assertExecutionEventLawful('act-fails');
    let verdictFabricationRefused = false;
    try {
      assertExecutionEventLawful('verdict-received');
    } catch {
      verdictFabricationRefused = true;
    }
    if (!verdictFabricationRefused) throw new ConstitutionalViolationError('5.3', 'The dispatcher was allowed to fabricate a verdict event.');
    // A destructive act without the exact identifier is refused.
    let vagueRefused = false;
    try {
      assertConfirmationLawful({
        friction: 'destructive',
        intent: { consequence: 'c', ruleQuote: 'q', explicitConfirm: true },
        typedIdentifier: 'wrong',
        exactIdentifier: 'rcpt_target',
      });
    } catch {
      vagueRefused = true;
    }
    if (!vagueRefused) throw new ConstitutionalViolationError('6.3', 'Vague destruction was accepted.');
    // Hash-first routing resolves identifiers before any other interpretation.
    const routed = routeInput('9f2c4ab7de1305c8ee91');
    if (!routed.hashFirst) throw new ConstitutionalViolationError('6.1', 'An identifier-shaped input was not routed hash-first (VS §5 Caliper).');
    assertCommandLawful('get.identifier');
    return 'registered commands only; verdict fabrication refused; exact destruction enforced; hash-first routing verified (6.1; 6.3; 6.5; VS §5)';
  });
}

/** The fifteen interaction gates, in the directive's order. */
export function runAllInteractionGates(): readonly InteractionGateResult[] {
  return [
    gateKeyboardReachability(),
    gateCommandRegistryIntegrity(),
    gateShortcutConflicts(),
    gateFocusOwnership(),
    gateDialogTrapping(),
    gateAccessibilityAnnouncements(),
    gateLatencyContracts(),
    gateUndoContracts(),
    gateReceiptGeneration(),
    gateReturnGeneration(),
    gateFailureReceipts(),
    gateHoldToAffirmTiming(),
    gateLensInteraction(),
    gateEscapeRestoration(),
    gateInteractionHonesty(),
  ];
}
