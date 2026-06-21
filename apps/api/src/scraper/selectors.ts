// Every selector and source URL the scraper depends on lives here. Selector
// fragility is the top maintenance risk of any scraper, so a site change is a
// one-file diff: update this module, not the pipeline.

// Hard-coded single portal for this slice (non-goal: multi-portal abstraction).
export const SOURCE_PORTAL = "promenade-briargate";

export const BASE_URL = "https://www.thepromenadeshopsatbriargate.com";
export const SALES_URL = `${BASE_URL}/sales`;

// The /sales listing renders each promotion as a .deal-row. The deal id lives in
// the nested /deals/{id}/ link, which is the source's own stable id.
export const LISTING = {
  card: ".deal-row",
  link: 'a[href*="/deals/"]',
  image: ".deal-image-wrapper img",
  name: ".deal-meta .major",
  // The brand label is the .minor line that is not the status notice (.motice).
  brandLabel: ".deal-meta .minor:not(.motice)",
} as const;
