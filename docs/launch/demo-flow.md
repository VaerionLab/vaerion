# Demo flow — the first action, measured

Release candidate `v0.1.13-rc1` · captured 2026-09-25 · every byte below
is the engine's real output, unedited.

## 1 — Scaffold the governed workspace

```sh
vae init --template demo
```

```yaml
command: init
template: demo
dry_run: false
created:
  0: vaerion.yaml
  1: .vaerion/journal
  2: .vaerion/blobs
  3: sources/demo.md
config_fingerprint: 41c3410b862ac152f5d6176a5888686f9d649ab65ca0d55a7fcccdaa69d25ffc
engine_version: 0.1.13-rc1
```

`vae init` writes the workspace manifest, opens the journal and blob
store, and seeds `sources/demo.md`. Measured: **exit 0 in 96 ms**.

## 2 — Run the action

```sh
vae run demo --sources ./sources --query "determinism"
```

```yaml
command: run
kind: demo
run_id: crn_run_01M3DDZY13X91QSVVJYJ0JJ4FC
trace_id: t_vjyj0jj4fd
documents: 1
query: determinism
hits: 0
hits_detail:
  []
context:
  blocks: 1
  dropped: 1
  tokens_estimated: 35
  pack_fingerprint: c7709bfe1e52e42354da7025e347993ae8a056eff56b4b2fecc7e1c9d130e68b
receipt:
  run_id: crn_run_01M3DDZY13X91QSVVJYJ0JJ4FC
  trace_id: t_vjyj0jj4fd
  engine_version: 0.1.13-rc1
  config_fingerprint: 41c3410b862ac152f5d6176a5888686f9d649ab65ca0d55a7fcccdaa69d25ffc
  opened_at: 2026-09-25T23:21:46.278Z
  closed_at: 2026-09-25T23:21:46.294Z
  counts:
    records: 13
    events: 10
    decisions_allow: 1
    decisions_deny: 0
    decisions_prompt: 0
    gates_opened: 0
    gates_resolved: 0
    snapshots: 1
    recovery_notes: 0
  blob_refs:
    0:
      alg: blake3
      hash: a1ca3c65d06d6fde13bdaa3606e2196c6ac7d359ba863ca99c4a162612d77335
      size: 291
  journal:
    records: 13
    head_hash: e222e3b33a8fc4b56bfd279e67acfbff0d854df596a6581395d8ed24dfdabecc
  summary: indexed 1 documents; 0 hits for "determinism"
journal_verified: true
```

Measured: **exit 0 in 131 ms**. One broker decision admitted the run
(`decisions_allow: 1`); 13 records landed on the spine; the receipt was
folded from the journal; the run ends with `journal_verified: true`.

## 3 — Fail-closed, by the way

During recording, a mis-aimed run asked the broker for a grant the
workspace ceiling does not allow. The engine refused — and recorded it:

```text
E1300 permission ceiling: grant research.index over "./sources" to
"research:crn_run_…" exceeds the config ceiling
Fix: Inspect the recorded decision (`vae explain <trace>`); request the
narrowest needed grant in vaerion.yaml.
```

A refusal is evidence too. The engine does not guess, and it does not
proceed silently.

Next: [`receipt-verification.md`](receipt-verification.md) — prove the
record is intact.
