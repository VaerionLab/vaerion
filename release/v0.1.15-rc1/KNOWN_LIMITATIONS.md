# DRAFT — Known limitations, v0.1.15-rc1

> **DRAFT — pending Founder publish.** Compiled from the living ledgers of
> record: `docs/LIMITATIONS.md`, `docs/security/RISK-LEDGER.md`,
> `reports/phase-61.2/00-executive-summary.md` (defect ledger D5–D14 +
> deferred-with-reasons), `reports/phase-61.2/01-release-readiness.md`
> (F10–F13). Labels follow the campaign standard: **Measured** (evidence of
> record), **Last-known** (recorded history, not re-measured this session),
> **UNVERIFIED**. Nothing here is dressed as resolved; nothing resolved is
> listed here as open.

---

## Release-window limitations (this specific launch)

1. **The registry lags until the publish runs.** `npm install -g vaerion@rc`
   delivers `0.1.14-rc1` — an older engine missing `vae verify` / `create` /
   `start` / `mcp` — until the Founder-gated `npm publish` of 0.1.15-rc1.
   **Measured** 2026-10-04: dist-tags `rc` + `latest` = `0.1.14-rc1`
   (`evidence/MEASURED-2026-10-04-62c.md` §5). Every teach-install surface
   discloses this, gate-pinned (`artifact-parity.test.ts` install-honesty
   pin). This is the single remaining release step (61.2 F13; risk-ledger
   F-5 class).
2. **`vae package build` on a fresh demo scaffold refuses with `E1600`.**
   The demo template does not scaffold a `package:` block
   (`packages/vaerion/src/config/templates.ts:55` — no `package:` key in the
   demo template, **measured**). The error teaches the fix ("declare
   `package.include` in vaerion.yaml"). Deferred with reason: fixing it
   means changing shipped template content — a feature-class change, not a
   correction (`reports/phase-61.2/01-release-readiness.md` F10). The golden
   path (init → run → verify) does not touch packaging.
3. **Untracked debris in the working tree trips gates and contaminates
   naive packs.** Two stale, untracked CLI files
   (`packages/vaerion/src/cli/center.ts`, `templates.ts`, dated Sep 1,
   listed in `reports/phase-62.0/00-before-state.md` §3) make the dead-files
   parity pin fail the suite (measured: 718/1 with debris present vs 719/0
   clean) and — worse — `make-package.sh` packs them into the tarball
   (measured: parity gate refusal `REFUSING — dead file ships in the
   artifact`; `evidence/MEASURED-2026-10-04-62c.md` §3). The parity gate
   catches it; the debris itself is a quarantine-or-track decision owned by
   the Founder/orchestrator (62.0 Phase 2/7 item).
4. **Launcher hop.** The node-executable launcher adds **+35 ms** per `vae`
   invocation (measured, `reports/phase-61.2/06-artifact-proof.md` §3:
   0.081 s shim → 0.116 s launcher). Accepted cost of the taught-refusal
   guarantee.

## Platform limitations (product)

5. **Bun-only engine execution.** The engine executes on the Bun runtime
   (≥ 1.2); a node-only machine cannot run it — the launcher teaches `E1600`
   (exit 2) with the exact fix instead of failing raw. Inherent to the
   provisional substrate, ADR-0018 (`docs/LIMITATIONS.md` §1 item 1;
   `docs/security/RISK-LEDGER.md` currency note). **Measured** (taught
   refusal path, `reports/phase-61.2/06-artifact-proof.md` §5).
6. **Substrate is provisional.** TypeScript-on-Bun is ADR-0018 PROVISIONAL
   with a recorded migration path; Founder ratification pending
   (`docs/LIMITATIONS.md` §1 item 1, F-4). **Last-known.**
7. **No transport security / remote attachment.** Remote daemon attachment
   is refused in code (E2006) in all five SDKs until a ratified
   transport-security ADR exists; the daemon binds loopback only
   (`ENTERPRISE_TRUST_MATRIX.md` Q2). **Measured.**
8. **No external anchoring / SIEM export / compliance mapping.** Zero
   EU-AI-Act / ISO 42001 / NIST mapping content; external receipt
   anchoring/timestamping not built (`ENTERPRISE_TRUST_MATRIX.md` Q2;
   compliance persona = "not yet — documented gap"). **Measured** (by
   absence sweep, `reports/phase-61.0` Part 3).
9. **Tamper-evident ≠ tamper-impossible.** A hostile host with filesystem
   write access is outside what client-side anchoring can prevent; use
   `vae snapshot` / printed receipts for adversarial custody
   (`docs/security/THREAT-MODEL.md`). **Measured** boundary, stated not
   hidden.
10. **Exec-sandbox hardening open (R-1, high).** The v0.1 sandbox profile
    ships; OS-level profiles for arbitrary third-party extensions are not
    enforced on every platform (`docs/security/RISK-LEDGER.md` R-1).
    **Last-known.**
11. **Residual security exposures, owned and tracked** — no critical open:
    R-3 breaker state per-process; R-4 no real-provider cassettes (Founder-
    gated); R-5 SSE replay cursors are token-holder read windows until
    per-run capability tokens exist; R-6 bundle pin upgrades need a rebuild;
    R-7 no public security-reporting channel until canonical remote
    provisioning (`docs/security/RISK-LEDGER.md`). **Last-known** (re-affirmed
    with dated evidence in the 61.2 currency note).

## Verification-coverage limitations (honest test boundaries)

12. **Go / Rust / Java SDKs are statically verified only** in the current
    environment (toolchains absent — `go`, `cargo`, `mvn`, `javac` all
    ABSENT, measured; counts 43/27/40 are static `func Test`/`#[test]`/
    `@Test` counts matching `facts.ts`). Python (16/16) and TypeScript
    (typecheck + parity + live-daemon examples) execute for real.
    (`reports/phase-61.2/06-artifact-proof.md` §7.)
13. **Packaging channels authored, not host-verified.** Homebrew, winget,
    .dmg/.pkg, rpm, AppImage, Debian, winget/Chocolatey/Scoop: authored +
    reviewed, **UNVERIFIED** until their host tooling executes them
    (`docs/LIMITATIONS.md` §2; `packaging/README.md`). Container/multi-CI
    templates: same class, honest markers inside the Dockerfile.
14. **twine check UNVERIFIED** (host lacks twine; the wheel itself was built
    and its install verified offline) (`docs/LIMITATIONS.md` §2).
15. **Real-provider cassettes absent.** Hermetic coverage uses MockBrain and
    cassettes; no real-provider end-to-end golden coverage exists until the
    sanctioned recording sessions (R-4/F-6, Founder-gated)
    (`docs/LIMITATIONS.md` §3).

## Founder-gated items that gate the *ecosystem*, not this tarball

16. **F-2** legal name insertion; **F-4** substrate ratification; **F-5**
    ecosystem publications (PyPI/homebrew-core/winget, `vaerion.dev` domain,
    announce, beta recruitment); **F-6** real-provider cassettes
    (`docs/LIMITATIONS.md` §3). The npm publish of 0.1.15-rc1 itself is the
    F-5-class step this release executes.

---

*If a limitation above has been closed by later work, the closing record
lives in `worklog.md` and the phase ledgers; a stale line here is a defect
to be fixed, not a claim to defend* (the rule of `docs/LIMITATIONS.md`).
