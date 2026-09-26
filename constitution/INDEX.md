# CONSTITUTION INDEX — Authority Registry

**Status:** RATIFIED. This index is the single point of departure for every
Volume IV artifact. It is maintained by the Design Systems Authority
(Implementation Constitution 11.1) and audited through the Trace Index.

---

## 1. Order of Precedence (Implementation Constitution P-1)

1. **VAERION_DESIGN_BIBLE_v1.0**
2. **VAERION_VISUAL_SYSTEM_v1.0.1**
3. **VAERION_IMPLEMENTATION_CONSTITUTION_v1.0**

In any conflict, the higher document prevails. A lower document is never read
to relax a higher one.

## 2. Ratified Documents

| id | Title | Version | Status | Canonical path | Repository transcription |
|----|-------|---------|--------|----------------|--------------------------|
| `BIBLE` | VAERION_DESIGN_BIBLE_v1.0 | v1.0 | RATIFIED | `constitution/bible/VAERION_DESIGN_BIBLE_v1.0.md` | **COMPLETE — DP-1 (F-001)** |
| `VISUAL_SYSTEM` | VAERION_VISUAL_SYSTEM_v1.0.1 | v1.0.1 | RATIFIED | `constitution/visual-system/VAERION_VISUAL_SYSTEM_v1.0.1.md` | **COMPLETE — DP-2 (F-001)** |
| `IMPLEMENTATION_CONSTITUTION` | VAERION_IMPLEMENTATION_CONSTITUTION_v1.0 | v1.0 | RATIFIED | `constitution/implementation-constitution/VAERION_IMPLEMENTATION_CONSTITUTION_v1.0.md` | **COMPLETE** |

**Transcription discipline.** The three documents were ratified in session and
are transcribed into the repository without alteration — no simplification, no
modernization, no rewording (Volume IV directive, "Do not replace
constitutional language"). Transcription of all three is **complete**
(DP-1/DP-2 closed under Foundation Amendment **F-001**). Identity between the
repository copies and the ratified originals is **proven mechanically**: the
Snapshot Authority manifest
`constitution/snapshot-authority/manifests/canonical-documents.json` pins the
SHA-256 digest and byte size of each document, and
`bun run vaerion:verify-constitution` fails closed on any divergence.
Formatting serves meaning only; one recorded ambiguity (Gauge Ladder index
record) is filed as **IR-004**, not interpreted in place.

## 2a. Constitutional Authority Organs (Foundation Amendments F-002…F-006)

| Organ | Path | Defines |
|-------|------|---------|
| Snapshot Authority | `constitution/snapshot-authority/` | the fidelity canon (P-6, 9.3): snapshots/ + manifests/; first manifest pins the ratified documents |
| Announcement & Copy Registry | `constitution/announcement-registry/` | the law of every announced or displayed string (6.11); no strings ratified yet |
| Registry authority | `constitution/registry/` | the **law** of the canonical Registry (Part II); the implementation at `src/vaerion/registry/` **executes** it — neither replaces the other (F-004) |
| Release record authority | `constitution/releases/` | the home of Release Receipts (10.3–10.4); build outputs never belong here (F-006) |
| Generated artifact root | `generated/` | the only lawful home of compiler output (2.7); never hand-authored (F-005) |

## 3. Governance Ledgers

| Ledger | Path | Contents |
|--------|------|----------|
| Amendments | `constitution/amendments/LEDGER.md` | **F-001…F-007 (RATIFIED)** — Foundation Amendments |
| Interpretation requests | `constitution/interpretations/LEDGER.md` | IR-001, IR-002, IR-003, IR-004 (PROPOSED) |
| Trace Index | `constitution/trace-index/trace-index.md` | citation ↔ artifact mapping (Constitution P-4) |
| Changelog | `constitution/CHANGELOG.md` | versioned like a protocol (Constitution 11.3) |

## 4. Pre-Ratification Artifacts — No Constitutional Authority

The following predate the ratified design constitutional series. They are
preserved as history and are never deleted (Constitution 11.4), but they hold
**no authority** over Volume IV surfaces and must not be consumed by the
Registry or any primitive:

- `docs/history/brand-tokens.json` — pre-ratification brand tokens (relocated from `brand/tokens.json` by the PHASE 16.3 Founder brand purge; `brand/` now holds ONLY `brand/official/`). `brand/BRAND-BOOK.*` and `brand/logo/` were purged outright by the same order (2026-09-24)
- token block in `src/app/globals.css` — pre-ratification site tokens
- `docs/constitution/VAERION_CONSTITUTION_v1.0.md` … `v1.7.md` — product-engineering constitution (a different instrument, governing the engine in `packages/vaerion/`)

Relationship recorded and governed as **IR-003** in the interpretation ledger.

## 5. The Silence Rule (Implementation Constitution P-5)

Where all three documents are silent, engineers do not improvise. File an
interpretation request in `constitution/interpretations/LEDGER.md`. Improvised
resolution of undefined cases is a violation regardless of the quality of the
result.
