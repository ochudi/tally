import { describe, expect, it } from "vitest";
import { rowsToHours } from "./brand.js";

describe("rowsToHours", () => {
  it("expands a day range and a single day into a per-day map", () => {
    const hours = rowsToHours([
      { label: "Mon – Sat", open: "10:00", close: "20:00" },
      { label: "Sun", open: "11:00", close: "18:00" },
    ]);
    expect(hours).toEqual({
      mon: "10:00-20:00",
      tue: "10:00-20:00",
      wed: "10:00-20:00",
      thu: "10:00-20:00",
      fri: "10:00-20:00",
      sat: "10:00-20:00",
      sun: "11:00-18:00",
    });
  });

  it("leaves unlisted days null", () => {
    const hours = rowsToHours([{ label: "Fri", open: "09:00", close: "17:00" }]);
    expect(hours?.fri).toBe("09:00-17:00");
    expect(hours?.mon).toBeNull();
  });

  it("skips rows missing a time and returns null when nothing is usable", () => {
    expect(rowsToHours([{ label: "Mon", open: null, close: null }])).toBeNull();
    expect(rowsToHours([])).toBeNull();
  });
});
