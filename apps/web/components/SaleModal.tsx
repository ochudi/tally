"use client";

import { useEffect, useRef } from "react";
import type { Brand, Promotion } from "@tally/shared";
import { endChip } from "../lib/format";
import { HoursGrid, SocialIcons, WebsiteLink, hasSocials } from "./brand-meta";
import { ArrowUpRight, CloseIcon } from "./icons";

const longDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

// The sale detail view: a focused dialog over the current list. It surfaces the
// full promotion plus its brand block (hours, website, socials) and a primary
// action that opens the original deal on the source site.
export function SaleModal({
  promo,
  brand,
  onClose,
}: {
  promo: Promotion;
  brand: Brand | undefined;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const chip = endChip(promo.endDate);

  // Close on Escape, lock body scroll, and move focus into the dialog on open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const validity =
    promo.startDate && promo.endDate
      ? `${longDate.format(promo.startDate)} – ${longDate.format(promo.endDate)}`
      : promo.endDate
        ? `Through ${longDate.format(promo.endDate)}`
        : promo.startDate
          ? `From ${longDate.format(promo.startDate)}`
          : "Dates not listed";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={promo.name}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl bg-surface shadow-card sm:rounded-xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 text-ink-muted shadow-soft outline-none backdrop-blur transition hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
        >
          <CloseIcon className="text-[18px]" />
        </button>

        <div className="overflow-y-auto">
          {promo.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={promo.imageUrl}
              alt={promo.name}
              className="aspect-[16/10] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center bg-line/60">
              <span className="font-display text-4xl text-ink-subtle">
                {promo.brand.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
              {promo.brand.name}
            </p>
            <h2 className="mt-1.5 font-display text-2xl leading-tight text-ink">
              {promo.name}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${
                  chip.tone === "muted"
                    ? "border-line text-ink-subtle"
                    : "border-line text-ink"
                }`}
              >
                {chip.label}
              </span>
              <span className="text-ink-muted">{validity}</span>
            </div>

            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
              {promo.description ?? "No description provided for this sale."}
            </p>

            <div className="mt-6 border-t border-line pt-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
                {promo.brand.name}
              </p>
              <div className="mt-3">
                <HoursGrid hours={brand?.hours ?? null} />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <WebsiteLink url={brand?.websiteUrl ?? null} />
                {brand && hasSocials(brand.socialLinks) ? (
                  <SocialIcons links={brand.socialLinks} />
                ) : null}
              </div>
            </div>

            <a
              href={promo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-soft outline-none transition hover:bg-accent-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              View original deal
              <ArrowUpRight className="text-[15px]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
