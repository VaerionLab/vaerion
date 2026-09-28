/**
 * Vaerion — Foundation / Public Barrel
 *
 * The foundation layer is the only Volume IV code that exists without a
 * visual dependency: it encodes the citation system, precedence, stage
 * manifest, dependency graph, prerequisite registry, gate engine, and
 * canonical paths. Everything above it (registry, primitives, state,
 * rendering, interaction, authorities, gates, release, docs) compiles from
 * constitutional authority through these instruments.
 *
 * PURE SURFACE ONLY: foundation/verification.ts (fs-based mechanical proofs)
 * is deliberately not exported here; pipeline tooling imports it directly
 * so this barrel remains safe for any future non-Node consumer.
 *
 * Citations: Implementation Constitution P-4, P-1, 1.3, Part XI; Volume IV
 * directive Amendment F-007 (stage dependency graph).
 */

export {
  cite,
  bible,
  visualSystem,
  implementation,
  formatCitation,
  formatCitations,
  isCitation,
  DOCUMENT_PRECEDENCE,
  DOCUMENT_TITLES,
  type Citation,
  type ConstitutionalDocument,
} from './citations';

export {
  auditLine,
  governingDocument,
  assertTraceable,
  resolvePrecedence,
  ConstitutionalViolationError,
  type PrecedenceRuling,
} from './authority';

export {
  currentStage,
  getStage,
  STAGES,
  STAGE_IDS,
  FOUNDATION_ROOTS,
  type StageDefinition,
  type StageId,
  type StageStatus,
} from './stages';

export {
  assertDependencyGraphIntegrity,
  assertNoSkippedStages,
  assertStageMayBegin,
  dependencyGraph,
  evaluateStageGate,
  formatGateReport,
  type GateCheck,
  type PrerequisiteProof,
  type PrerequisiteResolver,
  type StageGateReport,
} from './gate';

export {
  getPrerequisite,
  PREREQUISITES,
  type PrerequisiteProofKind,
  type StagePrerequisite,
} from './prerequisites';

export {
  CONSTITUTION_DOCUMENT_FILES,
  CONSTITUTION_PATHS,
  CONSTITUTION_ROOT,
  GENERATED_PATHS,
  GENERATED_ROOT,
  IMPLEMENTATION_ROOT,
  PIPELINE_ROOT,
  STAGE_ROOTS,
  WORKLOG_PATH,
  type StageRootKey,
} from './paths';
