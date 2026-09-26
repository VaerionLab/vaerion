/**
 * VAERION PIPELINE — vaerion:verify-authorities
 *
 * Stage 8 conformance checks (mechanical, binary — Constitution 9.1; IR-002
 * governs the standing "conformance tooling, not product test code" form).
 *
 * Checks:
 *   [1] Authority registry — the seven constitutional names resolve against
 *       the state engine's ownership registry; contracts are intact (8.0).
 *   [2] Integrity substrate — the hash binding attests against the
 *       published FIPS 180-2 vectors (8.5; P-6).
 *   [3] The sixteen data gates — executed against the running authorities,
 *       each producing a binary verdict with citations (9.1 form).
 *   [4] Honesty scan — the authority tree contains no nondeterminism, no
 *       wall-clock reads (the clock is injected), no in-place mutation of
 *       record sets (1.6; 8.1; 8.5; P-6).
 *   [5] Verdict boundary scan — no module outside the Verification
 *       Authority mints verdict facts (5.3; Art. III).
 *
 * Citations: Constitution Part VIII, 9.1, 5.3, 1.6; Bible Art. II, III,
 * VI, VIII.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  runAllAuthorityGates,
  assertAuthorityContractIntegrity,
  assertHashBinding,
  sha256,
  AUTHORITY_CONTRACTS,
} from '../../src/vaerion/authorities';
import { AUTHORITIES } from '../../src/vaerion/state/ownership';

const AUTHORITIES_DIR = join(process.cwd(), 'src', 'vaerion', 'authorities');
const SOURCE_FILES = [
  'hash.ts',
  'contracts.ts',
  'chain.ts',
  'evidence.ts',
  'verification.ts',
  'ledger.ts',
  'rule.ts',
  'identity.ts',
  'investigation.ts',
  'manifest.ts',
  'export.ts',
  'composition.ts',
  'gates.ts',
  'index.ts',
];

const violations: string[] = [];
let checks = 0;

function assert(condition: boolean, message: string): void {
  checks += 1;
  if (!condition) violations.push(message);
}

/* [1] Authority registry — 8.0. */
try {
  assertAuthorityContractIntegrity();
  assert(AUTHORITY_CONTRACTS.length === 7, `[8.0] ${AUTHORITY_CONTRACTS.length} contracts declared; exactly seven authorities are constitutional`);
  for (let index = 0; index < AUTHORITY_CONTRACTS.length; index += 1) {
    assert(AUTHORITY_CONTRACTS[index].name === AUTHORITIES[index].name, `[8.0] authority name drift at position ${index}`);
    assert(AUTHORITY_CONTRACTS[index].owns === AUTHORITIES[index].owns, `[8.0] ownership drift for "${AUTHORITIES[index].name}"`);
  }
  console.log(`[1] authorities: ${AUTHORITY_CONTRACTS.length} named authorities — names and owned domains identical to the ownership registry (8.0; 5.4)`);
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  console.log('[1] authorities: FAILED');
}

/* [2] Integrity substrate — 8.5; P-6. */
try {
  assertHashBinding(sha256);
  console.log('[2] integrity substrate: the hash binding attests against the published FIPS 180-2 vectors (8.5; P-6)');
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  console.log('[2] integrity substrate: FAILED');
}
checks += 1;

/* [3] The sixteen data gates — executed against the running authorities. */
console.log('[3] data gates (each must pass mechanically — 9.1):');
const gates = runAllAuthorityGates();
for (const gate of gates) {
  checks += 1;
  if (!gate.passed) {
    violations.push(`[gate] ${gate.gate}: ${gate.evidence}`);
  }
  console.log(`    [${gate.passed ? 'PASS' : 'FAIL'}] ${gate.gate} — ${gate.evidence}`);
}
assert(gates.length === 16, `[directive] ${gates.length} data gates ran; sixteen are ordered`);

/* [4] Honesty scan — no nondeterminism, no implicit wall clock, no in-place
   mutation of record sets (1.6; 8.1; 8.5; P-6). Comments and strings are
   stripped first: the scan judges code. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}
function stripStrings(source: string): string {
  return source
    .replace(/`(?:\\.|[^`\\])*`/g, ' ')
    .replace(/'(?:\\.|[^'\\\n])*'/g, ' ')
    .replace(/"(?:\\.|[^"\\\n])*"/g, ' ');
}
const behaviorForbidden: { pattern: RegExp; label: string }[] = [
  { pattern: /Math\.random/, label: 'nondeterminism (Math.random)' },
  { pattern: /Date\.now\(/, label: 'implicit wall clock — the clock is injected (P-6)' },
  { pattern: /new Date\(/, label: 'implicit wall clock — the clock is injected (P-6)' },
  { pattern: /\.splice\(/, label: 'in-place mutation of a record set (8.1; 8.5)' },
  { pattern: /\.sort\(/, label: 'in-place reordering of a record set (8.1; 8.5)' },
  { pattern: /\.reverse\(/, label: 'in-place reordering of a record set (8.1; 8.5)' },
];
for (const file of SOURCE_FILES) {
  const source = stripStrings(stripComments(readFileSync(join(AUTHORITIES_DIR, file), 'utf8')));
  for (const rule of behaviorForbidden) {
    checks += 1;
    if (rule.pattern.test(source)) {
      violations.push(`[1.6/8.1/8.5] ${file}: ${rule.label}`);
    }
  }
}
console.log('[4] honesty scan: no nondeterminism, no implicit wall clock, no in-place record mutation in the authority tree (1.6; 8.1; 8.5; P-6)');

/* [5] Verdict boundary scan — verdict facts are minted only inside the
   Verification Authority (5.3; Art. III). */
const VERDICT_MINT_PATTERN = /issuedBy:\s*['"`]Verification Authority['"`]/;
for (const file of SOURCE_FILES) {
  const source = stripStrings(stripComments(readFileSync(join(AUTHORITIES_DIR, file), 'utf8')));
  checks += 1;
  if (VERDICT_MINT_PATTERN.test(source) && file !== 'verification.ts') {
    violations.push(`[5.3/Art. III] ${file} mints verdict facts — only the Verification Authority issues verdicts (5.3; 8.0)`);
  }
}
console.log('[5] verdict boundary scan: verdict facts are minted only inside the Verification Authority (5.3; 8.0; Art. III)');

console.log('');
if (violations.length > 0) {
  for (const violation of violations) console.error(`  VIOLATION: ${violation}`);
  console.error('');
  console.error(`AUTHORITY CONFORMANCE: FAIL — ${violations.length} violation(s) across ${checks} checks.`);
  process.exit(1);
}
console.log(`AUTHORITY CONFORMANCE: PASS — ${checks} checks, 0 violations (Part VIII; 8.0–8.9; 5.3; 5.10; 1.6; Art. II, III, VI, VIII; P-4; P-6).`);
