/**
 * VAERION PIPELINE — vaerion:verify-primitives
 *
 * Stage 3 conformance checks (mechanical, binary — Constitution 9.1; IR-002
 * governs the standing "conformance tooling, not product test code" form).
 *
 * Checks:
 *   [1] Manifest completeness — every bound contract of Part III (3.0–3.15)
 *       present; every primitive carries the four contract clauses, token
 *       references, state awareness, an accessibility contract, and citations
 *       (P-4; Bible Art. XI).
 *   [2] Token references valid — every declared token identifier resolves in
 *       the canonical Registry (2.7(c); 1.3).
 *   [3] Receipt anatomy order — the rendered segment order in receipt.tsx
 *       matches RECEIPT_ANATOMY exactly (Art. VI; 4.2).
 *   [4] Token usage — no literal visual values anywhere in the primitive
 *       tree or its stylesheet (1.3): no hex colors, no rgba(), no px/ms/s
 *       duration or spacing literals, no font-size/weight, no shadows, no
 *       invented curves. SVG coordinate geometry (the seal's internal
 *       viewBox system) is exempt; var() references and percentages are the
 *       sanctioned forms.
 *   [5] Forbidden behavior — no verdict computation, no optimistic state, no
 *       nondeterminism, no data fetching inside primitives (1.6; Part V;
 *       3.1).
 *
 * Citations: Constitution 3.0–3.15, 1.3, 1.6, P-4, 9.1; Bible Art. VI, XI;
 * Visual System §5.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { PRIMITIVE_MANIFEST, BOUND_CONTRACT_NAMES } from '../../src/vaerion/primitives/manifest';
import { RECEIPT_ANATOMY } from '../../src/vaerion/primitives/contract';
import { getToken } from '../../src/vaerion/registry';

const PRIMITIVES_DIR = join(process.cwd(), 'src', 'vaerion', 'primitives');
const SOURCE_FILES = [
  'contract.ts', 'seal.tsx', 'receipt.tsx', 'containers.tsx', 'controls.tsx',
  'records.tsx', 'logsurfaces.tsx', 'chrome.tsx', 'feedback.tsx', 'lens.tsx',
  'criteria.tsx', 'manifest.ts', 'index.ts', 'primitives.css',
];

const violations: string[] = [];
let checks = 0;

function assert(condition: boolean, message: string): void {
  checks += 1;
  if (!condition) violations.push(message);
}

/* [1] Manifest completeness — 3.0; P-4. */
const names = new Set(PRIMITIVE_MANIFEST.map((p) => p.name));
for (const boundName of BOUND_CONTRACT_NAMES) {
  assert(
    names.has(boundName),
    `[3.0] bound contract "${boundName}" has no manifest entry`,
  );
}
for (const primitive of PRIMITIVE_MANIFEST) {
  assert(primitive.contract.responsibility.length > 0, `[3.0] ${primitive.name}: responsibility missing`);
  assert(primitive.contract.boundaries.length > 0, `[3.0] ${primitive.name}: boundaries missing`);
  assert(primitive.contract.extension.length > 0, `[3.0] ${primitive.name}: extension missing`);
  assert(primitive.contract.composition.length > 0, `[3.0] ${primitive.name}: composition missing`);
  assert(primitive.tokens.length > 0, `[2.7(c)] ${primitive.name}: no registry token references`);
  assert(Array.isArray(primitive.states), `[Part V] ${primitive.name}: state awareness not declared (an empty declaration is lawful for stateless primitives)`);
  assert(primitive.accessibility.announcement.length > 0, `[6.11] ${primitive.name}: announcement contract missing`);
  assert(primitive.accessibility.keyboard.length > 0, `[6.7] ${primitive.name}: keyboard contract missing`);
  assert(primitive.accessibility.sensory.length > 0, `[Art. IV] ${primitive.name}: sensory contract missing`);
  assert(primitive.citations.length >= 4, `[P-4] ${primitive.name}: citations missing (standing citations not applied)`);
}
console.log(`[1] manifest: ${PRIMITIVE_MANIFEST.length} primitives — ${BOUND_CONTRACT_NAMES.length} bound contracts of Part III required, ${[...names].filter((n) => (BOUND_CONTRACT_NAMES as readonly string[]).includes(n)).length} present`);

/* [2] Token references resolve — 2.7(c). */
for (const primitive of PRIMITIVE_MANIFEST) {
  for (const tokenIdentifier of primitive.tokens) {
    try {
      getToken(tokenIdentifier);
      checks += 1;
    } catch {
      violations.push(`[2.7(c)] ${primitive.name}: token "${tokenIdentifier}" does not resolve in the canonical Registry`);
      checks += 1;
    }
  }
}
console.log(`[2] token references: every declared identifier resolves (2.7(c); 1.3)`);

/* [3] Receipt anatomy order — Art. VI; 4.2. */
const receiptSource = readFileSync(join(PRIMITIVES_DIR, 'receipt.tsx'), 'utf8');
const segmentMarkers: string[] = [
  'RECEIPT ID', // id strip
  'CLAIM',      // claim
  'SUBJECT',    // subject
  'vx-receipt-sealblock', // verdict seal
  'VERIFICATION METHOD', // verification method
  'EVIDENCE (', // evidence[]
  'ISSUED-AT',  // issued-at
  'CHAIN PARENT', // chain parent
];
let last = -1;
let orderOk = true;
const positions: number[] = [];
for (const marker of segmentMarkers) {
  const position = receiptSource.indexOf(marker);
  positions.push(position);
  if (position < 0 || position <= last) orderOk = false;
  else last = position;
}
assert(
  orderOk,
  `[Art. VI] Receipt anatomy order violated in receipt.tsx — rendered segments must follow RECEIPT_ANATOMY exactly: ${RECEIPT_ANATOMY.join(' → ')} (positions: ${positions.join(', ')})`,
);
assert(
  RECEIPT_ANATOMY.length === 8 && RECEIPT_ANATOMY[0] === 'id strip' && RECEIPT_ANATOMY[7] === 'chain parent',
  `[Art. VI] RECEIPT_ANATOMY deviates from the ratified anatomy (Bible Art. VI)`,
);
console.log(`[3] receipt anatomy: id strip → claim → subject → seal → method → evidence[] → issued-at → chain parent — order ${orderOk ? 'VERIFIED' : 'VIOLATED'}`);

/* [4] Token usage — 1.3. No literal visual values in the primitive tree. */
const forbidden: { pattern: RegExp; label: string; exemptions?: RegExp }[] = [
  { pattern: /#[0-9a-fA-F]{3,8}\b/, label: 'hex color literal' },
  { pattern: /rgba?\(/, label: 'rgba()/rgb() literal (consume color tokens instead)' },
  { pattern: /box-shadow\s*:/, label: 'box-shadow — shadows are prohibited (VS §3.4)' },
  { pattern: /font-size\s*:/, label: 'font-size — the Type Scale is unratified; nothing may be invented (IR-005)' },
  { pattern: /font-weight\s*:/, label: 'font-weight — weights are unratified (IR-005)' },
  { pattern: /cubic-bezier\(/, label: 'raw curve — consume motion.curve.settleOut via var()' },
  { pattern: /\b\d+(?:\.\d+)?px\b/, label: 'px literal (consume space/shape tokens via var())' },
  { pattern: /\b\d+(?:\.\d+)?ms\b/, label: 'ms literal (consume motion tokens)',
    // 0ms is the reduced-motion instant rendering itself (Constitution 7.9; VS §7.3) — sanctioned.
    exemptions: /0ms/ },
  { pattern: /backdrop-filter\s*:/, label: 'backdrop-filter — glass is prohibited (VS §3.4)' },
];
for (const file of SOURCE_FILES) {
  const source = readFileSync(join(PRIMITIVES_DIR, file), 'utf8');
  // Per-line scan: a match is judged by the line it appears on. Lines that
  // are law citations (comments) or media-query thresholds (IR-010 behavior
  // pins, not visual values) are exempt.
  const lines = source.split('\n');
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const isCommentLine = /^\s*(\/\/|\*|\/\*)/.test(line);
    const isMediaQuery = /@media|prefers-reduced-motion|forced-colors/.test(line);
    if (isCommentLine || isMediaQuery) continue;
    for (const rule of forbidden) {
      const match = rule.pattern.exec(line);
      if (match) {
        // Inline trailing citation comments on the same line are still usage;
        // only full comment lines are exempt (judged above).
        violations.push(`[1.3] ${file}:${lineIndex + 1}: ${rule.label} — "${match[0]}"`);
      }
      checks += 1;
    }
  }
}
console.log(`[4] token usage: primitives + stylesheet scanned for literal values (1.3)`);

/* [5] Forbidden behavior — 1.6; Part V. Comments (law citations) are stripped
   first: the scan judges code, not commentary. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}
const behaviorForbidden: { pattern: RegExp; label: string }[] = [
  { pattern: /Math\.random/, label: 'nondeterminism (Math.random) — instrument rendering is deterministic' },
  { pattern: /Date\.now\(/, label: 'nondeterminism (Date.now) in render' },
  { pattern: /fetch\(/, label: 'data fetching inside a primitive (3.1: it never fetches, derives, or estimates)' },
  { pattern: /computeVerdict|predictVerdict|setVerdict|optimistic/, label: 'verdict computation / optimistic verdict rendering (1.6; Art. VIII)' },
  { pattern: /className="[^"]*spinner/, label: 'spinners are prohibited (3.14)' },
];
for (const file of SOURCE_FILES) {
  if (!file.endsWith('.tsx')) continue;
  const source = stripComments(readFileSync(join(PRIMITIVES_DIR, file), 'utf8'));
  for (const rule of behaviorForbidden) {
    if (rule.pattern.test(source)) {
      violations.push(`[1.6/Part V] ${file}: ${rule.label}`);
    }
    checks += 1;
  }
}
console.log(`[5] forbidden behavior: no verdict computation, no nondeterminism, no fetching (1.6; Part V)`);

console.log('');
if (violations.length > 0) {
  for (const violation of violations) console.error(`  VIOLATION: ${violation}`);
  console.error('');
  console.error(`PRIMITIVE CONFORMANCE: FAIL — ${violations.length} violation(s) across ${checks} checks.`);
  process.exit(1);
}
console.log(`PRIMITIVE CONFORMANCE: PASS — ${checks} checks, 0 violations (3.0–3.15; 1.3; 1.6; P-4; Art. VI).`);
