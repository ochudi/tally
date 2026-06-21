import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { launchBrowser, newContext } from "./browser.js";
import { scrapeListing } from "./listing.js";

// fixtures/ at the repo root, four levels up from apps/api/src/scraper.
const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(HERE, "../../../../fixtures/promotions.raw.json");

async function main(): Promise<void> {
  const browser = await launchBrowser();
  try {
    const context = await newContext(browser);
    const page = await context.newPage();

    const { promotions, found, skipped } = await scrapeListing(page);

    console.log(
      `listing: found ${found} cards, ${promotions.length} valid, ${skipped} skipped`,
    );
    for (const p of promotions.slice(0, 8)) {
      console.log(`  - ${p.brand.name}: ${p.name}`);
    }

    await mkdir(dirname(FIXTURE), { recursive: true });
    await writeFile(FIXTURE, `${JSON.stringify(promotions, null, 2)}\n`);
    console.log(`wrote ${promotions.length} promotions to ${FIXTURE}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("scrape failed:", err);
  process.exit(1);
});
