# Installation

## Requirements

- **Bun `1.3+` (tested floor; the npm launcher accepts `>= 1.2.0` per the `engines` field)** — the engine runs on Bun. If you launch `vae` under node, it
  refuses with an educated `E1600` error and shows you how to install Bun instead
  of failing cryptically.
- Linux, macOS, or Windows (WSL2). No account, no network key, no telemetry.

## Path 1 — npm (live) or PyPI (live)

```sh
pip install vaerion        # PyPI — live: vaerion 0.1.15 (sdist + wheel)
# or
npm install -g vaerion    # npm — LIVE: vaerion 0.1.15 under dist-tag latest
vae --version             #   (published 2026-10-21, measured on registry.npmjs.org)
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
and open one channel at a time (Founder-gated; npm itself is live at `0.1.15`).

## Verify the install

```sh
vae --version   # vae 0.1.15
vae doctor      # environment checks, exit 0 when healthy
```

A measured, command-by-command walkthrough of the whole journey lives in
[`docs/QUICKSTART.md`](../QUICKSTART.md). (The screenshot-backed walkthrough is
not part of the public tree.) The full reference, including update and
uninstall, is [`INSTALL`](../INSTALL.md).

## Trust note

The npm package is a self-contained shim: it bundles the engine source and refuses
to run on the wrong runtime. Its manifest, dependencies, and pack output are
audited in the release readiness report of each release train.
