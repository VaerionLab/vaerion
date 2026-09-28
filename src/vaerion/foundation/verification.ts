/**
 * Vaerion — Foundation / Mechanical Prerequisite Verification (Node)
 *
 * fs-based proofs for the constitutional prerequisites declared in
 * foundation/prerequisites.ts. This module is the machinery behind the
 * Snapshot Authority's verification commitment (F-001/F-002) and the gate
 * resolver used by tools/vaerion-pipeline.
 *
 * NODE-ONLY: imports node:fs / node:crypto / node:url. It is intentionally
 * NOT exported from the pure foundation barrel; import it directly from
 * pipeline tooling (tools/vaerion-pipeline/*).
 *
 * Citations:
 * - Foundation Amendment F-001: "Verification must prove the repository
 *   copies are identical to the ratified originals."
 * - Foundation Amendment F-002: Snapshot Authority — manifests pin digests;
 *   verification is digest-first, fail-closed.
 * - Foundation Amendment F-007: prerequisites unmet -> ConstitutionalViolation.
 * - Implementation Constitution 9.1 (mechanical, binary checks), P-4.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ConstitutionalViolationError } from './authority';
import {
  CONSTITUTION_DOCUMENT_FILES,
  CONSTITUTION_PATHS,
  GENERATED_PATHS,
  IMPLEMENTATION_ROOT,
  WORKLOG_PATH,
} from './paths';
import type { PrerequisiteProof, PrerequisiteResolver } from './gate';
import { assertDependencyGraphIntegrity, assertStageMayBegin } from './gate';
import type { StageId } from './stages';

const REPO_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
);

function sha256OfFile(absolutePath: string): string {
  return createHash('sha256').update(readFileSync(absolutePath)).digest('hex');
}

function fileExists(relativePath: string): boolean {
  return existsSync(join(REPO_ROOT, relativePath));
}

function dirExists(relativePath: string): boolean {
  const p = join(REPO_ROOT, relativePath);
  return existsSync(p) && statSync(p).isDirectory();
}

function readRepoFile(relativePath: string): string {
  return readFileSync(join(REPO_ROOT, relativePath), 'utf8');
}

interface CanonicalDocumentPin {
  readonly id: string;
  readonly title: string;
  readonly path: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly transcriptionItem: string | null;
}

interface CanonicalDocumentsManifest {
  readonly manifestId: string;
  readonly algorithm: string;
  readonly documents: readonly CanonicalDocumentPin[];
  readonly verification: { readonly command: string };
}

/** Loads and structurally validates the canonical-documents manifest (F-002). */
export function loadCanonicalDocumentsManifest(): CanonicalDocumentsManifest {
  const manifestPath = CONSTITUTION_PATHS.canonicalDocumentsManifest;
  if (!fileExists(manifestPath)) {
    throw new ConstitutionalViolationError(
      'F-002/SNAPSHOT',
      `Canonical documents manifest missing at ${manifestPath}. The Snapshot Authority cannot prove transcription identity without it.`,
    );
  }
  const manifest = JSON.parse(readRepoFile(manifestPath)) as CanonicalDocumentsManifest;
  if (manifest.manifestId !== 'canonical-documents' || manifest.algorithm !== 'sha256') {
    throw new ConstitutionalViolationError(
      'F-002/SNAPSHOT',
      `Manifest at ${manifestPath} is not the canonical-documents sha256 manifest.`,
    );
  }
  if (!Array.isArray(manifest.documents) || manifest.documents.length !== 3) {
    throw new ConstitutionalViolationError(
      'F-002/SNAPSHOT',
      `Manifest must pin exactly the three ratified documents; found ${manifest.documents?.length ?? 0}.`,
    );
  }
  return manifest;
}

/**
 * Verifies one pinned document: recomputes its digest and byte length and
 * compares to the pin. Any mismatch is a ConstitutionalViolationError —
 * the file has diverged from the ratified original (F-001).
 */
export function verifyDocumentPin(pin: CanonicalDocumentPin): PrerequisiteProof {
  const evidenceId = `${pin.id} @ ${pin.path}`;
  if (!fileExists(pin.path)) {
    return { id: pin.id, satisfied: false, evidence: `MISSING: ${evidenceId}` };
  }
  const absolute = join(REPO_ROOT, pin.path);
  const digest = sha256OfFile(absolute);
  const bytes = statSync(absolute).size;
  if (digest !== pin.sha256) {
    throw new ConstitutionalViolationError(
      'F-001/SNAPSHOT',
      `Canonical document ${evidenceId} does not match its pinned digest. Pinned ${pin.sha256.slice(0, 16)}…, found ${digest.slice(0, 16)}…. The repository copy has diverged from the ratified original; changes require the amendment pathway (Constitution 11.2–11.3).`,
    );
  }
  if (bytes !== pin.bytes) {
    throw new ConstitutionalViolationError(
      'F-001/SNAPSHOT',
      `Canonical document ${evidenceId} byte size drifted: pinned ${pin.bytes}, found ${bytes}. Digest and size must both match the pin.`,
    );
  }
  return { id: pin.id, satisfied: true, evidence: `sha256 pinned digest matched (${pin.sha256.slice(0, 16)}…) and byte size ${pin.bytes}` };
}

const TRANSCRIPTION_RECORD_MARKER = 'TRANSCRIPTION RECORD';

function proofForDocumentTranscription(documentId: 'BIBLE' | 'VISUAL_SYSTEM'): PrerequisiteProof {
  const manifest = loadCanonicalDocumentsManifest();
  const pin = manifest.documents.find((d) => d.id === documentId);
  if (!pin) {
    return {
      id: documentId,
      satisfied: false,
      evidence: `manifest ${CONSTITUTION_PATHS.canonicalDocumentsManifest} pins no document "${documentId}"`,
    };
  }
  const digestProof = verifyDocumentPin(pin);
  if (!digestProof.satisfied) return digestProof;

  // The transcription apparatus must be present and declared as apparatus.
  const text = readRepoFile(pin.path);
  if (!text.includes(TRANSCRIPTION_RECORD_MARKER)) {
    return {
      id: documentId,
      satisfied: false,
      evidence: `transcription record (apparatus) missing from ${pin.path}`,
    };
  }
  const governanceItem = documentId === 'BIBLE' ? 'DP-1' : 'DP-2';
  if (!text.includes(governanceItem)) {
    return {
      id: documentId,
      satisfied: false,
      evidence: `transcription record does not declare governance item ${governanceItem}`,
    };
  }
  return digestProof;
}

function proofForF001(): PrerequisiteProof {
  const bibleProof = proofForDocumentTranscription('BIBLE');
  const visualProof = proofForDocumentTranscription('VISUAL_SYSTEM');
  if (!bibleProof.satisfied) {
    return { id: 'F-001', satisfied: false, evidence: `BIBLE: ${bibleProof.evidence}` };
  }
  if (!visualProof.satisfied) {
    return { id: 'F-001', satisfied: false, evidence: `VISUAL_SYSTEM: ${visualProof.evidence}` };
  }
  // The authority index must record both transcriptions as complete.
  const index = readRepoFile(CONSTITUTION_PATHS.index);
  if (!index.includes('DP-1') || !index.includes('DP-2')) {
    return {
      id: 'F-001',
      satisfied: false,
      evidence: `constitution/INDEX.md does not record the DP-1/DP-2 transcription items`,
    };
  }
  return {
    id: 'F-001',
    satisfied: true,
    evidence: `both ratified documents digest-pinned and transcription-recorded; INDEX records DP-1/DP-2`,
  };
}

interface AuthorityStructureSpec {
  readonly id: string;
  readonly files: readonly string[];
  readonly dirs?: readonly string[];
  readonly markers?: readonly { readonly path: string; readonly needle: string }[];
}

const AUTHORITY_STRUCTURES: readonly AuthorityStructureSpec[] = [
  {
    id: 'F-002',
    files: [CONSTITUTION_PATHS.snapshotAuthorityReadme],
    dirs: [CONSTITUTION_PATHS.snapshotAuthoritySnapshots, CONSTITUTION_PATHS.snapshotAuthorityManifests],
    markers: [
      { path: CONSTITUTION_PATHS.snapshotAuthorityReadme, needle: 'SNAPSHOT AUTHORITY' },
    ],
  },
  {
    id: 'F-003',
    files: [CONSTITUTION_PATHS.announcementRegistryReadme],
    markers: [
      { path: CONSTITUTION_PATHS.announcementRegistryReadme, needle: 'ANNOUNCEMENT & COPY REGISTRY' },
    ],
  },
  {
    id: 'F-004',
    files: [CONSTITUTION_PATHS.registryAuthorityReadme, `${IMPLEMENTATION_ROOT}/registry/README.md`],
    markers: [
      { path: CONSTITUTION_PATHS.registryAuthorityReadme, needle: 'Constitutional Law of the Canonical Registry' },
      { path: `${IMPLEMENTATION_ROOT}/registry/README.md`, needle: 'constitution/registry/README.md' },
    ],
  },
  {
    id: 'F-005',
    files: [GENERATED_PATHS.readme],
    dirs: [GENERATED_PATHS.bindings, GENERATED_PATHS.tokens],
    markers: [{ path: GENERATED_PATHS.readme, needle: 'Never hand-authored' }],
  },
  {
    id: 'F-006',
    files: [CONSTITUTION_PATHS.releasesReadme],
    markers: [{ path: CONSTITUTION_PATHS.releasesReadme, needle: 'Release Receipts' }],
  },
];

function proofForAuthorityStructure(id: string): PrerequisiteProof {
  const spec = AUTHORITY_STRUCTURES.find((s) => s.id === id);
  if (!spec) {
    return { id, satisfied: false, evidence: `no structural proof registered for "${id}"` };
  }
  for (const f of spec.files) {
    if (!fileExists(f)) return { id, satisfied: false, evidence: `missing file: ${f}` };
  }
  for (const d of spec.dirs ?? []) {
    if (!dirExists(d)) return { id, satisfied: false, evidence: `missing directory: ${d}` };
  }
  for (const marker of spec.markers ?? []) {
    if (!readRepoFile(marker.path).includes(marker.needle)) {
      return { id, satisfied: false, evidence: `authority marker "${marker.needle}" absent from ${marker.path}` };
    }
  }
  return { id, satisfied: true, evidence: spec.files.map((f) => f).join(', ') + ' present with governing content' };
}

function proofForF007(): PrerequisiteProof {
  try {
    // Pure structural law: acyclicity, ordering, declarations, citations.
    assertDependencyGraphIntegrity();
  } catch (error) {
    return {
      id: 'F-007',
      satisfied: false,
      evidence: `dependency graph integrity failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
  const docPath = `${IMPLEMENTATION_ROOT}/docs/DEPENDENCY_GRAPH.md`;
  if (!fileExists(docPath)) {
    return { id: 'F-007', satisfied: false, evidence: `dependency graph documentation missing: ${docPath}` };
  }
  return {
    id: 'F-007',
    satisfied: true,
    evidence: `graph integrity verified (acyclic, ordered, declared); documentation at ${docPath}`,
  };
}

function proofForIR002Ratified(): PrerequisiteProof {
  const ledger = readRepoFile(CONSTITUTION_PATHS.interpretationsLedger);
  const section = ledger.split(/(?=^## IR-)/m).find((s) => s.startsWith('## IR-002'));
  if (!section) {
    return { id: 'IR-002-RATIFIED', satisfied: false, evidence: `IR-002 not found in ${CONSTITUTION_PATHS.interpretationsLedger}` };
  }
  const statusMatch = section.match(/\*\*Status:\*\*\s*(PROPOSED|RATIFIED|SUPERSEDED|DECLINED)/);
  const status = statusMatch?.[1] ?? 'UNKNOWN';
  if (status !== 'RATIFIED') {
    return {
      id: 'IR-002-RATIFIED',
      satisfied: false,
      evidence: `IR-002 status is ${status}; Stage 8 gate implementation awaits Founder ruling (P-5)`,
    };
  }
  return { id: 'IR-002-RATIFIED', satisfied: true, evidence: 'IR-002 recorded RATIFIED in the interpretation ledger' };
}

/**
 * Verifies every declared prerequisite mechanically and returns the full
 * proof record. Deterministic for a given repository state.
 */
export function verifyAllPrerequisites(): Readonly<Record<string, PrerequisiteProof>> {
  const proofs: Record<string, PrerequisiteProof> = {};
  proofs['DP-1'] = proofForDocumentTranscription('BIBLE');
  proofs['DP-2'] = proofForDocumentTranscription('VISUAL_SYSTEM');
  proofs['F-001'] = proofForF001();
  for (const id of ['F-002', 'F-003', 'F-004', 'F-005', 'F-006']) {
    proofs[id] = proofForAuthorityStructure(id);
  }
  proofs['F-007'] = proofForF007();
  // Standing evidence aliases share their amendment's proof.
  proofs['AUTH-ANNOUNCEMENT'] = proofForAuthorityStructure('F-003');
  proofs['AUTH-SNAPSHOT'] = proofForAuthorityStructure('F-002');
  proofs['AUTH-RELEASE'] = proofForAuthorityStructure('F-006');
  proofs['IR-002-RATIFIED'] = proofForIR002Ratified();
  return proofs;
}

/** A resolver over the mechanical proofs, memoized per call site usage. */
export function diskPrerequisiteResolver(): PrerequisiteResolver {
  const proofs = verifyAllPrerequisites();
  return (id: string) => {
    const proof = proofs[id];
    if (!proof) {
      throw new ConstitutionalViolationError(
        'F-007',
        `No mechanical proof registered for prerequisite "${id}". Unknown prerequisites are never improvised (P-5).`,
      );
    }
    return proof;
  };
}

/**
 * The Node-side one-call gate: asserts a stage may begin, using mechanical
 * disk proofs. Used by tools/vaerion-pipeline.
 */
export function assertStageMayBeginFromDisk(id: StageId) {
  return assertStageMayBegin(id, diskPrerequisiteResolver());
}

/** Verifies every pinned canonical document (Snapshot Authority commitment). */
export function verifyConstitution(): { readonly ok: boolean; readonly lines: readonly string[] } {
  const lines: string[] = [];
  let ok = true;
  let manifest: CanonicalDocumentsManifest;
  try {
    manifest = loadCanonicalDocumentsManifest();
  } catch (error) {
    return {
      ok: false,
      lines: [error instanceof Error ? error.message : String(error)],
    };
  }
  for (const pin of manifest.documents) {
    try {
      const proof = verifyDocumentPin(pin);
      lines.push(`[PASS] ${pin.id} ${pin.path} — ${proof.evidence}`);
    } catch (error) {
      ok = false;
      lines.push(`[FAIL] ${pin.id} ${pin.path} — ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  lines.push(`verification command: ${manifest.verification.command}`);
  lines.push(`worklog: ${WORKLOG_PATH} (governance record of stage completion reports)`);
  return { ok, lines };
}

// Re-export the two canonical document paths for tooling convenience.
export { CONSTITUTION_DOCUMENT_FILES };
