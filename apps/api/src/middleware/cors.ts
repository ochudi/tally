import type { NextFunction, Request, Response } from "express";

// Permissive CORS for local development. The web app runs on a different port
// than the API, so without this the browser blocks every read (trap 10). Auth is
// a non-goal, so open access is fine here; production would scope the origin.
export function cors(req: Request, res: Response, next: NextFunction): void {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
}
