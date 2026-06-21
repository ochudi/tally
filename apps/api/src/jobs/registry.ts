import { randomUUID } from "node:crypto";
import type { ScrapeJob, ScrapeSummary } from "@tally/shared";

// An in-process registry of scrape jobs: a Map keyed by jobId. This is the right
// shape for a single-node MVP. The trade-off is explicit (see DESIGN.md): state
// is lost on restart and does not survive horizontal scaling; production wants a
// queue or a jobs table. Named here, not built.
export class JobRegistry {
  private readonly jobs = new Map<string, ScrapeJob>();

  create(): ScrapeJob {
    const job: ScrapeJob = {
      jobId: randomUUID(),
      status: "pending",
      startedAt: new Date(),
      summary: null,
      error: null,
    };
    this.jobs.set(job.jobId, job);
    return job;
  }

  get(jobId: string): ScrapeJob | undefined {
    return this.jobs.get(jobId);
  }

  setStatus(jobId: string, status: ScrapeJob["status"]): void {
    const job = this.jobs.get(jobId);
    if (job) job.status = status;
  }

  setDone(jobId: string, summary: ScrapeSummary): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = "done";
      job.summary = summary;
    }
  }

  setFailed(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = "failed";
      job.error = error;
    }
  }
}

// One registry for the process.
export const jobRegistry = new JobRegistry();
