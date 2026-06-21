import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// Editorial display serif for the wordmark and brand headers; a warm grotesk for
// everything else. Loaded as CSS variables the Tailwind theme references.
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tally — sales at The Promenade Shops",
  description: "What is on sale at the mall right now, grouped by brand.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-canvas font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
