import { Promotion } from "@tally/shared";

export default function Home() {
  // Proves the shared schemas resolve in the web app and survive a type check.
  // The real list UI lands in the UI phase.
  const fields = Object.keys(Promotion.shape).length;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Tally</h1>
      <p className="mt-2 text-gray-600">
        Scaffold is up. Shared package resolves: the Promotion schema has{" "}
        {fields} fields.
      </p>
    </main>
  );
}
