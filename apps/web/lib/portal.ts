import type { SocialLinks } from "@tally/shared";

// The single, hard-coded source portal's public profile. The brief allows
// hard-coding one portal, and these are the venue's own published handles (seen
// in the site footer on every page). They are the mall's, not any brand's — the
// source does not expose per-brand socials, so brand cards/headers stay
// honestly empty while these power the site footer. See ASSUMPTIONS.md.
export const PORTAL: {
  name: string;
  url: string;
  socialLinks: SocialLinks;
} = {
  name: "The Promenade Shops at Briargate",
  url: "https://www.thepromenadeshopsatbriargate.com",
  socialLinks: {
    instagram: "https://www.instagram.com/shopsbriargate/",
    facebook: "https://www.facebook.com/ShopsBriargate/",
    x: "https://x.com/ShopsBriargate/",
  },
};
