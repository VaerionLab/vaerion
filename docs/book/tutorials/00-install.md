# Installation

Install the Vaerion engine, prove the install, and learn the three command
laws (exit codes, `--json`, `--dry-run`) that every later tutorial assumes.

## Prerequisites

- **[Bun](https://bun.sh) ≥ 1.2** (the engine is developed and verified on
  Bun 1.3.x). Check with `bun --version`.
- A terminal. That is all — the engine is local-first: no accounts, no
  telemetry, no network required for anything in this tutorial.

## Option A — from a repository checkout

```bash
git clone <repository-url> && cd vaerion
bun install
alias vae="bun run packages/vaerion/src/cli/vae.ts"
```

The alias runs the CLI entry (`packages/vaerion/src/cli/vae.ts`) directly —
no build step, which is honest for a source checkout: what you read is what
runs.

## Option B — from the verified tarball (the installer pipeline)

The release artifact is produced by the reproducible installer pipeline
(`packages/vaerion/scripts/dist-pack.ts`): pack → file-inventory law →
secret scan of every packed byte → a real offline install → a smoke of the
installed shim. Until the GitHub Release channel is live, produce it
locally:

```bash
cd packages/vaerion
bun run scripts/dist-pack-cli.ts        # writes the tarball + dist-report.json
bun install --offline ./<tarball>.tgz   # the exact artifact the pipeline smoked
vae --help                              # the installed shim
```

## Prove the install (do not skip)

```bash
vae version          # → vae 0.1.7  (one line, zero ANSI)
vae --help           # the Daily Seven + serve + package, with examples
```

Then scaffold a workspace and run the local demo — no provider keys needed,
the seeded MockBrain provider (ADR-0012) is the hermetic demo path:

```bash
vae init myproject && cd myproject   # vaerion.yaml + .vaerion/journal + .vaerion/blobs
vae run demo                          # a research run through the full pipeline
vae journal verify                    # the blake3 hash chain holds
```

`vae doctor` gives the full picture (config, journals, blobs, audit,
gateway) and always ends with a repair hint if anything is off.

If you want a guided tour instead, the committed, test-proven example in
[`examples/vaerion/`](../../../examples/vaerion/README.md) is executed by
the engine's own test suite — every command in its README is known to work.

## The three laws every command obeys

1. **Exit codes are honest.** `0` ok · `1` internal · `2` usage ·
   `3` broker-denied · `4` provider-down · `5` partial-with-repair-hint.
   Scripts can trust them.
2. **Every command takes `--json`.** Machine output is newline-delimited
   JSON with stable shapes (the accessibility reference documents the
   contract; a gate proves zero-ANSI and parseability).
3. **Every command takes `--dry-run`.** Plans only, zero side effects — the
   number of side effects is part of the output, so "plan only" is provable.

## Troubleshooting

| Symptom | Meaning | Fix |
|---|---|---|
| `command not found: vae` | the alias lives in one shell | re-run the alias line, or add it to your shell profile |
| `no vaerion.yaml found — using ad-hoc config` | you are outside a workspace | `vae init` first, or run inside the project directory |
| install smoke fails in the tarball path | the pipeline refuses to fake green | read `dist-report.json`; it names the failing check |
| anything else | the engine speaks in stable codes | find the `E####` in [`spec/errors.yaml`](../../../spec/errors.yaml) — every entry carries a `Fix:` hint |

## Pitfalls

- **Do not run `vae serve` on a shared machine casually** — it is
  loopback-only by law and refuses non-loopback binds (`E2006`), but the
  pairing token still grants run authority to anyone on your machine.
- **Do not edit generated artifacts** (`llms.txt`, `spec/openapi.json`) —
  they are derived; a gate fails the tree if they drift.
- **Do not commit `.vaerion/` into shared repos** unless you intend to ship
  journals and blobs — they are your audit trail, and occasionally your
  data.

Next: [Init and the first run](01-init.md).
