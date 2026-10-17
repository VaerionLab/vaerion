# DRAFT — Verification evidence index, v0.1.15-rc1

> **DRAFT — pending Founder publish.** Every number below carries its source
> path. Fresh measurements from this session (2026-10-04, Task 62-c, local
> HEAD `a0977a4`) are marked **[fresh]** and transcribed verbatim in
> `evidence/MEASURED-2026-10-04-62c.md`. Prior-epoch records are cited to
> their report files. Nothing here is asserted without a source.

---

## 1. The artifact of record

| Fact | Value | Source |
|---|---|---|
| Candidate tarball | `vaerion-0.1.15-rc1.tgz` | produced by `packaging/npm/make-package.sh` |
| sha256 (the pin) | `bd2e5d5660fc2bdd808a9068f57c4081b22e90d7e9c3c2f98617313578490371` | **[fresh]** ×2 today (`evidence/…62c.md` §2) = the 61.2 record (`reports/phase-61.2/06-artifact-proof.md` §1, `reports/phase-61.2/07-era-ii-entry-verdict.md` header) |
| Determinism epochs | 61.1: `d9d8f1a7…` ×2 → 61.2 pre-correction: `d9d8f1a7…` ×2 (byte-identical across epochs) → 61.2 post-correction: `bd2e5d56…` ×2 → 62.0: `bd2e5d56…` ×2 **[fresh]** | `reports/phase-61.2/06-artifact-proof.md` §1 + `evidence/…62c.md` §2 |
| Parity gate | exit 0 — 116 engine files + package.json + README + bin byte-identical; 29 commands; E1010 anchor ships; dead files absent | **[fresh]** `evidence/…62c.md` §4; the refusing counterpart (contaminated build → exit 2) §3 |
| Pack contents discipline | `bin/`, `engine/`, `README.md` only; no lifecycle scripts, no tests/keys/docs | `reports/phase-61.0` S9 (118 files on the published 0.1.14 artifact, files-field honored); manifest `packaging/npm/package.json` |

## 2. Gate counts

| Gate | Result | Source |
|---|---|---|
| Engine suite | **719 pass / 0 fail, 62 files** — **[fresh]** all nine gates green, exit 0 | `evidence/…62c.md` §1 |
| Expectations | **5,246 [fresh]** vs **5,255 (61.2 record)** — pass/fail/file counts identical; delta of 9 sits in the runtime `expect()` counter; both numbers recorded, neither hidden | `evidence/…62c.md` §1 note; `reports/phase-61.2/03-security-final-proof.md` §1 |
| typecheck-engine + typecheck-sdk | 0 errors **[fresh]** | `evidence/…62c.md` §1 |
| repo-lint (eslint) | 0 errors **[fresh]** | `evidence/…62c.md` §1 |
| constitutional-check | PASS — 7 invariant checks, catalog 82 codes **[fresh]** | `evidence/…62c.md` §1 |
| coverage-ratchet | 127 modules, all ratcheted — no silent decrease **[fresh]** | `evidence/…62c.md` §1 |
| layerlint | 118 files, 558 runtime edges (146 type-only exempt) **[fresh]** | `evidence/…62c.md` §1 |
| perf-budget + a11y-structural | GREEN **[fresh]** | `evidence/…62c.md` §1 |
| Debris-contaminated counter-example | 718/1 — the dead-files pin trips (`artifact-parity.test.ts:85`) **[fresh]** | `evidence/…62c.md` §3 procedure |
| Generated record | `.vaerion-verification.json` now holds the fresh measurement; the copy committed at HEAD `a0977a4` was the stale 61.1 record (718/5,236, pre-D5) | `evidence/…62c.md` §1 + §6 |

## 3. Security battery (Phase 61.2, live measurements)

| Claim | Measured | Source |
|---|---|---|
| E1010 truncation refused | tail-deleted closed journal → `E1010`, exit 5, on source **and** installed artifact | `reports/phase-61.2/03-security-final-proof.md` §3; `06-artifact-proof.md` §4 |
| E1001 tamper refused | 1-byte payload flip → `E1001`, exit 5 | same |
| 12-attack completeness suite | green inside the 719 | `03-security-final-proof.md` §3 |
| Daemon loopback + auth | `LISTEN 127.0.0.1:7897` (ss-verified); unauth 401 `E2000`; 43-char token 200; wrong token 401; token once per boot, rotated per boot, old token dead | `03-security-final-proof.md` §2 |
| Deterministic workspace bundles | `vae package build` ×2 → identical sha256 `828a52c2…` | `03-security-final-proof.md` §5 |
| Secrets | pattern sweep: zero live secrets (fixtures only) | `03-security-final-proof.md` §6 |
| Dependencies | `npm audit` 0 vulnerabilities across declared ranges; runtime deps ajv/hash-wasm/yaml only | `03-security-final-proof.md` §7 |
| Network surface | 3 declared gateway URLs + 1 fetch call site; no telemetry call sites | `03-security-final-proof.md` §7 |
| SDK loopback symmetry | E2006 enforced in all five SDKs (Python was the gap; fixed D12, 16/16) | `03-security-final-proof.md` §8 |

## 4. Journey + parity proofs (61.1/61.2)

| Claim | Measured | Source |
|---|---|---|
| Clean install from candidate tarball | 0.786 s; golden path init 0.108 s / run 0.123 s / verify 0.092 s / doctor green | `reports/phase-61.2/06-artifact-proof.md` §3 |
| Artifact ≡ source by attack | E1010 + E1001 refused by the installed artifact; MCP handshake, 6 tools, serverInfo 0.1.15-rc1 | `06-artifact-proof.md` §4 |
| Docs stranger test | 30-second test PASS; 288 relative links / 0 broken; install-honesty disclosures gate-pinned | `reports/phase-61.2/05-documentation-stranger-test.md` + addendum |
| SDK/integration batteries | TS parity 8/0; Python 16/16; adapters 31/31 (cold venv, 61.1); Go/Rust/Java static 43/27/40 | `06-artifact-proof.md` §7; `reports/phase-61.1/00-executive-summary.md` |
| Trust matrix | seven questions answered with measurements; five evaluator personas | root `ENTERPRISE_TRUST_MATRIX.md` (frozen copy `reports/phase-61.2/02-enterprise-trust-matrix.md`) |
| Verdict of record | Era II entry **YES**, conditional on the Founder-gated publish; score 8.6/10 | `reports/phase-61.2/07-era-ii-entry-verdict.md` |

## 5. How a stranger re-verifies (the public path)

1. Rebuild from the tagged tree, twice, and compare bytes to
   `bd2e5d5660fc2bdd808a9068f57c4081b22e90d7e9c3c2f98617313578490371`
   (`GITHUB_RELEASE.md` §Verification — the commands are the proof).
2. `bun tools/verify-artifact-parity.ts dist/npm/vaerion-0.1.15-rc1.tgz` → exit 0.
3. Install the tarball into a clean prefix; run the golden path; run the
   E1010 attack on a throwaway journal (commands in `GITHUB_RELEASE.md`).
4. For the signed release set: the anonymous three-leg verification
   (`SHA256SUMS` → `dist-verify.ts` → independent `openssl` Ed25519 check),
   `docs/getting-started/installation.md:47-54`.

## 6. What this index does NOT claim

- It does not claim the registry serves 0.1.15-rc1 (it serves 0.1.14-rc1
  until the publish — `evidence/…62c.md` §5).
- It does not claim GA, compliance mappings, transport security, or external
  anchoring (see `KNOWN_LIMITATIONS.md` items 7–9).
- The 5,255 vs 5,246 expectation delta is disclosed, not reconciled
  (§2 above) — pass/fail counts are identical and are the gates of law.
