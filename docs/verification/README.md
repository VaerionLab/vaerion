# Verification — prove it yourself

Vaerion's law is **evidence, not promises** — so every trust claim ships with a
command that checks it.

## Verify a run

```sh
vae journal verify <run_id>
```

Recomputes the blake3 chain, checks sequence integrity, and reports:

```
ok: true · records: 14 · events: 10 · torn: false · headHash: 5d85a840…
```

Exit 0 = evidence holds. Any tampering → torn chain → non-zero exit.

## Verify the environment

```sh
vae doctor
```

14 checks: config, workspace, journal health, runtime, and more — exit 0 when the
machine is trustworthy for runs.

## Verify the engine itself (the 9-gate battery)

The repository carries its own verification battery,
[`tools/verify.ts`](../../tools/verify.ts):

> typecheck ×2 · full test suite · coverage ratchet · layer lint · constitutional
> checks · performance gates · accessibility labels · eslint — **9 gates, one
> command, `bun run tools/verify.ts`**.

This is the same battery that gates releases; it runs in CI on every push
(`verify.yml`, SHA-pinned).

## Verify a release artifact

Release artifacts ship with `VERIFY.md` instructions and are signed; the public
half of the release-signing key is in-tree at
[`keys/release-signing.pub`](../../keys/release-signing.pub), and the ceremony is
specified in [`docs/security/SIGNING-CEREMONY.md`](../security/SIGNING-CEREMONY.md).

## Verify a stranger's claim

Reproduce their run: same manifest, same inputs → same events → same hashes.
Determinism is what makes reproduction a proof. Start at
[quickstart](../quickstart/README.md).
