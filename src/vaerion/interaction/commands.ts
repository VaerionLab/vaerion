/**
 * Vaerion — Interaction / The Command Registry
 *
 * Constitution 6.1: "Physical input produces events; the system understands
 * commands. The command registry is the Caliper verb grammar — go, get,
 * verify, attest. Every interactive element must bind to a registered
 * command; free-form handlers are prohibited."
 *
 * The Caliper is hash-first: "an input that looks like an identifier routes
 * to the identifier's object" (VS §5). Command validation (6.1) rejects
 * unknown commands, unknown verbs, and bindings outside the registered
 * grammar.
 *
 * Citations: Implementation Constitution 6.1, 6.12, 6.13; VS §5 (Caliper),
 * §13.2 (keyboard), §10 (latency); Bible Art. XIV.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, visualSystem, bible, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';

/** The registered Caliper verbs (VS §5). No fourth verb may be invented. */
export const CALIPER_VERBS = ['go', 'get', 'verify', 'attest'] as const;
export type CaliperVerb = (typeof CALIPER_VERBS)[number];

/** The friction ladder of VS §13.1, encoded per action class (6.2–6.4). */
export const FRICTION_CLASSES = ['browse', 'reversible', 'significant', 'destructive'] as const;
export type FrictionClass = (typeof FRICTION_CLASSES)[number];

/** How a command resolves (6.5 — nothing terminates silently). */
export const RESOLUTION_KINDS = ['receipt', 'return', 'failure-receipt'] as const;
export type ResolutionKind = (typeof RESOLUTION_KINDS)[number];

/** How a command is keyboard-reachable (6.7 — every command is keyboard-reachable). */
export const KEYBOARD_REACHABILITY = ['canonical-key', 'standard-activation'] as const;
export type KeyboardReachability = (typeof KEYBOARD_REACHABILITY)[number];

/** A registered command (6.1 — the only lawful interactive element binding). */
export interface CommandRegistration {
  /** Stable command id. */
  readonly id: string;
  /** The Caliper verb the command speaks (VS §5). */
  readonly verb: CaliperVerb;
  /** The named consequence — a consequential command names its consequence (VS §5.8). */
  readonly name: string;
  readonly friction: FrictionClass;
  /** The constitutional key binding, when the command owns one (6.7). */
  readonly key?: string;
  /**
   * How the command is keyboard-reachable (6.7): a canonical key, or
   * standard activation on a focused control (Tab reaches the control;
   * Enter/Space activate — dialogs, Returns, and ceremony flows are fully
   * keyboard-operable by this path).
   */
  readonly keyboardReachableVia: KeyboardReachability;
  /** Whether the keyboard path is the only path — prohibited (6.9). */
  readonly pointerEquivalent: boolean;
  /** What the command resolves to (6.5). */
  readonly resolution: ResolutionKind;
  readonly citations: readonly Citation[];
}

const STANDING_COMMAND_CITATIONS: readonly Citation[] = [
  implementation('6.1', 'every interactive element binds to a registered command'),
  implementation('P-4', 'traceability'),
  bible('XI', 'nothing unmeasured ships'),
];

function defineCommand(command: Omit<CommandRegistration, 'citations'> & { readonly citations?: readonly Citation[] }): CommandRegistration {
  return Object.freeze({
    ...command,
    citations: [...(command.citations ?? []), ...STANDING_COMMAND_CITATIONS],
  });
}

/**
 * The canonical command set of the interaction engine. Commands are
 * registered here once; surfaces bind to them by id (6.1). New commands
 * enter through governance (Part XI).
 */
export const COMMAND_REGISTRY: readonly CommandRegistration[] = Object.freeze([
  defineCommand({
    id: 'go.surface',
    verb: 'go',
    name: 'navigate to a registered surface',
    friction: 'browse',
    key: 'spine',
    keyboardReachableVia: 'canonical-key',
    pointerEquivalent: true,
    resolution: 'return',
    citations: [visualSystem('5.20', 'the Spine — wayfinding is always visible'), implementation('6.12', 'navigation without transition')],
  }),
  defineCommand({
    id: 'get.identifier',
    verb: 'get',
    name: 'resolve an identifier — hash-first',
    friction: 'browse',
    key: 'cmd-k',
    keyboardReachableVia: 'canonical-key',
    pointerEquivalent: true,
    resolution: 'return',
    citations: [visualSystem('5', 'the Caliper is hash-first: an input that looks like an identifier routes to the identifier’s object'), implementation('6.7', 'Cmd-K is owned centrally')],
  }),
  defineCommand({
    id: 'verify.decision',
    verb: 'verify',
    name: 'record a verification decision',
    friction: 'significant',
    key: 'v',
    keyboardReachableVia: 'canonical-key',
    pointerEquivalent: true,
    resolution: 'receipt',
    citations: [visualSystem('13.3', 'the verification workflow — the decision itself issues a receipt'), implementation('6.6', 'hold-to-affirm')],
  }),
  defineCommand({
    id: 'verify.review',
    verb: 'verify',
    name: 'review before deciding',
    friction: 'significant',
    key: 'r',
    keyboardReachableVia: 'canonical-key',
    pointerEquivalent: true,
    resolution: 'return',
    citations: [implementation('6.2', 'intent declaration'), visualSystem('13.3')],
  }),
  defineCommand({
    id: 'get.evidence',
    verb: 'get',
    name: 'inspect the evidence of a focused record',
    friction: 'browse',
    key: 'e',
    keyboardReachableVia: 'canonical-key',
    pointerEquivalent: true,
    resolution: 'return',
    citations: [visualSystem('13.2', 'V / R / E — verify / review / evidence traversal')],
  }),
  defineCommand({
    id: 'get.lens',
    verb: 'get',
    name: 'hold the Proof Lens on a focused claim',
    friction: 'browse',
    key: 'l',
    keyboardReachableVia: 'canonical-key',
    pointerEquivalent: true,
    resolution: 'return',
    citations: [bible('XII', 'the Proof Lens'), implementation('3.15'), implementation('6.7', 'L is a constitutional key')],
  }),
  defineCommand({
    id: 'get.next',
    verb: 'get',
    name: 'move selection forward',
    friction: 'browse',
    key: 'j',
    keyboardReachableVia: 'canonical-key',
    pointerEquivalent: true,
    resolution: 'return',
    citations: [visualSystem('13.2', 'J / K — ledger traversal')],
  }),
  defineCommand({
    id: 'get.previous',
    verb: 'get',
    name: 'move selection backward',
    friction: 'browse',
    key: 'k',
    keyboardReachableVia: 'canonical-key',
    pointerEquivalent: true,
    resolution: 'return',
    citations: [visualSystem('13.2', 'J / K — ledger traversal')],
  }),
  defineCommand({
    id: 'attest.criteria-edit',
    verb: 'attest',
    name: 'edit the focused criterion in place',
    friction: 'browse',
    key: 'e',
    keyboardReachableVia: 'canonical-key',
    pointerEquivalent: true,
    resolution: 'return',
    citations: [implementation('6.7', 'E — criteria edit in the canonical map'), visualSystem('5', 'criteria render as formula, editable in place')],
  }),
  defineCommand({
    id: 'attest.dismiss',
    verb: 'attest',
    name: 'dismiss the fog or the open dialog',
    friction: 'browse',
    key: 'escape',
    keyboardReachableVia: 'canonical-key',
    pointerEquivalent: true,
    resolution: 'return',
    citations: [implementation('6.7', 'Escape — dismiss fog/dialog'), implementation('6.8', 'focus restoration')],
  }),
  defineCommand({
    id: 'attest.confirm',
    verb: 'attest',
    name: 'explicitly confirm a declared intent',
    friction: 'significant',
    keyboardReachableVia: 'standard-activation',
    pointerEquivalent: true,
    resolution: 'receipt',
    citations: [implementation('6.2', 'explicit confirmation'), implementation('6.3', 'the confirmation ladder'), implementation('6.7', 'the ceremony dialog is keyboard-operable (Tab reaches the confirm control; Enter activates)')],
  }),
  defineCommand({
    id: 'attest.destroy',
    verb: 'attest',
    name: 'destroy a record — typed identifier required',
    friction: 'destructive',
    keyboardReachableVia: 'standard-activation',
    pointerEquivalent: true,
    resolution: 'receipt',
    citations: [implementation('6.3', 'typed identifier for destructive confirmation'), visualSystem('13.1', 'destructive action — receipt id friction')],
  }),
  defineCommand({
    id: 'attest.undo',
    verb: 'attest',
    name: 'undo a reversible act inside its window',
    friction: 'reversible',
    keyboardReachableVia: 'standard-activation',
    pointerEquivalent: true,
    resolution: 'return',
    citations: [implementation('6.4', 'the ten-second undo window'), implementation('5.8', 'exact restoration'), implementation('6.7', 'the undo Return is acknowledged by key (3.13 keyboard contract)')],
  }),
]);

const BY_ID: ReadonlyMap<string, CommandRegistration> = new Map(
  COMMAND_REGISTRY.map((command) => [command.id, command]),
);

/** Resolves a command by id. Unknown commands are violations, never undefined (6.1). */
export function getCommand(id: string): CommandRegistration {
  const command = BY_ID.get(id);
  if (!command) {
    throw new ConstitutionalViolationError(
      '6.1',
      `Unknown command "${id}". Every interactive element binds to a registered command; free-form handlers are prohibited (Constitution 6.1).`,
    );
  }
  return command;
}

/**
 * Hash-first routing (VS §5): an input that looks like an identifier routes
 * to the identifier's object. Mechanical form: an input that matches the
 * registered identifier shape routes to `get.identifier` before any other
 * interpretation.
 */
export function routeInput(input: string): { readonly commandId: string; readonly hashFirst: boolean } {
  const trimmed = input.trim();
  // Receipt ids and hashes in the instrument resolve first — the registered
  // shape is a hex-ish literal of at least the registered compact length or
  // the receipt id prefix.
  const looksLikeHash = /^[0-9a-f]{10,}$/i.test(trimmed);
  const looksLikeReceiptId = trimmed.startsWith('rcpt_');
  if (looksLikeHash || looksLikeReceiptId) {
    return { commandId: 'get.identifier', hashFirst: true };
  }
  return { commandId: 'get.identifier', hashFirst: false };
}

/**
 * Command validation (6.1): a binding is lawful when the command exists, the
 * verb is registered, the consequence is named, and the resolution kind is
 * one of the three lawful terminations (6.5).
 */
export function assertCommandLawful(id: string): CommandRegistration {
  const command = getCommand(id);
  if (!CALIPER_VERBS.includes(command.verb)) {
    throw new ConstitutionalViolationError('6.1', `Command "${id}" speaks unregistered verb "${command.verb}". The Caliper verbs are go, get, verify, attest (VS §5).`);
  }
  if (!command.name || command.name.length === 0) {
    throw new ConstitutionalViolationError('6.1', `Command "${id}" names no consequence (VS §5.8).`);
  }
  if (!RESOLUTION_KINDS.includes(command.resolution)) {
    throw new ConstitutionalViolationError('6.5', `Command "${id}" resolves to "${String(command.resolution)}". Every act terminates in a receipt, a Return, or a Failure Receipt (Constitution 6.5).`);
  }
  return command;
}

/** Structural integrity of the registry — used by the interaction gates (9.1 form). */
export function assertCommandRegistryIntegrity(): void {
  const seen = new Set<string>();
  for (const command of COMMAND_REGISTRY) {
    if (seen.has(command.id)) {
      throw new ConstitutionalViolationError('6.1', `Duplicate command id "${command.id}".`);
    }
    seen.add(command.id);
    assertCommandLawful(command.id);
  }
}
