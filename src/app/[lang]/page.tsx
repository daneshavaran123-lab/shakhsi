import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { About } from "@/components/sections/about";
import { Services } from "@/components/sections/services";
import { Work } from "@/components/sections/work";
import { Learning } from "@/components/sections/learning";
import { Contact } from "@/components/sections/contact";
import { ContentProvider } from "@/content/provider";
import { CommandMenu } from "@/components/command-menu";
import { SectionRail } from "@/components/section-rail";
import { Intro } from "@/components/intro";
import { getContent } from "@/content/read";
import { isLocale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionary";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = dictionaries[isLocale(lang) ? lang : "fa"];
  // Everything editable in the admin panel (/keystatic) comes from /content.
  const content = await getContent();

  return (
    <ContentProvider value={content}>
      <CommandMenu>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        {t.skip}
      </a>
      <Intro />
      <Header />
      <SectionRail />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Services />
        <Work />
        <Learning />
        <Contact />
      </main>
      </CommandMenu>
    </ContentProvider>
  );
}
