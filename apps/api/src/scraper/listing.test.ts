import { describe, expect, it, vi } from "vitest";
import { buildPromotion, buildPromotions, type RawCard } from "./listing.js";

const SCRAPED_AT = new Date("2026-06-21T00:00:00Z");

const validCard: RawCard = {
  href: "/deals/3250027/",
  image: "https://cdn.example.com/img.jpg",
  name: "Altar'd State Sale",
  brandLabel: "Altar'd State",
};

describe("buildPromotion", () => {
  it("builds a schema-valid promotion from a complete card", () => {
    const p = buildPromotion(validCard, SCRAPED_AT);
    // Source deal id becomes the stable promotion id (dedup).
    expect(p.id).toBe("promenade-briargate-3250027");
    expect(p.url).toBe(
      "https://www.thepromenadeshopsatbriargate.com/deals/3250027/",
    );
    expect(p.brand.slug).toBe("altar-d-state");
    // Listing stage nulls the fields it cannot see yet.
    expect(p.description).toBeNull();
    expect(p.startDate).toBeNull();
    expect(p.endDate).toBeNull();
  });

  it("nulls the image when the card has none", () => {
    const p = buildPromotion({ ...validCard, image: null }, SCRAPED_AT);
    expect(p.imageUrl).toBeNull();
  });

  it.each([
    ["no link", { ...validCard, href: null }],
    ["no name", { ...validCard, name: null }],
    ["no brand label", { ...validCard, brandLabel: null }],
  ])("throws on a malformed card: %s", (_label, card) => {
    expect(() => buildPromotion(card as RawCard, SCRAPED_AT)).toThrow();
  });
});

describe("buildPromotions", () => {
  it("keeps valid cards, skips malformed ones, and never throws", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const raw: RawCard[] = [
      validCard,
      { ...validCard, name: null }, // malformed: skipped
      { href: "/deals/999/", image: null, name: "X", brandLabel: "Brand X" },
    ];
    const { promotions, skipped } = buildPromotions(raw, SCRAPED_AT);
    expect(promotions).toHaveLength(2);
    expect(skipped).toBe(1);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("dedups repeated cards by stable id", () => {
    const { promotions } = buildPromotions([validCard, validCard], SCRAPED_AT);
    expect(promotions).toHaveLength(1);
  });
});
