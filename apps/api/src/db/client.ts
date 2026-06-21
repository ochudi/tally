import { PrismaClient } from "@prisma/client";

// One Prisma client for the process. Reused across requests and the scraper.
export const prisma = new PrismaClient();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The API can boot before Postgres is ready, especially under docker-compose
// (trap 09). The compose healthcheck covers most of it; this short retry covers
// the gap so first connect doesn't fail with ECONNREFUSED on a cold start.
export async function connectWithRetry(
  attempts = 5,
  delayMs = 1000,
): Promise<void> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await prisma.$connect();
      return;
    } catch (err) {
      if (attempt === attempts) throw err;
      console.warn(
        `db connect failed (attempt ${attempt}/${attempts}), retrying in ${delayMs}ms`,
      );
      await sleep(delayMs);
    }
  }
}
