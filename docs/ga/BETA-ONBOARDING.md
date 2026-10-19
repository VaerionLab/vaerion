# Beta Onboarding — the external validation charter (MS-6 remaining 10%)

| | |
|---|---|
| **DoD it serves** | Blueprint M6: "beta cohort (≥ 10 testers) feedback burned down" |
| **Status** | READY — awaiting humans. This sandbox cannot reach testers; the cohort, install channel, and feedback loop are prepared so validation starts the day the Founder provisions access (see [`RELEASE-CHECKLIST.md`](RELEASE-CHECKLIST.md) step 3/4) |
| **Exit** | MS-6 reaches 100% when ≥ 10 testers have installed the RC, completed the smoke sequence, filed their reports, and every report is either burned down or converted into a tracked issue — measured in `ROADMAP_PROGRESS.md`, never narrated |

## Cohort charter

- **Size**: ≥ 10 testers (blueprint DoD); mix of CLI-first users, SDK
  integrators, and at least one extension author.
- **Profile**: developers comfortable with a terminal; no assumption of
  engine internals; each tester uses their own project(s), not a fixed
  corpus — real workloads surface real failures.
- **What testers get**: the 0.1.7 tarball (or the repository checkout until
  the GitHub remote is live), the book, and a named contact channel.
- **What we ask**: honesty over flattery — a bug report that does not
  reproduce is a gift, not an inconvenience.

## Onboarding sequence (what every tester runs)

```bash
# 0. install — either the tarball (after RELEASE-CHECKLIST step 1) or:
bun install && alias vae="bun run packages/vaerion/src/cli/vae.ts"

# 1. the ten-minute proof (book: tutorials/00-install.md, 01-init.md)
vae version && vae --help
vae init myproject && cd myproject
vae run demo                       # local research run through the full pipeline
vae journal verify                 # the hash chain holds
vae explain <RUN_ID>               # the whole narrative, from the journal alone

# 2. the agent loop (book: tutorials/02-first-agent.md)
vae run agent --goal "summarize this workspace" --planner inline --plan-json '...'
vae doctor                         # journals, blobs, audit, gateway — all local

# 3. the daemon + SDK (book: tutorials/03-workflow.md, guides)
vae serve                          # loopback-only; pairing token prints once

# 4. packaging (book: guides/packaging.md)
vae package build && vae package build   # byte-identical, reproducible
vae package verify .vaerion/package/<project>.vxn   # <project> = your vaerion.yaml project name

# 5. the worked example, committed and test-proven
#    examples/vaerion/ — every command in its README is executed by the engine's test suite
```

## Feedback system (what happens to reports)

1. **Bugs** → the `bug_report.yml` issue template (attestation checkboxes
   enforce the no-secrets law; redacted journal exports only). Every
   accepted bug follows the root-cause law: reproduce → prove the cause →
   fix architecturally → regression test → all gates re-run.
2. **Proposals** → `feature_request.yml`; additive-only contract evolution
   (ADR-0002/0003) applies; proposals that bypass the broker/journal/
   audit/replay path get redesigned or refused.
3. **Feedback ledger** — each sprint's `BUILD_REPORT.md` burns down the
   cohort findings it fixed and names the ones still open; the cohort sees
   the ledger, so nothing vanishes into a void.
4. **Exit interview** — each tester records: install friction (minutes),
   first-success time, top confusion, and a trust verdict. These become the
   GA launch collateral's "what early users found" section.

## Bug classification & severity (how reports are triaged)

| Class | Definition | Route |
|---|---|---|
| **S1 — integrity** | journal verify fails, replay diverges, a receipt or gate lies, a secret shape reaches output, or the broker/journal/audit path is bypassed | blocks GA; root-cause fix within the sprint; regression test mandatory |
| **S2 — functional** | a governed command/workflow crashes, hangs, loses data, refuses wrongly, or emits the wrong error code | blocks GA when reproducible on the frozen tree; fix + regression test |
| **S3 — usability** | incorrect or missing documentation, confusing output, friction in the onboarding sequence | burn down before GA or convert to a tracked issue with a named owner |
| **S4 — enhancement** | proposals and nicer-to-haves | `feature_request.yml`; additive-only contract evolution (ADR-0002/0003) |

Severity is assigned by reproduce-first triage: a report without a
reproduction is provisionally classed on the reporter's evidence and
re-classed the moment it reproduces. Every S1/S2 report carries the engine
version (`vae version --json`), a **redacted** journal export
(`vae journal export --redacted` — never raw journals or configs), and the
exact command sequence.

## Acceptance criteria (when a cohort finding is "done")

1. Reproduced on the frozen tree — or marked not-reproducible with the
   attempted matrix recorded.
2. Root cause identified and proven (ROOT CAUSE LAW) — no symptom patches,
   no silenced assertions, no lowered standards.
3. The fix lands with a regression test that fails without the fix.
4. All six gates green on the fix tree; reports + dashboard regenerated
   from measured evidence.
5. The cohort ledger in `BUILD_REPORT.md` names the finding CLOSED with the
   commit that closed it — or it stays open with its class and owner.

## Trust contract with testers

- Zero telemetry is structural (C6): nothing testers run phones home; the
  only data that reaches the project is what a tester explicitly files.
- Redaction is the sharing law: `vae journal export --redacted` strips
  secret shapes by design; testers never send raw journals or configs.
- The engine is UNLICENSED until the Founder ratifies a distribution
  license — cohort members evaluate under the Founder's pilot terms.
