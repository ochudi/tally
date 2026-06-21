# Tally / Design

## Scope
A single-portal vertical slice of a promotions aggregator: scrape -> persist ->
typed REST -> filterable, group-by-brand UI. Built to the brief's 6-8h budget.
Production concerns are named where they matter, not all built. The non-goals
in the brief (multi-portal abstraction, auth, deploy, captcha defeat, real-time
sync) are treated as out of scope on purpose, not overlooked.

## Scraping approach
Playwright (Chromium). The target is picky about HTTP clients, a naive fetch is
blocked, and the listing is JS-rendered across a multi-page walk (listing ->
detail -> brand directory). I considered axios + cheerio and rejected it: it is
faster to write but brittle against the anti-bot posture, and the first selector
or header change would cost back whatever it saved.

Politeness is built in, not bolted on: one reused browser context, concurrency
2, jittered 800-1500ms delays between requests, an honest user agent, robots.txt
respected, and a hard page cap so a bad run can't walk the whole site.

Selectors live in one module. Selector fragility is the real maintenance risk
here, so the mitigation is deliberate: centralize every selector in one place
and commit a fixture snapshot of the pages, so a parser change is a one-file
diff and the tests don't need the network.

## Schema
Normalized: Brand (1) -- Promotion (N). Brand metadata (hours, socials, address)
is shared and lives on its own directory pages, so denormalizing it onto each
promotion would duplicate it and let copies drift out of sync.

Each promotion gets a stable derived id: the source id if the page exposes one,
otherwise a sha1 of sourcePortal + brand slug + name + url. Rows are upserted on
that id, so re-scrapes update in place instead of duplicating.

Dates are stored as real timestamps. Missing-data policy is uniform and enforced
in the schema, not by convention: absent scalars are null, absent collections
are [] or {}. Hours and social links are typed JSON, not stringified blobs, so
the API doesn't hand the UI a string it has to re-parse.

## Type-shared layer
One file of Zod schemas in packages/shared. z.infer off those schemas produces
the scraper's output type, the API's response type, and the UI's prop type, so
all three move together. Prisma's generated types describe the DB row only; a
single mapper validates the row's JSON fields through the Zod schemas and bridges
to the shared shape. The JSON fields are typed unknown until that seam, so there
is no cast and no second definition of the same shape to keep in step.

## Async jobs
An in-process job registry. POST /scrape returns 202 + a jobId immediately and
runs the scrape in the background; GET /scrape/:jobId polls status and a
{found, enriched, failed} summary. The trade-off is explicit: in-process state
is correct for a single-node MVP but is lost on restart, and it won't survive
horizontal scaling. Production wants a queue or a jobs table. Named here, not
built, to stay inside the timebox and the non-goals.

## Failure modes anticipated
- Site shape drift: the highest-likelihood failure. Mitigated by the central
  selector module and the committed fixture snapshot.
- Per-record scrape failures: each record is wrapped in its own try/catch,
  logged, counted into the job summary, and skipped. One bad detail page does
  not crash the run or the API.
- Missing brand fields: nulled per the missing-data policy and surfaced as a
  designed empty state in the UI, never a blank or broken cell.
- Unparseable dates: nulled and counted, not coerced into a wrong timestamp.
- Bad API input: every query param is validated with Zod (z.coerce for numbers
  and dates), pagination is clamped, invalid input returns 400, not a stack
  trace.

## What I cut for time
- Detail-page click-through enrichment beyond the fields on the listing and
  directory pages. The seam is there; I scraped what those two page types give.
- Load-more / infinite-scroll pagination past the page cap. I take the first N
  pages and stop.
- Full-text search and free-text filtering. The UI filters on the structured
  facets (brand, category, active window); a search box would be the next add.
- Dark mode and responsive polish below tablet width. The layout holds, it just
  isn't tuned for phones.
- A jobs table. Job state is in memory, see above.
- Retry-with-backoff on transient network errors. A failed record is counted
  and skipped rather than retried.
