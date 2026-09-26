# Guide — Packaging

Reproducible bundles (ADR-0016): identical inputs produce **byte-identical**
`.vxn` artifacts — proven by test, not asserted. Import/verify are pure
checks that never execute package content.

## Declaring a package

```yaml
package:
  include:
    - docs              # directories carry every file under them recursively
    - prompts/p.md      # files carry themselves
  # out: dist/my.vxn    # optional path override
```

## Building

```bash
vae package build            # writes the bundle + regenerates vaerion.lock
vae package build --dry-run  # computes the fold in memory; writes NOTHING
vae package build --out custom.vxn
```

The build is a **pure fold over declared inputs** plus every declared
extension artifact (each pin-verified before it is bundled — E2100; a
mismatched artifact is never distributed, exactly as it is never executed).
No wall-clock, no ambient paths, no globs. Two builds on two machines with
the same inputs and toolchain yield the same bytes (the format version lives
in the magic, so a toolchain change is a loud format change, never a silent
rebuild).

The build run is journaled (`package.built`) and closes with a receipt.

## The seal: vaerion.lock

`vaerion.lock` is a **generated, committed, never hand-edited** canonical-JSON
seal: the config fingerprint, the extension pins, and the bundle digest, size
and entry list. The yaml → lock → spec chain is cross-checked by
`vae doctor` (E2205 on drift).

## Verifying

```bash
vae package verify path/to/bundle.vxn
```

The pure check: every digest recomputed; manifest pins compared **both
directions** against `vaerion.yaml` AND `vaerion.lock` (the digest-swap
defense, E2202); lock cross-checked; per-check findings reported honestly.
Content is **never executed**. Exit 0 verified; exit 5 with `E2206` +
findings when the bundle must be refused. The verify run is journaled
(`package.verified`) unless `--dry-run` or the workspace is config-less
(format-only verification).

Findings taxonomy: `E2200` format/manifest law · `E2201` digest mismatch ·
`E2202` pin mismatch · `E2203` unsupported format (bad/newer magic) ·
`E2205` lock mismatch · `E2206` summary refusal.

## Over the wire

The daemon exposes the same operations — `POST /package/build` and
`POST /package/verify` (see `spec/openapi.json`). Both run the SAME shared
service the CLI runs (Machine Parity by construction) through the serial run
queue. Wire parity is test-proven: CLI builds and wire builds produce
byte-identical bundles and an identical `vaerion.lock`. A refused artifact
over the wire is an **honest HTTP 200** with `ok:false` + `E2206` + findings
— the request succeeded; the artifact failed.

## Engine distribution (this repository)

The engine's own installer pipeline (`packages/vaerion/scripts/dist-pack.ts`)
packs `@vaerion/engine` into an npm-layout tarball, enforces a files
inventory law (sources + README + package.json only), secret-scans every
packed byte, installs it with the real `bun install`, and smokes the
installed shim (help, version, init, doctor, dev, a mockbrain model call).
External channels (GitHub Releases, npm publish, Homebrew/winget) await a
ratified release process and network access — the pipeline refuses loudly
instead of pretending.
