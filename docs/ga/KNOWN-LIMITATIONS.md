# Known Limitations — the honest remainder at RC-1

Every limitation below is recorded where it is measured or decided; this
page is the consolidated GA-decision view. No item here is hidden elsewhere,
and no item here is fixable by declaration — each names its owner.

| # | Limitation | Why it exists | Authority / evidence | Owner |
|---|---|---|---|---|
| 1 | **GitHub canonicalization is not done** — no remote configured, no credential in the environment; the repository has never been pushed | The sandbox provides no remote and no credential; fabricating sync state is forbidden | `git remote -v` (empty); worklog records the block every sprint; [`RELEASE-CHECKLIST.md`](RELEASE-CHECKLIST.md) step 3 has the exact provisioning commands | **Founder** (provisioning) |
| 2 | **External validation is not burned down** — zero beta reports exist; the cohort charter is ready but no tester has been reached | No humans are reachable from the build environment | [`BETA-ONBOARDING.md`](BETA-ONBOARDING.md) (READY, awaiting humans); GO/NO-GO question 5 | **Founder** (cohort) |
| 3 | **Substrate ADR-0018 is still Proposed** — GA launch requires a ratified substrate decision | FOUNDER LAW: ratification is not an engineering act | [`ADR-0018-EVALUATION.md`](ADR-0018-EVALUATION.md) (measured evidence + options + recommendation); `site-data/vaerion-status.json` names the substrate "Proposed" | **Founder** (decision) |
| 4 | **Three performance budgets are breached on this substrate** — cold start 81.5 ms p50 (budget 60), hot path 113 ms p50 (budget 8), idle daemon 56.7 MB (budget 45); OBJ-Q1/Q5/Q6/Q7 pass | Process start + per-record fsync durability law + Bun runtime floor — measured and root-caused, not tuned away silently | [`PERFORMANCE.md`](../../PERFORMANCE.md) (generated); [`ADR-0018-EVALUATION.md`](ADR-0018-EVALUATION.md) §2 | Founder via ADR-0018 (re-baseline or re-platform) |
| 5 | **Bundles are unsigned** — cosign is optional/additive; trust policy is the consumer's choice until a signing policy is ratified | ADR-0016 decision 4 | [`SECURITY-HARDENING.md`](SECURITY-HARDENING.md) §6 | Founder (signing policy) |
| 6 | **Env-fallback secrets** (ADR-0013) are weaker than the keychain path | Documented fallback for machines without a keychain; `doctor` surfaces the resolution source | [`SECURITY-HARDENING.md`](SECURITY-HARDENING.md) §1, §6 | Recorded (accepted risk) |
| 7 | **External distribution channels are not published** — npm / GitHub Releases require the remote + credentials + a ratified release process | Same provisioning gap as #1; the changelog states honestly where the engine is installable from | [`CHANGELOG.md`](../../CHANGELOG.md) distribution-status paragraph; [`RELEASE-CHECKLIST.md`](RELEASE-CHECKLIST.md) step 4 | **Founder** |
| 8 | **Provider price table is build-time data (2026-08)** — provider price changes are data updates with a reviewed contract change, not live feeds | Determinism over freshness (P2) | `ROADMAP_PROGRESS.md` technical risks; spec metering contract | Engineering (post-GA cadence) |
| 9 | **Breaker state is per-process** — deliberately not journaled; the serial run queue keeps audit chains sound, but multi-process sharing needs an ADR | Single-writer hash chains must not gain concurrent writers without a ratified design | `ARCHITECTURE_REPORT.md` §4, §13 | Engineering (ADR required) |
| 10 | **`bun.lock` workspace version strings are not synced** by bun 1.3.14's generator | Upstream generator limitation; resolution is unaffected (`workspace:*` authoritative) | VERIFICATION_REPORT honest limitations | Upstream / recorded |
| 11 | **Branch coverage is measured on the total text table** while lines/functions are measured on the CORE lcov set — two documented bases | bun's lcov emits no branch records; mixing bases silently would be dishonest, so both are named | `tools/verify.ts` + VERIFICATION_REPORT §4 | Recorded (measurement law) |
| 12 | **No real-provider planning cassette yet** — ModelPlanner's end-to-end golden coverage awaits a recorded cassette (network); MockBrain is hermetic by design | Network access + credentials required to record through the real adapters | `scripts/record-cassettes.ts`; status risks | Engineering (when network exists) |
| 13 | **The engine is UNLICENSED** until the Founder ratifies a distribution license | FOUNDER LAW: licensing is not an engineering act | [`CONTRIBUTING.md`](../../CONTRIBUTING.md); [`BETA-ONBOARDING.md`](BETA-ONBOARDING.md) trust contract | **Founder** |
| 14 | **No native single-binary distribution at GA** — the RC ships as a verified source checkout + reproducible tarball | The static-binary goal belongs to the ratified distribution substrate (post-GA work bounded by contracts) | [`ADR-0018-EVALUATION.md`](ADR-0018-EVALUATION.md) §3 | Founder via ADR-0018 |

Items 1–3 and 7 are the GA GO/NO-GO gates (Founder-gated). Items 4–6 and
13–14 are recorded decisions awaiting Founder ratification. Items 8–12 are
engineering-owned and bounded by law; none blocks a local release train
rehearsal, which has been executed on the frozen tree
([`RELEASE-CHECKLIST.md`](RELEASE-CHECKLIST.md) steps 0–2, measured).
