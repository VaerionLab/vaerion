# Demo 3 — The Replay Machine

**Proves**: same input creates same verified execution — deterministic
build, byte-identical artifacts, a verifier that refuses tampering.

Every command below was executed end-to-end against the published
`vaerion@0.1.13-rc1` package. Your digest values will differ from the
ones shown (they depend on your config fingerprint); the *identity of
your two builds* will not.

## The idea

`vae package build` folds the declared inputs into a `.vxn` bundle:
canonical-JSON manifest, payload compressed at a pinned level (zstd 19),
entries in strict ascending path order, blake3 digest per entry. Nothing
in the pipeline depends on wall-clock time, hostname, or user — so
identical inputs produce **identical bytes** (the P2 determinism law,
ADR-0016). `vae package verify` is the pure check: it recomputes every
digest and compares every pin, and **never executes content**.

## Run it

```sh
# 1. provision (same canonical workspace — it declares package inputs)
cp -r examples/vaerion/demo-workspace replay-machine && cd replay-machine
mkdir -p .vaerion/journal .vaerion/blobs

# 2. build the bundle twice
vae package build
vae package build --out second.vxn
sha256sum .vaerion/package/vaerion-demo.vxn second.vxn

# 3. let the engine judge the artifact
vae package verify .vaerion/package/vaerion-demo.vxn
vae provenance .vaerion/package/vaerion-demo.vxn

# 4. the tamper game: flip ONE byte and watch trust fail loudly
cp .vaerion/package/vaerion-demo.vxn tampered.vxn
printf 'X' | dd of=tampered.vxn bs=1 seek=200 conv=notrunc 2>/dev/null
vae package verify tampered.vxn; echo "exit=$?"
```

## Expected output (measured, trimmed)

```text
$ sha256sum .vaerion/package/vaerion-demo.vxn second.vxn
627ad895c14d15934e8cbcc2dca284e6f1b1817975f575e4bed2e0fc9d24fed6  .vaerion/package/vaerion-demo.vxn
627ad895c14d15934e8cbcc2dca284e6f1b1817975f575e4bed2e0fc9d24fed6  second.vxn
>>> BYTE-IDENTICAL
```

```text
$ vae package verify .vaerion/package/vaerion-demo.vxn
  summary: package verify .vaerion/package/vaerion-demo.vxn:
           VERIFIED (0 finding(s), 3/3 entries, 0 pins)

$ vae provenance .vaerion/package/vaerion-demo.vxn
entries: 3
entries_verified: 3
bytes: 1682
checks_passed:
  0: structure: magic VXN1, canonical manifest, compression pin
  1: payload-size
  2: payload-digest
  3: payload-uncompressed-size
  4: entry-stream-exhausted
  5: entry-digests (3 verified)
findings: []
```

The tamper leg — one flipped byte:

```text
$ vae package verify tampered.vxn
  summary: package verify tampered.vxn: NOT VERIFIED (1 finding(s), …)
exit=5
```

## What just happened

1. Two builds, same inputs → **identical sha256**. Nothing in the
   pipeline reads the clock; the manifest is canonical; compression is
   pinned. Determinism is a property of the mechanism, not a hope.
2. `package verify` recomputed every digest and compared every pin —
   executing nothing — and reported `VERIFIED`.
3. `provenance` re-derived the evidence from the bytes alone: structure,
   sizes, digests — 6/6 checks passed, `findings: []`.
4. One flipped byte → `NOT VERIFIED`, exit 5. The check refuses without
   executing the corrupted content. Evidence fails *loudly*, never
   silently.

**A subtlety worth knowing**: each build also writes a journal record
(journals are history — they carry timestamps, so their head hashes
differ per build). The **bundle** is the time-free artifact: its bytes
are what reproducibility guarantees. Journals record *that* something
happened; bundles prove *what* was produced.

## Where to go next

- The `.vxn` format and packaging law:
  [`docs/guides/verification.md`](../../docs/guides/verification.md) ·
  ADR-0016 (`docs/adr/`)
- The signed release trust chain (the same idea at distribution scale):
  [`docs/getting-started/installation.md`](../../docs/getting-started/installation.md)
- The positive path: [`../verifiable-agent/`](../verifiable-agent/)
