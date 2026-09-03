"""Render one Open Graph card per page, in the site's own design language.

There is no product photography and no per-page art, so the alternative was 27
links all previewing the same generic image. These are typeset from each page's
own title and description against the same ground, bloom and ring figure the
site uses, so a shared link looks like a piece of the site.

Re-run after adding a page or changing a title:
    python3 build/og-cards.py
"""
import html
import json
import pathlib
import re
import subprocess
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
CARD = pathlib.Path(__file__).resolve().parent / "og-card.html"
OUT = ROOT / "assets" / "og"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

SKIP = {"tools/revenue-model.html"}

EYEBROW = {
    "index.html": "Ambient · Meditation · Sleep",
    "radio.html": "Always on · 24/7",
    "app.html": "The app",
    "journal.html": "Journal",
    "creators.html": "For creators",
    "licensing.html": "Sync licensing",
    "discography.html": "The catalogue",
    "shop.html": "Shop",
    "privacy.html": "Legal",
    "terms.html": "Legal",
}


def grab(src, pattern):
    m = re.search(pattern, src)
    return html.unescape(m.group(1)).strip() if m else ""


def strip_suffix(title):
    for sep in (" — ", " – ", " | "):
        if sep in title:
            return title.rsplit(sep, 1)[0].strip()
    return title


def slug_for(rel):
    if rel == "index.html":
        return "home"
    return rel[:-5].replace("/", "-")


def eyebrow_for(rel, src):
    if rel in EYEBROW:
        return EYEBROW[rel]
    if rel.startswith("journal/"):
        date = grab(src, r'<time datetime="[^"]*">([^<]+)</time>')
        return ("Journal · " + date) if date else "Journal"
    if rel.startswith("shop/"):
        category = grab(src, r'"category":"([^"]+)"')
        return ("Shop · " + category) if category else "Shop"
    return "Tranquil Soul"


OUT.mkdir(parents=True, exist_ok=True)
made = []

for path in sorted(ROOT.rglob("*.html")):
    rel = path.relative_to(ROOT).as_posix()
    if rel in SKIP or rel.startswith("assets/"):
        continue
    src = path.read_text(encoding="utf-8")

    title = strip_suffix(grab(src, r'<meta property="og:title" content="([^"]+)"'))
    desc = grab(src, r'<meta property="og:description" content="([^"]+)"')
    if not title:
        print("  skip (no og:title):", rel)
        continue

    slug = slug_for(rel)
    query = urllib.parse.urlencode({"t": title, "e": eyebrow_for(rel, src), "d": desc})
    png = OUT / (slug + ".png")
    jpg = OUT / (slug + ".jpg")

    subprocess.run([
        CHROME, "--headless", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
        "--window-size=1200,630", "--force-device-scale-factor=1",
        "--virtual-time-budget=6000", "--screenshot=" + str(png),
        CARD.as_uri() + "?" + query,
    ], check=True, capture_output=True)

    # JPEG keeps a 1200x630 card around 70KB; the PNG is five times that and
    # every crawler that fetches it pays for the difference.
    subprocess.run([
        "sips", "-s", "format", "jpeg", "-s", "formatOptions", "82",
        str(png), "--out", str(jpg),
    ], check=True, capture_output=True)
    png.unlink()

    made.append((rel, slug, jpg.stat().st_size))
    print("  %-46s -> assets/og/%s.jpg  (%dKB)" % (rel, slug, jpg.stat().st_size // 1024))

print("\n%d cards written to %s" % (len(made), OUT))
