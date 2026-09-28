/**
 * Vaerion — Authorities / Public Barrel
 *
 * The constitutional data architecture (Part VIII): the seven named
 * authorities with unambiguous ownership, the receipt / evidence /
 * verification / rule / chain / investigation / export / manifest /
 * identity lifecycles, immutable records, append-only chains, the
 * integrity substrate, and the sixteen data gates.
 *
 * Citations: Implementation Constitution Part VIII; P-4.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

export {
  sha256,
  assertHashBinding,
  SHA256_KNOWN_VECTORS,
  HASH_CITATIONS,
  type HashFunction,
} from './hash';

export {
  AUTHORITY_CONTRACTS,
  getAuthorityContract,
  assertAuthorityContractIntegrity,
  CONTRACTS_CITATIONS,
  type AuthorityName,
  type AuthorityContract,
} from './contracts';

export {
  createChainAuthority,
  type ChainAuthority,
  type ChainRecord,
  type ChainRecordKind,
  type ChainIntegrity,
} from './chain';

export {
  createEvidenceAuthority,
  type EvidenceAuthority,
  type EvidenceEvent,
  type EvidenceState,
  type EvidenceRestriction,
} from './evidence';

export {
  createVerificationAuthority,
  VERIFICATION_STAGES,
  type VerificationAuthority,
  type VerificationRecord,
  type VerificationMethod,
  type VerdictFact,
  type VerificationStage,
} from './verification';

export {
  createLedgerAuthority,
  RECEIPT_DRAFT_STAGES,
  type LedgerAuthority,
  type ReceiptDraft,
  type ReceiptRecord,
  type ReceiptDraftStage,
} from './ledger';

export {
  createRuleAuthority,
  RULE_STAGES,
  type RuleAuthority,
  type RuleRecord,
  type RuleSupersession,
  type DriftMarker,
  type RuleStage,
} from './rule';

export {
  createIdentityAuthority,
  ACTOR_KINDS,
  type IdentityAuthority,
  type ActorRecord,
  type ActorKind,
  type CredentialRecord,
  type IdentityEventKind,
} from './identity';

export {
  createInvestigationEngine,
  INVESTIGATION_STAGES,
  INVESTIGATION_NOTE,
  type InvestigationEngine,
  type InvestigationRecord,
  type InvestigationReplay,
  type LensSnapshot,
  type InvestigationStage,
} from './investigation';

export {
  computeManifest,
  signManifest,
  verifyBundle,
  type ExportManifest,
  type ManifestVerification,
} from './manifest';

export {
  createExportAuthority,
  EXPORT_STAGES,
  type ExportAuthority,
  type ExportRecord,
  type ExportStage,
} from './export';

export { createAuthorities, COMPOSITION_CITATIONS, type AuthoritySystem } from './composition';

export {
  runAllAuthorityGates,
  gateAuthorityOwnership,
  gateAuthorityIsolation,
  gateReceiptLifecycle,
  gateEvidenceLifecycle,
  gateVerificationLifecycle,
  gateChainIntegrity,
  gateInvestigationLifecycle,
  gateExportLifecycle,
  gateManifestVerification,
  gateIdentityLifecycle,
  gateAppendOnlyGuarantees,
  gateAuthorityBoundaries,
  gateImmutableHistory,
  gateExportVerification,
  gateNoAuthorityOverlap,
  gateNoReceiptMutation,
  type AuthorityGateResult,
} from './gates';
