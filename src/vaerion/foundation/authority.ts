/**
 * Vaerion — Foundation / Authority Resolution
 *
 * Mechanical enforcement of constitutional precedence and traceability.
 *
 * Citations:
 * - Implementation Constitution P-1 (Order of Precedence)
 * - Implementation Constitution P-4 (Constitutional Trace Index)
 * - Bible Art. XI (Nothing Unmeasured Ships)
 * - Implementation Constitution P-5 (Silence Rule — undefined cases go to
 *   governance; they are never improvised; see constitution/interpretations/)
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import {
  DOCUMENT_PRECEDENCE,
  formatCitations,
  type Citation,
  type ConstitutionalDocument,
} from './citations';

/** Raised when an artifact violates constitutional law. Gates and tooling catch this; it is never swallowed. */
export class ConstitutionalViolationError extends Error {
  /** Identifier of the violated rule, e.g. "P-4", "Art. XI", "2.7". */
  readonly rule: string;
  readonly citations: readonly Citation[];

  constructor(rule: string, message: string, citations: readonly Citation[] = []) {
    super(`[CONSTITUTIONAL VIOLATION · ${rule}] ${message}`);
    this.name = 'ConstitutionalViolationError';
    this.rule = rule;
    this.citations = citations;
  }
}

export interface PrecedenceRuling {
  /** The document that governs in the conflict. */
  readonly governing: ConstitutionalDocument;
  /** The document that yields. */
  readonly overridden: ConstitutionalDocument;
  /** Fixed textual basis of the ruling. */
  readonly basis: 'P-1: the Bible prevails over the Visual System; the Visual System prevails over this Constitution.';
}

/**
 * Resolves which of two constitutional documents governs a conflict.
 * Citation: Constitution P-1. Deterministic; never throws for known documents.
 */
export function resolvePrecedence(
  a: ConstitutionalDocument,
  b: ConstitutionalDocument,
): PrecedenceRuling {
  const rankOf = (d: ConstitutionalDocument): number => DOCUMENT_PRECEDENCE[d];
  const governing = rankOf(a) <= rankOf(b) ? a : b;
  const overridden = governing === a ? b : a;
  return {
    governing,
    overridden,
    basis:
      'P-1: the Bible prevails over the Visual System; the Visual System prevails over this Constitution.',
  };
}

/**
 * Returns the highest-precedence document present in a citation set —
 * the document whose law must be checked first when auditing the decision.
 * Citation: Constitution P-1, P-4.
 */
export function governingDocument(
  citations: readonly Citation[],
): ConstitutionalDocument | null {
  let best: ConstitutionalDocument | null = null;
  let bestRank = Number.POSITIVE_INFINITY;
  for (const citation of citations) {
    const rank = DOCUMENT_PRECEDENCE[citation.document];
    if (rank < bestRank) {
      best = citation.document;
      bestRank = rank;
    }
  }
  return best;
}

/**
 * Enforces traceability: an engineering artifact must carry at least one
 * citation. An empty citation set is a constitutional violation, not a
 * warning. Citation: Constitution P-4; Bible Art. XI.
 *
 * @param subject stable identifier of the audited artifact, e.g. "token:space.4"
 * @param citations the citations claimed by the artifact
 * @throws ConstitutionalViolationError when the set is empty
 */
export function assertTraceable(
  subject: string,
  citations: readonly Citation[],
): void {
  if (!citations || citations.length === 0) {
    throw new ConstitutionalViolationError(
      'P-4 / Art. XI',
      `Artifact "${subject}" is uncitable. Nothing unmeasured ships. File an interpretation request instead of improvising (P-5).`,
      [],
    );
  }
}

/**
 * Formats the audit trail line for a gated artifact:
 * "subject <- citations". Used by gates (Stage 8) and release records (Stage 9).
 * Citation: Constitution 9.1, 10.1, P-4.
 */
export function auditLine(
  subject: string,
  citations: readonly Citation[],
): string {
  return `${subject} <- ${formatCitations(citations)}`;
}
