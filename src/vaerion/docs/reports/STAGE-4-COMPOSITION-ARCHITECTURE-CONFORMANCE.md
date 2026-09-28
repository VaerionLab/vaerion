# STAGE 4 — COMPOSITION ARCHITECTURE CONFORMANCE REPORT

**Operation:** Composition Architecture · **Authority:** VAERION_IMPLEMENTATION_CONSTITUTION_v1.0 (Part IV) · **Dependency:** Stage 3 Primitive Architecture complete (verified).
**Doctrine honored:** not designing layouts — enforcing the three constitutional skeletons and the registered surface bindings.

---

## 1. Surfaces created (all ten, per 4.6 Surface Bindings)

| Surface | Skeleton | Binding compliance |
|---|---|---|
| **Runtime** | Console | live pulses (PENDING seal, the sanctioned breathing element); Timeline replay with scrub + step controls; Log stream; Gauge only after the 300 ms threshold; demo run ends in a Return (6.5) |
| **Ledger** | Console | Criteria Bar **sticky** and owning all filters (4.4); sliced rendering with "showing N of 1,412" (Art. X); integrity strip = read-only Chainline summary with the break rendered as a break (4.5); jump-to-date Field Frame |
| **Receipt Viewer** | Document | ceremony seal at 44 inside the full ceremony gap (`space.receiptCeremony` = 64 px, VS §1.3); Margin Notes rail (320 px at ultra-wide, VS §1.4); Guided Read — the four verdict explainers reachable forever (Art. XIII); the Proof Lens wraps the claim (Art. XII) |
| **Constitution** | Document | statute-book structure over the three ratified volumes in precedence order; every rule deep-linkable by anchor; drift markers bound to affected receipts (8.4) |
| **Audit** | Console | Range Grammar within the Criteria Bar; result table (horizontal rules, tabular numerals, unit column, Seal-16 verdicts); export preview in receipt grammar; export **disabled** (demo quarantine; 8.7) |
| **Verification** | Console | age-sorted queue; keyboard verbs fixed — J/K motion, V verify (600 ms hold-to-affirm on the registered meter), R review (ceremony dialog with rule quote), E evidence; every decision issues a receipt (4.6; 5.3) |
| **Enterprise** | Console | reveal-once credential ceremony (ceremony Dialog, cannot be reopened); admin action log rendered as receipts (8.9) |
| **Attestation Status** | Status | the governing attestation fields on one screen (VS §13.3: engine version, rule set, environment, gate results, chain health) + Registry conformance declaration (2.8); gate results rendered as received — none claimed (1.6); incident log as receipts |
| **Playground** | Console | universal DEMO quarantine; exports disabled; teaching state panels for the four verdicts; intact and broken Chainline demonstrations |
| **Search** | Status variant | hash-first resolution (identifier-first per the Caliper grammar); grouped, sealed results |

## 2. Skeleton mappings

Exactly **three** skeletons (4.1; VS §1.4) — Console (6 surfaces), Document (2 surfaces + ultra-wide Margin Rail), Status (2 surfaces). No fourth layout exists. Chrome (Environment Stamp + Spine) is authored once in the Shell and inherited everywhere (4.3) — verified in-browser: the stamp renders on all ten surfaces; the Spine renders with the four registered territories.

## 3. Primitive usage

All composition is built from Stage 3 primitives: Seal, Receipt (row/card/page), Panel, Chainline, Button, Field Frame, Audit Table, Log, Timeline, Environment Stamp, Spine, Dialog, Return (+provider), Gauge, Lens, Hash Line, Evidence Item, Ledger Row, Micro Label, Criteria Bar. Token consumption flows exclusively from the generated bindings (2.7(c)) — implementation stylesheets are var()-only (gate-enforced, 22,853 checks).

## 4. Composition rules enforced

- **4.2 Anatomy order** — receipt composition preserves the sacred order in every variant and target.
- **4.3 Chrome inheritance** — stamp + spine authored once; no surface re-renders them.
- **4.4 Criteria Bar ownership** — Ledger, Audit, Verification, Search own filters through the Criteria Bar; no ad-hoc filter controls exist.
- **4.5 Chain continuity** — breaks render as breaks at every breakpoint (integrity strip, Timeline, Playground).
- **4.6 Surface bindings** — per-surface table above.
- **4.7 No invented language** — copy is consumed **by identifier** from the copy module backed by the proposed string set (IR-009); a runtime gate throws on any unregistered id (proven live during browser QA when a mismatched id was caught and corrected); constitutional vocabulary (verdict words, anatomy labels, territory names, state words) is law-sourced.
- **5.10 Demo quarantine** — every record at Stage 4 is Demo-stamped (the flag travels with the record and renders wherever it appears); exports disabled by construction; the Environment Stamp tells the truth: "not-yet-bound (Stage 7)".

## 5. Responsive contract (VS §9; 7.5) — implemented and browser-measured

| Breakpoint (IR-010 pins) | Behavior |
|---|---|
| ≥ 1440 (ultra-wide) | Document skeleton grows the 320 px Margin Rail; reading column does not stretch — it gains rails |
| ≥ 1024 (standard) | full instrument; vertical spine |
| 768–1023 (tablet) | spine collapses into its registered horizontal position |
| < 768 (narrow / touch) | honest degradation: spine horizontal, receipt rows stack (compression, never anatomy suppression), machine literals wrap (never truncated without the elided mark), ledger rhythm (36 px) and seal clearances never compress |

Measured: `scrollWidth == viewport` on **all ten surfaces at 390 px** and at 1280/1500 px after the fixes below.

## 6. Violations found and corrected during browser verification

| Found | Violation | Correction |
|---|---|---|
| runtime | copy consumed by key instead of registered identifier; render-time string composition | canonical-id consumption only (F-003) |
| runtime | Document skeleton grid stacked spine and reading column | grid corrected to `auto minmax(0,1fr)` (+ rail column at ultra-wide); Margin Rail cascade order fixed |
| measured (mobile) | overflow on chrome bar, stamp, spine territories, ledger rows, machine literals, tables, receipt rows | wrap/stack fixes per the honest-degradation contract; final sweep clean on all ten surfaces |
| code review | hold-to-affirm referenced undefined keyframes | `vx-hold-progress` keyframes registered |

## 7. Verification results

| Check | Result |
|---|---|
| lint | **PASS** (exit 0) |
| typecheck (constitutional tree: src/vaerion, src/app, generated, tools) | **PASS** (0 errors) |
| `vaerion:verify-constitution` | **PASS** — digests match |
| `vaerion:compile-registry` (validation + reproducibility + drift) | **PASS** — 64 tokens, gates GREEN |
| `vaerion:verify-primitives` | **PASS** — 22,853 checks, 0 violations |
| `vaerion:stages` dependency graph | **PASS** — graph integrity; stages 1–4 conformant; stage 5 gate `mayBegin: YES` |
| Browser QA (agent-browser) | **PASS** — renders verified in both chambers; golden paths exercised: chamber switch, Spine navigation to all surfaces, Ledger criteria edited in place with slice statement, hold-to-affirm issuing a decision receipt + Return, Proof Lens activated by keyboard L (veil + illuminated chain + hatched restricted evidence) and dismissed by Escape, receipt selection, mobile 390 px overflow-free across all surfaces |

## 8. Governance records

- IR-009 (Stage 4 proposed strings) and IR-010 (structural pins: breakpoints, Returns maximum = 3, Lens hold = 350 ms, attestation field set) filed in `constitution/interpretations/LEDGER.md`; string set registered at `constitution/announcement-registry/stage4-proposed-strings.json`.
- Trace index extended (T-027…T-033), including T-033: the host-route transition — the single user-visible route `/` now mounts `SurfaceHost` (the first constitutional surfaces landed), executing the transition IR-001 anticipated; the pre-ratification site remains preserved untouched (`src/components/site/`, IR-003; 11.4). Founder ratification of IR-001 requested.
- Changelog 1.2.0; amendments ledger records the directive-series stage scope; `foundation/stages.ts` updated (Stage 4 = Composition Architecture; statuses 2–4 conformant).

## 9. Stage 5 readiness

**READY.** The Stage 5 gate (Rendering Engine — layer ordinals deepened, print/grayscale/forced-colors/export targets, full responsive registration) evaluates **mayBegin: YES** with stages 1–4 conformant. Rendering foundations delivered here (chamber scoping, layers, reduced-motion/forced-colors/print blocks) give Stage 5 its substrate.
