# THE OFFICIAL LOGO SLOT — Reservation, Replacement Procedure, Integration Map

**Status: DELIVERED & INTEGRATED — Phase 16 (2026-09-24).**
**Order authority:** Phase 12 (reservation) · Phase 16 — Final Launch
Readiness Mission, TASK 1 (official replacement).

> **STATUS ANNOTATION (2026-10-22, freshness audit).** The 2026-10-21 brand
> re-establishment of record (constitution `INDEX.md` §4, erratum A9) restored
> `tools/brand-render.ts` and the generated identity kit to the tree. The
> Phase-16 enforcement records below are preserved verbatim as history; their
> present-tense removal claims no longer describe the tree.

> **PHASE 16.2 ABSOLUTE BRAND LAW RECORD (2026-09-24).** The Founder's
> absolute directive is enforced: every SVG identity carrier removed
> (`brand/logo/**` ×11, `public/logo.svg`, `public/favicon.svg` — the site
> renders the official raster `/icon-192.png` directly), the terminal
> chevron drawing removed (typographic banner only), `brand/BRAND-BOOK.pdf`
> removed, pre-official observatory captures removed, and
> `tools/official-brand-derive.py` restricted to PNG-only derivation. The
> sole remaining SVG container is the VSCode platform-required command
> icon carrying the official pixels verbatim. The slot map below is
> updated accordingly: the logo slot is `/icon-192.png`; the favicon slot
> is the PNG set.
>
> **PHASE 16.1 ENFORCEMENT RECORD (2026-09-24).** The Founder's
> official-only directive was enforced across every surface: the retired
> generator `tools/brand-render.ts` is REMOVED from the tree; the old
> generated OG vectors (`public/og-image.svg`, `brand/og-image.svg`) and
> generated wordmarks (`public/brand/wordmark*.svg`) are DELETED; the
> drawn inline V glyph in the site proof seal (`SealGlyph`) and the VSCode
> command icon now render the official pixels. The only non-raster brand
> element remaining is the terminal ASCII chevron — the terminal cannot
> render the official raster and no official ASCII asset was provided;
> recorded as UNREPLACED (reported, not improvised).
>
> **PHASE 16 INTEGRATION RECORD.** The Founder-provided official assets
> arrived 2026-09-24 (four raster files; the announced zip was not present
> — recorded in `brand/official/MANIFEST.md`). Every integration point in
> `public/`, `brand/png/`, and `brand/logo/*.svg` now renders the official
> double-chevron V via `tools/official-brand-derive.py` (format adaptation
> only — no artwork invented). The generator-produced "Ledger V" set is
> SUPERSEDED; `tools/brand-render.ts` is retired for the `brand/` tree.
> The reservation law below stands as history; the standing identity is
> now the official identity of record.

---

## The law of this slot

1. **No logo was created.** Nothing in this preparation draws, generates,
   or replaces a mark. The Phase 12 order is explicit: *"Do NOT create or
   invent the Vaerion logo… Wait for the official logo asset. Do not
   replace it with placeholders."*
2. **The standing identity is real, and its status is declared.** The
   assets currently in use are the generator-produced set of
   `tools/brand-render.ts` (the "Ledger V" system documented in
   `brand/BRAND-BOOK.md` v3, byte-reproducible by law). The
   constitutional index (`constitution/INDEX.md` §4) classifies the
   `brand/` tree as a pre-ratification artifact with no constitutional
   authority over Volume IV surfaces pending the Founder's ruling
   (IR-003). They are used as the standing identity of record — not as
   the official logo, and not as a placeholder.
3. **When the official asset arrives, it replaces files — not code.**
   Every consumer renders through the single integration points listed
   below. The Founder drops the official asset at the slots; the
   civilization re-brands with zero engineering.

## The replacement procedure (when the Founder provides the logo)

1. Place the official master in `brand/logo/official/` (retain the
   original, untouched, as the provenance master — `Bible Art. VIII`:
   nothing anonymous, nothing overwritten).
2. Replace the served assets (same filenames, atomic commit):
   - `public/logo.svg` — the site/instrument mark slot
   - `public/favicon.svg`, `public/favicon-16.png`, `public/favicon-32.png`,
     `public/icon-192.png`, `public/icon-512.png`,
     `public/apple-touch-icon.png` — the favicon system
   - `public/og-image.png` (1200×630) + `public/og-image.svg` — social card
3. If raster editions at other sizes are needed, render them from the
   official master (sharp pipeline precedent: `tools/brand-render.ts`) —
   never hand-resampled drift.
4. Run `bun run lint`, then `bun run tools/verify.ts`, and commit with the
   tag discipline of the release train. Record the replacement in
   `CHANGELOG.md` and, if the Founder rules it, close IR-003.

## The integration map (what already consumes the slot)

| Integration | Site | Mechanism | Status |
|---|---|---|---|
| Logo component | `src/components/launch/Logo.tsx` | single `<img src="/icon-192.png">` slot consumed by nav, footer, boot screen | ENFORCED (16.2: official raster, no SVG container) |
| Launch navigation | `src/components/launch/LaunchNav.tsx` | renders `<Logo/>` + wordmark | READY |
| Launch footer | `src/components/launch/LaunchFooter.tsx` | renders `<Logo/>` + identity line | READY |
| Boot/loading screen | `src/components/launch/BootScreen.tsx` | renders `<Logo/>` during the entry moment | READY |
| Metadata & favicon | `src/app/layout.tsx` | icons `/favicon-32.png`, `/favicon-16.png`, `/icon-192.png`, apple `/apple-touch-icon.png`; OG/Twitter `/og-image.png` | ENFORCED (16.2: PNG-only) |
| Instrument surfaces | ten-surface console (`src/vaerion/surfaces/`) | token-law driven; gold reserved for verified evidence (VS §9) | governed by the Visual System — the logo slot is the served assets above |
| Documentation branding | Knowledge Interface (`src/vaerion/docs/knowledge-interface.tsx`) | typography-and-token law; no raster mark by design (IR-005, VS §4) | governed — no change needed |
| Release branding | `brand/` + release page collateral (`docs/launch/RELEASE-PAGE-DESIGN.md`) | official-asset law: derived only via `tools/official-brand-derive.py`; `tools/brand-render.ts` REMOVED (PHASE 16.1) | ENFORCED — official-only |

## What this preparation deliberately did NOT do

- It did not draw, commission, or interpolate any new mark.
- It did not alter a single existing brand asset (see the unchanged
  byte state of `brand/` and `public/` in the launch diff).
- It did not promote the standing identity to "official" — that word
  belongs to the Founder alone.
