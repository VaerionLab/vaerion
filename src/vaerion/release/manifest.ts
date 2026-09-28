/**
 * Vaerion — Release / Module Manifest
 *
 * The conformance metadata of the Stage 10 release engine: the implemented
 * laws, the engines, their public APIs, and the pipeline commands — every
 * entry citation-traced (P-4).
 *
 * Citations: Implementation Constitution Part X, 10.1–10.4, 2.8, 8.7–8.8,
 * P-4; Foundation Amendment F-006; order Deliverables 1–10.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, type Citation } from '../foundation/citations';

/** One engine of the release system. */
export interface ReleaseEngineManifestEntry {
  readonly engine: string;
  readonly root: string;
  readonly orderDeliverable: string;
  readonly implements: readonly string[];
  readonly publicApi: readonly string[];
  readonly pipelineCommand: string;
  readonly citations: readonly Citation[];
}

/** The Stage 10 engine manifest, in the order's deliverable order. */
export const RELEASE_MANIFEST: readonly ReleaseEngineManifestEntry[] = Object.freeze([
  {
    engine: 'Release Authority',
    root: 'src/vaerion/release/authority.ts',
    orderDeliverable: 'Deliverable 1',
    implements: [
      'the sole issuer of releases (10.3; F-006 §5)',
      'release manifest engine — the ceremony composition',
      'release receipt engine — the seven-receipt ceremony (Deliverable 2)',
      'constitutional version engine — derived identity (identity.ts)',
      'artifact registry — provenance law (artifacts.ts, Deliverable 4)',
      'distribution registry — the eight channels (distribution.ts, Deliverable 7)',
      'rollback registry — supersession law (rollback.ts, Deliverable 6)',
      'release ledger — the append-only chain (ledger.ts, 10.4)',
      'a release whose receipt cannot be produced does not ship (10.3)',
    ],
    publicApi: [
      'issueRelease',
      'RELEASE_BUILD_STEPS',
      ' constitutionalVersion / registryVersion / releaseVersion (identity.ts)',
      'issueReceipt / assertReceiptAnatomy / verifyReceiptIntegrity / signReceiptBody (receipt.ts)',
      'executeBuild / assertDeterministicBuilds (build.ts)',
      'registerArtifact / assertNoAnonymousArtifacts (artifacts.ts)',
      'createReleaseLedger (ledger.ts)',
      'createRollback / verifyRollbackReceipt / demonstrateRollbackLaw (rollback.ts)',
      'createDistributionEngine (distribution.ts)',
      'verifyTrustBundle (trust.ts)',
    ],
    pipelineCommand: 'vaerion:release',
    citations: [implementation('Part X'), implementation('10.3'), bible('III', 'a release names its verifier')],
  },
  {
    engine: 'Immutable Release Ceremony',
    root: 'src/vaerion/release/receipt.ts',
    orderDeliverable: 'Deliverable 2',
    implements: [
      'the seven receipt kinds: constitutional, build, artifact, registry, snapshot, integrity, distribution',
      'the mandated twelve-field anatomy — identity, timestamp, SHA-256, parent release, constitutional version, snapshot version, registry version, evidence references, chain references, authority, digital-signature placeholder, citations',
      'immutable receipts — alteration detectable by recomputation, never silent (8.8; F-006 law 4)',
      'signature placeholder bound to the release-signing key fingerprint (IR-017)',
    ],
    publicApi: ['RECEIPT_KINDS', 'issueReceipt', 'assertReceiptAnatomy', 'verifyReceiptIntegrity', 'signReceiptBody', 'verifyReceiptSignature'],
    pipelineCommand: 'vaerion:verify-signatures',
    citations: [implementation('10.3'), implementation('8.8'), implementation('F-006')],
  },
  {
    engine: 'Constitutional Build Engine',
    root: 'src/vaerion/release/build.ts',
    orderDeliverable: 'Deliverable 3',
    implements: [
      'deterministic builds — identical sources produce identical outputs',
      'identical hashes, identical bundles, identical receipts',
      'any drift fails — never warns (10.1)',
      'no clock inside the deterministic record (P-6)',
    ],
    publicApi: ['executeBuild', 'assertDeterministicBuilds', 'firstBuildDivergence'],
    pipelineCommand: 'vaerion:verify-build',
    citations: [implementation('10.1'), implementation('2.7'), implementation('P-6')],
  },
  {
    engine: 'Artifact Intelligence',
    root: 'src/vaerion/release/artifacts.ts',
    orderDeliverable: 'Deliverable 4',
    implements: [
      'every artifact knows its origin, constitution, registry version, owning release, proving snapshots, approving authorities, evidence',
      'nothing may exist anonymously — anonymous artifacts are refused (10.1 form)',
    ],
    publicApi: ['ARTIFACT_KINDS', 'registerArtifact', 'assertNoAnonymousArtifacts'],
    pipelineCommand: 'vaerion:verify-artifacts',
    citations: [implementation('Part X'), implementation('2.8'), bible('II')],
  },
  {
    engine: 'Autonomous Release Verification',
    root: 'src/vaerion/release/verification.ts',
    orderDeliverable: 'Deliverable 5',
    implements: [
      'registry, rendering, state, interaction, authorities, testing, accessibility, performance, security, parity, snapshots — composed from the real Stage 2–9 engines',
      'the Article Gate (10.2) — fourteen Articles demonstrated from real evidence',
      'if one fails the release never exists — not a warning, not yellow (10.1)',
    ],
    publicApi: ['runEngineVerification', 'articleGate', 'assertReleaseVerification'],
    pipelineCommand: 'vaerion:verify-release',
    citations: [implementation('10.1'), implementation('10.2'), implementation('9.1')],
  },
  {
    engine: 'Rollback Engine',
    root: 'src/vaerion/release/rollback.ts',
    orderDeliverable: 'Deliverable 6',
    implements: [
      'rollback is constitutional history, not undo (10.4)',
      'rollback receipt, reason, parent chain, affected artifacts, integrity proof, evidence links, recovery chain',
      'the superseded release remains untouched — historical truth never retired (11.4)',
      'refuses: no reason, no affected artifacts, no evidence, unknown target',
    ],
    publicApi: ['createRollback', 'verifyRollbackReceipt', 'demonstrateRollbackLaw'],
    pipelineCommand: 'vaerion:verify-rollback',
    citations: [implementation('10.4'), implementation('11.4'), bible('VIII')],
  },
  {
    engine: 'Distribution Engine',
    root: 'src/vaerion/release/distribution.ts',
    orderDeliverable: 'Deliverable 7',
    implements: [
      'the eight declared channels: npm, pypi, vscode, jetbrains, neovim, cli, docs-bundle, offline-bundle',
      'every package carries constitutional identity',
      'composition with the 8.7–8.8 manifest lifecycle — criteria, assembled, manifest computed, signed',
      "honest refusal of 'delivered' without external evidence (Art. VIII; IR-019)",
      'quarantined content never enters a package (5.10; 8.7)',
    ],
    publicApi: ['DISTRIBUTION_CHANNELS', 'DISTRIBUTION_STAGES', 'createDistributionEngine'],
    pipelineCommand: 'vaerion:verify-distribution',
    citations: [implementation('8.7'), implementation('8.8'), implementation('5.10')],
  },
  {
    engine: 'Trust Engine',
    root: 'src/vaerion/release/trust.ts',
    orderDeliverable: 'Deliverable 8',
    implements: [
      'portable verification — pure data, no product access, no network (8.8; 11.5)',
      'every file, release, receipt, registry, snapshot, signature, authority verifiable standalone',
      'nothing is believed; everything is recomputed',
    ],
    publicApi: ['verifyTrustBundle'],
    pipelineCommand: 'vaerion:verify-trust',
    citations: [implementation('8.8'), implementation('11.5'), bible('XI')],
  },
  {
    engine: 'Release Observatory',
    root: 'src/vaerion/release/observatory.tsx',
    orderDeliverable: 'Deliverable 9',
    implements: [
      'release chain, constitution version, registry evolution, snapshot evolution, artifact graph, integrity status, deployment history, rollback history, evidence graph, verification timeline',
      'every visualization originates from real release ledger data — no fabricated metrics',
      'served as a generated pipeline artifact (display path filed as IR-018)',
    ],
    publicApi: ['ReleaseObservatory'],
    pipelineCommand: 'vaerion:observatory',
    citations: [implementation('10.3'), bible('XI', 'no fabricated metrics'), implementation('P-4')],
  },
]);

/** The mechanical gates of Stage 10 (order Deliverable 10). */
export const RELEASE_GATES: readonly { readonly command: string; readonly proves: string }[] = Object.freeze([
  { command: 'vaerion:verify-release', proves: 'the release gate — autonomous verification + Article Gate (10.1–10.2)' },
  { command: 'vaerion:verify-artifacts', proves: 'artifact intelligence — nothing anonymous (Deliverable 4)' },
  { command: 'vaerion:verify-distribution', proves: 'packages carry constitutional identity (Deliverable 7)' },
  { command: 'vaerion:verify-rollback', proves: 'the supersession law (Deliverable 6; 10.4)' },
  { command: 'vaerion:verify-signatures', proves: 'signature binding + tamper detection (Deliverable 2; 8.8)' },
  { command: 'vaerion:verify-build', proves: 'build determinism (Deliverable 3)' },
  { command: 'vaerion:verify-trust', proves: 'portable verification (Deliverable 8)' },
  { command: 'vaerion:verify-everything', proves: 'the aggregate — every failure produces evidence, citation, receipt, integrity hash, ConstitutionalViolationError (Deliverable 10)' },
]);
