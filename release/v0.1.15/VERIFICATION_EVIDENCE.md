# Verification Evidence — Vaerion v0.1.15 (GA)

> The consolidated evidence index for the GA release of record. Every
> load-bearing number carries its source. Provenance labels: **[fresh]** =
> measured 2026-10-19 in the Era II synchronization program at the GA tree;
> **[P63]** = measured 2026-10-18 by Phase 63 (the two audit reports of
> record are private-workspace phase ledgers — cited below by phase number
> and title; their public evidence lands in `docs/ga/` and in this packet);
> **[P64]** = measured 2026-10-18/19 by Phase 64. Nothing here is estimated.

---

## 1. The release of record

| Fact | Value | Source |
|---|---|---|
| Tag / commit | `v0.1.15` → `36e3da1` (`36e3da18f1662290745fe35082a15df9a49764fb`) | annotated tag; `MANIFEST.json` binding [P63] |
| GitHub Release | published **2026-10-17T23:40:16Z**, **8 assets**, Latest (not prerelease) | GitHub releases API re-verified via authenticated GET [P64]; asset-level table: `ASSET_MANIFEST.md` |
| GA delta vs rc | exactly one deliberate source change — the version literal (`ENGINE_VERSION` → `0.1.15`) | `docs/RELEASE-NOTES-v0.1.15.md`; `CHANGELOG.md` [0.1.15] |
| Asset-set producer | `tools/dist-pack.ts` (fail-closed; see §3) | `docs/ga/RELEASE-VERIFICATION.md` (process of record) |

## 2. Gates of record — fresh run at the GA tree

| Gate | Result | Source |
|---|---|---|
| Full verification suite | **ALL GATES GREEN, exit 0 — 719 pass / 0 fail / 5,246 expectations / 62 test files** | **[fresh]** `bun run tools/verify.ts` at the GA tree, 2026-10-19 (Era II synchronization run) |
| Gate identity | the nine gates = typecheck ×2, tests + coverage floors, layerlint, constitutional-check, perf-budget, a11y-structural, repo-lint (+ dist-pack on tags) | `.github/workflows/verify.yml`; `tools/verify.ts` |
| Note on the expectation counter | 719/0/62 are the law numbers; the `expect()` counter is not run-stable on an identical tree (±9 observed across runs — Phase 64 finding F-2, disclosed, not hidden). The committed green record `.vaerion-verification.json` holds 5,246; a Phase-64 run measured 5,255 on the same tree | [P64] 1-g testing audit |
| Committed green record | `.vaerion-verification.json` `ok: true`, generatedAt 2026-10-17T00:55:26Z (rc1 epoch) | committed record [P64 1-f] |
| Pack-time attestation | `dist-report.json` (inside the signed set): `gatesGreen: true`, generatedAt 2026-10-17T23:40:11Z | [P63] Stage 7 §1.3 |

Three independent attestations agree: the gate of record (fresh run), the
pack report (pack-time), and the committed record. The known split-truth
defect of the GA-day status layer (committed RED 715/4 snapshot vs green
record — Phase 64 TD-3) is a generator-epoch defect in `site-data/` +
`ROADMAP_PROGRESS.md`, being repaired by regeneration, not hand-editing;
it does not touch the gates above.

## 3. Trust chain — the six legs

| Leg | Mechanism | Evidence |
|---|---|---|
| 1. dist-pack fail-closed | `tools/dist-pack.ts` re-runs the FULL verification suite first and aborts on any red gate — no artifact can exist from an unverified tree | `tools/dist-pack.ts:92-103`; process of record `docs/ga/RELEASE-VERIFICATION.md` |
| 2. Tarball built twice | the source tarball (`git archive` + `gzip -n`, no timestamps) is built twice and **byte-compared**; non-reproducible ⇒ abort | `tools/dist-pack.ts`; reproducibility statement `docs/ga/RELEASE-VERIFICATION.md` §Reproducibility [P63] |
| 3. Ed25519 self-verify | the packer signs the canonical manifest and **verifies its own signature** before reporting success; an independent `openssl pkeyutl` leg (no engine code) also verified exit 0 | [P63] Stage 7 §1.3 |
| 4. SHA256SUMS overlap | `sha256sum -c SHA256SUMS` → **7/7 OK, exit 0**; SHA256SUMS agrees with the signed manifest and covers manifest + signature (overlapping coverage) | [P63] Stage 7 §1.3 |
| 5. Consumer dist-verify | `tools/dist-verify.ts` fails closed: verifies the signature over canonical manifest bytes, then recomputes size + sha256 + blake3 for every listed artifact; tamper detection is test-proven (single flipped byte fails) | `docs/ga/RELEASE-VERIFICATION.md` §Consumption; [P63] Stage 7 |
| 6. Publish tripwires | `release-publish.yml`: (a) bootstrap-grep — refuses to publish if `dist-report.json` discloses a bootstrap key (:94-97); (b) key-of-record `cmp` — shipped pub key must be byte-identical to tracked `keys/release-signing.pub` (:98-101); (c) artifact-parity gate re-proves SOURCE = PACKAGE before publish (:104-110) | `.github/workflows/release-publish.yml` [P63] Stage 7 §1 |

Key-of-record: shipped `release-signing.pub` ≡ tracked `keys/release-signing.pub`
(sha256 `c033b392eab5f9a316f9502278dcabd78a5375d1f20b4599c9d9a021bac47f4d`)
[P63]. The archive's divergent key (`9225724d…`) is a separate trust root on
a frozen repo with zero releases — Phase 64 TD-15, founder-side item.

## 4. Channel states (measured 2026-10-19)

| Channel | Measured state | Source |
|---|---|---|
| GitHub Release `v0.1.15` | LIVE — 8 assets, 17 downloads, Latest, not prerelease | [P64] releases audit (authenticated API); `ASSET_MANIFEST.md` |
| PyPI `vaerion` | LIVE — `0.1.15` (sdist + wheel), published 2026-10-17T23:43:28Z (+ `0.1.15rc1`) | pypi.org/pypi/vaerion/json [P63/P64] |
| npm `vaerion` | LIVE BUT LAGS — versions `[0.1.13-rc1, 0.1.14-rc1]`, dist-tags `latest` = `rc` = `0.1.14-rc1`, registry `time.modified` 2026-09-28; **no 0.1.15 event exists** | registry.npmjs.org/vaerion, measured twice [P63/P64]; re-measured 2026-10-19 (Era II Path B adjudication) |
| Hosted site | LIVE but serving the `0.1.15-rc1` bundle (deployed epoch = `8374c17`-era): homepage 4× "0.1.15-rc1", `/api` returns `0.1.15-rc1`; the GA flip `36e3da1` was **never deployed**; the production deploy matches no single commit (robots.txt hybrid; llms.txt / llms-full.txt from different epochs — dirty-working-tree deploy) | live fetch of https://vaerion.vercel.app [P64 1-i]; re-measured 2026-10-19 (Era II) |
| npm `@vaerion/engine` / `@vaerion/sdk` / `@vaerion/tools`, PyPI `vaerion-sdk` | 404 — honest (SDK publication documented as open, Founder-gated) | registry probes [P64 1-f] |

The four-version visitor matrix (repo 0.1.15 / PyPI 0.1.15 / npm 0.1.14-rc1 /
site 0.1.15-rc1) is the highest-visibility open defect — Phase 64 TD-2/TD-5;
the closure paths are `NPM-PUBLISH-RUNBOOK.md` and `DEPLOYMENT-RUNBOOK.md`
in this packet.

## 5. Audit reports of record

| Report | Where | What it contributes to this packet |
|---|---|---|
| **Phase 63 / Stage 7 — "Security / Release Trust Re-Verification (GA tree)"** | private workspace phase report (cited by phase and title); public evidence: `docs/ga/` + this packet | the GA asset-set verification battery (8/8 assets, 7/7 sha256, dual-leg Ed25519, key-of-record binding, digests of record), the `c6361622d2872c09…` npm publish-input measurement (Path A), dependency audit |
| **Phase 63 / Stage 8 — "Final Consistency Report & Recommendations"** | private workspace phase report (cited by phase and title) | the npm decision gate (§2 Path A — restated as `NPM-PUBLISH-RUNBOOK.md`) and the execution law (§6: one commit window, prose + pins + facts together) |
| **Phase 64 — "Rule Zero Forensic Audit"** (+ its 11 specialist sub-reports) | private workspace phase report (cited by phase and title); public evidence: `docs/ga/` + this packet | the release audit (release table, registry truth), the security audit (F-01 dispatch-ref bypass → the `environment: release` fix shipped with this packet), the website forensics (undeployed GA flip, non-reproducible deploy), gates re-run (719/0, exit 0) |

## 6. How a stranger re-verifies (the public path)

1. `sha256sum --check SHA256SUMS` — integrity (7/7).
2. `bun run tools/dist-verify.ts --manifest MANIFEST.json --sig
   MANIFEST.json.sig --pub release-signing.pub` — signature + per-artifact
   sha256/blake3/bytes, fail-closed.
3. `base64 -d MANIFEST.json.sig > sig.bin && openssl pkeyutl -verify -pubin
   -inkey release-signing.pub -rawin -sigfile sig.bin -in MANIFEST.json` —
   independent implementation leg.
4. Rebuild the source tarball from the tagged tree and compare bytes to
   `ee08d058f750165953dac33a147e9d38440ae92b477bfde8e30d48aff0691f89`.
5. In any workspace: `vae verify` — the engine proves its own journals.

## 7. What this index does NOT claim

- It does not claim npm serves `0.1.15` — it serves `0.1.14-rc1` on
  `rc`+`latest` until the Founder-gated publish (D-Z-2 registry truth law;
  `NPM-PUBLISH-RUNBOOK.md`).
- It does not claim the website serves GA facts — the deployed bundle is the
  `0.1.15-rc1` epoch until the GA flip deploys (`DEPLOYMENT-RUNBOOK.md`).
- It does not claim compliance mappings, transport security, external
  receipt anchoring, or a working security-disclosure channel (R-7 honest
  pre-declaration in `SECURITY.md`) — see `docs/LIMITATIONS.md`.
