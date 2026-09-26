# THE RELEASE MODEL — Nothing Is Believed; Everything Is Verified

<!--
DOC-META
id: DOCS-RELEASE
title: Release Model
owningSystem: Stage 11 — Documentation Architecture (src/vaerion/docs)
authorityCitations: Implementation Constitution Part X; Implementation Constitution 10.1; Implementation Constitution 10.2; Implementation Constitution 10.3; Implementation Constitution 10.4; Implementation Constitution 2.7; Implementation Constitution P-6; Bible Art. III; Bible Art. XI; Foundation Amendment F-006; Foundation Amendment F-007; Stage 10 execution order Deliverables 1-10
relatedArtifacts: src/vaerion/release/; constitution/releases/index.json; constitution/releases/receipts/rel_769da4b7bf84ad3b.receipts.json; tools/vaerion-pipeline/release.ts; tools/vaerion-pipeline/verify-everything.ts; tools/vaerion-pipeline/full-graph.ts; src/vaerion/release/verification.ts; src/vaerion/docs/reports/STAGE-10-RELEASE-ENGINE-CONFORMANCE.md
confidence: verified
lastVerified: 2026-09-22
verificationCommand: bun run vaerion:verify-documentation
-->

## 1. The Gate Is the Ceremony

A release exists only through the Release Authority
(`src/vaerion/release/authority.ts`) — the sole issuer (10.3; F-006). The
gate and the ceremony are one program: `tools/vaerion-pipeline/full-graph.ts`
runs the twelve standing stage verifiers as real subprocesses, plus
in-process snapshot integrity, source manifest, protocol version, and the
ten-area engine battery, then demonstrates all fourteen Bible Articles from
that evidence (the Article Gate, 10.2). If one check fails, the release
never exists — not a warning, not yellow (10.1). `bun run vaerion:release`
executes it end to end.

## 2. The Seven-Receipt Ceremony (10.3)

On green, the ceremony issues seven receipts — constitutional, build,
artifact, registry, snapshot, integrity, distribution — each carrying the
mandated twelve-field anatomy: identity, timestamp, SHA-256, parent release,
constitutional version, snapshot version, registry version, evidence
references, chain references, authority, digital-signature placeholder,
citations. No receipt → no release.

## 3. The Constitutional Version Engine

Release identity is derived, never hand-typed: version `1.0.<stage>.r<seq>`
from the ratified document titles, the protocol version, the stage, and the
ledger sequence (`src/vaerion/release/identity.ts`); the Registry version is
consumed from the canonical Registry itself (2.8).

## 4. Deterministic Builds (Deliverable 3; P-6)

`src/vaerion/release/build.ts` proves determinism: same source twice →
identical build ids, source-tree hashes, output digests; any drift fails,
never warns. The deterministic record carries no clock reading — time lives
in the receipt that attests the build.

## 5. Artifact Intelligence (Deliverable 4)

Every artifact knows its origin, constitution version, registry version,
owning release, proving snapshots, approving authorities (named verifiers
only — Art. III), and evidence references (`src/vaerion/release/artifacts.ts`).
Nothing may exist anonymously; an anonymous dimension is refused.

## 6. Rollback Is Constitutional History (10.4)

`src/vaerion/release/rollback.ts` requires a non-empty reason, affected
artifacts, evidence links, a recovery chain reference, and a target that
exists in the ledger. The Rollback Receipt records reason, supersedes,
parent chain, affected artifacts, SHA-256 integrity proof, evidence links,
and recovery chain — appended as a superseding ledger entry. The superseded
release remains untouched (11.4). Rollback is not undo.

## 7. The Eight Channels (Deliverable 7)

npm, pypi, vscode, jetbrains, neovim, cli, docs-bundle, offline-bundle
(`src/vaerion/release/distribution.ts`). Each assembles real hashed package
contents carrying the constitutional identity line, computes manifests
through the Export Authority's lifecycle (8.7–8.8), and signs. Channels move
to `delivered` only on external delivery evidence (IR-019) — all eight stand
honestly at `signed`.

## 8. The First Release (F-006 record)

Issued by the Release Engine on the current tree:

| Field | Value |
|---|---|
| Release id | `rel_769da4b7bf84ad3b` |
| Version | `1.0.10.r1` |
| Ledger | seq 1, parent genesis |
| Receipts | 7 (constitutional `rcp_constitutional_4f745d6708eeca90…`, build, artifact, registry, snapshot, integrity, distribution) |
| Artifacts | 4 provenanced |
| Channels | 8, all `signed` |
| Record | `constitution/releases/receipts/rel_769da4b7bf84ad3b.receipts.json` + `constitution/releases/index.json` |

Re-running the ceremony on an evolved tree issues the **next** release in
the chain — honest evolution, never mutation (10.4; 11.4).

## 9. The Mechanical Release Gates (Deliverable 10)

Eight commands, each emitting an evidence record (PASS/FAIL · evidence ·
citation · artifact · timestamp · SHA-256):
`vaerion:verify-build`, `vaerion:verify-signatures`,
`vaerion:verify-artifacts`, `vaerion:verify-distribution`,
`vaerion:verify-rollback`, `vaerion:verify-release`,
`vaerion:verify-trust`, `vaerion:verify-everything` (the aggregate — 7/7).

## 10. The Release Observatory (Deliverable 9; IR-018)

Renders exclusively from the stored release record — release chain,
constitution version, registry and snapshot evolution, artifact graph,
integrity status, deployment history, rollback history, evidence graph,
verification timeline, Article Gate. Generated as a pipeline artifact
(`tools/vaerion-pipeline/observatory/index.html`) and served read-only at
`/api/release/observatory`. Absence renders as "none recorded" — never as a
fabricated zero.
