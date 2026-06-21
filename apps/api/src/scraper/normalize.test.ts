import { describe, expect, it } from "vitest";
import { derivePromotionId, slugify } from "./normalize.js";

describe("slugify", () => {
  it("lowercases, hyphenates, and ascii-folds", () => {
    expect(slugify("Altar'd State")).toBe("altar-d-state");
    expect(slugify("  Free People  ")).toBe("free-people");
  });

  it("expands ampersands so & does not vanish", () => {
    expect(slugify("Bath & Body Works")).toBe("bath-and-body-works");
  });
});

describe("derivePromotionId (dedup)", () => {
  const base = {
    sourcePortal: "promenade-briargate",
    brandSlug: "altard-state",
    name: "Altar'd State Sale",
    url: "https://www.thepromenadeshopsatbriargate.com/deals/3250027/",
  };

  it("prefers the source deal id from the URL", () => {
    expect(derivePromotionId(base)).toBe("promenade-briargate-3250027");
  });

  it("is deterministic: same inputs always yield the same id", () => {
    expect(derivePromotionId(base)).toBe(derivePromotionId({ ...base }));
  });

  it("falls back to a stable hash when the URL has no deal id", () => {
    const noId = { ...base, url: "https://example.com/promo/spring" };
    const id = derivePromotionId(noId);
    expect(id).toMatch(/^promenade-briargate-[0-9a-f]{16}$/);
    // Stable across calls (so re-scrapes do not duplicate).
    expect(id).toBe(derivePromotionId({ ...noId }));
  });

  it("distinguishes different promotions", () => {
    const other = { ...base, name: "A different sale", url: "https://x/y" };
    expect(derivePromotionId(other)).not.toBe(derivePromotionId(base));
  });
});
