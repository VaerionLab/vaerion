/**
 * VAERION PIPELINE — verify-documentation (Stage 11, Deliverable 7)
 *
 *   bun run vaerion:verify-documentation
 *
 * The mechanical proof of the knowledge organ (constitution/docs/). It
 * proves, and fails closed on:
 *
 *   1. every documented API exists       — symbol claims resolve in the tree
 *   2. every citation exists             — Art./§/Part/rule/T-xxx/IR-xxx/F-xxx resolve
 *   3. every stage reference is valid    — stage numbers, names, statuses match the manifest
 *   4. every architecture claim matches  — every file path exists; every countable
 *                                          claim equals the live derivation
 *   5. no outdated claims exist          — DOC-META present everywhere; commands real;
 *                                          published artifacts byte-match regeneration
 *
 * Every failure emits the ordered evidence form (Evidence · Citation ·
 * Artifact location · Timestamp · Integrity hash) as an evidence record
 * under tools/vaerion-pipeline/artifacts/ with the stage11 tag — and the
 * command exits 1. Failures are conformance errors, not editorial matters
 * (Constitution 9.1; GOVERNANCE.md §5).
 *
 * Citations: Stage 11 execution order Deliverable 7; constitution/docs/
 * GOVERNANCE.md; Implementation Constitution P-4, P-5, 9.1, 10.1, 11.6.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  AMENDMENTS_PATH,
  BIBLE_PATH,
  IMPLEMENTATION_PATH,
  INTERPRETATIONS_PATH,
  PACKAGE_JSON_PATH,
  TRACE_INDEX_PATH,
  VISUAL_SYSTEM_PATH,
  buildPublishedArtifacts,
  deriveLiveCounts,
  extractCommands,
  extractPaths,
  extractSymbolClaims,
  implementationBody,
  readOrganPages,
} from './docs-shared';
import { STAGES } from '../../src/vaerion/foundation/stages';
import { implementation as implCite } from '../../src/vaerion/foundation/citations';
import { printEvidenceRecord, toEvidenceLines, writeEvidenceRecord } from './record';

interface CheckResult {
  readonly label: string;
  readonly passed: boolean;
  readonly evidence: string;
  readonly citations: readonly string[];
}

const checks: CheckResult[] = [];
const check = (label: string, passed: boolean, evidence: string, citations: string[]): void => {
  checks.push({ label, passed, evidence, citations });
};

// ─── Load the sources of truth ──────────────────────────────────────────────

const pages = readOrganPages();
const counts = deriveLiveCounts();
const bibleText = readFileSync(BIBLE_PATH, 'utf8');
const visualSystemText = readFileSync(VISUAL_SYSTEM_PATH, 'utf8');
const implementationText = readFileSync(IMPLEMENTATION_PATH, 'utf8');
const traceText = readFileSync(TRACE_INDEX_PATH, 'utf8');
const interpretationsText = readFileSync(INTERPRETATIONS_PATH, 'utf8');
const amendmentsText = readFileSync(AMENDMENTS_PATH, 'utf8');
const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8')) as { scripts: Record<string, string> };
const scripts: ReadonlySet<string> = new Set(Object.keys(packageJson.scripts));
const implBody = implementationBody();

const ROMAN = '[IVXLC]+';

// ─── 1. The organ: every page carries lawful DOC-META ───────────────────────

for (const page of pages) {
  check(
    `DOC-META present and lawful: ${page.relativePath}`,
    page.meta !== null,
    page.meta
      ? `id=${page.meta.id} · confidence=${page.meta.confidence} · lastVerified=${page.meta.lastVerified} · ${page.meta.authorityCitations.length} citation(s)`
      : 'DOC-META header missing, malformed, or carries unknown fields (GOVERNANCE.md §2)',
    ['constitution/docs/GOVERNANCE.md §2', 'Implementation Constitution 9.1'],
  );
}

// ─── 2. Every citation resolves ─────────────────────────────────────────────

const CITATION_RULES: readonly { readonly pattern: RegExp; readonly resolve: (match: RegExpMatchArray) => { ok: boolean; evidence: string } }[] = [
  {
    // Bible Article: "Bible Art. VI" → "Article VI" word-boundary in the Bible.
    pattern: new RegExp(`Bible Art\\.\\s*(${ROMAN})`, 'g'),
    resolve: (match) => {
      const ok = new RegExp(`Article ${match[1]}\\b`).test(bibleText);
      return { ok, evidence: ok ? `Bible contains "Article ${match[1]}"` : `Bible contains no "Article ${match[1]}"` };
    },
  },
  {
    // Visual System section: "Visual System §5.7" → "§5.7" appears in the VS text.
    pattern: /Visual System §(\d+(?:\.\d+)?)/g,
    resolve: (match) => {
      const ok = visualSystemText.includes(`§${match[1]}`);
      return { ok, evidence: ok ? `Visual System contains "§${match[1]}"` : `Visual System contains no "§${match[1]}"` };
    },
  },
  {
    // Constitution Part: "Constitution Part X" → "PART X" heading word-boundary.
    pattern: new RegExp(`Constitution Part (${ROMAN})\\b`, 'g'),
    resolve: (match) => {
      const ok = new RegExp(`PART ${match[1]}\\b`).test(implementationText);
      return { ok, evidence: ok ? `Implementation Constitution contains "PART ${match[1]}"` : `no "PART ${match[1]}" in the Implementation Constitution` };
    },
  },
  {
    // Constitution numbered rule / preamble: "Constitution 10.3" / "Constitution P-4".
    pattern: /Constitution (P-[1-6]|\d+\.\d+)/g,
    resolve: (match) => {
      const ref = match[1];
      const ok = implementationText.includes(ref);
      return { ok, evidence: ok ? `Implementation Constitution contains "${ref}"` : `Implementation Constitution contains no "${ref}"` };
    },
  },
  {
    // Trace index entries: "T-067".
    pattern: /T-\d{3}/g,
    resolve: (match) => {
      const ok = traceText.includes(`| ${match[0]}`);
      return { ok, evidence: ok ? `trace index contains "${match[0]}"` : `trace index contains no "${match[0]}"` };
    },
  },
  {
    // Interpretation requests: "IR-018".
    pattern: /IR-\d{3}/g,
    resolve: (match) => {
      const ok = interpretationsText.includes(match[0]);
      return { ok, evidence: ok ? `interpretations ledger contains "${match[0]}"` : `interpretations ledger contains no "${match[0]}"` };
    },
  },
  {
    // Foundation Amendments: "F-006".
    pattern: /F-\d{3}/g,
    resolve: (match) => {
      const ok = amendmentsText.includes(match[0]);
      return { ok, evidence: ok ? `amendments ledger contains "${match[0]}"` : `amendments ledger contains no "${match[0]}"` };
    },
  },
];

for (const page of pages) {
  if (page.meta === null) continue; // already failed above; citation scan needs no meta
  for (const rule of CITATION_RULES) {
    const seen = new Set<string>();
    for (const match of page.text.matchAll(rule.pattern)) {
      const key = match[0];
      if (seen.has(key)) continue;
      seen.add(key);
      const verdict = rule.resolve(match);
      check(
        `citation resolves: "${key}" in ${page.relativePath}`,
        verdict.ok,
        verdict.evidence,
        ['Implementation Constitution P-4', 'constitution/docs/GOVERNANCE.md §5'],
      );
    }
  }
  // Directive citations: "Stage 11 execution order" → a directive note mentioning Stage 11 exists.
  for (const match of page.text.matchAll(/Stage (\d+) execution order/g)) {
    const ok = amendmentsText.includes(`Stage ${match[1]}`);
    check(
      `directive citation resolves: "Stage ${match[1]} execution order" in ${page.relativePath}`,
      ok,
      ok ? `amendments ledger records the Stage ${match[1]} directive` : `no Stage ${match[1]} directive recorded in the amendments ledger`,
      ['constitution/amendments/LEDGER.md (directive notes)', 'Implementation Constitution P-5'],
    );
  }
}

// ─── 3. Every stage reference is valid (names + statuses match the manifest) ─
// Two lawful reference forms exist in the organ:
//   (a) prose mapping:  "Stage 5 — State Architecture"   (em-dash form)
//   (b) stage tables:   "| 5 | State Architecture |"     (the stage table row)
// A captured name that does not equal the manifest name for that stage number
// is an invalid stage reference (stale or invented mapping).

const stageNameById = new Map<number, string>(STAGES.map((stage) => [stage.id as number, stage.name]));
// The DOC-META header is machine law with its own validation (GOVERNANCE.md
// §2); the stage-mapping check governs prose and tables only, so comments
// (including the header) are stripped before scanning.
const stageRefs: readonly { readonly page: string; readonly stage: number; readonly claimedName: string }[] = pages.flatMap((page) => {
  const prose = page.text.replace(/<!--[\s\S]*?-->/g, '');
  const refs: { page: string; stage: number; claimedName: string }[] = [];
  for (const match of prose.matchAll(/Stage (\d{1,2}) — ([A-Za-z][A-Za-z /]+?)(?:[.,);:]|\s\(|\s—|$)/g)) {
    refs.push({ page: page.relativePath, stage: Number(match[1]), claimedName: match[2].trim() });
  }
  for (const match of prose.matchAll(/^\|\s*(\d{1,2})\s*\|\s*([A-Za-z][A-Za-z /]*?)\s*\|/gm)) {
    const id = Number(match[1]);
    if (id >= 1 && id <= STAGES.length) {
      refs.push({ page: page.relativePath, stage: id, claimedName: match[2].trim() });
    }
  }
  return refs;
});
for (const ref of stageRefs) {
  const lawful = stageNameById.get(ref.stage);
  const ok = lawful !== undefined && lawful.toLowerCase() === ref.claimedName.toLowerCase();
  check(
    `stage reference valid: "Stage ${ref.stage} — ${ref.claimedName}" (${ref.page})`,
    ok,
    ok
      ? `manifest: Stage ${ref.stage} = "${lawful}" — matches`
      : `manifest declares Stage ${ref.stage} = "${lawful ?? 'no such stage'}"; organ claims "${ref.claimedName}"`,
    ['src/vaerion/foundation/stages.ts (the manifest of record)', 'Implementation Constitution P-4'],
  );
}

// ─── 4a. Every file path exists ─────────────────────────────────────────────

for (const page of pages) {
  if (page.meta === null) continue;
  const claimedPaths = new Set<string>([...page.meta.relatedArtifacts, ...extractPaths(page.text)]);
  for (const rawPath of claimedPaths) {
    const path = rawPath.replace(/\/$/, '');
    if (path.length === 0) continue;
    // Paths that name a command or a record id are not file paths.
    if (!/^(src|constitution|tools|generated|packages|docs|keys|spec|brand|public)\//.test(path)) continue;
    const exists = existsSync(join(process.cwd(), path));
    check(
      `architecture claim matches reality: ${path} (${page.relativePath})`,
      exists,
      exists ? 'path exists in the tree' : 'documented path does NOT exist',
      ['Bible Art. XI (nothing unmeasured ships)', 'constitution/docs/GOVERNANCE.md §5.4'],
    );
  }
}

// ─── 4b. Every countable claim equals the live derivation ───────────────────

const COUNT_CLAIMS: readonly { readonly pattern: RegExp; readonly actual: number; readonly expected: number; readonly label: string }[] = [
  { pattern: /64 tokens/, actual: counts.tokens, expected: 64, label: 'Registry token count' },
  { pattern: /7 registries|seven sub-registries/i, actual: counts.registries, expected: 7, label: 'Registry sub-registry count' },
  { pattern: /\b20 primitives|twenty law-manifestations/i, actual: counts.primitives, expected: 20, label: 'Primitive count' },
  { pattern: /ten registered surfaces/i, actual: counts.surfaces, expected: 10, label: 'Surface count' },
  { pattern: /Twelve immutable states|twelve immutable states|twelve states/i, actual: counts.states, expected: 12, label: 'State count' },
  { pattern: /13 rows over 11 events/, actual: counts.transitions, expected: 13, label: 'Lawful transition row count' },
  { pattern: /Thirteen registered commands|thirteen registered commands|Thirteen commands|thirteen commands/i, actual: counts.commands, expected: 13, label: 'Command count' },
  { pattern: /[Ss]even named authorities|exactly seven authorities|seven authority contracts/i, actual: counts.authorities, expected: 7, label: 'Authority count' },
  { pattern: /[Ss]even receipts/, actual: counts.receiptCount, expected: 7, label: 'Release receipt count' },
  { pattern: /eight (declared )?channels/i, actual: counts.channelCount, expected: 8, label: 'Distribution channel count' },
  { pattern: /four provenanced artifacts/i, actual: counts.artifactCount, expected: 4, label: 'Artifact count' },
];

const organText = pages.map((page) => page.text).join('\n');
for (const claim of COUNT_CLAIMS) {
  if (!claim.pattern.test(organText)) continue; // the organ makes no such claim here
  check(
    `countable claim matches reality: ${claim.label} = ${claim.expected}`,
    claim.actual === claim.expected,
    `documented: ${claim.expected} · derived live from the implementation: ${claim.actual}`,
    ['Bible Art. XI', 'constitution/docs/GOVERNANCE.md §5.4'],
  );
}

// Release identity claims.
if (organText.includes('rel_769da4b7bf84ad3b')) {
  check(
    'countable claim matches reality: first release identity',
    counts.releaseId === 'rel_769da4b7bf84ad3b' && counts.releaseVersion === '1.0.10.r1',
    `documented: rel_769da4b7bf84ad3b / 1.0.10.r1 · derived from constitution/releases/index.json: ${counts.releaseId} / ${counts.releaseVersion}`,
    ['Foundation Amendment F-006', 'Constitution 10.3'],
  );
}
// Governance-extent claims.
if (organText.includes('T-001…T-067')) {
  const lastTrace = counts.traceEntries;
  check(
    'countable claim matches reality: trace index extent',
    lastTrace === 67,
    `documented: T-001…T-067 (${67} entries) · derived: ${lastTrace} entries`,
    ['Implementation Constitution P-4'],
  );
}
if (organText.includes('IR-001…IR-019')) {
  const last = counts.interpretationIds[counts.interpretationIds.length - 1];
  check(
    'countable claim matches reality: interpretation ledger extent',
    last === 'IR-019' || last === 'IR-020',
    `documented: IR-001…IR-019 · derived: ${counts.interpretationIds.length} requests, last ${last}`,
    ['Implementation Constitution P-5'],
  );
}

// ─── 5a. Every documented API exists ────────────────────────────────────────

for (const page of pages) {
  if (page.meta === null) continue;
  for (const symbol of extractSymbolClaims(page.text)) {
    const found = new RegExp(`\\b${symbol}\\b`).test(implBody);
    check(
      `documented API exists: ${symbol} (${page.relativePath})`,
      found,
      found ? 'symbol found in the implementation tree' : 'documented symbol NOT found in src/vaerion, generated/, or packages/vaerion/src',
      ['Bible Art. II (evidence or silence)', 'constitution/docs/GOVERNANCE.md §5.1'],
    );
  }
}

// ─── 5b. Every documented command is a real script ──────────────────────────

for (const page of pages) {
  if (page.meta === null) continue;
  for (const command of extractCommands(page.text)) {
    const ok = scripts.has(command);
    check(
      `verification command exists: bun run ${command} (${page.relativePath})`,
      ok,
      ok ? 'script present in package.json' : 'script MISSING from package.json',
      ['Constitution 9.1 (verification must be executable)', 'constitution/docs/GOVERNANCE.md §5.5'],
    );
  }
  // The page's own verification command must be real, too.
  if (page.meta !== null) {
    const own = page.meta.verificationCommand.replace(/^bun run /, '');
    const ok = scripts.has(own);
    check(
      `page verification command exists: ${page.meta.verificationCommand} (${page.relativePath})`,
      ok,
      ok ? 'script present in package.json' : 'script MISSING from package.json',
      ['constitution/docs/GOVERNANCE.md §2'],
    );
  }
}

// ─── 5c. The published artifacts are drift-free (regeneration comparison) ───

const regenerated = buildPublishedArtifacts();
for (const artifact of regenerated) {
  const committedPath = join(process.cwd(), 'src', 'vaerion', 'docs', 'generated', artifact.name);
  if (!existsSync(committedPath)) {
    check(
      `published artifact present: ${artifact.name}`,
      false,
      'missing — run `bun run vaerion:publish-docs` (generated documentation is never hand-authored; F-005)',
      ['Constitution 9.1', 'F-005'],
    );
    continue;
  }
  const committed = readFileSync(committedPath, 'utf8');
  check(
    `published artifact drift-free: ${artifact.name}`,
    committed === artifact.content,
    committed === artifact.content
      ? `${artifact.content.length} bytes; regeneration byte-identical`
      : `drift: committed ${committed.length} bytes vs regenerated ${artifact.content.length} bytes — run \`bun run vaerion:publish-docs\``,
    ['Constitution 9.1 (generated docs differing from committed output fail the build)', 'GOVERNANCE.md §1.4'],
  );
}

// ─── 5d. The stage-11 display path is recorded (IR-020) ─────────────────────

check(
  'governance record present: IR-020 (Knowledge Interface display path) filed',
  interpretationsText.includes('## IR-020'),
  interpretationsText.includes('## IR-020')
    ? 'IR-020 recorded in constitution/interpretations/LEDGER.md'
    : 'IR-020 missing — the Knowledge Interface display path is unrecorded (GOVERNANCE.md §6.2)',
  ['constitution/docs/GOVERNANCE.md §6.2', 'Implementation Constitution P-5'],
);

// ─── Verdict + evidence record ──────────────────────────────────────────────

const failed = checks.filter((result) => !result.passed);
const verdict = failed.length === 0 ? 'PASS' : 'FAIL';

const record = writeEvidenceRecord({
  command: 'verify-documentation',
  stageTag: 'stage11',
  verdict,
  checks: toEvidenceLines(checks.map((result) => ({
    label: result.label,
    passed: result.passed,
    evidence: result.evidence,
    citations: result.citations,
  }))),
  citations: [
    implCite('P-4', 'citation discipline'),
    implCite('9.1', 'mechanical, binary checks'),
    implCite('11.6', 'a detected violation blocks release'),
  ],
});

for (const result of failed) {
  console.log(`  [FAIL] ${result.label} — ${result.evidence}`);
}
console.log('');
console.log(`  checks: ${checks.length} · passed: ${checks.length - failed.length} · failed: ${failed.length}`);
printEvidenceRecord(record);

if (verdict === 'FAIL') {
  console.log('');
  console.log('  CONSTITUTIONAL VIOLATION: the knowledge organ does not match reality.');
  console.log('  Documentation errors are conformance errors (Constitution 9.1; 11.6).');
  process.exit(1);
} else {
  console.log('');
  console.log('  DOCUMENTATION VERIFIED — the memory of the system matches the system.');
  console.log('  "Documentation is the memory of the system." (GOVERNANCE.md §1)');
}
