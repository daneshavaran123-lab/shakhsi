import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { site } from "@/data/site";
import "./globals.css";

const vazir = localFont({
  src: [
    { path: "../fonts/vazirmatn-arabic-wght-normal.woff2", weight: "100 900" },
    { path: "../fonts/vazirmatn-latin-wght-normal.woff2", weight: "100 900" },
  ],
  variable: "--font-vazir",
  display: "swap",
});

const markazi = localFont({
  src: [
    { path: "../fonts/markazi-text-arabic-wght-normal.woff2", weight: "400 700" },
    { path: "../fonts/markazi-text-latin-wght-normal.woff2", weight: "400 700" },
  ],
  variable: "--font-markazi",
  display: "swap",
});

const instrument = localFont({
  src: [
    { path: "../fonts/instrument-serif-latin-400-normal.woff2", style: "normal" },
    { path: "../fonts/instrument-serif-latin-400-italic.woff2", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = localFont({
  src: "../fonts/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    locale: "fa_IR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f1ede4",
};

// Opt into hidden-until-animated states before first paint, unless the
// visitor prefers reduced motion. Without JS, everything stays visible.
const motionScript = `if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('has-motion')`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazir.variable} ${markazi.variable} ${instrument.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
