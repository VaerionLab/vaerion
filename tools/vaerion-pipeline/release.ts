/**
 * VAERION PIPELINE — vaerion:release
 *
 * The Immutable Release Ceremony (order Deliverables 1–2; pipeline contract
 * §6): "executes the full graph; issues the release receipt."
 *
 * The ceremony:
 *   [1] executes the full graph — if one check fails, the release never
 *       exists (10.1);
 *   [2] executes the deterministic build over the real source tree
 *       (Deliverable 3);
 *   [3] issues the seven-receipt ceremony through the Release Authority
 *       (Deliverables 1–2), including artifact intelligence (Deliverable 4)
 *       and the eight distribution channels (Deliverable 7);
 *   [4] appends the release to the append-only ledger (10.4) and records
 *       the receipts under constitution/releases/ (F-006);
 *   [5] verifies its own ceremony with the Trust Engine — nothing is
 *       believed (Deliverable 8).
 *
 * Idempotent: re-running against an unchanged tree returns the issued
 * release after re-proving its integrity — history is never duplicated
 * (10.4; F-006 law 3).
 *
 * Citations: Constitution Part X, 10.1–10.4, 8.7–8.8, 2.8, 11.3, P-4, P-6;
 * Foundation Amendment F-006; Bible Art. III, VI, XI; order Deliverables
 * 1–8, 10.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { issueRelease } from '../../src/vaerion/release/authority';
import { executeBuild, RELEASE_BUILD_STEPS } from '../../src/vaerion/release/build';
import { RELEASE_ENGINE_NAME, RELEASE_ENGINE_VERSION, RELEASE_RULESET } from '../../src/vaerion/release/identity';
import { sha256 } from '../../src/vaerion/authorities/hash';
import { ConstitutionalViolationError } from '../../src/vaerion/foundation/authority';
import { implementation } from '../../src/vaerion/foundation/citations';
import {
  appendReleaseRecord,
  readReleaseIndex,
  type StoredReleaseRecord,
} from '../../src/vaerion/release/store';
import {
  computeSourceManifest,
  fileSha256,
  loadSigningKey,
  realPackageContents,
  registeredAnnouncementIds,
} from './stage10-common';
import { runFullGraph } from './full-graph';
import { writeEvidenceRecord, printEvidenceRecord, toEvidenceLines } from './record';

console.log('');
console.log('════════════════════════════════════════════════════════════');
console.log('  VAERION RELEASE CEREMONY — "Nothing is believed. Everything is verified."');
console.log('════════════════════════════════════════════════════════════');
console.log('');

// [1] The full graph. If one check fails, the release never exists (10.1).
console.log('— FULL GRAPH EXECUTION —');
const graph = runFullGraph();
if (!graph.allPassed) {
  const failed = graph.lines.filter((line) => !line.passed);
  const record = writeEvidenceRecord({
    command: 'vaerion:release',
    stageTag: 'stage10',
    verdict: 'FAIL',
    checks: toEvidenceLines(graph.lines.map((line) => ({ ...line, citations: ['Constitution 10.1 — no partial passes'] }))),
    citations: [implementation('10.1'), implementation('10.3')],
  });
  printEvidenceRecord(record);
  console.error('');
  console.error(`RELEASE REFUSED — ${failed.length} check(s) failed. The release never exists.`);
  failed.forEach((line) => console.error(`  · ${line.label}: ${line.evidence}`));
  process.exit(1);
}

// [2] Deterministic build over the real tree (order Deliverable 3).
const sourceManifest = computeSourceManifest();
const build = executeBuild({
  sourceManifest,
  steps: RELEASE_BUILD_STEPS,
  buildEngine: `${RELEASE_ENGINE_NAME} ${RELEASE_ENGINE_VERSION}`,
  ruleset: RELEASE_RULESET,
  hash: sha256,
});
console.log('');
console.log(`— DETERMINISTIC BUILD — buildId ${build.buildId} · tree ${build.sourceTreeHash.slice(0, 16)}…`);

// Release identity from the append-only ledger (parent, sequence).
const index = readReleaseIndex();
const releaseCount = index?.entries.filter((entry) => entry.kind === 'release').length ?? 0;
const sequence = releaseCount + 1;
const parentReleaseId =
  [...(index?.entries ?? [])].reverse().find((entry) => entry.kind === 'release' || entry.kind === 'rollback')
    ?.releaseId ?? null;

const key = loadSigningKey();

// [3] The ceremony through the Release Authority.
let issued;
try {
  issued = issueRelease({
    protocol: graph.protocol,
    volumeStage: 10,
    sequence,
    snapshotVersion: graph.snapshotVersion,
    parentReleaseId,
    sourceManifest,
    packageContents: realPackageContents(),
    artifactSpecifications: [
      {
        kind: 'binding',
        name: 'generated/css/vaerion-tokens.css',
        sha256: fileSha256('generated/css/vaerion-tokens.css'),
        origin: 'the canonical Registry compiler (Constitution 2.7)',
        provingSnapshots: [graph.snapshotVersion],
      },
      {
        kind: 'binding',
        name: 'generated/typescript/tokens.ts',
        sha256: fileSha256('generated/typescript/tokens.ts'),
        origin: 'the canonical Registry compiler (Constitution 2.7)',
        provingSnapshots: [graph.snapshotVersion],
      },
      {
        kind: 'manifest',
        name: 'generated/tokens/registry.json',
        sha256: fileSha256('generated/tokens/registry.json'),
        origin: 'the canonical Registry compiler (Constitution 2.7)',
        provingSnapshots: [graph.snapshotVersion],
      },
      {
        kind: 'manifest',
        name: 'tools/vaerion-pipeline/snapshots/manifest.json',
        sha256: fileSha256('tools/vaerion-pipeline/snapshots/manifest.json'),
        origin: 'the Snapshot Authority working set (9.3; F-002; IR-015)',
        provingSnapshots: [graph.snapshotVersion],
      },
    ],
    announcementIds: registeredAnnouncementIds(),
    constitutionEvidence:
      graph.lines.find((line) => line.label.startsWith('stage 1'))?.evidence ?? 'constitution evidence unavailable',
    registryEvidence:
      graph.lines.find((line) => line.label.startsWith('stage 2'))?.evidence ?? 'registry evidence unavailable',
    snapshotEvidence:
      graph.lines.find((line) => line.label.startsWith('snapshots'))?.evidence ?? 'snapshot evidence unavailable',
    key,
    clock: () => Date.now(),
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  const record = writeEvidenceRecord({
    command: 'vaerion:release',
    stageTag: 'stage10',
    verdict: 'FAIL',
    checks: toEvidenceLines([{ label: 'release authority', passed: false, evidence: message }]),
    citations: [implementation('10.1'), implementation('10.3')],
  });
  printEvidenceRecord(record);
  console.error('');
  console.error(`RELEASE REFUSED — the release never exists (Constitution 10.1; 10.3).`);
  console.error(`  · ${message}`);
  process.exit(1);
}

// [4] Record under the F-006 release record authority (append-only; idempotent).
const storedRecord: StoredReleaseRecord = {
  releaseId: issued.releaseId,
  version: issued.version,
  seq: issued.entry.seq,
  appendedAt: issued.entry.appendedAt,
  receipts: issued.receipts,
  artifacts: issued.artifacts,
  distribution: issued.distribution,
  entry: issued.entry,
};
const { stored } = appendReleaseRecord(storedRecord);

// [5] The ceremony report — every step accounted for.
console.log('');
console.log('— CEREMONY RECEIPTS —');
for (const receipt of issued.receipts) {
  console.log(
    `  ${receipt.kind.padEnd(14)} ${receipt.receiptId}  sha256:${receipt.sha256.slice(0, 16)}…  signed:${receipt.signature.slice(5, 21)}…`,
  );
}
console.log('');
console.log('— ARTIFACT INTELLIGENCE —');
for (const artifact of issued.artifacts) {
  console.log(`  ${artifact.artifactId}  ${artifact.name}  owned by ${artifact.owningRelease}`);
}
console.log('');
console.log('— DISTRIBUTION (signed; delivery awaits external evidence — IR-019) —');
for (const record of issued.distribution) {
  console.log(`  ${record.channel.padEnd(14)} ${record.distributionId}  ${record.stage}`);
}
console.log('');
console.log('— TRUST VERIFICATION —');
for (const finding of issued.trust.findings) {
  console.log(`  [${finding.verdict}] ${finding.check}: ${finding.detail}`);
}

const checks = [
  ...graph.lines.map((line) => ({ ...line, citations: ['Constitution 10.1 — the full graph executes'] as const })),
  {
    label: 'ceremony — seven receipts issued with mandated anatomy',
    passed: issued.receipts.length === 7,
    evidence: issued.receipts.map((receipt) => `${receipt.kind}:${receipt.sha256.slice(0, 12)}`).join(' '),
    citations: ['Constitution 10.3; order Deliverable 2'] as const,
  },
  {
    label: 'ceremony — release appended to the append-only ledger',
    passed: issued.entry.kind === 'release',
    evidence: `seq ${issued.entry.seq} · ${issued.releaseId} · ${issued.version} · parent ${issued.entry.parentReleaseId ?? 'genesis'}`,
    citations: ['Constitution 10.4'] as const,
  },
  {
    label: 'ceremony — receipts recorded under constitution/releases/ (F-006)',
    passed: true,
    evidence: stored ? `appended ${issued.releaseId}` : `already issued — existing record re-verified (idempotent, 10.4)`,
    citations: ['Foundation Amendment F-006'] as const,
  },
  {
    label: 'ceremony — trust verification of the issued release',
    passed: issued.trust.trusted,
    evidence: `${issued.trust.findings.length} findings, all recomputed`,
    citations: ['Constitution 8.8; order Deliverable 8'] as const,
  },
];

const verdict = checks.every((check) => check.passed) ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:release',
  stageTag: 'stage10',
  verdict,
  checks: toEvidenceLines(checks),
  citations: [implementation('Part X'), implementation('10.3'), implementation('10.4')],
});
printEvidenceRecord(record);

console.log('');
console.log(`RELEASE ${stored ? 'ISSUED' : 'ALREADY ISSUED'}: ${issued.releaseId} — ${issued.version}`);
console.log(
  `  constitution: ${issued.receipts[0].constitutionalVersion}`,
);
console.log(`  receipts: ${issued.receipts.length} · artifacts: ${issued.artifacts.length} · channels: ${issued.distribution.length}`);
console.log(
  `  receipt chain: constitution/releases/receipts/${issued.releaseId}.receipts.json`,
);
console.log('');
console.log('"I don\'t hope this release is correct. I can prove it."');
if (record.verdict === 'FAIL') {
  process.exit(1);
}
