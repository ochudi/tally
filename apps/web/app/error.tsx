"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  FullPageMessage,
  primaryAction,
  secondaryAction,
} from "../components/FullPageMessage";

// Catches unexpected errors thrown while rendering the route. Data-fetch failures
// are already handled inline as a designed state inside the views; this is the
// backstop so the app degrades gracefully instead of showing a blank screen.
export default function Error({
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
    <FullPageMessage
      eyebrow="Something went wrong"
      title="This page hit a snag"
      body="An unexpected error stopped this from loading. Try again, and if it keeps happening the API is the most likely cause."
    >
      <button type="button" onClick={reset} className={primaryAction}>
        Try again
      </button>
      <Link href="/" className={secondaryAction}>
        Back to sales
      </Link>
    </FullPageMessage>
  );
}
