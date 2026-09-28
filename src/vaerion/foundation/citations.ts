/**
 * Vaerion — Foundation / Constitutional Citation Model
 *
 * Authority: Implementation Constitution P-4 (Constitutional Trace Index):
 * "Every rule in this document carries a citation to its governing Article or
 * Section. Any engineering decision that cannot be traced to a citation is a
 * violation of Article XI of the Bible (Nothing Unmeasured Ships)."
 *
 * This module is the machine-readable form of the citation system. Every
 * token, primitive contract, gate result, and release record produced in
 * Volume IV must carry at least one value of `Citation` (Constitution 2.2,
 * 3.0, 9.1, 10.1).
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

/** The three ratified constitutional documents, in citation-key form. */
export type ConstitutionalDocument =
  | 'BIBLE'
  | 'VISUAL_SYSTEM'
  | 'IMPLEMENTATION_CONSTITUTION';

/** Canonical titles, as ratified. Citation: Volume IV directive, "Constitutional Rules". */
export const DOCUMENT_TITLES: Readonly<
  Record<ConstitutionalDocument, string>
> = Object.freeze({
  BIBLE: 'VAERION_DESIGN_BIBLE_v1.0',
  VISUAL_SYSTEM: 'VAERION_VISUAL_SYSTEM_v1.0.1',
  IMPLEMENTATION_CONSTITUTION: 'VAERION_IMPLEMENTATION_CONSTITUTION_v1.0',
});

/**
 * Precedence ordinals. Lower ordinal governs.
 * Citation: Implementation Constitution P-1 (Order of Precedence):
 * "the Bible prevails over the Visual System, and the Visual System prevails
 * over this Constitution."
 */
export const DOCUMENT_PRECEDENCE: Readonly<
  Record<ConstitutionalDocument, 1 | 2 | 3>
> = Object.freeze({
  BIBLE: 1,
  VISUAL_SYSTEM: 2,
  IMPLEMENTATION_CONSTITUTION: 3,
});

/** A single traceable reference into constitutional law. */
export interface Citation {
  readonly document: ConstitutionalDocument;
  /** Article / Section / Part reference exactly as numbered in the source document, e.g. "Art. VI", "§5.1", "Part II", "P-4". */
  readonly reference: string;
  /** Optional pinpoint note narrowing the cited authority. */
  readonly note?: string;
}

/** Constructs a frozen citation. Use the document-specific helpers below in call sites. */
export function cite(
  document: ConstitutionalDocument,
  reference: string,
  note?: string,
): Citation {
  return Object.freeze({ document, reference, ...(note ? { note } : {}) });
}

/** Citation into the Design Bible. Example: bible('VI') -> "Art. VI". */
export function bible(reference: string, note?: string): Citation {
  return cite('BIBLE', `Art. ${reference}`, note);
}

/** Citation into the Visual System. Example: visualSystem('5.1') -> "§5.1". */
export function visualSystem(section: string, note?: string): Citation {
  return cite('VISUAL_SYSTEM', `§${section}`, note);
}

/** Citation into the Implementation Constitution. Example: implementation('P-4') or implementation('Part II'). */
export function implementation(
  reference: string,
  note?: string,
): Citation {
  return cite('IMPLEMENTATION_CONSTITUTION', reference, note);
}

/** Renders a citation in the canonical textual form used by the Trace Index. */
export function formatCitation(citation: Citation): string {
  const title = DOCUMENT_TITLES[citation.document];
  return citation.note
    ? `${title} ${citation.reference} (${citation.note})`
    : `${title} ${citation.reference}`;
}

/** Renders a citation set in canonical comma-joined form; empty set renders as "[UNCITABLE]". */
export function formatCitations(citations: readonly Citation[]): string {
  if (citations.length === 0) return '[UNCITABLE]';
  return citations.map(formatCitation).join('; ');
}

/** Runtime guard: is the value a well-formed citation? */
export function isCitation(value: unknown): value is Citation {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.document === 'string' &&
    candidate.document in DOCUMENT_PRECEDENCE &&
    typeof candidate.reference === 'string' &&
    candidate.reference.length > 0
  );
}
