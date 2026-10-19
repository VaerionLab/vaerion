# Release Checklist — the release train runbook (RC-1 → GA)

| | |
|---|---|
| **Scope** | The dry rehearsal of the release train (blueprint GA-Prep DoD: "release train rehearsed dry end-to-end") |
| **Frozen version** | **0.1.7** (ADR-0001 lockstep — verified across `packages/vaerion`, `sdks/typescript`, `tools`, CLI `VERSION`, `ENGINE_VERSION`, `spec/openapi.json`) |
| **Honest channel status** | External channels (npm / GitHub Releases) are **not yet published** — steps G1–G3 require the Founder to provision the remote + credentials |

Each step names the gate or artifact that proves it. A step without proof is
not done — that is the whole point of the train.

## 0. Freeze and prove (local, DONE at RC-1)

- [x] Version lockstep at 0.1.7 (verified this sprint: all `package.json`
      identities + CLI `VERSION` + `ENGINE_VERSION` + openapi info.version).
- [x] All six gates green on the frozen tree (`tools/verify.ts`, re-run on
      the final RC-1 commit `5b80988`):
      309 tests / 2081 expectations / 31 files; coverage floors mechanically
      enforced (CORE lines 90.59% · functions 84.27% · branches 91.12%).
- [x] Constitutional invariants green (C1–C9; zero secret findings; C9 = the
      status-dashboard drift law added by the pre-release audit).
- [x] Reports regenerated from evidence: `BUILD_REPORT.md`,
      `VERIFICATION_REPORT.md`, `ARCHITECTURE_REPORT.md`,
      `ROADMAP_PROGRESS.md`, `PERFORMANCE.md` (generated),
      `site-data/vaerion-status.json` (generated), worklog appended.
- [x] Release collateral exists: `CHANGELOG.md`, `CONTRIBUTING.md`,
      `SECURITY.md`, `CODE_OF_CONDUCT.md`, issue/PR templates, GA dossier
      (this directory), installation tutorial, verified examples
      (`examples/vaerion/` — executed by the engine test suite).

## 1. Build the artifact (local, rehearsed)

```bash
cd packages/vaerion
bun run scripts/dist-pack-cli.ts      # pack → inventory → secret scan → offline install → smoke
```

- [x] `dist-report.json` produced on this exact frozen tree (**executed this
      sprint**: 190,002-byte tarball; inventory law holds, 97 entries;
      secret scan clean across 97 files; offline install; smoke 6/6 exit 0).
- [x] Tarball ≤ 25 MB (OBJ-Q1; measured 190,002 bytes ≈ 0.18 MB — ~131×
      headroom).
- [x] Files-law inventory holds: only `src/` + README + `package.json`
      ship; no fixtures/tests/scripts/dotfiles/`.env` (fail-closed;
      measured: 97 entries, all lawful).
- [x] Secret scan of every packed byte: zero findings (C5-pattern law;
      measured: clean across 97 files).
- [x] Installed-shim smoke passes: `--help`, `version --json`, `init`,
      `doctor`, `dev`, and a MockBrain model run (measured: 6/6 exit 0
      from the INSTALLED shim).

> Evidence-retention note: the pipeline prints `dist: report written to
> <path>` — that path is a session temp dir (`mkdtemp`). Copy
> `dist-report.json` (and the tarball) somewhere durable before step 3
> attaches them to the GitHub Release; the repository itself does not
> retain them.

## 2. Reproducibility proof (local, rehearsed)

```bash
vae package build && vae package build   # byte-identical bundles + identical vaerion.lock
vae package verify .vaerion/package/vaerion-demo.vxn   # pure check; content never executes
```

- [x] Two consecutive builds byte-identical (P2 law; re-run **by hand on the
      frozen tree this sprint**: `cmp` clean for both the bundle and
      `vaerion.lock`; bundle blake3 `f28ebe4b…`, 1677 bytes, 3 entries) —
      also test-proven on every gate run by
      `tests/integration/package-build.test.ts` and the examples suite.
- [x] `vaerion.lock` seal present; `vae doctor` lock cross-check green;
      `vae package verify` on the built bundle: ok, 9 check groups, 0
      findings (both runs journaled with receipts, engine 0.1.7).

## 3. GitHub canonicalization (Founder-gated — the only BLOCKED train step)

The repository is the single source of truth; today it has **no git remote**
(environment-blocked, recorded in the worklog every sprint). When the
Founder provisions a remote + credential:

```bash
git remote add origin git@github.com:<org>/vaerion.git   # or HTTPS + credential
git push -u origin main                                   # publish full history (18+ commits)
git tag v0.1.7-rc1 -m "Release Candidate 1 — engine 0.1.7" && git push origin v0.1.7-rc1
```

- [ ] Remote HEAD equals local HEAD after push (verify with
      `git ls-remote origin main`).
- [ ] The push is then re-verified locally (`git status` clean,
      `git log origin/main -1` matches) — Remote Law satisfied, and the
      "UNVERIFIED — ENVIRONMENT BLOCKED" marker in the worklog is retired.
- [ ] GitHub Releases page: attach the tarball from step 1 + its
      `dist-report.json`; publish the `CHANGELOG.md` 0.1.7 section as the
      release notes body.
- [ ] Branch protection on `main`: require PRs + the six gates.

## 4. External distribution (Founder-gated, after step 3)

- [ ] npm: publish `@vaerion/engine` (0.1.7) from the **provenance-verified
      CI environment**, not a laptop; enable npm provenance + 2FA.
- [ ] Homebrew tap (optional, additive) — formula pulls the GitHub Release
      tarball and smoke-tests the installed shim.
- [ ] Record the channel decisions in `CHANGELOG.md` (distribution-status
      paragraph updated) — the changelog never lies about where the engine
      is actually installable from.

## 5. Post-release verification (the train arrives only if these hold)

- [ ] Fresh clone → `bun install` → `bun run tools/verify.ts` → all gates
      green from the published source.
- [ ] Fresh install of the tarball in a clean directory → the step-1 smoke
      sequence passes.
- [ ] `vae package verify` on the published demo bundle passes; tampered
      copies fail loudly (`E2201`/`E2206`).
- [ ] GO/NO-GO record updated: [`docs/ga/GO-NO-GO.md`](GO-NO-GO.md).
