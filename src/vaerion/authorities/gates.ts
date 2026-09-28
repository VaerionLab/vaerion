/**
 * Vaerion — Authorities / The Sixteen Data Gates
 *
 * Mechanical verification of Part VIII (Constitution 9.1 form: binary,
 * cited). Each gate exercises the running authorities — contracts, chain,
 * evidence, verification, ledger, rule, identity, investigation, manifest,
 * export — so the proof is of the engine, not of a description of it (P-6).
 * Every assertion form throws a ConstitutionalViolationError on violation;
 * every gate proves both the lawful path and refusal paths.
 *
 * Gate order is the directive's order: authority ownership, authority
 * isolation, receipt lifecycle, evidence lifecycle, verification lifecycle,
 * chain integrity, investigation lifecycle, export lifecycle, manifest
 * verification, identity lifecycle, append-only guarantees, authority
 * boundaries, immutable history, export verification, no authority overlap,
 * no receipt mutation.
 *
 * Citations: Implementation Constitution Part VIII, 9.1, 5.3, 5.10; Bible
 * Art. II, III, VI, VIII.
 *
 * No visual values may appear in this file. Citation: Constitution 1.3.
 */

import { bible, implementation, type Citation } from '../foundation/citations';
import { ConstitutionalViolationError } from '../foundation/authority';
import { AUTHORITIES } from '../state/ownership';
import { sha256, assertHashBinding } from './hash';
import { AUTHORITY_CONTRACTS, assertAuthorityContractIntegrity, getAuthorityContract } from './contracts';
import { createChainAuthority } from './chain';
import { createEvidenceAuthority } from './evidence';
import { createVerificationAuthority } from './verification';
import { createLedgerAuthority } from './ledger';
import { createRuleAuthority } from './rule';
import { createIdentityAuthority } from './identity';
import { createInvestigationEngine } from './investigation';
import { createExportAuthority } from './export';
import { computeManifest, signManifest, verifyBundle } from './manifest';
import { createAuthorities } from './composition';

/** The verdict of one mechanical gate (9.1 form). */
export interface AuthorityGateResult {
  readonly gate: string;
  readonly passed: boolean;
  readonly evidence: string;
  readonly citations: readonly Citation[];
}

const GATE_CITATIONS: readonly Citation[] = [implementation('Part VIII'), implementation('9.1', 'mechanical, binary, cited')];

function runGate(gate: string, citations: readonly Citation[], proof: () => string): AuthorityGateResult {
  try {
    const evidence = proof();
    return { gate, passed: true, evidence, citations: [...citations, ...GATE_CITATIONS] };
  } catch (error) {
    return {
      gate,
      passed: false,
      evidence: error instanceof Error ? error.message : String(error),
      citations: [...citations, ...GATE_CITATIONS],
    };
  }
}

/** Expects `proof` to throw a ConstitutionalViolationError; otherwise throws. */
function expectViolation(proof: () => void, rule: string): void {
  try {
    proof();
  } catch (error) {
    if (error instanceof ConstitutionalViolationError) return;
    throw new ConstitutionalViolationError(
      rule,
      `A refusal path raised "${error instanceof Error ? error.message : String(error)}" instead of a ConstitutionalViolationError.`,
    );
  }
  throw new ConstitutionalViolationError(rule, 'A refusal path did not throw — the engine accepted a violation.');
}

/** Expects `proof` to throw at all (immutability probes throw TypeError). */
function expectThrow(proof: () => void, subject: string): void {
  try {
    proof();
  } catch {
    return;
  }
  throw new ConstitutionalViolationError('8.1 / 8.5', `${subject} accepted a mutation — the record set is not frozen.`);
}

const METHOD = Object.freeze({ engineVersion: 'vaerion-engine 1.0.0', ruleset: 'VAERION_CONSTITUTION v1.0 series', environment: 'data-gate probe' });

/** 1 — authority ownership: the seven contracts resolve and refuse (8.0). */
export function gateAuthorityOwnership(): AuthorityGateResult {
  return runGate('authority ownership', [implementation('8.0'), implementation('5.4')], () => {
    assertAuthorityContractIntegrity();
    for (const authority of AUTHORITIES) {
      getAuthorityContract(authority.name);
    }
    // Refusal: an invented authority does not exist.
    expectViolation(() => getAuthorityContract('Cleanup Authority'), '8.0');
    return `${AUTHORITY_CONTRACTS.length} authority contracts resolve against the ownership registry; the names and owned domains are identical; invented authorities refused (8.0)`;
  });
}

/** 2 — authority isolation: no authority exposes another's operations (8.0). */
export function gateAuthorityIsolation(): AuthorityGateResult {
  return runGate('authority isolation', [implementation('8.0'), implementation('5.3')], () => {
    const system = createAuthorities({ clock: () => 0 });
    const surfaceOf = (authority: object) => authority as unknown as Record<string, unknown>;
    // The Chain exposes no verdict issuance; the Verification exposes no
    // chain append; the Export exposes no receipt drafting; the Evidence
    // exposes no chain append.
    if ('issue' in surfaceOf(system.chain)) throw new ConstitutionalViolationError('8.0', 'The Chain Authority exposes a verdict-issuing operation — authority overlap (8.0).');
    if ('append' in surfaceOf(system.verification) || 'appendRecord' in surfaceOf(system.verification)) throw new ConstitutionalViolationError('8.0', 'The Verification Authority exposes a chain-append operation — authority overlap (8.0).');
    if ('draft' in surfaceOf(system.export)) throw new ConstitutionalViolationError('8.0', 'The Export Authority exposes a receipt-drafting operation — authority overlap (8.0).');
    if ('append' in surfaceOf(system.evidence)) throw new ConstitutionalViolationError('8.0', 'The Evidence Authority exposes a chain-append operation — authority overlap (8.0).');
    // The ledger reads verdicts only from the Verification Authority: an
    // unknown verification id cannot record a verdict.
    const draft = system.ledger.draft({ claim: 'isolation probe', subject: 'gate', quarantine: 'production' });
    expectViolation(() => system.ledger.recordVerdict({ draftId: draft.draftId, verificationId: 'vrf_does_not_exist' }), '5.3 / 8.1');
    return 'no authority exposes another\'s operations; verdict facts enter receipts only from the Verification Authority\'s own record (8.0; 5.3)';
  });
}

/** 3 — receipt lifecycle: the full 8.1 walk with stage refusals (8.1). */
export function gateReceiptLifecycle(): AuthorityGateResult {
  return runGate('receipt lifecycle', [implementation('8.1'), bible('VI')], () => {
    const system = createAuthorities({ clock: (() => { let t = 0; return () => (t += 1); })() });
    const evidence = system.evidence.capture({ type: 'log', source: 'gate', content: 'evidence content' });
    const draft = system.ledger.draft({ claim: 'The run completed its declared scope.', subject: 'run/gate-1', quarantine: 'production' });
    // Stage refusal: the verdict before evidence is gathered.
    const queued = system.verification.queue({ claim: draft.claim, subject: draft.subject });
    system.verification.bindMethod({ verificationId: queued.verificationId, method: METHOD });
    system.verification.issue({ verificationId: queued.verificationId, outcome: 'verified' });
    expectViolation(() => system.ledger.recordVerdict({ draftId: draft.draftId, verificationId: queued.verificationId }), '8.1');
    system.ledger.gatherEvidence({ draftId: draft.draftId, evidenceIds: [evidence.evidenceId] });
    const recorded = system.ledger.recordVerdict({ draftId: draft.draftId, verificationId: queued.verificationId });
    if (!recorded.verdict || recorded.verdict.issuedBy !== 'Verification Authority') {
      throw new ConstitutionalViolationError('8.1 / Art. III', 'The recorded verdict does not name the Verification Authority (Art. III).');
    }
    const record = system.ledger.append({ draftId: draft.draftId });
    if (record.chainParent.length === 0) throw new ConstitutionalViolationError('8.1', 'The appended receipt names no chain parent (8.1; Art. VI).');
    // Stage refusal: appending a draft twice; appending without a verdict.
    expectViolation(() => system.ledger.append({ draftId: draft.draftId }), '8.1');
    const bare = system.ledger.draft({ claim: 'No verdict receipt', subject: 'run/gate-2', quarantine: 'production' });
    system.ledger.gatherEvidence({ draftId: bare.draftId, evidenceIds: [evidence.evidenceId] });
    expectViolation(() => system.ledger.append({ draftId: bare.draftId }), '8.1');
    // Refusal: a receipt without evidence.
    const noEvidence = system.ledger.draft({ claim: 'Evidence-less claim', subject: 'run/gate-3', quarantine: 'production' });
    const v2 = system.verification.queue({ claim: noEvidence.claim, subject: noEvidence.subject });
    system.verification.bindMethod({ verificationId: v2.verificationId, method: METHOD });
    system.verification.issue({ verificationId: v2.verificationId, outcome: 'failed' });
    expectViolation(() => system.ledger.gatherEvidence({ draftId: noEvidence.draftId, evidenceIds: [] }), '8.1 / Art. II');
    return 'receipt lifecycle walks drafted → evidence gathered → verdict issued → appended → immutable; stage skips and evidence-less receipts refused (8.1; Art. VI)';
  });
}

/** 4 — evidence lifecycle: capture/attest/reference, restriction, missing (8.2). */
export function gateEvidenceLifecycle(): AuthorityGateResult {
  return runGate('evidence lifecycle', [implementation('8.2'), bible('VIII')], () => {
    const evidence = createEvidenceAuthority({ hash: sha256, clock: () => 0 });
    const artifact = evidence.capture({ type: 'file', source: 'workspace/a.md', content: 'deterministic content' });
    if (artifact.hash !== sha256('deterministic content')) {
      throw new ConstitutionalViolationError('8.1', 'Evidence was not hashed at capture (8.1; 8.2).');
    }
    evidence.attest({ evidenceId: artifact.evidenceId, receiptId: 'rcpt_gate' });
    evidence.reference({ evidenceId: artifact.evidenceId, referenceId: 'inv_gate' });
    const restricted = evidence.capture({ type: 'secret', source: 'vault', content: 'restricted content' });
    evidence.restrict({ evidenceId: restricted.evidenceId });
    if (evidence.stateOf(restricted.evidenceId).restriction !== 'restricted') {
      throw new ConstitutionalViolationError('8.2', 'The restriction did not travel with the artifact (8.2).');
    }
    // Missing evidence is a recorded state, never silent deletion (8.2).
    const missing = evidence.recordMissing({ type: 'file', source: 'workspace/gone.md' });
    if (!evidence.stateOf(missing.evidenceId).missing) throw new ConstitutionalViolationError('8.2', 'Missing evidence was not recorded (8.2).');
    expectViolation(() => evidence.attest({ evidenceId: missing.evidenceId, receiptId: 'rcpt_gate' }), '8.2 / Art. II');
    expectViolation(() => evidence.restrict({ evidenceId: missing.evidenceId }), '8.2');
    expectViolation(() => evidence.stateOf('evd_unknown'), '8.2');
    return 'evidence lifecycle walks captured → attested → referenced; restriction travels; missing evidence is a recorded state and cannot attest (8.2; Art. VIII)';
  });
}

/** 5 — verification lifecycle: queue → bind → issue → final (8.3). */
export function gateVerificationLifecycle(): AuthorityGateResult {
  return runGate('verification lifecycle', [implementation('8.3'), bible('III')], () => {
    const verification = createVerificationAuthority({ hash: sha256 });
    const record = verification.queue({ claim: 'The claim holds.', subject: 'gate' });
    const bound = verification.bindMethod({ verificationId: record.verificationId, method: METHOD });
    if (bound.stage !== 'method-bound') throw new ConstitutionalViolationError('8.3', 'The method did not bind (8.3).');
    // Refusal: re-binding — the method is pinned at verification time.
    expectViolation(() => verification.bindMethod({ verificationId: record.verificationId, method: METHOD }), '8.3');
    const fact = verification.issue({ verificationId: record.verificationId, outcome: 'verified' });
    if (fact.issuedBy !== 'Verification Authority' || fact.verifier !== METHOD.engineVersion) {
      throw new ConstitutionalViolationError('8.3 / Art. III', 'The issued verdict does not name its verifier (Art. III).');
    }
    // Refusal: double issue (final); unbound issue; anonymous method.
    expectViolation(() => verification.issue({ verificationId: record.verificationId, outcome: 'failed' }), '8.3');
    const unbound = verification.queue({ claim: 'Unbound', subject: 'gate' });
    expectViolation(() => verification.issue({ verificationId: unbound.verificationId, outcome: 'verified' }), '8.3 / Art. III');
    const incomplete = verification.queue({ claim: 'Incomplete method', subject: 'gate' });
    expectViolation(
      () => verification.bindMethod({ verificationId: incomplete.verificationId, method: { engineVersion: '', ruleset: METHOD.ruleset, environment: METHOD.environment } }),
      'Art. III',
    );
    // Re-verification issues a NEW verification; the original is final.
    const reverification = verification.reverify({ verificationId: record.verificationId });
    if (reverification.verificationId === record.verificationId || reverification.reverifiedFrom !== record.verificationId) {
      throw new ConstitutionalViolationError('8.3', 'Re-verification did not issue a new verification (8.3).');
    }
    if (verification.factOf(record.verificationId).outcome !== 'verified') {
      throw new ConstitutionalViolationError('8.3', 'The original verdict changed — verdicts are never edited in place (8.3).');
    }
    return 'verification lifecycle walks queued → method bound (pinned) → verdict issued → final; re-verification issues a new verification; verdicts are never edited (8.3; Art. III)';
  });
}

/** 6 — chain integrity: genesis, append-only, breaks, reconciliation (8.5). */
export function gateChainIntegrity(): AuthorityGateResult {
  return runGate('chain integrity', [implementation('8.5'), implementation('5.9')], () => {
    const chain = createChainAuthority({ hash: sha256, clock: () => 0 });
    if (chain.records.length !== 1 || chain.records[0].kind !== 'genesis') {
      throw new ConstitutionalViolationError('8.5', 'The chain did not begin at genesis (8.5).');
    }
    chain.append({ payload: 'first record' });
    chain.append({ payload: 'second record' });
    const attestation = chain.integrity();
    if (!attestation.intact) throw new ConstitutionalViolationError('8.5', 'A fresh chain does not attest intact (8.5).');
    // Breaks are first-class; appends halt while a break is unreconciled.
    chain.recordBreak({ atSeq: 1, reason: 'integrity probe' });
    expectViolation(() => chain.append({ payload: 'while broken' }), '5.9 / 8.5');
    const reconciled = chain.reconcile({ resolution: 'probe reconciliation' });
    if (reconciled.kind !== 'reconciliation') throw new ConstitutionalViolationError('8.5', 'Reconciliation was not recorded (8.5).');
    if (!chain.integrity().intact) throw new ConstitutionalViolationError('8.5', 'The chain does not attest intact after reconciliation (8.5).');
    // Refusal: reconciliation with no recorded break — never implicit.
    expectViolation(() => chain.reconcile({ resolution: 'nothing to reconcile' }), '8.5');
    // Detection: a hash instrument that diverges mid-chain is detected.
    let calls = 0;
    const faulty = createChainAuthority({ hash: (message) => { calls += 1; return calls === 3 ? sha256('tampered') : sha256(message); }, clock: () => 0 });
    faulty.append({ payload: 'a' });
    faulty.append({ payload: 'b' });
    const broken = faulty.integrity();
    if (broken.intact || broken.brokenAt === null) throw new ConstitutionalViolationError('8.5', 'A tampered chain was not detected — brokenness must be detectable (8.5).');
    return 'chain lifecycle walks genesis → append-only growth → attestable integrity; breaks are first-class; appends halt while broken; reconciliation is explicit and recorded; tampering is detected (8.5; 5.9)';
  });
}

/** 7 — investigation lifecycle: open → annotate → share → close (8.6). */
export function gateInvestigationLifecycle(): AuthorityGateResult {
  return runGate('investigation lifecycle', [implementation('8.6'), bible('XII')], () => {
    const system = createAuthorities({ clock: () => 0 });
    const anchor = system.chain.append({ payload: 'investigation anchor' });
    const snapshot = { chainSeq: anchor.seq, chainHash: anchor.hash, fogSaved: true };
    const investigation = system.investigation.open({ criteria: ['receipts tagged review-me'], snapshot });
    system.investigation.annotate({ investigationId: investigation.investigationId, text: 'The claim at the pin deserves review.' });
    system.investigation.share({ investigationId: investigation.investigationId, audience: 'audit team' });
    const replay = system.investigation.replay({ investigationId: investigation.investigationId });
    if (replay.chainRecordsUpToPin.length === 0 || !replay.snapshot.fogSaved) {
      throw new ConstitutionalViolationError('8.6', 'The shared replay did not preserve the saved chain and fog (8.6).');
    }
    // Present-day restrictions are honored honestly (8.6; 8.2).
    const secret = system.evidence.capture({ type: 'file', source: 'vault/x', content: 'secret content' });
    system.evidence.restrict({ evidenceId: secret.evidenceId });
    const replayAfterRestriction = system.investigation.replay({ investigationId: investigation.investigationId });
    if (!replayAfterRestriction.presentDayRestrictedEvidenceIds.includes(secret.evidenceId)) {
      throw new ConstitutionalViolationError('8.6 / 8.2', 'The replay ignored a present-day restriction — restrictions are honored honestly (8.6).');
    }
    system.investigation.close({ investigationId: investigation.investigationId });
    expectViolation(() => system.investigation.annotate({ investigationId: investigation.investigationId, text: 'too late' }), '8.6');
    // Refusal: a loose pin does not open.
    expectViolation(() => system.investigation.open({ criteria: ['x'], snapshot: { chainSeq: 9999, chainHash: 'nope', fogSaved: true } }), '8.6 / 8.0');
    expectViolation(() => system.investigation.open({ criteria: ['x'], snapshot: { chainSeq: anchor.seq, chainHash: anchor.hash, fogSaved: false } }), '8.6 / Art. XII');
    return 'investigation lifecycle walks opened → annotated → shared → closed; the pin must resolve in the Chain Authority; the replay honors present-day restrictions (8.6; Art. XII)';
  });
}

/** 8 — export lifecycle: criteria → assemble → manifest → sign → deliver (8.7). */
export function gateExportLifecycle(): AuthorityGateResult {
  return runGate('export lifecycle', [implementation('8.7'), implementation('5.10')], () => {
    const system = createAuthorities({ clock: (() => { let t = 0; return () => (t += 1); })() });
    const evidence = system.evidence.capture({ type: 'log', source: 'gate', content: 'export evidence' });
    const draft = system.ledger.draft({ claim: 'Exportable claim.', subject: 'run/export-1', quarantine: 'production' });
    system.ledger.gatherEvidence({ draftId: draft.draftId, evidenceIds: [evidence.evidenceId] });
    const v = system.verification.queue({ claim: draft.claim, subject: draft.subject });
    system.verification.bindMethod({ verificationId: v.verificationId, method: METHOD });
    system.verification.issue({ verificationId: v.verificationId, outcome: 'verified' });
    system.ledger.recordVerdict({ draftId: draft.draftId, verificationId: v.verificationId });
    const receipt = system.ledger.append({ draftId: draft.draftId });
    const record = system.export.setCriteria({ criteria: ['subject: run/export-1'] });
    system.export.assemble({ exportId: record.exportId, sourceRecords: [receipt] });
    system.export.computeManifest({ exportId: record.exportId, timestampAuthority: 'engine monotonic clock (declared)', issuingEngine: METHOD.engineVersion, ruleset: METHOD.ruleset });
    // Refusal: delivering unsigned; skipping stages.
    expectViolation(() => system.export.deliver({ exportId: record.exportId }), '8.7 / 8.8');
    system.export.sign({ exportId: record.exportId, signature: 'probe-signature' });
    const delivered = system.export.deliver({ exportId: record.exportId });
    if (delivered.stage !== 'delivered') throw new ConstitutionalViolationError('8.7', 'The export did not deliver (8.7).');
    // Refusal: Demo quarantines are refused by construction.
    const demoEvidence = system.evidence.capture({ type: 'log', source: 'demo', content: 'demo evidence' });
    const demoDraft = system.ledger.draft({ claim: 'Demo claim.', subject: 'demo/export', quarantine: 'demo' });
    system.ledger.gatherEvidence({ draftId: demoDraft.draftId, evidenceIds: [demoEvidence.evidenceId] });
    const demoV = system.verification.queue({ claim: demoDraft.claim, subject: demoDraft.subject });
    system.verification.bindMethod({ verificationId: demoV.verificationId, method: METHOD });
    system.verification.issue({ verificationId: demoV.verificationId, outcome: 'verified' });
    system.ledger.recordVerdict({ draftId: demoDraft.draftId, verificationId: demoV.verificationId });
    const demoReceipt = system.ledger.append({ draftId: demoDraft.draftId });
    const demoExport = system.export.setCriteria({ criteria: ['subject: demo/export'] });
    expectViolation(() => system.export.assemble({ exportId: demoExport.exportId, sourceRecords: [demoReceipt] }), '8.7 / 5.10');
    // Refusal: stage skip — manifest before assembly.
    const skipped = system.export.setCriteria({ criteria: ['subject: skip'] });
    expectViolation(() => system.export.computeManifest({ exportId: skipped.exportId, timestampAuthority: 'x', issuingEngine: 'x', ruleset: 'x' }), '8.7');
    return 'export lifecycle walks criteria set → assembled from source records → manifest computed → signed → delivered; unsigned delivery and Demo quarantines refused (8.7; 5.10)';
  });
}

/** 9 — manifest verification: recompute, detect, third-party (8.8). */
export function gateManifestVerification(): AuthorityGateResult {
  return runGate('manifest verification', [implementation('8.8'), bible('III')], () => {
    const recordHashes = [sha256('record-a'), sha256('record-b')];
    const manifest = computeManifest({
      bundleHash: sha256(recordHashes.join('|')),
      recordHashes,
      timestampAuthority: 'engine monotonic clock (declared)',
      issuingEngine: METHOD.engineVersion,
      ruleset: METHOD.ruleset,
      hash: sha256,
    });
    // Refusal: anonymous manifest fields.
    expectViolation(
      () => computeManifest({ bundleHash: 'x', recordHashes: [], timestampAuthority: '', issuingEngine: 'e', ruleset: 'r', hash: sha256 }),
      '8.8 / Art. III',
    );
    const signed = signManifest({ manifest, signature: 'probe-signature', signedAt: 1 });
    const verification = verifyBundle({ recordHashes, manifest: signed, hash: sha256 });
    if (!verification.verifiable) throw new ConstitutionalViolationError('8.8', 'An intact bundle failed verification (8.8).');
    // Mismatch is detectable, never silent (8.8).
    const tampered = verifyBundle({ recordHashes: [sha256('record-a'), sha256('TAMPERED')], manifest: signed, hash: sha256 });
    if (tampered.verifiable || !tampered.reason) throw new ConstitutionalViolationError('8.8', 'A tampered bundle passed verification — brokenness must be detectable (8.8).');
    const unsigned = verifyBundle({ recordHashes, manifest, hash: sha256 });
    if (unsigned.verifiable) throw new ConstitutionalViolationError('8.8', 'An unsigned manifest verified (8.8).');
    expectViolation(() => signManifest({ manifest: signed, signature: 'again', signedAt: 2 }), '8.8');
    return 'manifest verification recomputes from delivered records; unsigned manifests refuse; mismatches are detected and reasoned, never silent; signed manifests are immutable (8.8)';
  });
}

/** 10 — identity lifecycle: kinds, reveal-once ceremony, receipts (8.9). */
export function gateIdentityLifecycle(): AuthorityGateResult {
  return runGate('identity lifecycle', [implementation('8.9'), bible('III')], () => {
    const system = createAuthorities({ clock: (() => { let t = 0; return () => (t += 1); })() });
    for (const kind of ['human', 'machine', 'engine'] as const) {
      const actor = system.identity.enroll({ kind });
      if (actor.kind !== kind) throw new ConstitutionalViolationError('8.9', 'The actor kind did not record (8.9).');
    }
    // Refusal: a fourth kind does not exist.
    expectViolation(() => system.identity.enroll({ kind: 'committee' as 'human' }), '8.9 / Art. III');
    const actor = system.identity.enroll({ kind: 'engine' });
    const credential = system.identity.issueCredential({ actorId: actor.actorId });
    // Refusal: reveal without ceremony; reveal twice.
    expectViolation(() => system.identity.revealCredential({ credentialId: credential.credentialId, ceremony: { consequenceAcknowledged: false } }), '8.9');
    system.identity.revealCredential({ credentialId: credential.credentialId, ceremony: { consequenceAcknowledged: true } });
    expectViolation(() => system.identity.revealCredential({ credentialId: credential.credentialId, ceremony: { consequenceAcknowledged: true } }), '8.9');
    // Rotation issues a receipt (8.9) through the full receipt lifecycle.
    const before = system.ledger.records.length;
    const { receipt } = system.identity.rotateCredential({ credentialId: credential.credentialId, method: METHOD, eventContent: 'rotation event content' });
    if (system.ledger.records.length !== before + 1) throw new ConstitutionalViolationError('8.9', 'The rotation issued no receipt (8.9).');
    if (receipt.verdict.issuedBy !== 'Verification Authority') throw new ConstitutionalViolationError('8.9 / Art. III', 'The identity receipt carries an anonymous verdict (Art. III).');
    const event = system.identity.recordIdentityEvent({ kind: 'credential-issued', description: 'probe', method: METHOD, eventContent: 'event content probe' });
    if (!system.ledger.get(receipt.receiptId) || !system.ledger.get(event.receiptId)) {
      throw new ConstitutionalViolationError('8.9', 'Identity events are not in the admin log as receipts (8.9).');
    }
    return 'identity lifecycle: actors are human, machine, or engine (fourth kinds refused); credentials reveal-once with mandatory ceremony; rotations and events enter the admin log as receipts (8.9; Art. III)';
  });
}

/** 11 — append-only guarantees: frozen sets, no mutation APIs (8.1; 8.5). */
export function gateAppendOnlyGuarantees(): AuthorityGateResult {
  return runGate('append-only guarantees', [implementation('8.5'), implementation('8.1')], () => {
    const system = createAuthorities({ clock: (() => { let t = 0; return () => (t += 1); })() });
    system.chain.append({ payload: 'probe' });
    if (!Object.isFrozen(system.chain.records)) throw new ConstitutionalViolationError('8.5', 'The chain record set is not frozen (8.5).');
    for (const record of system.chain.records) {
      if (!Object.isFrozen(record)) throw new ConstitutionalViolationError('8.5', 'A chain record is not frozen (8.5).');
    }
    expectThrow(() => (system.chain.records as unknown as { push(): void }).push(), 'The chain record set');
    // The ledger's receipts are likewise frozen and append-only.
    const evidence = system.evidence.capture({ type: 'log', source: 'gate', content: 'append-only probe' });
    const draft = system.ledger.draft({ claim: 'Append-only probe.', subject: 'gate', quarantine: 'production' });
    system.ledger.gatherEvidence({ draftId: draft.draftId, evidenceIds: [evidence.evidenceId] });
    const v = system.verification.queue({ claim: draft.claim, subject: draft.subject });
    system.verification.bindMethod({ verificationId: v.verificationId, method: METHOD });
    system.verification.issue({ verificationId: v.verificationId, outcome: 'verified' });
    system.ledger.recordVerdict({ draftId: draft.draftId, verificationId: v.verificationId });
    const receipt = system.ledger.append({ draftId: draft.draftId });
    if (!Object.isFrozen(receipt) || !Object.isFrozen(system.ledger.records)) {
      throw new ConstitutionalViolationError('8.1', 'Receipt records are not frozen (8.1).');
    }
    expectThrow(() => (system.ledger.records as unknown as { push(): void }).push(), 'The receipt record set');
    return 'chain and receipt record sets are frozen; every append produces a new frozen set; mutation attempts throw (8.5; 8.1)';
  });
}

/** 12 — authority boundaries: distinct ownership, lawful stage order (8.0). */
export function gateAuthorityBoundaries(): AuthorityGateResult {
  return runGate('authority boundaries', [implementation('8.0'), implementation('8.3')], () => {
    const owned = new Set<string>();
    for (const contract of AUTHORITY_CONTRACTS) {
      if (owned.has(contract.owns)) {
        throw new ConstitutionalViolationError('8.0', `"${contract.owns}" is owned twice — no authority overlap (8.0).`);
      }
      owned.add(contract.owns);
    }
    // Every declared composition target resolves (composition is declared,
    // never implicit — 8.0).
    for (const contract of AUTHORITY_CONTRACTS) {
      for (const composed of contract.composes) getAuthorityContract(composed);
    }
    // The state matrix's fact authorities are within the seven (5.4; 8.0).
    const names = new Set(AUTHORITIES.map((authority) => authority.name));
    for (const contract of AUTHORITY_CONTRACTS) {
      if (!names.has(contract.name)) throw new ConstitutionalViolationError('8.0', 'An authority contract is outside the seven named authorities (8.0).');
    }
    // Lifecycle stage order is enforced by the engines themselves —
    // spot-proofs: the export lifecycle refuses skips, the verification
    // lifecycle refuses re-binding (proven in gates 8 and 5).
    return `${AUTHORITY_CONTRACTS.length} contracts hold pairwise-distinct ownership; composition targets resolve; lifecycle orders enforced by the engines (8.0)`;
  });
}

/** 13 — immutable history: records frozen across every authority (8.1; 11.4). */
export function gateImmutableHistory(): AuthorityGateResult {
  return runGate('immutable history', [implementation('8.1'), implementation('11.4')], () => {
    const system = createAuthorities({ clock: (() => { let t = 0; return () => (t += 1); })() });
    const chainRecord = system.chain.append({ payload: 'history probe' });
    expectThrow(() => { (chainRecord as { payload?: string }).payload = 'edited'; }, 'The chain record');
    const evidence = system.evidence.capture({ type: 'log', source: 'gate', content: 'history probe evidence' });
    const draft = system.ledger.draft({ claim: 'History probe.', subject: 'gate', quarantine: 'production' });
    system.ledger.gatherEvidence({ draftId: draft.draftId, evidenceIds: [evidence.evidenceId] });
    const v = system.verification.queue({ claim: draft.claim, subject: draft.subject });
    system.verification.bindMethod({ verificationId: v.verificationId, method: METHOD });
    system.verification.issue({ verificationId: v.verificationId, outcome: 'verified' });
    system.ledger.recordVerdict({ draftId: draft.draftId, verificationId: v.verificationId });
    const receipt = system.ledger.append({ draftId: draft.draftId });
    expectThrow(() => { (receipt.verdict as { outcome?: string }).outcome = 'failed'; }, 'The receipt verdict');
    expectThrow(() => { (receipt as { claim?: string }).claim = 'edited'; }, 'The receipt record');
    // Rule records and signed manifests are frozen too.
    const rule = system.rule.draft({ identifier: 'probe/rule', body: 'body' });
    expectThrow(() => { (rule as { body?: string }).body = 'edited'; }, 'The rule record');
    const manifest = computeManifest({ bundleHash: sha256('x'), recordHashes: [], timestampAuthority: 't', issuingEngine: 'e', ruleset: 'r', hash: sha256 });
    const signed = signManifest({ manifest, signature: 'probe', signedAt: 0 });
    expectThrow(() => { (signed as { bundleHash?: string }).bundleHash = 'edited'; }, 'The signed manifest');
    return 'chain records, receipt records and verdicts, rule records, and signed manifests are frozen; every mutation attempt throws — constitutional history is never mutated (8.1; 11.4)';
  });
}

/** 14 — export verification: third-party verification of delivered bundles (8.8). */
export function gateExportVerification(): AuthorityGateResult {
  return runGate('export verification', [implementation('8.8'), implementation('9.14')], () => {
    const system = createAuthorities({ clock: (() => { let t = 0; return () => (t += 1); })() });
    const evidence = system.evidence.capture({ type: 'log', source: 'gate', content: 'verification evidence' });
    const draft = system.ledger.draft({ claim: 'Verifiable export claim.', subject: 'run/verify-1', quarantine: 'production' });
    system.ledger.gatherEvidence({ draftId: draft.draftId, evidenceIds: [evidence.evidenceId] });
    const v = system.verification.queue({ claim: draft.claim, subject: draft.subject });
    system.verification.bindMethod({ verificationId: v.verificationId, method: METHOD });
    system.verification.issue({ verificationId: v.verificationId, outcome: 'verified' });
    system.ledger.recordVerdict({ draftId: draft.draftId, verificationId: v.verificationId });
    system.ledger.append({ draftId: draft.draftId });
    const record = system.export.setCriteria({ criteria: ['subject: run/verify-1'] });
    const sourceRecords = system.ledger.records.filter((candidate) => candidate.subject === 'run/verify-1');
    system.export.assemble({ exportId: record.exportId, sourceRecords });
    system.export.computeManifest({ exportId: record.exportId, timestampAuthority: 'engine monotonic clock (declared)', issuingEngine: METHOD.engineVersion, ruleset: METHOD.ruleset });
    system.export.sign({ exportId: record.exportId, signature: 'probe-signature' });
    const delivered = system.export.deliver({ exportId: record.exportId });
    // Third-party verification — the delivered hashes and manifest only.
    const verification = system.export.verifyDelivered({ manifest: delivered.manifest!, recordHashes: delivered.recordHashes });
    if (!verification.verifiable) throw new ConstitutionalViolationError('8.8', 'A delivered bundle failed its own verification (8.8).');
    // A tampered delivery is detected, never silent (8.8).
    const tampered = system.export.verifyDelivered({ manifest: delivered.manifest!, recordHashes: [...delivered.recordHashes, sha256('extra')] });
    if (tampered.verifiable) throw new ConstitutionalViolationError('8.8', 'A tampered delivery verified (8.8).');
    return 'delivered bundles verify against their manifests without product access; tampered deliveries are detected and reasoned (8.8; 9.14)';
  });
}

/** 15 — no authority overlap: distinct owns, identity match, matrix alignment (8.0; 5.4). */
export function gateNoAuthorityOverlap(): AuthorityGateResult {
  return runGate('no authority overlap', [implementation('8.0'), implementation('5.4')], () => {
    assertAuthorityContractIntegrity();
    const owned = AUTHORITIES.map((authority) => authority.owns);
    if (new Set(owned).size !== owned.length) {
      throw new ConstitutionalViolationError('8.0', 'Two authorities declare the same owned domain — overlap (8.0).');
    }
    const names = new Set(AUTHORITIES.map((authority) => authority.name));
    for (const contract of AUTHORITY_CONTRACTS) {
      if (!names.has(contract.name)) throw new ConstitutionalViolationError('8.0', 'A contract names an authority outside the seven (8.0).');
    }
    return `${AUTHORITIES.length} authorities, ${new Set(owned).size} distinct owned domains — no overlap, no ambiguity (8.0)`;
  });
}

/** 16 — no receipt mutation: correction appends, never edits (8.1). */
export function gateNoReceiptMutation(): AuthorityGateResult {
  return runGate('no receipt mutation', [implementation('8.1'), bible('VI')], () => {
    const system = createAuthorities({ clock: (() => { let t = 0; return () => (t += 1); })() });
    const evidence = system.evidence.capture({ type: 'log', source: 'gate', content: 'correction evidence' });
    const originalDraft = system.ledger.draft({ claim: 'The original claim.', subject: 'run/correction-1', quarantine: 'production' });
    system.ledger.gatherEvidence({ draftId: originalDraft.draftId, evidenceIds: [evidence.evidenceId] });
    const v1 = system.verification.queue({ claim: originalDraft.claim, subject: originalDraft.subject });
    system.verification.bindMethod({ verificationId: v1.verificationId, method: METHOD });
    system.verification.issue({ verificationId: v1.verificationId, outcome: 'verified' });
    system.ledger.recordVerdict({ draftId: originalDraft.draftId, verificationId: v1.verificationId });
    const original = system.ledger.append({ draftId: originalDraft.draftId });
    // Correction by superseding receipt — the link lives on the new record.
    const correctionDraft = system.ledger.draft({
      claim: 'The corrected claim — the original stated an incomplete scope.',
      subject: original.subject,
      quarantine: 'production',
      supersedes: original.receiptId,
    });
    const correctionEvidence = system.evidence.capture({ type: 'log', source: 'gate', content: 'correction evidence v2' });
    system.ledger.gatherEvidence({ draftId: correctionDraft.draftId, evidenceIds: [correctionEvidence.evidenceId] });
    const v2 = system.verification.queue({ claim: correctionDraft.claim, subject: correctionDraft.subject });
    system.verification.bindMethod({ verificationId: v2.verificationId, method: METHOD });
    system.verification.issue({ verificationId: v2.verificationId, outcome: 'verified' });
    system.ledger.recordVerdict({ draftId: correctionDraft.draftId, verificationId: v2.verificationId });
    const correction = system.ledger.append({ draftId: correctionDraft.draftId });
    if (correction.supersedes !== original.receiptId) throw new ConstitutionalViolationError('8.1', 'The superseding receipt does not link its parent (8.1).');
    // The original is untouched — its record still reads exactly as appended.
    const untouched = system.ledger.get(original.receiptId);
    if (!untouched || untouched.claim !== original.claim || untouched.verdict.outcome !== original.verdict.outcome) {
      throw new ConstitutionalViolationError('8.1 / Art. VI', 'The original receipt changed — correction is never mutation (8.1).');
    }
    if (system.ledger.current(original.receiptId)!.receiptId !== correction.receiptId) {
      throw new ConstitutionalViolationError('8.1', 'The supersession chain does not resolve to the correction (8.1).');
    }
    return 'correction appended a superseding receipt linked by parent; the original record reads exactly as appended; the supersession chain resolves (8.1; Art. VI)';
  });
}

/** All sixteen data gates, in directive order. */
export function runAllAuthorityGates(): readonly AuthorityGateResult[] {
  assertHashBinding(sha256);
  return [
    gateAuthorityOwnership(),
    gateAuthorityIsolation(),
    gateReceiptLifecycle(),
    gateEvidenceLifecycle(),
    gateVerificationLifecycle(),
    gateChainIntegrity(),
    gateInvestigationLifecycle(),
    gateExportLifecycle(),
    gateManifestVerification(),
    gateIdentityLifecycle(),
    gateAppendOnlyGuarantees(),
    gateAuthorityBoundaries(),
    gateImmutableHistory(),
    gateExportVerification(),
    gateNoAuthorityOverlap(),
    gateNoReceiptMutation(),
  ];
}
