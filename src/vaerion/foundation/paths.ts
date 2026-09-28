/**
 * Vaerion — Foundation / Canonical Path Map
 *
 * Single source of truth for the Volume IV repository layout. The
 * documentation pipeline (Stage 10) and pipeline tooling (Stage 2+) must
 * import these constants rather than repeating path literals, so that the
 * repository architecture cannot drift from its own description.
 *
 * Citations:
 * - Volume IV directive, Stage 1: "repository architecture; constitutional
 *   directory structure; governance folders."
 * - Implementation Constitution P-4 (Trace Index location), 11.1 (Authority
 *   registries), 2.1 (single canonical Registry location).
 * - Foundation Amendments F-002/F-003/F-004/F-005/F-006 (authority tree
 *   locations) — recorded in constitution/amendments/LEDGER.md.
 *
 * Path strings are identifiers, not visual values. Citation: Constitution 1.3.
 */

/** Root of the ratified constitutional documents and governance ledgers. */
export const CONSTITUTION_ROOT = 'constitution';

/** Root of the Volume IV implementation (the design-system engineering system). */
export const IMPLEMENTATION_ROOT = 'src/vaerion';

/** Root of the deterministic build / gate / release pipeline tooling. */
export const PIPELINE_ROOT = 'tools/vaerion-pipeline';

/**
 * Root of generated artifacts (Foundation Amendment F-005). Never
 * hand-authored; produced exclusively by the canonical Registry compiler
 * (Constitution 2.7). Governance: generated/README.md.
 */
export const GENERATED_ROOT = 'generated';

/** Shared engineering worklog. Citation: standing environment governance. */
export const WORKLOG_PATH = 'worklog.md';

/** Canonical locations inside the constitution root. */
export const CONSTITUTION_PATHS = {
  index: `${CONSTITUTION_ROOT}/INDEX.md`,
  changelog: `${CONSTITUTION_ROOT}/CHANGELOG.md`,
  bibleDir: `${CONSTITUTION_ROOT}/bible`,
  visualSystemDir: `${CONSTITUTION_ROOT}/visual-system`,
  implementationConstitutionDir: `${CONSTITUTION_ROOT}/implementation-constitution`,
  amendmentsLedger: `${CONSTITUTION_ROOT}/amendments/LEDGER.md`,
  interpretationsLedger: `${CONSTITUTION_ROOT}/interpretations/LEDGER.md`,
  traceIndex: `${CONSTITUTION_ROOT}/trace-index/trace-index.md`,
  // Foundation Amendment F-002 — Snapshot Authority.
  snapshotAuthorityDir: `${CONSTITUTION_ROOT}/snapshot-authority`,
  snapshotAuthorityReadme: `${CONSTITUTION_ROOT}/snapshot-authority/README.md`,
  snapshotAuthoritySnapshots: `${CONSTITUTION_ROOT}/snapshot-authority/snapshots`,
  snapshotAuthorityManifests: `${CONSTITUTION_ROOT}/snapshot-authority/manifests`,
  canonicalDocumentsManifest: `${CONSTITUTION_ROOT}/snapshot-authority/manifests/canonical-documents.json`,
  // Foundation Amendment F-003 — Announcement & Copy Registry.
  announcementRegistryDir: `${CONSTITUTION_ROOT}/announcement-registry`,
  announcementRegistryReadme: `${CONSTITUTION_ROOT}/announcement-registry/README.md`,
  // Foundation Amendment F-004 — Registry authority (law; implementation
  // lives under src/vaerion/registry and may never replace it).
  registryAuthorityDir: `${CONSTITUTION_ROOT}/registry`,
  registryAuthorityReadme: `${CONSTITUTION_ROOT}/registry/README.md`,
  // Foundation Amendment F-006 — Release record authority.
  releasesDir: `${CONSTITUTION_ROOT}/releases`,
  releasesReadme: `${CONSTITUTION_ROOT}/releases/README.md`,
} as const;

/** Canonical locations under the generated artifact root (F-005). */
export const GENERATED_PATHS = {
  readme: `${GENERATED_ROOT}/README.md`,
  bindings: `${GENERATED_ROOT}/bindings`,
  tokens: `${GENERATED_ROOT}/tokens`,
} as const;

/** Canonical file names of the ratified documents (DP-1/DP-2 targets). */
export const CONSTITUTION_DOCUMENT_FILES = {
  BIBLE: `${CONSTITUTION_ROOT}/bible/VAERION_DESIGN_BIBLE_v1.0.md`,
  VISUAL_SYSTEM: `${CONSTITUTION_ROOT}/visual-system/VAERION_VISUAL_SYSTEM_v1.0.1.md`,
  IMPLEMENTATION_CONSTITUTION: `${CONSTITUTION_ROOT}/implementation-constitution/VAERION_IMPLEMENTATION_CONSTITUTION_v1.0.md`,
} as const;

/** Canonical per-stage implementation roots, in build order. */
export const STAGE_ROOTS = {
  foundation: `${IMPLEMENTATION_ROOT}/foundation`,
  registry: `${IMPLEMENTATION_ROOT}/registry`,
  primitives: `${IMPLEMENTATION_ROOT}/primitives`,
  state: `${IMPLEMENTATION_ROOT}/state`,
  rendering: `${IMPLEMENTATION_ROOT}/rendering`,
  interaction: `${IMPLEMENTATION_ROOT}/interaction`,
  authorities: `${IMPLEMENTATION_ROOT}/authorities`,
  gates: `${IMPLEMENTATION_ROOT}/gates`,
  release: `${IMPLEMENTATION_ROOT}/release`,
  docs: `${IMPLEMENTATION_ROOT}/docs`,
} as const;

export type StageRootKey = keyof typeof STAGE_ROOTS;
