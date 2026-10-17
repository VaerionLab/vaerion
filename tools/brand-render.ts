/**
 * Vaerion brand renderer — the single source of geometric truth for the
 * brand system. Every logo asset (SVG + PNG) is DETERMINISTICALLY GENERATED
 * from the tokens and geometry below: run it twice, get identical bytes —
 * the same reproducibility law the engine applies to .vxn bundles.
 *
 *   bun run tools/brand-render.ts          # regenerate every brand artifact
 *
 * Outputs:
 *   brand/logo/*.svg      vector masters (seal, monogram, wordmark, lockups, editions)
 *   brand/logo/editions/*  gold / white / black / mono editions
 *   brand/png/*.png       raster editions (sharp, deterministic)
 *   brand/tokens.json     the design tokens, machine-readable
 *   brand/terminal.ascii.txt  the canonical terminal mark
 *   public/favicon.svg + public/icon-192.png + public/icon-512.png
 *   public/apple-touch-icon.png + public/favicon-32.png + public/logo.svg
 *   public/og-image.png (+ public/og-image.svg, brand/og-image.svg)
 *
 * THE MARK — the Ledger V (v3). One stroke, one deposit: the outer V is
 * the ACTION an agent takes — a stroke, motion, transient. The solid
 * diamond nested in its cradle is the EVIDENCE that action leaves behind —
 * a deposit, an artifact, permanent. Stroke = process. Solid = proof.
 * Action happens. Evidence remains. Trust is created.
 *
 * Tagline: VERIFIED. REPRODUCIBLE. TRUSTED.
 *
 * Design tokens live here and are mirrored (by hand, deliberately) in:
 *   packages/vaerion/src/cli/ui.ts        (terminal theme — RGB triplets)
 *   brand/BRAND-BOOK.md                   (the written system)
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dir, "..");

/* ─────────────────────────────  design tokens  ───────────────────────────── */

export const TOKENS = {
  void: "#000000", // OLED black — the canvas; true black, no light
  ink: "#0B0D10", // deep graphite — seal plate, terminal wells, OG surface
  inkSoft: "#1A1F26", // steel — raised surface (legacy ramp, CLI mirrors)
  steelHi: "#232A33", // raised-2 / hover surface
  porcelain: "#FAF9F6", // light surface / primary text on ink
  gold: "#D4AF37", // the Vaerion gold — the only brand accent
  goldBright: "#E3B341", // gold on dark terminals and small sizes
  goldSoft: "#F4DC8A", // gradient highlight stop
  goldDeep: "#8F6E1D", // gradient depth stop
  graphite: "#55555E", // secondary text on porcelain
  mist: "#9C9CA6", // muted text, captions
  line: "#232932", // hairlines on ink
  semantic: {
    success: "#22C55E", // verified states (web/print)
    warn: "#C98A1F", // attention
    error: "#C24E4E", // refusal, failure — never decoration
    info: "#3B82F6", // informational only, used sparingly
  },
  // Terminal face (CLI) — mirrored in packages/vaerion/src/cli/ui.ts; kept
  // TTY-tuned and byte-stable. Do not repurpose these outside the terminal.
  terminal: {
    success: "#3F9B6E",
    warn: "#C98A1F",
    error: "#C24E4E",
    info: "#6B8FA3",
    dim: "#8A8A93",
  },
} as const;

/* ─────────────────────────────  geometry (512 grid)  ─────────────────────── */
/* The Ledger V v3: an outer V-stroke (the action) and a solid diamond
 * (the evidence deposit) nested in its cradle. Miter joins, butt caps —
 * machined, not decorated. The plate is the same rounded square the seal
 * always used, so the mark descends from the original witness seal.
 *
 * The diamond is intentionally a DIFFERENT KIND of form than the stroke:
 * the action is a line — it happens and is gone; the evidence is a solid —
 * it remains. The contrast carries the product thesis in pure geometry. */

const PLATE = { size: 512, x: 40, y: 40, w: 432, h: 432, rx: 104 } as const;

interface Vee { x1: number; x2: number; top: number; apex: number; w: number }
interface Deposit { cx: number; cy: number; r: number }
type MarkGeo = { outer: Vee; deposit: Deposit };

const MARK: MarkGeo = {
  outer: { x1: 104, x2: 408, top: 116, apex: 404, w: 40 },
  deposit: { cx: 256, cy: 202, r: 52 },
} as const;

// Small-size edition (favicon, app icons): heavier stroke, larger deposit —
// the deposit must survive 16 px the way the full mark survives 512 px.
const MARK_COMPACT: MarkGeo = {
  outer: { x1: 112, x2: 400, top: 126, apex: 390, w: 48 },
  deposit: { cx: 256, cy: 194, r: 54 },
} as const;

/* Clearance law — fail-closed geometry. Every deposit vertex must keep a
 * minimum gap from the V-stroke and its cap line. If a future edit breaks
 * the nest, the generator refuses to emit assets (the same law the engine
 * applies to verification: unmeasurable means blocked).                  */
function segDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function assertClearances(name: string, geo: MarkGeo, minGap: number): void {
  const o = geo.outer;
  const d = geo.deposit;
  const mid = (o.x1 + o.x2) / 2;
  const half = o.w / 2;
  const verts: Array<[number, number]> = [
    [d.cx, d.cy - d.r],
    [d.cx + d.r, d.cy],
    [d.cx, d.cy + d.r],
    [d.cx - d.r, d.cy],
  ];
  let worst = Infinity;
  for (const [px, py] of verts) {
    for (const seg of [
      [o.x1, o.top, mid, o.apex],
      [mid, o.apex, o.x2, o.top],
    ] as const) {
      worst = Math.min(worst, segDistance(px, py, seg[0], seg[1], seg[2], seg[3]) - half);
    }
    // the cap line: the diamond must sit below the stroke's top ends
    worst = Math.min(worst, py - o.top);
  }
  if (!(worst >= minGap)) {
    throw new Error(`brand: ${name} clearance violated — worst gap ${worst.toFixed(1)} < ${minGap} (fail-closed, no assets emitted)`);
  }
  console.log(`brand: ${name} clearance ok — worst gap ${worst.toFixed(1)} ≥ ${minGap}`);
}

assertClearances("MARK", MARK, 18);
assertClearances("MARK_COMPACT", MARK_COMPACT, 14);

function veePath(v: Vee, cx?: number): string {
  const mid = cx ?? (v.x1 + v.x2) / 2;
  return `M${v.x1},${v.top} L${mid},${v.apex} L${v.x2},${v.top}`;
}

/** Gold gradient stops — light crown to deep root, like poured metal. */
const GOLD_GRADIENT = { id: "vx-gold", from: TOKENS.goldSoft, mid: TOKENS.gold, to: TOKENS.goldDeep };

function goldDefs(id: string = GOLD_GRADIENT.id): string {
  return `<defs>
  <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${GOLD_GRADIENT.from}"/>
    <stop offset="0.45" stop-color="${GOLD_GRADIENT.mid}"/>
    <stop offset="1" stop-color="${GOLD_GRADIENT.to}"/>
  </linearGradient>
</defs>`;
}

function markGroup(geo: MarkGeo, stroke: string): string {
  const d = geo.deposit;
  const deposit = `M${d.cx},${d.cy - d.r} L${d.cx + d.r},${d.cy} L${d.cx},${d.cy + d.r} L${d.cx - d.r},${d.cy} Z`;
  return `  <path d="${veePath(geo.outer)}" fill="none" stroke="${stroke}" stroke-width="${geo.outer.w}" stroke-linecap="butt" stroke-linejoin="miter"/>
  <path d="${deposit}" fill="${stroke}"/>`;
}

/* ─────────────────────────────  the seal (plate + mark)  ─────────────────── */

function sealSvg(opts: {
  container: "fill" | "outline";
  mark: string;
  containerFill: string;
  bg?: string;
  geo?: VeeSet;
  gradient?: boolean;
  gradientId?: string;
}): string {
  const geo = opts.geo ?? MARK;
  const plate =
    opts.container === "fill"
      ? `<rect x="${PLATE.x}" y="${PLATE.y}" width="${PLATE.w}" height="${PLATE.h}" rx="${PLATE.rx}" fill="${opts.containerFill}"/>
  <rect x="${PLATE.x + 1}" y="${PLATE.y + 1}" width="${PLATE.w - 2}" height="${PLATE.h - 2}" rx="${PLATE.rx - 1}" fill="none" stroke="${TOKENS.line}" stroke-width="2"/>`
      : `<rect x="${PLATE.x + 12}" y="${PLATE.y + 12}" width="${PLATE.w - 24}" height="${PLATE.h - 24}" rx="${PLATE.rx - 12}" fill="none" stroke="${opts.containerFill}" stroke-width="24"/>`;
  const defs = opts.gradient ? `${goldDefs(opts.gradientId)}\n  ` : "";
  const stroke = opts.gradient ? `url(#${opts.gradientId ?? GOLD_GRADIENT.id})` : opts.mark;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PLATE.size} ${PLATE.size}" role="img" aria-label="Vaerion seal">
  ${defs}${opts.bg ? `<rect width="${PLATE.size}" height="${PLATE.size}" fill="${opts.bg}"/>\n  ` : ""}${plate}
${markGroup(geo, stroke)}
</svg>
`;
}

/* ─────────────────────────────  monogram (bare mark)  ────────────────────── */

function monogramSvg(color: string, geo: MarkGeo = MARK): string {
  const vx = geo.outer.x1 - geo.outer.w;
  const vy = geo.outer.top - geo.outer.w;
  const vw = geo.outer.x2 - geo.outer.x1 + 2 * geo.outer.w;
  const vh = geo.outer.apex - geo.outer.top + 2 * geo.outer.w;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" role="img" aria-label="Vaerion monogram">
${markGroup(geo, color)}
</svg>
`;
}

/* ─────────────────────────────  wordmark (custom monoline caps)  ─────────── */
/* VAERION drawn as geometric monoline capitals — no font dependency, no
 * reflow: every renderer draws the same letterforms. Stroke rhythm matches
 * the mark (one width everywhere).                                        */

interface LetterDef { w: number; d: string[]; ellipses?: Array<{ cx: number; cy: number; rx: number; ry: number }> }

const STROKE = 22;
const CAP_TOP = 20;
const BASE = 180;
const MID = 100;

const LETTERS: Record<string, LetterDef> = {
  V: { w: 150, d: [`M0,${CAP_TOP} L75,${BASE} L150,${CAP_TOP}`] },
  A: { w: 150, d: [`M0,${BASE} L75,${CAP_TOP} L150,${BASE}`, `M29,118 L121,118`] },
  E: { w: 120, d: [`M120,${CAP_TOP} L0,${CAP_TOP}`, `M0,${CAP_TOP} L0,${BASE}`, `M0,${BASE} L120,${BASE}`, `M0,${MID} L96,${MID}`] },
  R: {
    w: 140,
    d: [
      `M0,${CAP_TOP} L0,${BASE}`,
      `M0,${CAP_TOP} L70,${CAP_TOP}`,
      `M0,${MID} L70,${MID}`,
      `M70,${CAP_TOP} A40,40 0 0 1 70,${MID}`,
      `M74,${MID} L134,${BASE}`,
    ],
  },
  I: { w: 22, d: [`M0,${CAP_TOP} L0,${BASE}`] },
  O: { w: 170, d: [], ellipses: [{ cx: 85, cy: (CAP_TOP + BASE) / 2, rx: 74, ry: 80 }] },
  N: { w: 150, d: [`M0,${BASE} L0,${CAP_TOP}`, `M0,${CAP_TOP} L150,${BASE}`, `M150,${BASE} L150,${CAP_TOP}`] },
};

const WORD = "VAERION";
const TRACK = 62; // letter spacing

function wordmarkSvg(mark: string): { svg: string; width: number; pad: number } {
  let x = 0;
  const parts: string[] = [];
  for (const ch of WORD) {
    const L = LETTERS[ch]!;
    for (const d of L.d) parts.push(`  <path d="${d}" transform="translate(${x},0)"/>`);
    for (const e of L.ellipses ?? []) parts.push(`  <ellipse cx="${x + e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}"/>`);
    x += L.w + TRACK;
  }
  const width = x - TRACK;
  const pad = STROKE; // one full stroke width of clearspace around the ink
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} 0 ${width + 2 * pad} 200" role="img" aria-label="Vaerion">
<g fill="none" stroke="${mark}" stroke-width="${STROKE}" stroke-linecap="butt" stroke-linejoin="miter">
${parts.join("\n")}
</g>
</svg>
`;
  return { svg, width, pad };
}

function wordmarkInner(): string {
  const parts: string[] = [];
  let x = 0;
  for (const ch of WORD) {
    const L = LETTERS[ch]!;
    for (const d of L.d) parts.push(`<path d="${d}" transform="translate(${x},0)"/>`);
    for (const e of L.ellipses ?? []) parts.push(`<ellipse cx="${x + e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}"/>`);
    x += L.w + TRACK;
  }
  return parts.join("\n      ");
}

/* ─────────────────────────────  lockup (seal + wordmark)  ────────────────── */

function lockupSvg(sealFill: string, mark: string, bg?: string): string {
  const { width, pad } = wordmarkSvg(mark);
  const gap = 56;
  const capBand = 150; // cap band [20,180] rendered 150 high
  const s = capBand / 160;
  const ty = 25 - 20 * s;
  const sealScale = 200 / PLATE.size; // the plate grid rendered 200 px tall
  const sealRight = (PLATE.x + PLATE.w) * sealScale;
  const textX = sealRight + gap + pad * s;
  const total = textX + width * s + pad * s;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} 200" role="img" aria-label="Vaerion">
  ${bg ? `<rect width="${total}" height="200" fill="${bg}"/>\n  ` : ""}<g transform="scale(${sealScale})">
    <rect x="${PLATE.x}" y="${PLATE.y}" width="${PLATE.w}" height="${PLATE.h}" rx="${PLATE.rx}" fill="${sealFill}"/>
${markGroup(MARK, mark)}
  </g>
  <g transform="translate(${textX},${ty}) scale(${s})">
    <g fill="none" stroke="${mark}" stroke-width="${STROKE}" stroke-linecap="butt" stroke-linejoin="miter">
      ${wordmarkInner()}
    </g>
  </g>
</svg>
`;
  return svg;
}

/* ─────────────────────────────  terminal mark  ───────────────────────────── */

const TERMINAL_ASCII = `────────────
 ╲        ╱
  ╲      ╱
   ╲    ╱
    ╲  ╱
     ╲╱
────────────
`;

/* ─────────────────────────────  OG / social image  ───────────────────────── */

function ogSvg(): string {
  const t = TOKENS;
  const wm = wordmarkSvg(t.porcelain);
  const wmWidth = 560;
  const s = wmWidth / wm.width;
  const capBandH = 160 * s;
  const sealX = 96;
  const sealY = 84;
  const sealPx = 168;
  const wmX = sealX + sealPx + 76;
  const wmTop = 148; // cap-band top
  const ty = wmTop - 20 * s;
  const tagY = wmTop + capBandH + 64;
  // faint blueprint grid
  let grid = "";
  for (let x = 60; x < 1200; x += 60) grid += `  <line x1="${x}" y1="0" x2="${x}" y2="630" stroke="#12161C" stroke-width="1"/>\n`;
  for (let y = 60; y < 630; y += 60) grid += `  <line x1="0" y1="${y}" x2="1200" y2="${y}" stroke="#12161C" stroke-width="1"/>\n`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
${goldDefs()}
  <rect width="1200" height="630" fill="${t.void}"/>
${grid}
  <g transform="translate(${sealX},${sealY}) scale(${sealPx / 512})">
    <rect x="${PLATE.x}" y="${PLATE.y}" width="${PLATE.w}" height="${PLATE.h}" rx="${PLATE.rx}" fill="${t.ink}"/>
    <rect x="${PLATE.x + 1}" y="${PLATE.y + 1}" width="${PLATE.w - 2}" height="${PLATE.h - 2}" rx="${PLATE.rx - 1}" fill="none" stroke="${t.line}" stroke-width="2"/>
${markGroup(MARK, `url(#${GOLD_GRADIENT.id})`)}
  </g>
  <g transform="translate(${wmX},${ty}) scale(${s})">
    <g fill="none" stroke="${t.porcelain}" stroke-width="${STROKE}" stroke-linecap="butt" stroke-linejoin="miter">
      ${wordmarkInner()}
    </g>
  </g>
  <text x="${wmX + 2}" y="${tagY}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="24" letter-spacing="6" font-weight="600" fill="${t.gold}">VERIFIED · REPRODUCIBLE · TRUSTED</text>
  <text x="${sealX + 2}" y="${tagY + 92}" font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="37" font-weight="600" fill="${t.porcelain}">Trust infrastructure for autonomous AI systems.</text>
  <text x="${sealX + 2}" y="${tagY + 152}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="26" fill="${t.mist}">Identity → Governance → Evidence → Verification</text>
  <rect x="0" y="616" width="1200" height="14" fill="${t.gold}"/>
</svg>
`;
}

/* ─────────────────────────────  design tokens (machine-readable)  ────────── */

function tokensJson(): string {
  const t = TOKENS;
  return `${JSON.stringify(
    {
      $schema: "https://design-tokens.org/schema-v1",
      name: "Vaerion Design Tokens",
      version: "3.0.0",
      generatedBy: "tools/brand-render.ts — do not hand-edit; regenerate",
      color: {
        void: t.void,
        ink: t.ink,
        inkSoft: t.inkSoft,
        steelHi: t.steelHi,
        porcelain: t.porcelain,
        gold: t.gold,
        goldBright: t.goldBright,
        goldSoft: t.goldSoft,
        goldDeep: t.goldDeep,
        graphite: t.graphite,
        mist: t.mist,
        line: t.line,
        semantic: { ...t.semantic },
        terminal: { ...t.terminal },
      },
      typography: {
        sans: "Geist Sans — display, UI, headings",
        mono: "Geist Mono — code, terminal, labels, data",
        scale: { display: "clamp(2.75rem, 6vw, 4.5rem)", h1: "2.5rem", h2: "1.875rem", h3: "1.25rem", body: "1rem", small: "0.875rem", caption: "0.75rem" },
        tracking: { display: "-0.03em", heading: "-0.02em", label: "0.08em" },
      },
      spacing: { base: "4px", scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128], gutter: { mobile: 20, tablet: 32, desktop: 48 }, container: 1200 },
      radius: { sm: 6, md: 10, lg: 16, plate: 104, pill: 999 },
      mark: { name: "The Ledger V", version: 3, geometry: "outer V-stroke (the action) + solid evidence diamond deposited in its cradle; miter joins, butt caps", tagline: "VERIFIED. REPRODUCIBLE. TRUSTED.", editions: ["gold", "white", "black", "mono"], clearspace: "1 × outer stroke width on all sides", minimumSize: { seal: 16, mark: 24 }, clearanceLaw: "fail-closed — the generator refuses to emit assets if any deposit vertex approaches the stroke below the minimum gap" },
    },
    null,
    2,
  )}\n`;
}

/* ─────────────────────────────  emit everything  ─────────────────────────── */

const t = TOKENS;

/* ─────────────────────  social avatar (edge-to-edge)  ───────────────── */
/* Avatars crop tight: the plate fills the entire frame — no outer margin —
 * so the mark reads at 32 px inside a circle mask.                     */

function avatarSvg(bg: string, mark: string, gradient: boolean): string {
  const stroke = gradient ? `url(#${GOLD_GRADIENT.id})` : mark;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Vaerion avatar">
  ${gradient ? `${goldDefs("vx-gold-av")}\n  ` : ""}<rect width="512" height="512" rx="115" fill="${bg}"/>
  <rect x="1.5" y="1.5" width="509" height="509" rx="113.5" fill="none" stroke="${gradient ? TOKENS.line : "rgba(128,128,128,0.25)"}" stroke-width="3"/>
${markGroup(MARK, stroke)}
</svg>
`;
}

const artifacts: Array<{ path: string; svg: string; png?: Array<{ width: number; name: string }> }> = [
  // Primary seal — the gold Ledger V on the deep-black plate (signature edition)
  { path: "brand/logo/vaerion-icon.svg", svg: sealSvg({ container: "fill", mark: t.gold, containerFill: t.ink, gradient: true }), png: [{ width: 1024, name: "seal-gold-1024.png" }] },
  // White edition — porcelain mark on ink (where gold would compete with data)
  { path: "brand/logo/editions/white.svg", svg: sealSvg({ container: "fill", mark: t.porcelain, containerFill: t.ink }) },
  // Black edition — ink mark on porcelain (light surfaces, print)
  { path: "brand/logo/editions/black.svg", svg: sealSvg({ container: "fill", mark: t.ink, containerFill: t.porcelain }), png: [{ width: 1024, name: "seal-black-1024.png" }] },
  // Bright-gold edition — flat goldBright (small sizes, TTY-adjacent contexts)
  { path: "brand/logo/editions/gold.svg", svg: sealSvg({ container: "fill", mark: t.goldBright, containerFill: t.ink }), png: [{ width: 1024, name: "seal-white-1024.png" }] },
  // Monochrome edition — single-color, follows context (currentColor)
  {
    path: "brand/logo/editions/mono.svg",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Vaerion seal (monochrome)">
  <rect x="${PLATE.x + 12}" y="${PLATE.y + 12}" width="${PLATE.w - 24}" height="${PLATE.h - 24}" rx="${PLATE.rx - 12}" fill="none" stroke="currentColor" stroke-width="24"/>
${markGroup(MARK, "currentColor")}
</svg>
`,
  },
  // Monogram (bare mark, no plate)
  { path: "brand/logo/vaerion-monogram.svg", svg: monogramSvg(t.gold) },
  // Wordmark (ink for light surfaces)
  { path: "brand/logo/vaerion-wordmark.svg", svg: wordmarkSvg(t.ink).svg, png: [{ width: 2000, name: "wordmark-ink-2000.png" }] },
  { path: "brand/logo/vaerion-wordmark-light.svg", svg: wordmarkSvg(t.porcelain).svg },
  // Primary lockups
  { path: "brand/logo/vaerion-logo.svg", svg: lockupSvg(t.ink, t.goldBright), png: [{ width: 2400, name: "logo-gold-2400.png" }] },
  { path: "brand/logo/vaerion-logo-light.svg", svg: lockupSvg(t.porcelain, t.ink) },
  // Social avatar — edge-to-edge plate (GitHub / Discord / social profiles)
  { path: "brand/logo/vaerion-avatar.svg", svg: avatarSvg(t.ink, "", true), png: [{ width: 1024, name: "avatar-1024.png" }] },
  // OG / social preview
  { path: "public/og-image.svg", svg: ogSvg() },
  { path: "brand/og-image.svg", svg: ogSvg(), png: [{ width: 1200, name: "og-image.png" }] },
  // Generic public logo path (the gold seal)
  { path: "public/logo.svg", svg: sealSvg({ container: "fill", mark: t.gold, containerFill: t.ink, gradient: true }) },
  // Web nav wordmarks (the real letterforms — never re-typeset VAERION)
  { path: "public/brand/wordmark.svg", svg: wordmarkSvg(t.ink).svg },
  { path: "public/brand/wordmark-light.svg", svg: wordmarkSvg(t.porcelain).svg },
];

async function emitOgPng(): Promise<void> {
  const buf = await sharp(Buffer.from(ogSvg()), { density: 72 * 3 }).resize({ width: 1200 }).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(join(ROOT, "public", "og-image.png"), buf);
}

function wordmarkWidth(): number {
  let x = 0;
  for (const ch of WORD) x += LETTERS[ch]!.w + TRACK;
  return x - TRACK;
}

async function main(): Promise<void> {
  mkdirSync(join(ROOT, "brand", "logo", "editions"), { recursive: true });
  mkdirSync(join(ROOT, "brand", "png"), { recursive: true });
  mkdirSync(join(ROOT, "public"), { recursive: true });

  writeFileSync(join(ROOT, "brand", "terminal.ascii.txt"), TERMINAL_ASCII, "utf8");
  writeFileSync(join(ROOT, "brand", "tokens.json"), tokensJson(), "utf8");

  // favicon: the compact seal — the nest survives 16 px
  writeFileSync(join(ROOT, "public", "favicon.svg"), sealSvg({ container: "fill", mark: t.goldBright, containerFill: t.ink, geo: MARK_COMPACT, gradient: true, gradientId: "vx-gold-fav" }), "utf8");

  for (const a of artifacts) {
    const abs = join(ROOT, a.path);
    mkdirSync(join(abs, ".."), { recursive: true });
    writeFileSync(abs, a.svg, "utf8");
    for (const p of a.png ?? []) {
      const outPath = join(ROOT, "brand", "png", p.name);
      const width = p.width;
      const density = Math.ceil(72 * (width / 512));
      const buf = await sharp(Buffer.from(a.svg), { density }).resize({ width }).png({ compressionLevel: 9 }).toBuffer();
      writeFileSync(outPath, buf);
    }
  }

  // web icons from the compact seal
  for (const [px, name] of [
    [512, "icon-512.png"],
    [192, "icon-192.png"],
    [180, "apple-touch-icon.png"],
    [32, "favicon-32.png"],
    [16, "favicon-16.png"],
  ] as const) {
    const buf = await sharp(
      Buffer.from(sealSvg({ container: "fill", mark: t.goldBright, containerFill: t.ink, geo: MARK_COMPACT, gradient: true, gradientId: "vx-gold-fav" })),
      { density: Math.ceil(72 * (px / 512)) },
    )
      .resize({ width: px, height: px })
      .png({ compressionLevel: 9 })
      .toBuffer();
    writeFileSync(join(ROOT, "public", name), buf);
  }

  console.log(`brand: ${artifacts.length} svg masters + web icons + tokens.json + terminal mark generated (wordmark width ${wordmarkWidth()})`);
}

await main();
await emitOgPng();
