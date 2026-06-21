import type { Brand } from "@tally/shared";
import { hourCell, prettyUrl } from "../lib/format";
import {
  ArrowUpRight,
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from "./icons";

const DAYS = [
  ["mon", "Mon"],
  ["tue", "Tue"],
  ["wed", "Wed"],
  ["thu", "Thu"],
  ["fri", "Fri"],
  ["sat", "Sat"],
  ["sun", "Sun"],
] as const;

const SOCIALS = [
  ["instagram", InstagramIcon, "Instagram"],
  ["facebook", FacebookIcon, "Facebook"],
  ["x", XIcon, "X"],
  ["tiktok", TikTokIcon, "TikTok"],
  ["youtube", YouTubeIcon, "YouTube"],
] as const;

function HoursGrid({ hours }: { hours: Brand["hours"] }) {
  if (!hours) {
    return <p className="text-sm text-ink-subtle">Hours unavailable</p>;
  }
  return (
    <div className="grid grid-cols-4 gap-x-5 gap-y-2 sm:grid-cols-7">
      {DAYS.map(([key, label]) => {
        const value = hourCell(hours[key]);
        return (
          <div key={key} className="text-center">
            <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
              {label}
            </div>
            <div className={value ? "text-sm text-ink" : "text-sm text-ink-subtle"}>
              {value ?? "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Socials({ links }: { links: Brand["socialLinks"] }) {
  const present = SOCIALS.filter(([key]) => links[key]);
  if (present.length === 0) return null;
  return (
    <div className="flex items-center gap-3 text-[18px]">
      {present.map(([key, Icon, label]) => (
        <a
          key={key}
          href={links[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-ink-muted transition hover:text-ink"
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}

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

        <div className="flex shrink-0 flex-col gap-3 lg:items-end">
          {brand?.websiteUrl ? (
            <a
              href={brand.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-ink underline decoration-line underline-offset-4 transition hover:decoration-ink"
            >
              {prettyUrl(brand.websiteUrl)}
              <ArrowUpRight className="text-[14px] text-ink-muted" />
            </a>
          ) : (
            <span className="text-sm text-ink-subtle">No website listed</span>
          )}
          <Socials links={brand?.socialLinks ?? {}} />
        </div>
      </div>
    </div>
  );
}
