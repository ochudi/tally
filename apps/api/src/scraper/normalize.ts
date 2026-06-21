import { createHash } from "node:crypto";

// Lowercase, ascii-fold, and hyphenate a label into a stable slug. Used to derive
// a brand slug from its display name and to feed the promotion id hash.
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DEAL_ID = /\/deals\/(\d+)/;

// Stable, deterministic promotion id (dedup). Prefer the source's own deal id
// from the /deals/{id}/ URL; otherwise hash a normalized tuple of the stable
// signals. Upserting on this id keeps re-scrapes idempotent: same promo, same id.
export function derivePromotionId(args: {
  sourcePortal: string;
  brandSlug: string;
  name: string;
  url: string;
}): string {
  const sourceId = args.url.match(DEAL_ID)?.[1];
  if (sourceId) return `${args.sourcePortal}-${sourceId}`;
  const hash = createHash("sha1")
    .update([args.sourcePortal, args.brandSlug, args.name, args.url].join("|"))
    .digest("hex")
    .slice(0, 16);
  return `${args.sourcePortal}-${hash}`;
}
