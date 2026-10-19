# THE LAUNCH SEQUENCE — From Preparation to Public Existence

**Status: PREPARED — every step is armed and gated; none is executed.**
**Order authority:** Phase 12 — Launch Preparation & Externalization Order
(sections 5, 6, 8). The Founder controls final branding, credentials,
public release timing, and external publishing.

This runbook consolidates; it does not replace. The documents of record
remain: `docs/operations/DEPLOYMENT.md` (the release train),
`docs/operations/ENVIRONMENTS.md` (topology and gates),
`docs/security/SIGNING-CEREMONY.md` (key law),
`packaging/README.md` (channel verification matrix).

---

## The gates this sequence respects

| Gate | Meaning | State |
|---|---|---|
| F-2 | Legal identity (pseudonym resolution) | open — Founder |
| F-4 | Substrate ratification (ADR-0018) | open — Founder |
| F-5 | Publish steps (npm / PyPI / marketplaces / vaerion.dev) | open — Founder |
| F-6 | Real-provider cassette recordings | open — Founder/host |
| R-7 | Private vulnerability reporting channel | open — Founder |
| IR-018 / IR-019 / IR-021 | observatory display path · delivery evidence · launch-layer display path | PROPOSED — Founder rules |

---

## Phase A — Preflight (no credentials needed; runs today)

Every command must end green before any external step. Nothing here
publishes or contacts a registry.

```sh
bun install --frozen-lockfile          # deterministic workspace
bun run tools/verify.ts                # the nine verification gates → ALL GATES GREEN
bun run vaerion:verify-constitution    # constitutional digests 3/3
bun run vaerion:verify-everything      # the release-engine graph, 7/7
bun run vaerion:verify-documentation   # the documentation gate, fail-closed
bun run launch:credential-check        # report mode — names present/absent only
```

Environment truth: the working tree must be clean and `HEAD` on the
release tag for the `commandCenter.release` verdict to clear (the live
status record honestly shows `BLOCKED` on a dirty sandbox tree — that is
an environment fact, not a defect).

## Phase B — Credential provisioning (Founder)

1. Receive from the Founder: GitHub token, npm token, PyPI token,
   marketplace PAT, deployment token (as applicable).
2. Provision by NAME into GitHub Actions secrets and/or a local
   `.env` (gitignored) — names listed in `.env.example`; **values never
   in code, never in the tree, never on a command line.**
3. Prove presence without exposure:

```sh
bun run launch:credential-check --strict   # exit 0 only when every name is present
```

The check reads existence only — it never prints, hashes, or transmits a
value, and it publishes nothing.

## Phase C — Release cut (Founder-authorized)

```sh
# 1. the release commit + annotated tag (version of record from the register)
git commit -S -m "release: vX.Y.Z-rcN" && git tag -a vX.Y.Z-rcN -m "…"

# 2. push with the tag
git push origin main --follow-tags

# 3. CI takes over (verify.yml → release-publish.yml):
#    - verify.yml proves all nine gates on the tagged tree
#    - dist-pack builds the artifact set twice, byte-compares, signs with
#      RELEASE_SIGNING_KEY (fail-closed; a bootstrap-key disclosure line is
#      the tripwire that a release was NOT production-signed)
#    - release-publish re-packs deterministically and creates the GitHub
#      Release from docs/RELEASE-NOTES-v<X.Y.Z-rcN>.md
```

## Phase D — Publication (Founder-authorized, per channel)

| Channel | Command surface | Gate |
|---|---|---|
| npm | `packaging/npm/make-package.sh` → `npm publish --tag rc` with `NPM_TOKEN` | F-5 |
| PyPI | `packaging/python/make-package.sh` → `twine upload` with `PYPI_API_TOKEN` | F-5 |
| VS Code | `vsce package` / `vsce publish` with `VSCE_PAT` | F-5 |
| Homebrew / winget / dmg / rpm / AppImage / Flatpak / Snap / Chocolatey / Scoop | authored in `packaging/`; **UNVERIFIED — host-gated** (matrix in `packaging/README.md`) | F-5 + host |
| Website (vaerion.dev) | deploy the Next.js surface; URL goes live with the release train | F-5 |

The `--tag rc` law is measured, not stylistic: npm refuses prerelease
versions without an explicit dist-tag (`npm publish --dry-run`, Task ID 14
launch verification, 2026-09-22). A `-rcN` version is therefore published
under the `rc` dist-tag and NEVER silently becomes `latest`; `latest`
moves only when the Founder declares a GA version.

Consumer verification is the three-leg law (`VERIFY.md` in every artifact
set): `sha256sum --check` → engine `dist-verify` → independent openssl
cross-check. After each publish, record external delivery evidence — the
definition is pending IR-019; until the Founder rules, channels stay
honestly at `signed` in the ledger.

## Phase E — Verification after deployment

```sh
bun run vaerion:verify-release        # the full graph + Article Gate
bun run vaerion:verify-trust          # portable standalone verification of the record
bun run vaerion:observatory           # regenerate the observatory artifact from the live record
bun run vaerion:publish-docs && bun run vaerion:verify-documentation
```

Then, in a clean consumer location: install from the published channel,
run `vae doctor`, and verify a release artifact set with the three legs.

## Phase F — Rollback readiness (armed, not executed)

- Rollback Engine (`src/vaerion/release/rollback.ts`): a rollback is a
  SUPERSEDING ledger entry — the superseded release is never touched.
- Gate: `bun run vaerion:verify-rollback` (parent-chain walk through
  rollback entries proven).
- Registry-side unpublish follows each registry's own immutable-release
  policy; released git tags are never overwritten
  (`docs/security/REMOTE-PROTECTION.md`).

## The stops

This sequence halts — by law — at every Founder gate above. Prepared is
not published; armed is not fired. The next motion belongs to the
Founder.
