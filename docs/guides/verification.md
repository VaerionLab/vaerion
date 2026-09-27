# Guide — Verification & Proofs

Every way to make Vaerion *prove* something — from a single run's hash
chain to a signed release. Concept model:
[`../concepts/journals.md`](../concepts/journals.md) ·
[`../concepts/security.md`](../concepts/security.md).

## The ladder of proofs

| What you prove | How | Measured result |
|---|---|---|
| A run's journal is intact | `vae journal verify RUN_ID` | `ok: true, torn: false, issues: []` |
| A run happened as narrated | `vae explain RUN_ID` | `verified: true` + cause-chain narrative |
| The workspace is healthy | `vae doctor` | 14 checks, `all checks green`, no phone-home |
| An artifact is byte-true | `vae package verify BUNDLE` | `VERIFIED (0 finding(s), 3/3 entries)` |
| An artifact is what it claims | `vae provenance BUNDLE` | 6/6 checks recomputed from bytes, `findings: []` |
| Builds are deterministic | build twice, compare | identical sha256; flipped byte → exit 5 `NOT VERIFIED` |
| A release is authentic | the three-leg anonymous check | sha256sum + engine verifier + raw openssl — see below |

Worked versions of every row:
[`../../examples/replay-machine/`](../../examples/replay-machine/) ·
[`../../examples/verifiable-agent/`](../../examples/verifiable-agent/).

## Verify a run

```sh
vae journal ls                 # collect the run_id (crn_run_…)
vae journal verify RUN_ID      # recompute the whole blake3 chain
```

If a crash ever tears a tail, `vae journal recover RUN_ID` truncates
**only** the torn tail and re-seals with an auditable note — never a
silent rewrite.

## Verify an artifact

```sh
vae package build                       # reproducible .vxn + vaerion.lock seal
vae package verify .vaerion/package/<name>.vxn   # pure check: digests recomputed, pins compared, content NEVER executed
vae provenance .vaerion/package/<name>.vxn       # evidence recomputed from the bytes alone
```

The tamper game (measured): copy the bundle, flip one byte, re-verify —
`NOT VERIFIED`, exit 5, nothing executed.

## Verify the whole workspace

```sh
vae doctor        # config, journals, blobs, audit chain, gateway matrix
vae center        # operator cockpit: runs, metering, audit + refusal-log integrity
vae repo          # repository intelligence: branch, tree, identity audit (read-only)
```

## Verify a release (anonymous, three independent legs)

Every GitHub release carries `SHA256SUMS`, `MANIFEST.json` +
`MANIFEST.json.sig` (Ed25519), `release-signing.pub`, and `VERIFY.md`:

```sh
sha256sum --check SHA256SUMS                       # leg 1: artifact integrity
bun run vaerion-<version>/tools/dist-verify.ts \
  --manifest MANIFEST.json --sig MANIFEST.json.sig --pub release-signing.pub   # leg 2: engine verifier
base64 -d MANIFEST.json.sig > sig.raw
openssl pkeyutl -verify -pubin -inkey release-signing.pub \
  -rawin -sigfile sig.raw -in MANIFEST.json        # leg 3: independent implementation
```

Key custody, rotation, and recovery:
[`../security/SIGNING-CEREMONY.md`](../security/SIGNING-CEREMONY.md).
The npm package `vaerion@0.1.13-rc1` was published from the exact
sha256-verified artifact of record — registry bytes ≡ release bytes.

## CI is part of the law

`vae ci validate` checks that workflows structurally re-run the single
verification authority (`tools/verify.ts`) rather than re-implementing
it; `vae ci simulate --event tag` projects which jobs would run and
why. `vae release readiness` is the constitutional release evaluator —
fail-closed, honestly labeled (`VERIFIED` / `UNVERIFIED` /
`NEVER EXECUTED`).
