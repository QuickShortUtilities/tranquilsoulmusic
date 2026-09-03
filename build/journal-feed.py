"""Build the journal's RSS feed from the article pages themselves.

The articles are the source of truth — title, description and date all come out
of tags that are already in each file, so the feed cannot drift from the pages.

Re-run after publishing an article:
    python3 build/journal-feed.py
"""
import email.utils
import datetime
import html
import pathlib
import re
import xml.sax.saxutils as sax

ROOT = pathlib.Path(__file__).resolve().parents[1]
SITE = "https://www.tranquilsoulmusic.com"


def grab(src, pattern):
    m = re.search(pattern, src)
    return html.unescape(m.group(1)).strip() if m else ""


items = []
for path in sorted((ROOT / "journal").glob("*.html")):
    src = path.read_text(encoding="utf-8")
    date = grab(src, r'<time datetime="(\d{4}-\d{2}-\d{2})"')
    if not date:
        continue
    title = grab(src, r'<meta property="og:title" content="([^"]+)"').rsplit(" — ", 1)[0]
    # Published dates carry no time of day, so they are pinned to 09:00 UTC
    # rather than invented — the order is what a reader actually cares about.
    stamp = datetime.datetime.strptime(date, "%Y-%m-%d").replace(
        hour=9, tzinfo=datetime.timezone.utc)
    items.append({
        "title": title,
        "link": SITE + "/journal/" + path.name,
        "desc": grab(src, r'<meta property="og:description" content="([^"]+)"'),
        "date": stamp,
        "image": SITE + "/assets/og/journal-" + path.stem + ".jpg",
    })

items.sort(key=lambda i: i["date"], reverse=True)
newest = items[0]["date"] if items else datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc)

parts = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
         '  <channel>',
         '    <title>Tranquil Soul — Journal</title>',
         '    <link>%s/journal.html</link>' % SITE,
         '    <description>Notes on sleep, attention and recovery, from the people making the music.</description>',
         '    <language>en-GB</language>',
         '    <lastBuildDate>%s</lastBuildDate>' % email.utils.format_datetime(newest),
         '    <atom:link href="%s/journal/feed.xml" rel="self" type="application/rss+xml"/>' % SITE]

for i in items:
    parts += ['    <item>',
              '      <title>%s</title>' % sax.escape(i["title"]),
              '      <link>%s</link>' % i["link"],
              '      <guid isPermaLink="true">%s</guid>' % i["link"],
              '      <description>%s</description>' % sax.escape(i["desc"]),
              '      <pubDate>%s</pubDate>' % email.utils.format_datetime(i["date"]),
              '      <enclosure url="%s" type="image/jpeg" length="0"/>' % i["image"],
              '    </item>']

parts += ['  </channel>', '</rss>', '']
(ROOT / "journal" / "feed.xml").write_text("\n".join(parts), encoding="utf-8")
print("feed.xml written with %d items" % len(items))
