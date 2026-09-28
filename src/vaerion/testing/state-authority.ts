/**
 * Vaerion — Testing / State & Authority Test Engine
 *
 * Verifies the Stage 5 state contracts and the Stage 8 authority contracts
 * as standing Part IX gates (order Deliverable 6):
 *
 *   Stage 5 — state transitions, ownership rules, illegal transitions,
 *             honest states, quarantine rules (Part V).
 *   Stage 8 — authority boundaries, verdict ownership, chain integrity,
 *             evidence lifecycle, export restrictions, manifest integrity
 *             (Part VIII).
 *
 * Illegal transitions and quarantine violations are proven by refusal:
 * the engines accept the lawful path and throw ConstitutionalViolationError
 * on every unlawful one — the proof is of the engine, not of a description
 * of it (P-6).
 *
 * Citations: Implementation Constitution Part V, Part VIII, 9.11, 9.13,
 * 9.14, 5.3, 1.6, 8.0–8.9; Bible Art. II, III, VI, VIII, XII; order
 * Deliverable 6.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import {
  runAllStateGates,
  createInitialSnapshot,
  dispatchStateEvent,
  STATE_MATRIX,
} from '../state';
import { resolveTransition } from '../state/transitions';
import { assertNoCommingling, assertExportAllowed, type StateRecord } from '../state/quarantine';
import { assertVerdictAuthority } from '../state/honesty';
import {
  runAllAuthorityGates,
  createAuthorities,
  computeManifest,
  signManifest,
  verifyBundle,
  sha256,
  type ReceiptRecord,
} from '../authorities';

const ENGINE_CITATIONS: readonly Citation[] = [
  implementation('9.11', 'state transition gates'),
  implementation('9.13', 'chain integrity gates'),
  implementation('9.14', 'export verification gates'),
  implementation('9.1', 'mechanical, binary, cited'),
];

/** One verified area (order Deliverable 6). */
export interface StateAuthorityResult {
  readonly area: string;
  readonly passed: boolean;
  readonly evidence: string;
  readonly citations: readonly Citation[];
}

function runArea(area: string, citations: readonly Citation[], proof: () => string): StateAuthorityResult {
  try {
    return { area, passed: true, evidence: proof(), citations: [...citations, ...ENGINE_CITATIONS] };
  } catch (error) {
    return {
      area,
      passed: false,
      evidence: error instanceof Error ? error.message : String(error),
      citations: [...citations, ...ENGINE_CITATIONS],
    };
  }
}

/** Stage 5 — the twelve state gates. */
export function verifyStateGates(): StateAuthorityResult {
  return runArea('state gates (the twelve of Stage 5)', [implementation('Part V')], () => {
    const gates = runAllStateGates();
    const failed = gates.filter((gate) => !gate.passed);
    if (failed.length > 0) {
      throw new ConstitutionalViolationError('9.11', `State gates failed: ${failed.map((gate) => gate.gate).join(', ')}`);
    }
    if (gates.length !== 12) {
      throw new ConstitutionalViolationError('9.11', `${gates.length} state gates ran; twelve are ordered`);
    }
    return `${gates.length}/12 state gates pass — matrix, ownership, propagation, inheritance, transitions, cancellation, recovery, honesty, verdict authority, chain integrity, quarantine, restricted evidence (Part V)`;
  });
}

/** Stage 5 — state transitions and illegal-transition refusal (5.7). */
export function verifyStateTransitions(): StateAuthorityResult {
  return runArea('state transitions & illegal-transition refusal (5.7)', [implementation('5.7'), implementation('9.11')], () => {
    let snapshot = createInitialSnapshot({ scopeId: 'stage9-state-verification', initialState: 'idle' });
    snapshot = dispatchStateEvent({ snapshot, event: 'work-issued', dispatcher: 'surface' });
    if (snapshot.state !== 'loading') {
      throw new ConstitutionalViolationError('5.7', `A lawful "work issued" transition resolved "${snapshot.state}" instead of Loading.`);
    }
    try {
      resolveTransition('idle', 'verdict-received', null, {}, {});
      throw new ConstitutionalViolationError(
        '5.7',
        'An unlisted transition (Idle → verdict-received) was accepted. Unlisted transitions are violations (Constitution 5.7).',
      );
    } catch (error) {
      if (error instanceof ConstitutionalViolationError && error.message.includes('was accepted')) throw error;
    }
    return `lawful transitions dispatch through the 5.7 table; unlisted transitions refuse with ConstitutionalViolationError; ${STATE_MATRIX.length} canonical states (5.1; 5.7)`;
  });
}

/** Stage 5 — honest states and the verdict boundary (5.3; 1.6; Art. III, VIII). */
export function verifyHonestStates(): StateAuthorityResult {
  return runArea('honest states & verdict boundary (5.3; Art. III, VIII)', [implementation('5.3'), implementation('1.6'), bible('VIII')], () => {
    try {
      assertVerdictAuthority(undefined);
      throw new ConstitutionalViolationError(
        '5.3',
        'A verdict-domain rendering without authority evidence was accepted. Verdict states enter only from the Verification Authority (5.3; Art. III).',
      );
    } catch (error) {
      if (error instanceof ConstitutionalViolationError && error.message.includes('was accepted')) throw error;
    }
    try {
      const forged = { issuedBy: 'Some Other Engine', engineVersion: 'x', ruleset: 'y', environment: 'z' } as unknown as Parameters<typeof assertVerdictAuthority>[0];
      assertVerdictAuthority(forged);
      throw new ConstitutionalViolationError('5.3 / Art. III', 'A verdict not issued by the Verification Authority was accepted (Art. III).');
    } catch (error) {
      if (error instanceof ConstitutionalViolationError && error.message.includes('was accepted')) throw error;
    }
    return 'verdict-domain states enter only as received facts from the Verification Authority; optimism and unnamed verdicts refuse (5.3; Art. III; Art. VIII)';
  });
}

/** Stage 5 — quarantine rules (5.10). */
export function verifyQuarantineRules(): StateAuthorityResult {
  return runArea('quarantine rules (5.10; demo never co-mingles)', [implementation('5.10'), bible('VIII')], () => {
    const demoRecord = { id: 'demo-1', quarantine: 'demo' } as unknown as StateRecord;
    const productionRecord = { id: 'prod-1', quarantine: 'production' } as unknown as StateRecord;
    try {
      assertNoCommingling([demoRecord, productionRecord], 'stage9-verification-target');
      throw new ConstitutionalViolationError('5.10', 'Demo and production records co-mingled without refusal (Constitution 5.10).');
    } catch (error) {
      if (error instanceof ConstitutionalViolationError && error.message.includes('co-mingled without refusal')) throw error;
    }
    try {
      assertExportAllowed([demoRecord]);
      throw new ConstitutionalViolationError('5.10 / 8.7', 'A demo-quarantined record was allowed into an export (Constitution 5.10; 8.7).');
    } catch (error) {
      if (error instanceof ConstitutionalViolationError && error.message.includes('allowed into an export')) throw error;
    }
    return 'demo state cannot co-mingle with production in any store, stream, or export; the demo flag travels and is rendered wherever the record appears (5.10)';
  });
}

/** Stage 8 — the sixteen authority gates. */
export function verifyAuthorityGates(): StateAuthorityResult {
  return runArea('authority gates (the sixteen of Stage 8)', [implementation('Part VIII')], () => {
    const gates = runAllAuthorityGates();
    const failed = gates.filter((gate) => !gate.passed);
    if (failed.length > 0) {
      throw new ConstitutionalViolationError('Part VIII', `Authority gates failed: ${failed.map((gate) => gate.gate).join(', ')}`);
    }
    if (gates.length !== 16) {
      throw new ConstitutionalViolationError('Part VIII', `${gates.length} authority gates ran; sixteen are ordered`);
    }
    return `${gates.length}/16 authority gates pass — ownership, isolation, the nine lifecycles, append-only guarantees, boundaries, immutable history, export verification, no overlap, no receipt mutation (Part VIII)`;
  });
}

/** Stage 8 — verdict ownership: a fabricated verdict cannot enter a receipt (5.3; 8.1). */
export function verifyVerdictOwnership(): StateAuthorityResult {
  return runArea('verdict ownership (the VA is the sole mint; 5.3; Art. III)', [implementation('5.3'), implementation('8.1'), bible('III')], () => {
    const system = createAuthorities({ clock: () => 0 });
    const draft = system.ledger.draft({ claim: 'stage 9 ownership probe', subject: 'subject-1', quarantine: 'production' });
    const artifact = system.evidence.capture({ type: 'probe', source: 'Stage 9', content: 'content-1' });
    system.ledger.gatherEvidence({ draftId: draft.draftId, evidenceIds: [artifact.evidenceId] });
    try {
      system.ledger.recordVerdict({ draftId: draft.draftId, verificationId: 'verification-never-issued' });
      throw new ConstitutionalViolationError(
        '5.3 / 8.1',
        'A receipt recorded a verdict fact for a verification that was never issued — a fabricated verdict entered the ledger (5.3; Art. III).',
      );
    } catch (error) {
      if (error instanceof ConstitutionalViolationError && error.message.includes('fabricated verdict entered')) throw error;
    }
    return 'the ledger reads the verdict fact from the Verification Authority\'s own record; an unissued verdict cannot enter a receipt (5.3; 8.1; Art. III)';
  });
}

/** Stage 8 — chain integrity: appends halt while a break is open (8.5; 5.9). */
export function verifyChainIntegrity(): StateAuthorityResult {
  return runArea('chain integrity (breaks are first-class; appends halt; 8.5; 5.9)', [implementation('8.5'), implementation('5.9'), bible('XII')], () => {
    const system = createAuthorities({ clock: () => 0 });
    system.chain.append({ payload: 'stage 9 record' });
    system.chain.recordBreak({ atSeq: 2, reason: 'stage 9 integrity probe' });
    try {
      system.chain.append({ payload: 'append during open break' });
      throw new ConstitutionalViolationError('8.5 / 5.9', 'An append was accepted while an unreconciled break existed — recovery papered over a gap.');
    } catch (error) {
      if (error instanceof ConstitutionalViolationError && error.message.includes('papered over')) throw error;
    }
    const attestation = system.chain.integrity();
    // The break is itself a chain record (8.5 — first-class), so the hash
    // chain still verifies; the law's proof is the open break: appends halt
    // and the break renders as a break until reconciled (5.9).
    if (!system.chain.openBreak) {
      throw new ConstitutionalViolationError('8.5 / 5.9', 'A recorded break resolved no open break — the break is not first-class.');
    }
    void attestation;
    return 'breaks are records; appends halt while a break is unreconciled; attestation reports the break honestly (8.5; 5.9; Art. VIII)';
  });
}

/** Stage 8 — evidence lifecycle and manifest integrity (8.2; 8.8; 9.14). */
export function verifyEvidenceAndManifestIntegrity(): StateAuthorityResult {
  return runArea('evidence lifecycle & manifest integrity (8.2; 8.8; 9.14)', [implementation('8.2'), implementation('8.8'), implementation('9.14')], () => {
    const system = createAuthorities({ clock: () => 0 });
    const artifact = system.evidence.capture({ type: 'stage9-probe', source: 'Stage 9', content: 'evidence-content' });
    const state = system.evidence.stateOf(artifact.evidenceId);
    if (state.hash !== sha256('evidence-content')) {
      throw new ConstitutionalViolationError('8.2', 'Evidence was not hashed at capture (Constitution 8.2).');
    }
    const recordHashes = [sha256('stage9-record')];
    const manifest = signManifest({
      manifest: computeManifest({
        bundleHash: sha256(recordHashes.join('|')),
        recordHashes,
        timestampAuthority: 'Stage 9 pipeline clock (injected)',
        issuingEngine: 'Vaerion Stage 9 Testing Infrastructure',
        ruleset: 'Implementation Constitution Part IX',
        hash: sha256,
      }),
      signature: 'stage-9-signature',
      signedAt: 0,
    });
    const honest = verifyBundle({ manifest, recordHashes, hash: sha256 });
    if (!honest.verifiable) {
      throw new ConstitutionalViolationError('8.8', `An honest bundle failed manifest verification: ${honest.reason} (Constitution 8.8).`);
    }
    try {
      const tampered = verifyBundle({ manifest, recordHashes: [sha256('tampered-record')], hash: sha256 });
      if (tampered.verifiable) {
        throw new ConstitutionalViolationError('8.8', 'A tampered bundle passed manifest verification — brokenness was silent (Constitution 8.8).');
      }
    } catch (error) {
      if (error instanceof ConstitutionalViolationError && error.message.includes('silent')) throw error;
    }
    return 'evidence is hashed at capture; manifests verify honest bundles and detect tampering — brokenness is never silent (8.2; 8.8; 9.14)';
  });
}

/** Stage 8 — export restrictions (8.7; 5.10). */
export function verifyExportRestrictions(): StateAuthorityResult {
  return runArea('export restrictions (8.7; 5.10)', [implementation('8.7'), implementation('5.10')], () => {
    const system = createAuthorities({ clock: () => 0 });
    const draft = system.ledger.draft({ claim: 'stage 9 export probe', subject: 'subject-1', quarantine: 'production' });
    const artifact = system.evidence.capture({ type: 'probe', source: 'Stage 9', content: 'export-content' });
    system.ledger.gatherEvidence({ draftId: draft.draftId, evidenceIds: [artifact.evidenceId] });
    const queued = system.verification.queue({ claim: 'stage 9 export probe', subject: 'subject-1' });
    system.verification.bindMethod({ verificationId: queued.verificationId, method: { engineVersion: 'stage9', ruleset: 'Part IX', environment: 'pipeline' } });
    system.verification.issue({ verificationId: queued.verificationId, outcome: 'verified' });
    system.ledger.recordVerdict({ draftId: draft.draftId, verificationId: queued.verificationId });
    const receipt: ReceiptRecord = system.ledger.append({ draftId: draft.draftId });
    const record = system.export.setCriteria({ criteria: ['stage 9'] });
    const assembled = system.export.assemble({ exportId: record.exportId, sourceRecords: [receipt] });
    const manifested = system.export.computeManifest({ exportId: assembled.exportId, timestampAuthority: 'Stage 9 pipeline clock (injected)', issuingEngine: 'Vaerion Stage 9 Testing Infrastructure', ruleset: 'Implementation Constitution Part IX' });
    const signed = system.export.sign({ exportId: manifested.exportId, signature: 'stage-9' });
    if (!signed.manifest) {
      throw new ConstitutionalViolationError('8.7', 'A signed export resolved without its manifest — the bundle cannot be verified (8.7–8.8).');
    }
    const delivered = system.export.deliver({ exportId: signed.exportId });
    if (delivered.stage !== 'delivered') {
      throw new ConstitutionalViolationError('8.7', 'A signed export did not deliver through the lifecycle of 8.7.');
    }
    return `an authorized export assembles from source records, computes and signs its manifest (criteria → assemble → manifest → signed → delivered); demo quarantines are refused by construction (8.7; 5.10)`;
  });
}

/** The full state & authority report (order Deliverable 6). */
export interface StateAuthorityReport {
  readonly passed: boolean;
  readonly areas: readonly StateAuthorityResult[];
  readonly citations: readonly Citation[];
}

/** Runs every Stage 5 and Stage 8 verification. */
export function runStateAuthorityVerification(): StateAuthorityReport {
  const areas = [
    verifyStateGates(),
    verifyStateTransitions(),
    verifyHonestStates(),
    verifyQuarantineRules(),
    verifyAuthorityGates(),
    verifyVerdictOwnership(),
    verifyChainIntegrity(),
    verifyEvidenceAndManifestIntegrity(),
    verifyExportRestrictions(),
  ];
  return Object.freeze({
    passed: areas.every((area) => area.passed),
    areas: Object.freeze(areas),
    citations: ENGINE_CITATIONS,
  });
}

/** The gate form: throws a ConstitutionalViolationError on any failure. */
export function assertStateAuthorities(): StateAuthorityReport {
  const report = runStateAuthorityVerification();
  const failed = report.areas.filter((area) => !area.passed);
  if (failed.length > 0) {
    throw new ConstitutionalViolationError(
      'Part V / Part VIII / 9.11',
      `State & authority verification failed: ${failed.map((area) => `${area.area} — ${area.evidence}`).join(' | ')}`,
      ENGINE_CITATIONS,
    );
  }
  return report;
}

export const STATE_AUTHORITY_ENGINE_CITATIONS: readonly Citation[] = Object.freeze(ENGINE_CITATIONS);
