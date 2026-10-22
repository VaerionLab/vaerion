# The Announcement Flow — how a release reaches the world

| | |
|---|---|
| **Document** | The release-communication loop of record: what is announced, where, and in what order |
| **Scope** | Every published release (see `docs/operations/DEPLOYMENT.md` §2 for the pipeline that precedes announcement) |

## 1. The loop (in order)

1. **The GitHub Release itself is the announcement of record** — published by
   `release-publish.yml` with the release notes of record as the body
   (`docs/RELEASE-NOTES-<version>.md`), the signed artifact set attached, and
   the honest prerelease flag for `-rcN` tags.
2. **The Announcements discussion** — within the same release window, the
   maintainer posts a summary to
   [Announcements](https://github.com/VaerionLab/vaerion/discussions/categories/announcements)
   linking the release: the headline (one sentence), the trust-chain state
   (production key fingerprint unchanged? rotation happened?), and the
   upgrade path section from the notes. Comments stay open; questions move to
   Q&A (one topic, one surface).
3. **The README status of record** — the repository landing surface carries
   the release truth of record (the Roadmap section states that `v0.1.15` is
   **general availability** with 9/9 gates green, plus the npm/PyPI registry
   truth); it is updated in the same commit window as the release. (2026-10-22
   correction: the README carries no `Status: PUBLIC BETA` badge line — the
   landing truth of record is the GA statement.)
4. **The CHANGELOG** — already updated before the tag (the version-register
   test refuses a release whose changelog entry is missing); it is the
   cumulative announcement history.

## 2. What is deliberately NOT announced

- Registry publications that have not happened (F-5 is announced when it is
  real — never before).
- Benchmarks or performance claims outside the measured, CI-gated budget
  report.
- Anything the release notes themselves do not claim: the notes are the
  announcement's source of truth, not a marketing layer.

## 3. Tone law

Announcements follow the repository's honesty law: what shipped, what was
measured, what remains. An announcement that outruns its release notes is a
defect — the same "never convert UNVERIFIED into VERIFIED" rule applies to
communication, not just to code.

*Repository reality wins. Constitution wins. Evidence wins.*
