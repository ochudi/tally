// Presentation helpers. Kept pure so the components stay declarative.

const monthDay = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export type EndChip = {
  label: string;
  tone: "default" | "urgent" | "muted";
};

// Turn an end date into a short, human chip. Monochrome by design: urgency is
// carried by wording and weight, not a second color.
export function endChip(end: Date | null, now: Date = new Date()): EndChip {
  if (!end) return { label: "No end date", tone: "muted" };

  const days = Math.round(
    (startOfDay(end).getTime() - startOfDay(now).getTime()) / 86_400_000,
  );

  if (days < 0) return { label: `Ended ${monthDay.format(end)}`, tone: "muted" };
  if (days === 0) return { label: "Ends today", tone: "urgent" };
  if (days === 1) return { label: "Ends tomorrow", tone: "urgent" };
  return { label: `Ends ${monthDay.format(end)}`, tone: "default" };
}

// "10:00" -> "10", "11:30" -> "11:30", "20:00" -> "8". Compact 12-hour, minutes
// only when not on the hour. Used in the small hours grid where the column
// context (a row of days) makes am/pm obvious.
function shortTime(value: string): string {
  const [hStr, mStr] = value.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}` : `${h12}:${mStr}`;
}

// "10:00-20:00" -> "10–8". Returns null for a closed/absent day.
export function hourCell(value: string | null): string | null {
  if (!value) return null;
  const [open, close] = value.split("-");
  if (!open || !close) return null;
  return `${shortTime(open)}–${shortTime(close)}`;
}

// Strip the scheme and trailing slash for a tidy website label.
export function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
