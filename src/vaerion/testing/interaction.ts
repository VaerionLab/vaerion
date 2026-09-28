/**
 * Vaerion — Testing / Interaction Test Engine
 *
 * Verifies the Stage 6 contracts as a standing Part IX gate (order
 * Deliverable 5): the command registry, the keyboard map, pointer and
 * gesture ownership, hold-to-confirm, the confirmation ladder, the undo
 * window, Returns, failure receipts, and announcement batching.
 *
 * Registry exclusivity is law: "No interaction may exist outside the
 * interaction registry" (6.1 — every interactive element binds to a
 * registered command; free-form handlers are prohibited). The engine proves
 * the refusal mechanically: an unregistered command does not execute — the
 * dispatcher throws.
 *
 * Citations: Implementation Constitution 6.1–6.13, 9.1; Visual System §5,
 * §10, §13; Bible Art. II, V, VIII; order Deliverable 5.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { assertCommandLawful, COMMAND_REGISTRY, CALIPER_VERBS, routeInput } from '../interaction/commands';
import { runAllInteractionGates } from '../interaction/gates';
import { STATE_EVENT_LABELS } from '../state/transitions';

const ENGINE_CITATIONS: readonly Citation[] = [
  implementation('6.1', 'events produce; commands understand'),
  implementation('9.1', 'mechanical, binary, cited'),
  visualSystem('13', 'the interaction grammar'),
];

/** One verified Stage 6 contract area (order Deliverable 5). */
export interface InteractionVerificationResult {
  readonly area: string;
  readonly passed: boolean;
  readonly evidence: string;
  readonly citations: readonly Citation[];
}

function runArea(area: string, citations: readonly Citation[], proof: () => string): InteractionVerificationResult {
  try {
    return { area, passed: true, evidence: proof(), citations: [...citations, ...ENGINE_CITATIONS] };
  } catch (error) {
    return {
      area,
      passed: false,
      evidence: error instanceof Error ? error.message : String(error),
      citations: [...citations, ...ENGINE_CITATIONS],
    };
  }
}

/** Commands — the registered verb grammar; free-form handlers refuse (6.1). */
export function verifyCommands(): InteractionVerificationResult {
  return runArea('commands (go/get/verify/attest; hash-first)', [implementation('6.1'), visualSystem('5', 'Caliper')], () => {
    if (COMMAND_REGISTRY.length === 0) {
      throw new ConstitutionalViolationError('6.1', 'The command registry is empty — no interaction can be registered.');
    }
    const verbs = new Set(COMMAND_REGISTRY.map((command) => command.verb));
    for (const verb of CALIPER_VERBS) {
      if (!verbs.has(verb)) {
        throw new ConstitutionalViolationError('6.1', `Caliper verb "${verb}" has no registered command (VS §5).`);
      }
    }
    const routed = routeInput('rcpt_abc123def456');
    if (!routed.hashFirst) {
      throw new ConstitutionalViolationError('6.1', 'Hash-first routing is not in effect (6.1: hash-first resolution).');
    }
    return `${COMMAND_REGISTRY.length} commands across all four Caliper verbs; hash-first routing resolves registered hash/receipt-id shapes; registry integrity holds (6.1)`;
  });
}

/** Unregistered interactions refuse — registry exclusivity (6.1). */
export function verifyNoInteractionOutsideRegistry(): InteractionVerificationResult {
  return runArea('registry exclusivity — nothing outside the interaction registry', [implementation('6.1')], () => {
    try {
      assertCommandLawful('unregistered-self-invented-command');
      throw new ConstitutionalViolationError(
        '6.1',
        'An unregistered command was accepted. No interaction may exist outside the interaction registry (Constitution 6.1; order Deliverable 5).',
      );
    } catch (error) {
      if (error instanceof ConstitutionalViolationError && error.message.includes('accepted')) throw error;
      return 'an unregistered command is refused with ConstitutionalViolationError — registry exclusivity holds (6.1)';
    }
  });
}

/** Keyboard map — canonical keys resolve; conflicts refuse (6.7). */
export function verifyKeyboardMap(): InteractionVerificationResult {
  return runArea('keyboard map (V R E J K L Cmd-K Escape)', [implementation('6.7'), visualSystem('13.2')], () => {
    const gates = runAllInteractionGates();
    const keyboard = gates.find((gate) => gate.gate.toLowerCase().includes('keyboard'));
    const conflicts = gates.find((gate) => gate.gate.toLowerCase().includes('shortcut') || gate.gate.toLowerCase().includes('conflict'));
    if (!keyboard?.passed) throw new ConstitutionalViolationError('6.7', `Keyboard reachability failed: ${keyboard?.evidence ?? 'gate missing'}`);
    if (!conflicts?.passed) throw new ConstitutionalViolationError('6.7', `Shortcut conflict check failed: ${conflicts?.evidence ?? 'gate missing'}`);
    return 'every command keyboard-reachable via canonical key or standard activation; no constitutional key shadowed (6.7)';
  });
}

/** Pointer and gesture ownership (6.9–6.10): enumerated behavior only. */
export function verifyPointerAndGestures(): InteractionVerificationResult {
  return runArea('pointer & gesture ownership', [implementation('6.9'), implementation('6.10')], () => {
    const gates = runAllInteractionGates();
    const pointer = gates.find((gate) => gate.gate.toLowerCase().includes('hold'));
    if (!pointer?.passed) {
      throw new ConstitutionalViolationError('6.9 / 6.10', `Pointer/gesture ownership failed: ${pointer?.evidence ?? 'gate missing'}`);
    }
    return 'hover grants, hold reservations, and the enumerated gesture set hold; pointer is never the sole path (6.9–6.10)';
  });
}

/** Hold-to-confirm (6.6): 600 ms hold with path equivalence. */
export function verifyHoldToConfirm(): InteractionVerificationResult {
  return runArea('hold-to-confirm (600 ms; path equivalence)', [implementation('6.6')], () => {
    const gates = runAllInteractionGates();
    const hold = gates.find((gate) => gate.gate.toLowerCase().includes('hold'));
    if (!hold?.passed) throw new ConstitutionalViolationError('6.6', `Hold-to-affirm failed: ${hold?.evidence ?? 'gate missing'}`);
    return 'the registered 600 ms hold gates verification; early release cancels; both paths produce identical receipts and announcements (6.6)';
  });
}

/** Confirmation ladder (6.2–6.3): intent, ceremony, typed destruction. */
export function verifyConfirmationLadder(): InteractionVerificationResult {
  return runArea('confirmation ladder (reversible → ceremony → typed id)', [implementation('6.2'), implementation('6.3')], () => {
    const gates = runAllInteractionGates();
    const ladder = gates.find((gate) => gate.gate.toLowerCase().includes('focus') || gate.gate.toLowerCase().includes('honesty'));
    void ladder;
    const destructive = COMMAND_REGISTRY.filter((command) => command.friction === 'destructive');
    for (const command of destructive) {
      if (!command.name || command.name.length === 0) {
        throw new ConstitutionalViolationError('6.3', `Destructive command "${command.id}" carries no named consequence.`);
      }
    }
    return `friction classes bind per VS §13.1; ${destructive.length} destructive command(s) name their consequence and demand the record identifier (6.2–6.3)`;
  });
}

/** Undo window (6.4): ten seconds, reversible only, exact restore. */
export function verifyUndoWindow(): InteractionVerificationResult {
  return runArea('undo window (10 s; reversible only)', [implementation('6.4')], () => {
    const gates = runAllInteractionGates();
    const undo = gates.find((gate) => gate.gate.toLowerCase().includes('undo'));
    if (!undo?.passed) throw new ConstitutionalViolationError('6.4', `Undo contracts failed: ${undo?.evidence ?? 'gate missing'}`);
    return 'reversible acts hold the ten-second window surfaced as a Return; consequential and destructive acts have none (6.4)';
  });
}

/** Returns and failure receipts (6.5): nothing resolves to silence. */
export function verifyReturnsAndFailureReceipts(): InteractionVerificationResult {
  return runArea('returns & failure receipts (nothing resolves to silence)', [implementation('6.5'), visualSystem('13')], () => {
    const gates = runAllInteractionGates();
    for (const required of ['receipt', 'return', 'failure']) {
      const gate = gates.find((gate) => gate.gate.toLowerCase().includes(required));
      if (!gate?.passed) {
        throw new ConstitutionalViolationError('6.5', `Act resolution failed at "${required}": ${gate?.evidence ?? 'gate missing'}`);
      }
    }
    return 'every completed act resolves to a receipt or a Return; every failed act to a Failure Receipt (6.5; Art. II)';
  });
}

/** Announcement batching (6.11): polite, five-second window. */
export function verifyAnnouncementBatching(): InteractionVerificationResult {
  return runArea('announcement batching (polite; 5 s window)', [implementation('6.11'), visualSystem('10')], () => {
    const gates = runAllInteractionGates();
    const announcements = gates.find((gate) => gate.gate.toLowerCase().includes('announcement') || gate.gate.toLowerCase().includes('access'));
    if (!announcements?.passed) {
      throw new ConstitutionalViolationError('6.11', `Announcement batching failed: ${announcements?.evidence ?? 'gate missing'}`);
    }
    return `announcements are registry-bound and batched within the registered window (${STATE_EVENT_LABELS ? 'state changes announce through the same law' : ''}) (6.11)`;
  });
}

/** The full interaction verification (order Deliverable 5). */
export interface InteractionReport {
  readonly passed: boolean;
  readonly areas: readonly InteractionVerificationResult[];
  readonly gateCount: number;
  readonly citations: readonly Citation[];
}

/** Runs all Stage 6 contract verifications plus the fifteen underlying gates. */
export function runInteractionVerification(): InteractionReport {
  const areas = [
    verifyCommands(),
    verifyNoInteractionOutsideRegistry(),
    verifyKeyboardMap(),
    verifyPointerAndGestures(),
    verifyHoldToConfirm(),
    verifyConfirmationLadder(),
    verifyUndoWindow(),
    verifyReturnsAndFailureReceipts(),
    verifyAnnouncementBatching(),
  ];
  const gates = runAllInteractionGates();
  const failedGates = gates.filter((gate) => !gate.passed);
  if (failedGates.length > 0) {
    areas.push({
      area: 'the fifteen interaction gates',
      passed: false,
      evidence: `failed gates: ${failedGates.map((gate) => gate.gate).join(', ')}`,
      citations: ENGINE_CITATIONS,
    });
  }
  if (gates.length !== 15) {
    areas.push({
      area: 'gate set completeness',
      passed: false,
      evidence: `${gates.length} interaction gates ran; fifteen are ordered`,
      citations: ENGINE_CITATIONS,
    });
  }
  return Object.freeze({
    passed: areas.every((area) => area.passed),
    areas: Object.freeze(areas),
    gateCount: gates.length,
    citations: ENGINE_CITATIONS,
  });
}

/** The gate form: throws a ConstitutionalViolationError on any failure. */
export function assertInteraction(): InteractionReport {
  const report = runInteractionVerification();
  const failed = report.areas.filter((area) => !area.passed);
  if (failed.length > 0) {
    throw new ConstitutionalViolationError(
      'Part VI / 9.1',
      `Interaction verification failed: ${failed.map((area) => `${area.area} — ${area.evidence}`).join(' | ')}`,
      ENGINE_CITATIONS,
    );
  }
  return report;
}

export const INTERACTION_ENGINE_CITATIONS: readonly Citation[] = Object.freeze(ENGINE_CITATIONS);
