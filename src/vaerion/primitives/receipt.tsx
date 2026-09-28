'use client';

/**
 * Vaerion — Primitive / Receipt
 *
 * THE sacred object (Bible Art. VI; Constitution 3.1).
 *
 * Contract (Constitution 3.1 [VS §5.1; Bible Art. II, VI]):
 * - Responsibility: the sole renderer of the claim-and-proof atom, in the
 *   fixed anatomy: id strip, claim, subject, seal block, verification
 *   method, evidence list, provenance footer. It renders an attested record;
 *   it never computes one.
 * - Boundaries: no fetching, deriving, or estimating verdicts; no reordering,
 *   restyling, or partial suppression of the anatomy in any rendering target,
 *   including print and export; it does not host another product's "card"
 *   idiom — a Receipt is not a card.
 * - Extension: growth only by additive fields in the designated extensions
 *   zone at the foot, or by content within Margin Notes; restructured anatomy
 *   is a constitutional violation.
 * - Composition: composes Seal, Hash Line, Evidence Item, and Margin Notes,
 *   in anatomy order. Variants Row, Card, Page differ in compression and
 *   ceremony, never in order.
 *
 * Anatomy order is enforced mechanically by tools/vaerion-pipeline/
 * verify-primitives.ts against RECEIPT_ANATOMY (Bible Art. VI; 4.2).
 *
 * Accessibility: tab order equals reading order equals attestation order
 * (6.7); the seal announces the full fact — verdict, verifier, ruleset (6.11).
 */

import { definePrimitive, DEMO_STAMP_WORD, type VerdictState } from './contract';
import { Seal } from './seal';
import { HashLine, EvidenceItem, type EvidenceRecord } from './records';
import { MicroLabel } from './controls';
import type { ReactNode } from 'react';

export type ReceiptVariant = 'row' | 'card' | 'page';

export interface ReceiptData {
  id: string;
  /** Claim stated in the Human Voice (8.1; Art. VI). */
  claim: string;
  subject: string;
  /** Received verdict — never computed by this primitive (1.6; 5.3). */
  verdict: VerdictState;
  /** Every verdict names its verifier (Bible Art. III). */
  verifier?: string;
  ruleset?: string;
  environment?: string;
  verificationMethod: string;
  evidence: readonly EvidenceRecord[];
  issuedAt: string;
  chainParent?: string | null;
  /** Demo quarantine — travels with the record, rendered wherever it appears (5.10). */
  demo?: boolean;
  /** Additive extension fields render only in the extensions zone (Art. VI). */
  extensions?: readonly { readonly label: string; readonly value: string }[];
  /** Margin Notes content (Human Voice; 8.6). */
  marginNotes?: readonly string[];
}

export const RECEIPT_METADATA = definePrimitive({
  name: 'Receipt',
  constitutionClause: '3.1',
  visualSystemSections: ['5.1'],
  bound: true,
  contract: {
    responsibility: 'The sole renderer of the claim-and-proof atom, in the fixed anatomy: id strip, claim, subject, seal block, verification method, evidence list, provenance footer.',
    boundaries: [
      'must not fetch, derive, or estimate verdicts (Constitution 3.1; 1.6)',
      'must not reorder, restyle, or partially suppress its anatomy in any rendering target, including print and export (Constitution 3.1)',
      'must not host another product card idiom — a Receipt is not a card (VS §5.6)',
      'never paginates its own anatomy away, never hides the chain parent, never renders a verdict without its verification method (Bible Art. VI)',
    ],
    extension: 'growth occurs only by additive fields in the designated extensions zone at the foot, or by content within Margin Notes; restructured anatomy is a constitutional violation (Constitution 3.1; Art. VI)',
    composition: 'composes Seal, Hash Line, Evidence Item, and Margin Notes, in anatomy order; variants Row, Card, Page differ in compression and ceremony, never in order (Constitution 3.1; VS §5.1)',
  },
  tokens: [
    'shape.seal.size.44', 'shape.seal.size.28', 'shape.seal.size.20', 'shape.seal.size.16',
    'space.receiptCeremony', 'space.sealIsolation', 'shape.radius.8', 'shape.radius.0',
    'color.ink.16', 'color.ink.32', 'type.voice.machine', 'type.voice.human',
  ],
  states: ['verified', 'unverified', 'failed', 'pending', 'restricted', 'demo'],
  accessibility: {
    announcement: 'the receipt announces its id, verdict (full fact), and evidence count (6.11)',
    keyboard: 'tab order equals reading order equals attestation order (6.7)',
    sensory: 'anatomy segments are separated by hairlines — hierarchy without color (Art. IV)',
  },
  citations: [],
});

const VERIFIER_REQUIRED: readonly VerdictState[] = ['verified', 'failed', 'pending'];

export function Receipt({ data, variant = 'card' }: { data: ReceiptData; variant?: ReceiptVariant }) {
  // A verdict without its verifier is constitutionally void (Bible Art. III).
  if (VERIFIER_REQUIRED.includes(data.verdict) && !data.verifier) {
    throw new Error(
      `[PRIMITIVE · Art. III] Receipt ${data.id}: verdict "${data.verdict}" renders without a verifier. An anonymous verdict is constitutionally void.`,
    );
  }
  if (!data.verificationMethod) {
    throw new Error(
      `[PRIMITIVE · Art. VI] Receipt ${data.id}: never renders a verdict without its verification method.`,
    );
  }

  if (variant === 'row') {
    // Compression, never suppression: every anatomy segment is present (Art. VI).
    return (
      <div className="vx-receipt vx-receipt-row" data-receipt-id={data.id}>
        <Seal verdict={data.verdict} size={16} verifier={data.verifier} ruleset={data.ruleset} showWord={false} ariaLabel={data.verdict} />
        <span className="vx-machine">{data.id}</span>
        <span style={{ flex: 1, minWidth: 0 }}>{data.claim}</span>
        <span className="vx-machine">subject: {data.subject}</span>
        <span className="vx-machine">{data.verificationMethod}</span>
        <span className="vx-machine">evidence: {data.evidence.length}</span>
        <span className="vx-machine">{data.issuedAt}</span>
        <span className="vx-machine">parent: {data.chainParent ?? '—'}</span>
        {data.demo ? <span className="vx-demo-stamp vx-micro">{DEMO_STAMP_WORD}</span> : null}
      </div>
    );
  }

  return (
    <article
      className={`vx-receipt ${variant === 'page' ? 'vx-receipt-page' : 'vx-receipt-card'}`}
      data-receipt-id={data.id}
      aria-label={`receipt ${data.id}`}
    >
      {/* 1 — id strip */}
      <header className="vx-receipt-id">
        <MicroLabel>RECEIPT ID</MicroLabel>
        <HashLine value={data.id} />
        {data.demo ? <span className="vx-demo-stamp vx-micro">{DEMO_STAMP_WORD}</span> : null}
      </header>

      {/* 2 — claim */}
      <div className="vx-receipt-segment">
        <MicroLabel>CLAIM</MicroLabel>
        <p style={{ margin: 0 }}>{data.claim}</p>
      </div>

      {/* 3 — subject */}
      <div className="vx-receipt-segment">
        <MicroLabel>SUBJECT</MicroLabel>
        <span className="vx-machine">{data.subject}</span>
      </div>

      {/* 4 — verdict seal (ceremony block; isolation is law, VS §1.3) */}
      <div className="vx-receipt-sealblock">
        <Seal
          verdict={data.verdict}
          size={variant === 'page' ? 44 : 28}
          verifier={data.verifier}
          ruleset={data.ruleset}
        />
        {(data.verifier || data.ruleset || data.environment) && (
          <div className="vx-machine" style={{ marginTop: 'var(--vx-space-3)' }}>
            {data.verifier ? <div>verifier: {data.verifier}</div> : null}
            {data.ruleset ? <div>rule set: {data.ruleset}</div> : null}
            {data.environment ? <div>environment: {data.environment}</div> : null}
          </div>
        )}
      </div>

      {/* 5 — verification method */}
      <div className="vx-receipt-segment">
        <MicroLabel>VERIFICATION METHOD</MicroLabel>
        <span className="vx-machine">{data.verificationMethod}</span>
      </div>

      {/* 6 — evidence[] */}
      <div className="vx-receipt-segment">
        <MicroLabel>EVIDENCE ({data.evidence.length})</MicroLabel>
        <div className="vx-receipt-evidence" style={{ marginTop: 'var(--vx-space-4)' }}>
          {data.evidence.map((item, index) => (
            <EvidenceItem key={index} evidence={item} />
          ))}
        </div>
      </div>

      {/* 7 — issued-at (provenance footer) */}
      <div className="vx-receipt-segment">
        <MicroLabel>ISSUED-AT</MicroLabel>
        <span className="vx-machine">{data.issuedAt}</span>
      </div>

      {/* 8 — chain parent */}
      <div className="vx-receipt-segment">
        <MicroLabel>CHAIN PARENT</MicroLabel>
        {data.chainParent ? (
          <HashLine value={data.chainParent} />
        ) : (
          <span className="vx-machine">— (no parent)</span>
        )}
      </div>

      {/* Margin Notes (Human Voice; rendered alongside per 8.6 / VS §12.4) */}
      {data.marginNotes && data.marginNotes.length > 0 ? (
        <div className="vx-receipt-segment">
          <MicroLabel>MARGIN NOTES</MicroLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-2)' }}>
            {data.marginNotes.map((note, index) => (
              <p key={index} style={{ margin: 0 }}>{note}</p>
            ))}
          </div>
        </div>
      ) : null}

      {/* Extensions zone — the only lawful growth area (Constitution 3.1; Art. VI). */}
      {data.extensions && data.extensions.length > 0 ? (
        <div className="vx-receipt-extensions">
          {data.extensions.map((ext) => (
            <div key={ext.label} style={{ display: 'flex', gap: 'var(--vx-space-3)', alignItems: 'baseline' }}>
              <MicroLabel>{ext.label}</MicroLabel>
              <span className="vx-machine">{ext.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

/** Margin Notes rail slot for the Document skeleton (VS §1.4, §12.4). */
export function MarginNote({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
