# Discord Server Structure — plan (Founder approval required to create)

| | |
|---|---|
| **Status** | DRAFT — the server does not exist yet. It is created at the release train (Founder-gated). This document is the build plan, not an invitation. |
| **Conduct of record** | `CODE_OF_CONDUCT.md` — applies to all project spaces including any future community surface |
| **Voice law** | Engineered, declarative, exact |

> **Explicit honesty note.** No Discord server exists for Vaerion today.
> There is no invite link anywhere, and none is published until the
> server is created at the release train. `SUPPORT.md` remains accurate:
> GitHub Discussions Q&A is the community help surface of record until
> this plan executes.

---

## 1. Server identity

- **Name:** `Vaerion`
- **Icon:** the Ledger V seal, gold edition (`brand/official/official-app-icon-gold.png` — the official set of record)
- **Description:** "Local-first trust infrastructure for AI agents.
  Community space. Repo of record: github.com/VaerionLab/vaerion"
- **Verification level:** Medium (requires a verified email on the
  account) — enough to stop drive-by spam without adding friction.
- **No community for its own sake:** the repo and its releases remain
  the surface of record; the server is a conversation layer.

## 2. Channel layout

### Category — START HERE

| Channel | Type | Purpose |
|---|---|---|
| `#welcome` | Text, read-only | Onboarding embed: what Vaerion is, the repo link, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`. One pinned message states the honesty rule: state what you measured; label what you did not. |
| `#announcements` | Text, read-only for members | Release notes, launch materials, campaign closures. The GitHub Release is the announcement of record; this channel links it. |

### Category — COMMUNITY

| Channel | Type | Purpose |
|---|---|---|
| `#general` | Text | Community conversation. Support requests are redirected to `#support`; bugs to `#bugs`. |
| `#support` | Text | Usage help. The diagnostic ladder first: `vae doctor`, `vae journal verify`, `--json`, exit codes 0–5, E-codes (`docs/TROUBLESHOOTING.md`). Unresolved threads graduate to a GitHub Q&A discussion or issue — one topic, one surface. |
| `#bugs` | Text | Defect intake. A report is complete when it carries: the command, observed vs expected, engine version, and journal/receipt output. It becomes a GitHub issue (bug template) before any fix work is tracked. |
| `#feature-requests` | Text | Proposals start here. A proposal graduates to the GitHub Ideas discussion when it has a concrete, testable shape (per `CONTRIBUTING.md`), and to an issue once shaped. |
| `#showcase` | Text | What people built with Vaerion. Evidence encouraged: receipts, verified bundles, `--json` output. |

### Category — EVIDENCE (suggested, on brand)

| Channel | Type | Purpose |
|---|---|---|
| `#receipts-flex` | Text | The on-brand flex: post real terminal output — `vae journal verify` → `ok: true`, byte-identical `.vxn` digests, green gate runs. Fabricated output is a conduct violation, not a joke. |
| `#governance-design` | Text | Discussion of broker policies, durable gates, fail-closed design. Outcomes graduate to ADR proposals in the repo; decisions are recorded there, not in chat. |

No voice channels. Calm by law.

## 3. Roles

| Role | Who | Powers |
|---|---|---|
| **Founder** | Auren | Everything. Sole owner. Gates what is announced, exactly as every other Founder-gated surface. |
| **Maintainer** | Appointed by Founder | Announcement posting, category management, issue triage links. |
| **Community Mod** | Appointed by Founder; never self-granted | Moderation actions per `CODE_OF_CONDUCT.md`, redirection duty in `#general`. |
| **Verifier** | Any contributor with at least one merged PR | Measured, not vibes: the role is granted on the merge, automatically visible, and grants access to `#governance-design` and a Verifier badge. |
| **@everyone** | Default | Read/write in COMMUNITY channels; read-only everywhere else. |

## 4. Bot policy

- **No AI bots posting as humans.** Every automation holds the native
  Bot tag; a bot that could be mistaken for a person is removed on
  sight. This is on brand — the project's whole thesis is attributable,
  verifiable action.
- **No LLM-generated content presented as personal experience.** Members
  who paste AI-drafted text as their own testimony in `#receipts-flex` or
  `#showcase` are corrected once, then moderated.
- **Project bots, when any exist, are limited to:** release
  notifications in `#announcements`, CI/gate status mirroring, and issue
  link unfurling. Announcements via bot always link the GitHub Release
  of record.
- No cross-posting bots, no leveling/reward bots, no auto-responders in
  `#support` (answers come from people; the docs come from the repo).

## 5. Moderation

Governed by `CODE_OF_CONDUCT.md` without amendment:

- Reports go privately to the project owner, Auren — `auren@vaerion.dev`.
- Confirmed violations (harassment, attacks, fabricated evidence,
  impersonation, spam) can result in temporary or permanent removal, at
  the project owner's discretion.
- The engineering culture paragraph applies in chat verbatim: state what
  you measured; label what you did not. Uncertainty is labeled, not
  dressed.
- Security findings never belong in any channel. `SECURITY.md` — private
  disclosure only.

## 6. Launch checklist (executed at the release train)

1. [ ] Founder approval recorded (this document, plus the server's
       existence as a Founder-gated surface).
2. [ ] Server created; icon, description, verification level set per §1.
3. [ ] Categories and channels created per §2; `#welcome` and
       `#announcements` read-only for members.
4. [ ] Roles wired per §3; the Verifier grant documented (merged PR ⇒
       role, checked manually at first, automated later).
5. [ ] Community onboarding enabled: rules screen quotes
       `CODE_OF_CONDUCT.md`; membership screening requires accepting it.
6. [ ] `#welcome` embed filled: repo link, quickstart link
       (`docs/QUICKSTART.md`), honest install line (source or signed
       tarballs; npm/PyPI Founder-gated), security contact.
7. [ ] Pinned messages placed: the honesty rule in `#general`, the
       defect-intake checklist in `#bugs`, the proposal ladder in
       `#feature-requests`.
8. [ ] Invite link published only after the release train goes out —
       and only in `#announcements`-grade surfaces (release page, repo
       README, profile README). One canonical invite; no link shorteners.
9. [ ] `SUPPORT.md` updated in the same commit window to add the server
       without removing the Discussions surface of record.
