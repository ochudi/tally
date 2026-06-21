import type { Brand } from "@tally/shared";
import { fetchBrands, fetchPromotions } from "../lib/api";
import { PromoCard } from "./PromoCard";
import { Pagination } from "./Pagination";
import { EmptyState, ErrorState } from "./states";

const PAGE_SIZE = 12;

// Async server component: fetch one page of promotions and render the grid, the
// result count, and pagination. Empty and error are designed states, not blanks.
export async function PromoListView({
  q,
  date,
  page,
}: {
  q: string;
  date: string;
  page: number;
}) {
  let list;
  let brands: Brand[] = [];
  try {
    // Brands carry the metadata the detail modal shows; a brands failure should
    // not break the list, so it is fetched best-effort.
    [list, brands] = await Promise.all([
      fetchPromotions({ q, date, page, pageSize: PAGE_SIZE }),
      fetchBrands().catch(() => []),
    ]);
  } catch {
    return <ErrorState />;
  }

  if (list.total === 0) {
    return <EmptyState hasFilters={Boolean(q || date)} />;
  }

  const brandBySlug = new Map(brands.map((b) => [b.slug, b]));

  const first = (list.page - 1) * list.pageSize + 1;
  const last = Math.min(list.page * list.pageSize, list.total);

  const makeHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (date) params.set("date", date);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <div>
      <p className="mb-5 text-sm text-ink-muted">
        Showing {first}–{last} of {list.total} sales
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.data.map((promo) => (
          <PromoCard
            key={promo.id}
            promo={promo}
            brand={brandBySlug.get(promo.brand.slug)}
          />
        ))}
      </div>
      <Pagination
        page={list.page}
        totalPages={list.totalPages}
        makeHref={makeHref}
      />
    </div>
  );
}
