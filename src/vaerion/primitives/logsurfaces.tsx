'use client';

/**
 * Vaerion — Primitives / Record Surfaces: Audit Table · Log · Timeline
 *
 * Contracts:
 * - Audit Table (Constitution 3.7 [VS §5.9]) — dense, attested comparison of
 *   records. Horizontal rules only, except one full-height vertical rule
 *   between attestation groups; numerals right-aligned, tabular, unit column
 *   mandatory; verdict columns bind Seal-16; no verdicts outside Seals; no
 *   pagination that hides the total — position memory is mandatory
 *   (Bible §21.14 as cited; Art. X).
 * - Log (Constitution 3.8 [VS §5.10]) — immutable, machine-voice line stream
 *   with fixed timestamp gutter and anchored lines. Severity is seal-dot +
 *   word, never colored text walls; lines are never rewritten; wrapping hangs
 *   at the gutter.
 * - Timeline (Constitution 3.9 [VS §5.16, §6.1]) — temporal rendering of an
 *   event chain with state-shaped nodes, gaps, and replay scrubbing. Node
 *   shapes are state shapes only; scrubbing pairs drag with step controls;
 *   gaps render as breaks — never smoothed over (Art. VIII).
 */

import { definePrimitive, type VerdictState } from './contract';
import { Seal } from './seal';
import { MicroLabel } from './controls';

/* ── Audit Table ──────────────────────────────────────────────────────────── */

export const AUDIT_TABLE_METADATA = definePrimitive({
  name: 'Table (Audit Table)',
  constitutionClause: '3.7',
  visualSystemSections: ['5.9'],
  bound: true,
  contract: {
    responsibility: 'Dense, attested comparison of records.',
    boundaries: [
      'horizontal rules only, except one full-height vertical rule between attestation groups (Constitution 3.7)',
      'numerals right-aligned, tabular, unit column mandatory (Constitution 3.7)',
      'verdict columns bind Seal-16; no verdicts outside Seals (Constitution 3.7)',
      'must not paginate by hiding without anchor — position memory is mandatory (Constitution 3.7; Art. X)',
    ],
    extension: 'columns are typed against tokens; new column classes follow governance (Constitution 3.7)',
    composition: 'filters are owned by the Criteria Bar (4.4); export is owned by the Export Authority and ships a manifest receipt (Constitution 3.7)',
  },
  tokens: ['color.ink.16', 'color.ink.32', 'shape.seal.size.16', 'type.numeric.tabular', 'space.ledgerRow'],
  states: ['verified', 'unverified', 'failed', 'pending'],
  accessibility: {
    announcement: 'column headers are announced; the slice statement ("showing X of Y") is announced with the table (Art. X)',
    keyboard: 'rows reachable in reading order (6.7)',
    sensory: 'rules are hairlines; verdict identity rides Seal shape (Art. IV)',
  },
  citations: [],
});

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right';
  kind?: 'text' | 'numeral' | 'verdict';
  /** Unit column label when kind === 'numeral' — the unit column is mandatory (3.7). */
  unit?: string;
}

export interface TableRowData {
  id: string;
  cells: Record<string, string | number | VerdictState>;
  demo?: boolean;
}

export function AuditTable({
  columns,
  rows,
  slice,
}: {
  columns: readonly TableColumn[];
  rows: readonly TableRowData[];
  /** The measurement of the whole (Art. X): "showing <shown> of <total>". */
  slice: { shown: number; total: number };
}) {
  return (
    <div>
      <div className="vx-machine" style={{ marginBottom: 'var(--vx-space-2)' }}>
        showing {slice.shown} of {slice.total}
      </div>
      <div className="vx-table-scroll">
        <table className="vx-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className={col.align === 'right' ? 'vx-num' : undefined}>
                <MicroLabel>{col.label}</MicroLabel>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} data-row-id={row.id}>
              {columns.map((col) => {
                const cell = row.cells[col.key];
                return (
                  <td
                    key={col.key}
                    className={col.align === 'right' || col.kind === 'numeral' ? 'vx-num vx-machine' : undefined}
                  >
                    {col.kind === 'verdict' ? (
                      <Seal verdict={cell as VerdictState} size={16} showWord={false} ariaLabel={String(cell)} />
                    ) : (
                      <span className={col.kind === 'numeral' ? 'vx-machine' : undefined}>
                        {String(cell)}
                        {col.kind === 'numeral' && col.unit ? ` ${col.unit}` : ''}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Log ──────────────────────────────────────────────────────────────────── */

export type LogSeverity = 'info' | 'hold' | 'fault' | 'verified';

const SEVERITY_VERDICT: Record<LogSeverity, VerdictState> = {
  info: 'unverified',
  hold: 'pending',
  fault: 'failed',
  verified: 'verified',
};

export interface LogLine {
  id: string;
  at: string;
  severity: LogSeverity;
  /** Machine Voice literal message. */
  message: string;
  /** Attested lines link their receipt inline (Constitution 3.8). */
  receiptId?: string;
}

export const LOG_METADATA = definePrimitive({
  name: 'Log',
  constitutionClause: '3.8',
  visualSystemSections: ['5.10'],
  bound: true,
  contract: {
    responsibility: 'Immutable, machine-voice line stream with fixed timestamp gutter and anchored lines.',
    boundaries: [
      'severity is seal-dot + word, never colored text walls (Constitution 3.8)',
      'lines must not be rewritten — appended logs are immutable like the ledger they attest (Constitution 3.8)',
      'wrapping must hang-indent at the gutter (Constitution 3.8)',
    ],
    extension: 'severity vocabulary is fixed; new severities require amendment (Constitution 3.8)',
    composition: 'binds to Run surfaces and Timeline replay; attested lines link their receipt inline (Constitution 3.8)',
  },
  tokens: ['color.ink.16', 'shape.seal.size.16', 'type.voice.machine', 'space.1'],
  states: ['idle', 'pending', 'verified', 'failed', 'unverified'],
  accessibility: {
    announcement: 'lines announce in stream order; appends are polite and batched (6.11)',
    keyboard: 'stream is scrollable and reachable (6.7)',
    sensory: 'severity rides the seal-dot shape, never color alone (Art. IV)',
  },
  citations: [],
});

export function Log({ lines, title }: { lines: readonly LogLine[]; title?: string }) {
  return (
    <div className="vx-log" role="log" aria-label={title ?? 'log'} aria-live="polite">
      {lines.map((line) => (
        <div key={line.id} className="vx-log-line" data-line-id={line.id}>
          <span className="vx-machine">{line.at}</span>
          <span>
            <span className="vx-log-severity">
              <Seal verdict={SEVERITY_VERDICT[line.severity]} size={16} showWord={false} ariaLabel={line.severity} />
              <span className="vx-micro">{line.severity}</span>
            </span>{' '}
            <span className="vx-machine">{line.message}</span>
            {line.receiptId ? <span className="vx-machine"> — receipt {line.receiptId}</span> : null}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Timeline ─────────────────────────────────────────────────────────────── */

export interface TimelineEvent {
  id: string;
  label: string;
  at: string;
  state: VerdictState;
}

export const TIMELINE_METADATA = definePrimitive({
  name: 'Timeline',
  constitutionClause: '3.9',
  visualSystemSections: ['5.16', '6.1'],
  bound: true,
  contract: {
    responsibility: 'Temporal rendering of a chain of events with state-shaped nodes, gaps, and replay scrubbing.',
    boundaries: [
      'node shapes are state shapes only (Constitution 3.9)',
      'scrubbing is owned here and must pair drag with step controls (Constitution 3.9; VS §10)',
      'must not smooth over gaps — a gap is rendered as a break (Constitution 3.9; Art. VIII)',
    ],
    extension: 'event classes derive from data authorities only (Constitution 3.9)',
    composition: 'horizontal Chainline instance; consumes Run and Verification data authorities (Constitution 3.9)',
  },
  tokens: ['shape.seal.size.16', 'color.ink.32', 'shape.chainline.width', 'shape.chainline.node', 'shape.chainline.breakGap'],
  states: ['verified', 'unverified', 'failed', 'pending'],
  accessibility: {
    announcement: 'events announce in temporal order with their state word (6.11)',
    keyboard: 'step controls are buttons; scrubbing is reachable without drag (6.10)',
    sensory: 'nodes are state shapes — seal geometry carries state (Bible Part Three)',
  },
  citations: [],
});

export interface TimelineProps {
  events: readonly TimelineEvent[];
  /** Index of a gap in the event sequence — rendered as a Chainline break (Art. VIII). */
  breakAfter?: number | null;
  /** Scrub position (event index) — owned by the consuming surface (3.9). */
  position: number;
  onStep: (next: number) => void;
}

export function Timeline({ events, breakAfter = null, position, onStep }: TimelineProps) {
  return (
    <div>
      <div className="vx-timeline" role="list" aria-label="event timeline">
        {events.map((event, index) => (
          <div key={event.id} role="listitem" style={{ display: 'flex', alignItems: 'center' }}>
            {index > 0 ? (
              breakAfter === index - 1 ? (
                <span className="vx-chainline-break" role="img" aria-label="gap in the record — rendered as a break" />
              ) : (
                <span className="vx-chainline-segment" aria-hidden="true" />
              )
            ) : null}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--vx-space-2)',
                opacity: index <= position ? 1 : 0.4,
              }}
            >
              <Seal verdict={event.state} size={16} showWord={false} ariaLabel={event.state} />
              <span className="vx-micro" style={{ opacity: index === position ? 1 : 0.6 }}>
                {event.label}
              </span>
              <span className="vx-machine">{event.at}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 'var(--vx-space-3)', marginTop: 'var(--vx-space-3)' }}>
        <button type="button" className="vx-button" data-hierarchy="control" onClick={() => onStep(Math.max(0, position - 1))} aria-label="step back">
          ◀
        </button>
        <button
          type="button"
          className="vx-button"
          data-hierarchy="control"
          onClick={() => onStep(Math.min(events.length - 1, position + 1))}
          aria-label="step forward"
        >
          ▶
        </button>
        <span className="vx-machine" aria-live="polite">
          {position + 1} / {events.length}
        </span>
      </div>
    </div>
  );
}
