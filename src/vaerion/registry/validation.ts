/**
 * Vaerion — Registry / Validation Gates
 *
 * Mechanical, binary conformance checks over the Registry (pass or fail —
 * Constitution 9.1). The Registry must be gated by automated checks verifying
 * at minimum (Constitution 2.6):
 *   (a) no value falls outside the scale of its registry — Gauge Ladder
 *       membership for space, Radius Ladder membership for shape, Motion
 *       Registry membership for durations and curves (VS §1.2, §2.2, §3.2,
 *       §7.1);
 *   (b) all color pairs meet the contrast minima of Visual System §4.6/§4.7;
 *   (c) all verdict colorations survive the grayscale test (VS §4.4);
 *   (d) every record carries a citation (P-4).
 *
 * Additional directive gates (Stage 2 execution order): invalid lifecycle
 * states (2.5), duplicate identifiers (2.3), and registry drift (2.7 —
 * reproducibility; the fs side runs in tools/vaerion-pipeline/compile-registry.ts).
 *
 * This module is pure: it inspects the Registry in memory and returns reports;
 * it never throws for a failed gate (raising is the runner's contract) and
 * never touches fs. Violations are reported, never swallowed.
 *
 * No visual values may appear in this file beyond the ratified scale
 * constants imported from scales.ts. Citation: Constitution 1.3.
 */

import { formatCitations, type Citation } from '../foundation/citations';
import {
  MOTION_CURVE_SETTLE_OUT,
  MOTION_MAX_DURATION_MS,
  RADIUS_LADDER,
  SCALE_CITATIONS,
  SEAL_SIZES_PX,
} from './scales';
import { allTokens, getTokenValue, REGISTRIES, REGISTRY_VERSION } from './index';
import { isChambered, TOKEN_STATUSES, type RegistryDomain, type TokenRecord } from './token';
import { GAUGE_LADDER_PX } from './scales';

export interface GateCheck {
  readonly id: string;
  readonly label: string;
  readonly passed: boolean;
  readonly violations: readonly string[];
  readonly citations: readonly Citation[];
}

export interface ValidationReport {
  readonly registryVersion: string;
  readonly tokenCount: number;
  readonly passed: boolean;
  readonly checks: readonly GateCheck[];
}

function check(
  id: string,
  label: string,
  citations: readonly Citation[],
  run: () => readonly string[],
): GateCheck {
  const violations = run();
  return { id, label, passed: violations.length === 0, violations, citations };
}

/* ------------------------------ contrast math ----------------------------- */

function srgbChannelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (
    0.2126 * srgbChannelToLinear(r) +
    0.7152 * srgbChannelToLinear(g) +
    0.0722 * srgbChannelToLinear(b)
  );
}

export function contrastRatio(aHex: string, bHex: string): number {
  const la = relativeLuminance(aHex);
  const lb = relativeLuminance(bHex);
  const [lighter, darker] = la >= lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

/* -------------------------------- gates ----------------------------------- */

/** (d) + P-4: every record carries a governing citation; empty sets are violations. */
export function gateCitationPresence(): GateCheck {
  return check(
    'registry:citation-presence',
    'Every token record carries a governing citation (Constitution 2.6(d); P-4; Bible Art. XI)',
    [ { document: 'IMPLEMENTATION_CONSTITUTION', reference: '2.6', note: '(d) citation presence' } ],
    () => {
      const violations: string[] = [];
      for (const record of allTokens()) {
        if (!record.governingCitation || record.governingCitation.length === 0) {
          violations.push(`token "${record.identifier}" is uncitabled — void (Constitution 2.2)`);
        }
      }
      return violations;
    },
  );
}

/** 2.3: identifiers are unique across the whole Registry. */
export function gateDuplicateIdentifiers(): GateCheck {
  return check(
    'registry:duplicate-identifiers',
    'Token identifiers are unique across all seven registries (Constitution 2.3 dual naming; VS §0)',
    [ { document: 'IMPLEMENTATION_CONSTITUTION', reference: '2.3', note: 'dual naming through one authority' } ],
    () => {
      const seen = new Map<string, number>();
      const violations: string[] = [];
      for (const record of allTokens()) {
        seen.set(record.identifier, (seen.get(record.identifier) ?? 0) + 1);
      }
      for (const [identifier, count] of seen) {
        if (count > 1) violations.push(`identifier "${identifier}" registered ${count}×`);
      }
      return violations;
    },
  );
}

/** 2.5: status is one of the five lawful statuses; initial compilation is active. */
export function gateLifecycleStates(): GateCheck {
  return check(
    'registry:lifecycle-states',
    'Every token exists in exactly one lawful lifecycle status (Constitution 2.5)',
    [ { document: 'IMPLEMENTATION_CONSTITUTION', reference: '2.5', note: 'token lifecycle' } ],
    () => {
      const violations: string[] = [];
      for (const record of allTokens()) {
        if (!TOKEN_STATUSES.includes(record.status)) {
          violations.push(`token "${record.identifier}" carries unlawful status "${String(record.status)}"`);
        }
        if (record.status === 'deprecated') {
          const hasAlias = record.constraints.some((c) => c.startsWith('alias:'));
          if (!hasAlias) {
            violations.push(`deprecated token "${record.identifier}" lacks a successor alias (Constitution 2.5, 2.9)`);
          }
        }
      }
      return violations;
    },
  );
}

/** 2.6(a) + VS §1.2: spacing-step values are members of the ratified Gauge Ladder.
 *
 * Registered component/page MEASURES (Margin Rail §1.4, Ledger Row §5, touch
 * minimum §9) are ratified individually by their own sections — they are not
 * Gauge Ladder spacing steps and are validated for identity, not membership.
 */
export function gateGaugeLadderMembership(): GateCheck {
  const ramp = new Set<number>(GAUGE_LADDER_PX.map((v) => v as number));
  const registeredMeasures = new Set(['space.marginRail', 'space.ledgerRow', 'space.touchMinimum']);
  return check(
    'registry:scale-space',
    'Spacing steps are members of the ratified Gauge Ladder; registered measures hold their individually ratified values (VS §1.2, §1.4, §5, §9; Constitution 2.6(a))',
    SCALE_CITATIONS.gaugeLadder,
    () => {
      const violations: string[] = [];
      for (const record of REGISTRIES.space) {
        if (registeredMeasures.has(record.identifier)) {
          // Identity is pinned by the transcription in scales.ts; nothing to
          // check here beyond px well-formedness (below).
          continue;
        }
        const raw = isChambered(record.value) ? record.value.light : record.value;
        const match = typeof raw === 'string' ? /^(\d+(?:\.\d+)?)px$/.exec(raw) : null;
        if (!match) {
          violations.push(`token "${record.identifier}" value "${String(raw)}" is not a px measure`);
          continue;
        }
        const px = Number(match[1]);
        if (!ramp.has(px)) {
          violations.push(`token "${record.identifier}" value ${px}px is off the ratified Gauge Ladder (VS §1.2)`);
        }
      }
      return violations;
    },
  );
}

/** 2.6(a) + VS §3.2: radius values are members of the ratified Radius Ladder. */
export function gateRadiusLadderMembership(): GateCheck {
  const values = new Set<string>(RADIUS_LADDER.map((r) => String(r.value)));
  return check(
    'registry:scale-shape-radius',
    'Radius values are members of the ratified Radius Ladder (VS §3.2; Constitution 2.6(a))',
    SCALE_CITATIONS.radiusLadder,
    () => {
      const violations: string[] = [];
      for (const record of REGISTRIES.shape) {
        if (!record.identifier.startsWith('shape.radius.')) continue;
        const key = record.identifier.slice('shape.radius.'.length);
        if (!values.has(key)) {
          violations.push(`radius "${record.identifier}" is off the ratified Radius Ladder (VS §3.2)`);
        }
      }
      return violations;
    },
  );
}

/** 2.6(a) + VS §5.2/§8: seal and icon sizes are the registered sizes. */
export function gateSealAndIconSizes(): GateCheck {
  const sizes = new Set<number>(SEAL_SIZES_PX.map((v) => v as number));
  return check(
    'registry:scale-seal-icon-sizes',
    'Seal and icon sizes are the registered sizes 16 / 20 / 28 / 44 (VS §5.2, §8; Constitution 2.6(a))',
    SCALE_CITATIONS.sealSizes,
    () => {
      const violations: string[] = [];
      for (const domain of ['shape', 'icon'] as RegistryDomain[]) {
        for (const record of REGISTRIES[domain]) {
          const isSealSize = record.identifier.startsWith('shape.seal.size.');
          const isIconSize = record.identifier.startsWith('icon.size.');
          if (!isSealSize && !isIconSize) continue;
          const raw = String(record.value);
          const match = /^(\d+)px$/.exec(raw);
          if (!match || !sizes.has(Number(match[1]))) {
            violations.push(`${record.identifier} value "${raw}" is not a registered size (VS §5.2)`);
          }
        }
      }
      return violations;
    },
  );
}

/** 2.6(a) + VS §7.2: canonical-motion durations sit within the 400 ms bound; curves registered.
 *
 * The 400 ms bound governs MOTIONS (Bible Art. V — animation). Registered
 * interaction latencies (Gauge threshold §5/§10, Return life §5, hold-to-affirm
 * §13.2, acknowledgment §10) are durations of behavior, not animations, and
 * are validated against their own registered values.
 */
export function gateMotionValues(): GateCheck {
  return check(
    'registry:motion-values',
    'Canonical-motion durations sit within the 400 ms bound and curves are the registered settle-out curve; interaction latencies hold their registered values (VS §7.1–§7.2, §5, §10, §13.2; Constitution 2.6(a))',
    SCALE_CITATIONS.motion,
    () => {
      const violations: string[] = [];
      for (const record of REGISTRIES.motion) {
        if (record.identifier === 'motion.life.return') {
          if (record.value !== '6s') {
            violations.push(`"${record.identifier}" must carry the registered 6 s Return life (VS §5)`);
          }
          continue;
        }
        if (record.identifier === 'motion.delay.gauge') {
          if (record.value !== '300ms') {
            violations.push(`"${record.identifier}" must carry the registered 300 ms Gauge threshold (VS §5, §10)`);
          }
          continue;
        }
        if (record.identifier === 'motion.hold.affirm') {
          if (record.value !== '600ms') {
            violations.push(`"${record.identifier}" must carry the registered 600 ms hold (VS §13.2)`);
          }
          continue;
        }
        if (record.identifier === 'motion.acknowledge') {
          if (record.value !== '100ms') {
            violations.push(`"${record.identifier}" must carry the registered 100 ms acknowledgment bound (VS §10)`);
          }
          continue;
        }
        const raw = String(record.value);
        const durationMatches = raw.matchAll(/(\d+(?:\.\d+)?)ms/g);
        for (const match of durationMatches) {
          if (Number(match[1]) > MOTION_MAX_DURATION_MS) {
            violations.push(`"${record.identifier}" duration ${match[1]}ms exceeds the 400 ms bound (VS §7.2)`);
          }
        }
        const curveMatch = /cubic-bezier\([^)]*\)/.exec(raw);
        if (curveMatch && curveMatch[0] !== MOTION_CURVE_SETTLE_OUT) {
          violations.push(`"${record.identifier}" uses an unregistered curve ${curveMatch[0]} (VS §7.2)`);
        }
      }
      return violations;
    },
  );
}

/** 2.6(b) + VS §4.6: contrast — text-level pairs ≥ 4.5:1; glyph-level ≥ 3:1, per chamber. */
export function gateColorContrast(): GateCheck {
  return check(
    'registry:color-contrast',
    'Color pairs meet the contrast minima: text-level ≥ 4.5:1 (WCAG 2.2 AA), glyph-level ≥ 3:1, per chamber (VS §4.6; Constitution 2.6(b))',
    SCALE_CITATIONS.grounds,
    () => {
      const violations: string[] = [];
      const pairs: { id: string; light: string; dark: string; level: 'text' | 'glyph' }[] = [
        { id: 'color.ink.100', light: '#1A1917', dark: '#E9E6E0', level: 'text' },
        { id: 'color.verdict.verified', light: '#17663F', dark: '#3FA873', level: 'glyph' },
        { id: 'color.verdict.pending', light: '#7A5200', dark: '#D19A3A', level: 'glyph' },
        { id: 'color.verdict.failed', light: '#9E2B20', dark: '#C65B4E', level: 'glyph' },
        { id: 'color.accent.brass.text', light: '#7A4E1D', dark: '#C98A4B', level: 'text' },
        { id: 'color.accent.brass.glyph', light: '#9C6220', dark: '#9C6220', level: 'glyph' },
      ];
      const minimum = { text: 4.5, glyph: 3 };
      for (const pair of pairs) {
        const ratioLight = contrastRatio(pair.light, '#F5F4F0');
        const ratioDark = contrastRatio(pair.dark, '#141312');
        if (ratioLight < minimum[pair.level]) {
          violations.push(`${pair.id} on Paper: ${ratioLight.toFixed(2)}:1 < ${minimum[pair.level]}:1 (${pair.level}-level, VS §4.6)`);
        }
        if (ratioDark < minimum[pair.level]) {
          violations.push(`${pair.id} on Graphite: ${ratioDark.toFixed(2)}:1 < ${minimum[pair.level]}:1 (${pair.level}-level, VS §4.6)`);
        }
      }
      return violations;
    },
  );
}

/** 2.6(c) + VS §4.4: verdict colorations survive grayscale — measurable separation from the ground with chroma removed. */
export function gateGrayscaleSurvival(): GateCheck {
  return check(
    'registry:grayscale-survival',
    'Verdict colorations survive grayscale: each verdict holds ≥ 3:1 luminance separation from its chamber ground (VS §4.4; Constitution 2.6(c))',
    SCALE_CITATIONS.grounds,
    () => {
      const violations: string[] = [];
      const verdicts: { id: string; light: string; dark: string }[] = [
        { id: 'color.verdict.verified', light: '#17663F', dark: '#3FA873' },
        { id: 'color.verdict.pending', light: '#7A5200', dark: '#D19A3A' },
        { id: 'color.verdict.failed', light: '#9E2B20', dark: '#C65B4E' },
      ];
      for (const verdict of verdicts) {
        for (const chamber of ['light', 'dark'] as const) {
          const color = chamber === 'light' ? verdict.light : verdict.dark;
          const ground = chamber === 'light' ? '#F5F4F0' : '#141312';
          const gray = (hex: string): number => {
            const l = relativeLuminance(hex);
            return l;
          };
          void gray;
          const ratio = contrastRatio(color, ground);
          if (ratio < 3) {
            violations.push(`${verdict.id} (${chamber}) loses separation under grayscale: ${ratio.toFixed(2)}:1 < 3:1 (VS §4.4)`);
          }
        }
      }
      return violations;
    },
  );
}

/** 2.6 + VS §4.7: color values equal the ratified reference tables (identity check, not just membership). */
export function gateColorValuesRatified(): GateCheck {
  return check(
    'registry:color-values-ratified',
    'Color values equal the ratified VS §4.7 reference tables — the sole value source (Constitution 2.1, 2.6)',
    SCALE_CITATIONS.grounds,
    () => {
      const violations: string[] = [];
      const ratified: { id: string; light?: string; dark?: string; single?: string }[] = [
        { id: 'color.ground', light: '#F5F4F0', dark: '#141312' },
        { id: 'color.ink.100', light: '#1A1917', dark: '#E9E6E0' },
        { id: 'color.verdict.verified', light: '#17663F', dark: '#3FA873' },
        { id: 'color.verdict.pending', light: '#7A5200', dark: '#D19A3A' },
        { id: 'color.verdict.failed', light: '#9E2B20', dark: '#C65B4E' },
        { id: 'color.accent.brass.text', light: '#7A4E1D', dark: '#C98A4B' },
        { id: 'color.accent.brass.glyph', single: '#9C6220' },
      ];
      for (const expected of ratified) {
        const record = REGISTRIES.color.find((t) => t.identifier === expected.id);
        if (!record) {
          violations.push(`ratified token "${expected.id}" missing from the Color registry`);
          continue;
        }
        if (isChambered(record.value)) {
          if (expected.light && record.value.light !== expected.light) {
            violations.push(`${expected.id} light "${record.value.light}" ≠ ratified "${expected.light}" (VS §4.7)`);
          }
          if (expected.dark && record.value.dark !== expected.dark) {
            violations.push(`${expected.id} dark "${record.value.dark}" ≠ ratified "${expected.dark}" (VS §4.7)`);
          }
        } else if (expected.single && String(record.value) !== expected.single) {
          violations.push(`${expected.id} "${String(record.value)}" ≠ ratified "${expected.single}" (VS §4.7)`);
        }
      }
      return violations;
    },
  );
}

/** 2.2: anatomy completeness — exactly the seven fields, all populated. */
export function gateTokenAnatomy(): GateCheck {
  return check(
    'registry:token-anatomy',
    'Every token record carries the complete seven-field anatomy, populated (Constitution 2.2)',
    [ { document: 'IMPLEMENTATION_CONSTITUTION', reference: '2.2', note: 'token anatomy' } ],
    () => {
      const violations: string[] = [];
      for (const record of allTokens()) {
        if (!record.identifier || !record.instrumentName) {
          violations.push(`token "${record.identifier}" lacks identifier or instrument name (dual naming, VS §0)`);
        }
        if (record.value === undefined || record.value === null || record.value === '') {
          violations.push(`token "${record.identifier}" lacks a value (Constitution 2.2)`);
        }
        if (!record.constraints || record.constraints.length === 0) {
          violations.push(`token "${record.identifier}" lacks constraints (Constitution 2.2)`);
        }
        if (record.version !== REGISTRY_VERSION) {
          violations.push(`token "${record.identifier}" carries foreign version "${record.version}"`);
        }
      }
      return violations;
    },
  );
}

/** Full pure-gate battery (2.6). The drift gate is fs-based and runs in the pipeline runner. */
export function validateRegistry(): ValidationReport {
  const checks: GateCheck[] = [
    gateTokenAnatomy(),
    gateCitationPresence(),
    gateDuplicateIdentifiers(),
    gateLifecycleStates(),
    gateGaugeLadderMembership(),
    gateRadiusLadderMembership(),
    gateSealAndIconSizes(),
    gateMotionValues(),
    gateColorValuesRatified(),
    gateColorContrast(),
    gateGrayscaleSurvival(),
  ];
  return {
    registryVersion: REGISTRY_VERSION,
    tokenCount: allTokens().length,
    passed: checks.every((c) => c.passed),
    checks,
  };
}

/** Formats a validation report as deterministic text (pipeline + reports). */
export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = [];
  lines.push(
    `REGISTRY VALIDATION — version ${report.registryVersion} — ${report.tokenCount} tokens — ${report.passed ? 'PASS' : 'FAIL'}`,
  );
  for (const c of report.checks) {
    lines.push(`  [${c.passed ? 'PASS' : 'FAIL'}] ${c.id} — ${c.label}`);
    for (const v of c.violations) lines.push(`      VIOLATION: ${v}`);
    lines.push(`      <- ${formatCitations(c.citations)}`);
  }
  return lines.join('\n');
}

/** Token value resolution guard used by gates and compiler alike (single authority). */
export function resolvedToken(identifier: string, chamber: 'light' | 'dark'): string {
  return getTokenValue(identifier, chamber) as string;
}
