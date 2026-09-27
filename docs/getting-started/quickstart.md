# Vaerion Quickstart — first proof in under 10 minutes

This guide takes you from nothing to a **cryptographically verified
run** and a **byte-identical reproducible bundle** in about 9 minutes.
Every command below was executed end-to-end on the published npm
package; the outputs shown are real (your ids and hashes will differ —
the shape and the `ok: true` will not).

Companion deep dive: [`docs/QUICKSTART.md`](../QUICKSTART.md) (the
extended 15-minute journey) · [`examples/README.md`](../../examples/README.md)
(three two-minute proofs).

---

## 0. Prerequisite — Bun 1.3+ (1 minute)

Vaerion executes on the [Bun](https://bun.sh) runtime. If `bun --version`
prints 1.3 or higher, skip ahead. Without Bun, `vae` refuses with a
taught error (exit 2) instead of a cryptic one — install it first:

```sh
curl -fsSL https://bun.sh/install | bash
bun --version          # ≥ 1.3
```

## 1. Install (1 minute)

```sh
npm install -g vaerion@rc
vae --version
```

Measured:

```text
vae 0.1.13-rc1
```

No account, no telemetry, no network calls — the install drops the
`vae` CLI and the engine on your machine. (No sudo? See
[`installation.md`](installation.md) for the user-prefix fallback.)

## 2. Create a workspace (1 minute)

```sh
mkdir hello-vaerion && cd hello-vaerion
vae init --template demo
```

Measured:

```text
command: init
template: demo
created:
  0: vaerion.yaml
  1: .vaerion/journal
  2: .vaerion/blobs
  3: sources/demo.md
config_fingerprint: ef2bade87823…
```

You now have: `vaerion.yaml` (the schema-validated project manifest —
unknown keys are rejected by law), `.vaerion/` (the local evidence
store), and `sources/demo.md` (a local document to index). Templates:
`minimal` (default) · `demo` · `agent`.

## 3. First verified run (2 minutes)

```sh
vae run demo --query "What guarantees does Vaerion make about evidence?"
```

Measured (trimmed):

```text
receipt:
  run_id: crn_run_01M3F2460N5TEREDSJX9HJRE49
  trace_id: t_x41hvnb5p9
  engine_version: 0.1.13-rc1
  counts:
    records: 13
    events: 10
    decisions_allow: 1
    decisions_deny: 0
    snapshots: 1
  blob_refs:
    0:
      alg: blake3
      hash: a1ca3c65d06d6fde…
  journal:
    records: 13
    head_hash: 7b5e8d78c56306e3…
  summary: indexed 1 documents; 1 hits for "What guarantees…"
journal_verified: true
```

What just happened: your local source was indexed (the broker allowed
the read — one `decisions_allow`), the query ran through the pipeline,
every step landed on the append-only journal, and the run closed with a
**receipt** folded from that journal. `journal_verified: true` means the
engine already re-checked its own hash chain on close.

## 4. Verify the proof yourself (2 minutes)

```sh
vae journal ls
# note the run_id — the crn_run_… value
vae journal verify <RUN_ID>
vae explain <RUN_ID>
```

Measured `journal verify`:

```text
report:
  ok: true
  path: .vaerion/journal/crn_run_01M3F2460N5TEREDSJX9HJRE49.ndjson
  records: 14
  maxSeq: 10
  headHash: bd6d3118893d9ae7…
  torn: false
  issues: []
```

`explain` reconstructs the run's narrative from the journal — decisions,
blobs, snapshots, gateway metering (zero here: nothing left your
machine) — and prints `verified: true`.

## 5. Prove determinism with your own hands (2 minutes)

Add a package block to `vaerion.yaml` (any editor, or):

```sh
cat >> vaerion.yaml <<'EOF'
package:
  include:
    - vaerion.yaml
    - sources
EOF
```

Build the bundle twice:

```sh
vae package build
vae package build --out second.vxn
sha256sum .vaerion/package/*.vxn second.vxn
```

Measured: **both digests identical** (`0b615da9f0dc342b…`,
2 entries, 1,233 bytes). Same inputs → same bytes — the P2 determinism
law, in your hands. Now let the engine judge it:

```sh
vae package verify .vaerion/package/hello-vaerion.vxn
# → VERIFIED (0 finding(s), 2/2 entries) — a pure check: digests are
#   recomputed, pins compared, content NEVER executed.
```

Want to see trust fail *loudly*? Flip one byte of a copy and re-verify —
the check refuses (exit 5, `NOT VERIFIED`), executing nothing. The
worked version of this game lives in
[`examples/replay-machine/`](../../examples/replay-machine/).

## 6. Health check (30 seconds)

```sh
vae doctor
```

Fourteen checks — config, journals, blobs, audit chain, gateway matrix —
no phone-home. Measured summary: `all checks green`.

## 7. Where to go next

- **Three two-minute proofs** — the Verifiable Agent, the Refused
  Action, the Replay Machine: [`examples/README.md`](../../examples/README.md)
- The guided, read-only engine tour: `vae tour`
- The full command surface: `vae --help` ·
  [`docs/reference/cli.md`](../reference/cli.md)
- When something refuses: [`docs/reference/errors.md`](../reference/errors.md)
  (exit codes 0–5, the E-code catalog, each with a Fix)
- The mental model: [`docs/concepts/`](../concepts/) — architecture,
  runtime, journals, security
