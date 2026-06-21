"use client";

import { useEffect } from "react";
import "./globals.css";

// Last-resort boundary for errors in the root layout itself. It must render its
// own <html>/<body>, so it cannot use the normal layout or fonts; it falls back
// to the theme's serif/sans stacks, which is fine for a rare failure.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas font-sans text-ink antialiased">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-4xl text-ink">Something went wrong</h1>
          <p className="mt-4 max-w-md text-[15px] text-ink-muted">
            The app failed to load. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-ink"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
