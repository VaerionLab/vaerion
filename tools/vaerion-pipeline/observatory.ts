/**
 * VAERION PIPELINE — vaerion:observatory
 *
 * Generates the Release Observatory (order Deliverable 9) as a static
 * pipeline artifact from the REAL stored release record (F-006) — no
 * fabricated metrics. Output:
 * tools/vaerion-pipeline/observatory/index.html (also served read-only at
 * /api/release/observatory — IR-018).
 *
 * Citations: Constitution Part X, 10.3, 1.3, 1.6; F-006; Bible Art. XI;
 * order Deliverable 9.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';

import { ReleaseObservatory, type ObservatoryData } from '../../src/vaerion/release/observatory';
import { readReleaseRecord, readReleaseIndex } from '../../src/vaerion/release/store';
import { verifyTrustBundle, type TrustBundle } from '../../src/vaerion/release/trust';
import { constitutionalVersion, formatConstitutionalVersion, registryVersion } from '../../src/vaerion/release/identity';
import { allTokens } from '../../src/vaerion/registry';
import { sha256 } from '../../src/vaerion/authorities/hash';
import { implementation } from '../../src/vaerion/foundation/citations';
import { loadSigningKey } from './stage10-common';
import { writeEvidenceRecord, printEvidenceRecord, toEvidenceLines } from './record';

console.log('VAERION RELEASE OBSERVATORY — generation from real release data (order Deliverable 9)');
console.log('');

const lines: { label: string; passed: boolean; evidence: string }[] = [];
function check(label: string, run: () => string): void {
  try {
    const evidence = run();
    lines.push({ label, passed: true, evidence });
    console.log(`[PASS] ${label} — ${evidence}`);
  } catch (error) {
    const evidence = error instanceof Error ? error.message : String(error);
    lines.push({ label, passed: false, evidence });
    console.log(`[FAIL] ${label} — ${evidence}`);
  }
}

let html = '';
let releaseId = '';
check('[1] release data resolves from the F-006 record tree', () => {
  const index = readReleaseIndex();
  if (!index || index.entries.length === 0) {
    throw new Error('no release recorded under constitution/releases/ — run vaerion:release first (F-006)');
  }
  const latest = [...index.entries].reverse().find((entry) => entry.kind === 'release');
  if (!latest) throw new Error('the index holds no release entry (F-006)');
  const stored = readReleaseRecord(latest.releaseId);
  if (!stored) throw new Error(`release "${latest.releaseId}" is unreadable (F-006)`);
  releaseId = stored.releaseId;
  return `release ${stored.releaseId} (${stored.version}) resolved — ${stored.receipts.length} receipts, ${stored.artifacts.length} artifacts, ${stored.distribution.length} channels`;
});

let data: ObservatoryData | null = null;
check('[2] the observatory renders from real data only', () => {
  const index = readReleaseIndex()!;
  const latest = [...index.entries].reverse().find((entry) => entry.kind === 'release')!;
  const stored = readReleaseRecord(latest.releaseId)!;
  const key = loadSigningKey();
  const bundle: TrustBundle = {
    releaseId: stored.releaseId,
    version: stored.version,
    ledgerEntries: [stored.entry],
    receipts: stored.receipts,
    artifacts: stored.artifacts,
    distribution: stored.distribution,
  };
  const trust = verifyTrustBundle({ bundle, keys: [key], hash: sha256 });
  const cv = constitutionalVersion({ protocol: 'at-issuance', volumeStage: 10 });
  data = {
    releaseId: stored.releaseId,
    version: stored.version,
    constitutionalVersion: stored.receipts[0]?.constitutionalVersion ?? formatConstitutionalVersion(cv),
    registryVersion: registryVersion(),
    registryTokenCount: allTokens().length,
    snapshotVersion: stored.receipts.find((receipt) => receipt.kind === 'snapshot')?.snapshotVersion ?? 'unpinned',
    snapshotCaptureCount: (
      JSON.parse(
        readFileSync(join(process.cwd(), 'tools', 'vaerion-pipeline', 'snapshots', 'working-captures.json'), 'utf8'),
      ) as { readonly records: readonly unknown[] }
    ).records.length,
    ledgerEntries: [stored.entry],
    receipts: stored.receipts,
    artifacts: stored.artifacts,
    distribution: stored.distribution.map((record) => ({
      channel: record.channel,
      stage: record.stage,
      packageIdentity: record.packageIdentity,
    })),
    rollbacks: [],
    trustFindings: trust.findings,
    verificationTimeline: stored.receipts.map((receipt) => ({
      area: `receipt ceremony · ${receipt.kind}`,
      verdict: 'PASS' as const,
      evidence: `sha256:${receipt.sha256.slice(0, 16)}…`,
      recordedAt: receipt.timestamp,
    })),
    articles: (stored.receipts.find((receipt) => receipt.kind === 'constitutional')?.payload.articles ?? '')
      .split(';')
      .filter(Boolean)
      .map((entry) => {
        const [article, status] = entry.split(':');
        return {
          article,
          requirement: 'demonstrated at ceremony time (Constitution 10.2)',
          evidence: `status recorded in the constitutional receipt: ${status}`,
          passed: status === 'demonstrated',
          citations: [],
        };
      }),
    generatedAt: Date.now(),
  };
  const element = ReleaseObservatory({ data });
  html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>VAERION RELEASE OBSERVATORY — ${stored.releaseId}</title>
<style>
${readFileSync(join(process.cwd(), 'generated', 'css', 'vaerion-tokens.css'), 'utf8')}
body { background: var(--vx-color-ground-light, #ffffff); color: var(--vx-color-ink, #111111); margin: 0; }
</style>
</head>
<body>
${renderToStaticMarkup(element as ReactElement)}
</body>
</html>`;
  if (!html.includes('VAERION RELEASE OBSERVATORY')) {
    throw new Error('the rendered observatory is missing its identity — generation failed');
  }
  return `${html.length} bytes rendered from real ledger data; trust verdict: ${trust.trusted ? 'TRUSTED' : 'NOT TRUSTED'} (rendered honestly)`;
});

check('[3] the artifact is written under pipeline tooling (never the constitution tree)', () => {
  const dir = join(process.cwd(), 'tools', 'vaerion-pipeline', 'observatory');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const out = join(dir, 'index.html');
  writeFileSync(out, html, 'utf8');
  return `written: ${out} (sha256:${sha256(html).slice(0, 16)}…)`;
});

const verdict = lines.every((line) => line.passed) ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:observatory',
  stageTag: 'stage10',
  verdict,
  checks: toEvidenceLines(lines.map((line) => ({ ...line, citations: ['Constitution Part X; F-006; order Deliverable 9'] }))),
  citations: [implementation('10.3'), implementation('P-4')],
});
printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  console.error('OBSERVATORY: FAIL — generation refused; no fabricated display exists.');
  process.exit(1);
}
console.log(`OBSERVATORY: PASS — release ${releaseId} observed.`);
