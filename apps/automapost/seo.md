# AutomaPost SEO Improvement Plan (Prioritized)

This document lists concrete, high-impact SEO improvements for AutomaPost, ordered from highest to lowest priority. Each item includes a short why and the action(s) to take in this codebase.

## P0 – Critical (do first)

7) Internal linking strategy
- Why: Crawl path & topical signals.
- Actions:
  - Blog index: add topic/category filters and link to category pages (future).
  - Article body: support curated “Related links” in addition to automated recommendations.

8) Pagination for `/blog`
- Why: Crawl efficiency and UX for long lists.
- Actions:
  - SSR pagination (`?page=2`), canonical only on page 1, add `rel="prev"/"next"`.

9) Image hygiene
- Why: Image search and accessibility.
- Actions:
  - Ensure every content image has descriptive `alt` from DB. Icons: empty `alt`/`aria-hidden`.
  - Serve WebP/AVIF via Next `<Image>`.

12) RSS/Atom feed for the blog
- Why: Distribution/Discovery.
- Actions:
  - Add `/blog/rss.xml` with the latest 20 EN posts.

## P2 – Medium Priority

14) Additional structured data
- Why: Expanded SERP features.
- Actions:
  - Add `FAQPage` JSON-LD to the landing FAQ section.
  - Consider `Product` schema for paid plans if appropriate.

15) Image sitemap (optional)
- Why: Help image discovery.
- Actions:
  - Extend sitemap to include `<image:image>` for article banners once on `<Image>`.

16) Breadcrumb UX consistency
- Why: Predictability & CTR in SERP.
- Actions:
  - We render breadcrumbs; add matching JSON-LD and keep last crumb unlinked (already styled darker).

17) E‑E‑A‑T signals
- Why: Trust.
- Actions:
  - Add author pages (bio, headshot, links) and link from articles. Add `Person` JSON-LD.
  - Expand About/Contact footprint in footer if needed.

18) Content velocity & topical authority
- Why: Rankings.
- Actions:
  - Publish a steady cadence of posts around LinkedIn automation. Build pillar pages and topic clusters; interlink accordingly.

19) Performance polish
- Why: Marginal gains.
- Actions:
  - HTTP caching headers; CDN brotli; preconnect for fonts.

## P3 – Nice to Have

20) Open Graph/Twitter cards – variants
- Why: Social CTR.
- Actions:
  - Dynamic OG images per post (title-driven, 1200×630) with brand.

21) International SEO content strategy
- Why: Regional coverage.
- Actions:
  - Localized keyword research and net-new localized content (not just translation).

---

## Implementation Notes (where to change things)

- Metadata & alternates: `lib/metadata.ts`
- Sitemap: `app/sitemap.ts`
- Robots: `app/robots.ts`
- Blog article page: `app/[locale]/blog/[slug]/page.tsx`
- Blog index: `app/[locale]/blog/page.tsx`
- Shared components: `components/...`

## Quick tasks checklist

- [ ] Add `BreadcrumbList` + `BlogPosting` JSON‑LD to article pages
- [ ] Switch article/banner/list images to Next `<Image>` with proper `sizes`
- [ ] Add `/blog/rss.xml`
- [ ] Implement `/blog` pagination with canonical/prev/next
- [ ] Add FAQ JSON‑LD to landing FAQ
- [ ] Ensure canonical strips UTM/ref params
- [ ] Add author pages + `Person` JSON‑LD
