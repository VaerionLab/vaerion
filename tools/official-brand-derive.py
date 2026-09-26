#!/usr/bin/env python3
"""official-brand-derive.py — PNG-only official derivation pipeline.

PHASE 16.4: the official set of record was REPLACED by the Founder
(six new uploads received via CDN recovery; see brand/official/MANIFEST.md —
the ONE source of truth). This tool ADAPTS FORMATS ONLY — it crops and
resizes OFFICIAL pixels. It never draws, restyles, vectorizes, or invents
artwork. No SVG capacity exists in this tool or in the tree.

Sources (brand/official/):
  - official-app-icon-gold.png     (Founder-labeled "APP ICON" card —
                                    primary icon source: the gold V on ink;
                                    the card's caption band is excluded)
  - official-lockup-horizontal.png (Founder horizontal lockup banner —
                                    OG source: mark + wordmark + tagline,
                                    cover-cropped to 1200x630)

Outputs (integration points — file replacement, code untouched):
  public/icon-512.png public/icon-192.png public/apple-touch-icon.png
  public/favicon-32.png public/favicon-16.png public/og-image.png
  editors/vscode/media/vaerion.png (official mark, 32x32)

Law continuity: favicon-32.png and the VS Code icon are derived from the
same source crop at the same size — byte-identical outputs (the PHASE 16.3
provenance equivalence vaerion.png == favicon-32.png is preserved).
"""
from PIL import Image
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFF = os.path.join(ROOT, "brand", "official")
PUB = os.path.join(ROOT, "public")
VSC = os.path.join(ROOT, "editors", "vscode", "media")

# Official mark crop: the V region of the Founder "APP ICON" card
# (card is 322x282; the caption band below y=222 is excluded).
# Box measured against the official upload (PHASE 16.4 calibration;
# visually verified: mark centered, no clipping).
ICON_CROP = (56, 14, 264, 222)   # 208x208 gold V on official ink

def load(name):
    return Image.open(os.path.join(OFF, name)).convert("RGB")

def save(im, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, "PNG")
    print("wrote", os.path.relpath(path, ROOT), im.size)

def main():
    card = load("official-app-icon-gold.png")
    mark = card.crop(ICON_CROP)  # 208x208 official mark on official ink

    # — public platform-metadata integration points (official mark) —
    for size, name in [(512, "icon-512.png"), (192, "icon-192.png"),
                       (180, "apple-touch-icon.png"), (32, "favicon-32.png"),
                       (16, "favicon-16.png")]:
        save(mark.resize((size, size), Image.LANCZOS), os.path.join(PUB, name))

    # — VS Code view-container icon (official mark, 32x32, PNG-only law) —
    save(mark.resize((32, 32), Image.LANCZOS), os.path.join(VSC, "vaerion.png"))

    # — OG image 1200x630: cover-crop of the official horizontal lockup
    #   banner — 100% official pixels (mark, wordmark, tagline); nothing
    #   is composed, rendered, or drawn. —
    banner = load("official-lockup-horizontal.png")
    target = (1200, 630)
    scale = max(target[0] / banner.width, target[1] / banner.height)
    w, h = round(banner.width * scale), round(banner.height * scale)
    scaled = banner.resize((w, h), Image.LANCZOS)
    x0, y0 = (w - target[0]) // 2, (h - target[1]) // 2
    save(scaled.crop((x0, y0, x0 + target[0], y0 + target[1])),
         os.path.join(PUB, "og-image.png"))

    print("official brand derivation complete "
          "(PNG-only, PHASE 16.4 official set of record)")
    return 0

if __name__ == "__main__":
    sys.exit(main())
