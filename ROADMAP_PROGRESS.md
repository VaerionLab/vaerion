# Vaerion — Roadmap Progress

> **GENERATED** by `tools/status.ts` from the measured status of record — never hand-edited
> (constitution v1.7 — the generator itself was ratified by the generated-roadmap law,
> v1.6 A6 Phase 11: the roadmap report of record comes from the ONE measured status source).
> Regenerate with `bun tools/status.ts`; hand edits are defects.

- Engine version of record: `0.1.15`
- Constitution of record: `v1.7` (Amendment Log §11)
- Verification record: GREEN — 9/9 gates ok (`.vaerion-verification.json`)
- Measured tests: 719 pass · 0 fail · 5246 expectations · 62 files
- Coverage floors: bunfig.toml coverageThreshold (OBJ-Q6, ratcheted at MS-6 bundle close: 0.86/0.74/0.86/0.90; held at every ASCENSION phase close)

## Milestone board (§7)

| MS | Name | Status | Progress |
|---|---|---|---|
| MS-0 | Skeleton and Law-in-Repo | complete | 100% |
| MS-1 | Runtime Spine | complete | 100% |
| MS-2 | Permission Broker | complete | 100% |
| MS-3 | Model Gateway | complete | 100% |
| MS-4 | Intelligence + Agents | complete | 100% |
| MS-5 | Surfaces | complete | 100% |
| MS-6 | Packaging + Hardening | complete | 100% |
| GA | General Availability | complete | 100% |

## Phase ledger (D-T — the constitution of record)

| Phase | Era | Status |
|---|---|---|
| Ω + artifacts | PHASE Ω | ✅ complete |
| 0 | ASCENSION XVIII | ✅ complete |
| 1 | ASCENSION XVIII | ✅ complete |
| 8 | ASCENSION XVIII | ✅ complete |
| 2 | ASCENSION XVIII | ✅ complete |
| 3 | ASCENSION XVIII | ✅ complete |
| 4 | ASCENSION XVIII | ✅ complete |
| 5 | ASCENSION XVIII | ✅ complete |
| 6 | ASCENSION XVIII | ✅ complete |
| 7 | ASCENSION XVIII | ✅ complete |
| 8 | ASCENSION XVIII | ✅ complete |
| 9 | ASCENSION XVIII | ✅ complete |
| 10 | ASCENSION XVIII | ✅ complete |
| 11 | ASCENSION XIX | ✅ complete |
| 12 | ASCENSION XIX | ✅ complete |
| 13 | ASCENSION XIX | ✅ complete |
| 14 | ASCENSION XIX | ✅ complete |
| 15 | MASTER DIRECTIVE | ✅ complete |
| 16 | MASTER DIRECTIVE | ✅ complete |
| 17 | MASTER DIRECTIVE | ✅ complete |
| 18 | MASTER DIRECTIVE | ✅ complete |
| 19 | ASCENSION XX | ✅ complete |
| 20 | ASCENSION XX | ✅ complete |
| 21 | ASCENSION XX | ✅ complete |
| 22 | ASCENSION XX | ✅ complete |
| 23 | FINAL FOUR PHASES | ✅ complete |
| 24 | FINAL FOUR PHASES | ✅ complete |
| 25 | FINAL FOUR PHASES | ✅ complete |
| 26 | FINAL FOUR PHASES | ✅ complete |

## Recommended next work (priority order)

1. No campaign is in flight: the D-T ledger records FINAL FOUR PHASES complete through Phase 26 (evidence of record in the constitution's §11 Amendment Log); the next program awaits Founder ratification (P4).
2. GA EXECUTED (2026-10): v0.1.15 is the release of record — GitHub Release + PyPI live and verified end-to-end; the residuals remain Founder-gated (P4): npm publish (pipeline prepared, artifact parity-proven), hosted domain, public disclosure channel provisioning.
3. Host-gated single-binary installers (brew/winget/dmg/rpm authored, awaiting their platforms); the daemon packages route group is DONE (ASCENSION XXVI+ — pack/verify/import over the wire with proven parity).
4. Remaining publish steps (announce) — Founder-gated; GitHub Release + PyPI are live, and artifacts are reproducible via tools/dist-pack.ts at the release tag.

## Technical risks (top)

1. Substrate: TypeScript-on-Bun reference implementation is explicitly PROVISIONAL (ADR-0018, Phase 1 finalization) with a recorded migration path; Founder ratification pending.
2. Release signing uses the production Ed25519 key (RELEASE_SIGNING_KEY from CI; R-2 CLOSED at ASCENSION XXV — key of record rotated, ceremony + recovery law in SIGNING-CEREMONY.md); a hardware-custodied re-ceremony remains available via the recorded rotation path (docs/security/RISK-LEDGER.md R-2, residual labeled).
3. Exec-sandbox hardening matrix (ADR-0015 full profiles) and per-run token scoping are open engineering items (RISK-LEDGER R-1/R-5).
4. Journal per-record fsync trades durability for throughput; batching decision needed before agent-scale testing.
5. Provider price table is build-time data (2026-08); provider drift is a data update with a reviewed contract change.
6. ModelPlanner success path needs a recorded real-provider cassette for end-to-end golden coverage (environment has no provider network access).
7. zstd byte-determinism holds for the pinned level (19) on the current toolchain; a toolchain bump could change bytes — the format version in the magic is the escape hatch (never a silent rebuild).
8. Per-process breaker state is deliberately not journaled (the failures are); multi-process sharing is a daemon concern needing an ADR.
9. Per-module coverage floors are enforced by the coverage-ratchet gate (116-module baseline of record, 1pp measured jitter band); totals stay floored by bunfig — a silent decrease fails CI by name.

---

*Progress measured, not narrated: every line traces to `tools/status.ts` inputs — `.vaerion-verification.json`, the milestone board of record, and the D-T phase ledger in the constitution of record. Generated, never narrated.*
