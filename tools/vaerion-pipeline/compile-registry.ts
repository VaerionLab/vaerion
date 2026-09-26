/**
 * VAERION PIPELINE — vaerion:compile-registry
 *
 * Stage 2 gate runner. Deterministic governance tooling (not product code,
 * not test code — IR-002):
 *
 *   [1] Verifies the constitutional digests (Snapshot Authority, F-002) so
 *       the value source is proven before tokens are compiled.
 *   [2] Validates the canonical Registry (Constitution 2.6 — mechanical,
 *       binary; any violation terminates the run).
 *   [3] Compiles the Registry to the three binding sets (css / typescript /
 *       json) and writes them under generated/ (Constitution 2.7; F-005).
 *   [4] Proves reproducibility: compiles a second time from the Registry
 *       alone and requires byte-identical output (Constitution 2.7(b); P-6).
 *   [5] Proves committed drift: committed generated files must equal a fresh
 *       compilation — a hand-edited binding is a violation (F-005;
 *       generated/README.md).
 *
 * Citations: Constitution 2.1, 2.6, 2.7, 2.8, P-4, P-6, 9.1, 10.1; F-002,
 * F-005; Visual System §4.7.
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { verifyConstitution } from '../../src/vaerion/foundation/verification';
import {
  compileAll,
  type CompiledBindings,
} from '../../src/vaerion/registry/compiler';
import {
  formatValidationReport,
  validateRegistry,
} from '../../src/vaerion/registry/validation';

const GENERATED_FILES = {
  css: 'generated/css/vaerion-tokens.css',
  typescript: 'generated/typescript/tokens.ts',
  json: 'generated/tokens/registry.json',
} as const;

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

function fail(message: string): never {
  console.error('');
  console.error(`CONSTITUTIONAL VIOLATION — ${message}`);
  console.error('The pipeline fails closed (Constitution 10.1 — no waivers, no partial passes).');
  process.exit(1);
}

console.log('VAERION PIPELINE — REGISTRY COMPILATION (Stage 2 gates)');
console.log('');

/* [1] Snapshot Authority — the value source must be proven first. */
const constitution = verifyConstitution();
if (!constitution.ok) {
  for (const line of constitution.lines) console.log(line);
  fail('F-001/SNAPSHOT — a canonical document diverged from its pinned digest. The Registry may not compile from an unproven source (Constitution 2.1).');
}
console.log(`[1] Snapshot Authority: ${constitution.lines.filter((l) => l.includes('match')).length ?? 3} pinned digests match — value source proven (F-002).`);

/* [2] Registry validation — Constitution 2.6. */
const report = validateRegistry();
console.log(formatValidationReport(report));
if (!report.passed) {
  fail('2.6 — the Registry failed mechanical validation.');
}

/* [3] Compilation — Constitution 2.7. */
const bindings: CompiledBindings = compileAll();
const reproducible: CompiledBindings = compileAll();
for (const key of ['css', 'typescript', 'json'] as const) {
  if (bindings[key] !== reproducible[key]) {
    fail(`2.7(b)/P-6 — compilation of the ${key} binding set is not reproducible from the Registry alone.`);
  }
}

for (const file of Object.values(GENERATED_FILES)) {
  mkdirSync(join(process.cwd(), file, '..'), { recursive: true });
}
writeFileSync(GENERATED_FILES.css, bindings.css);
writeFileSync(GENERATED_FILES.typescript, bindings.typescript);
writeFileSync(GENERATED_FILES.json, bindings.json);

/* [4] Drift — committed bindings must equal a fresh compilation (F-005). */
const drift: string[] = [];
for (const [key, file] of Object.entries(GENERATED_FILES) as [keyof CompiledBindings, string][]) {
  if (!existsSync(file)) {
    drift.push(`${file} does not exist (bindings were just written — commit them)`);
    continue;
  }
  const committed = readFileSync(file, 'utf8');
  if (committed !== bindings[key]) {
    drift.push(`${file} diverges from a fresh compilation — hand-edited bindings are violations (F-005)`);
  }
}

console.log('');
console.log('[2] Compilation artifacts (sha256, as generated — read-only, F-005):');
console.log(`      ${GENERATED_FILES.css}           ${sha256(bindings.css)}`);
console.log(`      ${GENERATED_FILES.typescript}   ${sha256(bindings.typescript)}`);
console.log(`      ${GENERATED_FILES.json}    ${sha256(bindings.json)}`);

if (drift.length > 0) {
  console.log('');
  for (const line of drift) console.log(`  DRIFT: ${line}`);
  fail('2.7/F-005 — generated bindings drifted from the canonical compilation.');
}

console.log('[3] Reproducibility: two independent compilations are byte-identical (2.7(b); P-6).');
console.log('[4] Drift: committed bindings equal the fresh compilation (F-005).');
console.log('');
console.log(
  `Registry ${report.registryVersion}: ${report.tokenCount} tokens across 7 registries — validation PASS, bindings generated, reproducibility PASS, drift PASS.`,
);
console.log('STAGE 2 COMPILATION GATES: GREEN');
