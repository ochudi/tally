# Tally

A single-mall promotions aggregator. Tally scrapes the sales at
[The Promenade Shops at Briargate](https://www.thepromenadeshopsatbriargate.com/sales),
persists them to Postgres, serves them through a typed REST API, and renders a
filterable, group-by-brand UI.

It is a complete vertical slice of a production pipeline: scraper → API → UI, all
sharing one source of truth for types.

```
apps/web          Next.js (App Router) UI — list, filters, group-by-brand
apps/api          Express API + Playwright scraper + Prisma
packages/shared   Zod schemas; every TS type is inferred from them
```

## Prerequisites

- **Node 20+** and **pnpm 9+** (`npm install -g pnpm`)
- **Docker** (for Postgres)

## Quick start

Four steps from a clean clone to a running app.

```bash
# 1. Start Postgres (Docker)
docker compose up -d

# 2. Install dependencies and point the API at the database
pnpm install
cp .env.example apps/api/.env

# 3. Apply migrations and load the bundled sample data
pnpm bootstrap

# 4. Run the API and UI together
pnpm dev
```

Then open **http://localhost:3000**. The API runs on **http://localhost:4000**.

`pnpm bootstrap` seeds from a committed snapshot of a real scrape
([`fixtures/promotions.raw.json`](fixtures/promotions.raw.json)), so you get a
fully populated app without touching the live site. To pull fresh data, see
[Scraping](#scraping).

## Scraping

The scraper uses Playwright (Chromium). Install the browser once, then run a
scrape. It persists to Postgres and refreshes the fixture.

```bash
pnpm playwright:install   # one-time: download Chromium
pnpm scrape               # scrape the live site, persist, refresh the fixture
```

You can also trigger a scrape through the API without blocking:

```bash
curl -X POST http://localhost:4000/scrape          # -> 202 { "jobId": "..." }
curl http://localhost:4000/scrape/<jobId>          # -> status + summary
```

## API

Base URL `http://localhost:4000`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness check. |
| `GET` | `/promotions` | Paginated list. Query: `search`, `startDate`, `endDate`, `brand`, `page`, `pageSize`. |
| `GET` | `/promotions/:id` | A single promotion, or `404`. |
| `GET` | `/brands` | Brands with `promotionCount` plus website, hours, and socials. |
| `POST` | `/scrape` | Starts a scrape in the background, returns `202` + `jobId`. |
| `GET` | `/scrape/:jobId` | Job status (`pending`/`running`/`done`/`failed`) and summary. |

Examples:

```bash
curl "http://localhost:4000/promotions?search=candle&pageSize=5"
curl "http://localhost:4000/promotions?startDate=2026-07-01"
curl "http://localhost:4000/brands"
```

Pagination is clamped, not rejected: `?page=abc` falls back to page 1 and
`?pageSize=99999` is capped. An unparseable date returns a typed `400`.

## Environment

Only the API needs configuration. Copy the example and adjust if needed.

```bash
cp .env.example apps/api/.env
```

| Variable | Default | Used by |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://tally:tally@localhost:5433/tally?schema=public` | Prisma (API) |
| `API_PORT` | `4000` | API server |

No secrets are committed; `.env` is gitignored. The web app defaults to the API
on port 4000 (override with `API_URL` if you change it).

## Tests

```bash
pnpm test
```

Unit tests cover the parsing logic most likely to silently lose data: the date
notice parser, the hours-grid parser, and the listing build-and-skip path.

## Useful commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Build shared types, then run API + UI with live reload. |
| `pnpm bootstrap` | Apply migrations and seed from the fixture. |
| `pnpm scrape` | Run a full live scrape (needs Chromium installed). |
| `pnpm db:seed` | Re-seed from the fixture. |
| `pnpm db:migrate` | Create/apply a migration in development. |
| `pnpm test` | Run the unit tests. |

## How it fits together

- **`packages/shared`** is the single source of truth. It exports Zod schemas
  (`Promotion`, `Brand`, the list envelope, the scrape-job shapes); every type is
  `z.infer` of a schema. The scraper validates its output, the API validates its
  responses, and the UI imports the same types.
- **The scraper** walks the listing, each promotion's detail page, and each
  brand's store page, stitching them by the source's store id. It is polite
  (one browser context, concurrency 2, jittered delays, honest UA, robots
  checked) and resilient (per-record `try/catch`; failures are logged and
  counted, never fatal).
- **The API** maps Prisma rows to the shared shapes at one validated seam, so the
  database's JSON columns reach the UI fully typed.
- **The UI** fetches on the server and keeps filters in the URL; a client island
  drives search, the date filter, the view toggle, and pagination.

## Known limitations

- Scrape job state is in-memory, so it is lost on API restart. Production would
  use a queue or a jobs table (see [DESIGN.md](DESIGN.md)).
- The source exposes only an end date per deal and no per-brand social links, so
  `startDate` and `socialLinks` are usually empty. This is honest missing data,
  not a bug (see [ASSUMPTIONS.md](ASSUMPTIONS.md)).
- The brand view loads all matching promotions at once (the catalogue is small);
  it is not paginated.

## Documentation

- [DESIGN.md](DESIGN.md) — architecture, schema reasoning, trade-offs.
- [ASSUMPTIONS.md](ASSUMPTIONS.md) — interpretations and mid-build discoveries.
