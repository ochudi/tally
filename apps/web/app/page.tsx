import { Suspense } from "react";
import { FilterBar } from "../components/FilterBar";
import { PromoListView } from "../components/PromoListView";
import { BrandGroupsView } from "../components/BrandGroupsView";
import { Footer } from "../components/Footer";
import {
  BrandGroupsSkeleton,
  CardGridSkeleton,
} from "../components/skeletons";

// Read once, render dynamically: filters come from the URL.
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = first(sp.q).trim();
  const date = first(sp.date);
  const view = first(sp.view) === "brand" ? "brand" : "list";
  const page = Math.max(1, Number(first(sp.page)) || 1);

  // Re-suspend on any change so skeletons show while the next view loads.
  const key = `${view}|${q}|${date}|${page}`;

  return (
    <>
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-9">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-subtle">
          The Promenade Shops at Briargate
        </p>
        <h1 className="mt-2 font-display text-4xl leading-none text-ink sm:text-5xl">
          On sale now
        </h1>
        <p className="mt-3 max-w-xl text-[15px] text-ink-muted">
          Every current deal at the mall, in one place. Search, filter by date,
          or group by brand to see store hours and links.
        </p>
      </header>

      <div className="sticky top-0 z-10 -mx-5 mb-8 border-b border-line bg-canvas/85 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <FilterBar q={q} date={date} view={view} />
      </div>

      <Suspense
        key={key}
        fallback={
          view === "brand" ? <BrandGroupsSkeleton /> : <CardGridSkeleton />
        }
      >
        {view === "brand" ? (
          <BrandGroupsView q={q} date={date} />
        ) : (
          <PromoListView q={q} date={date} page={page} />
        )}
      </Suspense>
    </main>
    <Footer />
    </>
  );
}
