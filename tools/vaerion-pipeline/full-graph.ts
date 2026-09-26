/**
 * VAERION PIPELINE — the full release verification graph
 *
 * "vaerion:release executes the full graph; issues the release receipt"
 * (pipeline contract §6). Both verify-release and the ceremony compose THIS
 * graph — one implementation, no drift between the gate and the ceremony.
 *
 * Citations: Constitution 10.1, 10.2, 9.1; pipeline contract §2, §6; order
 * Deliverables 5 and 10.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  runEngineVerification,
  articleGate,
  type EngineVerification,
  type ArticleGateResult,
} from '../../src/vaerion/release/verification';
import { assertNoManifestDrift, loadPinnedManifest, loadWorkingCaptures, verifySnapshotIntegrity } from '../../src/vaerion/testing/snapshot';
import { sha256 } from '../../src/vaerion/authorities/hash';
import { computeSourceManifest, readProtocolVersion, registeredAnnouncementIds } from './stage10-common';

export interface GraphLine {
  readonly label: string;
  readonly passed: boolean;
  readonly evidence: string;
}

export interface FullGraphResult {
  readonly lines: readonly GraphLine[];
  readonly engine: EngineVerification | null;
  readonly articles: readonly ArticleGateResult[];
  readonly allPassed: boolean;
  readonly snapshotVersion: string;
  readonly protocol: string;
  readonly sourceFileCount: number;
}

/** The standing stage verifiers the graph executes as real subprocesses. */
export const STAGE_COMMANDS: readonly { readonly script: string; readonly label: string }[] = Object.freeze([
  { script: 'verify-constitution.ts', label: 'stage 1 — constitution digests (F-001/F-002)' },
  { script: 'compile-registry.ts', label: 'stage 2 — registry compilation + reproducibility' },
  { script: 'verify-primitives.ts', label: 'stage 3 — primitive conformance' },
  { script: 'verify-state.ts', label: 'stage 5 — the twelve state gates' },
  { script: 'verify-interaction.ts', label: 'stage 6 — the fifteen interaction gates' },
  { script: 'verify-rendering.ts', label: 'stage 7 — the fourteen rendering gates' },
  { script: 'verify-authorities.ts', label: 'stage 8 — the sixteen authority gates' },
  { script: 'verify-snapshots.ts', label: 'stage 9 — Snapshot Authority engine' },
  { script: 'verify-parity.ts', label: 'stage 9 — Parity Harness + visual areas' },
  { script: 'verify-accessibility.ts', label: 'stage 9 — accessibility engine' },
  { script: 'verify-performance.ts', label: 'stage 9 — performance gates' },
  { script: 'verify-security.ts', label: 'stage 9 — the eight refusal proofs' },
]);

/**
 * Executes the full graph. Prints progress. Never throws for a failed
 * check — the caller decides the consequence (10.1: the caller refuses the
 * release).
 */
export function runFullGraph(options?: { readonly quiet?: boolean }): FullGraphResult {
  const say = (line: string): void => {
    if (!options?.quiet) console.log(line);
  };
  const lines: GraphLine[] = [];

  for (const command of STAGE_COMMANDS) {
    const script = join(process.cwd(), 'tools', 'vaerion-pipeline', command.script);
    if (!existsSync(script)) {
      lines.push({ label: command.label, passed: false, evidence: `verifier missing: ${command.script}` });
      say(`[FAIL] ${command.label} — verifier missing`);
      continue;
    }
    const result = spawnSync(process.execPath, [script], { encoding: 'utf8', timeout: 180_000 });
    const passed = result.status === 0;
    const tail = (result.stdout ?? '').trim().split('\n').filter(Boolean).slice(-1)[0] ?? '(no output)';
    lines.push({
      label: command.label,
      passed,
      evidence: passed ? tail : `exit ${result.status}: ${(result.stderr ?? tail).slice(0, 240)}`,
    });
    say(`[${passed ? 'PASS' : 'FAIL'}] ${command.label}`);
  }

  // In-process snapshot integrity (the working capture set).
  let snapshotVersion = 'unpinned';
  try {
    const manifest = loadPinnedManifest();
    if (!manifest) throw new Error('no snapshot manifest pinned — run vaerion:verify-snapshots first');
    const records = loadWorkingCaptures();
    for (const record of records) {
      verifySnapshotIntegrity(record, sha256, manifest.pins.find((pin) => pin.snapshotId === record.snapshotId));
    }
    assertNoManifestDrift({ manifest, records, hash: sha256 });
    snapshotVersion = manifest.manifestId;
    lines.push({
      label: 'snapshots — working capture set integrity',
      passed: true,
      evidence: `${records.length} records integrity-verified against "${manifest.manifestId}", zero drift`,
    });
    say(`[PASS] snapshots — working capture set integrity (${records.length} records)`);
  } catch (error) {
    lines.push({
      label: 'snapshots — working capture set integrity',
      passed: false,
      evidence: error instanceof Error ? error.message : String(error),
    });
    say(`[FAIL] snapshots — working capture set integrity`);
  }

  // Deterministic source manifest availability.
  let sourceFileCount = 0;
  try {
    sourceFileCount = computeSourceManifest().length;
    lines.push({
      label: 'build — deterministic source manifest',
      passed: true,
      evidence: `${sourceFileCount} source files hashable; determinism proven by vaerion:verify-build`,
    });
    say(`[PASS] build — deterministic source manifest (${sourceFileCount} files)`);
  } catch (error) {
    lines.push({
      label: 'build — deterministic source manifest',
      passed: false,
      evidence: error instanceof Error ? error.message : String(error),
    });
    say('[FAIL] build — deterministic source manifest');
  }

  // Protocol version (11.3).
  let protocol = '';
  try {
    protocol = readProtocolVersion();
    lines.push({ label: 'governance — changelog protocol version', passed: true, evidence: `protocol ${protocol} (11.3)` });
    say(`[PASS] governance — changelog protocol version ${protocol}`);
  } catch (error) {
    lines.push({
      label: 'governance — changelog protocol version',
      passed: false,
      evidence: error instanceof Error ? error.message : String(error),
    });
    say('[FAIL] governance — changelog protocol version');
  }

  // In-process engine battery.
  let engine: EngineVerification | null = null;
  try {
    engine = runEngineVerification({ announcementIds: registeredAnnouncementIds() });
    for (const area of engine.areas) {
      lines.push({ label: `engine — ${area.area}`, passed: area.passed, evidence: area.evidence });
      say(`[${area.passed ? 'PASS' : 'FAIL'}] engine — ${area.area}`);
    }
  } catch (error) {
    lines.push({
      label: 'engine — in-process battery',
      passed: false,
      evidence: error instanceof Error ? error.message : String(error),
    });
    say('[FAIL] engine — in-process battery');
  }

  // The Article Gate (10.2) — demonstrated from real evidence only.
  let articles: readonly ArticleGateResult[] = [];
  if (engine && engine.allPassed) {
    try {
      articles = articleGate({
        engine,
        constitutionEvidence: lines.find((line) => line.label.startsWith('stage 1'))?.evidence ?? 'constitution evidence unavailable',
        registryEvidence: lines.find((line) => line.label.startsWith('stage 2'))?.evidence ?? 'registry evidence unavailable',
        snapshotEvidence: lines.find((line) => line.label.startsWith('snapshots'))?.evidence ?? 'snapshot evidence unavailable',
      });
      for (const article of articles) {
        lines.push({
          label: `Article Gate — Art. ${article.article} (${article.requirement})`,
          passed: article.passed,
          evidence: article.evidence,
        });
        say(`[${article.passed ? 'PASS' : 'FAIL'}] Article Gate — Art. ${article.article}`);
      }
    } catch (error) {
      lines.push({
        label: 'Article Gate',
        passed: false,
        evidence: error instanceof Error ? error.message : String(error),
      });
      say('[FAIL] Article Gate');
    }
  } else {
    lines.push({
      label: 'Article Gate',
      passed: false,
      evidence: 'the engine battery did not pass — the Article Gate cannot be demonstrated on failed evidence (10.1)',
    });
    say('[FAIL] Article Gate — engine battery failed');
  }

  return {
    lines,
    engine,
    articles,
    allPassed: lines.every((line) => line.passed),
    snapshotVersion,
    protocol,
    sourceFileCount,
  };
}
