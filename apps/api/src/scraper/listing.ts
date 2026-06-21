import type { Page } from "playwright";
import { Promotion, type Promotion as PromotionShape } from "@tally/shared";
import { BASE_URL, LISTING, SALES_URL, SOURCE_PORTAL } from "./selectors.js";
import { derivePromotionId, slugify } from "./normalize.js";
import { ensureNameShim } from "./shim.js";

// What a single card yields from the DOM, before validation. All fields are
// nullable here because any of them can be missing on a malformed card; the
// schema decides what is acceptable. storeId is the brand's source id, used to
// stitch brand metadata in stage 3.
export type RawCard = {
  href: string | null;
  image: string | null;
  name: string | null;
  brandLabel: string | null;
  storeId: string | null;
};

// A validated promotion plus the brand store id it stitches to.
export type ScrapedPromotion = {
  promotion: PromotionShape;
  storeId: string | null;
};

export type ListingResult = {
  items: ScrapedPromotion[];
  found: number; // cards seen in the DOM
  skipped: number; // cards that failed to validate
};

// Absolute, canonical URL from a possibly-relative href.
function absoluteUrl(href: string): string {
  return new URL(href, BASE_URL).toString();
}

// Build a validated Promotion from one raw card, or throw with a clear reason if
// the card is malformed. Pure and DOM-free so it can be unit-tested directly.
export function buildPromotion(card: RawCard, scrapedAt: Date): PromotionShape {
  if (!card.href) throw new Error("card has no deal link");
  if (!card.name) throw new Error("card has no name");
  if (!card.brandLabel) throw new Error("card has no brand label");

  const url = absoluteUrl(card.href);
  const brandSlug = slugify(card.brandLabel);
  if (!brandSlug) {
    throw new Error(`brand label is not sluggable: ${card.brandLabel}`);
  }

  // Listing stage fills what the card exposes; description, dates, and full brand
  // metadata are nulled here and enriched by later stages. brand.id is the slug
  // as a stand-in until the DB upsert assigns the real id.
  return Promotion.parse({
    id: derivePromotionId({
      sourcePortal: SOURCE_PORTAL,
      brandSlug,
      name: card.name,
      url,
    }),
    name: card.name,
    description: null,
    imageUrl: card.image ? absoluteUrl(card.image) : null,
    startDate: null,
    endDate: null,
    url,
    sourcePortal: SOURCE_PORTAL,
    brand: { id: brandSlug, name: card.brandLabel, slug: brandSlug },
    scrapedAt,
  });
}

// Validate a batch of raw cards, skipping (and logging) the malformed ones, and
// dedup by stable id. Pure, so the resilience is testable without a browser.
export function buildPromotions(
  raw: RawCard[],
  scrapedAt: Date,
): { items: ScrapedPromotion[]; skipped: number } {
  const byId = new Map<string, ScrapedPromotion>();
  let skipped = 0;
  for (const card of raw) {
    try {
      const promotion = buildPromotion(card, scrapedAt);
      // The same deal can appear under several collection tabs; dedup by id.
      byId.set(promotion.id, { promotion, storeId: card.storeId });
    } catch (err) {
      skipped++;
      console.warn(
        `listing: skipped a card (${(err as Error).message}):`,
        JSON.stringify(card),
      );
    }
  }
  return { items: [...byId.values()], skipped };
}

// Stage 1: load /sales, wait for the cards to render (not a fixed sleep), and
// extract each card's name, image, canonical URL, and brand label. Each card is
// built into a Promotion and validated against the shared schema; a card that
// fails validation is logged and skipped, never fatal (NFR-5).
export async function scrapeListing(page: Page): Promise<ListingResult> {
  await ensureNameShim(page);

  await page.goto(SALES_URL, { waitUntil: "networkidle", timeout: 60_000 });
  // Wait for the real content, not a timer: the first deal card must be present.
  await page.waitForSelector(LISTING.card, { timeout: 30_000 });

  const raw: RawCard[] = await page.$$eval(
    LISTING.card,
    (rows, sel) =>
      rows.map((row) => {
        const a = row.querySelector(sel.link);
        const img = row.querySelector(sel.image);
        const text = (s: string) =>
          row.querySelector(s)?.textContent?.trim() || null;
        return {
          href: a?.getAttribute("href") || null,
          image:
            img?.getAttribute("src") || img?.getAttribute("data-src") || null,
          name: text(sel.name),
          brandLabel: text(sel.brandLabel),
          storeId: row.getAttribute(sel.storeIdAttr) || null,
        };
      }),
    LISTING,
  );

  const { items, skipped } = buildPromotions(raw, new Date());
  return { items, found: raw.length, skipped };
}
