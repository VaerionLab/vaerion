# DRAFT — Upgrade & install guide: getting 0.1.15-rc1

> **DRAFT — pending Founder publish.** Companion to `MIGRATION_GUIDE.md`
> (which covers *behavioral deltas for existing users*). This file covers the
> other concern: **how to get 0.1.15-rc1 onto a machine**, fresh or not, and
> how to check you actually got it. Channel statuses are live-measured
> 2026-10-04; the authoritative channel map is `docs/getting-started/installation.md`
> + `docs/INSTALL.md`.

---

## 0. The one prerequisite

**Bun ≥ 1.2 (docs recommend 1.3+).** The engine is TypeScript executed on the
Bun runtime (ADR-0018, provisional substrate). Without Bun, `vae` refuses
with a taught error — `E1600`, exit 2, fix printed — never a raw OS error:

```sh
curl -fsSL https://bun.sh/install | bash   # only if missing
```

## 1. Fresh installs

### Channel A — npm (the taught path; live AFTER the Founder publish)

```sh
npm install -g vaerion@rc
vae --version        # → vae 0.1.15-rc1 — always check, see §3
```

- No sudo? `npm config set prefix ~/.npm-global` and add `~/.npm-global/bin`
  to PATH (npm user-prefix fallback, pinned by tests since 0.1.12).
- The package ships the engine source + launcher only: `bin/`, `engine/`,
  `README.md` (`packaging/npm/package.json` `files` field; no lifecycle
  scripts, no tests, no keys — measured on the packed tarball,
  `reports/phase-61.0` S9 + 61.2 artifact proof).
- Runtime deps: `ajv`, `hash-wasm`, `yaml` — nothing else.

### Channel B — from source (works TODAY, no publish required; the audit path)

```sh
git clone https://github.com/VaerionLab/vaerion vaerion && cd vaerion
bun install --frozen-lockfile
bun run tools/verify.ts            # all gates green before you trust the clone
alias vae="bun run packages/vaerion/src/cli/vae.ts"
```

Note: the public repository is frozen at `374e2dd` until the release commit
is pushed (190 commits behind the line of record, measured 2026-10-04,
`reports/phase-62.0/00-before-state.md` §2). Until the push, the source of
record is the private tree / the signed release set, not the public clone.

### Channel C — signed release set (offline, no account)

Every release ships a full signed artifact set
(`github.com/VaerionLab/vaerion/releases`): source tarball, `vaerion-demo.vxn`,
`SHA256SUMS`, `MANIFEST.json` + `MANIFEST.json.sig`, `release-signing.pub`,
`VERIFY.md`. The anonymous three-leg verification, exactly as a fresh
consumer runs it (`docs/getting-started/installation.md:47-54`):

```sh
sha256sum --check SHA256SUMS                       # leg 1: integrity
bun run vaerion-<version>/tools/dist-verify.ts \
  --manifest MANIFEST.json --sig MANIFEST.json.sig --pub release-signing.pub   # leg 2
base64 -d MANIFEST.json.sig > sig.raw
openssl pkeyutl -verify -pubin -inkey release-signing.pub \
  -rawin -sigfile sig.raw -in MANIFEST.json        # leg 3: independent implementation
```

### Channel D — candidate tarball (pre-publish, verifiers and reviewers)

```sh
sh packaging/npm/make-package.sh    # → dist/npm/vaerion-0.1.15-rc1.tgz
# sha256 bd2e5d5660fc2bdd808a9068f57c4081b22e90d7e9c3c2f98617313578490371 (×2, deterministic)
npm install -g --prefix /tmp/vae-clean dist/npm/vaerion-0.1.15-rc1.tgz
```

### Not yet channels (honest labels, `docs/getting-started/installation.md` §"Channel status")

PyPI (wheel built, venv-verified, publication pending — PyPI measured 404 on
2026-10-03), Debian/RPM/AppImage/Homebrew and Windows channels (authored,
host-verification pending), `vaerion.dev` universal installer (verified
end-to-end, domain not live). **Do not teach these as available.**

## 2. Existing installs → 0.1.15-rc1

```sh
npm install -g vaerion@rc && vae --version
vae doctor        # your existing journals/verified evidence, re-checked
```

Behavioral deltas, exit codes, the E1010 semantics change (source-line
0.1.14 upgraders), Python SDK loopback enforcement, and rollback steps:
see `MIGRATION_GUIDE.md`. Short form: nothing removed or renamed; the
command surface only grows; journals are forward-verifiable.

## 3. Check what you ACTUALLY got (the install-honesty habit)

This project's own history includes a registry serving an older engine under
the expected version — check, don't assume:

```sh
vae --version                    # the binary's truth
npm view vaerion dist-tags       # the registry's truth (rc + latest)
```

- Until the Founder publish: registry serves `0.1.14-rc1` (re-measured
  2026-10-04) — `@rc` will NOT give you 0.1.15-rc1 yet; use Channel B/D.
- After the publish: both should read `0.1.15-rc1`. If they disagree, stop
  and check `RELEASE_CHECKLIST.md` §post-publish before scripting against
  the binary.

## 4. First proof on any channel (~60 s, no API key)

```sh
vae init --template demo
vae run demo                     # deterministic MockBrain model, journals as it goes
vae journal verify <RUN_ID>      # → ok · anchored · complete
vae verify                       # → VERIFIED
vae doctor                       # → all checks green
```

Unassisted first-verified-execution was measured at ~60 s of engine time on a
clean machine (`reports/phase-61.2/01-release-readiness.md` §1;
`reports/phase-61.2/06-artifact-proof.md` §3: init 0.108 s / run 0.123 s /
verify 0.092 s from the installed artifact).
