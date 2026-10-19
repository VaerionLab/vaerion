# Installing Vaerion

The fastest measured path; every alternative with its honest status
lives in [`../INSTALL.md`](../INSTALL.md) (the full channel map).

## Recommended — npm (measured, live)

**Prerequisite: [Bun](https://bun.sh) 1.3+.** The engine executes on the
Bun runtime; without it, `vae` refuses with a taught error (exit 2)
that names the exact fix.

```sh
curl -fsSL https://bun.sh/install | bash    # only if Bun is missing
npm install -g vaerion@rc
vae --version                               # → vae 0.1.14-rc1 (see the note below)
```

- **Version note (honest):** LIVE BUT LAGS — the npm registry delivers
  `0.1.14-rc1` on `rc`+`latest` until the `0.1.15` publish executes
  (Founder-gated; measured 2026-10-19) — an older engine missing `vae verify` /
  `create` / `start` / `mcp`; this command does **not** yield `vae 0.1.15`
  today. For the current engine, install from source (`bun install` in a
  clone, then `bun run packages/vaerion/src/cli/vae.ts`), use PyPI
  (`pip install vaerion` — live at `0.1.15`), or use the signed release set.
- `@rc` is the release-candidate channel. Plain `npm install -g vaerion`
  resolves to the same version today.
- No account, no telemetry, no network use at runtime unless you
  explicitly invoke a model provider through the gateway.
- No sudo? npm prefix fallback:
  `npm config set prefix ~/.npm-global` and add `~/.npm-global/bin` to
  your `PATH`.

Verify the install: `vae --help` (the whole surface, always current) ·
`vae doctor` (config, journals, blobs, audit chain — no phone-home).

## Alternative — signed release tarball (offline, no account)

Every release ships a full signed artifact set:
[github.com/VaerionLab/vaerion/releases](https://github.com/VaerionLab/vaerion/releases)
— source tarball, `vaerion-demo.vxn`, `SHA256SUMS`,
`MANIFEST.json` + `MANIFEST.json.sig`, `release-signing.pub`,
`dist-report.json` (the packer's own gate record), and
`VERIFY.md` (the consumer instructions).

The anonymous three-leg verification, exactly as a fresh consumer runs
it:

```sh
sha256sum --check SHA256SUMS                       # leg 1: integrity
bun run vaerion-<version>/tools/dist-verify.ts \
  --manifest MANIFEST.json --sig MANIFEST.json.sig --pub release-signing.pub   # leg 2: engine verifier
base64 -d MANIFEST.json.sig > sig.raw
openssl pkeyutl -verify -pubin -inkey release-signing.pub \
  -rawin -sigfile sig.raw -in MANIFEST.json        # leg 3: independent implementation
```

## Alternative — from source (the audit path)

```sh
git clone https://github.com/VaerionLab/vaerion.git vaerion && cd vaerion
bun install --frozen-lockfile
bun run tools/verify.ts            # all gates must be green
alias vae="bun run packages/vaerion/src/cli/vae.ts"
```

## Channel status (honest labels)

| Channel | Status |
|---|---|
| npm (`npm install -g vaerion@rc`) | **LIVE** — `0.1.14-rc1` on registry.npmjs.org, consumer-verified |
| GitHub Releases (signed tarball) | **LIVE** — three-leg anonymous verification documented |
| From source | **LIVE** — how the repository verifies itself |
| PyPI (`pip install vaerion`) | **published — `vaerion 0.1.15` live** (sdist + wheel, venv-verified) |
| Debian / RPM / AppImage / Homebrew | authored; packaging-host verification pending |
| Windows (winget / Chocolatey / Scoop) | authored; native-host verification pending |
| Universal installer (`vaerion.dev/install`) | install/update/uninstall verified end-to-end; the domain is not live yet |

## What installation does NOT do

- No global daemons, background services, or launch agents.
- No telemetry — the config guard accepts exactly one value:
  `telemetry.enabled: false`.
- No writes outside your workspace (`.vaerion/`, `vaerion.lock`) and
  the install prefix you chose.

Next: [`quickstart.md`](quickstart.md) — first verified run in under
10 minutes.
