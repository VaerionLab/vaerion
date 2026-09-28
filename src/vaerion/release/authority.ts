/**
 * Vaerion — Release / The Release Authority
 *
 * The sole issuer of releases (Constitution 10.3; Foundation Amendment
 * F-006 §5: "the implementation executes this authority; it never issues
 * receipts outside the form this authority defines").
 *
 * Boundaries (the process obeys the product):
 * - A release exists only after every gate passes on the exact artifact
 *   shipped (10.1). If one verification area fails, the release never
 *   exists — not a warning, not yellow (order Deliverable 5).
 * - Every release issues the seven-receipt ceremony; a release whose
 *   receipt cannot be produced does not ship (10.3).
 * - The release chain is append-only; rollbacks are superseding entries
 *   (10.4) — owned by the Rollback Engine, composed here.
 * - Build outputs never enter the constitution tree; receipts do (F-006).
 * - Nothing is believed: the authority verifies its own ceremony with the
 *   Trust Engine before declaring the release issued.
 *
 * Citations: Constitution Part X, 10.1–10.4, 2.8, 8.8, P-4, P-6; Foundation
 * Amendment F-006; Bible Art. III, XI; order Deliverables 1–8.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { sha256 } from '../authorities/hash';
import {
  RELEASE_ENGINE_NAME,
  RELEASE_ENGINE_VERSION,
  RELEASE_RULESET,
  constitutionalVersion as deriveConstitutionalVersion,
  registryVersion as declaredRegistryVersion,
  releaseVersion,
} from './identity';
import {
  issueReceipt,
  assertReceiptAnatomy,
  verifyReceiptIntegrity,
  signReceiptBody,
  RECEIPT_KINDS,
  type ReleaseReceipt,
  type SigningKey,
} from './receipt';
import { executeBuild, RELEASE_BUILD_STEPS, type BuildInput, type BuildRecord } from './build';
import { registerArtifact, assertNoAnonymousArtifacts, type ArtifactRecord } from './artifacts';
import { createReleaseLedger, type ReleaseLedger, type ReleaseLedgerEntry } from './ledger';
import { createDistributionEngine, DISTRIBUTION_CHANNELS, type DistributionRecord } from './distribution';
import {
  runEngineVerification,
  articleGate,
  assertReleaseVerification,
  type ArticleGateResult,
  type EngineVerification,
} from './verification';
import { verifyTrustBundle, type TrustBundle, type TrustReport } from './trust';

/** The declared build steps of the constitutional build live in build.ts (RELEASE_BUILD_STEPS) and are consumed here — one definition, no drift. */

/** The inputs of one release ceremony. */
export interface ReleaseCeremonyInput {
  readonly protocol: string;
  readonly volumeStage: 10;
  readonly sequence: number;
  readonly snapshotVersion: string;
  readonly parentReleaseId: string | null;
  readonly sourceManifest: readonly BuildInput[];
  readonly packageContents: Readonly<
    Record<string, readonly { readonly name: string; readonly sha256: string }[]>
  >;
  readonly artifactSpecifications: readonly {
    readonly kind: ArtifactRecord['kind'];
    readonly name: string;
    readonly sha256: string;
    readonly origin: string;
    readonly provingSnapshots: readonly string[];
  }[];
  readonly announcementIds: readonly string[];
  readonly constitutionEvidence: string;
  readonly registryEvidence: string;
  readonly snapshotEvidence: string;
  readonly key: SigningKey;
  readonly clock?: () => number;
}

/** The issued release. */
export interface IssuedRelease {
  readonly releaseId: string;
  readonly version: string;
  readonly build: BuildRecord;
  readonly engine: EngineVerification;
  readonly articles: readonly ArticleGateResult[];
  readonly receipts: readonly ReleaseReceipt[];
  readonly artifacts: readonly ArtifactRecord[];
  readonly distribution: readonly DistributionRecord[];
  readonly entry: ReleaseLedgerEntry;
  readonly ledger: ReleaseLedger;
  readonly trust: TrustReport;
}

const AUTHORITY_CITATIONS: readonly Citation[] = Object.freeze([
  implementation('Part X'),
  implementation('10.1', 'the gate'),
  implementation('10.3', 'release receipt — implementation necessity'),
  implementation('10.4', 'append-only release chain'),
]);

function bibleArticles(): Citation[] {
  return (
    ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'] as const
  ).map((article) => ({ document: 'BIBLE' as const, reference: `Art. ${article}` }));
}

/**
 * Executes the release ceremony. This is the only path by which a release
 * exists. Every stage composes the real engines; any refusal propagates and
 * the release simply never exists (10.1).
 */
export function issueRelease(input: ReleaseCeremonyInput): IssuedRelease {
  const clock = input.clock ?? (() => 0);

  // [1] Autonomous verification — if one fails, the release never exists.
  const engine = runEngineVerification({ announcementIds: input.announcementIds });
  const articles = articleGate({
    engine,
    constitutionEvidence: input.constitutionEvidence,
    registryEvidence: input.registryEvidence,
    snapshotEvidence: input.snapshotEvidence,
  });
  assertReleaseVerification({ engine, articles });

  // [2] The constitutional version identity — derived from the ratified
  // titles and the Registry itself, never hand-typed (2.8; Art. XI).
  const cv = deriveConstitutionalVersion({ protocol: input.protocol, volumeStage: input.volumeStage });
  const version = releaseVersion({ version: cv, sequence: input.sequence });
  const registryVersion = declaredRegistryVersion();

  // [3] The deterministic build.
  const build = executeBuild({
    sourceManifest: input.sourceManifest,
    steps: RELEASE_BUILD_STEPS,
    buildEngine: `${RELEASE_ENGINE_NAME} ${RELEASE_ENGINE_VERSION}`,
    ruleset: RELEASE_RULESET,
    hash: sha256,
  });
  const releaseId = `rel_${build.sourceTreeHash.slice(0, 16)}`;

  // [4] Artifact Intelligence — nothing exists anonymously.
  const artifacts = input.artifactSpecifications.map((specification) =>
    registerArtifact({
      kind: specification.kind,
      name: specification.name,
      sha256: specification.sha256,
      origin: specification.origin,
      constitutionVersion: RELEASE_RULESET,
      registryVersion,
      owningRelease: releaseId,
      provingSnapshots: specification.provingSnapshots,
      approvingAuthorities: ['Release Authority (F-006)', 'Chain Authority (8.5)'],
      evidenceReferences: [`build:${build.buildId}`, `snapshot:${input.snapshotVersion}`],
      hash: sha256,
    }),
  );
  assertNoAnonymousArtifacts(artifacts);

  // [5] Distribution — eight channels, each carrying constitutional identity,
  // each manifest computed and signed through the 8.7–8.8 lifecycle.
  const distributionEngine = createDistributionEngine({ hash: sha256 });
  const distribution: DistributionRecord[] = DISTRIBUTION_CHANNELS.map((channel) => {
    const contents = input.packageContents[channel];
    if (!contents || contents.length === 0) {
      throw new ConstitutionalViolationError(
        'Art. II',
        `Channel "${channel}" was declared with no package contents. Every package is assembled from hashed contents (order Deliverable 7; Bible Art. II).`,
        AUTHORITY_CITATIONS,
      );
    }
    const prepared = distributionEngine.preparePackage({
      channel,
      packageIdentity: `${releaseId} ${version} ruleset=${RELEASE_RULESET}`,
      contents,
    });
    const manifested = distributionEngine.computePackageManifest({
      channel,
      timestampAuthority: 'release ceremony clock (declared at issuance — P-6)',
      issuingEngine: `${RELEASE_ENGINE_NAME} ${RELEASE_ENGINE_VERSION}`,
      ruleset: RELEASE_RULESET,
    });
    const signature = signReceiptBody({
      canonicalBody: `dist-manifest:${manifested.manifest!.manifestId}`,
      key: input.key,
    });
    return distributionEngine.signPackage({ channel, signature });
  });

  // [6] The append-only ledger (10.4) — receipts cite the chain they join.
  const ledger = createReleaseLedger({ hash: sha256, clock });

  // [7] The seven-receipt ceremony (order Deliverable 2).
  const timestamp = clock();
  const ceremonyPayloads: Record<(typeof RECEIPT_KINDS)[number], Record<string, string>> = {
    constitutional: {
      articles: articles
        .map((article) => `${article.article}:${article.passed ? 'demonstrated' : 'NOT-DEMONSTRATED'}`)
        .join(';'),
    },
    build: {
      buildId: build.buildId,
      sourceTreeHash: build.sourceTreeHash,
      outputDigest: build.outputDigest,
      deterministic: 'proven by double execution (verify-build)',
    },
    artifact: {
      artifacts: artifacts.map((artifact) => artifact.artifactId).join(';'),
      anonymous: 'none',
    },
    registry: {
      registryVersion,
      ruleSet: 'Constitution 2.6–2.8',
    },
    snapshot: {
      snapshotVersion: input.snapshotVersion,
      ruleSet: 'Constitution 9.3; F-002',
    },
    integrity: {
      buildHash: build.sourceTreeHash,
      ledgerIntegrity: 'recomputable from the append-only chain',
      algorithm: 'sha256 (FIPS 180-2 vectors attested)',
    },
    distribution: {
      channels: DISTRIBUTION_CHANNELS.join(';'),
      deliveryState: 'signed — delivery awaits external evidence (IR-019)',
    },
  };
  const ceremonyCitations: Record<(typeof RECEIPT_KINDS)[number], Citation[]> = {
    constitutional: [implementation('10.2'), ...bibleArticles()],
    build: [implementation('10.3'), implementation('2.7'), implementation('P-6')],
    artifact: [implementation('10.1'), implementation('8.2')],
    registry: [implementation('2.8'), implementation('2.6')],
    snapshot: [implementation('9.3'), implementation('P-6'), implementation('F-002')],
    integrity: [implementation('8.8'), implementation('8.5')],
    distribution: [implementation('8.7'), implementation('8.8')],
  };
  const receipts = RECEIPT_KINDS.map((kind) =>
    issueReceipt({
      kind,
      releaseId,
      releaseVersion: version,
      timestamp,
      parentRelease: input.parentReleaseId,
      constitutionalVersion: cv,
      snapshotVersion: input.snapshotVersion,
      evidenceReferences: [
        `verification:${engine.areas.map((area) => `${area.area}:${area.passed ? 'PASS' : 'FAIL'}`).join('+')}`,
        `build:${build.buildId}`,
      ],
      chainReferences: [
        `release-ledger:${releaseId}`,
        input.parentReleaseId ? `parent:${input.parentReleaseId}` : 'parent:genesis',
      ],
      key: input.key,
      citations: ceremonyCitations[kind],
      payload: ceremonyPayloads[kind],
    }),
  );
  for (const receipt of receipts) {
    assertReceiptAnatomy(receipt);
    verifyReceiptIntegrity(receipt);
  }

  // [8] Append to the release chain — the release exists as history now.
  const entry = ledger.appendRelease({
    releaseId,
    version,
    receiptDigests: receipts.map((receipt) => receipt.sha256),
    citations: [implementation('10.3'), implementation('10.4')],
  });

  // [9] The Trust Engine verifies the ceremony — nothing is believed, not
  // even this authority's own issuance (8.8; order Deliverable 8).
  const bundle: TrustBundle = {
    releaseId,
    version,
    ledgerEntries: ledger.entries,
    receipts,
    artifacts,
    distribution,
  };
  const trust = verifyTrustBundle({ bundle, keys: [input.key], hash: sha256 });
  if (!trust.trusted) {
    // The release never existed as a trusted release. The ledger entry
    // cannot be withdrawn (append-only law) — so issuance refuses before
    // this state can be reached; this proof is the mechanical backstop.
    throw new ConstitutionalViolationError(
      '10.3 / 8.8',
      `The issued ceremony failed its own trust verification: ${trust.findings
        .filter((finding) => finding.verdict === 'FAIL')
        .map((finding) => `${finding.check}: ${finding.detail}`)
        .join(' | ')}. A release whose receipt cannot be produced does not ship (Constitution 10.3).`,
      AUTHORITY_CITATIONS,
    );
  }

  return Object.freeze({
    releaseId,
    version,
    build,
    engine,
    articles,
    receipts,
    artifacts,
    distribution,
    entry,
    ledger,
    trust,
  });
}
