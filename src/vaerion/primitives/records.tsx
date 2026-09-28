'use client';

/**
 * Vaerion — Primitives / Records: Hash Line · Evidence Item · Ledger Row
 *
 * Contracts (Constitution 3.0 — governed by identical contract structure
 * derived from their Visual System definitions):
 * - Hash Line (VS §5) — evidence's literal address. Displayed compact with
 *   ≥ 10 characters and truncation visibly marked; the full value reveals on
 *   click ONLY — never on hover (VS §14 amendment 1) — and every reveal is
 *   auditable. Machine Voice exclusively (VS §5; §2.3).
 * - Evidence Item (VS §5) — one unit of proof: what it is, where it came
 *   from, its hash, its contribution to the verdict. Restricted evidence is a
 *   first-class state rendered hatched with its honest notice (Part V; 5.2).
 * - Ledger Row (VS §5) — the fixed ledger rhythm: 36 px row height,
 *   hairline-ruled, Machine Voice identifiers, verdict seal at the registered
 *   position. Rows never change height between surfaces (VS §5; Art. X).
 *
 * Honesty law: a hash elided is labeled as elided, never presented as
 * complete (Bible Art. II).
 */

import { useState } from 'react';
import { definePrimitive, DEMO_STAMP_WORD } from './contract';
import { Seal, type SealSize } from './seal';
import { MicroLabel } from './controls';
import type { VerdictState } from './contract';

/* ── Hash Line ────────────────────────────────────────────────────────────── */

export const HASH_LINE_METADATA = definePrimitive({
  name: 'Hash Line',
  constitutionClause: '3.0',
  visualSystemSections: ['5', '2.3'],
  bound: false,
  contract: {
    responsibility: "Rendering evidence's literal address with truncation honesty and click-only reveal.",
    boundaries: [
      'never reveals on hover (VS §14 amendment 1 — shoulder-surf and screenshot discipline)',
      'never presents an elided hash as complete (Bible Art. II)',
      'never renders in the Human Voice (VS §2.3)',
    ],
    extension: 'none beyond the registered compact/revealed pair',
    composition: 'embeds in Evidence Item, Receipt id strip, Log lines, Search results, integrity strips',
  },
  tokens: ['type.voice.machine', 'type.numeric.tabular', 'color.ink.32'],
  states: [],
  accessibility: {
    announcement: 'announces the compact value and explicitly says "elided" when truncated (Art. II)',
    keyboard: 'Enter/Space reveal; reveal is a deliberate act on every path (6.7)',
    sensory: 'reveal is marked by an underline affordance, not color',
  },
  citations: [],
});

export interface HashLineProps {
  value: string;
  /** Characters shown when compact — minimum 10 (Bible Art. II; VS §5). */
  compactLength?: number;
  onReveal?: () => void;
  ariaLabel?: string;
}

export function HashLine({ value, compactLength = 10, onReveal, ariaLabel }: HashLineProps) {
  if (compactLength < 10) {
    throw new Error('[PRIMITIVE · Art. II] Compact hash display shows at least ten characters (Bible Art. II; VS §5).');
  }
  const [revealed, setRevealed] = useState(false);
  const elided = value.length > compactLength;
  const compact = elided ? `${value.slice(0, compactLength)}…` : value;

  return (
    <button
      type="button"
      className="vx-hashline vx-machine"
      onClick={() => {
        setRevealed((r) => !r);
        if (!revealed) onReveal?.();
      }}
      aria-label={ariaLabel ?? (elided ? `hash ${compact} elided — activate to reveal the full value` : `hash ${value}`)}
      aria-expanded={revealed}
    >
      {revealed ? (
        <span>{value}</span>
      ) : (
        <span className="vx-hashline-compact">
          {compact}
          {elided ? <span className="vx-hashline-elided"> [elided]</span> : null}
        </span>
      )}
    </button>
  );
}

/* ── Evidence Item ────────────────────────────────────────────────────────── */

export interface EvidenceRecord {
  /** What it is. */
  kind: string;
  /** Where it came from. */
  source: string;
  /** Its hash. */
  hash: string;
  /** Its contribution to the verdict. */
  contribution: string;
  /** Restriction is a first-class state that travels with the artifact (8.2). */
  restricted?: boolean;
  /** Demo quarantine flag — travels with the record forever (5.10). */
  demo?: boolean;
}

export const EVIDENCE_ITEM_METADATA = definePrimitive({
  name: 'Evidence Item',
  constitutionClause: '3.0',
  visualSystemSections: ['5'],
  bound: false,
  contract: {
    responsibility: 'Rendering one unit of proof: what it is, where it came from, its hash, its contribution.',
    boundaries: [
      'restricted evidence renders hatched with its honest notice — never silently omitted (Part V; 3.15)',
      'missing evidence is a recorded state, never silent deletion (8.2)',
      'never renders a hash outside the Hash Line (VS §5)',
    ],
    extension: 'evidence types arrive from the Evidence Authority (Part VIII)',
    composition: 'stacks in the receipt evidence region in registered rhythm (VS §5)',
  },
  tokens: ['color.ink.16', 'space.4', 'type.voice.machine'],
  states: ['restricted', 'demo'],
  accessibility: {
    announcement: 'announces kind, source, and restriction state in full (6.11)',
    keyboard: 'the embedded Hash Line is the single interactive element (6.7)',
    sensory: 'restriction is hatched — pattern, not color alone (Art. IV)',
  },
  citations: [],
});

export function EvidenceItem({ evidence }: { evidence: EvidenceRecord }) {
  return (
    <div className={`vx-panel${evidence.restricted ? ' vx-restricted' : ''}`} style={{ padding: 'var(--vx-space-4)' }}>
      <div style={{ display: 'flex', gap: 'var(--vx-space-3)', flexWrap: 'wrap', alignItems: 'baseline' }}>
        <MicroLabel>{evidence.kind}</MicroLabel>
        <span className="vx-machine">{evidence.source}</span>
        {evidence.demo ? <span className="vx-demo-stamp vx-micro">{DEMO_STAMP_WORD}</span> : null}
      </div>
      <div style={{ marginTop: 'var(--vx-space-2)' }}>
        <HashLine value={evidence.hash} />
      </div>
      <div style={{ marginTop: 'var(--vx-space-2)' }}>{evidence.contribution}</div>
      {evidence.restricted ? (
        <div className="vx-micro" style={{ marginTop: 'var(--vx-space-2)' }}>
          RESTRICTED — EVIDENCE EXISTS AND IS WITHHELD
        </div>
      ) : null}
    </div>
  );
}

/* ── Ledger Row ───────────────────────────────────────────────────────────── */

export const LEDGER_ROW_METADATA = definePrimitive({
  name: 'Ledger Row',
  constitutionClause: '3.0',
  visualSystemSections: ['5'],
  bound: false,
  contract: {
    responsibility: 'The fixed ledger rhythm row — 36 px, hairline-ruled, Machine Voice identifiers, seal at the registered position.',
    boundaries: [
      'rows never change height between surfaces (VS §5)',
      'never compresses below registration at narrow widths (VS §9)',
      'never renders a verdict outside a Seal (Constitution 3.7)',
    ],
    extension: 'columns arrive from the data authorities (Part VIII)',
    composition: 'tiles the Ledger and Audit result tables; binds the Criteria Bar above (4.4)',
  },
  tokens: ['space.ledgerRow', 'color.ink.16', 'type.voice.machine', 'shape.seal.size.16'],
  states: ['demo'],
  accessibility: {
    announcement: 'row content in reading order; the seal announces the full fact (6.11)',
    keyboard: 'rows are reachable; J/K traversal is owned by the surface (6.7)',
    sensory: 'the 36 px rhythm is the stable physical act of scanning (Art. X)',
  },
  citations: [],
});

export interface LedgerRowProps {
  id: string;
  verdict: VerdictState;
  verifier?: string;
  summary: string;
  at: string;
  sealSize?: Extract<SealSize, 16>;
  demo?: boolean;
  children?: React.ReactNode;
}

export function LedgerRow({ id, verdict, verifier, summary, at, sealSize = 16, demo }: LedgerRowProps) {
  return (
    <div className="vx-ledger-row">
      <Seal verdict={verdict} size={sealSize} verifier={verifier} showWord={false} ariaLabel={verdict} />
      <span className="vx-machine">{id}</span>
      <span style={{ flex: 1, minWidth: 0, flexBasis: '60%' }}>{summary}</span>
      <span className="vx-machine">{at}</span>
      {demo ? <span className="vx-demo-stamp vx-micro">{DEMO_STAMP_WORD}</span> : null}
    </div>
  );
}
