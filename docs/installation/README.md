# Installation

## Requirements

- **Bun `>= 1.3`** — the engine runs on Bun. If you launch `vae` under node, it
  refuses with an educated `E1600` error and shows you how to install Bun instead
  of failing cryptically.
- Linux, macOS, or Windows (WSL2). No account, no network key, no telemetry.

## Path 1 — npm (recommended once the registry release train opens)

```sh
npm install -g vaerion
vae --version
```

## Path 2 — from source (works today)

```sh
git clone https://github.com/VaerionLab/vaerion.git
cd vaerion
bun install
bun run packages/vaerion/src/cli/vae.ts --version
```

## Path 3 — containers

A `Dockerfile` rides in the repository root; a dev container lives in
`.devcontainer/`. Platform packages (Homebrew, winget, chocolatey, scoop, snap,
flatpak, deb, rpm, dmg, pkg) are rehearsed under [`packaging/`](../../packaging/README.md)
and open one channel at a time after the npm release train.

## Verify the install

```sh
vae --version   # vae 0.1.13-rc1
vae doctor      # environment checks, exit 0 when healthy
```

A measured, screenshot-backed walkthrough of the whole journey lives in
[`docs/launch/installation-walkthrough.md`](../launch/installation-walkthrough.md).
The full reference, including update and uninstall, is [`INSTALL`](../INSTALL.md).

## Trust note

The npm package is a self-contained shim: it bundles the engine source and refuses
to run on the wrong runtime. Its manifest, dependencies, and pack output are
audited in the release readiness report of each release train.
