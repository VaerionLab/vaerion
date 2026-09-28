# VAERION SECURITY PROOF — v1.0
### PHASE 51 · Security Closure & Final Trust Hardening · Evidence of record

> **What this document is:** the measured record of Vaerion's journal security
> behavior against a defined attack suite — tested on the real shipped CLI
> (`vaerion@0.1.13-rc1` line, main branch), in clean sandboxes, from a fresh
> package install.
> **What this document is not:** a claim of impenetrability. Every statement
> below says *tested against defined attack scenarios* — never *impossible to
> break*. The known limitations are listed in §6 because a security document
> that hides its boundaries is itself a vulnerability.

---

## 1. Threat model (scope of this proof)

**Assets under test:** the run journal (`.vaerion/journal/<run_id>.ndjson`),
its terminal receipt (the completeness anchor), the audit ledger, the refusal
log, and the verification commands a third party would run
(`vae journal verify`, `vae doctor`).

**Adversary model:** an actor with *write access to the journal file after a
run closed* — the classic insider/compromise/after-the-fact position. The
adversary can read, edit, delete, and reorder records, and can recompute
unkeyed hashes (blake3 is public).

**Out of scope (stated boundaries, §6):** a hostile host that controls the
engine at run time (garbage-in); an adversary who rewrites the journal AND
re-folds its receipt in concert (full forgery — answer: external anchoring via
`vae snapshot` / `vae provenance` / published receipts).

## 2. The completeness anchor (what changed in this hardening)

Phase 50's war simulation found W-1: **tail deletion passed verification**
(`ok: true`, exit 0 — and `vae doctor` green). Root cause measured: the
verifier proved *integrity* (nothing altered) but not *completeness* (nothing
missing), although every closed journal already ends with a receipt record
that commits to its final record count and head hash.

Closure (main line, this phase): the verifier now enforces the invariant —

> **A receipt record certifies the prefix immediately before it: the number of
> records preceding it equals `receipt.journal.records`, and the record it
> chains to hashes to `receipt.journal.head_hash`.**

New diagnostic: **E1010 `journal_completeness_anchor_invalid`**
(`spec/errors.yaml`). Design of record: `JOURNAL_COMPLETENESS_DESIGN.md`.
Reconnaissance of record: `PHASE_51_SECURITY_ANALYSIS.md`.

## 3. Tested attacks and verification results

Environment: fresh install of the built package tarball
(`sha256 b75f46a0…`), clean workspace, normal user workflow
(`vae init --template demo` → `vae run demo` → `vae journal verify`).

| # | Attack scenario | Technique | Result before | Result after (measured) |
|---|---|---|---|---|
| 1 | Semantic forgery | edit a record's claims ("1 hits" → "99 hits") | BLOCKED — E1001, exit 5 | BLOCKED — E1001, exit 5 (unchanged) |
| 2 | Competent forgery | edit claims AND recompute that record's hash | BLOCKED — E1001 at successor | BLOCKED — E1001 at successor |
| 3 | Hash corruption | flip recorded hash / prev bytes | BLOCKED — E1001, exit 5 | BLOCKED — E1001, exit 5 (unchanged) |
| 4 | **Tail deletion (W-1)** | delete the final record (the receipt) | **NOT detected — ok:true, exit 0** | **BLOCKED — E1010, exit 5: "completeness anchor missing: the run closed but no receipt record exists — records were removed after close"** |
| 5 | **Middle deletion + full re-chain** | delete an internal record, recompute ALL hashes | **NOT detected — ok:true, exit 0** | **BLOCKED — E1005 (seq gap) for event deletions; E1010 (receipt count/head commitment) for structural deletions** |
| 6 | **Record substitution + re-chain** | same count, different content, recompute all hashes | **NOT detected** | **BLOCKED — E1010: "the certified tail was replaced"** (receipt head commitment) |
| 7 | Receipt claim edit | change the receipt's certified count in place | NOT detected | BLOCKED — E1001 (receipt's own content hash); re-sealed variant → E1010 |
| 8 | Config manipulation | inject unknown config key | BLOCKED — E1201, exit 1 | BLOCKED — E1201, exit 1 (unchanged) |
| 9 | Permission bypass / undeclared tool | agent plan calls `fs.delete` undeclared | BLOCKED — E1801 fail-closed, journaled | BLOCKED — E1801 (unchanged) |
| 10 | Broker denial path | declared tool, policy `deny` | refusal recorded, hash-chained (E1300) | unchanged; failed run's journal still verifies |
| 11 | Normal operation | untouched closed run | `ok: true` | `ok: true, anchored: true, complete: true` |

**Regression protection:** the permanent attack suite
`packages/vaerion/tests/security/journal-completeness.test.ts` (12 scenarios,
including the recovery re-certification, in-flight, and redacted-export
compatibility cases) runs in the package's test gate; full suite at closure:
**645/645 pass**.

**Doctor:** with a truncated journal, `vae doctor` now fails the journal check
(E1010) and exits 5 — previously it reported "all checks green."

## 4. Verification commands (recompute this proof yourself)

```sh
npm install -g vaerion && vae init --template demo
vae run demo --query "any question"
vae journal verify <RUN_ID>      # ok: true · anchored: true · complete: true
# tamper: edit any line of .vaerion/journal/<RUN_ID>.ndjson → verify again
#   edited record        → E1001 (exit 5)
#   deleted final record → E1010 (exit 5)
vae doctor                       # refuses an incomplete journal (exit 5)
```

## 5. Recovery and exports under the same law

- **Recovery re-certifies.** If a crash tears the journal and the torn tail
  was the receipt, `vae journal recover` re-folds and appends a fresh
  terminal receipt (`RecoveryReport.recertified: true`) — the law "a run is
  not finished until it has a receipt" survives crashes.
- **Exports re-certify.** A redacted export re-chains its records; a copied
  receipt re-certifies the export's own prefix, so exports verify under the
  identical invariant — no special cases in the verifier.
- **In-flight runs make no completeness claim** (`complete: null`) because
  they are not finished; claiming completeness for an unfinished run would be
  the real dishonesty.

## 6. Known limitations and honest boundaries

1. **Tamper-evident, not tamper-proof.** The chain is unkeyed: an adversary
   who rewrites the journal AND re-folds its receipt in concert produces a
   self-consistent file. Client-side verification cannot defeat full forgery
   by the writer. For adversarial custody, anchor externally: `vae snapshot`
   (digest-pinned archive), `vae provenance`, or publish the receipt
   (`journal.records` + `head_hash`) to a third party at close time.
2. **Garbage-in.** Vaerion proves the record — what the engine observed,
   decided, and did, unmodified since. It cannot make a compromised host
   truthful. The boundary sentence: *proves the record, not the world.*
3. **Post-receipt appends** (recovery notes, in-flight resumed work) are
   integrity-covered but completeness-covered only up to the last receipt's
   prefix; they anchor when the run closes again.
4. **Release signing** still uses the bootstrap Ed25519 key pending the
   offline key ceremony (RISK-LEDGER R-2 / Founder-gated F-3) — disclosed
   wherever it applies.
5. This proof covers the journal/verification subsystem. Gateway isolation,
   extension pinning, packaging purity, and daemon auth are separately
   enforced (see `docs/security/THREAT-MODEL.md` properties P-*) and are not
   re-claimed here.

## 7. Verdict of record

Measured against the defined attack suite, the journal subsystem now enforces
**integrity AND completeness** for closed runs, with taught, investigable
failures (E1001/E1005/E1010, exit 5) and no false positives on lawful flows
(recovery, resume, exports, legacy in-flight journals). The Phase 50 weakness
is closed by verification, not by documentation.

*Every claim in this document carries a command that reproduces it.*
