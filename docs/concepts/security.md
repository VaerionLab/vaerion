# Concepts — Security Model

Four mechanisms carry the security story: the broker, the gateway gate,
the telemetry law, and signed distribution. Deep records:
[`../security/THREAT-MODEL.md`](../security/THREAT-MODEL.md) ·
[`../security/MITIGATIONS.md`](../security/MITIGATIONS.md) ·
[`../security/RISK-LEDGER.md`](../security/RISK-LEDGER.md) (what is not
yet mitigated, stated plainly).

## The fail-closed broker

One centralized permission engine (`broker/engine.ts`) gates every
privileged domain: `tool.call`, `model.invoke`, `research.fetch`,
`secret.read`, `net.connect`. Constitutional law **Decide → Journal →
Act** — scanners fail the build if a second privileged path ever
appears (ADR-0004). Three ordered layers:

1. **Shape** — a malformed request is a refusal, not a guess.
2. **Ceiling** — the permission graph compiles from `vaerion.yaml`;
   agents and policies cannot widen it — only editing the reviewed,
   fingerprinted declaration can.
3. **Policy** — first-match-wins rules with mandatory `rationale`;
   **unmatched ⇒ deny**.

Effects: `allow` (journaled) · `deny` (stable refusal + hash-chained
entry in the workspace refusal log) · `prompt` (a durable human gate —
survives crashes, resolvable only by a human via
`vae resume RUN_ID --answer JSON`; the approval becomes journaled
elevation authority — no blanket grants).

Declaring a tool grants nothing. Only reviewed policy rules do. See
[`../guides/permissions.md`](../guides/permissions.md).

## One sanctioned egress

All model I/O crosses a single gateway gate (ADR-0019): broker decision
→ adapter → sanctioned transport → metered on the spine. The engine's
constitutional checks (C1/C6) fail the build on any undeclared network
primitive elsewhere. The daemon (`vae serve`) binds loopback only — a
non-loopback bind is refused (E2001) — and every state-changing call
requires a pairing token.

## Zero telemetry — mechanically enforced

No analytics; no undeclared network. The config guard accepts exactly
one value — `telemetry.enabled: false` — and a constitutional check
enforces it on every build. `vae doctor` verifies config, journals,
blobs, and audit chain with **no phone-home**.

## Secrets stay secret

OS-keychain-first resolution (ADR-0013). Secrets never enter journals,
receipts, bundles, or `--json` output; identity surfaces report
credential **presence**, never values (`vae ai status`).

## Signed distribution

Every GitHub release ships an Ed25519-signed `MANIFEST.json`, the
public key, and `SHA256SUMS`. A fresh consumer verifies anonymously in
three independent legs (`sha256sum --check` → the engine's
`dist-verify.ts` → raw openssl). Key custody and rotation:
[`../security/SIGNING-CEREMONY.md`](../security/SIGNING-CEREMONY.md).
The npm package is published from the exact sha256-verified artifact of
record — registry bytes ≡ release bytes.

## The honest ledger

What is *not* yet mitigated is tracked in
[`../security/RISK-LEDGER.md`](../security/RISK-LEDGER.md) and
[`../LIMITATIONS.md`](../LIMITATIONS.md). Trust that hides its gaps is
branding; Vaerion ships the ledger.
