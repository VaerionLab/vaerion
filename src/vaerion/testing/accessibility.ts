/**
 * Vaerion — Testing / Accessibility Test Engine
 *
 * The accessibility half of Part IX (9.4 — WCAG 2.2 AA across all surfaces,
 * AAA contrast for body text, focus map completeness, screen-reader
 * announcement parity against the Announcement and Copy Registry, and
 * color-independence under deuteranopia, protanopia, and tritanopia
 * simulations; 9.5 — keyboard; VS §10).
 *
 * Every failure identifies ALL FOUR required coordinates (order
 * Deliverable 4): the Surface, the Primitive, the Rule violated, and the
 * Constitutional citation. A finding without its coordinates is not a
 * finding (P-4).
 *
 * Dichromacy simulation apparatus: the standard severity-1.0 linear
 * projection matrices of Machado, Oliveira & Fernandes (2009), "A
 * Physiologically-based Model for Simulation of Color Vision Deficiency"
 — the same relationship to 9.4 that contrastRatio bears to WCAG: the
 * published model that makes a mandated check mechanical. Apparatus, not
 * law; the law is 9.4 itself.
 *
 * Citations: Implementation Constitution 9.4, 9.5, 6.11, 6.7–6.8, P-4;
 * Visual System §4.6, §10, §13.2, §14 (WCAG amendment); Bible Art. IV, VII,
 * XIV; order Deliverable 4.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { PRIMITIVE_MANIFEST } from '../primitives/manifest';
import { COMMAND_REGISTRY } from '../interaction/commands';
import { resolveKeyEvent } from '../interaction/keys';
import { INTERACTION_COPY } from '../interaction/copy';
import { SURFACE_COPY } from '../surfaces/copy';
import { VERDICT_STATES } from '../primitives/contract';
import { VERDICT_SHAPE_IDENTITY } from '../rendering/modes';
import {
  runAllInteractionGates,
  gateKeyboardReachability,
  gateFocusOwnership,
  gateEscapeRestoration,
  gateAccessibilityAnnouncements,
  gateDialogTrapping,
} from '../interaction/gates';
import { runAllRenderingGates, gateForcedColorsParity, gateReducedMotionParity } from '../rendering/gates';
import { gateColorContrast, gateGrayscaleSurvival, contrastRatio } from '../registry/validation';
import { resolvedToken } from '../registry/validation';
import { assertBatchWindowLawful } from '../interaction/announce';
import { ANNOUNCEMENT_BATCH_WINDOW_MS } from '../interaction/contracts';

const ENGINE_CITATIONS: readonly Citation[] = [
  implementation('9.4', 'accessibility gates'),
  implementation('9.5', 'keyboard gates'),
  implementation('9.1', 'mechanical, binary, cited'),
  bible('XIV', 'an equal instrument'),
];

/** One accessibility finding — all four coordinates, always (P-4). */
export interface AccessibilityFinding {
  /** The surface under test (or 'engine' for engine-level checks). */
  readonly surface: string;
  /** The primitive under test (or 'engine'). */
  readonly primitive: string;
  /** The violated rule, named. */
  readonly rule: string;
  /** The constitutional citation of the rule. */
  readonly citation: string;
  /** The mechanical evidence of the violation. */
  readonly evidence: string;
}

function finding(surface: string, primitive: string, rule: string, citation: string, evidence: string): AccessibilityFinding {
  return Object.freeze({ surface, primitive, rule, citation, evidence });
}

/** Runs one proof; converts a thrown violation into a finding. */
function probe(surface: string, primitive: string, rule: string, citation: string, proof: () => string): AccessibilityFinding | null {
  try {
    proof();
    return null;
  } catch (error) {
    return finding(surface, primitive, rule, citation, error instanceof Error ? error.message : String(error));
  }
}

/* --- Dichromacy simulation apparatus (Machado et al. 2009, severity 1.0). --- */

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ];
}

function rgbToHex(rgb: readonly [number, number, number]): string {
  const channel = (component: number): string =>
    Math.max(0, Math.min(255, Math.round(component * 255)))
      .toString(16)
      .padStart(2, '0');
  return `#${channel(rgb[0])}${channel(rgb[1])}${channel(rgb[2])}`;
}

/** Severity-1.0 dichromacy projection matrices (Machado et al. 2009). */
const DICHROMACY_MATRICES: Readonly<Record<'deuteranopia' | 'protanopia' | 'tritanopia', readonly (readonly number[])[]>> = Object.freeze({
  deuteranopia: [
    [0.36732286, 0.86064696, -0.22796856],
    [0.2800854, 0.67250117, 0.04741343],
    [-0.01182002, 0.04294093, 0.9688791],
  ],
  protanopia: [
    [0.15228626, 1.05258365, -0.20486851],
    [0.11450304, 0.7862812, 0.09921576],
    [-0.00388251, -0.04811605, 1.05199856],
  ],
  tritanopia: [
    [1.25552843, -0.07674931, -0.17877912],
    [-0.07841121, 0.93080904, 0.14760217],
    [0.00473394, 0.69136755, 0.30389851],
  ],
});

function simulateDichromacy(hex: string, kind: 'deuteranopia' | 'protanopia' | 'tritanopia'): string {
  const rgb = hexToRgb(hex);
  const matrix = DICHROMACY_MATRICES[kind];
  const projected: [number, number, number] = [
    matrix[0][0] * rgb[0] + matrix[0][1] * rgb[1] + matrix[0][2] * rgb[2],
    matrix[1][0] * rgb[0] + matrix[1][1] * rgb[1] + matrix[1][2] * rgb[2],
    matrix[2][0] * rgb[0] + matrix[2][1] * rgb[1] + matrix[2][2] * rgb[2],
  ];
  return rgbToHex([
    Math.max(0, Math.min(1, projected[0])),
    Math.max(0, Math.min(1, projected[1])),
    Math.max(0, Math.min(1, projected[2])),
  ]);
}

/** The chromatic verdict pairs per chamber (VS §4.7 — the ratified set). */
const CHROMATIC_PAIRS: readonly { readonly token: string; readonly chamber: 'light' | 'dark' }[] = [
  { token: 'color.verdict.verified', chamber: 'light' },
  { token: 'color.verdict.failed', chamber: 'light' },
  { token: 'color.verdict.pending', chamber: 'light' },
  { token: 'color.accent.brass.text', chamber: 'light' },
  { token: 'color.verdict.verified', chamber: 'dark' },
  { token: 'color.verdict.failed', chamber: 'dark' },
  { token: 'color.verdict.pending', chamber: 'dark' },
  { token: 'color.accent.brass.text', chamber: 'dark' },
];

/** WCAG 2.2 AAA contrast minimum for body text (9.4's body-text mandate). */
const WCAG_AAA_BODY_MINIMUM = 7;

/**
 * 1 — Keyboard navigation (9.5; 6.7): every command reachable; the
 * canonical map resolves; nothing shadows.
 */
export function verifyKeyboardNavigation(): readonly AccessibilityFinding[] {
  const findings: AccessibilityFinding[] = [];
  const reachability = gateKeyboardReachability();
  if (!reachability.passed) {
    findings.push(finding('all surfaces', 'interaction engine', '9.5 — keyboard reachability', 'Constitution 9.5; 6.7', reachability.evidence));
  }
  for (const command of COMMAND_REGISTRY) {
    const probeResult = probe(
      'all surfaces hosting the command',
      command.id,
      '9.5 — every command keyboard-reachable',
      'Constitution 9.5; 6.7',
      () => {
        if (!command.keyboardReachableVia) {
          throw new ConstitutionalViolationError('9.5', `Command "${command.id}" declares no reachability form.`);
        }
        if (command.keyboardReachableVia === 'canonical-key' && !command.key) {
          throw new ConstitutionalViolationError('9.5', `Command "${command.id}" claims canonical-key reachability without a key.`);
        }
        return `${command.id} reachable via ${command.keyboardReachableVia}${command.key ? ` (${command.key})` : ''}`;
      },
    );
    if (probeResult) findings.push(probeResult);
  }
  for (const key of ['v', 'r', 'e', 'j', 'k', 'l', 'escape', 'cmd-k']) {
    const probeResult = probe('all surfaces', 'keyboard map', '6.7 — the canonical key map resolves', 'Constitution 6.7; VS §13.2', () => {
      const resolved = resolveKeyEvent({ key });
      void resolved;
      return `key "${key}" resolves against the canonical map`;
    });
    if (probeResult) findings.push(probeResult);
  }
  return findings;
}

/**
 * 2/3 — Focus ownership and restoration (9.4; 6.8): one owner per surface;
 * dialogs trap and restore; Escape returns from the Lens.
 */
export function verifyFocusOwnershipAndRestoration(): readonly AccessibilityFinding[] {
  const findings: AccessibilityFinding[] = [];
  for (const gate of [gateFocusOwnership(), gateDialogTrapping(), gateEscapeRestoration()]) {
    if (!gate.passed) {
      findings.push(finding('all surfaces', 'focus engine', '9.4 — focus map completeness', 'Constitution 9.4; 6.8', gate.evidence));
    }
  }
  return findings;
}

/**
 * 4 — Screen reader announcements (9.4; 6.11): batching, assertive
 * reservation, and parity against the Announcement & Copy Registry — the
 * engine proves the consumption mechanics; the registry parity is proven
 * against the ids the caller supplies from the registry files (F-003).
 */
export function verifyScreenReaderAnnouncements(registeredIds: readonly string[]): readonly AccessibilityFinding[] {
  const findings: AccessibilityFinding[] = [];
  const announcementGate = gateAccessibilityAnnouncements();
  if (!announcementGate.passed) {
    findings.push(finding('all surfaces', 'announcement engine', '9.4 — announcement parity', 'Constitution 9.4; 6.11', announcementGate.evidence));
  }
  const batchProbe = probe('all surfaces', 'announcement engine', '6.11 — polite batching', 'Constitution 6.11; VS §10', () => {
    assertBatchWindowLawful(ANNOUNCEMENT_BATCH_WINDOW_MS);
    return 'polite batch window is the registered five seconds; assertive reserved for user-triggered verdict changes';
  });
  if (batchProbe) findings.push(batchProbe);

  const consumed = [
    ...INTERACTION_COPY.map((copyEntry) => copyEntry.id),
    ...(Object.values(SURFACE_COPY) as readonly { readonly id?: string }[])
      .filter((entry) => typeof entry === 'object' && entry !== null && typeof entry.id === 'string')
      .map((entry) => entry.id as string),
  ];
  const registered = new Set(registeredIds);
  for (const id of consumed) {
    if (!registered.has(id)) {
      findings.push(
        finding(
          'all surfaces',
          'copy registry consumption',
          '6.11 / F-003 — every announced string is registered',
          'Constitution 6.11; F-003; Art. VII',
          `Consumed copy id "${id}" is absent from the Announcement & Copy Registry files. Unregistered copy is uncitable copy (Art. XI).`,
        ),
      );
    }
  }
  return findings;
}

/**
 * 5 — ARIA contracts (9.4; 6.11): every primitive declares its
 * announcement, keyboard, and sensory contract.
 */
export function verifyAriaContracts(): readonly AccessibilityFinding[] {
  const findings: AccessibilityFinding[] = [];
  for (const primitive of PRIMITIVE_MANIFEST) {
    const probeResult = probe(
      'all surfaces hosting the primitive',
      primitive.name,
      '9.4 — accessibility contract present',
      'Constitution 9.4; 6.11; P-4',
      () => {
        const contract = primitive.accessibility;
        if (!contract.announcement || !contract.keyboard || !contract.sensory) {
          throw new ConstitutionalViolationError(
            '9.4',
            `Primitive "${primitive.name}" lacks a complete accessibility contract (announcement, keyboard, sensory).`,
          );
        }
        return `${primitive.name}: announcement / keyboard / sensory contracts declared`;
      },
    );
    if (probeResult) findings.push(probeResult);
  }
  return findings;
}

/**
 * 6 — Color contrast (9.4; §4.6): WCAG 2.2 AA for all pairs; AAA for body
 * text — mechanically recomputed for both chambers.
 */
export function verifyColorContrast(): readonly AccessibilityFinding[] {
  const findings: AccessibilityFinding[] = [];
  const contrastGate = gateColorContrast();
  if (!contrastGate.passed) {
    findings.push(finding('all surfaces', 'registry color tokens', '9.4 — WCAG 2.2 AA contrast', 'Constitution 9.4; VS §4.6', contrastGate.violations.join('; ')));
  }
  for (const chamber of ['light', 'dark'] as const) {
    const probeResult = probe('all surfaces', 'body text', '9.4 — AAA contrast for body text', 'Constitution 9.4; VS §4.6', () => {
      const ink = resolvedToken('color.ink.100', chamber);
      const ground = resolvedToken('color.ground', chamber);
      const ratio = contrastRatio(ink, ground);
      if (ratio < WCAG_AAA_BODY_MINIMUM) {
        throw new ConstitutionalViolationError(
          '9.4',
          `Body text contrast in the ${chamber} chamber is ${ratio.toFixed(2)}:1 — below the AAA minimum (9.4 mandates AAA contrast for body text; WCAG 2.2 AAA = 7:1).`,
        );
      }
      return `${chamber} chamber body text ${ratio.toFixed(2)}:1 (AAA ≥ ${WCAG_AAA_BODY_MINIMUM}:1)`;
    });
    if (probeResult) findings.push(probeResult);
  }
  return findings;
}

/**
 * 7 — Color independence (9.4; Art. IV): the simulations of 9.4 are
 * executed mechanically and their values recorded as evidence; the
 * ENFORCED requirement is the ratified one — meaning never depends on hue:
 * grayscale survival (VS §4.4) and the shape/word/position identity of the
 * verdicts (Art. IV) hold. A numeric contrast bound on the simulated
 * projections is stated nowhere in the ratified text; enforcing an invented
 * number is prohibited (Art. XI; P-5), so the measured simulated values are
 * recorded and the question of numeric pins is filed as IR-016.
 */
export function verifyColorIndependence(): readonly AccessibilityFinding[] {
  const findings: AccessibilityFinding[] = [];
  const grayscaleGate = gateGrayscaleSurvival();
  if (!grayscaleGate.passed) {
    findings.push(finding('all surfaces', 'verdict color tokens', '9.4 — color independence (grayscale survival)', 'Constitution 9.4; VS §4.4; Art. IV', grayscaleGate.violations.join('; ')));
  }
  // Never color alone (Art. IV): every verdict maps to a distinct shape —
  // the meaning carrier that survives every chromatic distortion.
  const shapes = VERDICT_STATES.map((verdict) => VERDICT_SHAPE_IDENTITY[verdict]);
  if (new Set(shapes).size !== VERDICT_STATES.length) {
    findings.push(
      finding('all surfaces', 'seal system', '9.4 — color independence (never color alone)', 'Constitution 9.4; Art. IV; VS §4.4', 'verdicts do not hold distinct shapes — hue would become a meaning carrier'),
    );
  }
  return findings;
}

// The three simulations of 9.4, executed and recorded (Machado et al.
// 2009 apparatus). Values are evidence, not verdicts (IR-016).
export function dichromacySimulationEvidence(): readonly string[] {
  const simulated: string[] = [];
  for (const pair of CHROMATIC_PAIRS) {
    const base = resolvedToken(pair.token, pair.chamber);
    if (!base.startsWith('#')) continue; // non-chromatic tokens are out of scope here
    const ground = resolvedToken('color.ground', pair.chamber);
    for (const kind of ['deuteranopia', 'protanopia', 'tritanopia'] as const) {
      simulated.push(`${pair.token} (${pair.chamber}) vs ground under ${kind}: ${contrastRatio(simulateDichromacy(base, kind), simulateDichromacy(ground, kind)).toFixed(2)}:1`);
    }
  }
  return Object.freeze(simulated);
}

/**
 * 8/9 — Forced color survival and reduced motion (9.4; 7.8; 7.9; VS §11.5,
 * §7.3): the parity gates of the rendering engine re-proven here.
 */
export function verifyForcedColorsAndReducedMotion(): readonly AccessibilityFinding[] {
  const findings: AccessibilityFinding[] = [];
  const forced = gateForcedColorsParity();
  if (!forced.passed) {
    findings.push(finding('all surfaces', 'forced-colors renderer', '9.4 — forced color survival', 'Constitution 9.4; 7.8; VS §11.5', forced.evidence));
  }
  const reduced = gateReducedMotionParity();
  if (!reduced.passed) {
    findings.push(finding('all surfaces', 'reduced-motion renderer', '9.4 — reduced motion behavior', 'Constitution 9.4; 7.9; VS §7.3', reduced.evidence));
  }
  // The full rendering gate set must also hold — the accessibility gates
  // never approve a rendering the rendering engine itself refuses.
  for (const gate of runAllRenderingGates()) {
    if (!gate.passed) {
      findings.push(finding('all surfaces', 'rendering engine', `9.4 — rendering precondition (${gate.gate})`, 'Constitution 9.4; Part VII', gate.evidence));
    }
  }
  for (const gate of runAllInteractionGates()) {
    if (!gate.passed) {
      findings.push(finding('all surfaces', 'interaction engine', `9.4 — interaction precondition (${gate.gate})`, 'Constitution 9.4; Part VI', gate.evidence));
    }
  }
  return findings;
}

/** The full accessibility report. */
export interface AccessibilityReport {
  readonly passed: boolean;
  readonly findings: readonly AccessibilityFinding[];
  /** The executed 9.4 dichromacy simulation values — recorded evidence (IR-016). */
  readonly simulationEvidence: readonly string[];
  readonly citations: readonly Citation[];
}

/**
 * Runs every accessibility gate (order Deliverable 4). `registeredIds` are
 * the ids of the Announcement & Copy Registry files, supplied by the
 * pipeline tool (the registry is constitution-tree law; the engine consumes
 * it by id, never re-reads or duplicates it — F-002 law 5 precedent).
 */
export function runAccessibilityVerification(registeredIds: readonly string[]): AccessibilityReport {
  const findings = [
    ...verifyKeyboardNavigation(),
    ...verifyFocusOwnershipAndRestoration(),
    ...verifyScreenReaderAnnouncements(registeredIds),
    ...verifyAriaContracts(),
    ...verifyColorContrast(),
    ...verifyColorIndependence(),
    ...verifyForcedColorsAndReducedMotion(),
  ];
  return Object.freeze({
    passed: findings.length === 0,
    findings: Object.freeze(findings),
    simulationEvidence: dichromacySimulationEvidence(),
    citations: ENGINE_CITATIONS,
  });
}

/** The gate form: throws a ConstitutionalViolationError on any finding. */
export function assertAccessibility(registeredIds: readonly string[]): AccessibilityReport {
  const report = runAccessibilityVerification(registeredIds);
  if (!report.passed) {
    const detail = report.findings
      .map((item) => `[${item.surface} / ${item.primitive}] ${item.rule} (${item.citation}): ${item.evidence}`)
      .join(' | ');
    throw new ConstitutionalViolationError(
      '9.4 / 9.5',
      `Accessibility verification failed with ${report.findings.length} finding(s), each identifying surface, primitive, rule, and citation: ${detail}`,
      ENGINE_CITATIONS,
    );
  }
  return report;
}

export const ACCESSIBILITY_ENGINE_CITATIONS: readonly Citation[] = Object.freeze(ENGINE_CITATIONS);
