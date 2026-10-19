# Vaerion Roadmap

> The measured status of record is [`ROADMAP_PROGRESS.md`](ROADMAP_PROGRESS.md) —
> generated from the engine's own measurement, never hand-edited. This file
> is the curated public view of the same truth.

## Now — General Availability `v0.1.15`

- 9/9 verification gates green — 719 engine tests passing (measured 2026-10-17 @ the `0.1.15` tree of record, incl. the 12-test journal-completeness attack suite), 0 failures · 5,246 expectations · 62 files
- The engine: event spine, fail-closed broker, blake3-chained journals, receipts, reproducible `.vxn` bundles
- The CLI (`vae` — now with `create`/`verify`/`start`/`mcp`, an interactive first-run prompt layer, and the 7-template registry incl. `enterprise`), five SDKs (TypeScript `@vaerion/sdk`, Python, Go, Rust, Java), the framework alliance (`vae mcp` + OpenAI Agents / LangGraph / CrewAI / AutoGen adapters), and the verification law (`tools/verify.ts`)
- Live: the repository of record (`VaerionLab/vaerion`), PyPI (`0.1.15`), and the signed GitHub Release; the npm channel is LIVE BUT LAGS — `0.1.14-rc1` on `rc`+`latest` until the `0.1.15` publish executes (Founder-gated, parity-proven before publish; measured 2026-10-19)

## Era II — Public Maintenance *(open — constitution v1.8, D-Z)*

GA is **executed** and reconciled with the law: `0.1.15` is the version of record, the verification record is GREEN — 9/9 gates, 719 pass · 0 fail · 5,246 expectations · 62 files — and amendment A8 (constitution v1.8, [§11](docs/constitution/VAERION_CONSTITUTION_v1.8.md)) declares Era II's standing program: maintenance, synchronization, and trust, with every claim re-measured before it repeats.

**Completed (Era I).** MS-0 → MS-6 (skeleton & law-in-repo, runtime spine, permission broker, model gateway, intelligence + agents, surfaces, packaging + hardening), the ASCENSION XVIII–XXVI hardening campaigns, and the GA execution itself. Evidence of record, all in-tree: [`docs/ga/`](docs/ga/) (burndown, go/no-go, release verification, audits, ASCENSION records), the amendment log (constitution §11), and [`PROVENANCE.md`](PROVENANCE.md) — the provenance of record for this curated republication.

**Next milestones.** Founder-gated residuals, enumerated in constitution v1.8 §7: the npm publish of `0.1.15` (the parity-proven artifact is prepared), the hosted domain, and the public disclosure channel. Next-train candidates: the spec-changelog subcheck wired as a verification gate (SI-8), SDK-conformance CI activation ([`.github/workflows/sdk-conformance.yml`](.github/workflows/sdk-conformance.yml) — authored as a non-required check; activation is a recorded decision), the template-dependency removal PR, and editor integrations.

**Technical debt register** (one line each, honest — the maintained ledgers, not this file, are the memory): the Phase 64 forensic ledger is dispositioned by the Era II program and recorded in amendment A8 (constitution §11); the shadow verification culture (`src/vaerion/testing/` + `tools/vaerion-pipeline/`) is intentional unmeasured tooling debt with a recorded revisit trigger (D-Z-3); the branches/statements coverage floors are currently unmeasurable by bun's reporter — floors held, no emission point; the website `src/` tree carries no tests or coverage floors. The honest inventory of what is measured and what is not remains [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md).

## Next — in order of record

1. **Agent-framework integrations** — ✅ DELIVERED (2026-10-01 @ `7e6b751`): the in-engine `vae mcp` stdio server (six tools over the real CLI contract) plus the alliance adapters for OpenAI Agents, LangGraph, CrewAI, and AutoGen in [`integrations/`](integrations/) — 31/31 tests against the real engine (7 + 8 + 8 + 8), every suite spawning a real `vae mcp` and asserting journals, receipts, and refusals.
2. **SDK ecosystem** — ✅ DELIVERED (2026-10-01 @ `7e6b751`): TypeScript, Python, Go, Rust, and Java SDKs over the loopback daemon wire in [`sdks/`](sdks/), each shipping the [`VAERION_SDK_STANDARD.md`](VAERION_SDK_STANDARD.md) §18 conformance battery with real-daemon integration — measured 16/16 (Python), 43/43 (Go), 27/27 (Rust), 40/40 (Java). Registry publication of the four new SDKs remains Founder-gated (see below).
3. **Verification tooling** — open: one-command verification exists per-run and per-bundle today (`vae verify`, `vae journal verify`, `vae package verify`, `vae provenance`); external anchoring/timestamping of receipts is **not** done.
4. **Enterprise controls** — open: the `enterprise` template seeds the governance scaffold (deny-by-default `policy.rules` with rationale-backed grants, budgeted model ceilings); the full organizational surface is still to build.

Not on the list above but still open, said plainly: SDK registry publication (crates.io / Maven Central — Founder-gated; PyPI is **live** — `vaerion 0.1.15`), and external receipt anchoring. The npm publish of `0.1.15` is prepared and Founder-gated (registry truth measured 2026-10-19: `0.1.14-rc1` on `rc`+`latest` until it executes; the publish artifact is parity-proven before publish). The lineage reconciliation between the private line and the public `0.1.14-rc1` line is ✅ **RECONCILED (2026-10-03, Phase 61.1)**: the public-lineage E1010 journal-completeness anchor and its 12-test attack suite now live in the canonical lineage, and the artifact-parity system (`tests/integration/artifact-parity.test.ts` + `tools/verify-artifact-parity.ts`) prevents the documented version split from recurring.

## Discipline

Vaerion is becoming **the trust runtime for AI agents** — nothing else.
Every proposal is measured against that sentence; whatever does not serve
it stays out of the roadmap. The honest inventory of what is measured and
what is not: [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md).
