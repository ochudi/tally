import express from "express";
import { SHARED_PACKAGE, type Health } from "@tally/shared";

const app = express();
const port = Number(process.env.API_PORT ?? 4000);

app.get("/health", (_req, res) => {
  const body: Health = { ok: true, service: SHARED_PACKAGE };
  res.json(body);
});

app.listen(port, () => {
  console.log(`api listening on http://localhost:${port}`);
});
