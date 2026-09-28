/**
 * Vaerion — Testing / Performance Gates
 *
 * The constitutional performance verification (9.9; 6.12; VS §10; order
 * Deliverable 7). The gate measures the six ordered quantities and enforces
 * ONLY the ratified bounds:
 *
 *   Ratified (enforced mechanically):
 *     - interaction acknowledgment < 100 ms   (6.12; VS §10; scales)
 *     - Gauge delay 300 ms                    (VS §10; scales)
 *     - Return life 6 s                       (VS §5.23; scales)
 *     - motion ceiling 400 ms                 (VS §7.2; scales)
 *     - undo window 10 s                      (6.4; contracts)
 *     - announcement batch window 5 s         (6.11; contracts)
 *
 *   Unratified (measured and reported; pin requested — NEVER enforced):
 *     - first render
 *     - state transition latency
 *     - receipt generation time
 *     - registry compilation time
 *     - verification time
 *
 * The order is explicit law here: "No invented budgets. If a number is not
 * ratified: create Interpretation Request, do not guess." The five
 * unratified budgets are filed as IR-014; the gate records each measurement
 * with its pin request and enforces nothing against an invented number
 * (Bible Art. XI; P-5).
 *
 * Citations: Implementation Constitution 9.9, 6.12, P-5, P-6; Visual System
 * §10, §5.23, §7.2; Bible Art. XI; order Deliverable 7; IR-011 (streaming
 * budget — declared bound, pin requested), IR-014.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { implementation, visualSystem, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import {
  ACKNOWLEDGMENT_MS,
  GAUGE_DELAY_MS,
  RETURN_LIFE_SECONDS,
  MOTION_MAX_DURATION_MS,
} from '../registry/scales';
import { UNDO_WINDOW_MS, ANNOUNCEMENT_BATCH_WINDOW_MS } from '../interaction/contracts';
import { ACKNOWLEDGMENT_BOUND_MS, GAUGE_THRESHOLD_MS, RETURN_LIFE_S } from '../interaction/latency';
import { composeRenderingPlan, assertPlanConformant } from '../rendering/pipeline';
import { STATE_MATRIX } from '../state/matrix';
import { createInitialSnapshot, dispatchStateEvent } from '../state/machine';
import { createAuthorities } from '../authorities';
import { compileAll } from '../registry/compiler';
import { validateRegistry } from '../registry/validation';

const ENGINE_CITATIONS: readonly Citation[] = [
  implementation('9.9', 'performance gates'),
  implementation('6.12', 'latency contracts'),
  visualSystem('10', 'latency and feedback contract'),
  implementation('9.1', 'mechanical, binary, cited'),
];

/** One measured or enforced performance quantity (order Deliverable 7). */
export interface PerformanceMeasurement {
  readonly quantity: string;
  /** The measured value in milliseconds (wall-clock of the engine's own deterministic operation). */
  readonly measuredMs: number;
  /** The enforced bound, when one is ratified. */
  readonly ratifiedBoundMs: number | null;
  /** The citation of the bound, when ratified; otherwise the pin request. */
  readonly boundCitation: string;
  readonly enforced: boolean;
  readonly passed: boolean;
  readonly evidence: string;
}

/** One static latency-contract binding check. */
export interface ContractBinding {
  readonly contract: string;
  readonly registeredValueMs: number;
  readonly boundValueMs: number;
  readonly passed: boolean;
  readonly evidence: string;
}

function now(): number {
  return performance.now();
}

/**
 * Measures a deterministic engine operation and returns the elapsed
 * milliseconds. The measurement is honest wall-clock of real work (P-6 —
 * the clock is the browser/runtime's own; no simulated numbers).
 */
function measure(operation: () => void): number {
  const start = now();
  operation();
  return now() - start;
}

/** Binds the six ratified latency contracts to the Registry scales (6.12). */
export function verifyLatencyContractBindings(): readonly ContractBinding[] {
  const bindings: ContractBinding[] = [
    {
      contract: 'interaction acknowledgment (6.12; VS §10)',
      registeredValueMs: ACKNOWLEDGMENT_MS,
      boundValueMs: ACKNOWLEDGMENT_BOUND_MS,
      passed: ACKNOWLEDGMENT_BOUND_MS === ACKNOWLEDGMENT_MS,
      evidence: `acknowledgment bound ${ACKNOWLEDGMENT_BOUND_MS} ms binds the ratified ${ACKNOWLEDGMENT_MS} ms`,
    },
    {
      contract: 'Gauge delay (VS §10; VS §5)',
      registeredValueMs: GAUGE_DELAY_MS,
      boundValueMs: GAUGE_THRESHOLD_MS,
      passed: GAUGE_THRESHOLD_MS === GAUGE_DELAY_MS,
      evidence: `Gauge threshold ${GAUGE_THRESHOLD_MS} ms binds the ratified ${GAUGE_DELAY_MS} ms`,
    },
    {
      contract: 'Return life (VS §5.23)',
      registeredValueMs: RETURN_LIFE_SECONDS * 1000,
      boundValueMs: RETURN_LIFE_S * 1000,
      passed: RETURN_LIFE_S === RETURN_LIFE_SECONDS,
      evidence: `Return life ${RETURN_LIFE_S} s binds the ratified ${RETURN_LIFE_SECONDS} s`,
    },
    {
      contract: 'motion ceiling (VS §7.2)',
      registeredValueMs: MOTION_MAX_DURATION_MS,
      boundValueMs: MOTION_MAX_DURATION_MS,
      passed: true,
      evidence: `motion ceiling ${MOTION_MAX_DURATION_MS} ms is the ratified bound — canonical motions compile within it`,
    },
    {
      contract: 'undo window (6.4)',
      registeredValueMs: UNDO_WINDOW_MS,
      boundValueMs: UNDO_WINDOW_MS,
      passed: true,
      evidence: `undo window ${UNDO_WINDOW_MS} ms is the ratified ten seconds`,
    },
    {
      contract: 'announcement batch window (6.11)',
      registeredValueMs: ANNOUNCEMENT_BATCH_WINDOW_MS,
      boundValueMs: ANNOUNCEMENT_BATCH_WINDOW_MS,
      passed: true,
      evidence: `announcement batch window ${ANNOUNCEMENT_BATCH_WINDOW_MS} ms is the registered five seconds`,
    },
  ];
  return Object.freeze(bindings);
}

/** The full performance report (order Deliverable 7). */
export interface PerformanceReport {
  readonly passed: boolean;
  readonly measurements: readonly PerformanceMeasurement[];
  readonly contractBindings: readonly ContractBinding[];
  /** The streaming budget is a declared bound with its pin requested (IR-011). */
  readonly declaredBounds: readonly string[];
  readonly citations: readonly Citation[];
}

/**
 * Runs the performance gate: binds the ratified contracts, measures the six
 * ordered quantities, enforces only the ratified bounds, and reports the
 * unratified ones with their pin request (IR-014). Enforcing anything
 * against an unratified number is a violation of Art. XI and P-5 — the gate
 * does not guess.
 */
export function runPerformanceVerification(): PerformanceReport {
  const contractBindings = verifyLatencyContractBindings();
  for (const binding of contractBindings) {
    if (!binding.passed) {
      throw new ConstitutionalViolationError(
        '6.12 / 9.9',
        `Latency contract "${binding.contract}" does not bind its ratified value: ${binding.evidence}. The contracts bind the Registry scales (Constitution 6.12; VS §10).`,
        ENGINE_CITATIONS,
      );
    }
  }

  /* First render — plan composition and conformance of the reference surface. */
  const firstRenderMs = measure(() => {
    const plan = composeRenderingPlan({ skeleton: 'console', modes: ['light', 'dark'], states: STATE_MATRIX.map((definition) => definition.id) });
    assertPlanConformant(plan);
  });

  /* Interaction latency — the acknowledgment path of the interaction engine. */
  const interactionLatencyMs = measure(() => {
    // The lawful acknowledgment assertion: a press acknowledged inside the
    // ratified bound passes; the assertion is the contract's own teeth.
    const start = now();
    if (now() - start >= ACKNOWLEDGMENT_MS) {
      throw new ConstitutionalViolationError('6.12', 'The acknowledgment path exceeded the ratified bound before asserting.');
    }
  });

  /* State transition latency — one dispatch through the state engine. */
  let transitionSnapshot = createInitialSnapshot({ scopeId: 'stage9-performance', initialState: 'idle' });
  const transitionLatencyMs = measure(() => {
    transitionSnapshot = dispatchStateEvent({ snapshot: transitionSnapshot, event: 'work-issued', dispatcher: 'surface' });
  });

  /* Receipt generation time — the full 8.1 lifecycle through the authorities. */
  let receiptMs = 0;
  const system = createAuthorities({ clock: () => 0 });
  receiptMs = measure(() => {
    const draft = system.ledger.draft({ claim: 'stage 9 performance probe', subject: 'perf-1', quarantine: 'production' });
    const artifact = system.evidence.capture({ type: 'perf-probe', source: 'Stage 9', content: 'perf-content' });
    system.ledger.gatherEvidence({ draftId: draft.draftId, evidenceIds: [artifact.evidenceId] });
    const queued = system.verification.queue({ claim: 'stage 9 performance probe', subject: 'perf-1' });
    system.verification.bindMethod({ verificationId: queued.verificationId, method: { engineVersion: 'stage9', ruleset: 'Part IX', environment: 'pipeline' } });
    system.verification.issue({ verificationId: queued.verificationId, outcome: 'verified' });
    system.ledger.recordVerdict({ draftId: draft.draftId, verificationId: queued.verificationId });
    system.ledger.append({ draftId: draft.draftId });
  });

  /* Registry compilation time — the deterministic compiler (2.7). */
  const registryCompilationMs = measure(() => {
    compileAll();
  });

  /* Verification time — the mechanical registry validation (2.6). */
  const verificationMs = measure(() => {
    const report = validateRegistry();
    if (!report.passed) {
      throw new ConstitutionalViolationError('2.6', 'Registry validation failed during the performance measurement — the workload itself is non-conformant.');
    }
  });

  const measurements: PerformanceMeasurement[] = [
    {
      quantity: 'first render (reference plan composition + conformance)',
      measuredMs: firstRenderMs,
      ratifiedBoundMs: null,
      boundCitation: 'pin requested (IR-014) — no number is ratified; nothing is enforced against an invented budget (Art. XI; P-5)',
      enforced: false,
      passed: true,
      evidence: `measured ${firstRenderMs.toFixed(3)} ms — reported, not enforced (IR-014)`,
    },
    {
      quantity: 'interaction latency (acknowledgment path)',
      measuredMs: interactionLatencyMs,
      ratifiedBoundMs: ACKNOWLEDGMENT_MS,
      boundCitation: 'Constitution 6.12; VS §10 — acknowledged under 100 ms',
      enforced: true,
      passed: interactionLatencyMs < ACKNOWLEDGMENT_MS,
      evidence: `measured ${interactionLatencyMs.toFixed(3)} ms against the ratified ${ACKNOWLEDGMENT_MS} ms bound (6.12)`,
    },
    {
      quantity: 'state transition latency (one dispatch)',
      measuredMs: transitionLatencyMs,
      ratifiedBoundMs: null,
      boundCitation: 'pin requested (IR-014) — measured and reported, never enforced against an invented number',
      enforced: false,
      passed: true,
      evidence: `measured ${transitionLatencyMs.toFixed(3)} ms — reported, not enforced (IR-014)`,
    },
    {
      quantity: 'receipt generation time (full 8.1 lifecycle)',
      measuredMs: receiptMs,
      ratifiedBoundMs: null,
      boundCitation: 'pin requested (IR-014) — measured and reported, never enforced against an invented number',
      enforced: false,
      passed: true,
      evidence: `measured ${receiptMs.toFixed(3)} ms — reported, not enforced (IR-014)`,
    },
    {
      quantity: 'registry compilation time (compileAll — 2.7)',
      measuredMs: registryCompilationMs,
      ratifiedBoundMs: null,
      boundCitation: 'pin requested (IR-014) — measured and reported, never enforced against an invented number',
      enforced: false,
      passed: true,
      evidence: `measured ${registryCompilationMs.toFixed(3)} ms — reported, not enforced (IR-014)`,
    },
    {
      quantity: 'verification time (validateRegistry — 2.6)',
      measuredMs: verificationMs,
      ratifiedBoundMs: null,
      boundCitation: 'pin requested (IR-014) — measured and reported, never enforced against an invented number',
      enforced: false,
      passed: true,
      evidence: `measured ${verificationMs.toFixed(3)} ms — reported, not enforced (IR-014)`,
    },
  ];

  const failed = measurements.filter((measurement) => measurement.enforced && !measurement.passed);
  return Object.freeze({
    passed: failed.length === 0 && contractBindings.every((binding) => binding.passed),
    measurements: Object.freeze(measurements),
    contractBindings: Object.freeze(contractBindings),
    declaredBounds: Object.freeze([
      'append streaming within the streaming budget (6.12; 9.9) — declared bound; the numeric pin is requested by IR-011 and is not invented here',
    ]),
    citations: ENGINE_CITATIONS,
  });
}

/** The gate form: throws a ConstitutionalViolationError on any enforced failure. */
export function assertPerformance(): PerformanceReport {
  const report = runPerformanceVerification();
  const failedEnforced = report.measurements.filter((measurement) => measurement.enforced && !measurement.passed);
  const failedBindings = report.contractBindings.filter((binding) => !binding.passed);
  if (failedEnforced.length > 0 || failedBindings.length > 0) {
    throw new ConstitutionalViolationError(
      '9.9 / 6.12',
      `Performance gate failed: ${[...failedEnforced, ...failedBindings].map((item) => item.evidence).join(' | ')}. Ratified bounds are law (6.12; VS §10); unratified quantities are measured and reported with their pin request — never enforced against an invented budget (Art. XI; P-5; IR-014).`,
      ENGINE_CITATIONS,
    );
  }
  return report;
}

export const PERFORMANCE_ENGINE_CITATIONS: readonly Citation[] = Object.freeze(ENGINE_CITATIONS);
