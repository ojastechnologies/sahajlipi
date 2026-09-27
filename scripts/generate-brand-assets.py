#!/usr/bin/env python3
"""Generate SahajLipi SVG masters from pinned, independently downloaded fonts.

Optional design tooling only: Python 3.9+ and fonttools==4.60.1.
No font files or font runtime dependencies are shipped with SahajLipi.
See assets/brand/README.md for the source hashes and rendering instructions.
"""
import argparse
import hashlib
import html
import json
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "brand"
manifest = json.loads((ASSETS / "manifest.json").read_text(encoding="utf-8"))
COLORS = manifest["palette"]


def number(value):
    return f"{value:.3f}".rstrip("0").rstrip(".") or "0"


def load_font(path, record):
    if hashlib.sha256(path.read_bytes()).hexdigest() != record["sourceSha256"]:
        raise ValueError(f"Font source hash differs: {record['family']}")
    font = TTFont(path)
    axes = {axis.axisTag: 700 if axis.axisTag == "wght" else axis.defaultValue
            for axis in font["fvar"].axes}
    return instantiateVariableFont(font, axes, inplace=True)


def outline(font, text, x, baseline, size, fill, tracking=0):
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font["head"].unitsPerEm
    parts = []
    for character in text:
        if character == " ":
            x += glyphs[cmap[ord(character)]].width * scale + tracking
            continue
        glyph = glyphs[cmap[ord(character)]]
        pen = SVGPathPen(glyphs, ntos=number)
        glyph.draw(TransformPen(pen, (scale, 0, 0, -scale, x, baseline)))
        parts.append(f'<path fill="{fill}" d="{pen.getCommands()}"/>')
        x += glyph.width * scale + tracking
    return "".join(parts)


def mark(x=0, y=0, size=100, mono=False):
    glyph_color = COLORS["ink"] if mono else COLORS["paper"]
    tile = (f'<rect x="1" y="1" width="98" height="98" rx="22" fill="none" '
            f'stroke="{COLORS["ink"]}" stroke-width="2"/>' if mono else
            f'<rect width="100" height="100" rx="23" fill="{COLORS["teal"]}"/>')
    body = tile + outline(deva, "स", 13, 76, 84, glyph_color)
    body += f'<rect x="81" y="47" width="4" height="30" rx="1" fill="{COLORS["ink"] if mono else COLORS["gold"]}"/>'
    return f'<g transform="translate({x} {y}) scale({size / 100})">{body}</g>'


def svg(width, height, body, title, description):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
            f'viewBox="0 0 {width} {height}" role="img" aria-labelledby="title description">'
            f'<title id="title">{html.escape(title)}</title>'
            f'<desc id="description">{html.escape(description)}</desc>{body}</svg>\n')


def save(name, width, height, body, title, description):
    (ASSETS / name).write_text(svg(width, height, body, title, description), encoding="utf-8")
    return {"file": name, "width": width, "height": height, "format": "SVG", "role": title}


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--font-dir", type=Path, required=True,
                    help="Folder containing pinned noto-deva.ttf and manrope.ttf")
args = parser.parse_args()
deva = load_font(args.font_dir / "noto-deva.ttf", manifest["fonts"][0])
latin = load_font(args.font_dir / "manrope.ttf", manifest["fonts"][1])
assets = []
assets.append(save("mark.svg", 100, 100, mark(), "SahajLipi mark",
                   "Devanagari letter sa, स, with a typing caret in a teal rounded square."))
assets.append(save("favicon.svg", 100, 100, mark(), "SahajLipi", "SahajLipi browser icon."))
for filename, color, mono in [("logo.svg", COLORS["ink"], False),
                             ("logo-dark.svg", COLORS["paper"], False),
                             ("logo-mono.svg", COLORS["ink"], True)]:
    body = mark(6, 6, 100, mono) + outline(latin, "SahajLipi", 132, 75, 76, color, -.8)
    assets.append(save(filename, 520, 112, body, "SahajLipi",
                       "SahajLipi wordmark with the Devanagari sa mark."))
assets.append(save("wordmark.svg", 380, 112,
                   outline(latin, "SahajLipi", 9, 78, 79, COLORS["ink"], -.8),
                   "SahajLipi", "SahajLipi wordmark, with text converted to vector outlines."))

# Repository and website share image. All important content is inside 40px margins.
body = f'<rect width="1280" height="640" fill="{COLORS["deepTeal"]}"/>'
body += f'<rect x="40" y="40" width="1200" height="560" rx="28" fill="none" stroke="{COLORS["teal"]}" stroke-width="2"/>'
body += mark(86, 86, 98) + outline(latin, "SahajLipi", 210, 158, 77, COLORS["paper"], -.8)
body += outline(latin, "Roman keys.", 84, 315, 92, COLORS["paper"], -1)
body += outline(latin, "Native script.", 84, 423, 92, COLORS["paper"], -1)
body += outline(latin, "Open-source Nepali typing for the web.", 88, 500, 28, COLORS["lightTeal"])
body += outline(latin, "ojastechnologies / sahajlipi", 88, 556, 20, COLORS["lightTeal"])
body += f'<rect x="1174" y="252" width="8" height="112" rx="2" fill="{COLORS["gold"]}"/>'
assets.append(save("social-preview.svg", 1280, 640, body, "SahajLipi social preview",
                   "SahajLipi. Roman keys. Native script. Open-source Nepali typing for the web."))

# Asset contact sheet for reviewing the same identity in several contexts.
body = f'<rect width="1600" height="1020" fill="{COLORS["paper"]}"/>'
body += outline(latin, "SahajLipi", 64, 96, 48, COLORS["ink"], -.4)
body += outline(latin, "Project identity / September 2026", 1010, 88, 20, COLORS["teal"])
body += f'<line x1="64" x2="1536" y1="125" y2="125" stroke="#D2DFE6"/>'
body += mark(64, 182, 138) + outline(latin, "SahajLipi", 238, 277, 103, COLORS["ink"], -1)
body += outline(latin, "Roman keys. Native script.", 242, 337, 31, COLORS["teal"])
body += f'<rect x="900" y="170" width="636" height="260" rx="20" fill="{COLORS["ink"]}"/>'
body += mark(946, 252, 94) + outline(latin, "SahajLipi", 1066, 318, 79, COLORS["paper"], -.8)
body += outline(latin, "A mark for Devanagari.", 64, 492, 28, COLORS["ink"])
for x, size in [(64, 96), (202, 64), (308, 44), (394, 24)]:
    body += mark(x, 535 + 96 - size, size)
    body += outline(latin, str(size) + "px", x, 675, 18, COLORS["teal"])
body += outline(deva, "स", 550, 590, 45, COLORS["ink"])
body += outline(latin, "+ a typing caret", 600, 590, 31, COLORS["ink"])
body += outline(latin, "Nepali today. More Devanagari languages ahead.", 550, 634, 24, COLORS["teal"])
body += outline(latin, "PALETTE", 64, 753, 18, COLORS["teal"])
for index, (label, key) in enumerate([("Teal", "teal"), ("Deep teal", "deepTeal"),
                                    ("Ink", "ink"), ("Paper", "paper"), ("Gold", "gold")]):
    x = 64 + index * 300
    body += f'<rect x="{x}" y="785" width="272" height="100" rx="12" fill="{COLORS[key]}" stroke="#D2DFE6"/>'
    body += outline(latin, label, x, 924, 23, COLORS["ink"])
    body += outline(latin, COLORS[key], x, 958, 18, COLORS["teal"])
assets.append(save("brand-sheet.svg", 1600, 1020, body, "SahajLipi brand identity",
                   "Primary and dark wordmarks, Devanagari mark at four sizes, and the project palette."))
manifest["assets"] = assets
manifest["generation"]["rasterGenerator"] = "scripts/render-brand-assets.mjs"
manifest["generation"]["sharpVersion"] = "0.35.4"
(ASSETS / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Generated {len(assets)} SVG masters; no fonts are required to display them.")
