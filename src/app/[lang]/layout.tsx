import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";

import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { SoundProvider } from "@/components/providers/sound";
import { themeScript } from "@/components/providers/theme";
import { Cursor } from "@/components/cursor";
import { dirOf, isLocale, locales } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionary";
import { I18nProvider } from "@/i18n/provider";
import { siteUrl } from "@/lib/site";
import "../globals.css";

const vazir = localFont({
  src: [
    { path: "../../fonts/vazirmatn-arabic-wght-normal.woff2", weight: "100 900" },
    { path: "../../fonts/vazirmatn-latin-wght-normal.woff2", weight: "100 900" },
  ],
  variable: "--font-vazir",
  display: "swap",
});

const markazi = localFont({
  src: [
    { path: "../../fonts/markazi-text-arabic-wght-normal.woff2", weight: "400 700" },
    { path: "../../fonts/markazi-text-latin-wght-normal.woff2", weight: "400 700" },
  ],
  variable: "--font-markazi",
  display: "swap",
});

const geist = localFont({
  src: "../../fonts/geist-variable.woff2",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

const instrument = localFont({
  src: [
    { path: "../../fonts/instrument-serif-latin-400-normal.woff2", style: "normal" },
    { path: "../../fonts/instrument-serif-latin-400-italic.woff2", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = localFont({
  src: "../../fonts/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = dictionaries[lang];
  return {
    metadataBase: new URL(siteUrl),
    title: t.meta.title,
    description: t.meta.description,
    alternates: { canonical: `/${lang}`, languages: { fa: "/fa", en: "/en" } },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      siteName: t.name.full,
      locale: lang === "fa" ? "fa_IR" : "en_US",
      type: "website",
      url: `/${lang}`,
      images: [{ url: `/og/${lang}.png`, width: 1200, height: 630, alt: t.name.full }],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description, images: [`/og/${lang}.png`] },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      dir={dirOf(lang)}
      data-theme="dark"
      className={`${vazir.variable} ${markazi.variable} ${geist.variable} ${instrument.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <I18nProvider locale={lang}>
          <SoundProvider>
            <SmoothScroll>{children}</SmoothScroll>
          </SoundProvider>
          <Cursor />
        </I18nProvider>
        {/* Vercel Web Analytics: only in Vercel builds (enable it in the dashboard); skipped elsewhere. */}
        {process.env.VERCEL && !process.env.NEXT_PUBLIC_STATIC_HTML && <Analytics />}
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
