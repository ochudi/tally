import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Brand, Promotion } from "@tally/shared";
import { connectWithRetry, prisma } from "../src/db/client.js";
import { persistScrape } from "../src/db/persist.js";

// Seed the database from the committed fixture (the snapshot of a real scrape).
// This lets a reviewer get a fully populated DB in seconds without running
// Playwright against the live site. The fixture is validated through the shared
// schemas on the way in, so a stale or hand-edited fixture fails loudly.
const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE = resolve(HERE, "../../../fixtures/promotions.raw.json");

async function main(): Promise<void> {
  const raw = JSON.parse(await readFile(FIXTURE, "utf8")) as unknown;
  const parsed = raw as { brands: unknown; promotions: unknown };
  const brands = Brand.array().parse(parsed.brands);
  const promotions = Promotion.array().parse(parsed.promotions);

  await connectWithRetry();
  const counts = await persistScrape(brands, promotions);
  console.log(
    `seeded ${counts.brands} brands and ${counts.promotions} promotions from the fixture`,
  );
}

main()
  .catch((err) => {
    console.error("seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
