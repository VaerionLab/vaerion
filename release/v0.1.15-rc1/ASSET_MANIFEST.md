# DRAFT — Asset manifest, release `v0.1.15-rc1`

> **DRAFT — pending Founder publish.** Status legend: DRAFT = prepared this
> phase (62-c, 2026-10-04), awaiting Founder review/publish; FINAL = measured
> artifact/record of record. Owner: **62-c** (this phase's agent) for drafts,
> **Founder** for publish actions, **Orchestrator** for commits/merges.
> Nothing in this manifest has been published, pushed, or deployed.

## Release assets — `release/v0.1.15-rc1/`

| File | Purpose | Status | Owner |
|---|---|---|---|
| `GITHUB_RELEASE.md` | GitHub release body draft for tag `v0.1.15-rc1` (what shipped, verification, limitations, upgrade) | DRAFT | 62-c → Founder reviews at publish |
| `NPM_RELEASE_NOTES.md` | npm package-page / publish-notes draft (concise, factual) | DRAFT | 62-c → Founder |
| `MIGRATION_GUIDE.md` | 0.1.14-rc1 → 0.1.15-rc1 behavioral deltas (two populations), exit codes, E1010 semantics, rollback | DRAFT | 62-c |
| `UPGRADE_GUIDE.md` | Install/upgrade paths (fresh vs existing), channel map, verify-what-you-got habit | DRAFT | 62-c |
| `KNOWN_LIMITATIONS.md` | The honest limitations ledger for this release (16 items, labeled Measured/Last-known/UNVERIFIED) | DRAFT | 62-c |
| `VERIFICATION_EVIDENCE.md` | Evidence index — every load-bearing number with its source path | DRAFT | 62-c |
| `RELEASE_CHECKLIST.md` | Founder publish runbook: pre-gates, publish commands, post-publish verification, abort criteria | DRAFT | Founder executes |
| `ASSET_MANIFEST.md` | This table | DRAFT | 62-c |
| `evidence/MEASURED-2026-10-04-62c.md` | Verbatim fresh-measurement transcript (gates 719/0, determinism ×2, parity refusal + pass, registry state, debris procedure) | FINAL (transcript of measurements taken) | 62-c |

## Launch media plans — `release/v0.1.15-rc1/media/`

| File | Purpose | Status | Owner |
|---|---|---|---|
| `SCREENSHOT_CHECKLIST.md` | Every launch screenshot: subject, exact reproduction commands, viewport, visibility rules, filenames. NO images produced. | DRAFT (plan) | 62-c → media producer (Founder-authorized) |
| `TRAILER_STORYBOARD.md` | 45–60 s release trailer, scene by scene, real terminal states only | DRAFT (plan) | 62-c → media producer |
| `ANNOUNCEMENT_ASSETS_SPEC.md` | Social graphic specs per platform, brand tokens sourced, factual copy rules | DRAFT (plan) | 62-c → media producer |
| `TRUST_DIAGRAM_SPEC.md` | Trust/verification flow diagram spec (nodes/edges/labels from measured behavior) | DRAFT (spec) | 62-c → diagram artist |
| `trust-flow.svg` | Hand-written SVG derived from the spec (marked derived-from-spec) | DRAFT (derived) | 62-c → diagram artist validates |
| `COMPARISON_SPEC.md` | Honest capability-category comparison spec (no competitor names; every cell defensible) | DRAFT (spec) | 62-c |

## The artifact itself (not in this directory — referenced)

| Asset | Location | Status | Owner |
|---|---|---|---|
| `vaerion-0.1.15-rc1.tgz`, sha256 `bd2e5d56…90371` | built by `packaging/npm/make-package.sh` into `dist/npm/` (gitignored) — rebuild + re-verify at publish time per `RELEASE_CHECKLIST.md` Stage 1 | FINAL (deterministic ×2 this epoch; parity-proven) | Founder publishes |
| Tag `v0.1.15-rc1` | local git (does not exist yet — created at Stage 1) | pending | Founder |
| Signed release set | `tools/dist-pack.ts` output (built at publish) | pending | Founder |
| CHANGELOG `[0.1.15-rc1]` section | `CHANGELOG.md` (already committed at `dba7fbb` — referenced, not rewritten) | FINAL | Orchestrator |

## Deliberately NOT produced (and why)

- **No actual screenshots, trailer footage, or social graphics** — fake media
  is prohibited; the live site still tells the 0.1.14 story and the registry
  serves 0.1.14-rc1, so "final" media would depict unreleased states. Plans
  and specs only.
- **No announce copy for social platforms** — the existing
  `launch-kit/social/` + `launch-kit/p572-*.md` drafts are stale (0.1.13-rc1
  references, old expectation counts — 61.2 stranger-test finding); regenerating
  them is a post-publish task gated on Founder authorization, noted in
  `RELEASE_CHECKLIST.md` §After the release.
- **No changes to engine source, docs/, site, CHANGELOG, or launch-kit** —
  hard scope rule of this task; all needed follow-up edits are specified in
  `RELEASE_CHECKLIST.md` Stage 4 instead.
- **No SVG trust diagram beyond the one hand-written from the measured
  spec** (`trust-flow.svg`) — kept minimal and factual; anything richer
  needs a diagram artist working from `TRUST_DIAGRAM_SPEC.md`.
