# Tutorial 1 — Init and the first run

Hour one with Vaerion. By the end you will have scaffolded a workspace,
executed a fully journaled local research run, verified its hash chain, and
reconstructed its narrative — all offline.

Everything runs through the `vae` CLI. From a checkout:

```bash
bun install
alias vae="bun run packages/vaerion/src/cli/vae.ts"
```

Every command takes `--json` (stable NDJSON for machines) and `--dry-run`
(plan only, zero side effects). Exit codes are honest and stable:
`0 ok · 1 internal · 2 usage · 3 broker-denied · 4 provider-down ·
5 partial-with-repair-hint`.

## 1. Scaffold a workspace

```bash
vae init --name my-first-workspace
```

This writes `vaerion.yaml` (the strict-schema config — unknown keys are
rejected by law) and creates `.vaerion/` with the journal and blob
directories. `vae init` refuses to overwrite an existing config; use
`--dry-run` to preview the plan without writing anything.

## 2. Run the demo

From the **repository root** (the demo's default sources are
`./docs/constitution` and `./docs/adr`):

```bash
vae run demo
```

What just happened, in order:

1. The declared local sources were read and fingerprinted.
2. **One broker decision per source** was requested (`research.fetch`),
   evaluated against the permission graph and policy, and journaled.
3. Content was fenced (untrusted-input discipline), stored in the blob CAS,
   and turned into evidence records.
4. The local BM25 index was built; a query ran; citations were produced.
5. A context pack closed the run, a snapshot was taken, and the run **sealed
   with a receipt** computed from the journal.

## 3. Look at the evidence

```bash
vae journal ls                    # one line per run journal
vae journal show RUN_ID           # the records
vae journal verify RUN_ID         # recompute the blake3 chain
vae explain RUN_ID                # the narrative
```

`vae explain` reconstructs the run from the journal alone — decisions, gates,
events, and the receipt. Nothing outside the journal is consulted; if the
chain does not verify, explain refuses (exit 5).

## 4. Prove the honesty

```bash
vae doctor
```

Doctor verifies config validity, every journal's chain, every referenced
blob, evidence↔blob↔fingerprint triangulation, the audit ledger, the refusal
log, and prints the gateway capability matrix (secret **names** only). It
performs no network access and resolves no secret values — zero telemetry is
constitutional, not a setting.

## 5. Machine mode

```bash
vae run demo --json | tee run.ndjson
vae doctor --json
```

`--json` emits one JSON object per line — the same events the daemon streams
over SSE, byte-compatible with the journal's envelope encoding.

## Pitfalls

- **Running `run demo` outside the repository root** fails with E2204-style
  input errors: the default declared sources do not exist there. Declare your
  own `research.capabilities` in `vaerion.yaml` (see
  [Research and intel](../guides/research-and-intel.md)).
- **Hand-editing `vaerion.yaml` with unknown keys** is rejected loudly
  (E1202) — the schema is the contract; see
  `spec/schemas/vaerion-yaml.schema.json`.
- **Deleting `.vaerion/` deletes the evidence.** The journal is the truth;
  there is no other store to recover from (by design — see
  [Checkpoint math](../concepts/checkpoint-math.md)).
- A **prompt policy rule pauses** a run with a durable human gate (exit 0,
  status awaiting). That is not a crash: resolve it with
  `vae resume RUN_ID --answer '{"approved":true}'` (see
  [Your first agent](02-first-agent.md)).
