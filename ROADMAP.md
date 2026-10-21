# Vaerion Roadmap

> The measured status of record is [`ROADMAP_PROGRESS.md`](ROADMAP_PROGRESS.md) —
> generated from the engine's own measurement, never hand-edited. This file
> is the curated public view of the same truth.

## Now — General Availability `v0.1.15`

- 9/9 verification gates green — 721 engine tests passing (re-measured 2026-10-21 @ the `0.1.15` tree of record, incl. the 12-test journal-completeness attack suite), 0 failures · 5,277 expectations · across 62 test files
- The engine: event spine, fail-closed broker, blake3-chained journals, receipts, reproducible `.vxn` bundles
- The CLI (`vae` — now with `create`/`verify`/`start`/`mcp`, an interactive first-run prompt layer, and the 7-template registry incl. `enterprise`), five SDKs (TypeScript `@vaerion/sdk`, Python, Go, Rust, Java), the framework alliance (`vae mcp` + OpenAI Agents / LangGraph / CrewAI / AutoGen adapters), and the verification law (`tools/verify.ts`)
- Live, everywhere measured: the repository of record (`VaerionLab/vaerion`), PyPI (`0.1.15`), npm (`0.1.15` under dist-tag `latest` — published 2026-10-21, parity-proven before publish), and the signed GitHub Release

## Era II Foundation — ✅ COMPLETE (closed 2026-10-21)

GA is executed and reconciled with the law: `0.1.15` is the version of record, the verification record is GREEN — 9/9 gates — and amendment A8 (constitution v1.8, [§11](docs/constitution/VAERION_CONSTITUTION_v1.8.md)) declared Era II's standing program: maintenance, synchronization, and trust, with every claim re-measured before it repeats. The Foundation phase is **closed on evidence**: every distribution channel carries the same GA truth, the registry-truth law (D-Z-2) is satisfied on all living surfaces, the complete engineering history is preserved in the private archive, and the author identity of record is uniform across the release history.

**Completed (Era I).** MS-0 → MS-6 (skeleton & law-in-repo, runtime spine, permission broker, model gateway, intelligence + agents, surfaces, packaging + hardening), the ASCENSION XVIII–XXVI hardening campaigns, and the GA execution itself. Evidence of record, all in-tree: [`docs/ga/`](docs/ga/) (burndown, go/no-go, release verification, audits, ASCENSION records), the amendment log (constitution §11), and [`PROVENANCE.md`](PROVENANCE.md) — the provenance of record for this curated republication.

**Completed (Era II Foundation, 2026-10-17 → 2026-10-21).** The signed GitHub Release `v0.1.15` (8 assets, Ed25519-signed manifest), the PyPI GA publication (`0.1.15`, sdist + wheel), the npm GA publication (`0.1.15` under `latest`, 2026-10-21 — the parity-proven artifact, deterministic build ×2), the status-layer regeneration at synchronized truth, the dead-reference closure and SDK-conformance CI authoring, constitution v1.8 (A8), and the founder-identity correction of record across the release history.

**Technical debt register** (one line each, honest — the maintained ledgers, not this file, are the memory): the Phase 64 forensic ledger is dispositioned by the Era II program and recorded in amendment A8 (constitution §11); the shadow verification culture (`src/vaerion/testing/` + `tools/vaerion-pipeline/`) is intentional unmeasured tooling debt with a recorded revisit trigger (D-Z-3); the branches/statements coverage floors are currently unmeasurable by bun's reporter — floors held, no emission point; the website `src/` tree carries no tests or coverage floors. The honest inventory of what is measured and what is not remains [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md).

## Next — `v0.1.16` Verified Ecosystem Release

The shift of record: **v0.1.15 made Vaerion trustworthy — verified technology. v0.1.16 makes Vaerion usable by the world — verified ecosystem.** Pillars, in order of record:

1. **Developer onboarding** — `vae doctor` (installation, version, configuration, journal health, broker posture, provider setup in one command), verified agent scaffolding (`vae init --agent`), and a guided first run.
2. **Agent framework ecosystem** — first-class official templates for OpenAI Agents, LangChain, CrewAI, AutoGen, and MCP hosts: setup → verification → receipts → replay demo, one directory each in [`examples/`](examples/).
3. **Trust dashboard** — local `vae dashboard`: journal validity, broker fail-closed posture, receipt and policy counts, last verification — the trust center on one screen.
4. **CLI experience** — guided fixes, interactive setup, better errors: the power tool becomes the friendly one.
5. **Community layer** — the Vaerion Showcase ("Built with Vaerion"), discussions, examples, and the contributor path.
6. **Release infrastructure** — one-command `release verify`; SDK registry completion (crates.io: the enriched manifest of record is sequenced for publication; Maven Central: blocked on Portal namespace verification — Founder-side); npm provenance attestations.

Carried from the Foundation ledger (delivered, kept for the record): the agent-framework alliance (✅ 2026-10-01, `7e6b751` — `vae mcp` + four adapters, 31/31 tests against the real engine), the five-SDK universe (✅ 2026-10-01 — 16/16 Python, 43/43 Go, 27/27 Rust, 40/40 Java conformance), verification tooling (per-run and per-bundle ✅; external anchoring still open), enterprise controls (governance scaffold ✅; full organizational surface open).

Not on the list above but still open, said plainly: external receipt anchoring, and the hosted-domain / public-disclosure residuals enumerated in constitution v1.8 §7. The npm publish of `0.1.15` executed 2026-10-21 — registry truth and prose truth now agree on every living surface. The lineage reconciliation between the private line and the public GA line is ✅ **RECONCILED (2026-10-03, Phase 61.1)**: the public-lineage E1010 journal-completeness anchor and its 12-test attack suite live in the canonical lineage, and the artifact-parity system (`tests/integration/artifact-parity.test.ts` + `tools/verify-artifact-parity.ts`) prevents the documented version split from recurring.

## Discipline

Vaerion is becoming **the trust runtime for AI agents** — nothing else.
Every proposal is measured against that sentence; whatever does not serve
it stays out of the roadmap. The honest inventory of what is measured and
what is not: [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md).
