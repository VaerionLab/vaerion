/**
 * Vaerion — Documentation Architecture / The Page Metadata Machine Model
 *
 * Stage 11 — Deliverable 5 (Documentation Governance). Every page of the
 * knowledge organ (constitution/docs/) carries a machine-readable DOC-META
 * header; this module is its single machine form — the type, the parser,
 * and the confidence-state law (constitution/docs/GOVERNANCE.md §2–§3).
 *
 * The parser is deliberately strict: a header that is missing, malformed,
 * carries an unknown field, or carries an unknown confidence state parses
 * as `null` — and the verify-documentation gate treats `null` as a
 * violation. Nothing is improvised at parse time (Constitution P-5).
 *
 * PURE MODULE — no Node built-ins; the browser and the pipeline import the
 * same law (Constitution P-6 — interchangeability).
 *
 * Citations:
 * - Stage 11 execution order Deliverable 5 (documentation rules; the six
 *   required page properties).
 * - Implementation Constitution P-4 (citation discipline), P-5 (no
 *   improvised resolution), 9.1 (mechanical, binary checks), 11.1
 *   (ownership), 11.6 (violation detection), 11.4 (history never retired).
 * - Visual System §0 (dual naming — identifier + instrument name resolve
 *   to the same record).
 * - Bible Art. II (evidence or silence), Art. VII (two voices).
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, visualSystem, bible, type Citation } from '../foundation/citations';

/** The three confidence states (GOVERNANCE.md §3) — closed set. */
export const CONFIDENCE_STATES = ['verified', 'derived', 'declared'] as const;
export type ConfidenceState = (typeof CONFIDENCE_STATES)[number];

/** The machine-readable DOC-META record carried by every knowledge page. */
export interface DocMeta {
  /** Unique page identifier within the organ (citation key for other pages). */
  readonly id: string;
  /** The instrument name (dual naming — VS §0). */
  readonly title: string;
  /** The stage or system that owns the page (11.1). */
  readonly owningSystem: string;
  /** The constitutional authorities the page derives from (P-4). */
  readonly authorityCitations: readonly string[];
  /** Implementation paths and commands the page documents (Art. II — reachable evidence). */
  readonly relatedArtifacts: readonly string[];
  /** The confidence state (GOVERNANCE.md §3). */
  readonly confidence: ConfidenceState;
  /** ISO date of the last mechanical verification pass. */
  readonly lastVerified: string;
  /** The gate command that proves the page. */
  readonly verificationCommand: string;
}

/** Canonical field order of the DOC-META block (the header's anatomy). */
export const DOC_META_FIELDS = [
  'id',
  'title',
  'owningSystem',
  'authorityCitations',
  'relatedArtifacts',
  'confidence',
  'lastVerified',
  'verificationCommand',
] as const;

export type DocMetaField = (typeof DOC_META_FIELDS)[number];

const DOC_META_OPEN = 'DOC-META';
const DOC_META_CLOSE = '-->';

/**
 * Parses the DOC-META header of a knowledge page. Returns `null` for any
 * absence or malformation — the caller (the gate) renders the violation;
 * the parser invents nothing (P-5).
 */
export function parseDocMeta(source: string): DocMeta | null {
  const open = source.indexOf(DOC_META_OPEN);
  if (open < 0) return null;
  const close = source.indexOf(DOC_META_CLOSE, open);
  if (close < 0) return null;
  const block = source.slice(open + DOC_META_OPEN.length, close);

  const fields = new Map<string, string>();
  for (const rawLine of block.split('\n')) {
    const line = rawLine.trim();
    if (line.length === 0) continue;
    const sep = line.indexOf(':');
    if (sep <= 0) return null; // malformed line — not a lawful header
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim();
    if (!(DOC_META_FIELDS as readonly string[]).includes(key)) return null; // unknown field
    if (fields.has(key)) return null; // duplicate field
    fields.set(key, value);
  }
  for (const field of DOC_META_FIELDS) {
    if (!fields.has(field)) return null; // missing required field
  }

  const confidence = fields.get('confidence') as ConfidenceState;
  if (!CONFIDENCE_STATES.includes(confidence)) return null;

  const list = (raw: string): readonly string[] =>
    raw.length === 0 ? [] : raw.split(';').map((item) => item.trim()).filter((item) => item.length > 0);

  const meta: DocMeta = Object.freeze({
    id: fields.get('id') as string,
    title: fields.get('title') as string,
    owningSystem: fields.get('owningSystem') as string,
    authorityCitations: list(fields.get('authorityCitations') as string),
    relatedArtifacts: list(fields.get('relatedArtifacts') as string),
    confidence,
    lastVerified: fields.get('lastVerified') as string,
    verificationCommand: fields.get('verificationCommand') as string,
  });
  if (meta.id.length === 0 || meta.title.length === 0) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.lastVerified)) return null;
  return meta;
}

/** The standing citations of the metadata law itself (P-4 — this module is citable). */
export const DOC_META_LAW_CITATIONS: readonly Citation[] = Object.freeze([
  implementation('P-4', 'every page citation-traced'),
  implementation('9.1', 'mechanical, binary verification of the organ'),
  implementation('11.1', 'every page has exactly one owner'),
  implementation('11.6', 'documentation violations block release'),
  visualSystem('0', 'dual naming: identifier + instrument name'),
  bible('II', 'evidence or silence — every claim carries its evidence'),
  bible('VII', 'two voices — measurement and explanation never blend'),
]);

/** The knowledge organ — the pages of constitution/docs/ and their identifiers. */
export const KNOWLEDGE_ORGAN_ROOT = 'constitution/docs';

/** The generated documentation root — pipeline output, never hand-edited (F-005 discipline; GOVERNANCE.md §1.4). */
export const GENERATED_DOCS_ROOT = 'src/vaerion/docs/generated';
