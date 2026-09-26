# THE EXTENSION MODEL — How the System Grows Without Breaking Its Law

<!--
DOC-META
id: DOCS-EXTENSION
title: Extension Model
owningSystem: Stage 11 — Documentation Architecture (src/vaerion/docs)
authorityCitations: Implementation Constitution 1.2; Implementation Constitution 1.3; Implementation Constitution 1.4; Implementation Constitution 2.5; Implementation Constitution 2.9; Implementation Constitution 3.0; Implementation Constitution 5.7; Implementation Constitution 6.1; Implementation Constitution 8.0; Implementation Constitution 11.2; Implementation Constitution 11.5; Implementation Constitution P-5; Visual System §0; Visual System §5; Visual System §14; Bible Art. XI; Bible Art. XIV
relatedArtifacts: constitution/registry/lifecycle.json; constitution/registry/token-schema.json; src/vaerion/primitives/contract.ts; src/vaerion/primitives/manifest.ts; packages/vaerion/src/extensions/; spec/wit/vaerion-extension@0.1.0.wit; docs/adr/0009-wasi-p2-components-capability-broker.md; docs/book/guides/extension-kit.md
confidence: verified
lastVerified: 2026-09-22
verificationCommand: bun run vaerion:verify-documentation
-->

There are exactly four lawful ways to extend Vaerion. Anything else is a
violation (P-3; Art. XI).

---

## 1. Register a Token (values)

Visual values enter only through the canonical Registry
(`src/vaerion/registry/`). A new token carries the exact seven-field anatomy
(identifier, instrumentName, value/formula, constraints, governingCitation,
version, status — Constitution 2.2; `constitution/registry/token-schema.json`)
and passes the eleven validation gates. Lifecycle transitions follow the
lawful status graph (`constitution/registry/lifecycle.json`; 2.5, 2.9) —
proposed → active → deprecated, with aliases forward (11.5). The compiler
then regenerates the bindings; a consumer of `generated/` never hand-writes
a value (F-005).

## 2. Manifest a Primitive (components)

A new primitive exists only because a governing document requires it (1.2).
It carries the four binding clauses — Responsibility, Boundaries, Extension,
Composition (3.0; `src/vaerion/primitives/contract.ts`,
`definePrimitive`) — plus registry token references, state awareness, an
accessibility contract, and ≥4 standing citations (P-4). It consumes
`var(--vx-*)` bindings only (1.3), renders received state only (1.6; 5.4),
and its anatomy claims are proven by `bun run vaerion:verify-primitives`.

## 3. Amend the Law (rules)

Where the ratified documents are silent, file an interpretation request
(P-5). Where the law itself must change, file an amendment proposal naming
the Article affected, the necessity, and the migration plan (11.2–11.3).
Ratification updates the document, the registries, the Snapshot Authority,
the Trace Index, and the changelog. **Engineers implement; they do not
redesign** (1.4) — where implementation seems impossible without alteration,
the impossibility itself is reported to governance.

## 4. Extend the Product Engine (the pre-existing runtime)

The pre-existing engine (`packages/vaerion/src/extensions/`) implements the
extension host and factory of the product constitution
(`docs/constitution/`, a different instrument — IR-003), with the
capability-declaration contract at `spec/schemas/capability-declaration.schema.json`
and the extension WIT contract at
`spec/wit/vaerion-extension@0.1.0.wit` (ADR-0009 — WASI-P2 components behind
the capability broker). Its law lives in `docs/book/guides/extension-kit.md`
and the ADR series (`docs/adr/`).

## 5. What Cannot Be Extended

- **The verdict set** — exactly four verdicts; no fifth, no alias (Bible Part Three).
- **The state set** — exactly twelve states; unknown states throw (5.1–5.2).
- **The transition set** — the lawful rows of 5.7; unlisted transitions throw.
- **The command verbs** — go / get / verify / attest; free-form handlers are prohibited (6.1).
- **The skeleton set** — exactly three skeletons; no fourth layout (4.1).
- **The surface set** — exactly ten registered surfaces; enlargement requires the Founder's amendment (4.6; the IR-018 precedent).
- **The authority set** — exactly seven named authorities; the names are constitutional (8.0).
- **The registry set** — exactly seven sub-registries (VS §0).

## 6. The Compatibility Law (11.5)

Receipts, manifests, and exports must remain verifiable indefinitely across
Registry and Constitution versions; tokens alias forward; surfaces declare
their conformance version; the Parity Harness must pass across the supported
version window.
