'use client';

/**
 * Vaerion — Surfaces / Document Territory
 *
 * The Document-skeleton surfaces (Visual System §1.4; Constitution 4.6):
 * Receipt Viewer and Constitution.
 *
 * Receipt Viewer binding (4.6): Document skeleton; ceremony seal at 44 with
 * the full ceremony gap (space.receiptCeremony, VS §1.3); Margin Notes rail;
 * Guided Read available. The Proof Lens is present on the claim (Art. XII:
 * the Lens must exist on every claim surface).
 *
 * Constitution binding (4.6): Document; statute-book structure; drift
 * markers bound to affected receipts; every rule deep-linkable (VS §6.2).
 *
 * All records are Demo-quarantined (5.10).
 */

import { useState } from 'react';
import { DocumentSkeleton } from '../rendering/skeletons';
import type { ReactNode } from 'react';
import { Panel } from '../primitives/containers';
import { MicroLabel } from '../primitives/controls';
import { Receipt } from '../primitives/receipt';
import { Lens } from '../primitives/lens';
import { VERDICT_EXPLAINERS, copy } from './copy';
import { DEMO_RECEIPTS } from './fixtures';

/* ── Receipt Viewer (4.6; VS §6.4, §12.4) ─────────────────────────────────── */

export function ReceiptViewerSurface({ children }: { children: (body: ReactNode, rail: ReactNode) => ReactNode }) {
  const [selectedId, setSelectedId] = useState(DEMO_RECEIPTS[0].id);
  const selected = DEMO_RECEIPTS.find((r) => r.id === selectedId) ?? DEMO_RECEIPTS[0];

  const body = (
    <>
      <div className="vx-surface-title">
        <h1 style={{ margin: 0 }}>Receipt Viewer</h1>
        <span className="vx-demo-stamp vx-micro">DEMO</span>
        <MicroLabel>SKELETON: DOCUMENT</MicroLabel>
      </div>

      <p>{copy('guidance.lens').text}</p>

      <div style={{ display: 'flex', gap: 'var(--vx-space-3)', flexWrap: 'wrap' }}>
        {DEMO_RECEIPTS.map((receipt) => (
          <button
            key={receipt.id}
            type="button"
            className="vx-criteria-token vx-machine"
            aria-pressed={receipt.id === selectedId}
            onClick={() => setSelectedId(receipt.id)}
          >
            {receipt.id}
          </button>
        ))}
      </div>

      {/* Guided Read — the verdict explainers are reachable forever (Art. XIII). */}
      <Panel title="GUIDED READ — THE FOUR VERDICTS">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-2)' }}>
          {(['verified', 'unverified', 'failed', 'pending'] as const).map((verdict) => (
            <div key={verdict} style={{ display: 'flex', gap: 'var(--vx-space-4)', alignItems: 'baseline' }}>
              <span className="vx-machine" style={{ minWidth: '12ch' }}>{verdict.toUpperCase()}</span>
              <span>{VERDICT_EXPLAINERS[verdict].text}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* The receipt in full ceremony: page variant renders the seal at 44
          inside the registered ceremony gap (space.receiptCeremony = 64 px). */}
      <Lens claim={selected.claim} chain={[{ id: selected.id }]} evidence={selected.evidence}>
        <Receipt variant="page" data={selected} />
      </Lens>
    </>
  );

  const rail = (
    <>
      <MicroLabel>MARGIN NOTES</MicroLabel>
      {(selected.marginNotes ?? []).map((note, index) => (
        <p key={index} style={{ margin: 0 }}>{note}</p>
      ))}
      <MicroLabel>CHAIN</MicroLabel>
      <span className="vx-machine">{selected.chainParent ?? 'no parent'}</span>
      <MicroLabel>ENVIRONMENT</MicroLabel>
      <span className="vx-machine">{selected.environment ?? 'demo quarantine'}</span>
    </>
  );

  return <>{children(body, rail)}</>;
}

/* ── Constitution (4.6; VS §6.2, §12.7) ───────────────────────────────────── */

/**
 * The statute-book index: the three ratified documents and their registered
 * top-level structure, law-sourced (transcribed structure, not invention).
 * Every rule is deep-linkable by anchor id (4.6).
 */
const STATUTE_BOOK: readonly { document: string; anchor: string; parts: readonly { name: string; anchor: string; rules: readonly string[] }[] }[] = [
  {
    document: 'VAERION_DESIGN_BIBLE_v1.0',
    anchor: 'doc-bible',
    parts: [
      { name: 'Part One — The Emotional Core', anchor: 'bible-part-one', rules: ['certainty without drama', 'THE INSTRUMENT GRAMMAR', 'CALIBRATED HONESTY'] },
      { name: 'Part Three — The Four Verdicts', anchor: 'bible-part-three', rules: ['VERIFIED — the solid seal', 'UNVERIFIED — the hollow seal', 'FAILED — the crossed seal', 'PENDING — the pulse'] },
      { name: 'Part Four — The Fourteen Articles', anchor: 'bible-part-four', rules: ['Art. I — No Borrowed Identity', 'Art. II — Evidence or Silence', 'Art. III — A Verdict Names Its Verifier', 'Art. IV — Color Is Meaning', 'Art. V — Motion Is Information', 'Art. VI — The Receipt Is Sacred', 'Art. VII — Two Voices', 'Art. VIII — Honesty Over Comfort', 'Art. IX — Chain Is Walkable', 'Art. X — The Ledger Renders Sliced', 'Art. XI — Nothing Unmeasured Ships', 'Art. XII — The Proof Lens', 'Art. XIII — Teach the States', 'Art. XIV — An Equal Instrument'] },
    ],
  },
  {
    document: 'VAERION_VISUAL_SYSTEM_v1.0.1',
    anchor: 'doc-visual-system',
    parts: [
      { name: '§0 — The Seven Registries and Dual Naming', anchor: 'vs-0', rules: ['seven registries', 'dual naming'] },
      { name: '§3 — Shape and Surface', anchor: 'vs-3', rules: ['§3.1 geometry vocabulary', '§3.2 Radius Ladder', '§3.3 hairlines', '§3.4 the layer system', '§3.5 the Chainline'] },
      { name: '§4 — Color', anchor: 'vs-4', rules: ['§4.1 the two chambers', '§4.3 verdict chromatics', '§4.4 grayscale survival', '§4.5 the color budget', '§4.6 contrast law', '§4.7 reference value tables'] },
      { name: '§7 — Motion', anchor: 'vs-7', rules: ['§7.1 the motion registry', '§7.2 motion law', '§7.3 reduced motion'] },
    ],
  },
  {
    document: 'VAERION_IMPLEMENTATION_CONSTITUTION_v1.0',
    anchor: 'doc-constitution',
    parts: [
      { name: 'Part II — Token Pipeline', anchor: 'ic-part-ii', rules: ['2.1 source of truth', '2.2 token anatomy', '2.5 lifecycle', '2.6 validation gates', '2.7 compilation', '2.8 versioning'] },
      { name: 'Part III — Primitive Architecture', anchor: 'ic-part-iii', rules: ['3.1 Receipt', '3.2 Panel', '3.3 Seal', '3.4 Chainline', '3.5 Button', '3.6 Input', '3.7 Table', '3.8 Log', '3.9 Timeline', '3.10 Environment Stamp', '3.11 Navigation Spine', '3.12 Dialog', '3.13 Toast (Return)', '3.14 Gauge', '3.15 Lens'] },
      { name: 'Part IV — Composition Rules', anchor: 'ic-part-iv', rules: ['4.1 three skeletons only', '4.2 anatomy order', '4.3 chrome is not page content', '4.4 criteria bar ownership', '4.5 chain continuity', '4.6 surface bindings', '4.7 no surface invents language'] },
      { name: 'Part V — State Architecture', anchor: 'ic-part-v', rules: ['5.1 the state matrix', '5.3 the verdict boundary', '5.7 transitions', '5.10 demo quarantine'] },
    ],
  },
];

export function ConstitutionSurface({ children }: { children: (body: ReactNode, rail: ReactNode) => ReactNode }) {
  const body = (
    <>
      <div className="vx-surface-title">
        <h1 style={{ margin: 0 }}>Constitution</h1>
        <MicroLabel>SKELETON: DOCUMENT</MicroLabel>
      </div>

      <p>
        The statute book — the three ratified volumes in precedence order
        (Implementation Constitution P-1). Every rule below is deep-linkable
        by anchor; drift markers bind to affected receipts (8.4; 4.6).
      </p>

      {STATUTE_BOOK.map((volume) => (
        <section key={volume.anchor} id={volume.anchor}>
          <div className="vx-panel-title vx-micro">{volume.document}</div>
          <div className="vx-statute">
            {volume.parts.map((part) => (
              <div key={part.anchor} id={part.anchor}>
                <span className="vx-machine">{part.name}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-1)', paddingLeft: 'var(--vx-space-5)' }}>
                  {part.rules.map((rule) => (
                    <a
                      key={rule}
                      href={`#${part.anchor}`}
                      className="vx-machine"
                      style={{ color: 'inherit', textDecoration: 'underline dotted', textDecorationColor: 'var(--vx-color-ink-32)' }}
                    >
                      {rule}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <Panel title="DRIFT MARKERS — BOUND TO AFFECTED RECEIPTS (DEMO)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-3)' }}>
          <span className="vx-drift-marker">
            <span className="vx-micro">DRIFT</span>
            <span className="vx-machine">DEMO-RULESET v0 — receipts rcpt_demo_0001…0002 verified under the affected window (demo)</span>
          </span>
          <span className="vx-machine" style={{ opacity: 0.8 }}>
            a rule change binds a drift marker to receipts verified under the affected window (8.4)
          </span>
        </div>
      </Panel>
    </>
  );

  const rail = (
    <>
      <MicroLabel>ORDER OF PRECEDENCE</MicroLabel>
      <span className="vx-machine">1. BIBLE</span>
      <span className="vx-machine">2. VISUAL SYSTEM</span>
      <span className="vx-machine">3. IMPLEMENTATION CONSTITUTION</span>
      <MicroLabel>RULINGS</MicroLabel>
      <span className="vx-machine">IR-004 pending — space index record</span>
      <span className="vx-machine">IR-005…IR-010 pending — Stage 2–4 pins</span>
    </>
  );

  return <>{children(body, rail)}</>;
}
