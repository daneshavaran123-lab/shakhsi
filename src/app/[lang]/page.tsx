import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { About } from "@/components/sections/about";
import { Work } from "@/components/sections/work";
import { Learning } from "@/components/sections/learning";
import { Contact } from "@/components/sections/contact";
import { isLocale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionary";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = dictionaries[isLocale(lang) ? lang : "fa"];

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        {t.skip}
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Work />
        <Learning />
        <Contact />
      </main>
    </>
  );
}
