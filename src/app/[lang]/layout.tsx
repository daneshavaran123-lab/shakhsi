import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";

import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { themeScript } from "@/components/providers/theme";
import { Cursor } from "@/components/cursor";
import { dirOf, isLocale, locales } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionary";
import { I18nProvider } from "@/i18n/provider";
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
    title: t.meta.title,
    description: t.meta.description,
    alternates: { languages: { fa: "/fa", en: "/en" } },
    openGraph: {
      title: t.name.full,
      description: t.meta.description,
      locale: lang === "fa" ? "fa_IR" : "en_US",
      type: "website",
    },
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
          <SmoothScroll>{children}</SmoothScroll>
          <Cursor />
        </I18nProvider>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
