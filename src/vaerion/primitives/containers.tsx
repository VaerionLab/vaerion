'use client';

/**
 * Vaerion — Primitives / Panel and Chainline
 *
 * Contracts:
 * - Panel (Constitution 3.2 [VS §5.6]) — Responsibility: hosting content
 *   groups that carry no claims. Boundaries: a Panel must not contain a
 *   claim, must not receive verdict coloration, and must not be used where a
 *   Receipt is required. Extension: none beyond registry-conformant sizing.
 *   Composition: Panels tile Console contexts; they never replace Document
 *   measure. There are no cards (VS §5.6).
 * - Chainline (Constitution 3.4 [VS §3.5; Bible Art. IX, XII]) —
 *   Responsibility: the ambient rendering of chain integrity — a continuous
 *   hairline with node ticks, oriented vertically or horizontally; a break
 *   renders as a gap with the break glyph. Boundaries: one continuous
 *   Chainline geometry per surface region; break detection belongs to the
 *   Chain Authority, break rendering belongs to the Chainline; it must not be
 *   used decoratively where no chain exists.
 *
 * State law: link states arrive from the Chain Authority (Part VIII); the
 * Chainline renders received integrity and never fabricates continuity
 * (1.6; Bible Art. IX).
 */

import { definePrimitive } from './contract';

/* ── Panel ────────────────────────────────────────────────────────────────── */

export const PANEL_METADATA = definePrimitive({
  name: 'Panel',
  constitutionClause: '3.2',
  visualSystemSections: ['5.6'],
  bound: true,
  contract: {
    responsibility: 'Hosting content groups that carry no claims.',
    boundaries: [
      'a Panel must not contain a claim (Constitution 3.2)',
      'must not receive verdict coloration (Constitution 3.2)',
      'must not be used where a Receipt is required (Constitution 3.2)',
      'no shadows, no glass — elevation by layer position plus hairlines only (VS §3.4)',
    ],
    extension: 'none beyond registry-conformant sizing (Constitution 3.2)',
    composition: 'Panels tile Console contexts; they never replace Document measure (Constitution 3.2)',
  },
  tokens: ['color.ink.16', 'shape.radius.0', 'elevation.surface.1', 'space.6'],
  states: [],
  accessibility: {
    announcement: 'generic grouping; labeled by its heading when present',
    keyboard: 'n/a — container',
    sensory: 'hairline frame, no shadow (VS §3.4)',
  },
  citations: [],
});

export interface PanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  /** Machine Voice body — for measurement-dense panels. */
  machine?: boolean;
}

export function Panel({ title, children, className, machine }: PanelProps) {
  return (
    <section className={`vx-panel${className ? ` ${className}` : ''}${machine ? ' vx-machine' : ''}`}>
      {title ? <div className="vx-panel-title vx-micro">{title}</div> : null}
      {children}
    </section>
  );
}

/* ── Chainline ────────────────────────────────────────────────────────────── */

export interface ChainLink {
  /** Node identity — one node per link (VS §3.5). */
  id: string;
  /** Received integrity: 'intact' renders the node; 'broken' renders the 8 px gap + break glyph. */
  broken?: boolean;
}

export const CHAINLINE_METADATA = definePrimitive({
  name: 'Chainline',
  constitutionClause: '3.4',
  visualSystemSections: ['3.5'],
  bound: true,
  contract: {
    responsibility: 'The ambient rendering of chain integrity — a continuous 1 px ink.32 line joining 2 px square nodes, vertically or horizontally; a break renders as an 8 px gap with the break glyph.',
    boundaries: [
      'one continuous Chainline geometry per surface region (Constitution 3.4)',
      'break detection belongs to the Chain Authority; break rendering belongs to the Chainline (Constitution 3.4)',
      'must not be used decoratively where no chain exists (Constitution 3.4)',
      'a broken chain is rendered honestly — never silently re-rooted or skipped (Bible Art. IX)',
    ],
    extension: 'orientation variants only (Constitution 3.4)',
    composition: 'Ledger rows, Timeline events, and Receipt chains attach to it; the integrity strip is a read-only summary instance (Constitution 3.4)',
  },
  tokens: ['shape.chainline.width', 'shape.chainline.node', 'shape.chainline.breakGap', 'color.ink.32', 'color.verdict.failed'],
  states: ['verified', 'unverified', 'failed', 'pending'],
  accessibility: {
    announcement: 'announces chain integrity as a measurement: N links, M breaks (Art. IX walkability)',
    keyboard: 'the Chainline itself is ambient; link navigation is owned by the consuming surface (6.7)',
    sensory: 'breaks render as gap + glyph — shape, not color alone (Art. IV)',
  },
  citations: [],
});

export interface ChainlineProps {
  links: readonly ChainLink[];
  orientation?: 'horizontal' | 'vertical';
  ariaLabel?: string;
}

export function Chainline({ links, orientation = 'horizontal', ariaLabel }: ChainlineProps) {
  if (links.length === 0) {
    // The Chainline must not be used decoratively where no chain exists (3.4).
    return null;
  }
  const breaks = links.filter((l) => l.broken).length;
  return (
    <div
      className="vx-chainline"
      data-orientation={orientation}
      role="img"
      aria-label={ariaLabel ?? `chain: ${links.length} links, ${breaks} broken`}
    >
      {links.map((link, index) => (
        <div key={link.id} className="vx-timeline-event" style={{ display: 'flex', alignItems: 'center' }}>
          {index > 0 ? <span className="vx-chainline-segment" aria-hidden="true" /> : null}
          {link.broken ? (
            <span className="vx-chainline-break" role="img" aria-label="chain break" />
          ) : (
            <span className="vx-chainline-node" aria-label={`link ${link.id}`} />
          )}
        </div>
      ))}
    </div>
  );
}
