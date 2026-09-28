/**
 * Vaerion — Release / Artifact Intelligence
 *
 * "Every artifact must know: where it came from, which constitution
 * generated it, which registry version created it, which release owns it,
 * which snapshots prove it, which authorities approved it, which evidence
 * supports it. Nothing may exist anonymously." (order Deliverable 4.)
 *
 * The Artifact Registry refuses any record with an anonymous dimension: a
 * missing origin, constitution, registry version, owning release, snapshot
 * proof set, authority approval, or evidence reference makes the artifact
 * unshippable — not flagged, not warned: refused (10.1 form).
 *
 * Citations: Constitution Part X, 10.1, 10.3, 2.8, 8.2 (provenance
 * precedent), P-4; Bible Art. II, III, XI; order Deliverables 1 and 4.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import type { HashFunction } from '../authorities/hash';

/** The registered artifact kinds of the release system. */
export const ARTIFACT_KINDS = [
  'bundle',
  'binding',
  'package',
  'receipt-set',
  'manifest',
  'documentation',
] as const;
export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];

/** One fully-provenanced artifact record (order Deliverable 4). */
export interface ArtifactRecord {
  readonly artifactId: string;
  readonly kind: ArtifactKind;
  readonly name: string;
  readonly sha256: string;
  /** Where it came from. */
  readonly origin: string;
  /** Which constitution generated it. */
  readonly constitutionVersion: string;
  /** Which registry version created it (2.8). */
  readonly registryVersion: string;
  /** Which release owns it. */
  readonly owningRelease: string;
  /** Which snapshots prove it. */
  readonly provingSnapshots: readonly string[];
  /** Which authorities approved it. */
  readonly approvingAuthorities: readonly string[];
  /** Which evidence supports it. */
  readonly evidenceReferences: readonly string[];
  readonly citations: readonly Citation[];
}

const ARTIFACT_CITATIONS: readonly Citation[] = Object.freeze([
  implementation('Part X', 'release artifacts carry constitutional identity'),
  implementation('10.1', 'an unprovenanced artifact cannot pass the gate'),
  implementation('2.8', 'registry version declared on every artifact'),
  implementation('8.2', 'provenance and hashing precedent'),
]);

const REQUIRED_AUTHORITIES = [
  'Release Authority',
  'Chain Authority',
] as const;

/**
 * Registers an artifact with full provenance. Refuses anonymity in any
 * dimension (order Deliverable 4 — "Nothing may exist anonymously").
 */
export function registerArtifact(params: {
  readonly kind: ArtifactKind;
  readonly name: string;
  readonly sha256: string;
  readonly origin: string;
  readonly constitutionVersion: string;
  readonly registryVersion: string;
  readonly owningRelease: string;
  readonly provingSnapshots: readonly string[];
  readonly approvingAuthorities: readonly string[];
  readonly evidenceReferences: readonly string[];
  readonly hash: HashFunction;
  readonly citations?: readonly Citation[];
}): ArtifactRecord {
  const anonymous: string[] = [];
  if (!params.name) anonymous.push('name');
  if (!/^[0-9a-f]{64}$/.test(params.sha256)) anonymous.push('sha256');
  if (!params.origin) anonymous.push('origin');
  if (!params.constitutionVersion) anonymous.push('constitutionVersion');
  if (!params.registryVersion) anonymous.push('registryVersion');
  if (!params.owningRelease) anonymous.push('owningRelease');
  if (params.provingSnapshots.length === 0) anonymous.push('provingSnapshots');
  if (params.approvingAuthorities.length === 0) anonymous.push('approvingAuthorities');
  if (params.evidenceReferences.length === 0) anonymous.push('evidenceReferences');
  if (anonymous.length > 0) {
    throw new ConstitutionalViolationError(
      'Art. II / Art. III',
      `Artifact "${params.name || '(anonymous)'}" is anonymous in: ${anonymous.join(', ')}. Nothing may exist anonymously — every artifact knows its origin, its constitution, its registry version, its owning release, its proving snapshots, its approving authorities, and its evidence (order Deliverable 4; Bible Art. II, III).`,
      ARTIFACT_CITATIONS,
    );
  }
  for (const authority of params.approvingAuthorities) {
    if (!REQUIRED_AUTHORITIES.some((required) => authority.startsWith(required))) {
      throw new ConstitutionalViolationError(
        'Art. III',
        `Artifact "${params.name}" claims approval from "${authority}", which is not a named release authority. Approvals are named verifiers, never vibes (Art. III; Constitution 8.0).`,
        ARTIFACT_CITATIONS,
      );
    }
  }
  const identity = params.hash(
    [params.kind, params.name, params.sha256, params.origin, params.owningRelease].join('|'),
  );
  return Object.freeze({
    artifactId: `art_${identity.slice(0, 16)}`,
    kind: params.kind,
    name: params.name,
    sha256: params.sha256,
    origin: params.origin,
    constitutionVersion: params.constitutionVersion,
    registryVersion: params.registryVersion,
    owningRelease: params.owningRelease,
    provingSnapshots: Object.freeze([...params.provingSnapshots]),
    approvingAuthorities: Object.freeze([...params.approvingAuthorities]),
    evidenceReferences: Object.freeze([...params.evidenceReferences]),
    citations: Object.freeze([
      ...(params.citations ?? []),
      implementation('Part X'),
      implementation('10.1'),
    ]),
  });
}

/**
 * The artifact-intelligence gate: every registered artifact carries complete
 * provenance; none is anonymous (order Deliverable 4).
 */
export function assertNoAnonymousArtifacts(records: readonly ArtifactRecord[]): void {
  if (records.length === 0) {
    throw new ConstitutionalViolationError(
      'Art. II',
      'The artifact registry is empty. A release with no registered artifacts has no shippable body — evidence or silence (Bible Art. II; order Deliverable 4).',
      ARTIFACT_CITATIONS,
    );
  }
  for (const record of records) {
    const anonymous =
      !record.origin ||
      !record.constitutionVersion ||
      !record.registryVersion ||
      !record.owningRelease ||
      record.provingSnapshots.length === 0 ||
      record.approvingAuthorities.length === 0 ||
      record.evidenceReferences.length === 0;
    if (anonymous) {
      throw new ConstitutionalViolationError(
        'Art. II / Art. III',
        `Artifact "${record.artifactId}" (${record.name}) exists anonymously. Anonymous artifacts are refused, not flagged (order Deliverable 4; Constitution 10.1).`,
        ARTIFACT_CITATIONS,
      );
    }
  }
}
