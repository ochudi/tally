"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, CloseIcon } from "./icons";

type View = "list" | "brand";

// The interactive island. Filters live in the URL, so the server component
// re-renders with fresh data and every state is shareable and back-button safe.
// useTransition keeps the old results visible (dimmed) while the next page loads.
export function FilterBar({
  q,
  date,
  view,
}: {
  q: string;
  date: string;
  view: View;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(q);
  // Keep the input in sync when navigation changes the URL elsewhere (e.g. clear).
  useEffect(() => setSearch(q), [q]);

  // Push a new URL from the current params plus overrides. Any filter change
  // resets pagination to page 1.
  const commit = (overrides: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  };

  // Debounce the search box so typing does not fire a request per keystroke.
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onSearch = (value: string) => {
    setSearch(value);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => commit({ q: value.trim() }), 300);
  };

  const hasFilters = Boolean(q || date);

  const segment = (target: View, label: string) => {
    const active = view === target;
    return (
      <button
        type="button"
        onClick={() => commit({ view: target === "list" ? null : target })}
        aria-pressed={active}
        className={`rounded-md px-3.5 py-1.5 text-sm transition ${
          active
            ? "bg-accent-soft font-medium text-accent-ink shadow-soft"
            : "text-ink-muted hover:text-ink"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={`flex flex-col gap-3 transition-opacity duration-200 sm:flex-row sm:items-center sm:justify-between ${
        isPending ? "opacity-60" : "opacity-100"
      }`}
    >
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-ink-subtle" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search sales or brands"
            aria-label="Search sales or brands"
            className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink shadow-soft outline-none transition placeholder:text-ink-subtle focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <label className="flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm shadow-soft">
          <span className="text-ink-subtle">Active on</span>
          <input
            type="date"
            value={date}
            onChange={(e) => commit({ date: e.target.value || null })}
            aria-label="Show sales active on date"
            className="bg-transparent text-ink outline-none"
          />
        </label>

        {hasFilters && (
          <button
            type="button"
            onClick={() => commit({ q: null, date: null })}
            className="inline-flex h-10 items-center gap-1 self-start rounded-lg px-2 text-sm text-ink-muted transition hover:text-ink sm:self-auto"
          >
            <CloseIcon className="text-[14px]" />
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 self-start rounded-lg border border-line bg-surface p-1 shadow-soft sm:self-auto">
        {segment("list", "All sales")}
        {segment("brand", "By brand")}
      </div>
    </div>
  );
}
