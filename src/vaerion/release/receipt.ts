/**
 * Vaerion — Release / The Release Receipt Engine
 *
 * "The process itself obeys the product. Every release issues a receipt
 * naming the build engine and rule set that verified it — Article III applied
 * to engineering. A release whose receipt cannot be produced does not ship."
 * (Constitution 10.3 — implementation necessity.)
 *
 * Every release becomes a ceremony of seven receipts (order Deliverable 2):
 * constitutional, build, artifact, registry, snapshot, integrity,
 * distribution. Every receipt carries the mandated anatomy:
 *
 *   Identity · Timestamp · SHA-256 · Parent Release · Constitutional
 *   Version · Snapshot Version · Registry Version · Evidence References ·
 *   Chain References · Authority · Digital Signature placeholder · Citations
 *
 * Receipts are immutable records (F-006 law 4): a receipt is frozen at
 * issuance; its integrity hash is SHA-256 over the canonical body; any
 * alteration is detectable by recomputation and refuses. Signature: a
 * deterministic placeholder bound to the release-signing public key
 * fingerprint — the asymmetric binding is filed as IR-017 (P-5), never
 * improvised.
 *
 * Citations: Constitution 10.1–10.4, 8.8, 2.8, P-4; Foundation Amendment
 * F-006; Bible Art. III, VI; Stage 10 execution order Deliverables 1–2.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { sha256 } from '../authorities/hash';
import {
  RELEASE_AUTHORITY,
  RELEASE_SIGNATURE_ALGORITHM,
  formatConstitutionalVersion,
  registryVersion,
  type ConstitutionalVersion,
} from './identity';

/** The seven ceremony receipt kinds, in ceremony order (order Deliverable 2). */
export const RECEIPT_KINDS = [
  'constitutional',
  'build',
  'artifact',
  'registry',
  'snapshot',
  'integrity',
  'distribution',
] as const;
export type ReceiptKind = (typeof RECEIPT_KINDS)[number];

/** One immutable release receipt (10.3; F-006). */
export interface ReleaseReceipt {
  /** Identity — derived from the canonical body (nothing self-asserted). */
  readonly receiptId: string;
  readonly kind: ReceiptKind;
  /** The release identity line this receipt belongs to. */
  readonly releaseId: string;
  readonly releaseVersion: string;
  /** Timestamp — injected at issuance; never read implicitly (P-6). */
  readonly timestamp: number;
  /** SHA-256 over the canonical receipt body — the receipt's integrity identity. */
  readonly sha256: string;
  /** Parent release in the append-only release chain (10.4). */
  readonly parentRelease: string | null;
  readonly constitutionalVersion: string;
  readonly snapshotVersion: string;
  readonly registryVersion: string;
  readonly evidenceReferences: readonly string[];
  readonly chainReferences: readonly string[];
  /** The verifier named (Art. III — a receipt names its verifier). */
  readonly authority: string;
  /** Digital Signature placeholder (order Deliverable 2; IR-017). */
  readonly signature: string;
  readonly signatureAlgorithm: string;
  readonly citations: readonly Citation[];
  /** Kind-specific ceremony fields (additive zone — Art. VI extension law). */
  readonly payload: Readonly<Record<string, string>>;
}

const RECEIPT_CITATIONS: readonly Citation[] = Object.freeze([
  implementation('10.3', 'release receipt — implementation necessity'),
  implementation('10.4', 'append-only release chain'),
  implementation('8.8', 'immutability after signing; detectable brokenness'),
  implementation('2.8', 'registry version declared'),
]);

/** Deterministic signing key identity for the placeholder binding (IR-017). */
export interface SigningKey {
  readonly keyId: string;
  /** SHA-256 fingerprint over the public key material (PEM). */
  readonly fingerprint: string;
}

/**
 * Computes the signature placeholder over the canonical body: a keyed
 * digest bound to the signing key fingerprint. Deterministic — the same
 * body and key produce the same signature; any body alteration detaches the
 * signature (detectable, never silent — 8.8). The asymmetric mechanism is
 * governed by IR-017.
 */
export function signReceiptBody(params: {
  readonly canonicalBody: string;
  readonly key: SigningKey;
}): string {
  if (!params.key.keyId || !params.key.fingerprint) {
    throw new ConstitutionalViolationError(
      '10.3 / Art. III',
      'A receipt was signed with an anonymous key. The signature names its key (Art. III); an anonymous signature verifies nothing (Constitution 10.3; 8.8).',
      RECEIPT_CITATIONS,
    );
  }
  return `sig1:${params.key.keyId}:${sha256(`${params.key.fingerprint}|${params.canonicalBody}`)}`;
}

/** Verifies a receipt signature against the canonical body and key (8.8 — brokenness detectable, never silent). */
export function verifyReceiptSignature(params: {
  readonly canonicalBody: string;
  readonly signature: string;
  readonly key: SigningKey;
}): boolean {
  return params.signature === signReceiptBody({ canonicalBody: params.canonicalBody, key: params.key });
}

/** The canonical string form of a receipt body (field order fixed = anatomy order). The signature algorithm is verification metadata, not part of the digest body. */
export function canonicalReceiptBody(
  receipt: Omit<ReleaseReceipt, 'sha256' | 'receiptId' | 'signature' | 'signatureAlgorithm'>,
): string {
  return [
    `kind=${receipt.kind}`,
    `releaseId=${receipt.releaseId}`,
    `releaseVersion=${receipt.releaseVersion}`,
    `timestamp=${receipt.timestamp}`,
    `parentRelease=${receipt.parentRelease ?? 'none'}`,
    `constitutionalVersion=${receipt.constitutionalVersion}`,
    `snapshotVersion=${receipt.snapshotVersion}`,
    `registryVersion=${receipt.registryVersion}`,
    `evidence=${receipt.evidenceReferences.join(';')}`,
    `chain=${receipt.chainReferences.join(';')}`,
    `authority=${receipt.authority}`,
    `citations=${receipt.citations.map((citation) => `${citation.document}:${citation.reference}`).join(';')}`,
    `payload=${Object.keys(receipt.payload).sort().map((key) => `${key}=${receipt.payload[key]}`).join(';')}`,
  ].join('\n');
}

/**
 * Issues one ceremony receipt. Every mandated field is required — a receipt
 * missing any element of the anatomy does not exist (10.3; Art. VI applied
 * to the process). The digest and identity are computed, never declared.
 */
export function issueReceipt(params: {
  readonly kind: ReceiptKind;
  readonly releaseId: string;
  readonly releaseVersion: string;
  readonly timestamp: number;
  readonly parentRelease: string | null;
  readonly constitutionalVersion: ConstitutionalVersion;
  readonly snapshotVersion: string;
  readonly evidenceReferences: readonly string[];
  readonly chainReferences: readonly string[];
  readonly key: SigningKey;
  readonly citations: readonly Citation[];
  readonly payload: Readonly<Record<string, string>>;
}): ReleaseReceipt {
  if (!params.releaseId || !params.releaseVersion) {
    throw new ConstitutionalViolationError(
      '10.3',
      'A receipt was issued without a release identity. Every receipt belongs to a named release (Constitution 10.3; Art. III).',
      RECEIPT_CITATIONS,
    );
  }
  if (!params.snapshotVersion) {
    throw new ConstitutionalViolationError(
      '10.3 / 9.3',
      'A receipt was issued without a snapshot version. The ceremony cites the Snapshot Authority state its gates were demonstrated against (Constitution 10.3; F-006 §5).',
      RECEIPT_CITATIONS,
    );
  }
  if (params.evidenceReferences.length === 0) {
    throw new ConstitutionalViolationError(
      'Art. II',
      `A ${params.kind} receipt was issued with no evidence references. Evidence or silence — a receipt with no evidence is silence dressed as proof (Bible Art. II; Constitution 10.1).`,
      RECEIPT_CITATIONS,
    );
  }
  if (params.citations.length === 0) {
    throw new ConstitutionalViolationError(
      'P-4',
      `A ${params.kind} receipt is uncitable. Nothing unmeasured ships (Constitution P-4; Bible Art. XI).`,
      RECEIPT_CITATIONS,
    );
  }
  if (!params.key) {
    throw new ConstitutionalViolationError(
      '10.3',
      'No signing key was declared. A release whose receipt cannot be produced does not ship (Constitution 10.3).',
      RECEIPT_CITATIONS,
    );
  }

  const base = {
    kind: params.kind,
    releaseId: params.releaseId,
    releaseVersion: params.releaseVersion,
    timestamp: params.timestamp,
    parentRelease: params.parentRelease,
    constitutionalVersion: formatConstitutionalVersion(params.constitutionalVersion),
    snapshotVersion: params.snapshotVersion,
    registryVersion: registryVersion(),
    evidenceReferences: Object.freeze([...params.evidenceReferences]),
    chainReferences: Object.freeze([...params.chainReferences]),
    authority: RELEASE_AUTHORITY,
    citations: Object.freeze([...params.citations]),
    payload: Object.freeze({ ...params.payload }),
  };
  const canonicalBody = canonicalReceiptBody(base);
  const digest = sha256(canonicalBody);
  const signature = signReceiptBody({ canonicalBody, key: params.key });
  return Object.freeze({
    ...base,
    receiptId: `rcp_${params.kind}_${digest.slice(0, 16)}`,
    sha256: digest,
    signature,
    signatureAlgorithm: RELEASE_SIGNATURE_ALGORITHM,
  });
}

/** Recomputes a receipt's integrity — any alteration is detected, never silent (8.8; F-006 law 4). */
export function verifyReceiptIntegrity(receipt: ReleaseReceipt): void {
  const body = canonicalReceiptBody(receipt);
  const digest = sha256(body);
  if (digest !== receipt.sha256) {
    throw new ConstitutionalViolationError(
      '8.8 / F-006',
      `Receipt "${receipt.receiptId}" fails integrity recomputation (expected ${receipt.sha256.slice(0, 16)}…, computed ${digest.slice(0, 16)}…). Receipts are immutable records; alteration is a constitutional violation (Constitution 8.8; F-006 law 4).`,
      RECEIPT_CITATIONS,
    );
  }
  if (!receipt.signature.startsWith('sig1:')) {
    throw new ConstitutionalViolationError(
      '10.3',
      `Receipt "${receipt.receiptId}" carries no valid signature form. A release whose receipt cannot be produced does not ship (Constitution 10.3).`,
      RECEIPT_CITATIONS,
    );
  }
}

/** Proves the mandated twelve-element anatomy is present on a receipt (order Deliverable 2). */
export function assertReceiptAnatomy(receipt: ReleaseReceipt): void {
  const missing: string[] = [];
  if (!receipt.receiptId || !receipt.releaseId || !receipt.releaseVersion) missing.push('identity');
  if (!Number.isFinite(receipt.timestamp)) missing.push('timestamp');
  if (!/^[0-9a-f]{64}$/.test(receipt.sha256)) missing.push('sha256');
  if (receipt.parentRelease === undefined) missing.push('parentRelease');
  if (!receipt.constitutionalVersion) missing.push('constitutionalVersion');
  if (!receipt.snapshotVersion) missing.push('snapshotVersion');
  if (!receipt.registryVersion) missing.push('registryVersion');
  if (!receipt.evidenceReferences.length) missing.push('evidenceReferences');
  if (!receipt.chainReferences.length) missing.push('chainReferences');
  if (!receipt.authority) missing.push('authority');
  if (!receipt.signature) missing.push('signature');
  if (!receipt.citations.length) missing.push('citations');
  if (missing.length > 0) {
    throw new ConstitutionalViolationError(
      '10.3 / Art. VI',
      `Receipt "${receipt.receiptId || receipt.kind}" is missing anatomy: ${missing.join(', ')}. The receipt anatomy is fixed; a partial receipt does not exist (Constitution 10.3; Art. VI order applied to the process).`,
      RECEIPT_CITATIONS,
    );
  }
}
