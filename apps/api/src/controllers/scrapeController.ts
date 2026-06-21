import type { Request, Response } from "express";
import type { ScrapeAccepted } from "@tally/shared";
import { jobRegistry } from "../jobs/registry.js";
import { startScrape } from "../services/scrapeService.js";
import { notFound } from "../lib/httpError.js";

// POST /scrape: kick off a background scrape and return 202 + jobId at once.
export async function postScrape(_req: Request, res: Response): Promise<void> {
  const jobId = startScrape();
  const body: ScrapeAccepted = { jobId };
  res.status(202).json(body);
}

// GET /scrape/:jobId: report status and, once done, the summary.
export async function getScrape(req: Request, res: Response): Promise<void> {
  const job = jobRegistry.get(req.params.jobId ?? "");
  if (!job) throw notFound(`No scrape job with id ${req.params.jobId}`);
  res.json(job);
}
