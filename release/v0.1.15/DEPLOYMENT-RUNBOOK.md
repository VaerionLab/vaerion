# Website Deployment Runbook — the GA flip (`v0.1.15`)

> Closes Phase 64 TD-5 / finding 1-i F2 (High): **the GA flip was never
> deployed.** The deployed bundle at `https://vaerion.vercel.app` is the
> `8374c17`-era (`0.1.15-rc1`) build — homepage shows `0.1.15-rc1` 4× and
> `/api` returns `0.1.15-rc1` (measured 2026-10-18T23:41Z by Phase 64 and
> re-measured 2026-10-19 in the Era II synchronization program). The GA
> commit `36e3da1` (2026-10-17T23:33:06Z) changed exactly 3 src lines
> (`landing.tsx` ×2, `api/route.ts` ×1); the live site predates it.
>
> Second, sharper finding (1-i F3, Medium): **the current production deploy
> matches no single commit** — `robots.txt` is a hybrid (phase-53 comment +
> phase-54 sitemap line), `llms.txt` and `llms-full.txt` are served from
> different epochs (`5c93df9`-era text, ≠ HEAD). The recorded root cause is
> a **deploy cut from a dirty working tree** with uncommitted GA-prep edits.
> **Deploying from anything but a clean tree of a single SHA is forbidden.**

## 1. Preconditions (all must hold before any deploy action)

1. The Era II synchronization branch is **merged to `main`** (branch
   protection runs `verification (all gates)` — green required).
2. The generated layer is fresh at the merge commit: `llms.txt`,
   `llms-full.txt`, `site-data/`, `docs/CLI.md`, `openapi.json` are
   committed generator outputs of that commit — never deploy with a
   hand-patched generated file.
3. Working tree CLEAN: `git status --porcelain` empty at the deploy SHA.

## 2. Deploy

### 2a. Expected path — Vercel auto-deploy on merge

Vercel auto-deploy is the expected behavior (evidence: commit `8374c17` was
deployed ~40 minutes after it landed — sitemap build stamp
`2026-10-17T01:10:04.599Z`).

- **Check** (Vercel dashboard → project → *Deployments*): a production
  deployment appears within the hour of the merge, builds from the merge
  SHA, and reaches *Ready*.
- If it deployed: **skip 2b**, go to §3 verification.

### 2b. Manual path — only if no auto-deploy

Deploy from the merged SHA with a CLEAN tree (the Phase 64 root cause must
never be repeated):

```sh
git fetch origin && git checkout origin/main        # the merged SHA
git status --porcelain                              # MUST be empty — abort otherwise
git rev-parse HEAD                                  # record the deploy SHA
vercel deploy --prod                                # or: Vercel dashboard → "Deploy" from the recorded SHA
```

- Never deploy with local modifications, untracked generated files, or a
  `git stash` in play — a single-epoch deploy is the whole point of this
  runbook.
- Record: deploy SHA, deployment URL/ID, and timestamp in the Era II
  window log.

## 3. Post-deploy verification matrix (check EVERY row before declaring done)

| # | Check | Command / path | Pass criterion |
|---|---|---|---|
| 1 | Homepage version | `curl -s https://vaerion.vercel.app/` | footer + hero show **`v0.1.15`** (zero `0.1.15-rc1` strings) |
| 2 | API version | `curl -s https://vaerion.vercel.app/api` | JSON body returns **`"version": "0.1.15"`** |
| 3 | robots.txt single-epoch | `curl -s https://vaerion.vercel.app/robots.txt` and byte-compare to the tree's `public/robots.txt` | **matches the merged tree exactly** — no hybrid (this is the Phase 64 F3 regression check) |
| 4 | llms.txt epoch | `curl -s https://vaerion.vercel.app/llms.txt` | byte-identical to the merged tree's committed `llms.txt` |
| 5 | llms-full.txt epoch | `curl -s https://vaerion.vercel.app/llms-full.txt` | byte-identical to the merged tree's committed `llms-full.txt` |
| 6 | sitemap lastmod | `curl -s https://vaerion.vercel.app/sitemap.xml` | `lastmod` = the deploy date |
| 7 | CSP header | `curl -sI https://vaerion.vercel.app/` | `Content-Security-Policy` present (being added to the tree by a parallel Era II workstream — verify against the merged tree's `vercel.json`) |
| 8 | JSON-LD | `curl -s https://vaerion.vercel.app/` | structured-data `<script type="application/ld+json">` present (same parallel workstream — if the merged SHA predates it, record the absence and land the deploy anyway; it is not a blocker for the GA flip) |
| 9 | npm badge bridge | homepage install section | the registry-truth sentence renders (currently the lag-honest text; after `NPM-PUBLISH-RUNBOOK.md` Step 6, the published-truth text) |
| 10 | Security headers (no regression) | `curl -sI` | HSTS, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy still present (`vercel.json`) |

Byte-compare helper for rows 3–5:

```sh
for f in public/robots.txt llms.txt llms-full.txt; do
  curl -s "https://vaerion.vercel.app/${f#public/}" | cmp - "$f" && echo "OK  $f" || echo "DRIFT  $f"
done
```

## 4. Rollback (Vercel instant rollback)

**Order is check-then-roll-back — never roll back on a hunch:**

1. Run the §3 matrix; identify the failing rows.
2. If any row fails: Vercel dashboard → *Deployments* → the **previous
   production deployment** (the last one that passed verification) →
   **Instant Rollback** (or *Promote to Production*). Rollback is instant
   and does not rebuild.
3. Re-run the §3 matrix against the rolled-back site; record both the
   failure and the rollback in the window log.
4. Diagnose the failed deployment **from a clean checkout of the deploy
   SHA** (build logs in Vercel; local `bun run build` at that SHA if
   needed). Fix on a branch → PR → merge → deploy again per §2.
5. Rollback does not touch the tree of record: `main` stays the truth; only
   the deployed artifact moves. (The release-channel rollback law — releases
   are marked, never rewritten — applies to GitHub Releases and tags; the
   website equivalent is instant rollback.)

## 5. Known honest states during the transition

> **Update (2026-10-21, measured):** the npm leg of the matrix below has
> CLOSED — the registry delivers `vaerion 0.1.15` under dist-tag `latest`
> (published 2026-10-21, parity-proven; `ASSET_MANIFEST.md` §npm). The
> site leg remains open until this runbook executes. The matrix is
> retained verbatim as the transition-time record.

- Until this runbook executes, the four-version visitor matrix stands
  (repo 0.1.15 / PyPI 0.1.15 / npm 0.1.14-rc1 / site 0.1.15-rc1) — Phase 64
  TD-2/TD-5. This runbook closes the site leg; `NPM-PUBLISH-RUNBOOK.md`
  closes the npm leg.
- If the npm flip (D-Z-2 window) lands after this deploy, redeploy once more
  so the site ships the published-truth — a site deploy is cheap; a stale
  registry sentence is the exact defect class this program exists to close.
