import { createApp } from "./app.js";
import { connectWithRetry, prisma } from "./db/client.js";

const port = Number(process.env.API_PORT ?? 4000);

async function main(): Promise<void> {
  // Connect before listening, with a short retry for the docker startup race.
  await connectWithRetry();

  const app = createApp();
  const server = app.listen(port, () => {
    console.log(`api listening on http://localhost:${port}`);
  });

  // Close cleanly so Postgres connections are released.
  const shutdown = async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("api failed to start:", err);
  process.exit(1);
});
