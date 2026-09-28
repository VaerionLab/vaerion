/**
 * Vaerion — Release / The Constitutional Version Engine
 *
 * Every release declares exactly which law it was built under and which
 * instruments verified it. The version engine derives release identity from
 * declared constitutional facts — it never invents a number (Bible Art. XI;
 * P-5). The release version is a deterministic build-metadata identifier of
 * the form `<implementation>.<volume-stage>.r<sequence>` — machine-derived,
 * not marketing.
 *
 * Citations:
 * - Implementation Constitution Part X (release law)
 * - Implementation Constitution 10.3 (Release Receipt — implementation
 *   necessity: the process itself obeys the product)
 * - Implementation Constitution 2.8 (surfaces declare their Registry
 *   version; auditable at the runtime of the release process — Part X)
 * - Implementation Constitution 8.8 (issuing engine + ruleset recorded)
 * - Bible Art. III (a verdict — a release receipt included — names its
 *   verifier)
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { DOCUMENT_TITLES, implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { REGISTRY_VERSION } from '../registry/token';
import type { StageId } from '../foundation/stages';

/** The release engine's own identity — it is itself a verifier and must be named (Art. III). */
export const RELEASE_ENGINE_VERSION = '1.0.0';
export const RELEASE_ENGINE_NAME = 'vaerion-release-engine';

/** The rule set every release is verified against (10.3 — "naming the build engine and rule set"). */
export const RELEASE_RULESET = DOCUMENT_TITLES.IMPLEMENTATION_CONSTITUTION;

/** The authority under which releases are issued (F-006; 10.3; 11.1). */
export const RELEASE_AUTHORITY = 'Release Authority (Foundation Amendment F-006; Constitution 10.3)';

/** The declared algorithm of the release signature placeholder (order Deliverable 2; 8.8; IR-017). */
export const RELEASE_SIGNATURE_ALGORITHM =
  'sha256-deterministic-placeholder (asymmetric signing binding pending — IR-017)';

/** The versions of the three ratified constitutional documents a release is built under. */
export interface ConstitutionalVersion {
  readonly bible: string;
  readonly visualSystem: string;
  readonly implementation: string;
  /** The constitutional changelog protocol version at issuance (11.3 — versioned like a protocol). */
  readonly protocol: string;
  /** The Volume IV stage this release closes. */
  readonly volumeStage: number;
}

/**
 * Extracts the ratified version of a document from its canonical title
 * (e.g. "VAERION_DESIGN_BIBLE_v1.0" -> "v1.0"). The title is the authority;
 * the version is never retyped by hand.
 */
function ratifiedVersionOf(title: string): string {
  const marker = title.lastIndexOf('_v');
  if (marker < 0) {
    throw new ConstitutionalViolationError(
      'P-4',
      `Document title "${title}" carries no ratified version marker. A release cannot declare a constitutional version it cannot derive (Constitution P-4; Art. XI).`,
    );
  }
  return title.slice(marker + 1);
}

/**
 * Derives the constitutional version from the ratified document titles —
 * never hand-typed. The protocol version is supplied by the caller (the
 * pipeline reads the changelog, 11.3); the stage is the Volume IV work front
 * the release closes.
 */
export function constitutionalVersion(params: {
  readonly protocol: string;
  readonly volumeStage: StageId;
}): ConstitutionalVersion {
  if (!params.protocol) {
    throw new ConstitutionalViolationError(
      '11.3',
      'The constitutional changelog protocol version was not declared. The changelog is versioned like a protocol (Constitution 11.3); a release may not omit it.',
    );
  }
  return Object.freeze({
    bible: ratifiedVersionOf(DOCUMENT_TITLES.BIBLE),
    visualSystem: ratifiedVersionOf(DOCUMENT_TITLES.VISUAL_SYSTEM),
    implementation: ratifiedVersionOf(DOCUMENT_TITLES.IMPLEMENTATION_CONSTITUTION),
    protocol: params.protocol,
    volumeStage: params.volumeStage,
  });
}

/**
 * The Registry version the release conforms to (2.8 — "surfaces must declare
 * which Registry version they conform to; the declared version must be
 * auditable at runtime of the release process"). Consumed from the canonical
 * Registry itself — never retyped.
 */
export function registryVersion(): string {
  return REGISTRY_VERSION;
}

/** Renders a constitutional version in the canonical receipt form. */
export function formatConstitutionalVersion(version: ConstitutionalVersion): string {
  return [
    `bible ${version.bible}`,
    `visual-system ${version.visualSystem}`,
    `implementation ${version.implementation}`,
    `protocol ${version.protocol}`,
    `volume-stage ${version.volumeStage}`,
  ].join(' / ');
}

/**
 * The deterministic release version identifier (Part X; Art. XI — derived,
 * never invented): `<implementation sans v>.<volume-stage>.r<sequence>`.
 */
export function releaseVersion(params: {
  readonly version: ConstitutionalVersion;
  readonly sequence: number;
}): string {
  if (!Number.isInteger(params.sequence) || params.sequence < 1) {
    throw new ConstitutionalViolationError(
      'Part X',
      `Release sequence ${params.sequence} is not a positive integer. Release identity is derived from the append-only ledger; nothing is improvised (Constitution Part X; 10.4).`,
    );
  }
  const base = params.version.implementation.replace(/^v/, '');
  return `${base}.${params.version.volumeStage}.r${params.sequence}`;
}

export const IDENTITY_CITATIONS: readonly Citation[] = Object.freeze([
  implementation('Part X', 'release law'),
  implementation('10.3', 'release receipt names engine and ruleset'),
  implementation('2.8', 'registry version declared and auditable at release runtime'),
  implementation('8.8', 'issuing engine and ruleset recorded'),
]);
