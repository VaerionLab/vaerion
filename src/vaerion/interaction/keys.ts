/**
 * Vaerion — Interaction / The Keyboard Engine
 *
 * Constitution 6.7 — Keyboard Ownership: "Every command is keyboard-
 * reachable. The canonical map — V/R/E (verify workflow), J/K (queue
 * motion), L (lens), E (criteria edit), Cmd-K (Caliper), Escape (dismiss
 * fog/dialog) — is owned centrally; surfaces must not shadow or remap
 * constitutional keys. Tab order equals reading order equals attestation
 * order within receipts."
 *
 * The engine is the single owner of the canonical map. Surfaces bind to
 * registered commands; the engine resolves key events to commands and
 * refuses to let a surface handler shadow a constitutional key.
 *
 * Citations: Implementation Constitution 6.7, 6.1; VS §13.2; Bible Art. XIV.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { getCommand, type CommandRegistration } from './commands';

/**
 * The canonical key map (6.7), owned centrally. Each entry names the
 * registered command the key resolves to. The key 'e' appears twice in the
 * ratified map (evidence traversal on a focused record; criteria edit on a
 * focused Criteria Bar) — the owner disambiguates by focus context, which is
 * the ownership the law grants (6.7: the map "is owned centrally").
 */
export const CANONICAL_KEY_MAP: Readonly<Record<string, readonly string[]>> = Object.freeze({
  v: ['verify.decision'],
  r: ['verify.review'],
  e: ['get.evidence', 'attest.criteria-edit'],
  j: ['get.next'],
  k: ['get.previous'],
  l: ['get.lens'],
  'cmd-k': ['get.identifier'],
  escape: ['attest.dismiss'],
});

/** The constitutional keys — surfaces must not shadow or remap these (6.7). */
export const CONSTITUTIONAL_KEYS: readonly string[] = Object.freeze(Object.keys(CANONICAL_KEY_MAP));

export interface KeyEventDescriptor {
  /** Lowercased key, with 'cmd-k' normalized from metaKey + 'k'. */
  readonly key: string;
  /** Whether the event originates inside a Criteria Bar focus context. */
  readonly focusContext?: 'record' | 'criteria' | 'dialog' | 'lens';
}

/**
 * Resolves a key event to its registered command (6.1; 6.7). The criteria
 * focus context owns the second lawful meaning of 'e' — criteria edit —
 * exactly as the canonical map grants (6.7: "E (criteria edit)").
 */
export function resolveKeyEvent(event: KeyEventDescriptor): CommandRegistration {
  const commandIds = CANONICAL_KEY_MAP[event.key];
  if (!commandIds || commandIds.length === 0) {
    throw new ConstitutionalViolationError(
      '6.1',
      `Key "${event.key}" resolves to no registered command. Physical input produces events; the system understands commands (Constitution 6.1).`,
    );
  }
  const commandId =
    commandIds.length > 1
      ? (event.focusContext === 'criteria' ? commandIds[1] : commandIds[0])
      : commandIds[0];
  return getCommand(commandId);
}

/**
 * Shadow detection (6.7): a surface handler that claims a constitutional key
 * outside the engine is a violation. Returns true when the key is owned
 * centrally and the handler must therefore route through the engine.
 */
export function assertKeyNotShadowed(key: string, surfaceHandlerClaims: boolean): void {
  if (CONSTITUTIONAL_KEYS.includes(key) && surfaceHandlerClaims) {
    throw new ConstitutionalViolationError(
      '6.7',
      `Key "${key}" is a constitutional key owned centrally (Constitution 6.7); a surface handler attempted to shadow or remap it.`,
    );
  }
}

/** Keyboard reachability (6.7; 9.5): every command with a binding resolves through the map. */
export function assertKeyboardReachability(): void {
  for (const bindings of Object.values(CANONICAL_KEY_MAP)) {
    for (const id of bindings) {
      // Unknown commands are violations (6.1); 'attest.criteria-edit' is the
      // criteria-edit meaning of E granted by the canonical map (6.7).
      getCommand(id);
    }
  }
}

export const KEYBOARD_CITATIONS: readonly Citation[] = [
  implementation('6.7', 'keyboard ownership — the canonical map is owned centrally'),
  implementation('6.1', 'every interactive element binds to a registered command'),
];
