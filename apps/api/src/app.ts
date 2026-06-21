import express, { type Express } from "express";
import { cors } from "./middleware/cors.js";
import { requestLogger } from "./middleware/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { router } from "./routes/index.js";

// Build the Express app. Kept separate from the server start so it can be
// constructed in tests without binding a port.
export function createApp(): Express {
  const app = express();

  app.use(cors);
  app.use(requestLogger);
  app.use(express.json());

  app.use(router);

  // Unmatched routes and then the error handler, both as JSON.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
