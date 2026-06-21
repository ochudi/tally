import { describe, expect, it } from "vitest";
import { parseEndsNotice } from "./dates.js";

// A fixed "now" so weekday/relative parsing is deterministic. 2026-06-21 is a
// Sunday.
const NOW = new Date(2026, 5, 21, 12, 0, 0);

describe("parseEndsNotice", () => {
  it("returns null for empty or non-end notices", () => {
    expect(parseEndsNotice(null, NOW)).toBeNull();
    expect(parseEndsNotice("New Arrivals", NOW)).toBeNull();
  });

  it("parses 'Ends Today' to the end of the scrape day", () => {
    const d = parseEndsNotice("Ends Today", NOW);
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(5);
    expect(d?.getDate()).toBe(21);
  });

  it("parses 'Ends Tomorrow'", () => {
    expect(parseEndsNotice("Ends Tomorrow", NOW)?.getDate()).toBe(22);
  });

  it("parses an explicit M/D, rolling to next year if already past", () => {
    const future = parseEndsNotice("Ends 7/1", NOW);
    expect(future?.getMonth()).toBe(6);
    expect(future?.getDate()).toBe(1);
    expect(future?.getFullYear()).toBe(2026);

    // 1/1 is before 6/21, so it rolls to 2027.
    expect(parseEndsNotice("Ends 1/1", NOW)?.getFullYear()).toBe(2027);
  });

  it("parses M/D/YY", () => {
    const d = parseEndsNotice("Ends 12/31/26", NOW);
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(11);
    expect(d?.getDate()).toBe(31);
  });

  it("parses a weekday to its next occurrence", () => {
    // NOW is Sunday; next Thursday is the 25th.
    expect(parseEndsNotice("Ends Thursday", NOW)?.getDate()).toBe(25);
  });

  it("returns null for an impossible date", () => {
    expect(parseEndsNotice("Ends 13/40", NOW)).toBeNull();
  });
});
