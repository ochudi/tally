// Date parsing is where records die (trap 07). The deal detail page exposes only
// an end date, and only as a human notice ("Ends Today", "Ends 7/1", "Ends
// Thursday"). This single helper turns that notice into a real Date, or returns
// null so the caller can null the field and count the failure rather than guess.

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

// The next calendar date (today included) whose weekday matches `target`.
function nextWeekday(from: Date, target: number): Date {
  const delta = (target - from.getDay() + 7) % 7;
  const d = new Date(from);
  d.setDate(from.getDate() + delta);
  return endOfDay(d);
}

// Parse a deal end notice relative to `now` (the scrape time). Returns null for
// anything we cannot parse confidently.
export function parseEndsNotice(
  notice: string | null | undefined,
  now: Date,
): Date | null {
  if (!notice) return null;
  const text = notice.toLowerCase().replace(/\s+/g, " ").trim();
  if (!text.includes("end")) return null;

  if (text.includes("today")) return endOfDay(now);
  if (text.includes("tomorrow")) {
    const d = new Date(now);
    d.setDate(now.getDate() + 1);
    return endOfDay(d);
  }

  // "Ends 7/1" or "Ends 7/1/26" or "Ends 7/1/2026".
  const md = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (md) {
    const month = Number(md[1]) - 1;
    const day = Number(md[2]);
    let year: number;
    if (md[3]) {
      const y = Number(md[3]);
      year = y < 100 ? 2000 + y : y;
    } else {
      // No year given: assume this year, but roll to next year if it already
      // passed, so an end date is never in the past.
      year = now.getFullYear();
      const candidate = new Date(year, month, day);
      if (endOfDay(candidate).getTime() < endOfDay(now).getTime()) year += 1;
    }
    const parsed = new Date(year, month, day);
    if (parsed.getMonth() !== month || parsed.getDate() !== day) return null;
    return endOfDay(parsed);
  }

  // "Ends Thursday" and the like.
  const wd = WEEKDAYS.findIndex((name) => text.includes(name));
  if (wd !== -1) return nextWeekday(now, wd);

  return null;
}
