import { persistScrape } from "../db/persist.js";
import { jobRegistry } from "../jobs/registry.js";
import { runScrape } from "../scraper/pipeline.js";

// Start a scrape in the background and return its jobId immediately. The scrape
// is far longer than any HTTP timeout (trap 06), so the handler must not await
// it: this fire-and-forget function returns at once and the registry carries the
// status and summary for GET /scrape/:jobId to poll.
export function startScrape(): string {
  const job = jobRegistry.create();

  void (async () => {
    jobRegistry.setStatus(job.jobId, "running");
    try {
      const { brands, promotions, summary } = await runScrape();
      await persistScrape(brands, promotions);
      jobRegistry.setDone(job.jobId, summary);
    } catch (err) {
      jobRegistry.setFailed(job.jobId, (err as Error).message);
      console.error(`scrape job ${job.jobId} failed:`, err);
    }
  })();

  return job.jobId;
}
