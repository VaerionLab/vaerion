/**
 * Vaerion — Foundation / Stage Dependency Graph & Gate Engine
 *
 * The complete dependency graph over the Volume IV build order, with
 * mechanical gate evaluation. This module is pure: fs-based proofs are
 * injected through a PrerequisiteResolver so the graph logic itself stays
 * environment-independent (the Node proofs live in foundation/verification.ts
 * and are consumed by tools/vaerion-pipeline).
 *
 * Citations:
 * - Volume IV directive, "Amendment F-007 — Stage Dependency Graph": "Every
 *   stage must explicitly declare: required predecessor stages, constitutional
 *   prerequisites, completion conditions. A stage whose prerequisites are
 *   unmet must terminate immediately with a Constitutional Violation.
 *   Skipping stages must be structurally impossible."
 * - Volume IV directive, "BUILD ORDER": do not skip, do not reorder, complete
 *   one stage before proceeding.
 * - Implementation Constitution P-1 (no rule may be relaxed), 9.1 (checks are
 *   mechanical and binary), 10.1 (no waivers), Part X (stage discipline).
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { ConstitutionalViolationError } from './authority';
import { formatCitations, type Citation } from './citations';
import { getPrerequisite } from './prerequisites';
import { getStage, STAGES, type StageDefinition, type StageId } from './stages';

/** A mechanically (or procedurally) established proof that a prerequisite is satisfied. */
export interface PrerequisiteProof {
  readonly id: string;
  readonly satisfied: boolean;
  /** The concrete evidence line, e.g. "sha256 pinned digest matched". */
  readonly evidence: string;
}

/** Resolves a prerequisite id to its current proof. Impure implementations (fs) live in verification.ts. */
export type PrerequisiteResolver = (id: string) => PrerequisiteProof;

export interface GateCheck {
  /** "stage:<id>" for predecessor checks, otherwise the prerequisite id. */
  readonly id: string;
  readonly kind: 'stage' | 'prerequisite' | 'order' | 'graph';
  readonly label: string;
  readonly passed: boolean;
  readonly evidence: string;
  readonly citations: readonly Citation[];
}

export interface StageGateReport {
  readonly stage: StageId;
  readonly stageName: string;
  readonly mayBegin: boolean;
  readonly checks: readonly GateCheck[];
  /** Human-readable violation lines for every failed check. */
  readonly violations: readonly string[];
  readonly citations: readonly Citation[];
}

/**
 * Structural integrity of the dependency graph (F-007): acyclic, strictly
 * ordered, every prerequisite id declared, every stage declaring completion
 * conditions and citations. Runs without side effects; throws on any defect.
 */
export function assertDependencyGraphIntegrity(): void {
  const seen = new Set<StageId>();
  for (const stage of STAGES) {
    if (seen.has(stage.id)) {
      throw new ConstitutionalViolationError(
        'F-007/GRAPH',
        `Stage ${stage.id} is declared more than once.`,
      );
    }
    seen.add(stage.id);

    for (const dependencyId of stage.dependsOn) {
      if (dependencyId >= stage.id) {
        throw new ConstitutionalViolationError(
          'F-007/GRAPH',
          `Stage ${stage.id} declares dependency on stage ${dependencyId}, which is not a predecessor. The Volume IV build order is strictly forward; a cycle or backward edge makes skipping possible.`,
        );
      }
      // Throws if the dependency does not exist (unknown stages are violations).
      getStage(dependencyId);
    }

    for (const prerequisiteId of stage.constitutionalPrerequisites) {
      // Throws if the prerequisite is not declared in the registry.
      getPrerequisite(prerequisiteId);
    }

    if (stage.completionConditions.length === 0) {
      throw new ConstitutionalViolationError(
        'F-007/GRAPH',
        `Stage ${stage.id} (${stage.name}) declares no completion conditions. Every stage must declare them (Amendment F-007).`,
      );
    }
    if (stage.citations.length === 0) {
      throw new ConstitutionalViolationError(
        'P-4',
        `Stage ${stage.id} (${stage.name}) is uncitable. Nothing unmeasured ships (Bible Art. XI).`,
      );
    }
  }
}

/**
 * Makes skipping structurally impossible (F-007): to begin stage N, every
 * stage preceding N in the canonical order must be conformant — independent
 * of what `dependsOn` happens to declare, so no edit of the manifest can open
 * a skip path.
 */
export function assertNoSkippedStages(id: StageId): void {
  for (const stage of STAGES) {
    if (stage.id < id && stage.status !== 'conformant') {
      throw new ConstitutionalViolationError(
        'BUILD ORDER',
        `Stage ${id} may not begin: stage ${stage.id} (${stage.name}) precedes it in the canonical order and is "${stage.status}". Skipping stages is structurally impossible (Amendment F-007; Volume IV BUILD ORDER).`,
      );
    }
  }
}

/**
 * Evaluates the full gate for a stage without throwing: graph integrity,
 * dependencies, order, and every declared constitutional prerequisite.
 * Violations are reported, never raised — raising is assertStageMayBegin's
 * contract (Amendment F-007: "must terminate immediately with a
 * Constitutional Violation").
 */
export function evaluateStageGate(
  id: StageId,
  resolve: PrerequisiteResolver,
): StageGateReport {
  const stage = getStage(id);
  const checks: GateCheck[] = [];
  const violations: string[] = [];

  // Graph integrity — a defective graph cannot be gated safely.
  let graphPassed = true;
  try {
    assertDependencyGraphIntegrity();
  } catch (error) {
    graphPassed = false;
    const message = error instanceof Error ? error.message : String(error);
    violations.push(message);
  }
  checks.push({
    id: 'graph:integrity',
    kind: 'graph',
    label: 'Dependency graph structural integrity (acyclic, ordered, declared)',
    passed: graphPassed,
    evidence: graphPassed ? 'integrity assertions passed' : 'integrity violation detected',
    citations: [
      { document: 'IMPLEMENTATION_CONSTITUTION', reference: 'F-007', note: 'complete dependency graph' },
    ],
  });
  if (!graphPassed) {
    return {
      stage: id,
      stageName: stage.name,
      mayBegin: false,
      checks,
      violations,
      citations: [
        { document: 'IMPLEMENTATION_CONSTITUTION', reference: 'F-007' },
      ],
    };
  }

  for (const dependencyId of stage.dependsOn) {
    const dependency = getStage(dependencyId);
    const passed = dependency.status === 'conformant';
    checks.push({
      id: `stage:${dependencyId}`,
      kind: 'stage',
      label: `Stage ${dependencyId} — ${dependency.name}`,
      passed,
      evidence: `status: ${dependency.status}`,
      citations: [
        {
          document: 'IMPLEMENTATION_CONSTITUTION',
          reference: 'F-007',
          note: 'required predecessor stages',
        },
      ],
    });
    if (!passed) {
      violations.push(
        `Stage ${id} (${stage.name}) may not begin: dependency stage ${dependencyId} (${dependency.name}) is "${dependency.status}".`,
      );
    }
  }

  // Order check — redundant with dependsOn for a conformant manifest, but
  // enforced independently so skipping can never be re-introduced by edit.
  let orderPassed = true;
  try {
    assertNoSkippedStages(id);
  } catch (error) {
    orderPassed = false;
    violations.push(error instanceof Error ? error.message : String(error));
  }
  checks.push({
    id: 'order:canonical',
    kind: 'order',
    label: 'Canonical order intact (no skipped stages)',
    passed: orderPassed,
    evidence: orderPassed ? `stages 1…${id - 1} conformant` : 'skipped stage detected',
    citations: [
      { document: 'IMPLEMENTATION_CONSTITUTION', reference: 'F-007', note: 'skipping stages must be structurally impossible' },
    ],
  });

  for (const prerequisiteId of stage.constitutionalPrerequisites) {
    const prerequisite = getPrerequisite(prerequisiteId);
    let proof;
    try {
      proof = resolve(prerequisiteId);
    } catch (error) {
      proof = {
        id: prerequisiteId,
        satisfied: false,
        evidence: `proof machinery failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
    checks.push({
      id: prerequisiteId,
      kind: 'prerequisite',
      label: prerequisite.label,
      passed: proof.satisfied,
      evidence: proof.evidence,
      citations: prerequisite.citations,
    });
    if (!proof.satisfied) {
      violations.push(
        `Stage ${id} (${stage.name}) may not begin: constitutional prerequisite ${prerequisiteId} (${prerequisite.label}) is unmet — ${proof.evidence}`,
      );
    }
  }

  const citations: Citation[] = [
    { document: 'IMPLEMENTATION_CONSTITUTION', reference: 'F-007', note: 'stage dependency graph' },
    { document: 'IMPLEMENTATION_CONSTITUTION', reference: 'Part X', note: 'stage discipline' },
  ];

  return {
    stage: id,
    stageName: stage.name,
    mayBegin: violations.length === 0,
    checks,
    violations,
    citations,
  };
}

/**
 * Enforces the binding build order, extended per Amendment F-007: a stage may
 * begin only when (a) every declared predecessor is conformant, (b) no stage
 * is skipped, and (c) every declared constitutional prerequisite is satisfied.
 * Unmet prerequisites terminate immediately with a ConstitutionalViolation.
 */
export function assertStageMayBegin(
  id: StageId,
  resolve: PrerequisiteResolver,
): StageGateReport {
  const report = evaluateStageGate(id, resolve);
  if (!report.mayBegin) {
    throw new ConstitutionalViolationError(
      'BUILD ORDER / F-007',
      `Stage ${id} (${report.stageName}) gate failed:\n- ${report.violations.join('\n- ')}`,
      report.citations,
    );
  }
  return report;
}

/** The full declared graph, for documentation and tooling. */
export function dependencyGraph(): {
  nodes: readonly StageDefinition[];
  edges: readonly { readonly from: StageId; readonly to: StageId }[];
} {
  const edges = STAGES.flatMap((stage) =>
    stage.dependsOn.map((from) => ({ from, to: stage.id })),
  );
  return { nodes: STAGES, edges };
}

/** Formats a gate report as a deterministic text block (used by pipeline commands). */
export function formatGateReport(report: StageGateReport): string {
  const lines: string[] = [];
  lines.push(`STAGE ${report.stage} — ${report.stageName}`);
  lines.push(`may begin: ${report.mayBegin ? 'YES' : 'NO'}`);
  for (const check of report.checks) {
    lines.push(
      `  [${check.passed ? 'PASS' : 'FAIL'}] ${check.id} — ${check.label} (${check.evidence}) <- ${formatCitations(check.citations)}`,
    );
  }
  for (const violation of report.violations) {
    lines.push(`  VIOLATION: ${violation}`);
  }
  return lines.join('\n');
}
