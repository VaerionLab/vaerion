/**
 * Vaerion — Authorities / The Identity Authority
 *
 * Identity lifecycle (Constitution 8.9): "Actors are human, machine, or
 * engine; every verdict names its verifier's identity. Credentials are
 * reveal-once with mandatory ceremony; rotation issues receipts; identity
 * events enter the admin log as receipts."
 *
 * The Identity Authority owns actors and credentials (8.0). It composes the
 * Ledger Authority: identity events and rotations enter the admin log as
 * full receipts through the receipt lifecycle of 8.1 — never as a side
 * channel.
 *
 * Citations: Implementation Constitution 8.0, 8.9; Bible Art. III.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import type { HashFunction } from './hash';
import type { ReceiptRecord } from './ledger';
import type { VerificationMethod } from './verification';

/** The actor kinds (8.9 — closed set; Art. III). */
export const ACTOR_KINDS = ['human', 'machine', 'engine'] as const;
export type ActorKind = (typeof ACTOR_KINDS)[number];

/** One immutable actor record (8.9). */
export interface ActorRecord {
  readonly actorId: string;
  readonly kind: ActorKind;
  readonly enrolledAt: number;
}

/** One immutable credential record (8.9). */
export interface CredentialRecord {
  readonly credentialId: string;
  readonly actorId: string;
  readonly issuedAt: number;
  /** Reveal-once: the credential is revealed exactly once, with ceremony. */
  readonly revealed: boolean;
  readonly rotatedFrom: string | null;
}

/** The identity events that enter the admin log as receipts (8.9). */
export type IdentityEventKind = 'enrolled' | 'credential-issued' | 'credential-rotated';

export interface IdentityAuthority {
  readonly name: 'Identity Authority';
  readonly actors: readonly ActorRecord[];
  readonly credentials: readonly CredentialRecord[];
  /** Enrolls an actor — human, machine, or engine (8.9; Art. III). */
  enroll(params: { readonly kind: ActorKind }): ActorRecord;
  /** Issues a credential (8.9). */
  issueCredential(params: { readonly actorId: string }): CredentialRecord;
  /** Reveals a credential — once, with mandatory ceremony (8.9). */
  revealCredential(params: { readonly credentialId: string; readonly ceremony: { readonly consequenceAcknowledged: boolean } }): CredentialRecord;
  /**
   * Rotates a credential — the rotation issues a receipt (8.9) through the
   * Ledger Authority's receipt lifecycle.
   */
  rotateCredential(params: {
    readonly credentialId: string;
    readonly method: VerificationMethod;
    readonly eventContent: string;
  }): { readonly credential: CredentialRecord; readonly receipt: ReceiptRecord };
  /**
   * Records an identity event — it enters the admin log as a receipt (8.9).
   */
  recordIdentityEvent(params: {
    readonly kind: IdentityEventKind;
    readonly description: string;
    readonly method: VerificationMethod;
    readonly eventContent: string;
  }): ReceiptRecord;
}

const IDENTITY_CITATIONS: readonly Citation[] = [
  implementation('8.9', 'identity lifecycle'),
  implementation('8.0', 'the Identity Authority owns actors and credentials'),
];

export function createIdentityAuthority(params: {
  readonly hash: HashFunction;
  readonly clock?: () => number;
  /**
   * The receipt submission path composed from the Ledger, Evidence, and
   * Verification authorities (8.1) — identity events become receipts only
   * through the full lifecycle. The submitter returns the appended receipt.
   */
  readonly submitAdminReceipt: (request: {
    readonly claim: string;
    readonly subject: string;
    readonly eventContent: string;
    readonly method: VerificationMethod;
  }) => ReceiptRecord;
}): IdentityAuthority {
  const hash = params.hash;
  const clock = params.clock ?? (() => 0);
  const { submitAdminReceipt } = params;
  let seq = 0;
  let actors: readonly ActorRecord[] = Object.freeze([]);
  let credentials: readonly CredentialRecord[] = Object.freeze([]);

  function requireActor(actorId: string): ActorRecord {
    const actor = actors.find((candidate) => candidate.actorId === actorId);
    if (!actor) {
      throw new ConstitutionalViolationError(
        '8.9',
        `Actor "${actorId}" does not exist (Constitution 8.9).`,
        IDENTITY_CITATIONS,
      );
    }
    return actor;
  }

  function requireCredential(credentialId: string): CredentialRecord {
    const credential = credentials.find((candidate) => candidate.credentialId === credentialId);
    if (!credential) {
      throw new ConstitutionalViolationError(
        '8.9',
        `Credential "${credentialId}" does not exist (Constitution 8.9).`,
        IDENTITY_CITATIONS,
      );
    }
    return credential;
  }

  function replaceCredential(next: CredentialRecord): void {
    credentials = Object.freeze([...credentials.filter((candidate) => candidate.credentialId !== next.credentialId), next]);
  }

  return {
    name: 'Identity Authority',
    get actors() {
      return actors;
    },
    get credentials() {
      return credentials;
    },
    enroll({ kind }) {
      if (!(ACTOR_KINDS as readonly string[]).includes(kind)) {
        throw new ConstitutionalViolationError(
          '8.9 / Art. III',
          `"${String(kind)}" is not an actor kind. Actors are human, machine, or engine — no fourth kind exists (Constitution 8.9).`,
          IDENTITY_CITATIONS,
        );
      }
      seq += 1;
      const actor: ActorRecord = Object.freeze({
        actorId: `act_${hash(`${kind}|${seq}`).slice(0, 16)}`,
        kind,
        enrolledAt: clock(),
      });
      actors = Object.freeze([...actors, actor]);
      return actor;
    },
    issueCredential({ actorId }) {
      const actor = requireActor(actorId);
      seq += 1;
      const credential: CredentialRecord = Object.freeze({
        credentialId: `crd_${hash(`${actor.actorId}|${seq}`).slice(0, 16)}`,
        actorId: actor.actorId,
        issuedAt: clock(),
        revealed: false,
        rotatedFrom: null,
      });
      credentials = Object.freeze([...credentials, credential]);
      return credential;
    },
    revealCredential({ credentialId, ceremony }) {
      const credential = requireCredential(credentialId);
      // Mandatory ceremony (8.9): a credential is never revealed casually.
      if (!ceremony.consequenceAcknowledged) {
        throw new ConstitutionalViolationError(
          '8.9',
          `Credential "${credentialId}" was revealed without its ceremony. Credentials are reveal-once with mandatory ceremony (Constitution 8.9).`,
          IDENTITY_CITATIONS,
        );
      }
      if (credential.revealed) {
        throw new ConstitutionalViolationError(
          '8.9',
          `Credential "${credentialId}" was already revealed. Credentials are reveal-once (Constitution 8.9); the second reveal is refused.`,
          IDENTITY_CITATIONS,
        );
      }
      const next: CredentialRecord = Object.freeze({ ...credential, revealed: true });
      replaceCredential(next);
      return next;
    },
    rotateCredential({ credentialId, method, eventContent }) {
      const credential = requireCredential(credentialId);
      seq += 1;
      const rotated: CredentialRecord = Object.freeze({
        credentialId: `crd_${hash(`${credential.credentialId}|rotation|${seq}`).slice(0, 16)}`,
        actorId: credential.actorId,
        issuedAt: clock(),
        revealed: false,
        rotatedFrom: credential.credentialId,
      });
      credentials = Object.freeze([...credentials, rotated]);
      // Rotation issues a receipt (8.9) — through the full receipt lifecycle.
      const receipt = submitAdminReceipt({
        claim: `Credential ${credential.credentialId} was rotated for actor ${credential.actorId}.`,
        subject: credential.actorId,
        eventContent,
        method,
      });
      return { credential: rotated, receipt };
    },
    recordIdentityEvent({ kind, description, method, eventContent }) {
      // Identity events enter the admin log as receipts (8.9).
      return submitAdminReceipt({
        claim: `Identity event ${kind}: ${description}`,
        subject: `identity/${kind}`,
        eventContent,
        method,
      });
    },
  };
}
