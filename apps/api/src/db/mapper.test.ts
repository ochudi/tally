import { describe, expect, it } from "vitest";
import { rowToBrand, rowToPromotion } from "./mapper.js";

const now = new Date("2026-06-21T00:00:00Z");

const brandRow = {
  id: "brand_1",
  name: "Acme",
  slug: "acme",
  websiteUrl: "https://acme.example.com",
  hours: {
    mon: "10:00-20:00",
    tue: null,
    wed: null,
    thu: null,
    fri: null,
    sat: null,
    sun: null,
  },
  socialLinks: { instagram: "https://instagram.com/acme" },
  scrapedAt: now,
  createdAt: now,
  updatedAt: now,
  _count: { promotions: 3 },
};

// The mapper is the missing-data normalizer: it validates the DB's JSON columns
// through the shared schemas and applies the policy (absent scalars -> null,
// absent collections -> {}).
describe("rowToBrand", () => {
  it("returns typed hours, socials, and an aggregate count", () => {
    const brand = rowToBrand(brandRow as never);
    expect(brand.hours?.mon).toBe("10:00-20:00");
    expect(brand.socialLinks.instagram).toBe("https://instagram.com/acme");
    expect(brand.promotionCount).toBe(3);
  });

  it("normalizes absent hours to null and absent socials to {}", () => {
    const brand = rowToBrand({
      ...brandRow,
      hours: null,
      socialLinks: null,
    } as never);
    expect(brand.hours).toBeNull();
    expect(brand.socialLinks).toEqual({});
  });
});

describe("rowToPromotion", () => {
  it("maps the brand summary and coerces dates, keeping nulls", () => {
    const promo = rowToPromotion({
      id: "promo_1",
      name: "20% off",
      description: null,
      imageUrl: null,
      startDate: null,
      endDate: now,
      url: "https://mall.example.com/p/1",
      sourcePortal: "promenade-briargate",
      brandId: "brand_1",
      scrapedAt: now,
      createdAt: now,
      updatedAt: now,
      brand: brandRow,
    } as never);

    expect(promo.brand).toEqual({ id: "brand_1", name: "Acme", slug: "acme" });
    expect(promo.description).toBeNull();
    expect(promo.startDate).toBeNull();
    expect(promo.endDate).toBeInstanceOf(Date);
  });
});
