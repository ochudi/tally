import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import type { ApiError } from "@tally/shared";
import { HttpError } from "../lib/httpError.js";

// The one place an error becomes a response. A bad request (Zod) is a 400 with
// the issues; a typed HttpError carries its own status; anything else is a 500
// with a generic message and the real error logged, never leaked. Nothing here
// throws, so the process never crashes on a request (NFR-5).
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // next is required for Express to treat this as an error handler.
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const body: ApiError = { error: "Invalid request", details: err.issues };
    res.status(400).json(body);
    return;
  }
  if (err instanceof HttpError) {
    const body: ApiError = { error: err.message };
    res.status(err.status).json(body);
    return;
  }
  console.error("unhandled error:", err);
  const body: ApiError = { error: "Internal server error" };
  res.status(500).json(body);
}

// 404 for unmatched routes, in the same JSON shape.
export function notFoundHandler(_req: Request, res: Response): void {
  const body: ApiError = { error: "Not found" };
  res.status(404).json(body);
}
