# Tranquil Soul Music — website

Static site. No build step: what is in this directory is what ships.

## Deploy (Cloudflare Pages)

1. Push this repo to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: `/`
4. Add the custom domain under Pages → Custom domains.

Every push to `main` deploys. Preview deploys are created per branch.

## Structure

| Path | Purpose |
|---|---|
| `index.html` | Home — listen first, then capture |
| `creators.html` | Creator licensing — primary revenue line |
| `app.html` | Tranquilicy, the flagship product |
| `radio.html` | 24/7 streams |
| `licensing.html` | Sync / B2B licensing |
| `journal/` | SEO content |
| `shop.html` | Home goods and merch |
| `tools/revenue-model.html` | Internal, noindex |
| `assets/` | Shared CSS and JS, immutably cached |

## Editing

Plain HTML. The nav and footer are duplicated per page on purpose — there is no
templating layer to learn, and a static site this size does not need one. If a
nav link changes, `grep -l 'href="/radio.html"' *.html` finds every file.

## Changing the domain

```
./scripts-set-domain.sh tranquilicy.com
```

Rewrites every canonical, `og:url` and sitemap entry in one pass. Then add the
domain under Cloudflare Pages → Custom domains and point the nameservers.

**Recommendation:** buy `tranquilicy.com` and make it the primary. Tranquilicy is
the product people will search for and type; Tranquil Soul Music is the label
behind it. Keep `tranquilsoulmusic.com` as a 301 to preserve whatever the old
site ranks for — `_redirects` already handles the old `/discography` and
`/contact` paths.

## Before launch

- [ ] Point the email forms at a list provider: set `data-endpoint` on each
      `form[data-capture]`. Until then addresses are held in `localStorage` and
      the visitor is told so.
- [ ] Replace the three placeholder stream URLs in `radio.html` and `index.html`.
- [ ] Replace `example.com` partner links in `shop.html`.
- [ ] Set the canonical domain in every `<link rel="canonical">` and `sitemap.xml`.
