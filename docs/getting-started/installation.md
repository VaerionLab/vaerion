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
vae --version                               # → vae 0.1.14-rc1
```

- `@rc` is the release-candidate channel of record
  (`v0.1.14-rc1`). Plain `npm install -g vaerion` resolves to the same
  version today.
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
`MANIFEST.json` + `MANIFEST.json.sig`, `release-signing.pub`, and
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
| PyPI (`pip install vaerion`) | authored + venv-verified; publication pending |
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
