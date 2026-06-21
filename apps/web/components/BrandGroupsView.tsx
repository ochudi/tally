import type { Brand, Promotion } from "@tally/shared";
import { fetchBrands, fetchPromotions } from "../lib/api";
import { BrandHeader } from "./BrandHeader";
import { PromoCard } from "./PromoCard";
import { EmptyState, ErrorState } from "./states";

// The brand view shows every matching sale at once, grouped under its brand, so a
// large page covers the whole (small) catalogue without pagination here.
const ALL = 100;

// Async server component: fetch the matching promotions and the brand metadata,
// group the promotions by brand, and render a designed block per brand followed
// by that brand's cards.
export async function BrandGroupsView({
  q,
  date,
}: {
  q: string;
  date: string;
}) {
  let promotions: Promotion[];
  let brands: Brand[];
  try {
    const [list, brandList] = await Promise.all([
      fetchPromotions({ q, date, pageSize: ALL }),
      fetchBrands(),
    ]);
    promotions = list.data;
    brands = brandList;
  } catch {
    return <ErrorState />;
  }

  if (promotions.length === 0) {
    return <EmptyState hasFilters={Boolean(q || date)} />;
  }

  const metaBySlug = new Map(brands.map((b) => [b.slug, b]));
  const groups = new Map<string, { name: string; items: Promotion[] }>();
  for (const promo of promotions) {
    const slug = promo.brand.slug;
    const group = groups.get(slug);
    if (group) group.items.push(promo);
    else groups.set(slug, { name: promo.brand.name, items: [promo] });
  }

  const ordered = [...groups.entries()].sort((a, b) =>
    a[1].name.localeCompare(b[1].name),
  );

  return (
    <div className="space-y-14">
      {ordered.map(([slug, group]) => (
        <section key={slug} className="space-y-5">
          <BrandHeader
            brand={metaBySlug.get(slug)}
            name={group.name}
            count={group.items.length}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((promo) => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
