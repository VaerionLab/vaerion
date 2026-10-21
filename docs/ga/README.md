# The GA Dossier — Release Candidate 1 preparation

Everything the General Availability decision needs, in one governed place.
This directory is part of the C8 docs-drift law: every relative link in it
must resolve, like any other documentation in the repository.

> **Update (2026-10-21):** the dossier below was written for the Release
> Candidate 1 preparation epoch — the GO/NO-GO record's "**currently
> NO-GO**" state dates from that snapshot. The GA decision has since been
> **executed**: v0.1.15 (GA, 2026-10-17) is the release of record — see
> `FOUNDER-GO-NO-GO.md`, `CHANGELOG.md`, and
> `docs/RELEASE-NOTES-v0.1.15.md`. The table below indexes the RC-1
> dossier core; the directory now holds the full 34-record GA audit
> archive beneath these entries.

| Document | What it is |
|---|---|
| [`ADR-0018-EVALUATION.md`](ADR-0018-EVALUATION.md) | the substrate decision package — measured budget evidence, options, advisory recommendation, **Founder decision box** |
| [`RELEASE-CHECKLIST.md`](RELEASE-CHECKLIST.md) | the release train runbook: freeze → gates → artifact → reproducibility → GitHub canonicalization → channels → post-release proof |
| [`BETA-ONBOARDING.md`](BETA-ONBOARDING.md) | the external validation charter (MS-6's remaining 10%): cohort of ≥ 10 testers, onboarding sequence, feedback system, exit criteria |
| [`SECURITY-HARDENING.md`](SECURITY-HARDENING.md) | the hardening evidence record: secrets, permissions, extension boundaries, package integrity, supply chain — every claim gate-traced |
| [`FINAL-ARCHITECTURE-REVIEW.md`](FINAL-ARCHITECTURE-REVIEW.md) | the GA architecture sweep: layer model, singular seams, determinism, parity, and the honest boundaries — every verdict gate-traced |
| [`KNOWN-LIMITATIONS.md`](KNOWN-LIMITATIONS.md) | the consolidated honest remainder: every limitation, why it exists, its evidence, and its owner (Founder vs engineering) |
| [`GO-NO-GO.md`](GO-NO-GO.md) | the live GO/NO-GO record — currently **NO-GO** on two Founder-gated items, with the decision log |

Root-level companions: [`CHANGELOG.md`](../../CHANGELOG.md),
[`CONTRIBUTING.md`](../../CONTRIBUTING.md), [`SECURITY.md`](../../SECURITY.md),
[`CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md), the issue/PR templates under
`.github/`, and the test-proven example at
[`examples/vaerion/`](../../examples/vaerion/README.md).
