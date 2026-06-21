import type { NextFunction, Request, Response } from "express";

// A minimal request logger: method, path, status, and duration once the response
// finishes. Enough to see traffic without pulling in a logging framework.
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  res.on("finish", () => {
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`,
    );
  });
  next();
}
