/**
 * Vaerion — Surfaces / The Surface Registry
 *
 * The registered surfaces with their skeleton mappings and citations
 * (Constitution 4.6 — Surface Bindings; Visual System §1.4). No fourth
 * skeleton exists (4.1); every surface instantiates exactly one.
 */

import type { SpineTerritory } from '../primitives/chrome';
import type { SkeletonKind } from '../rendering/skeletons';
import { AuditSurface, EnterpriseSurface, LedgerSurface, PlaygroundSurface, RuntimeSurface, VerificationSurface } from './console';
import { ConstitutionSurface, ReceiptViewerSurface } from './documents';
import { SearchSurface, StatusSurface } from './status';

export type SurfaceId =
  | 'runtime'
  | 'ledger'
  | 'receipt-viewer'
  | 'constitution'
  | 'audit'
  | 'verification'
  | 'enterprise'
  | 'status'
  | 'playground'
  | 'search';

export interface SurfaceRegistration {
  readonly id: SurfaceId;
  /** The registered surface name (4.6 — no invented names). */
  readonly label: string;
  readonly territory: SpineTerritory;
  readonly skeleton: SkeletonKind;
  /** Binding citation (4.6). */
  readonly citation: string;
}

export const SURFACE_REGISTRY: readonly SurfaceRegistration[] = Object.freeze([
  { id: 'runtime', label: 'Runtime', territory: 'console', skeleton: 'console', citation: 'Constitution 4.6 — Runtime: Console skeleton; live pulses; replay via Timeline' },
  { id: 'verification', label: 'Verification', territory: 'console', skeleton: 'console', citation: '4.6 — Verification: Console; age-sorted queue; keyboard verbs; every decision issues a receipt' },
  { id: 'audit', label: 'Audit', territory: 'console', skeleton: 'console', citation: '4.6 — Audit: Console; Range Grammar within the Criteria Bar; export preview in receipt grammar' },
  { id: 'enterprise', label: 'Enterprise', territory: 'console', skeleton: 'console', citation: '4.6 — Enterprise: Console; reveal-once credential ceremonies; admin action log as receipts' },
  { id: 'playground', label: 'Playground', territory: 'console', skeleton: 'console', citation: '4.6 — Playground: Console; universal DEMO quarantine; exports disabled' },
  { id: 'ledger', label: 'Ledger', territory: 'records', skeleton: 'console', citation: '4.6 — Ledger: Console; sliced rendering mandatory; Criteria Bar sticky; jump-to-date; integrity strip' },
  { id: 'receipt-viewer', label: 'Receipt Viewer', territory: 'records', skeleton: 'document', citation: '4.6 — Receipt Viewer: Document skeleton; ceremony seal at 44; Margin Notes rail; Guided Read' },
  { id: 'constitution', label: 'Constitution', territory: 'rules', skeleton: 'document', citation: '4.6 — Constitution: Document; statute-book structure; drift markers; every rule deep-linkable' },
  { id: 'status', label: 'Attestation Status', territory: 'system', skeleton: 'status', citation: '4.6 — Status (Attestation): Status skeleton; the governing attestation fields on one screen; incident log as receipts' },
  { id: 'search', label: 'Search', territory: 'system', skeleton: 'status', citation: '4.6 — Search: Status variant; hash-first resolution; grouped, sealed results' },
]);

export function getSurface(id: string): SurfaceRegistration {
  const surface = SURFACE_REGISTRY.find((s) => s.id === id);
  if (!surface) {
    throw new Error(`[4.6] Unknown surface "${id}" — only the registered surfaces exist.`);
  }
  return surface;
}

export {
  AuditSurface,
  ConstitutionSurface,
  EnterpriseSurface,
  LedgerSurface,
  PlaygroundSurface,
  ReceiptViewerSurface,
  RuntimeSurface,
  SearchSurface,
  StatusSurface,
  VerificationSurface,
};
