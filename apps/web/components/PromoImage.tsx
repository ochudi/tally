"use client";

import { useState } from "react";

// A plain <img> with a designed fallback. The promo images come from a CDN we do
// not control, so a missing or broken source falls back to a monochrome panel
// carrying the brand's initial rather than a broken-image icon.
export function PromoImage({
  src,
  alt,
  brand,
}: {
  src: string | null;
  alt: string;
  brand: string;
}) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  if (showFallback) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-line/60">
        <span className="font-display text-3xl text-ink-subtle">
          {brand.trim().charAt(0).toUpperCase() || "•"}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-[4/3] w-full object-cover transition duration-200 group-hover:scale-[1.03]"
    />
  );
}
