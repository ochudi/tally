import type { NextFunction, Request, Response } from "express";

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Wrap an async route so a rejected promise reaches the error middleware instead
// of becoming an unhandled rejection. Express 4 does not await handlers.
export const asyncHandler =
  (handler: Handler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
