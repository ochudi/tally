import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { Brand, Promotion } from "@tally/shared";

// Validate the committed snapshot the seed loads. These tests fail loudly if the
// fixture drifts out of shape, so the reviewer's seeded data always conforms.
const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(HERE, "../../../fixtures/promotions.raw.json");
const fixture = JSON.parse(readFileSync(FIXTURE, "utf8")) as {
  brands: unknown[];
  promotions: unknown[];
};

describe("fixture", () => {
  it("has real data to seed", () => {
    expect(fixture.promotions.length).toBeGreaterThan(0);
    expect(fixture.brands.length).toBeGreaterThan(0);
  });

  it("every promotion conforms to the shared schema", () => {
    expect(() => Promotion.array().parse(fixture.promotions)).not.toThrow();
  });

  it("every brand conforms to the shared schema", () => {
    expect(() => Brand.array().parse(fixture.brands)).not.toThrow();
  });

  it("promotion ids are unique (dedup holds)", () => {
    const ids = Promotion.array()
      .parse(fixture.promotions)
      .map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every promotion points at a brand present in the fixture", () => {
    const brands = Brand.array().parse(fixture.brands);
    const slugs = new Set(brands.map((b) => b.slug));
    const orphans = Promotion.array()
      .parse(fixture.promotions)
      .filter((p) => !slugs.has(p.brand.slug));
    expect(orphans).toHaveLength(0);
  });

  it("brand metadata is populated where the source provides it", () => {
    const brands = Brand.array().parse(fixture.brands);
    // Not blanket-missing: at least some brands carry website and hours.
    expect(brands.some((b) => b.websiteUrl)).toBe(true);
    expect(brands.some((b) => b.hours)).toBe(true);
    // Missing-data policy: socialLinks is always an object, never null.
    expect(brands.every((b) => typeof b.socialLinks === "object")).toBe(true);
  });
});
