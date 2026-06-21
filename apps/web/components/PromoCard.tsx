import type { Promotion } from "@tally/shared";
import { endChip } from "../lib/format";
import { ArrowUpRight } from "./icons";
import { PromoImage } from "./PromoImage";

const chipTone: Record<string, string> = {
  default: "border-line text-ink",
  urgent: "border-ink/15 text-ink font-medium",
  muted: "border-line text-ink-subtle",
};

// One promotion. The whole card links to the original deal page; brand context
// sits above the name, the end-date chip and an external hint below.
export function PromoCard({ promo }: { promo: Promotion }) {
  const chip = endChip(promo.endDate);

  return (
    <a
      href={promo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-soft outline-none transition duration-200 hover:shadow-card focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      <div className="overflow-hidden">
        <PromoImage
          src={promo.imageUrl}
          alt={promo.name}
          brand={promo.brand.name}
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
          {promo.brand.name}
        </p>
        <h3 className="clamp-2 mt-1.5 text-[15px] font-medium leading-snug text-ink">
          {promo.name}
        </h3>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${chipTone[chip.tone]}`}
          >
            {chip.label}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-ink-muted transition group-hover:text-ink">
            View
            <ArrowUpRight className="text-[14px]" />
          </span>
        </div>
      </div>
    </a>
  );
}
