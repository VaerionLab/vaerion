# Release Notes — Vaerion v0.1.15 (General Availability)

**Vaerion v0.1.15 — the first stable release (GA).** Published 2026-10-17
under the Founder's written GO (the Phase-67 release train; the Founder
Release Operations Manual is the procedure of record). GitHub Release
`v0.1.15` published **2026-10-17T23:40:16Z** with the 8-asset signed
verification set. The release of record is the annotated tag `v0.1.15` on
commit `36e3da1` (`36e3da18f1662290745fe35082a15df9a49764fb`).

This packet (`release/v0.1.15/`) is the GA packet of record. It mirrors
`docs/RELEASE-NOTES-v0.1.15.md` — the release notes of record — on the
engine identity, the trust chain, and the install paths; the two must never
disagree on a measured fact. Where a channel state has moved since the
GA-day table in the docs copy (npm lag; the website GA flip not yet
deployed), the Channels table below carries this packet's **measured
2026-10-19 states**, per the registry truth law (D-Z-2: prose claims only
what the channel measures).

## Highlights

- **The verification layer**: `vae verify` — workspace-scale journal proof
  with honest per-check findings; `E1010` (the completeness anchor)
  guarantees nothing was removed from the middle of a closed journal — a
  closed journal with a missing or stale terminal receipt is refused
  (exit 5), never falsely verified.
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
- **GA delta is exactly one deliberate source change**: the GA engine is the
  `0.1.15-rc1` engine with the version literal itself flipped
  (`ENGINE_VERSION` → `0.1.15`), plus the documentation truth-sweep this
  train landed. No behavioral change versus the rc (journals and workspaces
  from rc builds replay byte-identically).

## Verification & trust chain

Every claim below is a measurement, not an assertion; citations live in
`VERIFICATION_EVIDENCE.md` (same directory).

| Leg | Result |
|---|---|
| Verification gates | **ALL GATES GREEN, exit 0 — 719 pass / 0 fail / 5,246 expectations / 62 files**, fresh run at the GA tree (2026-10-19); the pack report independently records `gatesGreen: true` at pack time |
| Source tarball | **Byte-reproducible**: `git archive` + `gzip -n`, built **twice and byte-compared** on every pack (`tools/dist-pack.ts`); `vaerion-0.1.15-source.tar.gz` sha256 `ee08d058f750165953dac33a147e9d38440ae92b477bfde8e30d48aff0691f89` |
| Signature | **Ed25519** over the canonical `MANIFEST.json`; the packer **verifies its own signature** before reporting success; an independent `openssl pkeyutl` leg (no engine code) also verifies — dual-leg measured |
| Integrity manifest | `SHA256SUMS` covers **7/7** non-manifest assets, exit 0; it agrees with the signed manifest and covers the manifest + signature |
| Key-of-record binding | shipped `release-signing.pub` ≡ tracked `keys/release-signing.pub` (byte-identical, sha256 `c033b392eab5f9a316f9502278dcabd78a5375d1f20b4599c9d9a021bac47f4d`); the publish tripwire **refuses** any other key |
| Artifact parity | source = build = package = docs, mechanically proven (`tools/verify-artifact-parity.ts`, exit 0) before publish |
| Manifest binding | `MANIFEST.json` binds `release: 0.1.15` @ commit `36e3da18f1662290745fe35082a15df9a49764fb` — exactly the GA flip commit |

Consumer verification (anonymous, ~1 minute): `sha256sum --check SHA256SUMS`
→ `bun run tools/dist-verify.ts --manifest MANIFEST.json --sig
MANIFEST.json.sig --pub release-signing.pub` → independent
`openssl pkeyutl -verify` leg. Full instructions: `VERIFY.md` in the release
assets and `docs/RELEASE-NOTES-v0.1.15.md` §Verification.

## Channels (measured states)

| Channel | State (measured 2026-10-19) |
|---|---|
| GitHub Releases | **LIVE** — `v0.1.15` published 2026-10-17T23:40:16Z, **8 assets**, signature + every digest verified; 17 downloads recorded on the GA release |
| PyPI (`vaerion`) | **LIVE** — `0.1.15` (sdist + wheel), published 2026-10-17T23:43:28Z |
| npm (`vaerion`) | **LIVE BUT LAGS** — the registry delivers `0.1.14-rc1` on `rc`+`latest` until the `0.1.15` publish executes (Founder-gated; measured on registry.npmjs.org 2026-10-19). The publish artifact is parity-proven and the runbook of record is `NPM-PUBLISH-RUNBOOK.md` in this packet |
| Hosted site | **LIVE** — `https://vaerion.vercel.app` — but serving the `0.1.15-rc1` bundle: the GA flip (`36e3da1`) is not yet deployed (measured 2026-10-19). Deployment runbook: `DEPLOYMENT-RUNBOOK.md` in this packet |
| `@vaerion/sdk` (npm) | unpublished (deliberate — SDKs ship from source today) |
| crates.io / Maven Central | deferred, honestly labeled |
| Homebrew / winget / dmg / rpm | authored, UNVERIFIED host-gated |
| `vaerion.dev` | domain provisioning pending; vaerion.vercel.app is the hosted surface of record |

> **npm erratum of record (measured 2026-10-19):** the GA-day intent was a
> same-train npm publish; the registry in fact has no `0.1.15` event. Until
> the Founder-gated publish executes, `npm install -g vaerion` delivers the
> older `0.1.14-rc1` engine (missing `vae verify` / `create` / `start` /
> `mcp`). PyPI `0.1.15` and the signed GitHub Release carry the engine of
> record today. When the publish lands, prose, test pins, and facts flip
> together in one commit window — never one side alone
> (`docs/constitution/VAERION_CONSTITUTION_v1.8.md`, D-Z-2).

## Install (GA)

```sh
pip install vaerion            # PyPI — current engine, live today
# or the signed set (live today):
#   github.com/VaerionLab/vaerion/releases → v0.1.15
#   verify: sha256sum -c SHA256SUMS, then tools/dist-verify.ts
# or from source:
git clone https://github.com/VaerionLab/vaerion && cd vaerion
bun install --frozen-lockfile
alias vae="bun run packages/vaerion/src/cli/vae.ts"
# npm (LIVE BUT LAGS — delivers 0.1.14-rc1 until the Founder-gated publish):
npm install -g vaerion
vae --version                  # always check what you actually got
```

Prerequisite: **Bun ≥ 1.2** (docs recommend 1.3+; tested floor 1.3.14). The
engine executes on the Bun runtime; without Bun, `vae` refuses with a taught
error — `E1600`, exit 2, exact fix printed — never a raw OS error.

## Upgrade notes (from 0.1.14-rc1 / 0.1.15-rc1)

Same commands, no migration steps: journals and workspaces from rc builds
replay byte-identically on the GA engine (compatibility re-tested at each rc;
the cross-version leg is a permanent regression test). Nothing is removed or
renamed — within-v0.1 surfaces evolve additively.

- Coming from the **npm-delivered `0.1.14-rc1`** engine: that artifact lacked
  `vae verify` / `create` / `start` / `mcp`; the GA tree has the full
  29-command surface. Upgrade after the npm publish lands
  (`NPM-PUBLISH-RUNBOOK.md`), or today via PyPI / the signed set / source.
- Coming from the `0.1.15-rc1` source/tag: the only change is the version
  literal — no action beyond installing `0.1.15`.
- Always verify what you actually got: `vae --version` against
  `npm view vaerion dist-tags`. Rollback: pin the exact prior version
  (`npm install -g vaerion@0.1.14-rc1`) or `pip install vaerion==0.1.15rc1`;
  `.vaerion/` evidence (journals, receipts, snapshots) is workspace data and
  is not touched by upgrade or rollback.

## Known limitations

Stated, not hidden. The full measured ledger of record is
**`docs/LIMITATIONS.md`** — including the honest publication status (F-5:
GitHub Release + PyPI live; npm lagging; `vaerion.dev` domain pending), the
provisional TypeScript-on-Bun substrate (ADR-0018), no transport security
(remote attachment refused in code, E2006), no external receipt anchoring /
SIEM export / compliance mapping, tamper-evident ≠ tamper-impossible, and
the authored-but-UNVERIFIED host-gated packaging channels. Security
disclosure posture: `SECURITY.md` (email; the working channel gap is tracked
openly as RISK-LEDGER R-7).

---

*Assembled 2026-10-19 in the Era II synchronization program; measured values,
none estimated. Provenance per cell: `ASSET_MANIFEST.md` and
`VERIFICATION_EVIDENCE.md` (same directory).*

Apache-2.0 · zero telemetry · local-first · repo:
`github.com/VaerionLab/vaerion`
