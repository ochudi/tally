import type {
  Brand as BrandRow,
  Promotion as PromotionRow,
} from "@prisma/client";
import {
  Brand,
  Hours,
  Promotion,
  SocialLinks,
  type Brand as BrandShape,
  type Promotion as PromotionShape,
} from "@tally/shared";

// The seam between the DB row and the shared API shape. Prisma types hours and
// socialLinks as JsonValue (effectively unknown), so we validate them through
// the shared Zod schemas here rather than casting (trap 01). The missing-data
// policy is applied at the same seam: null hours stays null, absent socialLinks
// becomes {}.

type BrandRowWithCount = BrandRow & {
  _count?: { promotions: number };
};

type PromotionRowWithBrand = PromotionRow & {
  brand: BrandRow;
};

// Validate the two Json fields once, shared by both mappers.
function parseHours(value: BrandRow["hours"]): BrandShape["hours"] {
  return Hours.nullable().parse(value);
}

function parseSocialLinks(
  value: BrandRow["socialLinks"],
): BrandShape["socialLinks"] {
  // Absent collection is {}, per the missing-data policy.
  return SocialLinks.parse(value ?? {});
}

export function rowToBrand(row: BrandRowWithCount): BrandShape {
  return Brand.parse({
    id: row.id,
    name: row.name,
    slug: row.slug,
    websiteUrl: row.websiteUrl,
    hours: parseHours(row.hours),
    socialLinks: parseSocialLinks(row.socialLinks),
    promotionCount: row._count?.promotions,
    scrapedAt: row.scrapedAt,
  });
}

export function rowToPromotion(row: PromotionRowWithBrand): PromotionShape {
  return Promotion.parse({
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.imageUrl,
    startDate: row.startDate,
    endDate: row.endDate,
    url: row.url,
    sourcePortal: row.sourcePortal,
    brand: {
      id: row.brand.id,
      name: row.brand.name,
      slug: row.brand.slug,
    },
    scrapedAt: row.scrapedAt,
  });
}
