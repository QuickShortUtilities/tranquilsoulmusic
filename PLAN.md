# Tranquil Soul — getting from £2k to five figures

## Correction to the first version of this plan

The first draft said 21M plays should have paid £20k–75k and that money was
going uncollected. **That was wrong, and it mattered.**

The plays are overwhelmingly *creators using the music on Reels*. Instagram pays
roughly $0.01–0.05 per 1,000 views for that. 21M Reels uses is therefore
**£165–£825**, and with a modest streaming tail, **£2,000 is about right.**

Collection is probably fine. Chasing royalties would have been wasted weeks.

## The actual finding

21 million creator uses is not a streaming statistic. It is **proof that
creators want this music**, repeated 21 million times — and that is the hardest
thing in this industry to manufacture.

They are being monetised as listeners. They are not listeners. They are
customers who need music that will not get their videos claimed, and that is a
subscription product, not a stream.

Epidemic Sound is a billion-dollar company built on precisely this demand.

## What five figures actually requires

| Lever | To reach £10,000/yr | Fulfilment | Margin |
|---|---|---|---|
| **Creator licence** (£12/mo) | **70 subscribers** | none | ~97% |
| **Studio licence** (£29/mo) | **29 subscribers** | none | ~97% |
| **Sync licensing** | ~40 placements @ £250 | none | ~100% |
| **App subscription** (£5.99/mo) | 164 subscribers | none | ~85% |
| **Own merch** | ~300 orders @ £33 | print partner | 30–40% |
| **Affiliate** | ~1,300 orders @ £7.50 | none | 8–12% |
| Streaming / Reels (today) | not reachable | none | — |

**29 to 70 creator subscribers clears five figures.** You have 21 million
creator uses to draw them from. Even a 0.01% click-through from Reels audio
pages is ~2,100 visits; at 3% that is 63 subscribers.

This is now the primary line. The consumer app is second.

## Why I would not lead with dropshipping supplements

You asked for supplements, training wear and candles. I built the shop, but I
want to be straight about the ranking:

- **Supplements are the worst of the four.** Selling them in the UK makes you a
  food-business operator: labelling compliance, a named responsible person, and
  hard limits on health claims. Pairing a supplement with HRV data — which is
  the obvious idea — is also an **App Store rejection** (Guideline 5.1.3 bans
  using HealthKit data for marketing). Affiliate links avoid the liability but
  pay ~10%. That is 1,300 orders for £10k.
- **Candles and prints are the best of the four**, because they are *yours*.
  Brand extension, 35% margin, print-on-demand means no inventory. But 300
  orders a year is a real marketing job.
- **Training wear is a distraction** until there is a brand people want on a
  chest. That comes after an audience, not before.

Physical goods are a *margin on an audience you already own*. They are not the
engine. Build the audience first and the shop starts working on its own.

## The plan, in order

### 1. Creator licensing (this quarter — the main event)
`/creators.html` is built. Positioned against Epidemic Sound but genuinely
niche: ambient, meditation and cinematic calm, nothing else.

The conversion path already exists and costs nothing: **every Reel using the
sound is attributed.** Instagram's audio page names the artist and links to the
profile. So the work is:
- Artist profile bio → `/creators.html`, not a link-tree.
- A pinned post that says, plainly, "using this on your Reels? Here's the licence."
- Half-price first year for anyone who has already used a track. It costs
  nothing and converts the people most likely to say yes.

### 2. Own the audience (this quarter)
Every play is currently a dead end. Fix that:
- Email capture on every page of the new site — **already built**.
- A pinned comment and end-card on every YouTube upload pointing to the radio.
- Spotify Canvas + bio link to `/radio.html`, not to a link-tree.
- **Target: 5,000 subscribers in 12 months.** At a 3% paid conversion that is
  150 subscribers — five figures on its own.

Connect the forms to a list provider (Buttondown ~£8/mo, or Kit). The form
already posts to a `data-endpoint`; it is one attribute.

### 3. Turn on sync licensing (this month — highest margin, currently £0)
5,500 tracks, one writer, one publisher, no samples. That is a genuinely
attractive proposition: **clearance is one conversation**. Most catalogues can't
say that.
- `/licensing.html` is live with a quote path.
- Go direct to yoga studios, spas, sauna operators and meditation apps.
- 40 placements at £250 is five figures with zero fulfilment.

### 4. Consumer app subscription (already built)
£5.99/month with a 7-day trial, live in the app. The free tier is three
generations a day — genuinely usable, so the upgrade moment arrives while
someone is enjoying it.

### 5. SEO journal (compounding, slow)
Three posts live. "Music for deep work", "sauna and sound", "music to fall
asleep to" are all searched consistently and are not competitive against a site
that actually makes the music. One post a fortnight.

### 6. Shop (last)
Live at `/shop.html`. Start with **your own** candles and prints via
print-on-demand. Add partner items only once traffic justifies it.

## Twelve-month model (deliberately conservative)

| Line | Assumption | Year 1 |
|---|---|---|
| Creator licences | 60 @ £12, avg 8 months | £5,760 |
| Studio licences | 12 @ £29, avg 8 months | £2,784 |
| Sync licensing | 12 placements @ £250 | £3,000 |
| App subscriptions | 80 @ £5.99, avg 7 months | £3,355 |
| Own merch | 80 orders @ £33 margin | £2,640 |
| Reels / streaming | flat | £2,000 |
| **Total** | | **£19,539** |

Every line is independently plausible. The plan does not need all of them to
land — creator licences and sync alone clear five figures.

## Costs

| Item | Annual |
|---|---|
| Hosting (Netlify/Cloudflare Pages) | £0 |
| Domain | £12 |
| Email provider (Buttondown) | ~£96 |
| Radio streaming (Azuracast on a small VPS) | ~£70 |
| Apple Developer | £79 |
| **Total** | **~£260** |

The whole operation runs for under £300 a year. Everything above that is margin.

## What I need from you

1. **Confirm the Reels/streaming split** in Songstats. If a meaningful slice is
   actually Spotify or Apple, the royalty-recovery checks are still worth doing;
   if it is nearly all Reels, skip them entirely.
2. **Does the distributor have Meta and TikTok deals?** If not, even the £165–825
   is not arriving.
3. **Three real stream URLs** for the radio page.
4. **What the generation model costs to serve** — it sets the floor under the app
   price, and I am modelling blind on it.
5. **Whether you want to run creator licensing yourself** or list the catalogue
   with an existing library. Doing it yourself keeps ~97%; listing keeps ~50% but
   removes all the distribution work. I would do it yourself, given the audience
   is already yours.
