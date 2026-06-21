import type { BrowserContext } from "playwright";
import { DETAIL } from "./selectors.js";
import { parseEndsNotice } from "./dates.js";
import { ensureNameShim } from "./shim.js";

export type DetailData = {
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  // True when the end notice was present but could not be parsed (counted, not
  // guessed).
  dateParseFailed: boolean;
};

// Stage 2: walk one promo's detail page for its description and validity window.
// The source exposes only an end ("Ends ..."), so startDate stays null and
// endDate is parsed from the notice with the single date helper. Throws on a
// failed navigation so the caller can count it; never guesses.
export async function scrapeDetail(
  context: BrowserContext,
  url: string,
  now: Date,
): Promise<DetailData> {
  const page = await context.newPage();
  try {
    await ensureNameShim(page);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page
      .waitForSelector(DETAIL.description, { timeout: 15_000 })
      .catch(() => {});

    const raw = await page.evaluate((sel) => {
      const text = (s: string) =>
        document.querySelector(s)?.textContent?.trim() || null;
      return { description: text(sel.description), notice: text(sel.notice) };
    }, DETAIL);

    const endDate = parseEndsNotice(raw.notice, now);
    return {
      description: raw.description,
      startDate: null,
      endDate,
      dateParseFailed: Boolean(raw.notice) && endDate === null,
    };
  } finally {
    await page.close();
  }
}
