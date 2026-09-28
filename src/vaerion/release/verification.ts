/**
 * Vaerion — Release / Autonomous Release Verification & the Article Gate
 *
 * "Before release: Automatically verify: Registry, Rendering, State,
 * Interaction, Authorities, Testing, Accessibility, Performance, Security,
 * Parity, Snapshots. If one fails... Release never exists. Not 'warning.'
 * Not 'yellow.' It simply never becomes a release." (order Deliverable 5.)
 *
 * Composition, never re-implementation: this module executes the REAL gate
 * engines of Stages 2–9 — the registry validation gates, the fourteen
 * rendering gates, the twelve state gates, the fifteen interaction gates,
 * the sixteen authority gates, the Stage 9 parity / visual / accessibility /
 * interaction / state-authority / performance / security engines, and the
 * authority-contract integrity proof. The fs-based proofs (constitution
 * digests, registry compilation reproducibility, snapshot working set) are
 * executed by the pipeline command, which composes this engine plus the
 * stage verifiers — the full graph (pipeline contract §6).
 *
 * The Article Gate (Constitution 10.2) maps the fourteen constitutional
 * Articles of the Bible to the demonstrated evidence — each entry carries
 * its real evidence string and citations. A release record that cannot
 * demonstrate every Article does not ship (10.1–10.2).
 *
 * Citations: Constitution 10.1, 10.2, 10.3, Part IX, P-4; Bible Art.
 * I–XIV; order Deliverable 5.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { assertAuthorityContractIntegrity } from '../authorities/contracts';
import { runAllAuthorityGates } from '../authorities/gates';
import { runAllStateGates } from '../state/gates';
import { runAllInteractionGates } from '../interaction/gates';
import { runAllRenderingGates } from '../rendering/gates';
import {
  gateCitationPresence,
  gateColorContrast,
  gateColorValuesRatified,
  gateDuplicateIdentifiers,
  gateGaugeLadderMembership,
  gateGrayscaleSurvival,
  gateLifecycleStates,
  gateMotionValues,
  gateRadiusLadderMembership,
  gateSealAndIconSizes,
  gateTokenAnatomy,
  type GateCheck,
} from '../registry/validation';
import { assertParity } from '../testing/parity';
import { assertVisualStructure } from '../testing/visual';
import { assertAccessibility } from '../testing/accessibility';
import { assertInteraction } from '../testing/interaction';
import { assertStateAuthorities } from '../testing/state-authority';
import { assertPerformance } from '../testing/performance';
import { assertSecurity } from '../testing/security';

/** One verification area's binary, cited result (9.1 form). */
export interface VerificationAreaResult {
  readonly area: string;
  readonly passed: boolean;
  readonly evidence: string;
  readonly citations: readonly Citation[];
}

export interface EngineVerification {
  readonly areas: readonly VerificationAreaResult[];
  readonly allPassed: boolean;
}

/** One Article Gate entry (10.2). */
export interface ArticleGateResult {
  readonly article: string;
  readonly requirement: string;
  readonly evidence: string;
  readonly passed: boolean;
  readonly citations: readonly Citation[];
}

const VERIFICATION_CITATIONS: readonly Citation[] = Object.freeze([
  implementation('10.1', 'the gate — every Part IX gate passes on the exact artifact'),
  implementation('10.2', 'the Article Gate'),
  implementation('9.1', 'mechanical, binary, cited'),
]);

function gateSummary(name: string, results: readonly { passed: boolean; evidence: string }[], what: string): string {
  const failed = results.filter((result) => !result.passed).length;
  return `${name}: ${results.length - failed}/${results.length} ${what} pass${failed === 0 ? '' : ` — ${failed} FAILED`}`;
}

function runArea(area: string, run: () => string): VerificationAreaResult {
  try {
    const evidence = run();
    return { area, passed: true, evidence, citations: VERIFICATION_CITATIONS };
  } catch (error) {
    return {
      area,
      passed: false,
      evidence: error instanceof Error ? error.message : String(error),
      citations: VERIFICATION_CITATIONS,
    };
  }
}

function runGateChecks(checks: readonly GateCheck[]): string {
  const failed = checks.filter((check) => !check.passed);
  if (failed.length > 0) {
    throw new ConstitutionalViolationError(
      '2.6',
      `Registry validation failed: ${failed.map((check) => check.id).join(', ')}. (Constitution 2.6.)`,
    );
  }
  return `${checks.length}/${checks.length} registry validation gates pass`;
}

/**
 * Runs the in-process engine battery (order Deliverable 5). The registered
 * announcement ids are supplied by the pipeline (read from the Announcement
 * & Copy Registry, F-003) so both-way parity is proven against the real
 * registry.
 */
export function runEngineVerification(params?: {
  readonly announcementIds?: readonly string[];
}): EngineVerification {
  const areas: VerificationAreaResult[] = [
    runArea('registry', () =>
      runGateChecks([
        gateCitationPresence(),
        gateDuplicateIdentifiers(),
        gateLifecycleStates(),
        gateGaugeLadderMembership(),
        gateRadiusLadderMembership(),
        gateSealAndIconSizes(),
        gateMotionValues(),
        gateColorContrast(),
        gateGrayscaleSurvival(),
        gateColorValuesRatified(),
        gateTokenAnatomy(),
      ]),
    ),
    runArea('rendering', () => {
      const gates = runAllRenderingGates();
      if (gates.some((gate) => !gate.passed)) {
        throw new ConstitutionalViolationError(
          'Part VII',
          `Rendering gates failed: ${gates.filter((gate) => !gate.passed).map((gate) => gate.gate).join(', ')}.`,
        );
      }
      return gateSummary('rendering', gates, 'gates');
    }),
    runArea('state', () => {
      const gates = runAllStateGates();
      if (gates.some((gate) => !gate.passed)) {
        throw new ConstitutionalViolationError(
          'Part V',
          `State gates failed: ${gates.filter((gate) => !gate.passed).map((gate) => gate.gate).join(', ')}.`,
        );
      }
      return gateSummary('state', gates, 'gates');
    }),
    runArea('interaction', () => {
      const gates = runAllInteractionGates();
      if (gates.some((gate) => !gate.passed)) {
        throw new ConstitutionalViolationError(
          'Part VI',
          `Interaction gates failed: ${gates.filter((gate) => !gate.passed).map((gate) => gate.gate).join(', ')}.`,
        );
      }
      return gateSummary('interaction', gates, 'gates');
    }),
    runArea('authorities', () => {
      assertAuthorityContractIntegrity();
      const gates = runAllAuthorityGates();
      if (gates.some((gate) => !gate.passed)) {
        throw new ConstitutionalViolationError(
          'Part VIII',
          `Authority gates failed: ${gates.filter((gate) => !gate.passed).map((gate) => gate.gate).join(', ')}.`,
        );
      }
      return `authority contract integrity proven; ${gateSummary('authorities', gates, 'gates')}`;
    }),
    runArea('parity', () => {
      const report = assertParity();
      return `${report.targets.length} parity targets pass the six invariants`;
    }),
    runArea('visual', () => {
      const report = assertVisualStructure();
      return `${report.areas.length} visual regression areas pass — meaning-based, never pixels`;
    }),
    runArea('accessibility', () => {
      assertAccessibility(params?.announcementIds ?? []);
      return 'accessibility engine: zero findings; every check carries surface, primitive, rule, citation';
    }),
    runArea('performance', () => {
      const report = assertPerformance();
      const unratified = report.measurements.filter((measurement) => !measurement.enforced).length;
      return `performance engine: ratified bounds hold; ${unratified} unratified measurement(s) reported with pin requested — no invented budgets`;
    }),
    runArea('security', () => {
      const report = assertSecurity();
      return `${report.proofs.length}/8 refusal proofs terminate in ConstitutionalViolationError`;
    }),
  ];
  return { areas, allPassed: areas.every((area) => area.passed) };
}

/**
 * The Article Gate (Constitution 10.2): demonstrates the release record per
 * constitutional Article of the Bible, from real gate evidence. The
 * pipeline supplies the fs-proven evidence lines (constitution digests,
 * registry reproducibility, snapshot integrity) alongside the engine
 * results.
 */
export function articleGate(params: {
  readonly engine: EngineVerification;
  readonly constitutionEvidence: string;
  readonly registryEvidence: string;
  readonly snapshotEvidence: string;
}): readonly ArticleGateResult[] {
  const evidenceOf = (area: string): VerificationAreaResult => {
    const found = params.engine.areas.find((candidate) => candidate.area === area);
    if (!found) {
      throw new ConstitutionalViolationError(
        '10.2',
        `The Article Gate cannot demonstrate its evidence: area "${area}" was not verified. A release record that cannot demonstrate every Article does not ship (Constitution 10.1–10.2).`,
      );
    }
    return found;
  };
  const passOf = (area: string): boolean => evidenceOf(area).passed;

  return Object.freeze([
    {
      article: 'I',
      requirement: 'No borrowed identity — Snapshot Authority conformance',
      evidence: params.snapshotEvidence,
      passed: passOf('parity') && passOf('visual'),
      citations: [bible('I'), implementation('9.3'), implementation('P-6')],
    },
    {
      article: 'II',
      requirement: 'Evidence or silence',
      evidence: `security engine refuses missing evidence (${evidenceOf('security').evidence}); every area's evidence is recorded`,
      passed: passOf('security'),
      citations: [bible('II'), implementation('1.6', 'honesty is an engineering property')],
    },
    {
      article: 'III',
      requirement: 'A verdict names its verifier',
      evidence: `every receipt names the Release Authority, engine version, and ruleset (10.3); gate verdicts name their engines — ${evidenceOf('authorities').evidence}`,
      passed: passOf('authorities'),
      citations: [bible('III'), implementation('10.3')],
    },
    {
      article: 'IV',
      requirement: 'Color law and never-color-alone',
      evidence: `${evidenceOf('registry').evidence} (contrast, grayscale survival); accessibility zero findings with dichromacy simulations recorded`,
      passed: passOf('registry') && passOf('accessibility'),
      citations: [bible('IV'), implementation('9.4')],
    },
    {
      article: 'V',
      requirement: 'Motion law',
      evidence: `${evidenceOf('registry').evidence} (motion values); ${evidenceOf('performance').evidence}`,
      passed: passOf('registry') && passOf('performance'),
      citations: [bible('V'), implementation('9.10')],
    },
    {
      article: 'VI',
      requirement: 'Receipt anatomy',
      evidence: `release receipts enforce the mandated anatomy mechanically (assertReceiptAnatomy); parity proves receipt anatomy intact across all seven targets — ${evidenceOf('parity').evidence}`,
      passed: passOf('parity'),
      citations: [bible('VI'), implementation('9.12')],
    },
    {
      article: 'VII',
      requirement: 'Two voices',
      evidence: `accessibility engine proves announcement parity against the Announcement & Copy Registry — ${evidenceOf('accessibility').evidence}`,
      passed: passOf('accessibility'),
      citations: [bible('VII'), implementation('6.11')],
    },
    {
      article: 'VIII',
      requirement: 'Honesty states',
      evidence: `${evidenceOf('state').evidence}; distribution refuses delivery without evidence (Art. VIII; IR-019)`,
      passed: passOf('state'),
      citations: [bible('VIII'), implementation('1.6')],
    },
    {
      article: 'IX',
      requirement: 'Chain walkability within two interactions',
      evidence: `${evidenceOf('interaction').evidence}; chain integrity proven by the authority gates`,
      passed: passOf('interaction'),
      citations: [bible('IX'), implementation('3.15')],
    },
    {
      article: 'X',
      requirement: 'Density and ceremony margins',
      evidence: `${evidenceOf('rendering').evidence} (measurement validation; ceremonial distances never compressed)`,
      passed: passOf('rendering'),
      citations: [bible('X'), implementation('7.4')],
    },
    {
      article: 'XI',
      requirement: 'No unmeasured values',
      evidence: `${params.registryEvidence}; ${evidenceOf('registry').evidence} (anatomy, citation presence, ratified values)`,
      passed: passOf('registry'),
      citations: [bible('XI'), implementation('1.3'), implementation('2.6')],
    },
    {
      article: 'XII',
      requirement: 'No security theatre',
      evidence: evidenceOf('security').evidence,
      passed: passOf('security'),
      citations: [bible('XII'), implementation('1.6')],
    },
    {
      article: 'XIII',
      requirement: 'Sliced rendering',
      evidence: `${evidenceOf('rendering').evidence} (visibility honesty; sliced rendering above threshold)`,
      passed: passOf('rendering'),
      citations: [bible('XIII'), implementation('7.3')],
    },
    {
      article: 'XIV',
      requirement: 'Governance upheld',
      evidence: `${params.constitutionEvidence}; the stage dependency graph is intact and every artifact citation-traced (P-4)`,
      passed: passOf('registry') && params.engine.allPassed,
      citations: [bible('XIV'), implementation('11.3'), implementation('P-4')],
    },
  ]);
}

/**
 * The release gate itself (10.1): every area and every Article must
 * demonstrate, or the release never exists.
 */
export function assertReleaseVerification(params: {
  readonly engine: EngineVerification;
  readonly articles: readonly ArticleGateResult[];
}): void {
  const failedAreas = params.engine.areas.filter((area) => !area.passed);
  if (failedAreas.length > 0 || !params.engine.allPassed) {
    throw new ConstitutionalViolationError(
      '10.1',
      `The release never exists: ${failedAreas.length} verification area(s) failed — ${failedAreas.map((area) => area.area).join(', ')}. Not a warning, not yellow (Constitution 10.1; order Deliverable 5).`,
      VERIFICATION_CITATIONS,
    );
  }
  const failedArticles = params.articles.filter((article) => !article.passed);
  if (failedArticles.length > 0) {
    throw new ConstitutionalViolationError(
      '10.2',
      `The Article Gate is not demonstrated: Articles ${failedArticles.map((article) => article.article).join(', ')} lack evidence. A release whose record cannot demonstrate every Article does not ship (Constitution 10.2).`,
      VERIFICATION_CITATIONS,
    );
  }
}
