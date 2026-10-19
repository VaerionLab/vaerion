# npm Publish Runbook — Path A (Founder-gated), `vaerion@0.1.15`

> The canonical procedure is **Phase 63 / Stage 8 §2, "Path A — execute the
> npm publish"** (the Phase 63 final-consistency report, cited by phase and
> title — the phase reports of record live in the private workspace; their
> public evidence lands in `docs/ga/` and this packet); this file restates
> it exactly and self-contained so the Founder needs no other document. Path A is one of two adjudicated outcomes of the npm
> decision gate (Phase 63 P0-1); **Path B (lag-honest revert) is what the
> tree says today** (`docs/constitution/VAERION_CONSTITUTION_v1.8.md`, D-Z-2
> — the registry truth law). Executing THIS runbook supersedes Path B.
>
> Publishing is **[FOUNDER]**-only at every step that touches the registry
> (publish law: risk-ledger F-5 class; no automation and no agent may run
> it). Measured registry pre-state: npm `vaerion` versions
> `[0.1.13-rc1, 0.1.14-rc1]`, dist-tags `{rc: 0.1.14-rc1, latest:
> 0.1.14-rc1}`, `time.modified` 2026-09-28 — **no 0.1.15 event exists**
> (measured twice by Phase 63/64, re-measured 2026-10-19).

---

## Prerequisites

1. **npm token** with publish rights to the `vaerion` package
   (`vaerionlab` scope owner). Logged in on the publishing machine
   (`npm whoami` resolves; `npm token` not printed anywhere).
2. **GA checkout at the merged GA synchronization commit**: the `era-ii/
   synchronization` branch (this packet's branch) merged to `main` of
   `VaerionLab/vaerion`, working tree CLEAN (`git status --porcelain` is
   empty), `git log --oneline -1` shows the merge of record. The engine
   bytes are identical to `36e3da1` (the Era II commits are docs/evidence
   packets and one workflow line) — Step 2 proves it mechanically.
3. **Bun ≥ 1.3.14** on the publishing machine (the verified substrate).
4. No credentials in the tree: the npm token lives in the agent/npm config
   only — never in any file.

## Steps

### 1. Install proof (supply-chain law)

```sh
bun install --frozen-lockfile
```

Must exit 0 without lockfile churn (`git status --porcelain` stays empty).
A lockfile that installs unfrozen or mutates ⇒ **STOP** (the GA tree's
`bun.lock` must be the lock that installs; diagnose before anything else).

### 2. Rebuild the publish input (deterministic)

```sh
sh packaging/npm/make-package.sh
sha256sum dist/npm/vaerion-0.1.15.tgz
```

- **The Phase 63 measured value of the 0.1.15 publish input is sha256
  `c6361622d2872c09…`** (measured 2026-10-18, Phase 63 Stage 4; the full
  digest is in the private phase ledger, deliberately not reproduced here —
  verify by rebuilding, never by copying a trust root).
- Rebuild once more (`sh packaging/npm/make-package.sh` again) — the two
  builds must be **byte-identical** (the packaging is deterministic; this is
  the same law the signed set uses).
- If your hash does not **begin with** `c6361622d2872c09`: the engine bytes
  differ from the audited GA tree ⇒ **ABORT** and diagnose (expected cause:
  a dirty tree, or engine files changed after 36e3da1 — the Era II program
  touched none).

### 3. Artifact-parity gate (SOURCE = PACKAGE)

```sh
bun test packages/vaerion/tests/integration/artifact-parity.test.ts
```

Exit 0 required: the pins prove the packed artifact matches the tree
surface-for-surface (29 commands, 7 templates, E1010 anchor, dead files
absent, install-honesty disclosures present). A refusal here is the system
working — read it; do not work around it.

### 4. Publish **[FOUNDER]**

```sh
npm publish dist/npm/vaerion-0.1.15.tgz
```

`0.1.15` is a stable version, so npm places it under dist-tag **`latest`**
by default — do not pass `--tag rc`; do not add extra dist-tags. A 409
(version exists) means the publish already happened — investigate before
any further action; never re-publish or force.

### 5. Post-publish registry verification

```sh
npm view vaerion dist-tags   # → { latest: '0.1.15', rc: '0.1.14-rc1' }
npm view vaerion time        # → gains the 0.1.15 publish event (today's date)
```

Optional but recommended (the rc1 precedent): install from the registry into
a clean prefix and run the golden path + the E1010 attack
(`release/v0.1.15-rc1/GITHUB_RELEASE.md` §Verification — commands unchanged,
version `0.1.15`): the registry artifact must behave like the parity-proven
candidate.

### 6. THE POST-PUBLISH FLIP COMMIT — lag-honest → published-truth, ONE commit window

This is the D-Z-2 law in action: **prose, test pins, and facts flip together
— never one side alone.** Every surface below currently asserts the
lag-honest truth ("the npm registry delivers `0.1.14-rc1` on `rc`+`latest`
until the `0.1.15` publish executes (Founder-gated)"); after the publish
(each of steps 1–5 done) that sentence is false and must move to
published-truth in a single commit. Line numbers are as measured
2026-10-19 on the Era II branch — the grep sweep after the table is the
canonical finder if lines have moved:

| # | Surface | What flips |
|---|---|---|
| 1 | `README.md` | Install line + `vae --version` expectation (:63-64); the honest version note (:66-69); the **badge bridge** ("The npm badge above renders this same registry truth…" :70-72 — the shield now renders 0.1.15 by itself); the Roadmap npm paragraph (:195-202) |
| 2 | `INSTALL.md` + `docs/INSTALL.md` (byte-twins — edit both identically) | Channel-table npm row (:12), version-check output (:47), version note (:51), registry-lag line (:129) |
| 3 | `installation.md` + `docs/getting-started/installation.md` (twins) | Version note (:15, :19), channel table npm row (:70) |
| 4 | `docs/installation/README.md` | npm install line (:15), version-check output (:38) |
| 5 | `ROADMAP.md` | npm channel lines (:12, :21) |
| 6 | `CHANGELOG.md` | The `[0.1.15]` npm erratum line (:23-26) — replace with the publish-of-record note (registry event date), keeping the history law (append erratum, never rewrite history) |
| 7 | `docs/RELEASE-NOTES-v0.1.15.md` | The npm erratum block (:55-59), the channel-table npm row (:48), the Install block npm line (:64) |
| 8 | `docs/LIMITATIONS.md` | **F-5** (:106-115): npm moves from "LIVE BUT LAGS" to LIVE — `vaerion 0.1.15` under `latest` (measured date) |
| 9 | `docs/QUICKSTART.md` | The honest version note (:33, :41) and the taught `vae --version` output (:30). Do NOT touch the `engine_version: 0.1.14-rc1` lines in example transcripts (:89, :144) — those are template-era output samples, not registry claims |
| 10 | `src/components/site/facts.ts` | npm status strings (:113 release status, :121 channel row, :285 FAQ answer) — flip all three to the same published-truth sentence |
| 11 | `src/components/site/pages/FaqPage.tsx` (:59) and `DevelopersPage.tsx` (:100) | npm registry-truth sentences |
| 12 | `src/app/_components/landing.tsx` | registry-lag sentences (:196, :487, :672, :756). The "measured on 0.1.14-rc1" epoch stamps (:74, :445, :521) are historical epoch labels — they stay |
| 13 | `BETA-ONBOARDING.md` | The npm publish clause in the beta-end condition (:88-89) |
| 14 | `.github/ORG-PROFILE.md` | Channel-table npm row (:44) |
| 15 | `SUPPORT.md` | The `vae verify` parenthetical (:45-47) — the npm-delivered engine now has the command |
| 16 | `ENTERPRISE_TRUST_MATRIX.md` | The 2026-10-19 npm erratum (:5) — the Q2 npm bullet's "GA shipped" claim becomes measured-true; keep the erratum line as history or convert it to a measured note per the frozen-copy law |
| 17 | `packages/vaerion/tests/integration/artifact-parity.test.ts` | The install-honesty pins (:128-129: README + docs/QUICKSTART anchors) move with the prose — pin the NEW truth; the **negative tripwires** (:134-138) invert: today they forbid the published-truth sentence (`0.1.15` under `latest`) from the pinned surfaces, after the flip they must forbid the stale lag sentence from returning |
| 18 | `integrations/mcp/README.md` | The `mcp` version note (:46-48) — the npm-delivered engine now ships `vae mcp` (named by Phase 63 §2 Path A alongside SUPPORT.md/facts.ts) |

Canonical sweep so nothing hides:

```sh
grep -rn --include='*.md' --include='*.ts' --include='*.tsx' \
  '0\.1\.14-rc1' README.md INSTALL.md installation.md docs/ src/ \
  integrations/ BETA-ONBOARDING.md .github/ORG-PROFILE.md SUPPORT.md \
  ENTERPRISE_TRUST_MATRIX.md | grep -v 'LEGIT\|epoch\|measured on'
```

Every hit is either a registry-truth sentence (flip it) or a
LEGIT-HISTORICAL epoch stamp (leave it — the rc1 census law, Phase 63 Stage 1).

**Not in scope of the flip (stated so it is a decision, not an oversight):**
- `tools/status.ts` / site-data regeneration — **not needed**: the npm
  channel in the status layer is a milestone note, not a registry-queried
  value; `tools/status.ts` reads only `.vaerion-verification.json`. (If a
  status regen happens for other reasons it must come from a green gate run
  — the ci-truth law forbids hand-editing generator outputs.)
- The `docs/QUICKSTART.md` engine_version samples, `bun.lock` workspace
  entries, and CHANGELOG history rows — LEGIT-HISTORICAL / separate law.

Then:

```sh
bun run tools/verify.ts        # exit 0 — the flip must land green
```

Commit in ONE commit (subject convention of the branch:
`docs(truth): npm Path A executed — published-truth across every living surface`),
push via PR (branch protection runs `verification (all gates)`), and merge.
**Then** redeploy the website so the site surfaces ship the published-truth
(`DEPLOYMENT-RUNBOOK.md` — the site deploys only from a clean tree).

## Abort criteria

1. Step 1 installs unfrozen or mutates the lockfile.
2. Step 2's sha256 does not match the `c6361622d2872c09…` prefix, or the two
   rebuilds differ.
3. Step 3 exits non-zero — read the refusal; the parity gate is refusing for
   a reason (the 62.0 precedent: it caught real contamination).
4. `npm publish` rejects with anything other than 409.
5. Step 5's `dist-tags`/`time` do not reflect the publish.
6. The flip commit cannot land green (`bun run tools/verify.ts` exits
   non-zero) — the prose and the pins disagree; fix both sides in the same
   commit, never the prose alone.

## The law being executed

> **D-Z-2 (registry truth law, constitution v1.8 A8):** a distribution
> channel's prose may claim only what that channel's registry measures. At
> the v1.8 window npm delivers `0.1.14-rc1` on `rc`+`latest` while PyPI
> delivers `0.1.15` — living documentation says LIVE BUT LAGS for npm and
> LIVE for PyPI. **When a publish lands, prose, test pins, and facts flip
> together in one commit window — never one side alone.**

Executing this runbook converts Path B's honest lag into Path A's honest
publication; skipping Step 6 converts it back into the Phase 63 defect
(docs asserting a registry state that does not exist). Neither half-state
is acceptable.
