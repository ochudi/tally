import type { ReactNode } from "react";

// A centered, on-brand frame for full-page states (404, unexpected error). Plain
// presentational markup so it works inside both server and client pages.
export function FullPageMessage({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow?: string;
  title: string;
  body: ReactNode;
  children?: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-subtle">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
        {body}
      </p>
      {children ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {children}
        </div>
      ) : null}
    </main>
  );
}

// Shared button looks. The primary action is the one place these pages use the
// accent; the secondary stays quiet.
export const primaryAction =
  "inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-soft outline-none transition hover:bg-accent-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

export const secondaryAction =
  "inline-flex items-center rounded-lg px-4 py-2 text-sm text-ink-muted underline decoration-line underline-offset-4 transition hover:text-ink hover:decoration-ink";
