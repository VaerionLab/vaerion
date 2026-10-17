# DRAFT — npm release notes, `vaerion@0.1.15-rc1`

> **DRAFT — pending Founder publish.** Registry of record still serves
> `0.1.14-rc1` (dist-tags `rc` + `latest`, re-measured 2026-10-04).
> Candidate tarball: `dist/npm/vaerion-0.1.15-rc1.tgz`,
> sha256 `bd2e5d5660fc2bdd808a9068f57c4081b22e90d7e9c3c2f98617313578490371`
> (deterministic ×2, this epoch; parity-gate-proven).

---

vaerion 0.1.15-rc1 — the one-true-artifact release

The `vae` CLI and engine: hash-chained run journals, close-time receipts,
fail-closed policies, and byte-reproducible packages — local-first,
zero-telemetry, Apache-2.0. The engine executes on the Bun runtime.

This release removes the final release blocker measured in Phase 61.0: the
published 0.1.14-rc1 artifact and the 0.1.14-rc1 tree of record were two
different engines under one version string. 0.1.15-rc1 makes that class
structurally impossible:

- E1010 journal-completeness anchor is canonical (82-code catalog): a closed
  journal with a missing or stale terminal receipt is refused (exit 5), never
  falsely verified. 12-test attack suite ships in the package's source tree.
- Artifact parity is enforced before publish: the packed tarball must match
  the tree byte-for-byte (116 engine files), command-for-command (29 commands),
  and template-for-template (7 templates) — or the release gate refuses.
- The version register owns every version literal (27 pins); the launcher
  teaches `E1600` (exit 2) with the exact fix on Bun-less machines instead of
  a raw OS error; every install surface discloses registry lag honestly.

Requires Bun 1.2+ (the launcher refuses with a taught error if missing).
No lifecycle scripts, no telemetry, no network at runtime unless you invoke
a model provider through the gateway. Runtime deps: ajv, hash-wasm, yaml.

Verify the artifact bytes:

    sh packaging/npm/make-package.sh   # twice — byte-identical tarball
    # sha256 bd2e5d5660fc2bdd808a9068f57c4081b22e90d7e9c3c2f98617313578490371

First proof (~60 s, no API key — the demo uses the deterministic MockBrain):

    vae init --template demo
    vae run demo
    vae journal verify <RUN_ID>   # → ok · anchored · complete
    vae verify                    # → VERIFIED

Known limitations, stated plainly: node-only machines cannot run the engine
(taught E1600 exit 2); `vae package build` on a fresh demo scaffold refuses
with E1600 until a `package:` block is declared (the error teaches the fix);
tamper-evident is not tamper-impossible (see docs/security/THREAT-MODEL.md);
remote daemon attachment is refused in code (E2006) until a transport-security
ADR exists.

Docs and verification instructions: https://github.com/VaerionLab/vaerion
