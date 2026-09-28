/**
 * Vaerion — Registry / Token Compiler
 *
 * Deterministic compilation: Registry → Generated Bindings. One binding set
 * per target platform; this compiler emits the css, typescript, and json
 * binding sets under generated/ (Foundation Amendment F-005).
 *
 * Citations:
 * - Implementation Constitution 2.7 (compilation and distribution —
 *   implementation necessity): bindings are generated, never hand-authored;
 *   regeneration must be reproducible from the Registry alone; a surface that
 *   consumes a value not present in its bindings is non-conformant; all
 *   binding sets generated from one Registry version must be semantically
 *   identical (P-6).
 * - Implementation Constitution 1.5 (binding to technology occurs exclusively
 *   in the generated layer), 7.2 (platforms bind layer ordinals to numeric
 *   stacking values).
 * - Foundation Amendment F-005 (generated root; never hand-authored).
 * - Visual System §4.1 (chambers compile as scoped registered sets).
 *
 * The compiler is PURE: it produces strings from the Registry alone — no fs,
 * no clock, no randomness. Byte-identical input (the same Registry version)
 * yields byte-identical output; the pipeline verifies this mechanically.
 *
 * No visual values may appear in this file beyond what the compiler reads
 * from the Registry. Citation: Constitution 1.3, 2.1.
 */

import { formatCitations } from '../foundation/citations';
import {
  allTokens,
  REGISTRIES,
  REGISTRY_VERSION,
  resolveFormula,
  type ChamberedValue,
  type RegistryDomain,
  type TokenRecord,
} from './index';
import { cssVarName } from './index';
import { isChambered, CHAMBERS, type Chamber } from './token';
import { LAYER_SYSTEM } from './scales';

const GENERATED_BANNER = [
  '/* ==========================================================================',
  '   VAERION GENERATED BINDINGS — DO NOT EDIT',
  '   ==========================================================================',
  '   This file is generated. It is never hand-authored (Constitution 2.7;',
  '   Foundation Amendment F-005). Any manual change is a violation and will',
  '   be detected by the reproducibility and drift checks:',
  '       bun run vaerion:compile-registry',
  '   Source: the canonical Registry (src/vaerion/registry), which compiles',
  '   values only from the ratified Visual System text (Constitution 2.1).',
  `   Registry version: ${REGISTRY_VERSION}`,
  '   ========================================================================== */',
].join('\n');


/** Resolves a token's value to its final CSS-declared form for a chamber. */
function resolveForCss(record: TokenRecord, chamber: Chamber): string {
  const value = record.value;
  if (isChambered(value)) return String(value[chamber]);
  if (typeof value === 'string' && value.includes('@') && value.includes('alpha')) {
    return resolveFormula(value, chamber);
  }
  if (typeof value === 'number') return String(value);
  // Voice tokens bind through the platform provision hook (next/font), with
  // the registered family stack as fallback — a binding-layer provision per
  // Constitution 2.7/1.5. Both provision variables are documented bindings.
  if (record.identifier === 'type.voice.machine') {
    return `var(--vx-provision-machine, 'Berkeley Mono'), 'Spline Sans Mono', monospace`;
  }
  if (record.identifier === 'type.voice.human') {
    return `var(--vx-provision-human, 'Instrument Sans'), 'Söhne', sans-serif`;
  }
  return value;
}

function cssDeclarations(
  records: readonly TokenRecord[],
  chamber: Chamber,
  indent: string,
): string[] {
  return records.map((record) => {
    const value = resolveForCss(record, chamber);
    const note = formatCitations(record.governingCitation);
    return `${indent}${cssVarName(record.identifier)}: ${value}; /* ${record.instrumentName} <- ${note} */`;
  });
}

/**
 * CSS binding: chamber-invariant tokens on :root; chambered tokens on the two
 * registered chamber scopes (VS §4.1 — a surface declares its chamber).
 * Elevation ordinals bind to stacking values z = ordinal × 10 (Constitution
 * 7.2 delegates numeric stacking to this binding layer; the ordinal itself
 * never changes and remains visible in the variable name).
 */
export function compileCss(): string {
  const lines: string[] = [];
  lines.push(GENERATED_BANNER);
  lines.push('');

  // Elevation is emitted first so the binding note precedes all tokens.
  lines.push(':root {');
  lines.push('  /* ── Elevation · the layer system (VS §3.4) · ordinals bound to stacking values (Constitution 7.2) ── */');
  for (const layer of LAYER_SYSTEM) {
    const identifier = `elevation.${layer.name}.${layer.ordinal}`;
    const varName = cssVarName(identifier);
    const zValue = layer.ordinal * 10;
    lines.push(`  ${varName}: ${zValue}; /* ordinal ${layer.ordinal} — shadows prohibited (VS §3.4) */`);
  }

  const chamberInvariantDomains: RegistryDomain[] = ['space', 'type', 'shape', 'motion', 'icon'];
  const sectionTitles: Record<RegistryDomain, string> = {
    space: 'Space · the Gauge Ladder and page architecture (VS §1)',
    type: 'Type · the two voices (VS §2)',
    shape: 'Shape · radii, hairlines, chain and seal geometry (VS §3)',
    color: 'Color · grounds, ink, verdict chromatics (VS §4)',
    motion: 'Motion · durations, curves, canonical motions (VS §7)',
    elevation: 'Elevation · the layer system (VS §3.4)',
    icon: 'Icon · stroke and sizes (VS §8)',
  };
  for (const domain of chamberInvariantDomains) {
    lines.push(`  /* ── ${sectionTitles[domain]} ── */`);
    lines.push(...cssDeclarations(REGISTRIES[domain], 'light', '  '));
  }
  lines.push('}');
  lines.push('');

  for (const chamber of CHAMBERS) {
    const label =
      chamber === 'light'
        ? 'the light chamber — the reading room (VS §4.1)'
        : 'the dark chamber — the war room (VS §4.1)';
    lines.push(`[data-chamber='${chamber}'] { /* ${label} */`);
    lines.push(...cssDeclarations(REGISTRIES.color, chamber, '  '));
    lines.push('}');
    lines.push('');
  }

  lines.push(
    "/* Reductions: prefers-reduced-motion receives complete informational parity —",
    '   every motion renders as an instant state change with full explainability',
    '   (VS §7.3; Bible Art. V). Enforcement lives with the consuming primitives. */',
  );
  return lines.join('\n');
}

/**
 * TypeScript binding: the platform binding for the React/TS target. Surfaces
 * and primitives bind ONLY to identifiers through these exports (Constitution
 * 2.3, 2.7(c)).
 */
export function compileTypescript(): string {
  const records = allTokens();
  const lines: string[] = [];
  lines.push(GENERATED_BANNER);
  lines.push('');
  lines.push('/** The Registry version these bindings were generated from (Constitution 2.8). */');
  lines.push(`export const VAERION_REGISTRY_VERSION = '${REGISTRY_VERSION}' as const;`);
  lines.push('');
  lines.push('/** Systematic identifier → CSS custom property (the binding contract). */');
  lines.push('export const VX = Object.freeze({');
  for (const record of records) {
    lines.push(`  '${record.identifier}': '${cssVarName(record.identifier)}',`);
  }
  lines.push('} as const);');
  lines.push('');
  lines.push('/** CSS var() reference for a token identifier. */');
  lines.push('export function vx(identifier: keyof typeof VX): string {');
  lines.push('  return `var(${VX[identifier]})`;');
  lines.push('}');
  lines.push('');
  lines.push('/** Resolved token values per registered chamber (VS §4.1). Generated, never hand-edited. */');
  for (const chamber of CHAMBERS) {
    lines.push(`export const VALUES_${chamber.toUpperCase()} = Object.freeze({`);
    for (const record of records) {
      const value = isChambered(record.value)
        ? String(record.value[chamber])
        : typeof record.value === 'string' && record.value.includes('@') && record.value.includes('alpha')
          ? resolveFormula(record.value, chamber)
          : String(record.value);
      lines.push(`  '${record.identifier}': '${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`);
    }
    lines.push('} as const);');
    lines.push('');
  }
  lines.push('/** Token records in serialized form — documentation and audit consumption (P-4). */');
  lines.push('export const TOKEN_RECORDS = Object.freeze([');
  for (const record of records) {
    const value = isChambered(record.value)
      ? `{ light: '${String((record.value as ChamberedValue).light)}', dark: '${String((record.value as ChamberedValue).dark)}' }`
      : `'${String(record.value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    const citations = formatCitations(record.governingCitation).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const constraints = record.constraints.map((c) => `'${c.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(', ');
    lines.push(`  { identifier: '${record.identifier}', instrumentName: '${record.instrumentName}', value: ${value}, constraints: [${constraints}], governingCitation: '${citations}', version: '${record.version}', status: '${record.status}' },`);
  }
  lines.push('] as const);');
  lines.push('');
  return lines.join('\n');
}

/** JSON binding: the platform-neutral interchange set (audit, third-party tooling). */
export function compileJson(): string {
  const payload = {
    registry: 'VAERION_CANONICAL_REGISTRY',
    registryVersion: REGISTRY_VERSION,
    generatedBy: 'canonical token compiler (Constitution 2.7)',
    valueSource: 'VAERION_VISUAL_SYSTEM_v1.0.1 §4.7 et al. (Constitution 2.1)',
    chambers: CHAMBERS,
    registries: (Object.keys(REGISTRIES) as RegistryDomain[]).map((domain) => ({
      domain,
      tokens: REGISTRIES[domain].map((record) => ({
        identifier: record.identifier,
        instrumentName: record.instrumentName,
        value: record.value,
        constraints: record.constraints,
        governingCitation: record.governingCitation.map((c) => formatCitations([c])),
        version: record.version,
        status: record.status,
      })),
    })),
  };
  return JSON.stringify(payload, null, 2);
}

export interface CompiledBindings {
  readonly css: string;
  readonly typescript: string;
  readonly json: string;
}

/** All binding sets from one Registry version — semantically identical outputs (P-6). */
export function compileAll(): CompiledBindings {
  return {
    css: compileCss(),
    typescript: compileTypescript(),
    json: compileJson(),
  };
}
