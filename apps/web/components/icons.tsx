import type { SVGProps } from "react";

// Minimal line icons, sized by the parent's font-size (1em) and inheriting color.
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

// Social glyphs (filled, brand-neutral monochrome). Only rendered for platforms
// the brand actually lists.
const filled = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
};

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...filled} {...props}>
      <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.96.24 2.66.51.72.28 1.33.66 1.94 1.27.6.6.98 1.22 1.26 1.94.27.7.46 1.49.51 2.66.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.05 1.17-.24 1.96-.51 2.66a5.3 5.3 0 0 1-1.26 1.94 5.3 5.3 0 0 1-1.94 1.26c-.7.27-1.49.46-2.66.51-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.17-.05-1.96-.24-2.66-.51a5.3 5.3 0 0 1-1.94-1.26 5.3 5.3 0 0 1-1.27-1.94c-.27-.7-.46-1.49-.51-2.66C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.05-1.17.24-1.96.51-2.66.28-.72.66-1.34 1.27-1.94A5.3 5.3 0 0 1 5.99 1.24c.7-.27 1.49-.46 2.66-.51C9.95 2.2 10.35 2.2 12 2.2Zm0 1.8c-3.15 0-3.52.01-4.76.07-.9.04-1.38.19-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.13.33-.28.81-.32 1.71-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.9.19 1.38.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.33.13.81.28 1.71.32 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.9-.04 1.38-.19 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.13-.33.28-.81.32-1.71.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.9-.19-1.38-.32-1.71a2.86 2.86 0 0 0-.69-1.06 2.86 2.86 0 0 0-1.06-.69c-.33-.13-.81-.28-1.71-.32-1.24-.06-1.61-.07-4.76-.07Zm0 3.06a4.94 4.94 0 1 1 0 9.88 4.94 4.94 0 0 1 0-9.88Zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28Zm5.14-.34a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...filled} {...props}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...filled} {...props}>
      <path d="M17.53 3h2.94l-6.42 7.34L21.6 21h-5.9l-4.62-6.04L5.78 21H2.84l6.87-7.85L2.4 3h6.05l4.18 5.52L17.53 3Zm-1.03 16.2h1.63L7.6 4.7H5.85L16.5 19.2Z" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg {...filled} {...props}>
      <path d="M16.6 2c.33 2.06 1.5 3.41 3.5 3.66v2.45c-1.16.11-2.18-.27-3.36-.99v4.9c0 4.55-3.07 6.94-6.49 6.13-3.9-.93-5.06-5.55-2.43-8.13 1.07-1.05 2.51-1.42 4-1.14v2.6c-.34-.11-.7-.16-1.06-.13-1.4.12-2.18 1.32-1.72 2.63.43 1.23 2.04 1.61 3.06.73.5-.42.77-1.02.77-1.93V2h3.16Z" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg {...filled} {...props}>
      <path d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.5 4.6 12 4.6 12 4.6s-7.5 0-9.4.5A3 3 0 0 0 .5 7.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-4.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
    </svg>
  );
}
