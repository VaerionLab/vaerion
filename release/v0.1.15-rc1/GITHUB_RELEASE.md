# DRAFT — GitHub release body for tag `v0.1.15-rc1`

> **DRAFT — pending Founder publish.** This file is the prepared release
> body. Nothing below has been published anywhere: the npm registry still
> serves `0.1.14-rc1` (re-measured 2026-10-04: dist-tags `rc` + `latest`),
> the public repository is frozen at `374e2dd`, and no tag `v0.1.15-rc1`
> exists locally or remotely yet. The publish runbook is
> `RELEASE_CHECKLIST.md` (same directory). Every factual claim below cites
> its evidence path in `VERIFICATION_EVIDENCE.md`.

---

**Title (suggested):** `Vaerion 0.1.15-rc1 — the one-true-artifact release`

**Labels:** prerelease ✅ (this is a release candidate, not GA)

---

## The one-true-artifact release

Phase 61.0 proved the final P0 blocker: the `0.1.14-rc1` artifact on npm and
the `0.1.14-rc1` tree of record were two different engines wearing one
version — the documented golden path (`vae verify`) failed on install with a
raw error. `0.1.15-rc1` ends that class of failure structurally, not by
patch: a permanent parity system proves **source = build = package =
documentation** before any publish, and a closed version register refuses a
version the artifact pipeline has not proven.

*(Evidence: `reports/phase-61.0/00-executive-summary.md` — the split proof;
`reports/phase-61.1/04-parity-system.md`; CHANGELOG `[0.1.15-rc1]`.)*

## What shipped

- **E1010 is canonical.** The journal-completeness anchor — *a receipt record
  certifies the prefix immediately before it* — now lives in the tree of
  record at every layer: catalog entry (82 codes), verification logic,
  recovery re-certification, redacted-export re-certification, `vae doctor`
  completeness reporting, and the 12-test attack suite
  (`packages/vaerion/tests/security/journal-completeness.test.ts`). A closed
  journal whose terminal receipt is missing or stale fails with `E1010`
  (exit 5) instead of falsely verifying. The 61.0 truncation attack
  (delete the receipt → `ok: true`) is closed at HEAD **and on the installed
  artifact**.
- **The parity law is mechanical.** `tests/integration/artifact-parity.test.ts`
  pins the 29-command dispatch surface, the 7-template registry, the
  did-you-mean module, the absence of dead CLI files, and the rule that every
  command the quickstart teaches exists in the dispatch;
  `tools/verify-artifact-parity.ts` re-proves byte parity on the packed
  tarball (116 engine files + package.json + README + bin) and **refuses**
  the publish candidate otherwise — demonstrated live: a contaminated build
  was refused with `REFUSING — dead file ships in the artifact`
  (`evidence/MEASURED-2026-10-04-62c.md` §3).
- **The version register owns the pin.** 27 register surfaces now include the
  cross-version-upgrade tripwire literal — the D5 finding: 61.2's suite went
  red at its own HEAD because a bump missed one literal, exactly as the
  tripwire was designed to force. Post-correction: 719/0.
  *(Evidence: `reports/phase-61.2/00-executive-summary.md` — D5.)*
- **The launcher teaches instead of failing raw.** `packaging/npm/bin/vae.js`
  is a node-executable ESM launcher: re-execs Bun when present (+35 ms,
  measured), and without Bun prints the taught `E1600` refusal with the exact
  fix and exits 2 — never the raw OS exit 127, and never the silent
  Windows dead-end. *(Evidence: `reports/phase-61.2/06-artifact-proof.md` §5.)*
- **Install honesty is a refusing gate.** Every teach-install surface
  (README, INSTALL, installation.md, QUICKSTART, MCP README, site facts)
  carries the registry-lag disclosure — the era where docs taught installs
  that refuse the documented journey silently is gate-pinned shut.
  *(Evidence: `reports/phase-61.2/05-documentation-stranger-test.md` + addendum.)*
- **Python SDK enforces the loopback law (E2006).** `assert_loopback_base`
  is constructor-enforced before any wire byte — the last token-egress
  asymmetry across the five SDKs is closed. Python suite: 16/16.
  *(Evidence: `reports/phase-61.2/03-security-final-proof.md` §8.)*

## Verification (do it yourself, ~60 seconds, no API key)

The release candidate tarball is deterministic. Rebuild it from the tagged
tree and compare bytes:

```sh
git clone https://github.com/VaerionLab/vaerion && cd vaerion
git checkout v0.1.15-rc1
bun install --frozen-lockfile
sh packaging/npm/make-package.sh
# → sha256 bd2e5d5660fc2bdd808a9068f57c4081b22e90d7e9c3c2f98617313578490371
sh packaging/npm/make-package.sh   # again — byte-identical (proven ×2 this epoch,
                                   # ×2 in Phase 61.2, determinism across 3 epochs)
bun tools/verify-artifact-parity.ts dist/npm/vaerion-0.1.15-rc1.tgz   # → exit 0
```

Then run the golden path and the attack on the installed artifact:

```sh
npm install -g --prefix /tmp/vae-verify dist/npm/vaerion-0.1.15-rc1.tgz
vae init --template demo && vae run demo
vae journal verify <RUN_ID>        # → ok · anchored · complete
vae verify                         # → VERIFIED (exit 0)
# the completeness attack, refused:
#   delete the last line of .vaerion/journal/<RUN_ID>.ndjson, then:
vae journal verify <RUN_ID>        # → E1010 (exit 5)
```

*(Artifact sha256 of record: `bd2e5d5660fc2bdd808a9068f57c4081b22e90d7e9c3c2f98617313578490371` — re-proven ×2 on 2026-10-04, `evidence/MEASURED-2026-10-04-62c.md` §2; gate battery: 719 pass / 0 fail across 62 files, all nine gates green, re-run 2026-10-04, §1.)*

## Evidence index

In-repo paths (present after this release's commit is pushed):

- `reports/phase-61.1/` — artifact root cause, E1010 alignment, parity system,
  stranger install test, build verification (9 reports)
- `reports/phase-61.2/` — release readiness, security final proof, SDK
  readiness, documentation stranger test, artifact proof, Era II entry
  verdict (9 reports)
- `ENTERPRISE_TRUST_MATRIX.md` — the seven trust questions, every answer with
  a measurement
- `docs/security/THREAT-MODEL.md`, `docs/security/RISK-LEDGER.md` — re-affirmed
  for the 0.1.15-rc1 epoch with dated evidence

Gate battery of record (re-measured 2026-10-04, all nine green, exit 0):
engine 719/0 (62 files) · typecheck 0 · repo lint 0 · constitution PASS ·
coverage ratchet 127/127 · layerlint 118 files · parity gate exit 0 ·
Python SDK 16/16 (`reports/phase-61.2/03-security-final-proof.md` §1, §8).

## Known limitations (plainly)

- **Bun is a hard requirement.** The engine executes on Bun (≥ 1.2); a node
  machine cannot run it — `vae` teaches `E1600` (exit 2) with the exact
  install fix instead of failing raw. This is inherent to the current
  substrate (ADR-0018, provisional), not a bug.
- **`vae package build` on a fresh demo scaffold refuses with `E1600`** —
  the demo template does not yet scaffold a `package:` block. The error
  teaches the fix (`declare package.include in vaerion.yaml`); the golden
  path (init → run → verify) does not touch it. Deferred as a
  template-content change, not a correction.
- **The registry lags until this publish runs.** Until the Founder-gated
  `npm publish`, `npm install -g vaerion@rc` delivers the older
  `0.1.14-rc1` engine (missing `vae verify` / `create` / `start` / `mcp`).
  Every install surface says so; this release body ships as part of the
  publish that ends the lag.
- **Tamper-evident, not tamper-impossible.** A hostile host with filesystem
  write access is outside what client-side anchoring can prevent; use
  `vae snapshot` / printed receipts for adversarial custody
  (`docs/security/THREAT-MODEL.md`).
- **No transport security yet:** remote daemon attachment is refused in code
  (E2006) in all five SDKs until a ratified transport-security ADR exists.
  No compliance mapping (EU AI Act / ISO 42001 / NIST), no SIEM export, no
  external receipt anchoring in this release.

## Upgrading from 0.1.14-rc1

```sh
npm install -g vaerion@rc     # after this publish runs → vae 0.1.15-rc1
vae --version                 # verify what you actually got
```

Nothing is removed or renamed (within-v0.1 surfaces evolve additively); a
0.1.14-written journal verifies under 0.1.15 (the cross-version upgrade leg
is a permanent regression test). What you gain depends on where you came
from — the registry `0.1.14-rc1` artifact was missing `vae verify` / `create`
/ `start` / `mcp`; the full behavioral delta and the exit-code contract are
in `MIGRATION_GUIDE.md` in this repository. Rollback: `npm install -g vaerion@0.1.14-rc1`.

---

Apache-2.0 · zero telemetry · local-first · repo:
`github.com/VaerionLab/vaerion`
