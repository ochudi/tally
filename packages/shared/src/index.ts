// The one source of truth for types. The scraper output, the API responses, and
// the UI props all derive from these Zod schemas via z.infer, so a shape is
// defined once and moves everywhere together. Prisma's generated types cover the
// DB row only; the API's row->shared mapper validates the row's JSON fields
// through Hours and SocialLinks here, so the seam is checked and never cast.
//
// Missing-data policy, carried by the types: absent scalars are null, absent
// collections are {} or []. Exactly those fields are .nullable()/.optional()
// and nothing else.
import { z } from "zod";

// Store hours as a structured per-day map, not a freeform string, so the UI can
// render it and a downstream consumer can parse it. A day with no listed hours
// is null. The whole map is nullable on the brand when no hours were found.
export const Hours = z.object({
  mon: z.string().nullable(),
  tue: z.string().nullable(),
  wed: z.string().nullable(),
  thu: z.string().nullable(),
  fri: z.string().nullable(),
  sat: z.string().nullable(),
  sun: z.string().nullable(),
});
export type Hours = z.infer<typeof Hours>;

// Only present platforms are included; the empty case is {} (absent collection),
// not null. Each value is a real URL.
export const SocialLinks = z.object({
  instagram: z.string().url().optional(),
  facebook: z.string().url().optional(),
  tiktok: z.string().url().optional(),
  x: z.string().url().optional(),
  youtube: z.string().url().optional(),
});
export type SocialLinks = z.infer<typeof SocialLinks>;

// A brand and its metadata. websiteUrl and hours are nullable (absent scalars /
// absent map). socialLinks defaults to {} when none were found. promotionCount
// is only present on the /brands aggregate, so it is optional.
export const Brand = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  websiteUrl: z.string().url().nullable(),
  hours: Hours.nullable(),
  socialLinks: SocialLinks.default({}),
  promotionCount: z.number().int().nonnegative().optional(),
  scrapedAt: z.coerce.date(),
});
export type Brand = z.infer<typeof Brand>;

// The brand identity carried on each promotion. The full brand metadata lives on
// GET /brands; a promotion only needs enough to group, filter, and link.
export const BrandSummary = Brand.pick({ id: true, name: true, slug: true });
export type BrandSummary = z.infer<typeof BrandSummary>;

// A single promotion. The four optional source fields (description, imageUrl,
// startDate, endDate) are nullable per the missing-data policy; id, name, url,
// sourcePortal, and scrapedAt are always present.
export const Promotion = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  startDate: z.coerce.date().nullable(),
  endDate: z.coerce.date().nullable(),
  url: z.string().url(),
  sourcePortal: z.string(),
  brand: BrandSummary,
  scrapedAt: z.coerce.date(),
});
export type Promotion = z.infer<typeof Promotion>;

// The paginated list envelope returned by GET /promotions.
export const PromotionList = z.object({
  data: z.array(Promotion),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});
export type PromotionList = z.infer<typeof PromotionList>;

// The query contract for GET /promotions. z.coerce turns query strings into
// numbers/dates; page and pageSize clamp to safe ranges so bad pagination is
// corrected, not crashed. The API validates against this at the boundary.
export const PromotionQuery = z.object({
  search: z.string().trim().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  brand: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type PromotionQuery = z.infer<typeof PromotionQuery>;

// Async scrape job model. POST /scrape returns 202 + jobId; GET /scrape/:jobId
// polls status and, once done, a summary of partial success.
export const ScrapeJobStatus = z.enum(["pending", "running", "done", "failed"]);
export type ScrapeJobStatus = z.infer<typeof ScrapeJobStatus>;

export const ScrapeSummary = z.object({
  recordsFound: z.number().int().nonnegative(),
  enriched: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});
export type ScrapeSummary = z.infer<typeof ScrapeSummary>;

// The full job record. summary is null until the run finishes; error is null
// unless the run failed.
export const ScrapeJob = z.object({
  jobId: z.string(),
  status: ScrapeJobStatus,
  startedAt: z.coerce.date(),
  summary: ScrapeSummary.nullable(),
  error: z.string().nullable(),
});
export type ScrapeJob = z.infer<typeof ScrapeJob>;

// The immediate 202 body from POST /scrape.
export const ScrapeAccepted = z.object({ jobId: z.string() });
export type ScrapeAccepted = z.infer<typeof ScrapeAccepted>;

// The shape every error response takes, so a client never has to parse an HTML
// stack. error is a stable human-readable message; details carries Zod issues on
// a 400.
export const ApiError = z.object({
  error: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiError>;
