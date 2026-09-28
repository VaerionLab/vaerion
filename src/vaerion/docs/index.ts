/**
 * Vaerion — Documentation Architecture / Public Barrel
 *
 * Stage 11 — the Documentation stage (foundation/stages.ts, Stage 11 root
 * src/vaerion/docs). Exports the pure law modules (governance, search) and
 * the client delivery components. The Node-only pipeline engine
 * (tools/vaerion-pipeline/docs-shared.ts) is deliberately NOT re-exported
 * here — it belongs to the pipeline, which imports it directly.
 *
 * Citations: Stage 11 execution order Deliverables 3, 5, 6;
 * constitution/docs/GOVERNANCE.md; Constitution P-4.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

export {
  CONFIDENCE_STATES,
  DOC_META_FIELDS,
  DOC_META_LAW_CITATIONS,
  GENERATED_DOCS_ROOT,
  KNOWLEDGE_ORGAN_ROOT,
  parseDocMeta,
} from './governance';
export type { ConfidenceState, DocMeta, DocMetaField } from './governance';
export { buildSearchIndex, searchKnowledge, SEARCH_TIERS } from './search';
export type { SearchHit, SearchIndex, SearchIndexInput, SearchRecord, SearchTier } from './search';
export { KnowledgeHostRoute } from './knowledge-host-route';
export { KnowledgeInterface } from './knowledge-interface';
