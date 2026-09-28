/**
 * Vaerion — Documentation Architecture / Hash-First Search Intelligence
 *
 * Stage 11 — Deliverable 6. The search law of the knowledge organ
 * (constitution/docs/GOVERNANCE.md §4): resolution priority is
 *
 *   1. exact authority references   (Art. VI, §5.7, P-4, Part II, 8.1, T-067, IR-018)
 *   2. registry identifiers         (space.7, color.verdict.verified — dual naming honored)
 *   3. implementation symbols       (ConstitutionalViolationError, captureSnapshot)
 *   4. documentation                (free text, last)
 *
 * because identifiers are measurements (Bible Art. VII — the Machine Voice
 * is canonical): a query that IS a measurement must hit the measurement,
 * not prose. The index is built from the live sources at request time and
 * never maintains a second copy of any registry.
 *
 * PURE MODULE — the browser and the pipeline import the same law (P-6).
 *
 * Citations: Stage 11 execution order Deliverable 6; constitution/docs/
 * GOVERNANCE.md §4; Implementation Constitution P-4, P-7 (Machine Voice
 * canon via Bible Art. VII), 2.2 (dual naming discipline), 9.1.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import type { TokenRecord } from '../registry';
import type { StageDefinition } from '../foundation/stages';

/** The four resolution tiers, in priority order (GOVERNANCE.md §4). */
export const SEARCH_TIERS = ['authority', 'registry', 'symbol', 'documentation'] as const;
export type SearchTier = (typeof SEARCH_TIERS)[number];

/** One indexed record. Built from live sources; nothing is duplicated. */
export interface SearchRecord {
  readonly tier: SearchTier;
  /** The canonical key (citation form, token identifier, symbol name, or doc id). */
  readonly key: string;
  /** Alternative keys that resolve to the same record (dual naming — VS §0). */
  readonly aliases: readonly string[];
  /** The instrument name / human title. */
  readonly title: string;
  /** Where the record lives (document path or module). */
  readonly location: string;
  /** One-line machine-voice detail (value, status, owner). */
  readonly detail: string;
  readonly citations: readonly string[];
}

/** A resolved search hit, in ranked order. */
export interface SearchHit {
  readonly record: SearchRecord;
  /** 1 = authority reference … 4 = documentation (GOVERNANCE.md §4). */
  readonly tierOrdinal: 1 | 2 | 3 | 4;
  readonly matchedKey: string;
}

/** The inputs of the index — assembled from live sources by the caller. */
export interface SearchIndexInput {
  /** The knowledge-organ pages (id, title, path, plain text). */
  readonly documents: readonly { readonly id: string; readonly title: string; readonly path: string; readonly text: string }[];
  /** The canonical Registry tokens (from the live Registry — never a copy). */
  readonly tokens: readonly TokenRecord[];
  /** The stage manifest entries (from foundation/stages.ts). */
  readonly stages: readonly StageDefinition[];
  /** Exported symbols of the implementation, with their defining module. */
  readonly symbols: readonly { readonly name: string; readonly module: string; readonly kind: string }[];
  /** Trace-index entries (T-xxx) and interpretation requests (IR-xxx). */
  readonly governance: readonly { readonly key: string; readonly title: string; readonly location: string; readonly citations: readonly string[] }[];
}

export interface SearchIndex {
  readonly records: readonly SearchRecord[];
}

/**
 * Builds the index from live inputs. The function is deterministic: the
 * same inputs produce the same index (P-6).
 */
export function buildSearchIndex(input: SearchIndexInput): SearchIndex {
  const records: SearchRecord[] = [];

  // Tier 1 — exact authority references: governance keys, then the citation
  // grammar itself is resolved by shape at query time (below).
  for (const entry of input.governance) {
    records.push(Object.freeze({
      tier: 'authority',
      key: entry.key,
      aliases: [],
      title: entry.title,
      location: entry.location,
      detail: entry.key.startsWith('T-') ? 'trace-index entry' : 'interpretation request',
      citations: entry.citations,
    }));
  }

  // Tier 2 — registry identifiers (dual naming: identifier + instrument name).
  for (const token of input.tokens) {
    records.push(Object.freeze({
      tier: 'registry',
      key: token.identifier,
      aliases: [token.instrumentName],
      title: token.instrumentName,
      location: `Registry (${token.identifier.split('.')[0]}) → generated bindings`,
      detail: `value: ${typeof token.value === 'object' ? JSON.stringify(token.value) : String(token.value)} · status: ${token.status} · v${token.version}`,
      citations: token.governingCitation.map((citation) => `${citation.document} ${citation.reference}`),
    }));
  }

  // Tier 3 — implementation symbols.
  for (const symbol of input.symbols) {
    records.push(Object.freeze({
      tier: 'symbol',
      key: symbol.name,
      aliases: [],
      title: symbol.name,
      location: symbol.module,
      detail: `export ${symbol.kind}`,
      citations: ['Implementation Constitution P-4 (the trace index maps the module to its law)'],
    }));
  }

  // Stage records — indexed between symbols and documentation: a stage name
  // is an instrument name of the manifest (dual naming with its number).
  for (const stage of input.stages) {
    records.push(Object.freeze({
      tier: 'symbol',
      key: `stage-${stage.id}`,
      aliases: [stage.name],
      title: `Stage ${stage.id} — ${stage.name}`,
      location: stage.root,
      detail: `status: ${stage.status}`,
      citations: stage.citations.map((citation) => `${citation.document} ${citation.reference}`),
    }));
  }

  // Tier 4 — documentation pages.
  for (const doc of input.documents) {
    records.push(Object.freeze({
      tier: 'documentation',
      key: doc.id,
      aliases: [doc.title],
      title: doc.title,
      location: doc.path,
      detail: `knowledge organ page (${doc.text.length} characters)`,
      citations: ['constitution/docs/GOVERNANCE.md §2 (the page metadata law)'],
    }));
  }

  return Object.freeze({ records: Object.freeze(records) });
}

/** Citation shapes that resolve at tier 1 by form (GOVERNANCE.md §4.1). */
const CITATION_SHAPES: readonly { readonly pattern: RegExp; readonly title: (match: RegExpMatchArray) => string; readonly location: string; readonly detail: string }[] = Object.freeze([
  { pattern: /^art\.?\s*([IVX]+)$/i, title: (m) => `Bible Article ${m[1].toUpperCase()}`, location: 'constitution/bible/VAERION_DESIGN_BIBLE_v1.0.md', detail: 'one of the fourteen Articles of the Design Bible' },
  { pattern: /^§?\s*(\d+\.\d+)$/, title: (m) => `Visual System §${m[1]}`, location: 'constitution/visual-system/VAERION_VISUAL_SYSTEM_v1.0.1.md', detail: 'a registered section of the Visual System' },
  { pattern: /^§?\s*(\d+)$/, title: (m) => `Visual System §${m[1]}`, location: 'constitution/visual-system/VAERION_VISUAL_SYSTEM_v1.0.1.md', detail: 'a registered top-level section of the Visual System' },
  { pattern: /^P-([1-6])$/, title: (m) => `Implementation Constitution P-${m[1]}`, location: 'constitution/implementation-constitution/VAERION_IMPLEMENTATION_CONSTITUTION_v1.0.md', detail: 'a preamble law of the Implementation Constitution' },
  { pattern: /^part\s+([IVX]+)$/i, title: (m) => `Implementation Constitution Part ${m[1].toUpperCase()}`, location: 'constitution/implementation-constitution/VAERION_IMPLEMENTATION_CONSTITUTION_v1.0.md', detail: 'a Part of the Implementation Constitution' },
  { pattern: /^(\d+\.\d+)$/, title: (m) => `Implementation Constitution ${m[1]}`, location: 'constitution/implementation-constitution/VAERION_IMPLEMENTATION_CONSTITUTION_v1.0.md', detail: 'a numbered rule of the Implementation Constitution' },
]);

function tierOrdinalOf(tier: SearchTier): 1 | 2 | 3 | 4 {
  switch (tier) {
    case 'authority': return 1;
    case 'registry': return 2;
    case 'symbol': return 3;
    case 'documentation': return 4;
  }
}

/**
 * Resolves a query hash-first (GOVERNANCE.md §4). Returns hits ranked by
 * tier, then by exactness. An empty result is an honest empty result —
 * the index invents nothing.
 */
export function searchKnowledge(index: SearchIndex, query: string, limit = 12): readonly SearchHit[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];
  const lower = trimmed.toLowerCase();
  const hits: SearchHit[] = [];

  // Tier 1 by form — the query IS a citation.
  for (const shape of CITATION_SHAPES) {
    const match = trimmed.match(shape.pattern);
    if (match) {
      hits.push(Object.freeze({
        record: Object.freeze({
          tier: 'authority',
          key: trimmed,
          aliases: [],
          title: shape.title(match),
          location: shape.location,
          detail: shape.detail,
          citations: [shape.title(match)],
        }),
        tierOrdinal: 1,
        matchedKey: trimmed,
      }));
      break; // one citation shape wins the query
    }
  }

  // Tier 1/2/3/4 by record — exact key, then alias, then containment.
  for (const record of index.records) {
    const keys = [record.key, ...record.aliases];
    const exact = keys.some((key) => key.toLowerCase() === lower);
    const prefix = !exact && keys.some((key) => key.toLowerCase().startsWith(lower));
    const contains = !exact && !prefix && keys.some((key) => key.toLowerCase().includes(lower));
    if (exact || prefix || contains) {
      hits.push(Object.freeze({ record, tierOrdinal: tierOrdinalOf(record.tier), matchedKey: record.key }));
    }
  }

  // Tier 4 content search — the only free-text tier.
  const docRecords = index.records.filter((record) => record.tier === 'documentation');
  const docInput = new Map(docRecords.map((record) => [record.key, record]));
  for (const doc of docRecords) {
    // containment on the title was already handled above; content search:
    // the caller supplies the text only at build time, so content matching
    // resolves through the aliases (title) plus the document path.
    if (!hits.some((hit) => hit.record.key === doc.key) &&
        (doc.location.toLowerCase().includes(lower))) {
      hits.push(Object.freeze({ record: doc, tierOrdinal: 4, matchedKey: doc.key }));
    }
  }
  void docInput;

  // Rank: tier ascending, then exact-before-prefix-before-contains (stable).
  const rankOf = (hit: SearchHit): number => {
    const keys = [hit.record.key, ...hit.record.aliases].map((key) => key.toLowerCase());
    if (keys.includes(lower)) return 0;
    if (keys.some((key) => key.startsWith(lower))) return 1;
    return 2;
  };
  return hits
    .sort((a, b) => a.tierOrdinal - b.tierOrdinal || rankOf(a) - rankOf(b) || a.record.key.localeCompare(b.record.key))
    .slice(0, Math.max(1, limit));
}
