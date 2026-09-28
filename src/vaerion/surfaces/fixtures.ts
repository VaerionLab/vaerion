/**
 * Vaerion — Surfaces / Demo Quarantine Fixtures
 *
 * STATE LAW (Constitution 5.10, 5.3, 1.6): verdict-domain states enter the
 * implementation only from the Verification Authority — which is implemented
 * at Stage 7 and does not exist yet. These fixtures are therefore Demo-quarantined
 * demonstration records: the Demo flag travels with every record and renders
 * wherever the record appears (5.10), exports are disabled by construction,
 * and no surface presents a demo verdict as a live one.
 *
 * Determinism: every value is a fixed constant — no clock, no randomness
 * (the instrument renders deterministically). Absolute timestamps use the
 * registered format alongside relative forms, never instead (VS §6).
 */

import type { ReceiptData } from '../primitives/receipt';
import type { EvidenceRecord } from '../primitives/records';
import type { LogLine } from '../primitives/logsurfaces';
import type { TimelineEvent } from '../primitives/logsurfaces';
import type { ChainLink } from '../primitives/containers';

export const DEMO_ENVIRONMENT_IDENTITY = {
  // Art. III, told honestly: no engine is bound at Stage 4 (Data Authorities
  // are Stage 7). The stamp says exactly what the verifier identity is.
  engineVersion: 'not-yet-bound (Stage 7)',
  ruleset: 'VAERION_CONSTITUTION v1.0 series',
  environment: 'composition-preview / demo quarantine',
} as const;

/** Registry version declaration — auditable per Constitution 2.8. */
export const REGISTRY_CONFORMANCE_VERSION = '1.0.0' as const;

const DEMO_EVIDENCE: readonly EvidenceRecord[] = [
  {
    kind: 'EXECUTION LOG',
    source: 'agent://demo-runner/logs/4711',
    hash: '9f2c4ab7de1305c8ee91a2f4c6d70815b3a29e4471c0f8d2e5b6a7c8d9e0f1a2',
    contribution: 'log segment covering the asserted window',
    demo: true,
  },
  {
    kind: 'OUTPUT ARTIFACT',
    source: 'artifact://demo-runner/out/report-047.pdf',
    hash: '3c8e71b0d4a59f2e6c1b8073d9e4f5a60718293a4b5c6d7e8f9012345a6b7c8d',
    contribution: 'the deliverable the claim refers to',
    demo: true,
  },
  {
    kind: 'POLICY SNAPSHOT',
    source: 'policy://demo/ruleset@2024-11-02',
    hash: 'b71d902e5c3f4a6b7c8d9e0f1a2b3c4d5e6f708192a3b4c5d6e7f8092a3b4c5d',
    contribution: 'the rule set in force at execution time',
    restricted: true,
    demo: true,
  },
];

export const DEMO_RECEIPTS: readonly ReceiptData[] = [
  {
    id: 'rcpt_demo_0001_f3a9c2e41b',
    claim: 'The demo agent completed the scheduled data export at 2024-11-02T09:14Z with zero policy refusals.',
    subject: 'agent://demo-runner',
    verdict: 'verified',
    verifier: 'demo-verifier (quarantined)',
    ruleset: 'DEMO-RULESET v0',
    environment: 'demo quarantine',
    verificationMethod: 'demo-method/log-diff@v0',
    evidence: DEMO_EVIDENCE,
    issuedAt: '2024-11-02T09:15:12Z',
    chainParent: null,
    demo: true,
    marginNotes: [
      'Proposed margin note (IR-009): demonstrations render every anatomy segment so the structure can be inspected without live data.',
    ],
  },
  {
    id: 'rcpt_demo_0002_7b4d1e9f02',
    claim: 'The demo agent accessed the restricted finance directory outside its assigned window.',
    subject: 'agent://demo-runner',
    verdict: 'failed',
    verifier: 'demo-verifier (quarantined)',
    ruleset: 'DEMO-RULESET v0',
    environment: 'demo quarantine',
    verificationMethod: 'demo-method/access-window@v0',
    evidence: DEMO_EVIDENCE.slice(0, 1),
    issuedAt: '2024-11-02T11:40:03Z',
    chainParent: 'rcpt_demo_0001_f3a9c2e41b',
    demo: true,
  },
  {
    id: 'rcpt_demo_0003_c5e8a2d977',
    claim: 'The demo agent will produce its weekly attestation summary by Friday.',
    subject: 'agent://demo-runner',
    verdict: 'pending',
    verifier: 'demo-verifier (quarantined)',
    ruleset: 'DEMO-RULESET v0',
    environment: 'demo quarantine',
    verificationMethod: 'demo-method/attestation-window@v0',
    evidence: [],
    issuedAt: '2024-11-04T08:00:00Z',
    chainParent: 'rcpt_demo_0001_f3a9c2e41b',
    demo: true,
  },
  {
    id: 'rcpt_demo_0004_a1d3f5b790',
    claim: 'The demo agent documents generated match the executed template set.',
    subject: 'agent://demo-runner/docs',
    verdict: 'unverified',
    verificationMethod: 'unassigned — no method bound',
    evidence: [],
    issuedAt: '2024-11-04T08:05:41Z',
    chainParent: 'rcpt_demo_0002_7b4d1e9f02',
    demo: true,
  },
];

export const DEMO_CHAIN: readonly ChainLink[] = [
  { id: 'genesis' },
  { id: 'rcpt_demo_0001' },
  { id: 'rcpt_demo_0002' },
  { id: 'rcpt_demo_0003' },
];

export const DEMO_CHAIN_WITH_BREAK: readonly ChainLink[] = [
  { id: 'genesis' },
  { id: 'rcpt_demo_0001' },
  { id: 'rcpt_demo_0002', broken: true },
  { id: 'rcpt_demo_0003' },
];

export const DEMO_LOG: readonly LogLine[] = [
  { id: 'log-01', at: '2024-11-02T09:14:02Z', severity: 'info', message: 'demo run opened — agent://demo-runner' },
  { id: 'log-02', at: '2024-11-02T09:14:11Z', severity: 'verified', message: 'policy check passed for export scope', receiptId: 'rcpt_demo_0001_f3a9c2e41b' },
  { id: 'log-03', at: '2024-11-02T09:14:58Z', severity: 'info', message: 'export completed — 1 artifact' },
  { id: 'log-04', at: '2024-11-02T11:39:51Z', severity: 'hold', message: 'access outside assigned window — verification queued' },
  { id: 'log-05', at: '2024-11-02T11:40:03Z', severity: 'fault', message: 'access-window check failed', receiptId: 'rcpt_demo_0002_7b4d1e9f02' },
];

export const DEMO_TIMELINE: readonly TimelineEvent[] = [
  { id: 'ev-1', label: 'RUN OPENED', at: '09:14:02Z', state: 'unverified' },
  { id: 'ev-2', label: 'POLICY PASSED', at: '09:14:11Z', state: 'verified' },
  { id: 'ev-3', label: 'EXPORT DONE', at: '09:14:58Z', state: 'verified' },
  { id: 'ev-4', label: 'WINDOW BREACH', at: '11:40:03Z', state: 'failed' },
  { id: 'ev-5', label: 'ATTESTATION', at: '11:41:20Z', state: 'pending' },
];

export const DEMO_QUEUE: readonly { id: string; summary: string; age: string; demo: true }[] = [
  { id: 'rcpt_demo_0003_c5e8a2d977', summary: 'attestation-window check — agent://demo-runner', age: '2d', demo: true },
  { id: 'rcpt_demo_0004_a1d3f5b790', summary: 'docs/template parity — unverified, no method bound', age: '2d', demo: true },
];

/** The whole-set measurement for the sliced ledger (Art. X): the interface always states its measurement of the whole. */
export const DEMO_LEDGER_TOTAL = 1412;
export const DEMO_LEDGER_SHOWN = 24;
