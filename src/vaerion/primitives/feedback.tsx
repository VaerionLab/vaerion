'use client';

/**
 * Vaerion — Primitives / Feedback: Dialog · Return · Gauge
 *
 * Contracts:
 * - Dialog (Constitution 3.12 [VS §5.18]) — focused transaction with
 *   mandatory veil and the ceremony contract for consequential decisions:
 *   consequence sentence, governing rule quote, explicit confirm. Classes are
 *   standard, ceremony, destructive; no others. Destructive class requires
 *   typed confirmation of the exact identifier. No shadow, no glass; focus is
 *   trapped while open and restored on close; the veil must not imply verdict
 *   meaning.
 * - Toast / Return (Constitution 3.13 [VS §5.23]) — post-act feedback: an
 *   instrument returning its reading, with seal, machine id, human message.
 *   Bottom-left placement, six-second auto-dismiss, failures persist until
 *   acknowledged; it must not request decisions (dialogs decide, Returns
 *   report); it must not carry marketing language.
 * - Gauge (Constitution 3.14 [VS §5.24]) — truthful progress rendering:
 *   determinate fill or traveling indeterminate segment, after the 300 ms
 *   delay. It must not appear on fast loads; it must never estimate or
 *   animate toward an unconfirmed completion; skeletons and countdowns are
 *   the only sanctioned companions; spinners are prohibited.
 *
 * Every completed act resolves to a receipt or a Return (Constitution 6.5).
 */

import { useEffect, useRef, useState, createContext, useContext, useCallback, useMemo } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { definePrimitive, type VerdictState } from './contract';
import { Seal } from './seal';
import { GAUGE_DELAY_MS, RETURN_LIFE_SECONDS } from '../registry/scales';

/* ── Dialog ───────────────────────────────────────────────────────────────── */

export type DialogClass = 'standard' | 'ceremony' | 'destructive';

export const DIALOG_METADATA = definePrimitive({
  name: 'Dialog',
  constitutionClause: '3.12',
  visualSystemSections: ['5.18'],
  bound: true,
  contract: {
    responsibility: 'Focused transaction with mandatory veil and the ceremony contract for consequential decisions — consequence sentence, governing rule quote, explicit confirm.',
    boundaries: [
      'no shadow, no glass (VS §3.4)',
      'focus is trapped while open and restored on close (Constitution 3.12)',
      'destructive class requires typed confirmation of the exact identifier (Constitution 3.12; VS §5.18)',
      'the veil must not imply verdict meaning (Constitution 3.12)',
      'never hosts ambient browsing (Constitution 3.12)',
    ],
    extension: 'classes are standard, ceremony, destructive; no others (Constitution 3.12)',
    composition: 'hosts forms and confirmations; pairs with Return for the outcome report (6.5)',
  },
  tokens: ['elevation.veil.3', 'elevation.ceremony.5', 'shape.radius.8', 'color.ink.32', 'color.verdict.failed'],
  states: ['idle'],
  accessibility: {
    announcement: 'the consequence sentence is announced on open; the rule quote names the governing rule (6.2)',
    keyboard: 'focus trapped while open; Escape dismisses; focus restored on close (6.8)',
    sensory: 'the veil dims — it carries no verdict color (3.12)',
  },
  citations: [],
});

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  klass?: DialogClass;
  title: string;
  /** Consequence sentence in the Human Voice (6.2). */
  consequence?: string;
  /** Governing rule quotation (6.2). */
  ruleQuote?: string;
  /** For destructive class: the exact identifier the user must type (6.3). */
  requiredIdentifier?: string;
  confirmLabel: string;
  onConfirm: () => void;
  children?: React.ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  klass = 'standard',
  title,
  consequence,
  ruleQuote,
  requiredIdentifier,
  confirmLabel,
  onConfirm,
  children,
}: DialogProps) {
  const [typed, setTyped] = useState('');
  const ceremony = klass === 'ceremony' || klass === 'destructive';
  const blocked =
    klass === 'destructive' && requiredIdentifier !== undefined && typed !== requiredIdentifier;

  // Typed confirmation resets on close — handled in the open-change callback
  // (no setState in effects; the reset belongs to the close event).
  const handleOpenChange = (next: boolean) => {
    if (!next) setTyped('');
    onOpenChange(next);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="vx-veil" />
        <DialogPrimitive.Content className="vx-dialog" aria-describedby={undefined}>
          <DialogPrimitive.Title className="vx-micro">{title}</DialogPrimitive.Title>
          {consequence ? <p className="vx-dialog-consequence">{consequence}</p> : null}
          {ruleQuote ? (
            <blockquote style={{ margin: 0, padding: 'var(--vx-space-3) 0' }}>
              <span className="vx-micro">GOVERNING RULE</span>
              <p style={{ margin: 0 }}>{ruleQuote}</p>
            </blockquote>
          ) : null}
          {children}
          {klass === 'destructive' && requiredIdentifier !== undefined ? (
            <div style={{ marginTop: 'var(--vx-space-4)' }}>
              <label className="vx-micro" htmlFor="vx-destructive-confirm">
                TYPE {requiredIdentifier} TO CONFIRM
              </label>
              <input
                id="vx-destructive-confirm"
                className="vx-field-input vx-machine"
                style={{ borderBottom: 'var(--vx-shape-hairline-width) solid var(--vx-color-ink-32)' }}
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                autoComplete="off"
              />
            </div>
          ) : null}
          <div className="vx-dialog-actions">
            <DialogPrimitive.Close asChild>
              <button type="button" className="vx-button" data-hierarchy="secondary">
                CANCEL
              </button>
            </DialogPrimitive.Close>
            <button
              type="button"
              className="vx-button"
              data-hierarchy={ceremony ? 'primary' : 'secondary'}
              data-destructive={klass === 'destructive' ? 'true' : undefined}
              disabled={blocked}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ── Return (Toast) ───────────────────────────────────────────────────────── */

export interface ReturnRecord {
  id: string;
  /** Machine id — the act's identifier. */
  machineId: string;
  /** Human message — explains what just happened (Art. VII). */
  message: string;
  severity: VerdictState;
  /** Failures persist until acknowledged (Constitution 3.13). */
  persistent?: boolean;
  /** Optional receipt link (VS §5.23). */
  receiptId?: string;
  onReceiptOpen?: () => void;
}

export const RETURN_METADATA = definePrimitive({
  name: 'Toast (Return)',
  constitutionClause: '3.13',
  visualSystemSections: ['5.23'],
  bound: true,
  contract: {
    responsibility: 'Post-act feedback — an instrument returning its reading — with seal, machine id, human message.',
    boundaries: [
      'bottom-left placement, six-second auto-dismiss, failures persist until acknowledged (Constitution 3.13)',
      'must not request decisions — dialogs decide, Returns report (Constitution 3.13)',
      'must not carry marketing language (Constitution 3.13)',
    ],
    extension: 'severity binds the Seal vocabulary only (Constitution 3.13)',
    composition: 'the universal completion of the feedback inventory: every act resolves to a receipt or a Return (Constitution 3.13; 6.5; VS §13)',
  },
  tokens: ['motion.life.return', 'elevation.floating.4', 'shape.radius.4', 'color.ink.32', 'color.ground'],
  states: ['verified', 'unverified', 'failed', 'pending'],
  accessibility: {
    announcement: 'Returns announce politely; failures are announced assertively on dismissal paths (6.11)',
    keyboard: 'dismiss is reachable; persistent Returns are acknowledged by key (6.7)',
    sensory: 'severity rides the Seal — shape plus word (Art. IV)',
  },
  citations: [],
});

/**
 * The Return host state. Registered behavior: Returns never stack into
 * noise — the registered maximum is visible at once, older returns yield
 * (VS §5.23). The maximum number is not enumerated by the ratified text;
 * three is implemented as the Stage 4 structural pin recorded in IR-010
 * (P-5 — recorded, not improvised silently).
 */
export const MAX_VISIBLE_RETURNS = 3;
// motion.life.return (Registry) — the registered Return life, consumed from the ratified scales (1.3).
const RETURN_LIFE_MS = RETURN_LIFE_SECONDS * 1000;

interface ReturnsContextValue {
  returns: readonly ReturnRecord[];
  issue: (record: Omit<ReturnRecord, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ReturnsContext = createContext<ReturnsContextValue | null>(null);

export function ReturnsProvider({ children }: { children: React.ReactNode }) {
  const [returns, setReturns] = useState<readonly ReturnRecord[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: string) => {
    setReturns((current) => current.filter((r) => r.id !== id));
  }, []);

  const issue = useCallback((record: Omit<ReturnRecord, 'id'>) => {
    seq.current += 1;
    const id = `return-${String(seq.current).padStart(4, '0')}`;
    setReturns((current) => {
      // Older returns yield when the maximum is visible (VS §5.23).
      const visible = [...current, { ...record, id }];
      return visible.slice(Math.max(0, visible.length - MAX_VISIBLE_RETURNS));
    });
    if (!record.persistent) {
      setTimeout(() => dismiss(id), RETURN_LIFE_MS);
    }
  }, [dismiss]);

  const value = useMemo(() => ({ returns, issue, dismiss }), [returns, issue, dismiss]);
  return <ReturnsContext.Provider value={value}>{children}</ReturnsContext.Provider>;
}

export function useReturns(): ReturnsContextValue {
  const ctx = useContext(ReturnsContext);
  if (!ctx) {
    throw new Error('[PRIMITIVE · 3.13] useReturns requires ReturnsProvider — every act resolves to a receipt or a Return (6.5).');
  }
  return ctx;
}

export function ReturnsHost() {
  const { returns, dismiss } = useReturns();
  return (
    <div className="vx-return-host" role="region" aria-label="returns">
      {returns.map((record) => (
        <div key={record.id} className="vx-return" role="status" aria-live="polite">
          <Seal verdict={record.severity} size={16} showWord={false} ariaLabel={record.severity} />
          <span className="vx-machine">{record.machineId}</span>
          <span>{record.message}</span>
          {record.receiptId ? (
            <button type="button" className="vx-button" data-hierarchy="quiet" onClick={record.onReceiptOpen}>
              RECEIPT
            </button>
          ) : null}
          {record.persistent ? (
            <button type="button" className="vx-button" data-hierarchy="control" onClick={() => dismiss(record.id)} aria-label="acknowledge">
              ACK
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* ── Gauge ────────────────────────────────────────────────────────────────── */

export const GAUGE_METADATA = definePrimitive({
  name: 'Gauge',
  constitutionClause: '3.14',
  visualSystemSections: ['5.24', '10'],
  bound: true,
  contract: {
    responsibility: 'Truthful progress rendering — determinate fill or traveling indeterminate segment, after the 300 ms delay.',
    boundaries: [
      'must not appear on fast loads (Constitution 3.14; VS §5)',
      'must never estimate or animate toward an unconfirmed completion (Constitution 3.14; 1.6; Art. V)',
      'skeletons and countdowns are the only sanctioned companions; spinners are prohibited (Constitution 3.14)',
      'never substitutes for a verdict state (Constitution 3.14)',
    ],
    extension: 'determinate and indeterminate only (Constitution 3.14)',
    composition: 'chrome-level and inline instances (Constitution 3.14)',
  },
  tokens: ['motion.delay.gauge', 'motion.bound.max', 'color.ink.32', 'shape.radius.2'],
  states: ['loading'],
  accessibility: {
    announcement: 'role="progressbar" announces value ranges; indeterminate announces work in flight without fake values (Art. VIII)',
    keyboard: 'n/a — indicator',
    sensory: 'fill and track differ by ink strength, not color (Art. IV)',
  },
  citations: [],
});

export interface GaugeProps {
  /** 'determinate' renders an actual measured fill; 'indeterminate' renders the traveling segment. */
  mode: 'determinate' | 'indeterminate';
  /** Measured progress in [0,1] — determinate mode only. Never estimated (1.6). */
  value?: number;
  label: string;
}

export function Gauge({ mode, value, label }: GaugeProps) {
  // Before 300 ms the system renders nothing (VS §5 Gauge; §10).
  const [pastThreshold, setPastThreshold] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setPastThreshold(true), GAUGE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const clamped = mode === 'determinate' && typeof value === 'number' ? Math.min(1, Math.max(0, value)) : undefined;
  if (mode === 'determinate' && clamped === undefined) {
    throw new Error('[PRIMITIVE · 3.14/1.6] Determinate Gauge requires a measured value — the Gauge never fakes progress.');
  }

  if (!pastThreshold) return null;

  return (
    <div
      className={`vx-gauge${mode === 'indeterminate' ? ' vx-gauge-indeterminate' : ''}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={mode === 'determinate' ? 0 : undefined}
      aria-valuemax={mode === 'determinate' ? 100 : undefined}
      aria-valuenow={mode === 'determinate' ? Math.round((clamped as number) * 100) : undefined}
    >
      <span
        className="vx-gauge-fill"
        style={
          mode === 'determinate'
            ? { transform: `scaleX(${clamped as number})` }
            : undefined
        }
      />
    </div>
  );
}
