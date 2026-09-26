# THE SECURITY MODEL — Trust Through Verification, Not Assertion

<!--
DOC-META
id: DOCS-SECURITY
title: Security Model
owningSystem: Stage 11 — Documentation Architecture (src/vaerion/docs)
authorityCitations: Implementation Constitution Part VIII; Implementation Constitution 8.1; Implementation Constitution 8.2; Implementation Constitution 8.5; Implementation Constitution 8.8; Implementation Constitution 8.9; Implementation Constitution 8.7; Implementation Constitution 9.14; Implementation Constitution 10.3; Implementation Constitution 1.6; Bible Art. II; Bible Art. III; Bible Art. VIII; Bible Art. XII; Stage 9 execution order Deliverable 8; Stage 10 execution order (Trust Engine, IR-017, IR-019)
relatedArtifacts: src/vaerion/authorities/hash.ts; src/vaerion/authorities/chain.ts; src/vaerion/authorities/manifest.ts; src/vaerion/authorities/identity.ts; src/vaerion/authorities/export.ts; src/vaerion/testing/security.ts; src/vaerion/release/trust.ts; keys/release-signing.pub; docs/security/THREAT-MODEL.md
confidence: verified
lastVerified: 2026-09-22
verificationCommand: bun run vaerion:verify-documentation
-->

The security model of the constitutional system is not a feature list; it is
a set of structural refusals, each proven mechanically to terminate in
`ConstitutionalViolationError`.

---

## 1. The Integrity Substrate — SHA-256 Everywhere

One integrity instrument: SHA-256 (`src/vaerion/authorities/hash.ts`),
attested against the published FIPS 180-2 test vectors. It binds: evidence
artifacts at capture (8.2), chain links (8.5), manifests after signing (8.8),
snapshot identities (9.3; F-002), release receipts (10.3), and the
documentation organ itself (the DOC-META verification).

## 2. The Append-Only Discipline (8.1; 8.5)

History is never rewritten. The Chain Authority
(`src/vaerion/authorities/chain.ts`) grows genesis → append-only →
continuously attestable; breaks are first-class, reconciliation is explicit
and recorded, and appends halt while a break is unreconciled (5.9). Receipts
are immutable — correction appends a superseding receipt linked by parent and
re-append is refused (8.1). Release history is the same law in the release
domain (`src/vaerion/release/ledger.ts`; 10.4 — rollbacks are superseding
entries; the superseded release is proven byte-identical after a rollback).

## 3. Restriction Travel and the Honest Hatch (8.2; Art. XII)

Restriction is a property of evidence, not of a view: it travels with the
artifact wherever it appears and renders hatched with its honest notice. The
Proof Lens adds light, never access — it never widens visibility beyond the
underlying verification grant (Art. XII). Masking or omitting restricted
evidence is refused (`src/vaerion/state/quarantine.ts`; the quarantine gates).

## 4. The Demo Quarantine (5.10)

Demo data may not co-mingle with production data in any store, stream, or
export. Demo flags travel with records and render wherever the record
appears; exports of quarantined content are refused by construction
(`src/vaerion/authorities/export.ts` composes the state engine's law with the
Export Authority's 8.7 lifecycle).

## 5. Manifests and Third-Party Verification (8.8)

A manifest (bundle hash, timestamp authority, issuing engine, ruleset) is
immutable after signing. Verification is pure recomputation — third parties
verify brokenness without product access; mismatches are reasoned, never
silent. The Trust Engine (`src/vaerion/release/trust.ts`) is this law applied
to releases: a delivered release verifies standalone — ledger integrity
recomputation, identity binding, receipt digest + anatomy + signature
re-derivation, artifact provenance, distribution manifest recomputation. No
network, no product contact (11.5 — verifiable indefinitely).

## 6. Identity — Reveal-Once Credentials (8.9)

Actors are exactly human, machine, or engine (no fourth kind). Credentials
are reveal-once with a mandatory ceremony; rotations and identity events
enter the admin log as full receipts (`src/vaerion/authorities/identity.ts`).

## 7. The Release Signature — Honest Placeholder (IR-017)

Receipt signatures are a deterministic SHA-256 keyed digest bound to the
fingerprint of `keys/release-signing.pub`: same body + same key = same
signature; any body alteration detaches it (proven by
`bun run vaerion:verify-signatures` — tamper detection, determinism,
anonymous-key refusal). It is honestly labeled `signatureAlgorithm` in every
receipt — nothing stronger is claimed (Art. VIII). The asymmetric algorithm
and key ceremony are filed as IR-017 (PROPOSED) — not improvised (P-5).

## 8. Delivery Is Never Fabricated (IR-019; Art. VIII)

A distribution channel moves to `delivered` only on external delivery
evidence; this environment cannot contact external registries, so all eight
channels stand honestly at `signed` and `markDelivered` without evidence
refuses (`src/vaerion/release/distribution.ts`; proven in
`bun run vaerion:verify-distribution`).

## 9. The Refusal Proofs (Stage 9, Deliverable 8)

`src/vaerion/testing/security.ts` runs eight ordered refusal proofs, each
requiring `ConstitutionalViolationError` from the real engine — optimistic
verdict rendering, verdict fabrication, unauthorized dispatch, quarantine
co-mingling, demo export, manifest tampering, chain tampering, restricted-
evidence masking. `bun run vaerion:verify-security` — 8/8.

## 10. The Product Threat Model

The product-engineering security documentation — the threat model, the
mitigations, remote protection, the risk ledger — is preserved at
`docs/security/` and governs the pre-existing engine (`packages/vaerion/`).
It is a different instrument from this Volume IV system (IR-003; INDEX.md
§4) and is not superseded by the knowledge organ.
