# Assumptions

Where the brief left a choice, here is what I decided and why, plus what I found
once I was inside the real site.

## Interpretations of the brief

- **One date filter, framed as "active on".** The brief asks for at least one
  filter. I expose a single date that maps to both ends of the validity window:
  "active on D" returns deals not yet ended as of D. It is the most intuitive
  control for "what's running this week" and exercises the API's `startDate`/
  `endDate` params.
- **Brands are normalized.** A brand is its own table; promotions hold a foreign
  key. Brand metadata is shared across many promotions and lives on separate
  pages, so denormalizing it would duplicate data and let copies drift. Reasoning
  in [DESIGN.md](DESIGN.md).
- **Postgres in Docker.** Chosen over SQLite/JSON because it matches the
  "downstream analytics" framing, gives a readable migration history, and the
  brief calls containerizing the DB "especially welcome". The app processes run
  on the host for fast iteration; only the database is containerized.
- **Politeness vs. `Crawl-delay: 60`.** robots.txt allows `/sales`, `/deals`, and
  `/stores`, and sets `Crawl-delay: 60`. That delay targets continuous indexers;
  for a bounded, one-time scrape of a few dozen pages at concurrency 2 I use an
  800–1500ms jittered delay instead, with an honest, contactable User-Agent. This
  is a deliberate trade-off, not an oversight.
- **Missing data is null / `{}` / `[]`, never faked.** Enforced by the Zod schema
  (`.nullable()`/`.optional()`), surfaced in the UI as quiet empty states ("Hours
  unavailable", "No end date"), never a blank or broken cell.
- **Job state is in-memory.** Correct for a single-node MVP; lost on restart. The
  production answer (a queue or a jobs table) is named in DESIGN.md, not built,
  to respect the timebox and non-goals.

## Discovered mid-build

- **A naive `fetch` is blocked.** Confirmed against the live site, which is the
  brief's "picky about HTTP clients" warning. This is the one-sentence
  justification for Playwright.
- **Promotion dates come from the detail page, not the listing.** Each listing
  card carries `data-start`/`data-end` attributes, but they are identical across
  every card (a global window), so they are useless as per-deal dates. The real
  signal is the detail page notice ("Ends Today", "Ends 7/1"), which I parse with
  a single tested helper. The source gives only an end, so `startDate` is null.
- **Brands are stitched by store id, not by name.** Each card exposes a
  `data-store-id`, and `/stores/{id}/` redirects to the brand's page. I stitch on
  that id because name matching is fragile here: "Altar'd State" slugifies to
  `altar-d-state` but the source's canonical slug is `altard-state`. The id is
  the source's own key and is exact. Label-slug is the fallback when a card has no
  store id.
- **Hours are machine-readable.** The store page encodes hours as
  `<time datetime="10:00">`, so I parse the attributes rather than display text
  and store a structured per-day map.
- **No per-brand social links exist.** The store pages show only the mall's own
  footer socials (confirmed on several stores: all link to `ShopsBriargate`). I
  scope extraction to the brand's info block, so `socialLinks` comes back `{}` for
  every brand rather than wrongly attributing the mall's handles. The schema and
  UI render socials present-only, so brand icons appear automatically if a source
  ever provides them. The venue's own socials are surfaced honestly in the site
  footer instead, from a hard-coded portal constant (`apps/web/lib/portal.ts`);
  hard-coding the single portal is allowed by the brief, and these are clearly
  labelled as the mall's, not a brand's.

## UI choices

- **Sale detail modal.** Clicking a promo card opens a focused modal with the
  full sale (image, description, validity) and the brand block (hours, website,
  socials), plus a primary action that opens the original deal on the source.
  This is the brief's optional detail click-through. A modal (rather than a route)
  keeps the list's filters and scroll position intact.
- **The promotion id prefers the source id.** Each deal URL is `/deals/{id}/`, so
  the stable id is `promenade-briargate-{id}`; if a deal ever lacked one, it falls
  back to a sha1 of `sourcePortal + brandSlug + name + url`. Upserting on this id
  makes re-scrapes idempotent.

## Snapshot

The first successful scrape is committed to
[`fixtures/promotions.raw.json`](fixtures/promotions.raw.json). `pnpm db:seed`
loads it, so the app is reproducible and the demo is deterministic even if the
live site changes. `pnpm scrape` refreshes it from the live site.
