# Asset Manifest — release `v0.1.15` (General Availability)

> **FINAL — the 8 GA assets of record.** Measured via the unauthenticated
> GitHub releases API (`https://api.github.com/repos/VaerionLab/vaerion/releases`,
> GET-only, no token) on **2026-10-19T02:20Z** in the Era II synchronization
> program. (The first attempt this session hit the shared-IP 403 rate limit;
> the measurement above is the post-reset retry — verbatim API capture,
> nothing estimated.) Digests are not exposed by the API: every **sha256**
> cell is **inherited — measured 2026-10-18 by the Phase 63 Stage 7
> security/release-trust audit** (downloaded set + `sha256sum -c SHA256SUMS`
> → 7/7 OK + dual-leg Ed25519 verification), cross-checked here against the
> sizes the API returns today (all 8 match byte-for-byte).
>
> Release of record: `v0.1.15` — published **2026-10-17T23:40:16Z**,
> `prerelease: false`, **Latest**. Total: **8 assets, 17 downloads**
> (17 also matches the Phase 64 audit count).

## The 8 GA assets

| # | Asset | Size (B) | sha256 | Downloads | Download URL |
|---|---|---|---|---|---|
| 1 | `vaerion-0.1.15-source.tar.gz` | 20,990,889 | `ee08d058f750165953dac33a147e9d38440ae92b477bfde8e30d48aff0691f89` | 2 | `https://github.com/VaerionLab/vaerion/releases/download/v0.1.15/vaerion-0.1.15-source.tar.gz` |
| 2 | `SHA256SUMS` | 587 | — (the integrity manifest itself; its integrity is covered by the signed `MANIFEST.json`, which it in turn covers) | 2 | `https://github.com/VaerionLab/vaerion/releases/download/v0.1.15/SHA256SUMS` |
| 3 | `MANIFEST.json` | 1,599 | `1f30625b2463f415569848628b89a0e426ff21fe4c111f78abac99e82b93852d` | 3 | `https://github.com/VaerionLab/vaerion/releases/download/v0.1.15/MANIFEST.json` |
| 4 | `MANIFEST.json.sig` | 88 | `bdbcc9b9413b3b0b7adc382ecbc3bbf472bf5730db1c780a6d836ebedaeb7f62` | 2 | `https://github.com/VaerionLab/vaerion/releases/download/v0.1.15/MANIFEST.json.sig` |
| 5 | `release-signing.pub` | 113 | `c033b392eab5f9a316f9502278dcabd78a5375d1f20b4599c9d9a021bac47f4d` (= the tracked key of record `keys/release-signing.pub`, byte-identical) | 2 | `https://github.com/VaerionLab/vaerion/releases/download/v0.1.15/release-signing.pub` |
| 6 | `VERIFY.md` | 1,999 | `156211f39c616a703450c5f7694af7cee5cd864f8120b525b048c9284e3a1d0c` | 2 | `https://github.com/VaerionLab/vaerion/releases/download/v0.1.15/VERIFY.md` |
| 7 | `dist-report.json` | 1,566 | `4cba9e063b6a6e207e8a3ff07fe73cf9181c0bc7d439f9b15ae9d3fdcefc5748` | 2 | `https://github.com/VaerionLab/vaerion/releases/download/v0.1.15/dist-report.json` |
| 8 | `vaerion-demo.vxn` | 2,834 | `48c6ae6d52c348184542e76cb25825b659aa556d8c451c2fb21a529db70c5dd2` | 2 | `https://github.com/VaerionLab/vaerion/releases/download/v0.1.15/vaerion-demo.vxn` |

**Total: 8 assets · 20,999,675 B · 17 downloads** (per-asset sum = 2+3+2+2+2+2+2+2).

## What each asset is

| Asset | Role |
|---|---|
| `vaerion-0.1.15-source.tar.gz` | deterministic source distribution (`git archive` + `gzip -n`, built **twice and byte-compared** on every pack) |
| `SHA256SUMS` | standard `sha256sum --check` manifest — covers the 7 non-manifest assets (7/7 OK, exit 0) |
| `MANIFEST.json` | canonical sorted-key manifest: sizes + sha256 + blake3 per artifact, release version, commit `36e3da18f1662290745fe35082a15df9a49764fb`, gate record |
| `MANIFEST.json.sig` | **Ed25519** signature over the canonical manifest (self-verified by the packer; independently verified via openssl) |
| `release-signing.pub` | the Ed25519 public half — bound to the repository key of record by the publish tripwire (`cmp`, refuses otherwise) |
| `VERIFY.md` | one-page consumer verification instructions |
| `dist-report.json` | the audit packet: `gatesGreen: true`, timings, key provenance, reproducibility proof (generatedAt 2026-10-17T23:40:11Z) |
| `vaerion-demo.vxn` | the reproducible reference bundle (blake3 content identity, ADR-0016) |

## Provenance per cell

| Cell class | Provenance |
|---|---|
| Asset names, byte sizes, download counts, URLs, release metadata (published-at, prerelease flag, Latest) | **MEASURED NOW** — 2026-10-19T02:20Z, unauthenticated GitHub releases API (GET-only; tokenless; the 403 rate-limit fallback path documented above was not needed after reset) |
| sha256 per asset | **INHERITED — measured 2026-10-18 by Phase 63 Stage 7** ("Security / Release Trust Re-Verification (GA tree)", private-workspace report; its public evidence is `docs/ga/` + `VERIFICATION_EVIDENCE.md` in this packet). Cross-check at assembly: all 8 sizes match the API's current bytes exactly; digests were verified then by `sha256sum -c` (7/7), the engine `dist-verify` (signature + per-artifact sha256/blake3/bytes), and an independent openssl leg |
| blake3 digests (from the signed manifest: tarball `2773ef9b0d22bd51…`, demo.vxn `a6b5f8590214ecd9…`, pub key `f4c42ba7e4666726…`, VERIFY.md `642ecb4f7a2742f5…`, dist-report `f3d40e9b1f7c92ce…`) | **INHERITED** — Phase 63 Stage 7, recomputed by the engine from the signed manifest (not reproduced in full here; `MANIFEST.json` in the release set is the authority) |
| Download-URL liveness | **MEASURED NOW** — `curl -sSI` on the tarball URL → HTTP/2 302 → release CDN (attachment disposition, filename intact) |

## Companion artifacts (not in the release set)

| Artifact | Location | Status |
|---|---|---|
| npm publish input `vaerion-0.1.15.tgz` | built by `packaging/npm/make-package.sh` into `dist/npm/` (gitignored) | prepared, **unpublished** — npm delivers `0.1.14-rc1` until the Founder-gated publish (`NPM-PUBLISH-RUNBOOK.md`; Phase 63 measured its sha256 as `c6361622d2872c09…`) |
| PyPI `vaerion 0.1.15` (sdist + wheel) | pypi.org/project/vaerion | LIVE — 2026-10-17T23:43:28Z |
| This packet `release/v0.1.15/` | the repository | the GA packet of record (CHANGELOG.md cites `release/v0.1.15/RELEASE-NOTES.md`) |

> Update 2026-10-21: Path A executed — npm `vaerion` 0.1.15 published under dist-tag `latest` (the npm row above is the frozen verification-day record; `NPM-PUBLISH-RUNBOOK.md` is the executed procedure).

## Release-history context (measured now, same API capture)

| Release | Published | Assets | Downloads |
|---|---|---|---|
| **v0.1.15 (GA, Latest)** | 2026-10-17T23:40:16Z | 8 | 17 |
| v0.1.15-rc1 (prerelease) | 2026-10-17T01:03:04Z | 8 | 58 |
| v0.1.14-rc1 (prerelease) | 2026-09-28T23:45:02Z | 8 | 16 |
| v0.1.13-rc1 (prerelease) | 2026-09-26T12:08:20Z | 8 | 27 |

Total 32 assets / 118 downloads across 4 releases — matches Phase 64 §7.
The source-tarball size lineage (2.88 → 4.58 → 14.06 → 20.99 MB across the
four tags) is the asset-set growth the Phase 64 audit flagged as
undocumented; the GA row above documents it now.
