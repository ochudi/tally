// Every selector and source URL the scraper depends on lives here. Selector
// fragility is the top maintenance risk of any scraper, so a site change is a
// one-file diff: update this module, not the pipeline.

// Hard-coded single portal for this slice (non-goal: multi-portal abstraction).
export const SOURCE_PORTAL = "promenade-briargate";

export const BASE_URL = "https://www.thepromenadeshopsatbriargate.com";
export const SALES_URL = `${BASE_URL}/sales`;

export const ROBOTS_URL = `${BASE_URL}/robots.txt`;

// A brand's directory page. /stores/{id}/ redirects to the full slug URL, so the
// store id (exposed on each card as data-store-id) is all we need to reach it.
export const storeUrl = (storeId: string): string =>
  `${BASE_URL}/stores/${storeId}/`;

// The /sales listing renders each promotion as a .deal-row. The deal id lives in
// the nested /deals/{id}/ link, which is the source's own stable id; the brand's
// store id is on data-store-id.
export const LISTING = {
  card: ".deal-row",
  link: 'a[href*="/deals/"]',
  image: ".deal-image-wrapper img",
  name: ".deal-meta .major",
  // The brand label is the .minor line that is not the status notice (.motice).
  brandLabel: ".deal-meta .minor:not(.motice)",
  storeIdAttr: "data-store-id",
} as const;

// The /deals/{id}/ detail page. Description is a wysiwyg block; the validity
// window is a human notice ("Ends Today", "Ends 7/1") in the flyer.
export const DETAIL = {
  description: ".deal-detail-description",
  notice: ".deal-detail-flyer .notice",
} as const;

// The /stores/{id}/ brand page. Website is the retailer external link; hours are
// machine-readable via <time datetime>; the page exposes no per-brand socials
// (only the mall's footer), so socialLinks comes back empty.
export const STORE = {
  info: ".component-store-info",
  website: "a.ext_retailer",
  hoursRow: ".opening-hours li",
  hoursLabel: ".label",
  hoursTime: ".value time[datetime]",
  // Scoped to the store-info block so the mall's footer socials are never picked
  // up as the brand's own.
  social: '.component-store-info a[href*="instagram.com"], .component-store-info a[href*="facebook.com"], .component-store-info a[href*="tiktok.com"], .component-store-info a[href*="youtube.com"], .component-store-info a[href*="twitter.com"], .component-store-info a[href*="x.com"]',
} as const;
