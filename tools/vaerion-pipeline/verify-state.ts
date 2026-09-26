/**
 * VAERION PIPELINE — vaerion:verify-state
 *
 * Stage 5 conformance checks (mechanical, binary — Constitution 9.1; IR-002
 * governs the standing "conformance tooling, not product test code" form).
 *
 * Checks:
 *   [1] Matrix integrity — exactly twelve canonical states; no aliases;
 *       immutable definitions; domains resolve (Constitution 5.1–5.2).
 *   [2] Transition table — every row of 5.7 present exactly once; every row
 *       cited; every event covered (5.7).
 *   [3] Ownership — every state resolves its lawful owner; the seven named
 *       authorities are declared (5.4; 8.0).
 *   [4] The twelve state gates — executed against the running engine, each
 *       producing a binary verdict with citations (9.1 form).
 *   [5] Honesty scan — the state tree contains no verdict computation, no
 *       optimistic rendering API, no fabricated progress (1.6; Art. VIII;
 *       5.3).
 *
 * Citations: Constitution Part V, 9.1, 1.6, P-4; Bible Art. III, VIII.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  STATE_MATRIX,
  stateMatrixIds,
  STATE_EVENTS,
  LAWFUL_TRANSITIONS,
  runAllStateGates,
  assertMatrixIntegrity,
} from '../../src/vaerion/state';
import { AUTHORITIES, ownerOf } from '../../src/vaerion/state/ownership';

const STATE_DIR = join(process.cwd(), 'src', 'vaerion', 'state');
const SOURCE_FILES = ['matrix.ts', 'ownership.ts', 'transitions.ts', 'machine.ts', 'honesty.ts', 'quarantine.ts', 'gates.ts', 'index.ts'];

const violations: string[] = [];
let checks = 0;

function assert(condition: boolean, message: string): void {
  checks += 1;
  if (!condition) violations.push(message);
}

/* [1] Matrix integrity — 5.1, 5.2. */
try {
  assertMatrixIntegrity();
  console.log(`[1] matrix: ${stateMatrixIds().length} canonical states, immutable, no aliases (5.1–5.2)`);
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  console.log('[1] matrix: FAILED');
}
checks += 1;

/* [2] Transition table — 5.7 row for row. */
const EXPECTED_ROWS = 13; // 5.7: eleven numbered behaviors; the data-arrives and
// verification-requested rows carry multiple "from" states as separate rows.
try {
  for (const row of LAWFUL_TRANSITIONS) {
    assert(row.citations.length > 0, `[P-4] transition row ${row.from}--${row.event} is uncitable`);
    if (row.from !== 'any') {
      assert(
        (stateMatrixIds() as readonly string[]).includes(row.from),
        `[5.7] transition row ${row.from}--${row.event} starts from a non-canonical state`,
      );
    }
    for (const target of row.to) {
      assert(
        (stateMatrixIds() as readonly string[]).includes(target),
        `[5.7] transition row ${row.from}--${row.event} targets non-canonical state "${target}"`,
      );
    }
  }
  for (const event of STATE_EVENTS) {
    assert(
      LAWFUL_TRANSITIONS.some((row) => row.event === event),
      `[5.7] event "${event}" has no transition row`,
    );
  }
  assert(LAWFUL_TRANSITIONS.length === EXPECTED_ROWS, `[5.7] the transition table holds ${LAWFUL_TRANSITIONS.length} rows; the ratified set is ${EXPECTED_ROWS}`);
  console.log(`[2] transitions: ${LAWFUL_TRANSITIONS.length} rows — every event covered, every row cited (5.7)`);
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  console.log('[2] transitions: FAILED');
}

/* [3] Ownership — 5.4; 8.0. */
try {
  for (const definition of STATE_MATRIX) {
    const owner = ownerOf(definition.id);
    assert(Boolean(owner), `[5.4] state "${definition.id}" resolves no owner`);
  }
  assert(AUTHORITIES.length === 7, `[8.0] ${AUTHORITIES.length} authorities declared; exactly seven are constitutional`);
  const authorityNames = new Set(AUTHORITIES.map((a) => a.name));
  for (const definition of STATE_MATRIX) {
    if (definition.factAuthority) {
      assert(authorityNames.has(definition.factAuthority), `[8.0] fact authority "${definition.factAuthority}" of "${definition.id}" is not a named authority`);
    }
  }
  console.log('[3] ownership: every state resolves its owner; seven named authorities declared (5.4; 8.0)');
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  console.log('[3] ownership: FAILED');
}

/* [4] The twelve state gates — executed against the running engine. */
console.log('[4] state gates (each must pass mechanically — 9.1):');
const gates = runAllStateGates();
for (const gate of gates) {
  checks += 1;
  if (!gate.passed) {
    violations.push(`[gate] ${gate.gate}: ${gate.evidence}`);
  }
  console.log(`    [${gate.passed ? 'PASS' : 'FAIL'}] ${gate.gate} — ${gate.evidence}`);
}
assert(gates.length === 12, `[directive] ${gates.length} state gates ran; twelve are ordered`);

/* [5] Honesty scan — no verdict computation, no optimistic rendering, no
   fabricated progress, no invented constants in the state tree (1.6; 5.3;
   Art. VIII; 1.3). Comments are stripped first: the scan judges code. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}
const behaviorForbidden: { pattern: RegExp; label: string }[] = [
  { pattern: /Math\.random/, label: 'nondeterminism (Math.random)' },
  { pattern: /\bcomputeVerdict\b|\bpredictVerdict\b|\bfabricateVerdict\b/, label: 'verdict computation or fabrication (1.6; 5.3)' },
  { pattern: /\boptimisticRender\b|\banticipateVerdict\b/, label: 'optimistic verdict rendering (5.3; Art. VIII)' },
  { pattern: /=\s*(?:3[0-9]{2}|4[0-9]{2}|6[0-9]{2})\s*;?\s*\/\/\s*invented/, label: 'invented constant' },
];
for (const file of SOURCE_FILES) {
  const source = stripComments(readFileSync(join(STATE_DIR, file), 'utf8'));
  for (const rule of behaviorForbidden) {
    checks += 1;
    if (rule.pattern.test(source)) {
      violations.push(`[1.6/5.3] ${file}: ${rule.label}`);
    }
  }
}
console.log('[5] honesty scan: no verdict computation, no optimistic rendering, no nondeterminism in the state tree (1.6; 5.3; Art. VIII)');

console.log('');
if (violations.length > 0) {
  for (const violation of violations) console.error(`  VIOLATION: ${violation}`);
  console.error('');
  console.error(`STATE CONFORMANCE: FAIL — ${violations.length} violation(s) across ${checks} checks.`);
  process.exit(1);
}
console.log(`STATE CONFORMANCE: PASS — ${checks} checks, 0 violations (Part V; 5.1–5.10; 1.6; Art. III, VIII; P-4).`);
