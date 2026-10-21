# Launch Kit — index

| | |
|---|---|
| **Status law** | Every file in this kit is a DRAFT. **Nothing is published without the Founder's written approval** — the same gate that governs npm/PyPI publication, `vaerion.dev`, and the Discord server (`docs/founder/FOUNDER-PACKETS.md`; constitution P4: automation proposes, humans dispose). |
| **Number law** | Every number must be re-measured from `site-data/vaerion-status.json` at publish time. A stale number is a false claim. |
| **Voice law** | `brand/BRAND-BOOK.md` §10 — engineered, declarative, exact. No exclamation marks, no hype, no emoji in body copy (Discussion category names excepted). |

## The files

| File | Purpose | Owner | Status |
|---|---|---|---|
| `LAUNCH-ANNOUNCEMENT.md` | The blog-style launch announcement: problem → what Vaerion is → proof story → measured numbers → honest install → what it is NOT → links | Founder | DRAFT — Founder approval required |
| `PRODUCT-HUNT.md` | Product Hunt kit: tagline, 5 gallery slides, maker comment, 3 FAQs, topics | Community (posts), Founder (approves) | DRAFT — Founder approval required |
| `HACKER-NEWS.md` | Show HN title, submission text, and 8 first replies anticipating HN questions honestly | Community (posts), Founder (approves) | DRAFT — Founder approval required |
| `SOCIAL-POSTS.md` | X thread (4 tweets ≤280 chars), LinkedIn, Reddit r/LocalLLaMA + r/devops, Mastodon, 2 receipt-quote posts | Community (posts), Founder (approves) | DRAFT — Founder approval required |
| `DEMO-SCRIPT.md` | The 90-second terminal demo: timestamped beats, expected output shapes, 30-second cut, recording palette and notes | Founder (records the engine), Community (may re-record) | DRAFT — Founder approval required |
| `FOUNDER-INTRODUCTION.md` | First-person founder text for the pinned launch post and About page | Founder | DRAFT — Founder approval required |
| `PACKAGE-DESCRIPTIONS.md` | Ready-to-paste npm/PyPI/GitHub/Homebrew/winget registry texts with honest status lines | Founder (paste happens at a Founder-approved release step) | npm/PyPI/GitHub-Release texts EXECUTED — npm published 2026-10-21; PyPI + signed GitHub Release 2026-10-17; texts updated to published truth 2026-10-21. Homebrew/winget remain DRAFT — Founder approval required |
| `RELEASE-PAGE-DESIGN.md` | Release-page template for v0.1.13-rc1+: verification-first body, assets table, badges, upgrade notes | Founder (published by the release train) | DRAFT — Founder approval required |

## Community surfaces (planned — created at the release train)

| File | Purpose | Owner | Status |
|---|---|---|---|
| `community/DISCORD-STRUCTURE.md` | Discord plan: channels, roles, bot policy, moderation per `CODE_OF_CONDUCT.md`, launch checklist. The server does not exist yet. | Founder (creates), Community Mod (operates) | DRAFT — server is Founder-gated; the v0.1.15 release train has run (2026-10-17) and the server is still unprovisioned |
| `community/GITHUB-DISCUSSIONS-PLAN.md` | Discussions setup: categories (incl. 📣 Refutations & counter-evidence), templates, issue routing, enable checklist | Maintainer (executes), Founder (approves) | DRAFT — 4 categories measured live; the 5th + templates need Founder approval |
| `.github/ORG-PROFILE.md` | Organization profile README for the `VaerionLab/.github` repo: one-liner, pinned repos, trusted-builder line, contact | Founder | DRAFT — Founder approval required |

## Publishing order (when approval lands)

1. Release train runs (tag → signed artifacts → GitHub Release) — the
   announcement of record per `docs/operations/ANNOUNCEMENTS.md`.
2. `LAUNCH-ANNOUNCEMENT.md` posts (blog), numbers re-measured.
3. Show HN and Product Hunt within the same window; maker comment first.
4. Social posts follow the launch, never precede it.
5. `PACKAGE-DESCRIPTIONS.md` texts are pasted **only during** a
   Founder-approved registry publish step. (Executed for `v0.1.15`:
   npm published 2026-10-21; PyPI + GitHub Release 2026-10-17. Future
   trains repeat this step.)
6. Discord server creation and Discussions structural change execute per
   their checklists.

No step in this kit may publish before the step above it has happened.
