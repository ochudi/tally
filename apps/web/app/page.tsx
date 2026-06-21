import { SHARED_PACKAGE, type Health } from "@tally/shared";

export default function Home() {
  // Proves the shared types resolve in the web app and survive a type check.
  const health: Health = { ok: true, service: SHARED_PACKAGE };

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Tally</h1>
      <p className="mt-2 text-gray-600">
        Scaffold is up. Shared package resolves: {health.service} (
        {health.ok ? "ok" : "down"}).
      </p>
    </main>
  );
}
