import { chromium, type Browser, type BrowserContext } from "playwright";

// A real browser fingerprint. The target blocks naive HTTP clients (trap 05), so
// we present a genuine desktop Chrome UA, a real locale, and a viewport. The UA
// also identifies the bot honestly and carries a contact, per the politeness
// rule (NFR-2); the parenthetical comment is valid UA syntax and the site still
// serves us.
export const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 " +
  "(+Tally promotions aggregator; contact ofoma.chudi@gmail.com)";

export const LOCALE = "en-US";
export const VIEWPORT = { width: 1366, height: 900 } as const;

export async function launchBrowser(): Promise<Browser> {
  return chromium.launch({ headless: true });
}

// One context reused across the whole run, the base of the politeness story.
export async function newContext(browser: Browser): Promise<BrowserContext> {
  return browser.newContext({
    userAgent: USER_AGENT,
    locale: LOCALE,
    viewport: { ...VIEWPORT },
  });
}
