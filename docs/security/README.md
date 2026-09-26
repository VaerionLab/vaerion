# Security — model, corpus, reporting

## The model in six lines

1. **Fail-closed broker** — consequential actions require permission; refusals are
   recorded outcomes, never silent fallbacks.
2. **One sanctioned egress** — a single, auditable gateway site for model traffic;
   everything else stays local.
3. **Append-only journals** — blake3-chained evidence; tampering is detectable by
   construction.
4. **Env-only credentials** — secrets come from the environment or the OS keychain;
   the repo never carries them (`.env.example` names only).
5. **Reproducible packaging** — artifacts carry provenance (`.vxn` bundles).
6. **Zero telemetry** — your runs are yours; nothing phones home.

## The corpus

| Document | What it covers |
|---|---|
| [`docs/security/THREAT-MODEL.md`](../security/THREAT-MODEL.md) | adversaries, assets, trust boundaries |
| [`docs/security/MITIGATIONS.md`](../security/MITIGATIONS.md) | control-by-control response |
| [`docs/security/RISK-LEDGER.md`](../security/RISK-LEDGER.md) | open risks, honestly ledgered |
| [`docs/security/REMOTE-PROTECTION.md`](../security/REMOTE-PROTECTION.md) | rules that guard remote surfaces |
| [`docs/security/SIGNING-CEREMONY.md`](../security/SIGNING-CEREMONY.md) | how release artifacts get signed |
| [`SECURITY.md`](../../SECURITY.md) | **how to report a vulnerability (start here)** |
| [`docs/book/guides/security-posture.md`](../book/guides/security-posture.md) | the practitioner's view |

## Reporting

Vulnerabilities: follow [`SECURITY.md`](../../SECURITY.md) — private disclosure to
the maintainer, no public issues for unpatched findings. Community channels mirror
the same rule ([community plans](../../community/GITHUB-DISCUSSIONS-PLAN.md)).
