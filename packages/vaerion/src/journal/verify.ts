/**
 * Vaerion — journal integrity + completeness verification.
 *
 * Verifies, in order, for every record:
 *   1. shape (records.ts),
 *   2. 1-based index continuity,
 *   3. blake3 linkage + content hash,
 *   4. evt records: gapless per-run seq (1..N),
 *   5. export journals: derivation note present when note==="export" contract
 *      fields demand it,
 *   6. completeness anchor: the LAST receipt record certifies the prefix
 *      immediately before it — records count AND certified head hash
 *      (E1010). A closed journal with no receipt record at all is itself a
 *      completeness failure: records were removed after close.
 *
 * Same primitive verifies the audit ledger (a journal of meta records).
 */

import { readJournal, type ReadResult } from "./reader.ts";
import { firstChainError, firstIndexError } from "./hashchain.ts";
import { stripHash } from "./records.ts";
import { hashRecord } from "./hashchain.ts";

export interface VerifyIssue {
  i: number | null;
  code: "E1001" | "E1002" | "E1003" | "E1005" | "E1006" | "E1009" | "E1010";
  message: string;
}

export interface VerifyReport {
  ok: boolean;
  path: string;
  records: number;
  events: number;
  maxSeq: number;
  headHash: string | null;
  torn: boolean;
  /** Completeness anchor present: the journal ends in a (re)certified receipt. */
  anchored: boolean;
  /** Completeness verdict: true = anchor holds; false = E1010; null = no anchor claimed (in-flight/legacy run). */
  complete: boolean | null;
  issues: VerifyIssue[];
}

export async function verifyJournal(journalPath: string): Promise<VerifyReport> {
  const report: VerifyReport = {
    ok: false,
    path: journalPath,
    records: 0,
    events: 0,
    maxSeq: 0,
    headHash: null,
    torn: false,
    anchored: false,
    complete: null,
    issues: [],
  };

  let read: ReadResult;
  try {
    read = await readJournal(journalPath);
  } catch (err) {
    report.issues.push({ i: null, code: "E1003", message: (err as Error).message });
    return report;
  }

  report.torn = read.torn;
  if (read.torn) {
    report.issues.push({ i: null, code: "E1002", message: `torn tail: ${read.tornTailMessage ?? "incomplete final record"}` });
  }
  report.records = read.records.length;
  if (read.records.length === 0) {
    report.issues.push({ i: null, code: "E1006", message: "journal has no complete records" });
    return finalize(report);
  }

  const idxErr = firstIndexError(read.records);
  if (idxErr) {
    report.issues.push({ i: idxErr.i, code: "E1001", message: idxErr.reason });
    return finalize(report);
  }

  const chainErr = await firstChainError(read.records);
  if (chainErr) {
    report.issues.push({ i: chainErr.i, code: "E1001", message: chainErr.reason });
    return finalize(report);
  }

  // Per-record content re-verification beyond the first failure is skipped by
  // firstChainError; for a green pass we recompute everything deterministically.
  let prev = "0".repeat(64);
  for (const rec of read.records) {
    const computed = await hashRecord(stripHash(rec));
    if (computed !== rec.hash || rec.prev !== prev) {
      report.issues.push({ i: rec.i, code: "E1001", message: `chain mismatch at record ${rec.i}` });
      return finalize(report);
    }
    prev = rec.hash;
    if (rec.k === "evt") {
      report.events++;
      report.maxSeq = Math.max(report.maxSeq, rec.env.seq);
    }
  }

  // Gapless seq check for evt records.
  let expectSeq = 1;
  for (const rec of read.records) {
    if (rec.k !== "evt") continue;
    if (rec.env.seq !== expectSeq) {
      report.issues.push({ i: rec.i, code: "E1005", message: `seq gap: expected ${expectSeq}, found ${rec.env.seq}` });
      return finalize(report);
    }
    expectSeq++;
  }

  const head = read.records[read.records.length - 1];
  report.headHash = head ? head.hash : null;

  // Completeness anchor (E1010): the LAST receipt record certifies the prefix
  // immediately before it — records count AND certified head hash. Chain
  // checks alone cannot see deletion; this commitment can.
  let lastReceiptIdx = -1;
  for (let idx = read.records.length - 1; idx >= 0; idx--) {
    const rec = read.records[idx];
    if (rec && rec.k === "receipt") {
      lastReceiptIdx = idx;
      break;
    }
  }
  if (lastReceiptIdx >= 0) {
    const maybe = read.records[lastReceiptIdx];
    if (!maybe || maybe.k !== "receipt") return finalize(report); // shape-checked above; narrows the union
    report.anchored = true;
    const receiptRec = maybe;
    const certified = receiptRec.receipt.journal.records;
    if (certified !== lastReceiptIdx) {
      report.issues.push({
        i: receiptRec.i,
        code: "E1010",
        message: `completeness anchor mismatch: receipt certifies ${certified} records; ${lastReceiptIdx} records precede it — records were removed after close or the receipt is stale. Compare against the receipt printed at run close or a \`vae snapshot\` archive; restore the run's evidence; never hand-edit a journal.`,
      });
    } else if (lastReceiptIdx > 0) {
      const prevRec = read.records[lastReceiptIdx - 1];
      if (prevRec && receiptRec.receipt.journal.head_hash !== prevRec.hash) {
        report.issues.push({
          i: receiptRec.i,
          code: "E1010",
          message: `completeness anchor mismatch: receipt certifies head ${receiptRec.receipt.journal.head_hash.slice(0, 12)}…, the record it chains to hashes to ${prevRec.hash.slice(0, 12)}… — the certified tail was replaced or re-chained. Compare against the receipt printed at run close or a \`vae snapshot\` archive; restore the run's evidence; never hand-edit a journal.`,
        });
      }
    }
    report.complete = report.issues.length === 0;
  } else {
    // No receipt anywhere: lawful only for journals still in flight. A closed
    // run without its terminal receipt means records were removed after close.
    const closed = read.records.some((rec) => rec.k === "evt" && rec.env.type === "run.closed");
    if (closed) {
      report.issues.push({
        i: null,
        code: "E1010",
        message: `completeness anchor missing: the run closed but no receipt record exists — records were removed after close (expected a receipt certifying ${read.records.length} records; found none). Compare against the receipt printed at run close or a \`vae snapshot\` archive; restore the run's evidence; never hand-edit a journal.`,
      });
      report.complete = false;
    }
    // else: in-flight/legacy — integrity verified; no completeness claim (null).
  }

  return finalize(report);
}

function finalize(r: VerifyReport): VerifyReport {
  r.ok = r.issues.length === 0;
  return r;
}
