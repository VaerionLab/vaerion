# OFFICIAL BRAND ASSETS — MANIFEST OF RECORD

**Delivered:** PHASE 16.4 (Founder upload, received 2026-09-24 — CDN-recovered)
**Status:** OFFICIAL — the assets in this directory are the Founder-provided
identity package of record — the ONE source of truth. Every derived surface
in `public/` (and `editors/vscode/media/vaerion.png`) renders from THESE
files only, via `tools/official-brand-derive.py` (format adaptation —
never draws).

This set REPLACES the PHASE 16.1 official set (four rasters) in full, by
Founder order ("remove the things in the brand/official replace it with the
ones i uploaded just now" + "keep them with you"). The superseded custody
record is preserved at the bottom of this document.

## Delivery & recovery note (RULE ZERO)

This delivery landed during a **sandbox environment regression**: the
working tree was restored to the Phase 13 commit (`42d1146`) and the
`upload/` mount came back **empty** — the Founder's just-uploaded files
never persisted to disk. The six files below were recovered **byte-exact**
from the delivery CDN URLs attached to the Founder's message, sha256-recorded
at download, and pixel-verified one by one. The previous session's unpushed
snapshot commits and `.env.local` were not recoverable; full disclosure in
the Founder-side launch-readiness record (PHASE 16.4 section, Task ID 23).

Provenance precision: the mapping **CDN file → pixel content** is ground
truth (every file opened and visually verified). The mapping **original
upload filename → CDN file** is derived from the delivery order of the
Founder's message; four of six pairings are independently corroborated by
filename↔content agreement (`monochrome.png`, `vaerion app icon .png`,
`lgo.png`, `vaerion.png`); the two ChatGPT-generated files are paired by
delivery order. Recorded honestly — no pairing is invented.

## Assets of record (byte-exact; renamed only for canonical custody)

| File of record | Original upload filename | CDN source file (uuid prefix) | sha256 (full) | Dims | Role |
|---|---|---|---|---|---|
| `official-mark-gold.png` | `ChatGPT Image Sep 17, 2026, 09_01_46 PM.png` | `4e6e2857…` | `8a69e37a17d35a4d671e6354639530c7c33cfa8b26d0ae7359fe0d3f026a8641` | 259×199 | PRIMARY mark — clean gold V on ink (no captions) |
| `official-brand-board.png` | `ChatGPT Image Sep 17, 2026, 09_01_50 PM.png` | `99a46904…` | `7d62208f770939bffd307accf9da1739c89954cbbe4ffbace57bd3ad1edf6598` | 1254×1254 | brand board: full suite, tagline, lockups, palette |
| `official-lockup-horizontal.png` | `lgo.png` | `a552e74a…` | `1abd69794eb8e96215e36c3146c8a939ea9aacebfa81a5df14fe97b312ead82f` | 1254×468 | horizontal lockup banner (mark + wordmark + tagline) — OG source |
| `official-mark-monochrome.png` | `monochrome.png` | `9c41b80e…` | `be2a75dc2cf2af6dea9bdad1e8276a20132026dd59e6e99d5471fbec7271511f` | 314×297 | monochrome (white V) edition card |
| `official-app-icon-gold.png` | `vaerion app icon .png` | `240db388…` | `b7f9f925382528faf9160c6d1668369345b47ed81c5f73c12815cc63532591d8` | 322×282 | Founder-labeled "APP ICON" — primary icon source |
| `official-app-icon-light.png` | `vaerion.png` | `c8db0337…` | `048d01f15150ea6ba308e8d4cc09b1f61d1523690bed16c4f2804a0091cc115e` | 311×283 | light app-icon edition card |

The caption text visible on three cards ("APP ICON", "MONOCHROME",
"APP ICON (LIGHT)") is part of the Founder's presentation cards and is
preserved byte-exact; derivation crops exclude caption bands.

## Official identity elements (read from the board of record)

- **Mark:** the folded-ribbon gold V
- **Wordmark:** VAERION
- **Tagline (new of record):** "SEE IT. EXPLAIN IT. OWN IT."
- **Palette (as shown on the board):** gold · ink black · steel gray ·
  porcelain white · violet. Token law: the archived pre-ratification
  tokens (IR-003, archived Founder-side) were NOT modified;
  any token re-ratification is a Founder-gated ruling, not a derivation act.

## Derivation law (PHASE 16.4, re-proven live)

`tools/official-brand-derive.py` adapts FORMATS ONLY (crops + resizes of
the official pixels; the OG is a pure cover-crop of
`official-lockup-horizontal.png` — nothing composed, rendered, or drawn).
No SVG identity file exists anywhere in the tree; no other brand generator
exists (`tools/brand-render.ts` was deleted — 16.1 enforcement, restored
tree re-purged in this phase).

Derived outputs of record (this run):

| Output | sha256 (first 16) |
|---|---|
| `public/icon-512.png` | `90b6bc27d652c423` |
| `public/icon-192.png` | `34a9c683db73b91e` |
| `public/apple-touch-icon.png` | `c84902de5ed116d5` |
| `public/favicon-32.png` | `94fc7384006d18a3` |
| `public/favicon-16.png` | `ee3bcbd1ffe83820` |
| `public/og-image.png` | `c032ea415a945479` |
| `editors/vscode/media/vaerion.png` | `94fc7384006d18a3` (≡ `favicon-32.png` — equivalence law preserved) |

Icon crop of record: `(56, 14, 264, 222)` of `official-app-icon-gold.png`
(caption band excluded; visually verified — mark centered, nothing clipped).

## Superseded custody record — PHASE 16.1 set (historical)

Replaced in full by the set above (Founder order, PHASE 16.4). Byte-exact
recovery copies are held off-repo (environment-specific location, not published):

| File of record (purged) | Original upload filename | sha256 (full) |
|---|---|---|
| `official-logo-board.png` | `ChatGPT Image Aug 31, 2026, 01_20_03 PM.png` | `651de9003ae1b111fbfffbfa7f9606db5e534196023aac887130831b5e6dada7` |
| `official-icon-gold.png` | `Gemini_Generated_Image_90unty90unty90un.jpg` | `57f6e16703566d6744aafbe6ae8f25e5aef1b6e8b2ddb15007027fd4372bc1d1` |
| `official-icon-silver.png` | `Gemini_Generated_Image_nnjhh8nnjhh8nnjh.jpg` | `aadcf812da3220fffced509c4d611ca58e38bc4834934bc176b91d63b8319287` |
| `official-icon-gold-alt.png` | `Gemini_Generated_Image_ruhfs3ruhfs3ruhf.jpg` | `46f312a6d0056f78fe851aec4d2d360b2df9eba3703cfa119ad7d3edade86602` |

Their tagline ("VERIFIED. REPRODUCIBLE. TRUSTED.") and palette accents
(trust green / electric blue) are superseded by the board of record above.
Law chain preserved: PHASE 16 (delivery) → 16.1 (integration) → 16.2
(ABSOLUTE BRAND LAW) → 16.3 (BRAND PURGE — `brand/` = `brand/official/`
only, zero SVG identity) → **16.4 (this replacement set)**.
