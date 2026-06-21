import type { BrowserContext } from "playwright";
import {
  Brand,
  type Brand as BrandShape,
  type Promotion as PromotionShape,
  type ScrapeSummary,
} from "@tally/shared";
import { launchBrowser, newContext } from "./browser.js";
import { loadRobots } from "./robots.js";
import { scrapeListing, type ScrapedPromotion } from "./listing.js";
import { scrapeDetail } from "./detail.js";
import { scrapeBrand, type BrandMeta } from "./brand.js";
import { createLimit, jitterDelay } from "./concurrency.js";
import { SALES_URL, storeUrl } from "./selectors.js";

export type ScrapeResult = {
  brands: BrandShape[];
  promotions: PromotionShape[];
  summary: ScrapeSummary;
};

// Politeness and safety knobs.
const CONCURRENCY = 2;
const PAGE_CAP = 200; // hard cap on total page navigations per run

// Build the shared Brand shape from a promotion's label and (optional) store
// metadata. brand.id is the canonical slug as a stand-in until the DB assigns one.
function toBrand(
  name: string,
  slug: string,
  meta: BrandMeta | null,
  scrapedAt: Date,
): BrandShape {
  return Brand.parse({
    id: slug,
    name,
    slug,
    websiteUrl: meta?.websiteUrl ?? null,
    hours: meta?.hours ?? null,
    socialLinks: meta?.socialLinks ?? {},
    scrapedAt,
  });
}

// The full scrape: listing -> brand stitch -> detail enrichment, polite and
// resilient. Every per-record step is wrapped so one failure is logged and
// counted, never fatal. Returns the assembled brands, promotions, and a summary.
export async function runScrape(): Promise<ScrapeResult> {
  const browser = await launchBrowser();
  const scrapedAt = new Date();
  let budget = PAGE_CAP;

  try {
    const context: BrowserContext = await newContext(browser);

    const robots = await loadRobots(context);
    if (robots.crawlDelaySeconds) {
      console.log(
        `robots.txt: Crawl-delay ${robots.crawlDelaySeconds}s noted; using ${800}-${1500}ms courtesy delay for this bounded run`,
      );
    }
    if (!robots.isAllowed(new URL(SALES_URL).pathname)) {
      throw new Error("robots.txt disallows /sales; aborting");
    }

    // Stage 1: listing.
    const page = await context.newPage();
    const listing = await scrapeListing(page);
    await page.close();
    budget -= 1;
    console.log(
      `listing: found ${listing.found} cards, ${listing.items.length} valid, ${listing.skipped} skipped`,
    );

    const limit = createLimit(CONCURRENCY);
    // Pace every navigation: jitter inside the slot so at most CONCURRENCY pages
    // are ever in flight.
    const politely = <T>(fn: () => Promise<T>): Promise<T> =>
      limit(async () => {
        await jitterDelay();
        return fn();
      });

    let failed = 0;

    // Stage 3 first: fetch each unique brand store page once (cache by store id),
    // so promotions can adopt the canonical brand slug. Respect robots and cap.
    const storeIds = [
      ...new Set(
        listing.items
          .map((i) => i.storeId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const metaByStore = new Map<string, BrandMeta | null>();
    await Promise.all(
      storeIds.map((storeId) =>
        politely(async () => {
          if (budget <= 0) return;
          if (!robots.isAllowed(new URL(storeUrl(storeId)).pathname)) return;
          budget -= 1;
          try {
            metaByStore.set(storeId, await scrapeBrand(context, storeId));
          } catch (err) {
            failed += 1;
            metaByStore.set(storeId, null);
            console.warn(
              `brand: failed store ${storeId} (${(err as Error).message})`,
            );
          }
        }),
      ),
    );

    const noMeta = [...metaByStore.values()].filter((m) => m === null).length;
    if (noMeta) {
      console.warn(
        `brand: ${noMeta} store page(s) returned no metadata; their promos keep their own fields with null brand meta`,
      );
    }

    // Stage 2: detail-enrich each promotion, and stitch its brand identity.
    const brandsBySlug = new Map<string, BrandShape>();
    const promotions: PromotionShape[] = [];
    let enriched = 0;

    await Promise.all(
      listing.items.map((item: ScrapedPromotion) =>
        politely(async () => {
          const { promotion, storeId } = item;
          const meta = storeId ? (metaByStore.get(storeId) ?? null) : null;
          // Canonical slug from the store page when we have it; else the slug
          // derived from the label at listing time.
          const slug = meta?.slug ?? promotion.brand.slug;
          const brandName = promotion.brand.name;
          promotion.brand = { id: slug, name: brandName, slug };
          if (!brandsBySlug.has(slug)) {
            brandsBySlug.set(slug, toBrand(brandName, slug, meta, scrapedAt));
          }

          // Detail enrichment. A failure leaves the promo's own fields intact.
          if (budget > 0 && robots.isAllowed(new URL(promotion.url).pathname)) {
            budget -= 1;
            try {
              const detail = await scrapeDetail(context, promotion.url, scrapedAt);
              promotion.description = detail.description;
              promotion.startDate = detail.startDate;
              promotion.endDate = detail.endDate;
              if (detail.dateParseFailed) failed += 1;
              enriched += 1;
            } catch (err) {
              failed += 1;
              console.warn(
                `detail: failed ${promotion.url} (${(err as Error).message})`,
              );
            }
          }
          promotions.push(promotion);
        }),
      ),
    );

    if (budget <= 0) {
      console.warn(`page cap (${PAGE_CAP}) reached; some pages were not visited`);
    }

    return {
      brands: [...brandsBySlug.values()],
      promotions,
      summary: { recordsFound: promotions.length, enriched, failed },
    };
  } finally {
    await browser.close();
  }
}
