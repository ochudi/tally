import type { BrowserContext } from "playwright";
import { Hours, SocialLinks } from "@tally/shared";
import type {
  Hours as HoursShape,
  SocialLinks as SocialLinksShape,
} from "@tally/shared";
import { STORE, storeUrl } from "./selectors.js";
import { ensureNameShim } from "./shim.js";

export type BrandMeta = {
  // The source's canonical slug, taken from the redirected store URL.
  slug: string;
  websiteUrl: string | null;
  hours: HoursShape | null;
  socialLinks: SocialLinksShape;
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
type DayKey = (typeof DAY_KEYS)[number];

// A raw hours row from the DOM: the day label and the two <time datetime> values.
type RawHoursRow = { label: string; open: string | null; close: string | null };

// Map a label like "Mon - Sat" or "Sun" to the day keys it covers, expanding a
// range inclusively in week order.
function labelToDays(label: string): DayKey[] {
  const found = [...label.toLowerCase().matchAll(/sun|mon|tue|wed|thu|fri|sat/g)]
    .map((m) => m[0] as DayKey);
  if (found.length === 0) return [];
  if (found.length === 1) return [found[0]!];
  const start = DAY_KEYS.indexOf(found[0]!);
  const end = DAY_KEYS.indexOf(found[found.length - 1]!);
  if (start === -1 || end === -1) return found;
  const days: DayKey[] = [];
  for (let i = start; ; i = (i + 1) % 7) {
    days.push(DAY_KEYS[i]!);
    if (i === end) break;
  }
  return days;
}

// Build a per-day Hours object from the raw rows. Days with no listed hours stay
// null. Returns null if nothing usable was found.
export function rowsToHours(rows: RawHoursRow[]): HoursShape | null {
  const hours: HoursShape = {
    mon: null,
    tue: null,
    wed: null,
    thu: null,
    fri: null,
    sat: null,
    sun: null,
  };
  let any = false;
  for (const row of rows) {
    if (!row.open || !row.close) continue;
    const value = `${row.open}-${row.close}`;
    for (const day of labelToDays(row.label)) {
      hours[day] = value;
      any = true;
    }
  }
  return any ? hours : null;
}

// Detect a social platform from a URL host, ignoring the mall's own handles.
function socialKeyFor(href: string): keyof SocialLinksShape | null {
  const h = href.toLowerCase();
  if (h.includes("instagram.com")) return "instagram";
  if (h.includes("facebook.com")) return "facebook";
  if (h.includes("tiktok.com")) return "tiktok";
  if (h.includes("youtube.com")) return "youtube";
  if (h.includes("twitter.com") || h.includes("x.com")) return "x";
  return null;
}

// Stage 3: visit one brand's store page (by store id; cache by id is the caller's
// job) and read websiteUrl, hours, and socialLinks. Returns null if the page is
// missing (e.g. 404), so the caller keeps the promo's own fields with null brand
// metadata, counted not dropped. Throws only on unexpected navigation errors.
export async function scrapeBrand(
  context: BrowserContext,
  storeId: string,
): Promise<BrandMeta | null> {
  const page = await context.newPage();
  try {
    await ensureNameShim(page);
    const resp = await page.goto(storeUrl(storeId), {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    if (!resp || resp.status() >= 400) return null;
    await page.waitForSelector(STORE.info, { timeout: 15_000 }).catch(() => {});

    const raw = await page.evaluate((sel) => {
      const website = document
        .querySelector(sel.website)
        ?.getAttribute("href");
      const rows = [...document.querySelectorAll(sel.hoursRow)].map((li) => {
        const label = li.querySelector(sel.hoursLabel)?.textContent || "";
        const times = [...li.querySelectorAll(sel.hoursTime)].map(
          (t) => t.getAttribute("datetime") || null,
        );
        return { label, open: times[0] ?? null, close: times[1] ?? null };
      });
      const socials = [...document.querySelectorAll(sel.social)].map(
        (a) => a.getAttribute("href") || "",
      );
      return { website: website ?? null, rows, socials };
    }, STORE);

    // Canonical slug from the redirected URL: /stores/{id}-{slug}/.
    const slug = page.url().match(/\/stores\/\d+-([^/]+)/)?.[1] ?? storeId;

    const socialLinks: Record<string, string> = {};
    for (const href of raw.socials) {
      const key = socialKeyFor(href);
      if (key && !socialLinks[key]) socialLinks[key] = href;
    }

    return {
      slug,
      websiteUrl: raw.website && /^https?:/.test(raw.website) ? raw.website : null,
      hours: Hours.nullable().parse(rowsToHours(raw.rows)),
      socialLinks: SocialLinks.parse(socialLinks),
    };
  } finally {
    await page.close();
  }
}
