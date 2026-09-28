'use client';

/**
 * Vaerion — Surfaces / Status Territory
 *
 * The Status-skeleton surfaces (Visual System §1.4; Constitution 4.6):
 * Attestation Status and Search.
 *
 * Status binding (4.6): answers the governing attestation questions on one
 * screen (VS §13.3: engine version, rule set, environment, gate results,
 * chain health); incident log as receipts. The ratified text enumerates the
 * attestation fields but not the verbatim "four governing questions"; the
 * field set of VS §13.3 is rendered (recorded in IR-010).
 *
 * Search binding (4.6): Status variant; hash-first resolution; grouped,
 * sealed results (Caliper grammar, VS §5.14).
 *
 * All records are Demo-quarantined (5.10).
 */

import { useState } from 'react';
import { Panel } from '../primitives/containers';
import { FieldFrame, MicroLabel } from '../primitives/controls';
import { Receipt } from '../primitives/receipt';
import { Seal } from '../primitives/seal';
import { Chainline } from '../primitives/containers';
import { copy } from './copy';
import { DEMO_CHAIN_WITH_BREAK, DEMO_ENVIRONMENT_IDENTITY, DEMO_RECEIPTS, REGISTRY_CONFORMANCE_VERSION } from './fixtures';

/* ── Attestation Status (4.6; VS §6.7, §13.3) ─────────────────────────────── */

/** Gate results are rendered as received — none are fabricated (1.6). At Stage 4, no gates run. */
const GATE_RESULTS: readonly { name: string; state: 'unverified' }[] = [
  { name: 'TOKEN REGRESSION (9.2)', state: 'unverified' },
  { name: 'VISUAL REGRESSION (9.3)', state: 'unverified' },
  { name: 'STATE TRANSITIONS (9.11)', state: 'unverified' },
  { name: 'RECEIPT INTEGRITY (9.12)', state: 'unverified' },
];

export function StatusSurface() {
  return (
    <>
      <div className="vx-surface-title">
        <h1 style={{ margin: 0 }}>Attestation Status</h1>
        <span className="vx-demo-stamp vx-micro">DEMO</span>
        <MicroLabel>SKELETON: STATUS</MicroLabel>
      </div>

      <div className="vx-machine" style={{ opacity: 0.85 }}>{copy('status.fourQuestions').text}</div>

      <Panel title="SYSTEM ATTESTATION — ONE SCREEN">
        <div className="vx-attestation-row">
          <MicroLabel>ENGINE VERSION</MicroLabel>
          <span className="vx-machine">{DEMO_ENVIRONMENT_IDENTITY.engineVersion}</span>
        </div>
        <div className="vx-attestation-row">
          <MicroLabel>RULE SET</MicroLabel>
          <span className="vx-machine">{DEMO_ENVIRONMENT_IDENTITY.ruleset}</span>
        </div>
        <div className="vx-attestation-row">
          <MicroLabel>ENVIRONMENT</MicroLabel>
          <span className="vx-machine">{DEMO_ENVIRONMENT_IDENTITY.environment}</span>
        </div>
        <div className="vx-attestation-row">
          <MicroLabel>REGISTRY CONFORMANCE</MicroLabel>
          <span className="vx-machine">registry v{REGISTRY_CONFORMANCE_VERSION} (2.8)</span>
        </div>
        <div className="vx-attestation-row">
          <MicroLabel>CHAIN HEALTH</MicroLabel>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--vx-space-3)' }}>
            <Chainline links={DEMO_CHAIN_WITH_BREAK} orientation="horizontal" ariaLabel="chain health: 1 break" />
            <span className="vx-machine">1 break — rendered as a break until reconciled (5.9)</span>
          </span>
        </div>
      </Panel>

      <Panel title="GATE RESULTS — AS RECEIVED">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vx-space-2)' }}>
          {GATE_RESULTS.map((gate) => (
            <div key={gate.name} className="vx-attestation-row">
              <span className="vx-machine">{gate.name}</span>
              <Seal verdict={gate.state} size={16} showWord={false} ariaLabel={gate.state} />
            </div>
          ))}
          <span className="vx-machine" style={{ opacity: 0.8 }}>
            the gates of Part IX are implemented at Stage 8 — none run yet, none are claimed
          </span>
        </div>
      </Panel>

      <Panel title="INCIDENT LOG — RECEIPTS">
        <div className="vx-row-list">
          {DEMO_RECEIPTS.filter((r) => r.verdict === 'failed').map((receipt) => (
            <Receipt key={receipt.id} data={receipt} variant="row" />
          ))}
        </div>
      </Panel>
    </>
  );
}

/* ── Search (4.6: Status variant; hash-first; grouped, sealed results) ────── */

export function SearchSurface() {
  const [query, setQuery] = useState('');

  // Hash-first resolution (Caliper, VS §5.14): an input that looks like an
  // identifier routes to the identifier's object. Demo resolution matches
  // receipt ids/hashes by prefix — a demonstration, stamped as such.
  const trimmed = query.trim();
  const idMatches = trimmed.length > 0 ? DEMO_RECEIPTS.filter((r) => r.id.toLowerCase().includes(trimmed.toLowerCase())) : [];
  const hashMatches = trimmed.length > 0 ? DEMO_RECEIPTS.filter((r) => r.evidence.some((e) => e.hash.toLowerCase().includes(trimmed.toLowerCase()))) : [];

  return (
    <>
      <div className="vx-surface-title">
        <h1 style={{ margin: 0 }}>Search</h1>
        <span className="vx-demo-stamp vx-micro">DEMO</span>
        <MicroLabel>SKELETON: STATUS VARIANT</MicroLabel>
      </div>

      <p>{copy('guidance.search').text}</p>

      <FieldFrame label="RECEIPT ID OR HASH" value={query} onChange={setQuery} machine inputClassName="vx-machine" />

      {trimmed.length > 0 ? (
        <>
          <Panel title={`IDENTIFIER MATCHES (${idMatches.length})`}>
            <div className="vx-search-group">
              {idMatches.map((receipt) => (
                <div key={receipt.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--vx-space-4)' }}>
                  <Seal verdict={receipt.verdict} size={16} showWord={false} ariaLabel={receipt.verdict} />
                  <span className="vx-machine">{receipt.id}</span>
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{receipt.claim}</span>
                  <span className="vx-demo-stamp vx-micro">DEMO</span>
                </div>
              ))}
              {idMatches.length === 0 ? <span className="vx-machine">0 identifier matches — lawful absence, stated (Art. VIII)</span> : null}
            </div>
          </Panel>

          <Panel title={`EVIDENCE HASH MATCHES (${hashMatches.length}) — SEALED RESULTS`}>
            <div className="vx-search-group">
              {hashMatches.map((receipt) => (
                <div key={receipt.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--vx-space-4)' }}>
                  <Seal verdict={receipt.verdict} size={16} showWord={false} ariaLabel={receipt.verdict} />
                  <span className="vx-machine">{receipt.id}</span>
                  <span className="vx-machine" style={{ opacity: 0.8 }}>sealed — open in the Receipt Viewer</span>
                </div>
              ))}
              {hashMatches.length === 0 ? <span className="vx-machine">0 hash matches</span> : null}
            </div>
          </Panel>
        </>
      ) : null}
    </>
  );
}
