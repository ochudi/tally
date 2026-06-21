import express from "express";

const app = express();
const port = Number(process.env.API_PORT ?? 4000);

// Health check for the docker-compose healthcheck and a quick liveness probe.
// The full route layer lands in the API phase.
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "@tally/api" });
});

app.listen(port, () => {
  console.log(`api listening on http://localhost:${port}`);
});
