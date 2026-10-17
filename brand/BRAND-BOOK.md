# Vaerion Brand Book — v3

**The Vaerion design system** — one visual language across the seal, the
terminal, the reports, and the web. Luxury here means refinement, not
decoration: every rule below exists to make the product feel *calm,
confident, precise, and elegant*. The brand communicates five things and
nothing else: **trust, intelligence, security, precision, and
developer confidence.**

- **Generated assets**: everything under `brand/logo/`, `brand/png/`,
  `brand/tokens.json`, and `public/` (icons, og image, logo) is produced by
  `tools/brand-render.ts`. Never hand-edit an artifact — change the geometry
  source and regenerate. Running the generator twice produces identical
  bytes (verified — the same law the engine applies to `.vxn` bundles).
- **v3 change (geometry only)**: the mark's inner chevron became a **solid
  evidence deposit** — see §1. The palette gains `void` (#000000) as the web
  canvas; every other token is unchanged from v2, so CLI mirrors stay valid.
- **Mirrors**: terminal tokens are mirrored in
  `packages/vaerion/src/cli/ui.ts` (RGB triplets, unchanged in v3); the web
  face consumes the same hex values through `src/app/globals.css`.
- **v1 archive**: the v1 (witness-seal) PDF snapshot was REMOVED under
  PHASE 16.2 (it rendered the superseded generated identity); provenance
  lives in git history. This file is the source of record.

---

## 1. The mark — the Ledger V

One stroke, one deposit. The **outer V** is the action an autonomous agent
takes — a stroke: motion, transient, gone the moment it completes. The
**solid diamond** nested in its cradle is the evidence that action leaves
behind — a deposit: an artifact that remains after the process ends.

> Action happens. Evidence remains. Trust is created.

The two forms are deliberately different *kinds* of geometry — a stroke
versus a solid — because that contrast is the product thesis: verification
is not applied after the fact, and it is not the same substance as the
action. A mitered, machined construction — butt caps, no rounding, no
effects — because precision is the message.

**Clearance law (fail-closed).** Every deposit vertex keeps a minimum gap
from the stroke and its cap line. The generator measures the gaps and
*refuses to emit any asset* if an edit violates them — bad geometry cannot
reach the repository.

| Asset | File | Use |
|---|---|---|
| Seal — signature (gold gradient on ink) | `brand/logo/vaerion-icon.svg` | app icon source, hero surfaces |
| Monogram (bare mark, no plate) | `brand/logo/vaerion-monogram.svg` | inline marks, watermarks, loading states |
| Wordmark | `brand/logo/vaerion-wordmark.svg` (ink) / `-light` (porcelain) | headers, documents |
| Primary lockup | `brand/logo/vaerion-logo.svg` (gold-on-ink) / `-light` | hero surfaces, release pages, OG |
| Social avatar (edge-to-edge plate) | `brand/logo/vaerion-avatar.svg` + `brand/png/avatar-1024.png` | GitHub / Discord / social profiles — circle-mask safe |
| Favicon | `public/favicon.svg` + `public/favicon-16.png`, `-32.png` | browser tab — uses the **compact geometry** |
| App icons | `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png` | PWA / OS icons |
| Social preview | `public/og-image.png` (1200×630) + `public/og-image.svg` | Open Graph / Twitter cards |
| Generic path | `public/logo.svg` | drop-in gold seal |

### Editions

| Edition | File | Rule |
|---|---|---|
| **Gold (signature)** | `brand/logo/vaerion-icon.svg` | dark surfaces, release moments, hero. Gold gradient: `goldSoft → gold → goldDeep` |
| **White** | `brand/logo/editions/white.svg` | dark surfaces where gold would compete with data |
| **Black** | `brand/logo/editions/black.svg` | light surfaces (print, documents) |
| **Mono** | `brand/logo/editions/mono.svg` | single-color contexts; follows `currentColor` |
| **Compact geometry** | generator `MARK_COMPACT` | favicon/app icons only — heavier strokes survive 16 px |

### Clearspace & size

- Clearspace: keep `1 × outer stroke width` free on all sides; `2 ×`
  preferred in print.
- The seal reads from **16 px** (deposit visible as the gold point inside
  the V); use the monogram (no plate) below 24 px.
- Never: rotate, recolor outside the palette, add effects/shadows/glows to
  the mark, place the wordmark inside the plate, stretch any axis, outline
  or hollow the deposit (the solid form *is* the evidence), or detach the
  deposit from the cradle (the composition *is* the mark).

### Tagline

Set in mono, letter-spaced, gold: **VERIFIED · REPRODUCIBLE · TRUSTED**
(dot separators, not bullets). Use on release pages, OG image, and swag —
not in body copy.

---

## 2. Color

The palette is void, deep graphite, steel, porcelain, and **one** brand
accent: gold. Semantic colors exist only for evidence states and are used
sparingly — color always accompanies a word or symbol (never color alone).

| Token | Hex | Role |
|---|---|---|
| `void` | `#000000` | **the canvas** — OLED black; the page background in dark mode |
| `ink` | `#0B0D10` | deep graphite — seal plate, terminal wells, OG surface |
| `ink-soft` | `#1A1F26` | raised surface (steel, legacy ramp — CLI mirrors) |
| `steel-hi` | `#232A33` | raised-2 / hover surface |
| `porcelain` | `#FAF9F6` | light surface; primary text on ink |
| `gold` | `#D4AF37` | **the** accent — key highlights, active states, the mark |
| `gold-bright` | `#E3B341` | gold on dark surfaces and small sizes |
| `gold-soft` | `#F4DC8A` | gradient crown stop |
| `gold-deep` | `#8F6E1D` | gradient root stop |
| `graphite` | `#55555E` | secondary text on porcelain |
| `mist` | `#9C9CA6` | muted text, captions |
| `line` | `#232932` | hairlines on ink |

**Elevation law (dark mode).** The canvas is `void` — true black. Elevation
moves in one direction only: `void → surface → surface-2 → gold`, and every
step is announced by a hairline, never by a shadow alone. Web face ramp:
`#000000` (canvas) → `#101318` (panels) → `#191D23` (nested elements);
terminal and code wells hold at `ink` (#0B0D10) — evidence keeps its own
surface, slightly apart from both canvas and cards.

### Semantic (web / print)

| Token | Hex | Meaning |
|---|---|---|
| `success` | `#22C55E` | verified, green path |
| `warn` | `#C98A1F` | attention, repair hints |
| `error` | `#C24E4E` | refusal, failure — never decoration |
| `info` | `#3B82F6` | neutral guidance — used sparingly |

### Terminal (the CLI face — unchanged in v3)

| Token | Hex | Meaning |
|---|---|---|
| `success` | `#3F9B6E` | verified, green path |
| `warn` | `#C98A1F` | attention |
| `error` | `#C24E4E` | refusal, failure |
| `info` | `#6B8FA3` | neutral guidance |
| `dim` | `#8A8A93` | de-emphasis |

Rules: gold is never used for body text; red appears **only** for failures;
blue is informational, never a brand signal; `NO_COLOR` / non-TTY strips
every color (the CLI's plain mode is the fallback for everyone). Contrast:
body text on ink is porcelain or mist (AA at all sizes); gold is used for
accents ≥ 14 px semibold or non-text elements.

---

## 3. Typography

| Use | Face | Notes |
|---|---|---|
| Display / UI | **Geist Sans** (web), Inter (fallback/print) | tight tracking on large sizes, sentence case |
| Terminal / code / hashes / labels | **Geist Mono**, JetBrains Mono, or `ui-monospace` | the engine's native voice |

Hierarchy: display `clamp(2.75rem, 6vw, 4.5rem)` tracking −0.03em · h1 2.5rem
· h2 1.875rem · h3 1.25rem · section labels 0.875rem uppercase +8% tracking
· body 1rem/1.6 · captions 0.75–0.875rem in `mist`. Hashes, ids, E-codes,
and code always mono. Never fake small-caps, never more than two families
per surface.

The **wordmark** letterforms are custom monoline caps drawn in the brand
renderer — not a font. Never re-typeset "VAERION" as a substitute for the
wordmark asset.

---

## 4. Spacing & geometry

| Token | Value | Notes |
|---|---|---|
| Grid | 4 px base; 8 px rhythm | all padding/spacing multiples of 4 |
| Spacing scale | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 | tokens in `brand/tokens.json` |
| Gutters | 20 mobile · 32 tablet · 48 desktop | content container max-width 1200 |
| Radius | plate `104/512 ≈ 20%` · cards 16 · inputs 10 · badges 999 | one radius family per surface class |
| Hairlines | 1 px, `line` on ink / `#E5E3DE` on porcelain | borders whisper, never shout |
| Shadows | ink surfaces: none (elevation via `ink-soft`/`steel-hi`) · light surfaces: `0 1 2 rgba(11,13,16,.06), 0 8 24 rgba(11,13,16,.08)` | elevation is rare |

Section rhythm on the web: 96–128 px between major sections, 24–32 px
inside cards, one idea per section.

---

## 5. Design tokens (machine-readable)

`brand/tokens.json` is generated by the renderer and carries color,
typography, spacing, radius, and mark metadata for programmatic
consumption (web theme, docs, third-party integrations). The web face
maps these onto CSS variables in `src/app/globals.css`
(`--vx-*` namespace) and Tailwind theme tokens (`ink`, `steel-*`,
`gold*`, `porcelain`, `mist`, `trust`, `signal`).

---

## 6. Motion

Calm by law: **150–550 ms**, ease-out, opacity + transform only.

- Page settle (route change): 320 ms ease-out, 6 px rise + fade — once,
  quiet, no stagger inside the page.
- Hero arrival (first paint only): 550 ms ease-out, 8 px rise + fade,
  staggered 70 ms per element, four steps maximum.
- Enter (components): 180 ms ease-out, 4 px rise + fade.
- Exit: 140 ms ease-in, fade.
- Progress: indeterminate shimmer ≤ 2% luminance amplitude; determinate
  bars never animate backwards.
- No bounce, no parallax, no neon glow, no attention-seeking loops, nothing
  that loops at all. Reduced-motion (`prefers-reduced-motion`) collapses
  everything to instant.

---

## 7. Icon language

Lucide (stroke 1.5–2, round caps) in the web app; a fixed set of Unicode
glyphs in the terminal (see `packages/vaerion/src/cli/ui.ts` — the glyphs
are chosen to degrade gracefully in non-Unicode terminals). Icons label
state, they never decorate: ✓ success · ✗ failure · ⚠ warning · →
guidance. One icon per row; never icons + badges + color for the same
signal.

---

## 8. Terminal (the primary surface)

The CLI is the product's front door. Law:

1. **Plain mode is a contract** — non-TTY output is stable text; machines
   and tests depend on it. Rich rendering activates only on a TTY
   (`VAE_UI=plain|rich|auto` overrides).
2. **One layout system** — every screen is composed from the same
   components (panel, table, badge, steps, receipt). No free-hand output.
3. **Unicode box drawing** with ASCII-safe degradation.
4. **Evidence over ornament** — color and glyphs mark verification state;
   nothing blinks, nothing spins unless work is actually running.

---

## 9. Web face (vaerion.dev)

- Dark-first: `void` canvas, porcelain text, gold accents — the site is
  designed for OLED screens; pure black emits nothing. A light (porcelain)
  theme is provided via the theme toggle — the mark switches to its black
  edition automatically through the token mirror.
- Layout law: sticky translucent nav, one `<h1>` per page, sections with
  labels, sticky footer pinned with `mt-auto` (never floats).
- The trust pipeline (agent → governance → decision → execution → receipt →
  verification) is drawn as a spine: five outlined stages in motion, the
  sixth — verification — as the solid gold node, echoing the mark.
- Code and terminal blocks always sit on `ink` with `line` hairlines, even
  in the light theme (they are evidence, and evidence keeps its surface).
- Screenshots of the CLI are rendered in the terminal palette — never
  re-painted in web colors.

---

## 10. Voice

Engineered, declarative, exact. Sentences short. Numbers measured. No
exclamation marks, no hype, no "blazing fast", no "revolutionary". A
receipt reads like a notary document; an error reads like a colleague:
what failed, why, the fix, the doc. Claims carry evidence or carry an
UNVERIFIED marker — the brand never says anything the engine cannot prove.

---

## 11. Usage quick-checks

- ✅ Gold accent on deep black for hero moments; white edition where data
  lives; black edition on print.
- ✅ Mono for anything the engine produces (hashes, ids, commands).
- ✅ Honest markers (`UNVERIFIED`, `rc`, `Founder-gated`) rendered as
  badges in `mist` — limitations are part of the brand.
- ❌ No neon, no robot mascot, no brain imagery, no gradient-on-text, no
  stock "AI" clichés, no stock photos.
- ❌ No third-party logos in the mark's clearspace; partner marks live in
  separate lockups approved per-use.


---

## ADDENDUM — Phase 16: OFFICIAL ASSET DELIVERY (2026-09-24)

The Founder-provided official logo package was delivered and integrated
(Phase 16, TASK 1). Provenance and file mapping of record:
`brand/official/MANIFEST.md`.

- The official mark is the **double-chevron V** (gold `#D4AF37` on the
  deep-black tile `#0B0D10`) — consistent with the v3 token palette,
  which required **no change** (verified identical).
- Every asset path listed in the tables above still resolves; the files
  at those paths now render the OFFICIAL pixels through raster-embedding
  SVG wrappers (`tools/official-brand-derive.py`).
- The generator (`tools/brand-render.ts`) is retired for this tree — do
  not regenerate `brand/` assets from it; the official raster set in
  `brand/official/` is the source of record.
- Known limitation (recorded, not hidden): the official delivery is
  raster-only. Vector redraws and light/transparent editions await a
  Founder-provided vector set; until then the tile format carries light
  surfaces via the silver variant.

## ADDENDUM — PHASE 16.1: OFFICIAL-ONLY ENFORCEMENT (2026-09-24)

The Founder's directive — the uploaded logo is the ONLY official Vaerion
identity — is enforced:

- `tools/brand-render.ts` (the "Ledger V" generator) is REMOVED from the
  tree. No generated mark can be regenerated.
- Deleted as dead/obsolete generated assets: `public/og-image.svg`,
  `brand/og-image.svg`, `public/brand/wordmark.svg`,
  `public/brand/wordmark-light.svg`.
- Replaced to render official pixels only: the VSCode command icon
  (`editors/vscode/media/vaerion.svg` — a container of the official
  pixels verbatim; the VSCode platform requires the .svg extension) and
  the site proof seal glyph (`SealGlyph` — the drawn inline V removed).
- Remaining, honestly UNREPLACED at that time: the terminal ASCII
  chevron. **Resolved in PHASE 16.2** — see the addendum below.
- Historical records (CHANGELOG, GA reports, worklog, status evidence)
  intentionally unchanged — they are the record of what happened, not
  live branding.

## ADDENDUM — PHASE 16.2: ABSOLUTE BRAND LAW (2026-09-24)

The Founder's absolute directive — the uploaded files are the ONE AND
ONLY visual identity; no drawn mark may exist anywhere — is enforced:

- DELETED: all 11 `brand/logo/*.svg` identity carriers (zero live
  consumers), `public/logo.svg`, `public/favicon.svg` (site now renders
  the official raster `/icon-192.png` directly), `brand/terminal.ascii.txt`
  and the CLI welcome chevron drawing (the terminal banner is typographic
  only — text, not a mark), `brand/BRAND-BOOK.pdf` (rendered the
  superseded generated identity), and the 8 pre-official observatory
  captures.
- The identity surfaces of record are now: `brand/official/*` (the
  Founder upload, byte-exact) → `brand/png/*` + `public/*.png` (direct
  format derivations) → every consumer renders the official raster.
- Sole remaining SVG container: `editors/vscode/media/vaerion.svg` —
  platform-required by VSCode command icons; contents are the official
  pixels verbatim (no redraw, no vectorization).
- `tools/official-brand-derive.py` derives PNG formats only; it can no
  longer produce SVG identity carriers.
