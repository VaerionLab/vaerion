# Concept — Checkpoint math

*(grounded in ADR-0006 event-sourced run journals / checkpoint chaining, and
the chaos suite that guards it)*

A run's state is a **fold** over its journal records:

```
state = R_n( R_{n-1}( ... R_1( S_0 ) ... ) )
```

where each `R_i` is a pure reducer step applied in journal order and `S_0`
is the initial state. Nothing else defines "where the run is" — not process
memory, not a status file. This one equation buys the whole durability story:

- **Crash safety.** After any kill, `state` is recomputed by replaying the
  journal. Completed work is skipped, never re-executed (workflow resume
  folds completed nodes out).
- **Snapshots.** A `snapshot` record pins `seq_at` — replay may start from
  the snapshot's state and fold forward. The fold result must equal the full
  replay's result; that equivalence is test-enforced.
- **Hash chaining.** Each record commits to the previous (blake3; genesis is
  zeros). Any tampering or truncation breaks the chain and verify refuses —
  so the fold's *input* is provably the same input the writer saw.
- **Torn tails.** A crash mid-append can leave a torn final record.
  Recovery truncates **only** the torn tail and re-seals with an auditable
  note — a decision recorded on the journal, never a silent rewrite.
- **Open journals are states too.** An `awaiting_gate` run deliberately
  leaves its journal open; the gate is part of the folded state, which is
  why human approvals survive restarts.

The chaos suite (SIGKILL at randomized envelope indices) asserts the
invariants continuously: journals replay cleanly, pending gates restore
exactly, no orphaned locks. Determinism plus content-addressed outputs means
"resume" is not "retry and hope" — it is arithmetic.
