import Link from "next/link";

// Page navigation that preserves the current filters. Server-rendered links, so
// no client JS; the current page is a solid ink pill, the rest hairline-bordered.
export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  // A compact window of pages around the current one.
  const pages: number[] = [];
  const from = Math.max(1, page - 2);
  const to = Math.min(totalPages, page + 2);
  for (let p = from; p <= to; p++) pages.push(p);

  const arrow =
    "inline-flex h-9 items-center rounded-lg border border-line px-3 text-sm text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:text-ink-subtle disabled:hover:bg-transparent";

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <Link href={makeHref(page - 1)} className={arrow} rel="prev">
          Previous
        </Link>
      ) : (
        <span className={arrow} aria-disabled>
          Previous
        </span>
      )}

      <div className="mx-1 flex items-center gap-1">
        {pages.map((p) => {
          const active = p === page;
          return (
            <Link
              key={p}
              href={makeHref(p)}
              aria-current={active ? "page" : undefined}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm transition ${
                active
                  ? "bg-ink text-canvas"
                  : "border border-line text-ink hover:bg-surface"
              }`}
            >
              {p}
            </Link>
          );
        })}
      </div>

      {page < totalPages ? (
        <Link href={makeHref(page + 1)} className={arrow} rel="next">
          Next
        </Link>
      ) : (
        <span className={arrow} aria-disabled>
          Next
        </span>
      )}
    </nav>
  );
}
