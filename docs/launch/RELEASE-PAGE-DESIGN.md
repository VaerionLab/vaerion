# Release Page Design — draft (Founder approval required to publish)

| | |
|---|---|
| **Status** | DRAFT — the template below is filled and published only by the release train (`release-publish.yml`), Founder-gated |
| **Source of record** | The release notes: `docs/RELEASE-NOTES-v0.1.13-rc1.md` (+ `CHANGELOG.md`). The page summarizes them; it never outruns them. |
| **Verification of record** | The shipped `VERIFY.md` (three legs), per `docs/ga/RELEASE-VERIFICATION.md` and `SECURITY.md` |

---

## Title format

```
Vaerion v{MAJOR}.{MINOR}.{PATCH}-rc{N} — {one-line theme of record}
```

Example (the v0.1.13-rc1 epoch, this kit's declared source of record):

```
Vaerion v0.1.13-rc1 — production release trust (production-key signing, branch protection, legal identity)
```

Rules:

- The theme line is copied from the release notes' theme field, not
  invented for the page.
- The GitHub **prerelease flag is set** for every `-rcN` tag. The flag is
  part of the honesty surface; released tags are immutable, fixes ship
  fix-forward on the next rc.
- No word in the title may be an adjective doing the work of evidence.

## Body template (verification-first)

```markdown
# Verify before you install

This artifact set is signed with the production Ed25519 release key.
The key of record is `keys/release-signing.pub`; its fingerprint is
pinned inside the shipped `VERIFY.md`. Run the three legs, exactly as
a fresh consumer runs them:

    sha256sum --check SHA256SUMS                       # leg 1: integrity

    tar -xzf vaerion-<version>-source.tar.gz
    bun run vaerion-<version>/tools/dist-verify.ts \
      --manifest MANIFEST.json --sig MANIFEST.json.sig \
      --pub release-signing.pub                        # leg 2: engine verifier

    base64 -d MANIFEST.json.sig > sig.raw
    openssl pkeyutl -verify -pubin -inkey release-signing.pub \
      -rawin -sigfile sig.raw -in MANIFEST.json        # leg 3: independent cross-check

A failed leg is a failed release: do not install it, report it to
auren@vaerion.dev (see SECURITY.md — private, never a public issue).

## Status badges

| Badge | State |
|---|---|
| Release stage | PRERELEASE (`-rcN`) |
| Verification gates | 9/9 green (measured record: `.vaerion-verification.json`) |
| Tests | 545 passed / 0 failed · 3,932 expectations |
| Signing | Ed25519 — production key (`RELEASE_SIGNING_KEY`, sealed-box encrypted) |
| License | Apache-2.0 |
| Telemetry | Zero — enforced mechanically (constitutional gate) |

## What is in this release

{Three to six bullets copied from the release notes' headline and
"Also in this release" sections. Example for v0.1.13-rc1: production-key
release signing; branch protection on `main`; the legal identity layer
(`LEGAL.md`); the winget locale identity fix; the canonical mirror
restored; golden fixtures blessed through the `VAE_BLESS=1` path.}

## Changelog

- Release notes of record: docs/RELEASE-NOTES-v0.1.13-rc1.md (tagged at
  the release commit)
- Cumulative history: CHANGELOG.md

## Upgrade notes

- `v0.1.12-rc1 → v0.1.13-rc1` is content-additive: no command, flag,
  exit code, or E-code changed.
- The universal installer upgrade `vN → vN+1` keeps your journals —
  `.vaerion/` state and `vaerion.lock` survive the update (verified by
  test; the installer touches only its own install prefix).
- Released tags are immutable. Fixes land in the next release
  candidate; earlier rc lines are not patched (SECURITY.md, supported
  versions).

## What this release does NOT claim

{Copied verbatim from the release notes' "What this release does NOT
claim" section. For v0.1.13-rc1: no registry publication (npm/PyPI/
Homebrew remain Founder-gated); no Windows/macOS/distro-host execution
measured (channels stay authored + version-locked, UNVERIFIED — host);
no real-provider cassette recordings; the signing key is production but
not hardware-custodied.}

## Install (honest channels)

Today: source, or the signed tarballs below. Registry publication
(npm/PyPI/Homebrew/winget) happens at the release train and is
announced only when real.
```

## Assets table layout

The assets section renders as a table in this order — verification
materials first, artifacts second, so the consumer reads the trust chain
before the download:

| Asset | What it is |
|---|---|
| `VERIFY.md` | Consumer verification instructions (three legs; key fingerprint pinned) |
| `SHA256SUMS` | Per-file sha256 integrity manifest (leg 1) |
| `MANIFEST.json` | sha256 + blake3 manifest of the artifact set |
| `MANIFEST.json.sig` | Ed25519 signature over `MANIFEST.json` (production key) |
| `release-signing.pub` | The public key of record, manifest-bound, shipped beside the artifacts |
| `dist-report.json` | The pack audit — including the production-key proof line |
| `vaerion-<version>-source.tar.gz` | The source artifact (installs via `packaging/install.sh --tarball`) |
| `vaerion-demo.vxn` | The reproducible demo bundle — verify it with `vae package verify` |

Rules:

- Every asset row is generated by `tools/dist-pack.ts`; the table is not
  hand-written.
- The `dist-report.json` disclosure line must say the production key
  signed the set — a bootstrap-key disclosure line is the tripwire that
  the release was not production-signed, and the page must say so if it
  ever appears.

## Badges (repo README parity)

| Badge | Content |
|---|---|
| Stage | `release candidate` (never "stable", never "GA") |
| Gates | `verification: 9/9 green` — linked to the latest measured record |
| Signing | `Ed25519 signed releases` — linked to `docs/security/SIGNING-CEREMONY.md` |
| License | `Apache-2.0` |
| Registry | `npm/PyPI: Founder-gated` (removed, not flipped, when publish is real) |

## Publication checklist

1. [ ] Tag `v*` pushed; `release-publish.yml` dispatch completed.
2. [ ] The three verification legs pass on a clean checkout, downloaded
       anonymously.
3. [ ] Body filled from the release notes of record — no new claims.
4. [ ] Prerelease flag on; assets table generated, not hand-edited.
5. [ ] The Announcements discussion summary posted per
       `docs/operations/ANNOUNCEMENTS.md` (headline, trust-chain state,
       upgrade path — questions move to Q&A).
6. [ ] Founder approval recorded.
