import type { ReactNode } from "react";

// Shared frame for the designed empty and error states: centered, calm, with room
// to breathe.
function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface px-6 py-20 text-center shadow-soft">
      {children}
    </div>
  );
}

export function EmptyState({
  hasFilters,
}: {
  hasFilters: boolean;
}) {
  return (
    <Panel>
      <p className="font-display text-xl text-ink">No sales match this</p>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        {hasFilters
          ? "Nothing fits the current search and date. Try a broader search or clear the filters."
          : "There are no sales to show right now. Run a scrape from the API to pull the latest, then refresh."}
      </p>
    </Panel>
  );
}

export function ErrorState() {
  return (
    <Panel>
      <p className="font-display text-xl text-ink">Could not load sales</p>
      <p className="mt-2 max-w-md text-sm text-ink-muted">
        The API did not respond. Check that it is running on its port and
        reachable, then refresh. If the list is empty but the API is up, it is
        usually a CORS or query-parameter issue.
      </p>
    </Panel>
  );
}
