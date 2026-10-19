# Founder Landing Runbook — closing the Era II window, in order

> The ONE page that sequences every founder-side action left open by the Era
> II synchronization program (branch `era-ii/synchronization`, the GA packet
> of record under `release/v0.1.15/`). Nothing here can be executed by an
> agent — every step needs Founder-held credentials or GitHub UI authority.
> Steps are **ordered**: each depends on the previous one's verification.
> Sources of record: **Phase 63 — "Final Consistency Report &
> Recommendations"** (§2 npm decision gate, §3 remediation ledger, §6
> execution law) and **Phase 64 — "Rule Zero Forensic Audit"** (§6 security,
> §7 release, TD ledger, risk register); both cited by phase and title —
> the phase reports live in the private workspace and their public evidence
> lands in `docs/ga/` and in this packet.

## Step 0 — Prerequisites

| Need | Detail | Check |
|---|---|---|
| GitHub credential with write | an account with admin on `VaerionLab/vaerion` (currently `vaeriondev`) | `gh auth status` on your machine |
| npm token | publish rights for the `vaerion` package (only if Step 3 = Path A) | `npm whoami` + org access |
| Vercel access | project `vaerion` (production deploys + rollbacks) | dashboard → project *Deployments* visible |
| Clean machine state | no staging credentials in the tree; signing key stays out of git (`.gitignore: /keys/*.key`) | `git status --porcelain` empty |

## Step 1 — Push the branch, open the PR, merge

```sh
git push -u origin era-ii/synchronization
gh pr create --base main --head era-ii/synchronization \
  --title "Era II synchronization — GA packet of record (release/v0.1.15) + environment: release" \
  --body "Phase 64 TD closure set: the GA release packet of record, the npm Path A runbook, the website deployment runbook, the founder landing runbook, and the release-publish environment binding (F-01/TD-14)."
gh pr checks --watch        # branch protection runs `verification (all gates)`
```

- **Law**: work on the public lineage via PR; no force-push, no history
  rewrite (Phase 63 §6.1). Linear history is enforced — use **Squash and
  merge** or **Rebase and merge** (a merge commit will be refused).
- ✅ **Verify**: PR shows `verification (all gates)` **green**; merge lands;
  `git log --oneline -1 origin/main` shows the merge of record.

## Step 2 — Website deploy verification

Execute `release/v0.1.15/DEPLOYMENT-RUNBOOK.md` in full:

- Expect Vercel auto-deploy on the merge (the `8374c17` precedent: deployed
  ~40 min post-commit); if absent, deploy manually from the merged SHA with
  a **clean tree** (the dirty-tree deploy that produced the current
  matches-no-commit production bundle is the recorded root cause and is
  forbidden).
- ✅ **Verify**: the 10-row post-deploy matrix — `/` + `/api` at `0.1.15`,
  robots.txt single-epoch, llms.txt / llms-full.txt byte-match the merged
  tree, sitemap lastmod = deploy date, headers present.

## Step 3 — npm Path A decision (optional; the oldest open gap)

Execute `release/v0.1.15/NPM-PUBLISH-RUNBOOK.md` — Path A of the Phase 63
§2 decision gate. This is a **Founder decision**, not a chore:

- **Execute it** (recommended; matches the tree's intent, closes Phase 64
  TD-2 Critical): steps 1–5 (deterministic rebuild vs the
  `c6361622d2872c09…` Phase 63 publish-input measurement, parity gate,
  `npm publish`, registry verification), then **Step 6 — the post-publish
  flip commit**: prose + test pins + `facts.ts` flip together in ONE commit
  (D-Z-2), gate green, PR, merge, then one more website deploy (§2 above).
- **Decline it**: the tree stands as adjudicated (lag-honest, D-Z-2) — no
  action; the runbook remains the prepared procedure of record.
- ✅ **Verify** (Path A): `npm view vaerion dist-tags` → `latest: '0.1.15'`;
  `npm view vaerion time` gains the 0.1.15 event; the flip commit landed
  green and the site ships published-truth.

## Step 4 — GitHub UI actions (two, both founder-only)

### 4a. Upload the social preview

- **UI path**: Repo → *Settings* → *General* → **Social preview** →
  *Edit* → *Upload a new image* → `.github/assets/social-preview.png`.
- Honest caveat (Phase 64 F-04 / Phase 63 P1-4): the in-tree PNG was
  rendered pre-GA and carries `v0.1.15-rc1` in the version literal
  (`social-preview.html:63`). Preferred: flip `:63` to `v0.1.15`, re-render
  per brand law, and upload the fresh PNG; uploading the in-tree PNG
  as-is still closes the auto-generated-card gap (F-09) but ships an rc1
  literal — pick one, know which you shipped.
- ✅ **Verify**: `curl -s https://github.com/VaerionLab/vaerion | grep -o
  'og:image[^>]*'` → the uploaded image URL (not
  `opengraph.githubassets.com` auto-card).

### 4b. Create the `release` Environment (closes F-01 / TD-14)

The publish workflow now declares `environment: release` on the publish job
(the one workflow change shipped in Step 1; every tripwire, the GA tag law,
permissions, and SHA pins are byte-intact otherwise).

- **UI path**: Repo → *Settings* → *Environments* → **New environment** →
  name `release` →
  - **Required reviewers**: add the Founder (the load-bearing protection —
    every `release-publish` dispatch now waits for human approval
    regardless of which ref resolved the workflow file, closing the
    dispatch-ref bypass of Phase 64 F-01);
  - **Deployment branch and tag rules** (defense-in-depth): restrict to
    tags matching `v*` (note: GitHub applies tag rules to tag-shaped
    deployment refs; for `workflow_dispatch` the reviewers gate is the
    binding control).
- **Honest sequencing note**: between Step 1's merge and this environment
  being created, GitHub auto-creates an **empty** `release` environment on
  first dispatch and **proceeds without any protection** — a missing
  environment reference does not block or fail the workflow. Do this step
  in the same sitting as the merge; until the reviewers are added, the
  bypass surface F-01 is narrowed (environment declared) but not closed.
- ✅ **Verify**: Settings → Environments → `release` shows ≥1 required
  reviewer; dispatch a no-op test (`gh workflow run release-publish.yml -f
  tag=v0.1.15` — idempotent per tag) and confirm the run pauses on
  *Waiting for approval*; approve it and confirm the re-publish is
  byte-idempotent (same 8 assets, `create-or-update`).

## Step 5 — Discussions triage (16 discussions, 14 unanswered)

Phase 64 measured: 16 discussions, 6 categories, **14/16 zero-comment**,
100% founder-authored — the single-participant-community risk (R-7: an
unanswered wall signals abandonment).

- **Action**: reply-or-close, each of the 14 unanswered threads:
  `https://github.com/VaerionLab/vaerion/discussions` → open each → post
  the status statement below → close only threads that are resolved,
  stale, or answered by it (closing is honest; leaving a reply is better
  than silence either way).
- **Reusable maintenance-status statement** (draft — adopt or adapt; do not
  post a commitment you will not keep):

  > Thanks for opening this — Vaerion is in **active maintenance**:
  > `v0.1.15` is the General Availability release of record (signed, verified,
  > `docs/RELEASE-NOTES-v0.1.15.md`). This repository is maintained in
  > scheduled windows rather than continuously; a maintainer triages
  > Discussions and Issues in each window, so first responses may take days
  > to weeks. Security matters: use the disclosure channel in `SECURITY.md`.
  > Bugs with a measured repro are gold — include `vae --version`, the
  > command, and the E-code; the error catalog (`docs/TROUBLESHOOTING.md`)
  > answers many questions directly.

- ✅ **Verify**: Discussions list shows 0 threads with zero maintainer
  responses (or each closed with one); spot-check that replies carry no
  claims the registry/website don't measure (D-Z-2 applies to prose
  everywhere).

## Step 6 — (Optional) GitHub private vulnerability reporting

Closes Phase 64 TD-13 alongside the unprovisioned `auren@vaerion.dev` mail
domain (measured unreachable) — today `SECURITY.md` honestly pre-declares
that no working channel exists (RISK-LEDGER R-7).

- **UI path**: Repo → *Security* tab → *Vulnerability reporting* (or
  Settings → General → Security → **Enable private vulnerability
  reporting**).
- **Follow-up edit** (one commit, after enabling): `SECURITY.md` gains the
  GitHub channel as a second disclosure route; the R-7 history line stays —
  the honest pre-declaration is part of the record, and the ledger exit is
  recorded, not erased.
- ✅ **Verify**: the *Report a vulnerability* button renders on the Security
  tab from a logged-out session; SECURITY.md names it.

## Step 7 — Delta re-audit and window close

Re-run the Phase 63 **Stage 1** (Repository Freshness) + **Stage 6 (Public
Surface)** checks as a delta — cheap by design (§6.4 of the final
recommendations):

| Check | How | Pass |
|---|---|---|
| Census | top-level entry + file count, version-register surfaces (`git grep -c '0\.1\.15'` sample), rc1 census class unchanged | matches the Era II close state; no new version deviations beyond the known ledger |
| Link check | the dead-ref class (Phase 64 TD-12: 17 dead internal refs incl. leaked private paths) + the 5 broken links — sweep root docs for `docs/ga/`, `docs/operations/`, and `reports/`-prefixed references; every hit must now resolve in-tree or be excised | 0 broken internal links |
| Visitor matrix | repo HEAD / PyPI / npm / website versions — the four doors of Phase 64 §9 | ≤ 2 distinct version stories, and each door's story is measured-true (D-Z-2): target after Steps 2+3 = repo 0.1.15, PyPI 0.1.15, npm 0.1.15, site 0.1.15 |
| Gate identity | `bun run tools/verify.ts` at merged `main` | exit 0, 719/0/62 |

Then close the Era II window: append the window-close worklog entry
(census + link + matrix numbers), mark the TD-2/TD-5/TD-13/TD-14 ledger
rows with their closing evidence, and archive the packet
(`release/v0.1.15/` is the GA packet of record from here on — the rc1
packet stays as the executed rc train's DRAFT kit).

---

*Assembled 2026-10-19 in the Era II synchronization program. Every claim
above cites a measured value from Phase 63/64 or a live re-measurement;
nothing estimated.*
