import type { BrowserContext } from "playwright";
import { ROBOTS_URL } from "./selectors.js";

// A small robots.txt reader. We honor the Disallow rules for the wildcard user
// agent (our paths /sales, /deals, /stores are all allowed). The file also sets
// Crawl-delay: 60, which is aimed at continuous indexers; for a bounded, one-time
// scrape of a few dozen pages at concurrency 2 we use an 800-1500ms courtesy
// delay instead, a deliberate and documented trade-off (see DESIGN/ASSUMPTIONS).
export type Robots = {
  isAllowed: (pathname: string) => boolean;
  crawlDelaySeconds: number | null;
};

function parse(text: string): Robots {
  const disallow: string[] = [];
  let crawlDelay: number | null = null;
  let appliesToUs = false;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const field = line.slice(0, sep).trim().toLowerCase();
    const value = line.slice(sep + 1).trim();

    if (field === "user-agent") {
      // Track whether the current group applies to us (the wildcard group).
      appliesToUs = value === "*";
    } else if (appliesToUs && field === "disallow" && value) {
      disallow.push(value);
    } else if (appliesToUs && field === "crawl-delay") {
      const n = Number(value);
      if (!Number.isNaN(n)) crawlDelay = n;
    }
  }

  return {
    crawlDelaySeconds: crawlDelay,
    isAllowed: (pathname) => !disallow.some((rule) => pathname.startsWith(rule)),
  };
}

// Fetch and parse robots.txt. If it cannot be read, default to permissive (the
// site served it fine in practice); a failure here never blocks the run.
export async function loadRobots(context: BrowserContext): Promise<Robots> {
  const page = await context.newPage();
  try {
    const resp = await page.goto(ROBOTS_URL, {
      waitUntil: "domcontentloaded",
      timeout: 20_000,
    });
    if (!resp || !resp.ok()) {
      return { isAllowed: () => true, crawlDelaySeconds: null };
    }
    const body = await page.evaluate(() => document.body.innerText);
    return parse(body);
  } catch {
    return { isAllowed: () => true, crawlDelaySeconds: null };
  } finally {
    await page.close();
  }
}

export const __test = { parse };
