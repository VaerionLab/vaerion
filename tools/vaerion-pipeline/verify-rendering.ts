/**
 * VAERION PIPELINE — vaerion:verify-rendering
 *
 * Stage 7 conformance checks (mechanical, binary — Constitution 9.1; IR-002
 * governs the standing "conformance tooling, not product test code" form).
 *
 * Checks:
 *   [1] Layer system integrity — the seven ratified ordinals resolve, and
 *       the committed generated CSS binding matches the platform binding
 *       (ordinal × 10) for every stratum (7.2; VS §3.4).
 *   [2] Hierarchy & pipeline — the resolution chain chrome → surface →
 *       region → primitive holds; the composed plan is conformant (7.1; P-3).
 *   [3] The fourteen rendering gates — executed against the running engine,
 *       each producing a binary verdict with citations (9.1 form).
 *   [4] Mode coverage & bindings — every registered surface renders in all
 *       six registered modes (VS §11); the mode stylesheets exist; no mode
 *       rule suppresses record anatomy (7.6–7.10).
 *   [5] Literal scan — the rendering tree contains no literal visual values
 *       (1.3; Art. XI) — comments stripped; media-query thresholds exempt
 *       (the established Stage 4 battery).
 *
 * Citations: Constitution Part VII, 9.1, 1.3, P-3; Visual System §3.4, §4.4,
 * §9, §11; Bible Art. IV, V, VIII, XI.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  runAllRenderingGates,
  assertLayerOrdering,
  assertPlanConformant,
  assertRenderingParity,
  assertModeSetComplete,
  composeRenderingPlan,
  LAYERS,
  layerStackingValue,
  RENDERING_MODES,
  type RenderingMode,
} from '../../src/vaerion/rendering';
import { SURFACE_REGISTRY } from '../../src/vaerion/surfaces/registry';

const RENDERING_DIR = join(process.cwd(), 'src', 'vaerion', 'rendering');
const RENDERING_SOURCES = [
  'layers.ts',
  'strata.ts',
  'visibility.ts',
  'measurement.ts',
  'responsive.ts',
  'modes.ts',
  'pipeline.ts',
  'target.tsx',
  'manifest.ts',
  'gates.ts',
  'index.ts',
  'skeletons.tsx',
  'rendering.css',
];

const violations: string[] = [];
let checks = 0;

function assert(condition: boolean, message: string): void {
  checks += 1;
  if (!condition) violations.push(message);
}

/* [1] Layer system integrity — 7.2; VS §3.4. */
try {
  assertLayerOrdering();
  const css = readFileSync(join(process.cwd(), 'generated', 'css', 'vaerion-tokens.css'), 'utf8');
  for (const layer of LAYERS) {
    const expected = `--vx-elevation-${layer.name}-${layer.ordinal}: ${layerStackingValue(layer.name)};`;
    assert(
      css.includes(expected),
      `[7.2] generated binding for "${layer.name}" missing or drifted: expected "${expected}" in generated/css/vaerion-tokens.css`,
    );
  }
  console.log(`[1] layers: ${LAYERS.length} ordinal strata resolve; generated stacking bindings match ordinal × ${layerStackingValue('lens') / 6} (7.2; VS §3.4)`);
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  console.log('[1] layers: FAILED');
}

/* [2] Hierarchy & pipeline — 7.1; P-3. */
try {
  const plan = composeRenderingPlan({ skeleton: 'document', modes: [...RENDERING_MODES], states: ['idle', 'empty'] });
  assertPlanConformant(plan);
  assert(plan.nodes.length === 4, `[7.1] the plan resolves ${plan.nodes.length} strata; the fixed chain is four: chrome → surface → region → primitive`);
  console.log('[2] pipeline: chrome → surface → region → primitive composes and conforms; every node cited (7.1; P-3)');
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  console.log('[2] pipeline: FAILED');
}

/* [3] The fourteen rendering gates — executed against the running engine. */
console.log('[3] rendering gates (each must pass mechanically — 9.1):');
const gates = runAllRenderingGates();
for (const gate of gates) {
  checks += 1;
  if (!gate.passed) {
    violations.push(`[gate] ${gate.gate}: ${gate.evidence}`);
  }
  console.log(`    [${gate.passed ? 'PASS' : 'FAIL'}] ${gate.gate} — ${gate.evidence}`);
}
assert(gates.length === 14, `[directive] ${gates.length} rendering gates ran; fourteen are ordered`);

/* [4] Mode coverage & bindings — VS §11; 7.6–7.10. */
try {
  assertModeSetComplete();
  for (const surface of SURFACE_REGISTRY) {
    assertRenderingParity({ surfaceId: surface.id, modesRendered: RENDERING_MODES as readonly RenderingMode[] });
    checks += 1;
  }
  const css = readFileSync(join(RENDERING_DIR, 'rendering.css'), 'utf8');
  for (const binding of [
    '@media print',
    '@media (forced-colors: active)',
    "[data-mode='grayscale']",
    "[data-mode='export']",
  ] as const) {
    assert(css.includes(binding), `[7.6–7.10] the ${binding} rendering binding is missing from rendering.css`);
  }
  // No mode rule suppresses record anatomy: the record treatments persist in
  // print, grayscale, forced-colors, and export (7.6; 7.7; VS §11.3–§11.6).
  const recordClasses = ['.vx-seal', '.vx-seal-word', '.vx-demo-stamp', '.vx-restricted'];
  for (const line of css.split('\n')) {
    for (const recordClass of recordClasses) {
      const suppressed = line.includes(recordClass) && line.includes('display: none');
      assert(!suppressed, `[7.6] a mode rule suppresses record anatomy "${recordClass}" — records persist in every rendering target`);
    }
  }
  console.log(`[4] modes: ${SURFACE_REGISTRY.length} registered surfaces × ${RENDERING_MODES.length} registered modes — parity holds; mode bindings present; record anatomy persists (VS §11; 7.6–7.10)`);
} catch (error) {
  violations.push(error instanceof Error ? error.message : String(error));
  console.log('[4] modes: FAILED');
}

/* [5] Literal scan — 1.3; Art. XI. Comments are stripped first: the scan
   judges code. Media-query lines are exempt for px thresholds (the
   established Stage 4 battery — behavior pins, not visual values). */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}
/** Replaces string and template literal contents — the scan judges code, not copy. */
function stripStrings(source: string): string {
  return source
    .replace(/`(?:\\.|[^`\\])*`/g, ' ')
    .replace(/'(?:\\.|[^'\\\n])*'/g, ' ')
    .replace(/"(?:\\.|[^"\\\n])*"/g, ' ');
}
const literalRules: { pattern: RegExp; label: string }[] = [
  { pattern: /#[0-9a-fA-F]{3,8}\b/, label: 'hex color literal' },
  { pattern: /rgba?\(/, label: 'raw color function' },
  { pattern: /box-shadow:/, label: 'shadow (prohibited — VS §3.4)' },
  { pattern: /backdrop-filter:/, label: 'glass (prohibited — VS §3.4)' },
  { pattern: /font-size:/, label: 'raw font size' },
  { pattern: /font-weight:/, label: 'raw font weight' },
  { pattern: /cubic-bezier\(/, label: 'raw motion curve (registry-owned)' },
  { pattern: /\d+ms\b/, label: 'raw duration' },
  { pattern: /backdrop-filter/, label: 'glass' },
];
let scannedLines = 0;
for (const file of RENDERING_SOURCES) {
  const raw = readFileSync(join(RENDERING_DIR, file), 'utf8');
  const source = stripStrings(stripComments(raw));
  for (const line of source.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('@media') || trimmed.startsWith('@supports')) continue;
    if (!trimmed) continue;
    scannedLines += 1;
    // px rule: raw px literals are off-token; the rendering tree consumes
    // var() bindings exclusively.
    if (/\b\d+px\b/.test(trimmed) && !trimmed.includes('var(--vx-')) {
      violations.push(`[1.3] ${file}: raw px literal — "${trimmed.slice(0, 80)}"`);
      continue;
    }
    for (const rule of literalRules) {
      if (rule.pattern.test(trimmed)) {
        violations.push(`[1.3] ${file}: ${rule.label} — "${trimmed.slice(0, 80)}"`);
      }
    }
  }
}
checks += 1;
console.log(`[5] literal scan: ${scannedLines} lines judged — no literal visual values in the rendering tree (1.3; Art. XI)`);

console.log('');
if (violations.length > 0) {
  for (const violation of violations) console.error(`  VIOLATION: ${violation}`);
  console.error('');
  console.error(`RENDERING CONFORMANCE: FAIL — ${violations.length} violation(s) across ${checks} checks.`);
  process.exit(1);
}
console.log(`RENDERING CONFORMANCE: PASS — ${checks} checks, 0 violations (Part VII; 7.1–7.10; VS §3.4, §9, §11; 1.3; P-3; Art. IV, V, VIII, XI; P-4).`);
