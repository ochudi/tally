import type { Brand, SocialLinks } from "@tally/shared";
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

// A brand's opening hours as a compact per-day grid. Days with no listed hours
// read "—"; an entirely absent set shows a quiet note.
export function HoursGrid({ hours }: { hours: Brand["hours"] }) {
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

// A truncated-but-clickable website link, or a quiet note when none is listed.
export function WebsiteLink({ url }: { url: string | null }) {
  if (!url) return <span className="text-sm text-ink-subtle">No website listed</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={url}
      className="inline-flex max-w-full items-center gap-1 text-sm text-ink underline decoration-line underline-offset-4 transition hover:decoration-ink"
    >
      <span className="truncate">{prettyUrl(url)}</span>
      <ArrowUpRight className="shrink-0 text-[14px] text-ink-muted" />
    </a>
  );
}

// Social icons, rendered only for the platforms actually present. Returns null
// when there are none, so callers can decide what (if anything) to show instead.
export function SocialIcons({
  links,
  className = "",
}: {
  links: SocialLinks;
  className?: string;
}) {
  const present = SOCIALS.filter(([key]) => links[key]);
  if (present.length === 0) return null;
  return (
    <div className={`flex items-center gap-3 text-[18px] ${className}`}>
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

export function hasSocials(links: SocialLinks): boolean {
  return SOCIALS.some(([key]) => links[key]);
}
