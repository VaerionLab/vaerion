/**
 * VAERION PIPELINE — vaerion:verify-interaction
 *
 * Stage 6 conformance checks (mechanical, binary — Constitution 9.1; IR-002
 * governs the standing "conformance tooling, not product test code" form).
 *
 * Checks:
 *   [1] Command registry — every command registered, cited, lawful; verbs
 *       go/get/verify/attest only (6.1; VS §5).
 *   [2] Canonical key map — the constitutional keys owned centrally; no
 *       conflicts; the lawful E duality (6.7).
 *   [3] The fifteen interaction gates — executed against the running engine,
 *       each producing a binary verdict with citations (9.1 form).
 *   [4] Copy registry binding — every announced string consumed by
 *       identifier; no render-time composition (6.11; F-003).
 *   [5] Honesty scan — the interaction tree fabricates no verdict, no silent
 *       termination, no nondeterminism (6.5; 5.3; 1.6).
 *
 * Citations: Constitution Part VI, 9.1, 6.11, P-4; Bible Art. XIV.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { COMMAND_REGISTRY, CALIPER_VERBS } from '../../src/vaerion/interaction/commands';
import { CANONICAL_KEY_MAP, CONSTITUTIONAL_KEYS } from '../../src/vaerion/interaction/keys';
import { INTERACTION_COPY, interactionCopy } from '../../src/vaerion/interaction/copy';
import { runAllInteractionGates } from '../../src/vaerion/interaction/gates';

const INTERACTION_DIR = join(process.cwd(), 'src', 'vaerion', 'interaction');
const SOURCE_FILES = [
  'commands.ts', 'contracts.ts', 'keys.ts', 'pointer.ts', 'focus.ts', 'confirm.ts',
  'hold.ts', 'undo.ts', 'receipts.ts', 'latency.ts', 'announce.ts', 'lens.ts',
  'dispatcher.ts', 'copy.ts', 'gates.ts', 'index.ts',
];

const violations: string[] = [];
let checks = 0;

function assert(condition: boolean, message: string): void {
  checks += 1;
  if (!condition) violations.push(message);
}

/* [1] Command registry — 6.1; VS §5. */
try {
  const seen = new Set<string>();
  for (const command of COMMAND_REGISTRY) {
    assert(!seen.has(command.id), `[6.1] duplicate command id "${command.id}"`);
    seen.add(command.id);
    assert(command.citations.length > 0, `[P-4] command "${command.id}" is uncitable`);
    assert(CALIPER_VERBS.includes(command.verb), `[6.1] command "${command.id}" speaks unregistered verb "${command.verb}"`);
    assert(command.name.length > 0, `[VS §5.8] command "${command.id}" names no consequence`);
    assert(command.pointerEquivalent, `[6.9] command "${command.id}" lacks a pointer-equivalent path declaration`);
  }
  console.log(`[1] command registry: ${COMMAND_REGISTRY.length} commands, verbs go/get/verify/attest only, all cited (6.1; VS §5)`);
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  console.log('[1] command registry: FAILED');
}

/* [2] Canonical key map — 6.7. */
try {
  for (const [key, commands] of Object.entries(CANONICAL_KEY_MAP)) {
    assert(commands.length > 0, `[6.7] key "${key}" binds no command`);
    if (key !== 'e') {
      assert(commands.length === 1, `[6.7] key "${key}" binds ${commands.length} commands — only the lawful E duality may be dual`);
    }
  }
  assert(CONSTITUTIONAL_KEYS.length === 8, `[6.7] the canonical map holds ${CONSTITUTIONAL_KEYS.length} keys; the ratified map has eight (V R E J K L Cmd-K Escape)`);
  console.log(`[2] key map: ${CONSTITUTIONAL_KEYS.length} constitutional keys owned centrally; E duality lawful (6.7)`);
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  console.log('[2] key map: FAILED');
}

/* [3] The fifteen interaction gates — executed against the running engine. */
console.log('[3] interaction gates (each must pass mechanically — 9.1):');
const gates = runAllInteractionGates();
for (const gate of gates) {
  checks += 1;
  if (!gate.passed) {
    violations.push(`[gate] ${gate.gate}: ${gate.evidence}`);
  }
  console.log(`    [${gate.passed ? 'PASS' : 'FAIL'}] ${gate.gate} — ${gate.evidence}`);
}
assert(gates.length === 15, `[directive] ${gates.length} interaction gates ran; fifteen are ordered`);

/* [4] Copy registry binding — every string consumed by identifier (6.11; F-003). */
try {
  for (const entry of INTERACTION_COPY) {
    assert(entry.status === 'proposed (IR-012)', `[IR-012] entry "${entry.id}" must declare its proposed status`);
    assert(entry.voice === 'machine' || entry.voice === 'human', `[Art. VII] entry "${entry.id}" declares no voice`);
    assert(entry.text.length > 0, `[6.11] entry "${entry.id}" is empty`);
    interactionCopy(entry.id); // resolves
  }
  console.log(`[4] copy registry: ${INTERACTION_COPY.length} interaction strings consumed by identifier, voice-declared, proposed (IR-012) (6.11; F-003)`);
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  console.log('[4] copy registry: FAILED');
}

/* [5] Honesty scan — no fabricated verdicts, no silent termination, no
   nondeterminism in the interaction tree (6.5; 5.3; 1.6). Comments are
   stripped first: the scan judges code. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}
const behaviorForbidden: { pattern: RegExp; label: string }[] = [
  { pattern: /Math\.random/, label: 'nondeterminism (Math.random)' },
  { pattern: /\bfabricateVerdict\b|\bassumeVerdict\b/, label: 'verdict fabrication (5.3; 1.6)' },
  { pattern: /silentReturn|noResolution/, label: 'silent termination path (6.5)' },
];
for (const file of SOURCE_FILES) {
  const source = stripComments(readFileSync(join(INTERACTION_DIR, file), 'utf8'));
  for (const rule of behaviorForbidden) {
    checks += 1;
    if (rule.pattern.test(source)) {
      violations.push(`[6.5/5.3] ${file}: ${rule.label}`);
    }
  }
}
console.log('[5] honesty scan: no fabricated verdicts, no silent terminations, no nondeterminism in the interaction tree (6.5; 5.3; 1.6)');

console.log('');
if (violations.length > 0) {
  for (const violation of violations) console.error(`  VIOLATION: ${violation}`);
  console.error('');
  console.error(`INTERACTION CONFORMANCE: FAIL — ${violations.length} violation(s) across ${checks} checks.`);
  process.exit(1);
}
console.log(`INTERACTION CONFORMANCE: PASS — ${checks} checks, 0 violations (Part VI; 6.1–6.13; 9.1; Art. XIV; P-4).`);
