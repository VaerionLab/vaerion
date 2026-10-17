# VaerionLab — Organization Profile README

> Ready to paste into the `VaerionLab/.github` repository
> (`profile/README.md`). Status: DRAFT — Founder approval required before
> the repo is created or published. Migrated from the falconxa0-commits
> draft in Phase 13 (Task ID 15); content otherwise unchanged.

# VaerionLab

**The home of Vaerion — local-first trust infrastructure for AI agents.**
Every run leaves a blake3-chained journal and a verifiable receipt.
Nothing acts without authority. Identical inputs build byte-identical
bundles. Zero telemetry, enforced mechanically.

---

## Pinned repositories

| Repo | Why it is pinned |
|---|---|
| `vaerion` | The engine and the `vae` CLI — the only product repo today |
| `.github` | This profile: the org's status surface and contact points |
| `homebrew-vaerion` *(planned — Founder-gated)* | Tap, pending Founder provisioning |
| `scoop-bucket` *(planned — Founder-gated)* | Windows bucket, pending Founder provisioning |

Planned repos are listed as planned. They are not created until their
Founder packet executes (`docs/founder/FOUNDER-PACKETS.md` §B).

## Trusted-builder line

Every commit on `main` passes all 9 verification gates — branch
protection enforces the required check, linear history is on, force
pushes and deletions are disabled. Every release artifact set is
Ed25519-signed and ships with `VERIFY.md`, which teaches three
verification legs (sha256 → engine verifier → openssl cross-check).

## Honest status

| Surface | Status |
|---|---|
| Engine | `0.1.15-rc1` — release candidate (prerelease) |
| Verification | 9/9 gates green · 719 tests / 0 failed · 5,246 expectations |
| GitHub Releases | Live — signed artifacts: https://github.com/VaerionLab/vaerion/releases |
| npm | Live on the `rc`/`latest` channels at `0.1.14-rc1`; the Founder-gated `0.1.15-rc1` publish awaits a publish-capable npm token |
| PyPI | **Published** — `vaerion 0.1.15rc1` (sdist + wheel), measured live on pypi.org 2026-10-17 |
| vaerion.dev installer | Not live — domain provisioning pending (Founder-gated); measured unreachable 2026-10-17; `https://vaerion.vercel.app` is the live canonical of record |
| Community | GitHub Discussions (announcements, Q&A, ideas, show and tell); Discord planned (pending Founder provisioning) |

## Contact

- **General:** `auren@vaerion.dev`
- **Security:** private disclosure only — see
  [`SECURITY.md`](https://github.com/VaerionLab/vaerion/blob/main/SECURITY.md)
  in the main repository. Never open a public issue for a security
  finding.
- **Conduct:** [`CODEOWNERS`](https://github.com/VaerionLab/vaerion/blob/main/.github/CODEOWNERS)
  and [`CODE_OF_CONDUCT.md`](https://github.com/VaerionLab/vaerion/blob/main/CODE_OF_CONDUCT.md)
  govern all project spaces.

Copyright (c) 2026 Auren. Apache License 2.0.
