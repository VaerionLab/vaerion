/**
 * VAERION PIPELINE — Documentation Architecture Engine (Stage 11)
 *
 * The single mechanical core of the knowledge organ:
 *
 *   - publish-documentation.ts  — generates the five published artifacts
 *                                 into src/vaerion/docs/generated/ (never
 *                                 hand-edited; F-005 discipline).
 *   - verify-documentation.ts   — re-derives everything and fails closed
 *                                 on drift or any false claim (9.1 form).
 *
 * Every documented claim this engine can check, it checks; everything it
 * cannot check, it reports as unverified — it never improvises (P-5).
 *
 * Citations: Stage 11 execution order Deliverables 5–7; constitution/docs/
 * GOVERNANCE.md; Implementation Constitution P-4, P-5, 9.1, 10.1, 11.6;
 * F-005; docs contract src/vaerion/docs/README.md.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { allTokens, REGISTRIES } from '../../src/vaerion/registry';
import { STAGES } from '../../src/vaerion/foundation/stages';
import { PRIMITIVE_MANIFEST } from '../../src/vaerion/primitives/manifest';
import { parseDocMeta, type DocMeta } from '../../src/vaerion/docs/governance';

export const REPO_ROOT = resolve(join(dirnameOf(import.meta.url), '..', '..'));
export const ORGAN_DIR = join(REPO_ROOT, 'constitution', 'docs');
export const PATHWAYS_DIR = join(ORGAN_DIR, 'pathways');
export const GENERATED_DOCS_DIR = join(REPO_ROOT, 'src', 'vaerion', 'docs', 'generated');
export const TRACE_INDEX_PATH = join(REPO_ROOT, 'constitution', 'trace-index', 'trace-index.md');
export const INTERPRETATIONS_PATH = join(REPO_ROOT, 'constitution', 'interpretations', 'LEDGER.md');
export const AMENDMENTS_PATH = join(REPO_ROOT, 'constitution', 'amendments', 'LEDGER.md');
export const RELEASES_INDEX_PATH = join(REPO_ROOT, 'constitution', 'releases', 'index.json');
export const RELEASES_DIR = join(REPO_ROOT, 'constitution', 'releases', 'receipts');
export const BIBLE_PATH = join(REPO_ROOT, 'constitution', 'bible', 'VAERION_DESIGN_BIBLE_v1.0.md');
export const VISUAL_SYSTEM_PATH = join(REPO_ROOT, 'constitution', 'visual-system', 'VAERION_VISUAL_SYSTEM_v1.0.1.md');
export const IMPLEMENTATION_PATH = join(REPO_ROOT, 'constitution', 'implementation-constitution', 'VAERION_IMPLEMENTATION_CONSTITUTION_v1.0.md');
export const PACKAGE_JSON_PATH = join(REPO_ROOT, 'package.json');

function dirnameOf(url: string): string {
  return new URL('.', url).pathname;
}

// ─── Organ inventory ────────────────────────────────────────────────────────

export interface OrganPage {
  readonly path: string;
  readonly relativePath: string;
  readonly text: string;
  readonly meta: DocMeta | null;
}

/** Every page of the knowledge organ, with its parsed DOC-META (null = unlawful page). */
export function readOrganPages(): readonly OrganPage[] {
  const pages: OrganPage[] = [];
  const collect = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        collect(full);
        continue;
      }
      if (!entry.endsWith('.md')) continue;
      const text = readFileSync(full, 'utf8');
      pages.push(Object.freeze({
        path: full,
        relativePath: relative(REPO_ROOT, full),
        text,
        meta: parseDocMeta(text),
      }));
    }
  };
  collect(ORGAN_DIR);
  return pages;
}

// ─── Governance ledger parsing ──────────────────────────────────────────────

export interface TraceEntry {
  readonly id: string;
  readonly citation: string;
  readonly governed: string;
  readonly kind: string;
}

/** Parses the trace-index table (| T-xxx | citation | governed | kind |). */
export function parseTraceIndex(text: string): readonly TraceEntry[] {
  const entries: TraceEntry[] = [];
  for (const line of text.split('\n')) {
    const match = line.match(/^\|\s*(T-\d{3})\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/);
    if (match) {
      entries.push(Object.freeze({ id: match[1], citation: match[2], governed: match[3], kind: match[4] }));
    }
  }
  return entries;
}

/** Parses the interpretation-request ids (## IR-xxx). */
export function parseInterpretationIds(text: string): readonly string[] {
  const ids: string[] = [];
  for (const line of text.split('\n')) {
    const match = line.match(/^## (IR-\d{3})/);
    if (match) ids.push(match[1]);
  }
  return ids;
}

// ─── Live derivations (the reality the docs must match) ─────────────────────

export interface LiveCounts {
  readonly tokens: number;
  readonly registries: number;
  readonly primitives: number;
  readonly surfaces: number;
  readonly states: number;
  readonly transitions: number;
  readonly commands: number;
  readonly authorities: number;
  readonly stagesTotal: number;
  readonly stagesConformant: number;
  readonly traceEntries: number;
  readonly interpretationIds: readonly string[];
  readonly releaseId: string | null;
  readonly releaseVersion: string | null;
  readonly receiptCount: number;
  readonly artifactCount: number;
  readonly channelCount: number;
}

function countMatches(text: string, pattern: RegExp): number {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

/** Derives every countable fact from the live tree. Deterministic. */
export function deriveLiveCounts(): LiveCounts {
  const surfacesText = readFileSync(join(REPO_ROOT, 'src', 'vaerion', 'surfaces', 'registry.ts'), 'utf8');
  const statesText = readFileSync(join(REPO_ROOT, 'src', 'vaerion', 'state', 'matrix.ts'), 'utf8');
  const transitionsText = readFileSync(join(REPO_ROOT, 'src', 'vaerion', 'state', 'transitions.ts'), 'utf8');
  const commandsText = readFileSync(join(REPO_ROOT, 'src', 'vaerion', 'interaction', 'commands.ts'), 'utf8');
  const authoritiesText = readFileSync(join(REPO_ROOT, 'src', 'vaerion', 'authorities', 'contracts.ts'), 'utf8');

  const traceText = readFileSync(TRACE_INDEX_PATH, 'utf8');
  const traceEntries = parseTraceIndex(traceText);
  const interpretationIds = parseInterpretationIds(readFileSync(INTERPRETATIONS_PATH, 'utf8'));

  let releaseId: string | null = null;
  let releaseVersion: string | null = null;
  let receiptCount = 0;
  let artifactCount = 0;
  let channelCount = 0;
  if (existsSync(RELEASES_INDEX_PATH)) {
    const index = JSON.parse(readFileSync(RELEASES_INDEX_PATH, 'utf8')) as {
      entries: readonly { releaseId: string; version: string; receiptsFile: string }[];
    };
    const first = index.entries[0];
    if (first) {
      releaseId = first.releaseId;
      releaseVersion = first.version;
      const receiptsPath = join(RELEASES_DIR, first.receiptsFile);
      if (existsSync(receiptsPath)) {
        const record = JSON.parse(readFileSync(receiptsPath, 'utf8')) as {
          receipts: unknown[];
          artifacts?: unknown[];
        };
        receiptCount = record.receipts.length;
        artifactCount = countMatches(readFileSync(receiptsPath, 'utf8'), /"artifactId"/g);
        channelCount = countMatches(readFileSync(receiptsPath, 'utf8'), /"channel"/g);
      }
    }
  }

  return Object.freeze({
    tokens: allTokens().length,
    registries: Object.keys(REGISTRIES).length,
    primitives: PRIMITIVE_MANIFEST.length,
    surfaces: countMatches(surfacesText, /\{ id: '/g),
    states: countMatches(statesText, /^    id: '/gm),
    transitions: countMatches(transitionsText, /from: '/g),
    commands: countMatches(commandsText, /^    id: '/gm),
    authorities: countMatches(authoritiesText, /name: '[^']*Authority'/g),
    stagesTotal: STAGES.length,
    stagesConformant: STAGES.filter((stage) => stage.status === 'conformant').length,
    traceEntries: traceEntries.length,
    interpretationIds,
    releaseId,
    releaseVersion,
    receiptCount,
    artifactCount,
    channelCount,
  });
}

// ─── Claim extraction (mechanical, from the organ text) ─────────────────────

/** Extracts backticked repository paths from a document. */
export function extractPaths(text: string): readonly string[] {
  const paths = new Set<string>();
  for (const match of text.matchAll(/`((?:src|constitution|tools|generated|packages|docs|keys|spec|brand|public)\/[A-Za-z0-9_\-./@]+)`/g)) {
    paths.add(match[1].replace(/\/$/, ''));
  }
  return [...paths];
}

/** Extracts `bun run …` commands from a document. */
export function extractCommands(text: string): readonly string[] {
  const commands = new Set<string>();
  for (const match of text.matchAll(/bun run ([a-z:@0-9\-]+)/g)) {
    commands.add(match[1]);
  }
  return [...commands];
}

const API_CONTEXT = /(export|API|module|barrel|mounts|component|primitive|engine|function|provider|command)/i;

/**
 * Extracts API-shaped symbol claims from a document: call-shaped backticks
 * (`NAME(`) and identifier backticks on lines that speak of APIs.
 */
export function extractSymbolClaims(text: string): readonly string[] {
  const symbols = new Set<string>();
  for (const match of text.matchAll(/`([A-Za-z_][A-Za-z0-9_]*)\(/g)) {
    symbols.add(match[1]);
  }
  for (const line of text.split('\n')) {
    if (!API_CONTEXT.test(line)) continue;
    for (const match of line.matchAll(/`([A-Za-z_][A-Za-z0-9_]{4,})`/g)) {
      symbols.add(match[1]);
    }
  }
  // Filter obvious non-API vocabulary (constitutional words that are prose, not code).
  const proseWords = new Set(['ARTICLE', 'CHAPTER', 'CODEX', 'VERIFY', 'PENDING', 'FAILED', 'UNVERIFIED', 'VERIFIED', 'DEMO', 'ERROR']);
  return [...symbols].filter((symbol) => !proseWords.has(symbol.toUpperCase()) || symbol.includes('_'));
}

/** Reads every implementation file into one searchable body (for symbol existence). */
export function implementationBody(): string {
  const chunks: string[] = [];
  const collect = (dir: string): void => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        collect(full);
        continue;
      }
      if (!/\.(ts|tsx|css|json)$/.test(entry)) continue;
      chunks.push(readFileSync(full, 'utf8'));
    }
  };
  collect(join(REPO_ROOT, 'src', 'vaerion'));
  collect(join(REPO_ROOT, 'generated'));
  collect(join(REPO_ROOT, 'packages', 'vaerion', 'src'));
  return chunks.join('\n');
}

// ─── Published artifacts (generated; never hand-edited — F-005 discipline) ──

export interface PublishedArtifact {
  readonly name: string;
  readonly content: string;
}

/** Machine form of the trace index (P-4 publication). */
export function renderTraceIndexPublication(): string {
  const entries = parseTraceIndex(readFileSync(TRACE_INDEX_PATH, 'utf8'));
  return `${JSON.stringify({
    publication: 'vaerion-trace-index',
    source: 'constitution/trace-index/trace-index.md',
    citations: 'Implementation Constitution P-4; constitution/docs/GOVERNANCE.md §5',
    entryCount: entries.length,
    entries,
  }, null, 2)}\n`;
}

/** Registry documentation — token tables with dual naming (VS §0; docs contract §3.1). */
export function renderRegistryDoc(): string {
  const lines: string[] = [];
  lines.push('# REGISTRY DOCUMENTATION — generated from the canonical Registry');
  lines.push('');
  lines.push('Generated by `tools/vaerion-pipeline/publish-documentation.ts` from the live');
  lines.push('Registry (`src/vaerion/registry`). Never hand-edited (F-005; 2.7); drift fails');
  lines.push('`bun run vaerion:verify-documentation`. Dual naming per Visual System §0.');
  lines.push('');
  for (const [domain, tokens] of Object.entries(REGISTRIES)) {
    lines.push(`## ${domain.toUpperCase()} — ${tokens.length} token(s)`);
    lines.push('');
    lines.push('| identifier | instrument name | value/formula | status | version | governing citation |');
    lines.push('|---|---|---|---|---|---|');
    for (const token of tokens) {
      const value = typeof token.value === 'object' ? JSON.stringify(token.value) : String(token.value);
      lines.push(`| ${token.identifier} | ${token.instrumentName} | ${value} | ${token.status} | ${token.version} | ${token.governingCitation} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

/** Implementation documentation — stage-by-stage from the manifest (docs contract §3.3). */
export function renderStagesDoc(): string {
  const lines: string[] = [];
  lines.push('# IMPLEMENTATION DOCUMENTATION — generated from the stage manifest');
  lines.push('');
  lines.push('Generated from `src/vaerion/foundation/stages.ts` by');
  lines.push('`tools/vaerion-pipeline/publish-documentation.ts`. Never hand-edited; drift');
  lines.push('fails `bun run vaerion:verify-documentation` (Constitution 9.1).');
  lines.push('');
  lines.push('| stage | name | root | dependsOn | status |');
  lines.push('|---|---|---|---|---|');
  for (const stage of STAGES) {
    lines.push(`| ${stage.id} | ${stage.name} | ${stage.root} | ${stage.dependsOn.join(', ') || '—'} | ${stage.status} |`);
  }
  lines.push('');
  for (const stage of STAGES) {
    lines.push(`## Stage ${stage.id} — ${stage.name} (${stage.status})`);
    lines.push('');
    lines.push(`Purpose: ${stage.purpose}`);
    lines.push('');
    lines.push(`Completion conditions:`);
    for (const condition of stage.completionConditions) lines.push(`- ${condition}`);
    lines.push('');
  }
  return lines.join('\n');
}

/** API documentation — the public exports of src/vaerion (docs contract §3.4). */
export function renderApiDoc(): string {
  const lines: string[] = [];
  lines.push('# API DOCUMENTATION — generated from the implementation exports');
  lines.push('');
  lines.push('Generated by `tools/vaerion-pipeline/publish-documentation.ts`. Every entry');
  lines.push('below is a real export statement in the named source file; drift fails');
  lines.push('`bun run vaerion:verify-documentation` (Constitution 9.1; docs contract §3.4).');
  lines.push('');
  const moduleDirs = [
    'foundation', 'registry', 'primitives', 'state', 'interaction',
    'rendering', 'authorities', 'testing', 'release', 'docs',
  ];
  const exportPattern = /export\s+(?:async\s+)?(?:function|const|class|interface|type|enum)\s+([A-Za-z0-9_]+)/g;
  for (const dir of moduleDirs) {
    const absDir = join(REPO_ROOT, 'src', 'vaerion', dir);
    if (!existsSync(absDir)) continue;
    lines.push(`## src/vaerion/${dir}`);
    lines.push('');
    const files = readdirSync(absDir).filter((file) => /\.tsx?$/.test(file)).sort();
    for (const file of files) {
      const text = readFileSync(join(absDir, file), 'utf8');
      const names = [...text.matchAll(exportPattern)].map((match) => match[1]);
      const starReexports = [...text.matchAll(/export \* from '([^']+)'/g)].map((match) => `* from ${match[1]}`);
      const namedReexports = [...text.matchAll(/export \{ ([^}]+) \} from '([^']+)'/g)].map((match) => `{ ${match[1]} } from ${match[2]}`);
      if (names.length === 0 && starReexports.length === 0 && namedReexports.length === 0) continue;
      lines.push(`### ${file}`);
      for (const name of names) lines.push(`- export ${name}`);
      for (const reexport of [...starReexports, ...namedReexports]) lines.push(`- re-export ${reexport}`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

/** The knowledge base — the organ inventory the Knowledge Interface serves. */
export function renderKnowledgeBase(): string {
  const pages = readOrganPages();
  const counts = deriveLiveCounts();
  const body = {
    publication: 'vaerion-knowledge-base',
    citations: ['Stage 11 execution order Deliverables 1-7', 'constitution/docs/GOVERNANCE.md'],
    organRoot: 'constitution/docs',
    pageCount: pages.length,
    counts,
    pages: pages.map((page) => ({
      path: page.relativePath,
      meta: page.meta,
      sections: [...page.text.matchAll(/^## (.+)$/gm)].map((match) => match[1]),
      sha256: createHash('sha256').update(page.text).digest('hex'),
    })),
  };
  return `${JSON.stringify(body, null, 2)}\n`;
}

/** All five published artifacts, in canonical order. */
export function buildPublishedArtifacts(): readonly PublishedArtifact[] {
  return Object.freeze([
    { name: 'trace-index-published.json', content: renderTraceIndexPublication() },
    { name: 'REGISTRY_DOC.md', content: renderRegistryDoc() },
    { name: 'STAGES_DOC.md', content: renderStagesDoc() },
    { name: 'API_DOC.md', content: renderApiDoc() },
    { name: 'knowledge-base.json', content: renderKnowledgeBase() },
  ]);
}
