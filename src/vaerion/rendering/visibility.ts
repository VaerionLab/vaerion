/**
 * Vaerion — Rendering / Visibility Contracts
 *
 * Visibility law (Constitution 7.3): "Nothing renders without being either
 * attested or honestly labeled. Skeletons render structure only; demo
 * renders stamped; restricted renders hatched; absence renders as teaching."
 *
 * The visibility obligations are keyed to the twelve canonical states of the
 * State Matrix (Part V — imported, never re-declared). Each obligation is
 * the rendering obligation of 5.2 read through 7.3.
 *
 * Citations: Implementation Constitution 7.3, Part V (5.1–5.2); Visual
 * System §5.24, §5.25, §12.6; Bible Art. II, III, VIII.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { STATE_MATRIX, type CanonicalState } from '../state/matrix';
import { GAUGE_DELAY_MS } from '../registry/scales';

/** The rendering obligation of one canonical state (7.3; 5.2). */
export interface VisibilityObligation {
  readonly state: CanonicalState;
  /** The ratified rendering obligation, transcribed from 5.2 and 7.3. */
  readonly obligation: string;
  readonly citations: readonly Citation[];
}

/**
 * The visibility obligations for all twelve canonical states. Nothing
 * renders without being either attested or honestly labeled (7.3).
 */
export const VISIBILITY_OBLIGATIONS: readonly VisibilityObligation[] = Object.freeze([
  {
    state: 'verified',
    obligation: 'renders the received verdict with its named verifier — never computed, never predicted (5.3; Art. III)',
    citations: [implementation('5.2', 'Verified — engine-issued verdicts'), bible('III', 'a verdict names its verifier')],
  },
  {
    state: 'failed',
    obligation: 'renders the received verdict with its named verifier and what failed — precise, not emotional (Art. III; Part Three)',
    citations: [implementation('5.2', 'Failed — engine-issued verdicts'), bible('III')],
  },
  {
    state: 'pending',
    obligation: 'a verdict is in flight; pulse sanctioned; never rounded forward, never silently dropped, always cancellable (Part Three; 5.8)',
    citations: [implementation('5.2', 'Pending — a verdict is in flight; pulse sanctioned'), bible('III', 'the pulse')],
  },
  {
    state: 'restricted',
    obligation: 'evidence exists and is withheld; renders hatched with its honest notice (5.2; VS §3.3)',
    citations: [implementation('5.2', 'Restricted — rendered hatched with its honest notice'), implementation('8.2', 'restriction travels with the artifact')],
  },
  {
    state: 'demo',
    obligation: 'quarantined demonstration data, stamped, export-forbidden (5.2; VS §12.6; 5.10)',
    citations: [implementation('5.2', 'Demo — quarantined demonstration data, stamped, export-forbidden'), visualSystem('12.6', 'universal DEMO quarantine')],
  },
  {
    state: 'idle',
    obligation: 'populated, awaiting user (5.2)',
    citations: [implementation('5.2', 'Idle — populated, awaiting user')],
  },
  {
    state: 'loading',
    obligation: `work in flight; the Gauge is sanctioned only after ${GAUGE_DELAY_MS}ms of expected wait — never before (5.2; VS §5, §10)`,
    citations: [implementation('5.2', 'Loading — work in flight, Gauge sanctioned after 300ms'), visualSystem('10', 'latency contract')],
  },
  {
    state: 'skeleton',
    obligation: 'structure-only placeholder; numbers and text prohibited (5.2; VS §5.24)',
    citations: [implementation('5.2', 'Skeleton — structure-only placeholder, numbers and text prohibited'), visualSystem('5.24', 'the Gauge renders structure honestly')],
  },
  {
    state: 'empty',
    obligation: 'lawful absence, rendered as teaching (5.2; VS §5.25)',
    citations: [implementation('5.2', 'Empty — lawful absence, rendered as teaching'), bible('VIII', 'empty states state the truth of the emptiness')],
  },
  {
    state: 'offline',
    obligation: 'authority unreachable; reads continue, writes halt; chrome announcement (5.2; 5.4)',
    citations: [implementation('5.2', 'Offline — authority unreachable; reads continue, writes halt'), implementation('5.4', 'Offline is chrome-scoped')],
  },
  {
    state: 'recovery',
    obligation: 'reconnection in progress; integrity revalidation before live resumption (5.2; 5.9)',
    citations: [implementation('5.2', 'Recovery — reconnection in progress'), implementation('5.9', 'recovery revalidates chain integrity')],
  },
  {
    state: 'error',
    obligation: 'an act failed; rendered as Failure Receipt (5.2; VS §5.26)',
    citations: [implementation('5.2', 'Error — an act failed; rendered as Failure Receipt'), bible('II', 'evidence or silence')],
  },
]);

/** Resolves the visibility obligation of a canonical state. */
export function visibilityObligationOf(state: CanonicalState): VisibilityObligation {
  const obligation = VISIBILITY_OBLIGATIONS.find((candidate) => candidate.state === state);
  if (!obligation) {
    // Unreachable while the State Matrix holds twelve states — defended
    // anyway so the rendering engine can never silently widen.
    throw new ConstitutionalViolationError(
      '7.3 / 5.1',
      `"${String(state)}" resolves no visibility obligation. Rendering is keyed to the twelve canonical states of the State Matrix (Constitution 7.3; Part V).`,
    );
  }
  return obligation;
}

/**
 * Visibility law (7.3): nothing renders without being either attested or
 * honestly labeled. A rendering request for a state that is neither attested
 * (a received fact) nor honestly labeled (a declared state) throws.
 */
export function assertVisibilityLawful(params: {
  readonly state: CanonicalState;
  /** The rendered fact is attested — received from an authority (Art. II). */
  readonly attested: boolean;
  /** The rendered state is honestly labeled — declared, not implied (7.3). */
  readonly honestlyLabeled: boolean;
}): void {
  if (!params.attested && !params.honestlyLabeled) {
    throw new ConstitutionalViolationError(
      '7.3 / Art. II',
      `A rendering of state "${params.state}" is neither attested nor honestly labeled. Nothing renders without being either attested or honestly labeled (Constitution 7.3; Art. II — evidence or silence).`,
      visibilityObligationOf(params.state).citations,
    );
  }
}

/** Skeleton rendering (7.3; VS §5.24): structure only; numbers and text prohibited. */
export function assertSkeletonStructureOnly(params: { readonly rendersNumbersOrText: boolean }): void {
  if (params.rendersNumbersOrText) {
    throw new ConstitutionalViolationError(
      '7.3 / 5.2',
      'A skeleton rendered numbers or text. Skeletons render structure only; numbers and text are prohibited (Constitution 7.3; 5.2; VS §5.24).',
      [visualSystem('5.24', 'skeleton — structure-only placeholder')],
    );
  }
}

/** Demo rendering (7.3; VS §12.6; 5.10): demo renders stamped, export-forbidden. */
export function assertDemoStamped(params: { readonly stamped: boolean }): void {
  if (!params.stamped) {
    throw new ConstitutionalViolationError(
      '7.3 / 5.10',
      'Demo data rendered without its DEMO stamp. Demo renders stamped (Constitution 7.3; VS §12.6); the demo flag travels with the record and is rendered wherever the record appears, forever (5.10).',
      [visualSystem('12.6', 'universal DEMO quarantine'), implementation('5.10', 'demo quarantine')],
    );
  }
}

/** Restricted rendering (7.3; 5.2; VS §3.3): renders hatched with its honest notice. */
export function assertRestrictedHatched(params: { readonly hatched: boolean; readonly noticeShown: boolean }): void {
  if (!params.hatched || !params.noticeShown) {
    throw new ConstitutionalViolationError(
      '7.3 / 5.2',
      `Restricted evidence rendered hatched=${String(params.hatched)}, notice=${String(params.noticeShown)}. Restricted renders hatched with its honest notice (Constitution 7.3; 5.2) — never silently omitted, never disguised.`,
      [implementation('8.2', 'restriction is a first-class state that travels with the artifact')],
    );
  }
}

/** Teaching empty rendering (7.3; VS §5.25; Art. VIII): absence renders as teaching. */
export function assertEmptyTeaching(params: { readonly teaching: boolean }): void {
  if (!params.teaching) {
    throw new ConstitutionalViolationError(
      '7.3 / Art. VIII',
      'A lawful absence rendered without teaching. Absence renders as teaching (Constitution 7.3; VS §5.25): empty states state the truth of the emptiness (Art. VIII).',
      [bible('VIII', 'empty states state the truth of the emptiness')],
    );
  }
}

/**
 * Absence law (Art. II; Art. VIII; 7.3): absence of evidence is rendered as
 * absence, never as a reassuring placeholder.
 */
export function assertAbsenceDeclared(params: { readonly declared: boolean }): void {
  if (!params.declared) {
    throw new ConstitutionalViolationError(
      'Art. II / Art. VIII',
      'An absence was disguised rather than declared. Absence of evidence is rendered as absence, never as a reassuring placeholder (Art. VIII; Art. II — evidence or silence).',
      [bible('VIII', 'honesty over comfort'), bible('II', 'evidence or silence')],
    );
  }
}

/**
 * The visibility set is keyed to exactly the twelve canonical states
 * (7.3; 5.1). Throws if the obligations drift from the State Matrix.
 */
export function assertVisibilitySetIntegrity(): void {
  if (VISIBILITY_OBLIGATIONS.length !== STATE_MATRIX.length) {
    throw new ConstitutionalViolationError(
      '7.3 / 5.1',
      `The visibility obligations hold ${VISIBILITY_OBLIGATIONS.length} entries; the State Matrix holds ${STATE_MATRIX.length} canonical states. Rendering is keyed to the canonical states — no more, no fewer (Constitution 7.3; 5.1).`,
    );
  }
  for (const definition of STATE_MATRIX) {
    visibilityObligationOf(definition.id);
  }
}

export const VISIBILITY_CITATIONS: readonly Citation[] = [
  implementation('7.3', 'visibility: attested or honestly labeled'),
  implementation('Part V', 'the canonical states rendering is keyed to'),
  bible('II', 'evidence or silence'),
];
