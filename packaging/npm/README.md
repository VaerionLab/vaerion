# vaerion — npm distribution

`npm install -g vaerion` installs the `vae` CLI and the full engine source.
The engine executes on the Bun runtime (ADR-0018); the package declares
`engines: bun >= 1.2` and the launcher refuses the wrong runtime with an
educated error (exit 2), never a cryptic one.

```sh
npm install -g vaerion
vae --help            # help always teaches; never executes
vae doctor            # verify config, journals, blobs, audit chain
```

## What the package ships

| Path | Contents |
|---|---|
| `bin/vae.js` | Bun launcher → `engine/cli/vae.ts` `main()` |
| `engine/` | The complete engine source (self-contained TypeScript, layerlint-governed L0–L4) |

Runtime dependencies (declared): `hash-wasm` (blake3 content identity),
`yaml` (strict vaeryaml parsing).

## Build the publishable tarball

```sh
sh packaging/npm/make-package.sh          # assembles engine/ + `npm pack`
# -> dist/npm/vaerion-<version>.tgz (byte-verifiable via sha256sum)
```

npm `vaerion` is **published** — `0.1.15` under dist-tag `latest`
(published 2026-10-21); rebuilding locally reproduces the same package
for offline verification:

```sh
npm install -g --prefix <dir> vaerion-<version>.tgz
vae --version
```
