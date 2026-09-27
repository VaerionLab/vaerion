# Concepts — Runtime & Determinism

Why Vaerion runs are resumable, replayable, and reproducible. Deep
records: ADR-0006 (journal folds), ADR-0012 (hermetic AI), ADR-0016
(reproducible bundles) in [`../adr/`](../adr/).

## State is a fold, not memory

Run state is recomputed from the journal:
`state = R_n(…R_2(R_1(S_0)))`. The journal is the source of truth; a
run's "current state" is a fold over its records. Consequences:

- **Crash safety**: after a crash, replay recomputes state; completed
  work is skipped, never re-executed. The chaos suite SIGKILLs runs at
  randomized indices to prove it (`tests/chaos/chaos.test.ts`).
- **Resume across restarts**: `vae resume RUN_ID` restores a run —
  including runs paused at a human gate. Open `awaiting_gate` journals
  are states, so approvals survive process death.
- **Snapshot equality**: snapshots pin `seq_at`; folding from a
  snapshot must equal folding from genesis — test-enforced.

## Determinism layers

1. **Deterministic execution** — workflow DAGs run in topological order
   with a lexicographic tie-break; node outputs are content-addressed
   into the blob store; the planner can run inline (a declared JSON
   plan) for fully hermetic runs.
2. **Hermetic AI** — `mockbrain` is a seeded virtual provider: no
   network, byte-identical outputs for the same seed. Gateway cassettes
   make provider-bound evals deterministic (ADR-0012).
3. **Reproducible artifacts** — `vae package build` folds declared
   inputs into a `.vxn` bundle: canonical-JSON manifest, pinned zstd-19
   compression, strict entry order, blake3 digests. Identical inputs →
   identical bytes. `vae package verify` recomputes everything and
   never executes content.

## The run engines

| Command | Engine | Close |
|---|---|---|
| `vae run research --sources P --query Q` | the research pipeline: broker decision per source → fingerprint → fence → blob CAS → evidence → index → citations → context pack | snapshot + receipt |
| `vae run demo [--sources] [--query]` | the same pipeline with demo defaults | same |
| `vae run agent --goal TEXT --planner inline --plan-json …` | the supervised agent loop: every step (model, tool, note) crosses its constitutional path | receipt; bounded retries; resumable |
| `vae run workflow --dag FILE [--resume RUN_ID]` | deterministic DAG execution on the journal | receipt; interrupted runs resume automatically |
| `vae run model --model P/M --prompt TEXT` | model invoke through the gateway single gate | metered receipt |

## Honest boundaries

Determinism covers the engine's own machinery. Anything that crosses
the model gateway consumes provider compute and inherits provider
variance unless you use the seeded hermetic provider or cassettes.
`--seed` and `--json` (stable machine output) exist precisely to make
reproduction a command-line affair. What is not yet deterministic is
documented in [`../LIMITATIONS.md`](../LIMITATIONS.md).

Next: [journals.md](journals.md) — the hash chain underneath it all.
