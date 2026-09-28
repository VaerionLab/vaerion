/**
 * Vaerion — Authorities / The Manifest Lifecycle
 *
 * Manifest lifecycle (Constitution 8.8): "The manifest records bundle hash,
 * timestamp authority, issuing engine, and ruleset; it is immutable after
 * signing; third parties must be able to verify a bundle against its
 * manifest without product access; a mismatch renders the export broken,
 * and brokenness must be detectable, never silent."
 *
 * The manifest functions are pure: they operate on delivered data only, so
 * verification requires no product access. The signature is recorded by the
 * manifest; the signing *mechanism* (keys, algorithm binding) is the
 * release engine's domain (Part X; AUTH-RELEASE) — the manifest requires a
 * signature to exist and to be immutable after signing, and refuses
 * delivery of anything unsigned (8.7; 8.8).
 *
 * Citations: Implementation Constitution 8.8, 8.7, 1.5; Bible Art. III.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import type { HashFunction } from './hash';

/** One immutable export manifest (8.8). */
export interface ExportManifest {
  readonly manifestId: string;
  readonly bundleHash: string;
  /** The hash of every record in the bundle, in bundle order. */
  readonly recordHashes: readonly string[];
  /** The authority that vouches for the timestamp (8.8) — declared by the caller. */
  readonly timestampAuthority: string;
  readonly issuingEngine: string;
  readonly ruleset: string;
  readonly signature: string | null;
  readonly signedAt: number | null;
}

/** The verdict of third-party bundle verification (8.8). */
export interface ManifestVerification {
  readonly verifiable: boolean;
  readonly reason: string | null;
}

const MANIFEST_CITATIONS: readonly Citation[] = [
  implementation('8.8', 'manifest lifecycle'),
  implementation('8.7', 'export lifecycle'),
];

/**
 * Computes a manifest for an assembled bundle (8.8). The timestamp
 * authority is a required declaration — the authority that vouches for the
 * time is named, never assumed.
 */
export function computeManifest(params: {
  readonly bundleHash: string;
  readonly recordHashes: readonly string[];
  readonly timestampAuthority: string;
  readonly issuingEngine: string;
  readonly ruleset: string;
  readonly hash: HashFunction;
}): ExportManifest {
  for (const field of ['timestampAuthority', 'issuingEngine', 'ruleset'] as const) {
    if (!params[field]) {
      throw new ConstitutionalViolationError(
        '8.8 / Art. III',
        `The manifest is missing "${field}". The manifest records bundle hash, timestamp authority, issuing engine, and ruleset (Constitution 8.8); an anonymous manifest is constitutionally void (Art. III).`,
        MANIFEST_CITATIONS,
      );
    }
  }
  return Object.freeze({
    manifestId: `mfst_${params.hash(params.bundleHash).slice(0, 16)}`,
    bundleHash: params.bundleHash,
    recordHashes: Object.freeze([...params.recordHashes]),
    timestampAuthority: params.timestampAuthority,
    issuingEngine: params.issuingEngine,
    ruleset: params.ruleset,
    signature: null,
    signedAt: null,
  });
}

/**
 * Signs a manifest. Signing produces a NEW frozen manifest — the unsigned
 * manifest is never edited, and a signed manifest is immutable (8.8).
 * Signing twice throws.
 */
export function signManifest(params: {
  readonly manifest: ExportManifest;
  readonly signature: string;
  readonly signedAt: number;
}): ExportManifest {
  if (params.manifest.signature) {
    throw new ConstitutionalViolationError(
      '8.8',
      `Manifest "${params.manifest.manifestId}" is already signed. The manifest is immutable after signing (Constitution 8.8).`,
      MANIFEST_CITATIONS,
    );
  }
  if (!params.signature) {
    throw new ConstitutionalViolationError(
      '8.8',
      'An empty signature cannot sign a manifest (Constitution 8.8).',
      MANIFEST_CITATIONS,
    );
  }
  return Object.freeze({
    ...params.manifest,
    signature: params.signature,
    signedAt: params.signedAt,
  });
}

/**
 * Verifies a delivered bundle against its manifest (8.8). Pure: the
 * function sees only the bundle's record hashes and the manifest — no
 * product access is required. A mismatch renders the export broken, and
 * brokenness is detectable, never silent (8.8).
 */
export function verifyBundle(params: {
  readonly recordHashes: readonly string[];
  readonly manifest: ExportManifest;
  readonly hash: HashFunction;
}): ManifestVerification {
  if (!params.manifest.signature) {
    return Object.freeze({ verifiable: false, reason: 'the manifest is unsigned (Constitution 8.8)' });
  }
  if (params.recordHashes.length !== params.manifest.recordHashes.length) {
    return Object.freeze({
      verifiable: false,
      reason: `the bundle holds ${params.recordHashes.length} records; the manifest records ${params.manifest.recordHashes.length} (Constitution 8.8)`,
    });
  }
  for (let index = 0; index < params.recordHashes.length; index += 1) {
    if (params.recordHashes[index] !== params.manifest.recordHashes[index]) {
      return Object.freeze({
        verifiable: false,
        reason: `record ${index} hash mismatch — the bundle diverges from its manifest (Constitution 8.8)`,
      });
    }
  }
  const recomputed = params.hash(params.recordHashes.join('|'));
  if (recomputed !== params.manifest.bundleHash) {
    return Object.freeze({ verifiable: false, reason: 'bundle hash mismatch — the bundle is broken (Constitution 8.8)' });
  }
  return Object.freeze({ verifiable: true, reason: null });
}
