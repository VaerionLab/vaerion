/**
 * VAERION PIPELINE — vaerion:verify-distribution
 *
 * The distribution gate (order Deliverable 7): all eight declared channels
 * prepare real packages carrying constitutional identity; manifests are
 * computed and signed through the 8.7–8.8 lifecycle; third-party
 * verification recomputes; anonymous packages, quarantined content, and
 * evidence-free delivery claims are refused.
 *
 * Citations: Constitution 8.7, 8.8, 5.10, 10.3; Bible Art. III, VIII; order
 * Deliverables 7 and 10.
 */

import {
  createDistributionEngine,
  DISTRIBUTION_CHANNELS,
  type DistributionRecord,
} from '../../src/vaerion/release/distribution';
import { registryVersion, RELEASE_RULESET } from '../../src/vaerion/release/identity';
import { signReceiptBody } from '../../src/vaerion/release/receipt';
import { sha256 } from '../../src/vaerion/authorities/hash';
import { ConstitutionalViolationError } from '../../src/vaerion/foundation/authority';
import { implementation } from '../../src/vaerion/foundation/citations';
import { fileSha256, loadSigningKey } from './stage10-common';
import { writeEvidenceRecord, printEvidenceRecord, toEvidenceLines } from './record';

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

console.log('VAERION RELEASE GATE — verify-distribution (order Deliverable 7)');
console.log('');

/** The real package contents each channel would carry (hashed from the repository). */
function realPackageContents(): Record<string, { name: string; sha256: string }[]> {
  return {
    npm: [
      { name: 'packaging/npm/package.json', sha256: fileSha256('packaging/npm/package.json') },
      { name: 'packaging/npm/bin/vae.js', sha256: fileSha256('packaging/npm/bin/vae.js') },
      { name: 'packaging/npm/make-package.sh', sha256: fileSha256('packaging/npm/make-package.sh') },
    ],
    pypi: [
      { name: 'packaging/python/pyproject.toml', sha256: fileSha256('packaging/python/pyproject.toml') },
      { name: 'packaging/python/vaerion/cli.py', sha256: fileSha256('packaging/python/vaerion/cli.py') },
    ],
    vscode: [
      { name: 'editors/vscode/extension.js', sha256: fileSha256('editors/vscode/extension.js') },
      { name: 'editors/vscode/package.json', sha256: fileSha256('editors/vscode/package.json') },
    ],
    jetbrains: [
      { name: 'editors/jetbrains/build.gradle.kts', sha256: fileSha256('editors/jetbrains/build.gradle.kts') },
      { name: 'editors/jetbrains/settings.gradle.kts', sha256: fileSha256('editors/jetbrains/settings.gradle.kts') },
    ],
    neovim: [{ name: 'editors/nvim/lua/vaerion/init.lua', sha256: fileSha256('editors/nvim/lua/vaerion/init.lua') }],
    cli: [
      { name: 'packages/vaerion/src/cli/vae.ts', sha256: fileSha256('packages/vaerion/src/cli/vae.ts') },
      { name: 'packages/vaerion/src/cli/commands.ts', sha256: fileSha256('packages/vaerion/src/cli/commands.ts') },
    ],
    'docs-bundle': [
      { name: 'docs/book/README.md', sha256: fileSha256('docs/book/README.md') },
      { name: 'docs/SDK.md', sha256: fileSha256('docs/SDK.md') },
    ],
    'offline-bundle': [
      { name: 'llms.txt', sha256: fileSha256('llms.txt') },
      { name: 'llms-full.txt', sha256: fileSha256('llms-full.txt') },
    ],
  };
}

check('[1] all eight declared channels prepare signed packages with constitutional identity', () => {
  const engine = createDistributionEngine({ hash: sha256 });
  const key = loadSigningKey();
  const contents = realPackageContents();
  const records: DistributionRecord[] = [];
  for (const channel of DISTRIBUTION_CHANNELS) {
    const prepared = engine.preparePackage({
      channel,
      packageIdentity: `rel_distribution_probe 1.0.10.r0 ruleset=${RELEASE_RULESET} registry=${registryVersion()}`,
      contents: contents[channel],
    });
    const manifested = engine.computePackageManifest({
      channel,
      timestampAuthority: 'release ceremony clock (declared at issuance — P-6)',
      issuingEngine: 'vaerion-release-engine (verify-distribution probe)',
      ruleset: RELEASE_RULESET,
    });
    const signature = signReceiptBody({ canonicalBody: `dist-manifest:${manifested.manifest!.manifestId}`, key });
    records.push(engine.signPackage({ channel, signature }));
  }
  const verification = records.every(
    (record) => engine.verifyPackage({ record, contentHashes: record.contentHashes }).verifiable,
  );
  if (!verification) throw new Error('a signed package failed third-party recomputation (Constitution 8.8)');
  return `${records.length}/8 channels (npm, pypi, vscode, jetbrains, neovim, cli, docs-bundle, offline-bundle) — identity carried, manifests signed and recomputed`;
});

check('[2] an anonymous package is refused', () => {
  const engine = createDistributionEngine({ hash: sha256 });
  try {
    engine.preparePackage({ channel: 'npm', packageIdentity: '', contents: [{ name: 'x', sha256: sha256('x') }] });
    throw new Error('an anonymous package was prepared (order Deliverable 7)');
  } catch (error) {
    if (!(error instanceof ConstitutionalViolationError)) throw error;
    return 'anonymous package refused with ConstitutionalViolationError — every package carries constitutional identity';
  }
});

check('[3] quarantined content never enters a package (5.10; 8.7)', () => {
  const engine = createDistributionEngine({ hash: sha256 });
  try {
    engine.preparePackage({
      channel: 'npm',
      packageIdentity: 'probe',
      contents: [{ name: 'demo-quarantine-record.json', sha256: sha256('demo') }],
    });
    throw new Error('quarantined content entered a package (Constitution 5.10)');
  } catch (error) {
    if (!(error instanceof ConstitutionalViolationError)) throw error;
    return 'quarantine violation refused with ConstitutionalViolationError — demo content never ships (5.10; 8.7)';
  }
});

check('[4] delivery without external evidence is honestly refused — deployment history is never fabricated', () => {
  const engine = createDistributionEngine({ hash: sha256 });
  const key = loadSigningKey();
  engine.preparePackage({
    channel: 'cli',
    packageIdentity: 'probe',
    contents: [{ name: 'packages/vaerion/src/cli/vae.ts', sha256: fileSha256('packages/vaerion/src/cli/vae.ts') }],
  });
  engine.computePackageManifest({
    channel: 'cli',
    timestampAuthority: 'probe',
    issuingEngine: 'probe',
    ruleset: RELEASE_RULESET,
  });
  engine.signPackage({ channel: 'cli', signature: signReceiptBody({ canonicalBody: 'probe', key }) });
  try {
    engine.markDelivered({ channel: 'cli' });
    throw new Error('delivery was asserted without evidence (Art. VIII; IR-019)');
  } catch (error) {
    if (!(error instanceof ConstitutionalViolationError)) throw error;
    return "delivery refused with ConstitutionalViolationError — the lifecycle stops honestly at 'signed' (Art. VIII; IR-019)";
  }
});

const verdict = lines.every((line) => line.passed) ? 'PASS' : 'FAIL';
const record = writeEvidenceRecord({
  command: 'vaerion:verify-distribution',
  stageTag: 'stage10',
  verdict,
  checks: toEvidenceLines(lines.map((line) => ({ ...line, citations: ['Constitution 8.7; 8.8; 5.10; order Deliverable 7'] }))),
  citations: [implementation('8.7'), implementation('8.8'), implementation('10.3')],
});
printEvidenceRecord(record);
if (record.verdict === 'FAIL') {
  console.error('VERIFY-DISTRIBUTION: FAIL — a package without identity does not ship (order Deliverable 7).');
  process.exit(1);
}
console.log('VERIFY-DISTRIBUTION: PASS — eight channels, one constitutional identity.');
