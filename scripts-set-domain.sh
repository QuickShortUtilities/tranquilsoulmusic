#!/usr/bin/env bash
# Rewrites every canonical URL, og:url and sitemap entry to a new domain.
#   ./scripts-set-domain.sh tranquilicy.com
set -euo pipefail
[ $# -eq 1 ] || { echo "usage: $0 <domain-without-scheme>"; exit 1; }
NEW="https://$1"
OLD="https://www.tranquilsoulmusic.com"
grep -rl "$OLD" --include='*.html' --include='*.xml' . | while read -r f; do
  sed -i '' "s|$OLD|$NEW|g" "$f"
  echo "  updated $f"
done
echo "Done. Commit, push, then add the domain in Cloudflare Pages → Custom domains."
