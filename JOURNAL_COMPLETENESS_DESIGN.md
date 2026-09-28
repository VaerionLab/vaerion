# JOURNAL COMPLETENESS DESIGN (Part 2 — The Completeness Anchor)
### PHASE 51 · Status: DESIGN OF RECORD · Companion: `PHASE_51_SECURITY_ANALYSIS.md`

---

## 1. Capability statement

| | Guarantee |
|---|---|
| Current (v0.1.13-rc1) | "These records were not modified." (integrity) |
| **After this design** | "These records were not modified **AND no records are missing** from the certified end state." (integrity **+ completeness**) |

Precisely: for every closed run, the journal carries an in-chain receipt that
commits to the run's final record count and head hash. Verification enforces
that commitment. Truncation, silent re-chaining, and receipt removal become
detectable with record-level precision — using data the engine already writes.

## 2. Options evaluated

| Option | Fits existing architecture | CLI simplicity | Performance | New dependencies | Verdict |
|---|---|---|---|---|---|
| **A. In-journal terminal receipt (chosen)** | ✅ receipt already appended by `close()` (`run.ts:442`) | ✅ zero new commands, zero flags | ✅ one linear scan the verifier already performs | ✅ none | **CHOSEN** |
| B. Persisted receipt files (`.vaerion/receipts/`) | ⚠️ duplicates an existing in-chain anchor | ⚠️ sync questions (which copy wins?) | ⚠️ extra fs writes per run | ✅ none | rejected — redundant |
| C. Head commitments in audit ledger | ❌ audit chain records broker decisions, not run length — layer coupling | ⚠️ | ⚠️ | ✅ none | rejected — wrong layer |
| D. Signed checkpoints per run | ❌ key management contradicts zero-config local-first | ❌ | ⚠️ | ❌ keys | rejected for v1 — documented hostile-host boundary unchanged anyway |
| E. Final-state hash in a sidecar | ⚠️ sidecars break in exports/snapshots | ⚠️ | ✅ | ✅ none | rejected — fragile |
| F. Status quo (docs-only) | ✅ | ✅ | ✅ | ✅ | rejected — leaves W-1 open for the first reviewer to find |

## 3. The invariant of record (one sentence)

> **A receipt record certifies the prefix immediately before it: the number of
> records preceding it equals `receipt.journal.records`, and the record it
> chains to hashes to `receipt.journal.head_hash`.**

Enforcement lives in `verifyJournal()` — the same pure function, the same
single verification surface, now with two more checks after the existing
chain/seq checks.

## 4. Specification

### 4.1 New verify checks (after existing shape/index/chain/seq pass)

```
R := index of the LAST record with k === "receipt"   (0-based)

if R exists:
    anchored := true
    CHECK-V1  records[R].receipt.journal.records === R
              else E1010 "completeness anchor mismatch: receipt certifies
              {N} records; {R} records precede it — records were removed
              or the receipt is stale"
    CHECK-V2  records[R].receipt.journal.head_hash === records[R-1].hash
              else E1010 "completeness anchor mismatch: receipt certifies
              head {…12}, the record it chains to hashes to {…12} — the
              certified tail was replaced or re-chained"
else:
    anchored := false
    CHECK-V3  if any record is evt run.closed:
              E1010 "completeness anchor missing: the run closed but no
              receipt record exists — records were removed after close
              (expected a receipt certifying {records} records; found none)"
    (no run.closed → in-flight/legacy journal: integrity-only, complete:=null)
```

`VerifyReport` gains two additive fields:

```ts
anchored: boolean        // a terminal receipt exists (or re-certified)
complete: boolean | null // true = anchor enforced & holds; false = E1010; null = no anchor claimed (open/legacy)
```

### 4.2 Why CHECK-V2 is essential (the re-chain attack)

Deleting an internal record and recomputing every later hash defeats all
linkage checks (blake3 is unkeyed). It does NOT defeat V2: the receipt's
embedded head_hash still commits to the ORIGINAL tail. This is the one check
that makes "surgical rewrite" detectable without external anchoring.

### 4.3 Export compatibility (`src/journal/export.ts`)

Exports copy receipt records and re-chain everything. Under the invariant,
the copied receipt must certify the export's own prefix: during the re-chain
loop, when the record is a receipt, its embedded `journal.head_hash` is
updated to the hash of the just-sealed predecessor (record count is
unchanged, so V1 holds unmodified). The derivation header
(`meta note="export"` → `source_head`, `source_records`) keeps provenance to
the original chain. Result: exports self-verify under the same law — no
exceptions, no special-casing in the verifier.

### 4.4 Recovery compatibility (`src/journal/recovery.ts`)

Recovery truncates a torn tail and appends `meta note="recovery"`. If the
torn tail WAS the receipt, the journal would end `run.closed`-but-no-receipt
→ V3 would flag a legitimately recovered run. Fix inside recovery's law:
**after appending the recovery note, if the journal contains `run.closed` and
holds no receipt record, recovery re-certifies** — folds a fresh receipt from
the recovered records and appends it through the normal writer path. Law
preserved: "a run is not finished until it has a receipt."
`RecoveryReport` gains `recertified: boolean`.

### 4.5 Doctor

`cmdDoctor` check #2 already calls `verifyJournal` per run — the invariant
applies automatically. Detail line extended with the anchored/complete state
so `vae doctor` *displays* completeness, not just integrity.

### 4.6 Exit codes & user message contract

E1010 → `report.ok = false` → existing mapping renders exit 5 for
`vae journal verify`. Every E1010 message follows the house contract:
**what happened** (anchor mismatch/missing) · **why trust failed** (records
removed or certified tail replaced) · **how to investigate** (compare against
the receipt printed at close or a `vae snapshot` archive; restore; never
hand-edit).

### 4.7 Error code of record

```yaml
E1010:
  name: journal_completeness_anchor_invalid
  summary: "Journal completeness anchor invalid — the terminal receipt is missing or does not certify the records it precedes."
  fix: "Compare against the receipt printed at run close or a `vae snapshot` archive; restore the run's evidence; never hand-edit a journal."
```

Registered in `spec/errors.yaml` (E10xx journal family, after E1009) and in
the `VerifyIssue` code union.

## 5. Threat coverage after the fix

| Attack (Phase 50/51 suite) | Before | After |
|---|---|---|
| Semantic forgery (edit record body) | E1001 exit 5 | E1001 exit 5 (unchanged) |
| Chain-link corruption | E1001 exit 5 | E1001 exit 5 (unchanged) |
| **Tail deletion (closed run)** | **`ok: true` exit 0 — W-1** | **E1010 exit 5 — BLOCKED (V3)** |
| **Middle deletion + full re-chain** | **`ok: true` exit 0 — undetected** | **E1010 exit 5 — BLOCKED (V2)** |
| Receipt body edit (count/head claims) | `ok: true` exit 0 | E1001 (content hash) — and if re-hashed, V1/V2 — BLOCKED |
| Normal operation | pass | pass + `anchored: true, complete: true` |
| In-flight / legacy journals (no receipt) | pass | pass — `complete: null` (honest boundary, documented) |

## 6. Honest boundaries (stated, not hidden)

1. A hostile host that rewrites the journal AND re-folds the receipt in
   concert can still forge a self-consistent file — unkeyed chains are
   tamper-*evident*, not tamper-*impossible*. External anchoring (snapshots,
   published receipts, `provenance`) remains the answer for hostile-host
   threats, exactly as THREAT-MODEL.md states.
2. Records appended after the last receipt (recovery notes; in-flight resumed
   work) are completeness-covered only up to the receipt's prefix; an open
   run makes no completeness claim (`complete: null`) because it is not
   finished — "a run is not finished until it has a receipt."
3. Journals written by engines ≤ v0.1.13-rc1 (before this change) verify
   unchanged: closed ones already end with a receipt (V1/V2 hold retroactively
   — the invariant was true, just unenforced); in-flight ones anchor when they
   close.

## 7. Cost

~60 lines across four files, one E-code, one test suite. No new commands, no
flags, no migrations, no dependencies, no performance-relevant change (two
comparisons on data the verifier already parsed).

---

*DESIGN OF RECORD — implementation follows this document exactly.*
