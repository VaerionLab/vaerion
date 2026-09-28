'use client';

/**
 * Vaerion — Surfaces / Console Territory
 *
 * The Console-skeleton surfaces (Visual System §1.4; Constitution 4.6):
 * Runtime, Ledger, Audit, Verification, Enterprise, Playground.
 *
 * Composition rules enforced here (Part IV):
 * - 4.3  chrome is inherited from the shell — never re-rendered here;
 * - 4.4  every filterable set owns its filters through the Criteria Bar;
 * - 4.5  chain continuity — breaks render as breaks on every surface;
 * - 4.6  per-surface bindings (slicing, sticky criteria, keyboard verbs,
 *        receipt generation, demo quarantine, exports disabled);
 * - 4.7  no invented language — strings are consumed by identifier from the
 *        copy module (IR-009) or are constitutional vocabulary.
 *
 * All records rendered here are Demo-quarantined (5.10): the stamp travels
 * with every record; no verdict is presented as live (1.6; 5.3).
 */

import { useMemo, useRef, useState } from 'react';
import { Panel } from '../primitives/containers';
import { Button, FieldFrame, MicroLabel } from '../primitives/controls';
import { CriteriaBar, type Criterion } from '../primitives/criteria';
import { Chainline } from '../primitives/containers';
import { Gauge } from '../primitives/feedback';
import { Dialog, useReturns } from '../primitives/feedback';
import { AuditTable, Log, Timeline } from '../primitives/logsurfaces';
import { LedgerRow } from '../primitives/records';
import { Receipt, type ReceiptData } from '../primitives/receipt';
import { Seal } from '../primitives/seal';
import { copy, VERDICT_EXPLAINERS } from './copy';
import {
  DEMO_CHAIN,
  DEMO_CHAIN_WITH_BREAK,
  DEMO_LEDGER_SHOWN,
  DEMO_LEDGER_TOTAL,
  DEMO_LOG,
  DEMO_QUEUE,
  DEMO_RECEIPTS,
  DEMO_TIMELINE,
} from './fixtures';
import { HOLD_AFFIRM_MS } from '../registry/scales';
import type { VerdictState } from '../primitives/contract';

/* ── Runtime (4.6: Console; live pulses; replay via Timeline) ─────────────── */

export function RuntimeSurface() {
  const [position, setPosition] = useState(DEMO_TIMELINE.length - 1);
  const [gaugeRunning, setGaugeRunning] = useState(false);
  const { issue } = useReturns();

  const startDemoRun = () => {
    if (gaugeRunning) return;
    setGaugeRunning(true);
    // A demonstration run: the Gauge renders only after the 300 ms threshold
    // (VS §5 Gauge) and the run ends in a Return — every act resolves (6.5).
    setTimeout(() => {
      setGaugeRunning(false);
      issue({
        machineId: 'run.demo.replay',
        message: 'demonstration run finished — no authority was contacted',
        severity: 'unverified',
      });
    }, 3000);
  };

  return (
    <>
      <div className="vx-surface-title">
        <h1 style={{ margin: 0 }}>Runtime</h1>
        <span className="vx-demo-stamp vx-micro">DEMO</span>
        <MicroLabel>SKELETON: CONSOLE</MicroLabel>
      </div>

      <div className="vx-run-grid">
        <Panel title="EVENT STREAM">
          <Log lines={DEMO_LOG} title="demo event stream" />
        </Panel>

        <Panel title="REPLAY">
          <Timeline events={DEMO_TIMELINE} position={position} onStep={setPosition} breakAfter={2} />
          <p style={{ marginBottom: 0 }}>{copy('guidance.lens').text}</p>
        </Panel>

        <Panel title="RUN">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-4)' }}>
            <Button hierarchy="primary" onClick={startDemoRun} disabled={gaugeRunning}>
              {gaugeRunning ? 'RUN IN FLIGHT' : 'REPLAY DEMONSTRATION RUN'}
            </Button>
            {gaugeRunning ? <Gauge mode="indeterminate" label="demonstration run in flight" /> : null}
            <div className="vx-machine" style={{ opacity: 0.8 }}>
              authority: not-yet-bound (Stage 7) — the run contacts nothing
            </div>
          </div>
        </Panel>

        <Panel title="LIVE PULSES">
          <div style={{ display: 'flex', gap: 'var(--vx-space-5)', flexWrap: 'wrap', alignItems: 'center' }}>
            <Seal verdict="pending" size={20} showWord={false} ariaLabel="pending" />
            <span className="vx-machine">1 attestation in flight (demonstration)</span>
          </div>
          <p style={{ marginBottom: 0 }}>{VERDICT_EXPLAINERS.pending.text}</p>
        </Panel>
      </div>
    </>
  );
}

/* ── Ledger (4.6: Console; Criteria Bar sticky; sliced rendering; integrity strip) ── */

export function LedgerSurface() {
  const [criteria, setCriteria] = useState<readonly Criterion[]>([
    { field: 'subject', operator: '=', value: 'agent://demo-runner' },
    { field: 'issued-at', operator: 'range', value: '2024-11-01..2024-11-05' },
  ]);
  const [jumpDate, setJumpDate] = useState('');

  const rows = useMemo(() => {
    const subjectCriterion = criteria.find((c) => c.field === 'subject');
    return DEMO_RECEIPTS.filter((receipt) => {
      if (subjectCriterion && !receipt.subject.includes(subjectCriterion.value)) return false;
      if (jumpDate && !receipt.issuedAt.startsWith(jumpDate)) return false;
      return true;
    });
  }, [criteria, jumpDate]);

  return (
    <>
      <div className="vx-surface-title">
        <h1 style={{ margin: 0 }}>Ledger</h1>
        <span className="vx-demo-stamp vx-micro">DEMO</span>
        <MicroLabel>SKELETON: CONSOLE</MicroLabel>
      </div>

      {/* Integrity strip — a read-only Chainline summary instance (3.4; 4.6). */}
      <div className="vx-integrity-strip">
        <MicroLabel>INTEGRITY</MicroLabel>
        <Chainline links={DEMO_CHAIN_WITH_BREAK} orientation="horizontal" ariaLabel="chain integrity: 4 links, 1 broken" />
        <span className="vx-machine">1 break rendered as a break (Art. XII; 5.9)</span>
      </div>

      <Panel title="RECORDS">
        <div className="vx-criteria-sticky">
          <CriteriaBar criteria={criteria} onChange={setCriteria} ariaLabel="ledger criteria" />
        </div>
        <div className="vx-machine" style={{ padding: 'var(--vx-space-3) 0' }}>
          showing {rows.length} of {DEMO_LEDGER_TOTAL}
        </div>
        <div className="vx-row-list vx-scroll" style={{ maxHeight: '40vh' }}>
          {rows.map((receipt) => (
            <LedgerRow
              key={receipt.id}
              id={receipt.id}
              verdict={receipt.verdict}
              verifier={receipt.verifier}
              summary={receipt.claim}
              at={receipt.issuedAt}
              demo={receipt.demo}
            />
          ))}
          {rows.length === 0 ? <p>{copy('empty.ledger').text}</p> : null}
        </div>
        <div style={{ display: 'flex', gap: 'var(--vx-space-4)', marginTop: 'var(--vx-space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
          <MicroLabel>JUMP-TO-DATE</MicroLabel>
          <FieldFrame label="JUMP TO DATE" value={jumpDate} onChange={setJumpDate} machine name="jump-date" inputClassName="vx-machine" />
        </div>
      </Panel>
    </>
  );
}

/* ── Audit (4.6: Console; Range Grammar in Criteria Bar; export preview) ──── */

export function AuditSurface() {
  const [criteria, setCriteria] = useState<readonly Criterion[]>([
    { field: 'issued-at', operator: 'range', value: '2024-11-01..2024-11-05' },
    { field: 'verdict', operator: 'in', value: 'verified,failed' },
  ]);
  const { issue } = useReturns();

  const columns = [
    { key: 'id', label: 'RECEIPT ID' },
    { key: 'verdict', label: 'VERDICT', kind: 'verdict' as const },
    { key: 'subject', label: 'SUBJECT' },
    { key: 'count', label: 'EVIDENCE', kind: 'numeral' as const, unit: 'items' },
  ];

  const rows = DEMO_RECEIPTS.map((receipt, index) => ({
    id: receipt.id,
    demo: receipt.demo,
    cells: {
      id: receipt.id,
      verdict: receipt.verdict,
      subject: receipt.subject,
      count: receipt.evidence.length + index * 0,
    },
  }));

  return (
    <>
      <div className="vx-surface-title">
        <h1 style={{ margin: 0 }}>Audit</h1>
        <span className="vx-demo-stamp vx-micro">DEMO</span>
        <MicroLabel>SKELETON: CONSOLE</MicroLabel>
      </div>

      <Panel title="CRITERIA — RANGE GRAMMAR">
        <CriteriaBar criteria={criteria} onChange={setCriteria} ariaLabel="audit criteria (range grammar)" />
      </Panel>

      <Panel title="RESULT TABLE">
        <AuditTable columns={columns} rows={rows} slice={{ shown: rows.length, total: DEMO_LEDGER_TOTAL }} />
      </Panel>

      <Panel title="EXPORT PREVIEW — RECEIPT GRAMMAR">
        <Receipt
          variant="card"
          data={{
            id: 'manifest.preview.demo',
            claim: 'The audit export bundle contains the selected slice and its manifest.',
            subject: 'export://preview',
            verdict: 'unverified',
            verificationMethod: 'unassigned — the Export Authority arrives at Stage 7',
            evidence: [],
            issuedAt: 'preview',
            chainParent: null,
            demo: true,
          }}
        />
        <div style={{ marginTop: 'var(--vx-space-4)' }}>
          <Button
            hierarchy="secondary"
            disabled
            ariaLabel="export disabled — demo quarantine and no bound Export Authority"
            onClick={() =>
              issue({ machineId: 'export.demo', message: 'export refused — demo quarantine (5.10)', severity: 'failed', persistent: true })
            }
          >
            EXPORT (DISABLED)
          </Button>
        </div>
      </Panel>
    </>
  );
}

/* ── Verification (4.6: Console; age-sorted queue; keyboard verbs; receipts) ── */

/** Hold-to-affirm: 600 ms hold on the registered meter; click-path ceremony alternative (6.6; VS §13.2). */
function HoldToAffirm({ label, onAffirm, disabled }: { label: string; onAffirm: () => void; disabled?: boolean }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    if (disabled || holding) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      onAffirm();
    }, HOLD_AFFIRM_MS);
  };
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false); // releasing early cancels with no partial effect (VS §13.2)
  };

  return (
    <button
      type="button"
      className="vx-button vx-hold"
      data-hierarchy="primary"
      disabled={disabled}
      aria-label={`${label} — hold for ${HOLD_AFFIRM_MS} milliseconds, or use the click-path ceremony`}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.repeat) start();
      }}
      onKeyUp={cancel}
    >
      {holding ? <span className="vx-hold-fill" style={{ animation: `vx-hold-progress ${HOLD_AFFIRM_MS}ms linear forwards` }} /> : null}
      {label}
    </button>
  );
}

export function VerificationSurface() {
  const [selected, setSelected] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [decisions, setDecisions] = useState<readonly ReceiptData[]>([]);
  const { issue } = useReturns();

  const queue = DEMO_QUEUE;
  const current = queue[selected];

  const move = (delta: number) => {
    setSelected((s) => Math.min(queue.length - 1, Math.max(0, s + delta)));
  };

  // Keyboard verbs are owned centrally (6.7): J/K queue motion, V verify,
  // R review, E evidence. The surface binds them; primitives never do.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey) return;
    if (event.key === 'j' || event.key === 'J') { event.preventDefault(); move(1); }
    if (event.key === 'k' || event.key === 'K') { event.preventDefault(); move(-1); }
    if (event.key === 'r' || event.key === 'R') { event.preventDefault(); setReviewOpen(true); }
    if (event.key === 'e' || event.key === 'E') { event.preventDefault(); move(0); issue({ machineId: 'queue.evidence', message: 'evidence opens on the receipt viewer surface', severity: 'unverified' }); }
  };

  const decide = (verdict: VerdictState) => {
    if (!current) return;
    // A user decision is itself a fact received from an authority once
    // recorded (5.3). In demo quarantine, the demonstration authority
    // records it — stamped DEMO, never presented as live (1.6).
    const receipt: ReceiptData = {
      id: `rcpt_demo_decision_${String(decisions.length + 1).padStart(3, '0')}`,
      claim: `Verification decision recorded for ${current.id}: ${verdict}.`,
      subject: current.id,
      verdict,
      verifier: 'demo-operator (quarantined)',
      ruleset: 'DEMO-RULESET v0',
      environment: 'demo quarantine',
      verificationMethod: 'demo-method/operator-decision@v0',
      evidence: [],
      issuedAt: 'decision-time (demo)',
      chainParent: current.id,
      demo: true,
    };
    setDecisions((d) => [...d, receipt]);
    issue({
      machineId: receipt.id,
      message: `decision receipt appended (demo) — ${verdict}`,
      severity: verdict === 'failed' ? 'failed' : 'unverified',
      receiptId: receipt.id,
    });
  };

  return (
    <>
      <div className="vx-surface-title">
        <h1 style={{ margin: 0 }}>Verification</h1>
        <span className="vx-demo-stamp vx-micro">DEMO</span>
        <MicroLabel>SKELETON: CONSOLE</MicroLabel>
      </div>

      <p>{copy('guidance.verification').text}</p>

      <Panel title="QUEUE — AGE-SORTED">
        <div className="vx-queue" tabIndex={0} onKeyDown={onKeyDown} aria-label="verification queue — J K move, V verify, R review, E evidence">
          {queue.map((entry, index) => (
            <div
              key={entry.id}
              className="vx-queue-entry"
              data-selected={index === selected ? 'true' : undefined}
              onClick={() => setSelected(index)}
            >
              <LedgerRow id={entry.id} verdict="pending" summary={entry.summary} at={entry.age} demo />
            </div>
          ))}
          {queue.length === 0 ? <div className="vx-empty"><span>{copy('empty.queue').text}</span></div> : null}
        </div>
      </Panel>

      <Panel title="DECIDE">
        <div style={{ display: 'flex', gap: 'var(--vx-space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
          <HoldToAffirm label="HOLD TO VERIFY" onAffirm={() => decide('verified')} disabled={!current} />
          <Button hierarchy="secondary" onClick={() => setReviewOpen(true)} disabled={!current}>
            REVIEW (R)
          </Button>
          <Button hierarchy="secondary" onClick={() => decide('failed')} disabled={!current}>
            RECORD FAILED
          </Button>
        </div>
      </Panel>

      <Panel title="DECISION RECEIPTS">
        {decisions.length === 0 ? (
          <div className="vx-empty">
            <span className="vx-machine">0 decision receipts</span>
            <span>{copy('guidance.verification').text}</span>
          </div>
        ) : (
          <div className="vx-row-list">
            {decisions.map((receipt) => (
              <Receipt key={receipt.id} data={receipt} variant="row" />
            ))}
          </div>
        )}
      </Panel>

      <Dialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        klass="ceremony"
        title="REVIEW BEFORE DECISION"
        consequence="A verification decision is itself recorded evidence. Confirm that you have reviewed the record and its method before deciding."
        ruleQuote="Pending — verdict received — Verified or Failed: the verdict must name its verifier. (Constitution 5.7)"
        confirmLabel="I HAVE REVIEWED"
        onConfirm={() => issue({ machineId: 'queue.review', message: 'review acknowledged (demo)', severity: 'unverified' })}
      />
    </>
  );
}

/* ── Enterprise (4.6: Console; reveal-once credential ceremonies; admin receipts) ── */

export function EnterpriseSurface() {
  const [ceremonyOpen, setCeremonyOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const { issue } = useReturns();

  return (
    <>
      <div className="vx-surface-title">
        <h1 style={{ margin: 0 }}>Enterprise</h1>
        <span className="vx-demo-stamp vx-micro">DEMO</span>
        <MicroLabel>SKELETON: CONSOLE</MicroLabel>
      </div>

      <Panel title="CREDENTIAL CEREMONY — REVEAL ONCE">
        <div style={{ display: 'flex', gap: 'var(--vx-space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button hierarchy="primary" onClick={() => setCeremonyOpen(true)}>
            BEGIN CEREMONY
          </Button>
          <span className="vx-machine">credentials: {revealed ? 'revealed once — gone' : 'sealed'}</span>
        </div>
      </Panel>

      <Panel title="ADMIN ACTION LOG — RENDERED AS RECEIPTS">
        <div className="vx-row-list">
          <Receipt
            variant="row"
            data={{
              id: 'rcpt_demo_admin_001',
              claim: 'Admin rotation ceremony completed for the demonstration principal.',
              subject: 'principal://demo-admin',
              verdict: 'verified',
              verifier: 'demo-identity (quarantined)',
              ruleset: 'DEMO-RULESET v0',
              environment: 'demo quarantine',
              verificationMethod: 'demo-method/identity-event@v0',
              evidence: [],
              issuedAt: '2024-11-03T10:00:00Z',
              chainParent: null,
              demo: true,
            }}
          />
          <Receipt
            variant="row"
            data={{
              id: 'rcpt_demo_admin_002',
              claim: 'Credential rotation issued a receipt; identity events enter the admin log as receipts.',
              subject: 'principal://demo-admin',
              verdict: 'unverified',
              verificationMethod: 'unassigned — Identity Authority arrives at Stage 7',
              evidence: [],
              issuedAt: '2024-11-03T10:05:00Z',
              chainParent: 'rcpt_demo_admin_001',
              demo: true,
            }}
          />
        </div>
      </Panel>

      <Dialog
        open={ceremonyOpen}
        onOpenChange={setCeremonyOpen}
        klass="ceremony"
        title="CREDENTIAL CEREMONY"
        consequence="The credential will be shown exactly once. This dialog cannot be reopened to show it again. Store it now."
        ruleQuote="Credentials are reveal-once with mandatory ceremony. (Constitution 8.9)"
        confirmLabel="REVEAL"
        onConfirm={() => {
          setRevealed(true);
          issue({ machineId: 'identity.ceremony', message: 'credential revealed once (demo) — ceremony recorded', severity: 'unverified' });
        }}
      >
        {revealed ? (
          <div className="vx-restricted" style={{ padding: 'var(--vx-space-4)' }}>
            <span className="vx-machine">credential: demo-secret-XXXXXXXX (quarantined demonstration value)</span>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}

/* ── Playground (4.6: Console; universal DEMO quarantine; exports disabled) ── */

export function PlaygroundSurface() {
  return (
    <>
      <div className="vx-surface-title">
        <h1 style={{ margin: 0 }}>Playground</h1>
        <span className="vx-demo-stamp vx-micro">DEMO</span>
        <MicroLabel>SKELETON: CONSOLE</MicroLabel>
      </div>

      <p>{copy('notice.demoQuarantine').text}</p>

      <div className="vx-run-grid">
        {(['verified', 'unverified', 'failed', 'pending'] as const).map((verdict) => (
          <Panel key={verdict} title={`STATE — ${verdict.toUpperCase()}`}>
            <Seal verdict={verdict} size={28} />
            <p style={{ marginBottom: 0 }}>{VERDICT_EXPLAINERS[verdict].text}</p>
          </Panel>
        ))}

        <Panel title="CHAIN — INTACT">
          <Chainline links={DEMO_CHAIN} orientation="horizontal" />
          <span className="vx-machine" style={{ opacity: 0.8 }}>continuous — walkable (Art. IX)</span>
        </Panel>

        <Panel title="CHAIN — BROKEN">
          <Chainline links={DEMO_CHAIN_WITH_BREAK} orientation="horizontal" />
          <span className="vx-machine" style={{ opacity: 0.8 }}>a break renders as a break, everywhere (4.5)</span>
        </Panel>

        <Panel title="EXPORTS">
          <Button hierarchy="secondary" disabled ariaLabel="exports disabled — demo quarantine">
            EXPORT (DISABLED)
          </Button>
          <span className="vx-machine" style={{ opacity: 0.8 }}>exports from Demo quarantines are refused by construction (8.7; 5.10)</span>
        </Panel>
      </div>
    </>
  );
}
