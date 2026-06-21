import { PORTAL } from "../lib/portal";
import { SocialIcons, WebsiteLink } from "./brand-meta";

// Site footer. Surfaces the source portal's own website and socials, clearly
// attributed to the venue (the source does not publish per-brand socials).
export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-display text-lg text-ink">{PORTAL.name}</p>
          <div className="mt-1">
            <WebsiteLink url={PORTAL.url} />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-muted">Follow the mall</span>
          <SocialIcons links={PORTAL.socialLinks} />
        </div>
      </div>
    </footer>
  );
}
