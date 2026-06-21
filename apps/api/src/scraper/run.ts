import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../db/client.js";
import { connectWithRetry } from "../db/client.js";
import { persistScrape } from "../db/persist.js";
import { runScrape } from "./pipeline.js";

// fixtures/ at the repo root, four levels up from apps/api/src/scraper.
const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(HERE, "../../../../fixtures/promotions.raw.json");

async function main(): Promise<void> {
  const { brands, promotions, summary } = await runScrape();

  console.log(
    `scrape summary: recordsFound=${summary.recordsFound} enriched=${summary.enriched} failed=${summary.failed}`,
  );
  const withBrandMeta = brands.filter(
    (b) => b.websiteUrl || b.hours || Object.keys(b.socialLinks).length > 0,
  ).length;
  console.log(
    `brands: ${brands.length} (${withBrandMeta} with website/hours/socials)`,
  );

  // Persist to Postgres (idempotent upserts).
  await connectWithRetry();
  try {
    const counts = await persistScrape(brands, promotions);
    console.log(
      `persisted: ${counts.brands} brands, ${counts.promotions} promotions`,
    );
  } finally {
    await prisma.$disconnect();
  }

  // Refresh the committed fixture so seeding and UI work never hit the live site.
  await mkdir(dirname(FIXTURE), { recursive: true });
  await writeFile(
    FIXTURE,
    `${JSON.stringify({ scrapedAt: new Date().toISOString(), brands, promotions }, null, 2)}\n`,
  );
  console.log(`wrote fixture: ${FIXTURE}`);
}

main().catch((err) => {
  console.error("scrape failed:", err);
  process.exit(1);
});
