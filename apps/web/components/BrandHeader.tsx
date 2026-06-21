import type { Brand } from "@tally/shared";
import { HoursGrid, SocialIcons, WebsiteLink } from "./brand-meta";

// The designed brand block that heads each group: name, deal count, hours grid,
// website, and any socials the brand lists. Missing fields show a quiet empty
// note, never a blank.
export function BrandHeader({
  brand,
  name,
  count,
}: {
  brand: Brand | undefined;
  name: string;
  count: number;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-6 shadow-soft sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-display text-2xl leading-tight text-ink">{name}</h2>
        <span className="text-sm text-ink-muted">
          {count} {count === 1 ? "sale" : "sales"}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-5 border-t border-line pt-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
        <div className="min-w-0 flex-1">
          <HoursGrid hours={brand?.hours ?? null} />
        </div>

        <div className="flex min-w-0 max-w-full flex-col gap-3 lg:max-w-[18rem] lg:items-end">
          <WebsiteLink url={brand?.websiteUrl ?? null} />
          <SocialIcons links={brand?.socialLinks ?? {}} />
        </div>
      </div>
    </div>
  );
}
