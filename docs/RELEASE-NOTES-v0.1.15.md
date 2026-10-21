# Release Notes — v0.1.15

**Vaerion v0.1.15 — the first stable release (GA).** Published 2026-10-17 under
the Founder's written GO (the Phase-67 release train; the Founder Release
Operations Manual is the procedure of record).

v0.1.15 promotes the `v0.1.15-rc1` release candidate to General Availability.
The GA engine is the rc engine with exactly one deliberate source change —
the version literal itself (`ENGINE_VERSION` → `0.1.15`) — plus the
documentation truth-sweep corrections this train landed (see `CHANGELOG.md`).
The candidate ran through the full public cycle — signed GitHub Release
(8 assets, Ed25519 signature + digests verified), PyPI publication
(sdist + wheel), hosted site, and CI verification on the public tree — and no
engine defect surfaced that required code changes.

## What Vaerion is

Vaerion runs AI-assisted work the way a database engine runs transactions:
every step lands on one versioned event spine, journals are append-only and
blake3-chained, permissions pass through a fail-closed broker, and every
claim is verifiable from the artifact itself — `vae verify` recomputes the
hash chain and refuses on any gap (E1010, the completeness anchor).

## Highlights (all carried from the verified rc)

- **The verification layer**: `vae verify` — workspace-scale journal proof
  with honest per-check findings; `E1010` guarantees "nothing was removed
  from the middle of a closed journal".
- **The engine**: deterministic, local-first execution for agents, workflows
  and the research pipeline — 29 dispatch commands, 7 workspace templates,
  82-code E-catalog, 8 JSON Schemas, spec-current OpenAPI.
- **The honest gateway**: single sanctioned egress, micro-USD metering,
  budgets, secret shapes never journaled; deterministic MockBrain provider
  for hermetic demos (no keys needed).
- **Provenance you can hold**: reproducible `.vxn` packages (byte-identical
  rebuilds proven by test), Ed25519-signed release manifests, anonymous
  three-leg verification (sha256 → engine verifier → independent openssl).
- **Measured quality**: 9/9 verification gates green — 719 tests, 5,246
  expectations, 62 test files, coverage ratcheted to measured floors
  (86.75% lines / 89.64% branches), 116 engine files byte-parity-checked
  against the packed artifact.

## Channels at GA (measured 2026-10-17 during the release train)

| Channel | State at rc | GA state (measured) |
|---|---|---|
| GitHub Releases | **LIVE** — signed `v0.1.15-rc1` set (8 assets) | **LIVE** — signed `v0.1.15` set (8 assets) |
| npm (`vaerion`) | lags: the rc-era engine on `rc` + `latest` | **LIVE** — `0.1.15` under dist-tag `latest`, published 2026-10-21 (parity-proven before publish) |
| PyPI (`vaerion`) | **LIVE** — `0.1.15rc1` (sdist + wheel) | **LIVE** — `0.1.15` (sdist + wheel) |
| npm (`@vaerion/sdk`) | unpublished (deliberate) | unchanged — unpublished (deliberate) |
| crates.io / Maven Central | absent (email gate / deferred) | unchanged — deferred, honestly labeled |
| Homebrew / winget / dmg / rpm | authored, UNVERIFIED host-gated | unchanged — authored, UNVERIFIED host-gated |
| Hosted site | **LIVE** — vaerion.vercel.app | **LIVE** — redeployed with GA facts **(erratum, measured 2026-10-21: the redeploy did not execute — the live site still serves the `v0.1.15-rc1` epoch, deploy of record 2026-10-17T01:10Z, per the post-deploy verification matrix of `docs/WEBSITE_DEPLOYMENT.md`; the GA-content redeploy remains Founder-gated, residual P4)** |

> **Publish of record (npm, measured 2026-10-21):** the npm row above and
> the `npm install -g vaerion` line in the Install block below are now
> measured registry truth — the npm registry delivers `vaerion 0.1.15`
> under dist-tag `latest` (published 2026-10-21). PyPI (`0.1.15`) and the
> signed GitHub Release are live. (The 2026-10-19 erratum that recorded
> the GA-day intent as pending is superseded and kept as history in the
> git record.)

## Install (GA)

```sh
npm install -g vaerion         # npm — current engine, dist-tag latest (published 2026-10-21)
# or:
pip install vaerion            # PyPI — current engine
# or the signed set:
#   github.com/VaerionLab/vaerion/releases → v0.1.15
#   verify: sha256sum -c SHA256SUMS, then tools/dist-verify.ts
# or from source:
git clone https://github.com/VaerionLab/vaerion && cd vaerion
bun install --frozen-lockfile
alias vae="bun run packages/vaerion/src/cli/vae.ts"
```

Upgrade from `0.1.14-rc1` or `0.1.15-rc1`: same commands, no migration
steps — journals and workspaces from rc builds replay byte-identically on
the GA engine (compatibility re-tested at each rc; see `CHANGELOG.md`).

## Verification instructions (consumer)

1. `sha256sum -c SHA256SUMS` — integrity (7/7 assets).
2. `bun tools/dist-verify.ts --dir <assets> --manifest MANIFEST.json --sig
   MANIFEST.json.sig --pub release-signing.pub` — signature + manifest.
3. `openssl pkeyutl -verify -pubin -inkey release-signing.pub ...` —
   independent leg (no engine code involved).
4. `vae verify` in any workspace — the engine proves its own journals.

## Honest limitations at GA (unchanged, stated)

- SDK registries (npm `@vaerion/sdk`, crates.io, Maven Central): unpublished
  — Founder-gated; the SDKs ship from source today.
- Single-binary channels (Homebrew/winget/dmg/rpm): authored, UNVERIFIED
  host-gated.
- `vaerion.dev`: domain provisioning pending; vaerion.vercel.app is the
  hosted surface of record.
- Full list with measured status: `docs/LIMITATIONS.md`.
