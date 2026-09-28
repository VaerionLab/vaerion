/**
 * Vaerion — State / Honesty Enforcement
 *
 * The Verdict Boundary (Constitution 5.3): "Verdict-domain states enter the
 * implementation only from the Verification Authority. No surface, primitive,
 * or interaction may produce, predict, or optimistically render one."
 * Honesty is an engineering property (1.6): the implementation never
 * fabricates, simulates, or presumes a verdict, an amount of progress, a
 * chain state, or a data condition that has not been received from an
 * authority.
 *
 * Citations: Implementation Constitution 5.3, 1.6, 8.0; Bible Art. II, III,
 * VIII.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { isVerdictDomain, type CanonicalState } from './matrix';

/** The evidence a verdict-domain state must carry (Art. III — the named verifier). */
export interface VerdictAuthorityEvidence {
  /** The engine version of the verifier. */
  readonly engineVersion: string;
  /** The rule set the check ran against. */
  readonly ruleset: string;
  /** The environment in which the check ran. */
  readonly environment: string;
  /** The authority that issued the fact — the Verification Authority (8.0). */
  readonly issuedBy: 'Verification Authority';
}

const HONESTY_CITATIONS: readonly Citation[] = [
  implementation('5.3', 'the verdict boundary'),
  implementation('1.6', 'honesty is an engineering property'),
  bible('VIII', 'honesty over comfort'),
];

/**
 * Validates verdict-authority evidence. An anonymous verdict is
 * constitutionally void (Art. III): every verdict names the engine version,
 * the rule set, and the environment in which the check ran, issued by the
 * Verification Authority. Throws on any absence.
 */
export function assertVerdictAuthority(evidence: VerdictAuthorityEvidence | undefined): void {
  if (!evidence) {
    throw new ConstitutionalViolationError(
      '5.3 / Art. III',
      'No Verification Authority evidence was presented for a verdict-domain state. Verdict-domain states enter the implementation only from the Verification Authority (Constitution 5.3); an anonymous verdict is constitutionally void (Art. III).',
    );
  }
  if (evidence.issuedBy !== 'Verification Authority') {
    throw new ConstitutionalViolationError(
      '8.0',
      `The fact issuer "${String(evidence.issuedBy)}" is not the Verification Authority. Verdicts are issued by the Verification Authority alone (Constitution 8.0; 5.3).`,
    );
  }
  for (const field of ['engineVersion', 'ruleset', 'environment'] as const) {
    if (!evidence[field]) {
      throw new ConstitutionalViolationError(
        'Art. III',
        `The verdict evidence is missing "${field}". Every verdict names the engine version, the rule set, and the environment (Bible Art. III).`,
      );
    }
  }
}

/**
 * Optimistic rendering is refused (5.3; 1.6; Art. VIII). A rendering request
 * for a verdict-domain state must present the authority evidence; anything
 * else — prediction, anticipation, computed confidence — throws.
 */
export function assertNoOptimisticRender(state: CanonicalState, evidence: VerdictAuthorityEvidence | undefined): void {
  if (isVerdictDomain(state)) {
    assertVerdictAuthority(evidence);
  }
}

/**
 * "A user decision in the Verification workflow is itself a fact received
 * from an authority once recorded; until recorded, the UI shows Pending —
 * never the anticipated outcome" (5.3). Refuses any anticipated outcome
 * vocabulary from entering a rendering path.
 */
export function assertNoAnticipatedOutcome(anticipated: unknown): void {
  if (anticipated !== undefined && anticipated !== null) {
    throw new ConstitutionalViolationError(
      '5.3',
      'An anticipated outcome was presented where only received facts may appear. Until a decision is recorded by an authority, the UI shows Pending — never the anticipated outcome (Constitution 5.3; Art. VIII).',
    );
  }
}

/**
 * "Counts, durations, and progress are real measurements or are not shown"
 * (Art. VIII). A determinate measurement must be a measured number — never an
 * estimate, never a fabricated value. `null` is lawful (the measurement is
 * simply not shown); a non-number that is not null is not.
 */
export function assertRealMeasurement(value: number | null, subject: string): void {
  if (value === null) return;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ConstitutionalViolationError(
      'Art. VIII',
      `"${subject}" is not a real measurement (${String(value)}). Counts, durations, and progress are real measurements or are not shown (Bible Art. VIII).`,
    );
  }
}

export { HONESTY_CITATIONS };
