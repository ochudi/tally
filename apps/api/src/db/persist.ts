import { Prisma } from "@prisma/client";
import type { Brand as BrandShape, Promotion as PromotionShape } from "@tally/shared";
import { prisma } from "./client.js";

// Persist a scrape. Brands are upserted by their unique slug; promotions are
// upserted by their stable derived id, so a re-scrape updates in place and never
// duplicates rows (dedup, trap 08). Returns the brandId for each slug so
// promotions can be linked.
export async function persistScrape(
  brands: BrandShape[],
  promotions: PromotionShape[],
): Promise<{ brands: number; promotions: number }> {
  for (const b of brands) {
    const data = {
      name: b.name,
      websiteUrl: b.websiteUrl,
      // Prisma needs an explicit sentinel to write SQL NULL into a Json column.
      hours: b.hours ?? Prisma.DbNull,
      socialLinks: b.socialLinks as Prisma.InputJsonValue,
      scrapedAt: b.scrapedAt,
    };
    await prisma.brand.upsert({
      where: { slug: b.slug },
      create: { slug: b.slug, ...data },
      update: data,
    });
  }

  const slugs = brands.map((b) => b.slug);
  const rows = await prisma.brand.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  });
  const idBySlug = new Map(rows.map((r) => [r.slug, r.id]));

  let persisted = 0;
  for (const p of promotions) {
    const brandId = idBySlug.get(p.brand.slug);
    if (!brandId) {
      console.warn(`persist: no brand row for slug ${p.brand.slug}, skipping ${p.id}`);
      continue;
    }
    const data = {
      name: p.name,
      description: p.description,
      imageUrl: p.imageUrl,
      startDate: p.startDate,
      endDate: p.endDate,
      url: p.url,
      sourcePortal: p.sourcePortal,
      brandId,
      scrapedAt: p.scrapedAt,
    };
    await prisma.promotion.upsert({
      where: { id: p.id },
      create: { id: p.id, ...data },
      update: data,
    });
    persisted += 1;
  }

  return { brands: brands.length, promotions: persisted };
}
