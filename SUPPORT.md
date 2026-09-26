# Support

Vaerion is a local-first, AI-native development engine, currently a public beta
(engine `0.1.13-rc1`). Support is grounded in the repository's own surfaces —
measured, never assumed.

## Start here (documentation)

- `docs/QUICKSTART.md` — the guided first journey (15 minutes, teaches the
  derived demo default).
- `docs/INSTALL.md` — install / update / uninstall across the verified channels
  (universal installer, npm with user-prefix fallback, Python wheel).
- `docs/TROUBLESHOOTING.md` — the E-code diagnostics catalog: what each error
  means and its fix.
- `docs/FAQ.md` — frequent questions.
- `CONTRIBUTING.md` — how to contribute, and the community surfaces
  (Discussions, Discord, issue templates) that go live with the release
  train.

## Self-diagnostics on the CLI

The command surface of record is `vae --help` (run `bun run vae --help` inside
`packages/vaerion/`, or `vae --help` once installed). The diagnostic surfaces:

- `vae doctor` — verify config, journals, blobs, audit chain, gateway matrix
  (no phone-home).
- `vae journal verify RUN_ID` — recompute a run's journal chain.
- `vae dev` — engine status: version, layers, gateway matrix, milestone position.
- `vae explain RUN_ID` — reconstruct a run's narrative from its journal.
- `vae center` — the operator cockpit: runs, receipts, metering, integrity
  (read-only).
- `vae tour` — a guided, read-only walk of the engine.

Exit codes: `0` ok · `1` internal · `2` usage · `3` broker-denied ·
`4` provider-down · `5` partial-with-repair-hint.

Note: there is no top-level `vae verify` command; verification subcommands exist
under `journal`, `package`, and `repo` (e.g. `vae journal verify RUN_ID`).

## Reporting a problem

Open an issue on the repository of record:
`https://github.com/VaerionLab/vaerion/issues` (the repository is
public). Use the issue templates (bug report / feature request / config
report) and include the measured evidence they ask for: the verification
record (`.vaerion-verification.json`), exit codes, and the engine version
from `vae --version`.

For questions, usage help, and ideas, use the Discussions structure on the
same repository (enablement measured during the ASCENSION XXV campaign):

| Surface | Use it for |
|---|---|
| [Q&A](https://github.com/VaerionLab/vaerion/discussions/categories/q-a) | "How do I…" — usage help from the community |
| [Ideas](https://github.com/VaerionLab/vaerion/discussions/categories/ideas) | feature proposals before an issue exists |
| [Announcements](https://github.com/VaerionLab/vaerion/discussions/categories/announcements) | release notes and campaign closures from the maintainer |
| [Show and tell](https://github.com/VaerionLab/vaerion/discussions/categories/show-and-tell) | what you built with Vaerion |

Announcements are posted by the maintainer; the GitHub Release is the
announcement of record.

Security findings are the exception: report them privately — see `SECURITY.md`.
Never open a public issue for a security finding.

## Scope honesty

- This is a beta: performance is unoptimized and some platform hardening is
  tracked openly (`docs/security/RISK-LEDGER.md`).
- Cross-version upgrade is UNVERIFIED as of the Empty Machine Test of
  record; same-version upgrade and clean removal are measured.
- No hosted support channel (chat, forum, hosted email desk) is provided by
  this repository today. GitHub Discussions Q&A is the community help
  surface; a hosted desk remains unprovisioned and will be listed here if
  it ever lands.
