# DRAFT — Founder publish runbook, `v0.1.15-rc1`

> **DRAFT — pending Founder execution.** Steps marked **[FOUNDER]** may only
> be run by the Founder (publish law: risk-ledger F-5 class; no automation
> and no agent may run them). Everything else is preparation/verification.
> Prepared from the measured state of 2026-10-04 (local HEAD `a0977a4`,
> public repo frozen `374e2dd`, registry `0.1.14-rc1` —
> `reports/phase-62.0/00-before-state.md`). Facts you will check live are
> cited to `evidence/MEASURED-2026-10-04-62c.md`.

---

## Stage 0 — workspace hygiene (pre-gate; decides Stage 1)

> **STATUS 2026-10-04 (Phase 62.0): EXECUTED.** Both dead files were found in
> the tree (they poisoned the dead-files pin → suite 718/1 and would ship in
> the pack), quarantined with hashes to `/tmp/vae62-quarantine/HASHES.txt`,
> and removed permanently. The gates now keep this class dead
> (`artifact-parity.test.ts:85` + `tools/verify-artifact-parity.ts` [6]).
> Post-quarantine proof: suite **719/0 ALL GATES GREEN**, pack ×2 =
> `bd2e5d56…90371`, parity exit 0. The checklist below remains valid for the
> Founder's own re-verification.

- [ ] **[FOUNDER]** Debris decision — the two untracked stale CLI files MUST
  be removed from the working tree (or the pack will ship them):
  `packages/vaerion/src/cli/center.ts` (0 bytes) and
  `packages/vaerion/src/cli/templates.ts` (27,360 B). Both are untracked
  (`git status --porcelain` shows `??`), dated Sep 1, and belong to the
  61.0 "dead files" class. Measured consequences of leaving them:
  `bun tools/verify.ts` → **718/1** (dead-files pin fails,
  `artifact-parity.test.ts:85`) and `make-package.sh` packs them in →
  parity gate **REFUSES** (`REFUSING — dead file ships in the artifact`,
  `evidence/…62c.md` §3). Quarantine-or-track is the 62.0 Phase 2/7
  decision; for this publish, removal from the working tree is required.
  ```sh
  git status --porcelain packages/vaerion/src/cli/   # expect the two ?? lines
  rm packages/vaerion/src/cli/center.ts packages/vaerion/src/cli/templates.ts
  ```

## Stage 1 — pre-publish gates (all must be green; abort otherwise)

Run from the repo root at the commit of record (`a0977a4` or later if the
orchestrator committed Phase 62 work — confirm with `git log --oneline -1`
that the tree state is the intended release state).

- [ ] Gate suite: `bun tools/verify.ts` → **exit 0, all nine gates GREEN,
  719 pass / 0 fail / 62 files** (`evidence/…62c.md` §1).
- [ ] Deterministic pack ×2:
  ```sh
  sh packaging/npm/make-package.sh && sha256sum dist/npm/vaerion-0.1.15-rc1.tgz
  sh packaging/npm/make-package.sh && sha256sum dist/npm/vaerion-0.1.15-rc1.tgz
  ```
  Required output, both runs:
  `bd2e5d5660fc2bdd808a9068f57c4081b22e90d7e9c3c2f98617313578490371`.
  Any other hash → **ABORT** (do not publish a tarball that is not the
  artifact of record; diagnose first).
- [ ] Parity gate: `bun tools/verify-artifact-parity.ts dist/npm/vaerion-0.1.15-rc1.tgz`
  → exit 0, `── PARITY PROVEN ──`, 116 engine files, dead files absent
  (`evidence/…62c.md` §4).
- [ ] Pre-state sanity (the publish must be the thing that changes these):
  `npm view vaerion dist-tags` → `{ rc: '0.1.14-rc1', latest: '0.1.14-rc1' }`
  (`evidence/…62c.md` §5).
- [ ] Scratch-install the candidate and run the golden path + attack once
  (commands: `GITHUB_RELEASE.md` §Verification) → `vae 0.1.15-rc1`, VERIFIED,
  E1010 refused.
- [ ] Stage the tag (annotated, on the release commit; the tag does not
  exist yet — measured: local tags end at `v0.1.14-rc1`):
  ```sh
  git tag -a v0.1.15-rc1 -m "Vaerion 0.1.15-rc1 — the one-true-artifact release" <release-commit-sha>
  git tag -v v0.1.15-rc1 2>/dev/null || git show v0.1.15-rc1 --no-patch   # verify it peels to the right commit
  ```
  **Do not push yet** — the tag goes out with the push in Stage 2.

## Stage 2 — publish (**[FOUNDER]** for every command in this stage)

Order matters: registry, then git, then GitHub release. Each step is
abortable; nothing is rewritten after the fact (release history is marked,
never rewritten — `release-publish.yml` header law).

- [ ] **[FOUNDER] npm publish** — the tarball is the artifact of record; publish it directly:
  ```sh
  npm publish dist/npm/vaerion-0.1.15-rc1.tgz --tag rc
  ```
  Founder decision, made explicit: `latest` stays at `0.1.14-rc1` unless you
  also run
  ```sh
  npm dist-tag add vaerion@0.1.15-rc1 latest
  ```
  Consequence of each choice (both honest): leaving `latest` at 0.1.14-rc1
  means plain `npm install -g vaerion` keeps serving the old engine — the
  docs' post-publish truth sweep (Stage 4) must then say so plainly.
  Moving `latest` makes both taught commands (`vaerion`, `vaerion@rc`)
  resolve to 0.1.15-rc1, matching the release notes. Recommend: move it.
- [ ] **[FOUNDER] push the line of record** (local `main` is 190 commits
  ahead of `vaerionlab/main` = `374e2dd`):
  ```sh
  git push vaerionlab main && git push vaerionlab v0.1.15-rc1
  ```
- [ ] **[FOUNDER] GitHub release** — two supported paths:
  - **Preferred:** the provisioned workflow (fails closed on the signing
    key, builds the signed set, creates the release, uploads assets):
    `gh workflow run release-publish.yml -f tag=v0.1.15-rc1 -R VaerionLab/vaerion`
    then watch the run and the resulting draft/prerelease.
  - **Manual fallback:** `gh release create v0.1.15-rc1 --draft --prerelease
    --title "Vaerion 0.1.15-rc1 — the one-true-artifact release"
    --notes-file release/v0.1.15-rc1/GITHUB_RELEASE.md` (strip the DRAFT
    banner first), then upload the signed set from `tools/dist-pack.ts`
    (`source.tar.gz`, `vaerion-demo.vxn`, `SHA256SUMS`, `MANIFEST.json`,
    `MANIFEST.json.sig`, `release-signing.pub`, `VERIFY.md`).
  - Note: `launch-kit/automation/create-github-release.sh` is hardcoded to
    `v0.1.13-rc1` and predates the dist-pack signing path (61.2 S10) — do
    not use it for this release without updating it first (out of scope
    here; not modified by this phase).

## Stage 3 — post-publish verification (any operator; report results)

- [ ] Registry truth:
  ```sh
  npm view vaerion dist-tags      # → rc: 0.1.15-rc1 (+ latest per Stage 2 decision)
  npm view vaerion version        # → 0.1.15-rc1 if latest was moved
  ```
- [ ] Fresh install FROM THE REGISTRY (not the tarball) into a clean prefix:
  ```sh
  npm install -g --prefix "$(mktemp -d)" vaerion@rc
  <prefix>/bin/vae --version      # → vae 0.1.15-rc1
  ```
  Then the golden path + E1010 attack in a scratch workspace
  (`GITHUB_RELEASE.md` §Verification) — the registry artifact must behave
  like the parity-proven candidate: VERIFIED, and E1010/exit 5 on the
  truncation attack.
- [ ] Registry tarball bytes match the pin:
  `npm pack vaerion@0.1.15-rc1` → sha256 of the downloaded tgz ==
  `bd2e5d5660fc2bdd808a9068f57c4081b22e90d7e9c3c2f98617313578490371`
  (npm may re-serve the identical uploaded bytes; verify, don't assume).
- [ ] GitHub release: tag peels to the pushed commit; signed set attached;
  body matches `GITHUB_RELEASE.md` (minus the DRAFT banner).

## Stage 4 — the truth sweep (post-publish commit; gate-aware)

The install-honesty disclosures are gate-pinned, so the lag text and its pin
must change **in the same commit**, followed by a full green gate run:

- [ ] Update registry-lag disclosures to post-publish truth:
  `README.md` (version note), `docs/INSTALL.md`, `docs/getting-started/installation.md`,
  `docs/QUICKSTART.md`, `integrations/mcp/README.md`,
  `src/components/site/facts.ts` (npm-lag line + any version strings),
  `src/components/site/landing.tsx` install note.
- [ ] Update the install-honesty pin text in
  `packages/vaerion/tests/integration/artifact-parity.test.ts` to pin the
  NEW truth (post-publish wording), and re-check `docs/RELEASE-NOTES-v0.1.15-rc1.md`
  install block (it already says "after the Founder-gated publish" — now true).
- [ ] `bun tools/verify.ts` → exit 0 (the sweep must land green).
- [ ] **[FOUNDER]** deploy the website (the live site still tells the
  0.1.14 story ×13 occurrences — measured 61.1/62.0; deploy only after the
  sweep so the site ships the post-publish truth).

## Abort criteria (stop and diagnose — do not "fix forward" a release)

1. Any Stage 1 gate not green, or suite not 719/0/62.
2. Either `make-package.sh` run yields a sha256 other than `bd2e5d56…`.
3. Parity gate exits non-zero — **read the refusal** (it is the system
   working; the 62.0 measurement caught a real contamination case this way,
   `evidence/…62c.md` §3).
4. The tag peels to any commit other than the verified release commit.
5. `npm publish` rejects (409 version-exists → the version was already
   published; investigate before any further action — never re-publish or
   force).
6. Post-publish: registry `dist-tags` do not reflect the publish, or the
   registry-install golden path / E1010 attack behaves differently from the
   candidate → treat the registry artifact as untrusted, disclose, and
   diagnose (the parity law exists so this never has to be argued).
7. At ANY point the working tree contains the Stage 0 debris again
   (re-measure; the debris is known to be resurrected by archive restores —
   `reports/phase-62.0/00-before-state.md` §3).

## After the release (not this runbook's job, listed for completeness)

Ecosystem publications stay Founder-gated and out of scope here: PyPI
(`vaerion-sdk` naming strategy of record), crates.io / Maven Central, the
`vaerion.dev` domain, announce posts (`launch-kit/` social drafts are STALE —
they cite 0.1.13-rc1 and old counts; regenerate from `release/v0.1.15-rc1/`
media specs before any posting), and the compliance-mapping content gap
(`ENTERPRISE_TRUST_MATRIX.md`, compliance persona).
