import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { About } from "@/components/sections/about";
import { Services } from "@/components/sections/services";
import { Work } from "@/components/sections/work";
import { Learning } from "@/components/sections/learning";
import { Contact } from "@/components/sections/contact";
import { ResumeDownload } from "@/components/sections/resume-download";
import { Trust } from "@/components/sections/trust";
import { Process } from "@/components/sections/process";
import { Showcase } from "@/components/sections/showcase";
import { Order } from "@/components/sections/order";
import { Faq } from "@/components/sections/faq";
import { ContentProvider } from "@/content/provider";
import { CommandMenu } from "@/components/command-menu";
import { SectionRail } from "@/components/section-rail";
import { Intro } from "@/components/intro";
import { getContent } from "@/content/read";
import { isLocale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionary";
import { siteUrl } from "@/lib/site";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = dictionaries[isLocale(lang) ? lang : "fa"];
  // Everything editable in the admin panel (/keystatic) comes from /content.
  const content = await getContent();
  const locale = isLocale(lang) ? lang : "fa";
  const { profile } = content;
  const me = profile[locale];

  // Structured data for search engines: who she is and where she works.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: t.name.full,
        alternateName: locale === "fa" ? dictionaries.en.name.full : dictionaries.fa.name.full,
        jobTitle: me.experience[0]?.title || t.role,
        description: t.meta.description,
        url: `${siteUrl}/${locale}`,
        image: profile.portrait ? `${siteUrl}${profile.portrait.src}` : undefined,
        email: `mailto:${profile.email}`,
        telephone: profile.phone.replace(/^0/, "+98"),
        worksFor: me.experience[0]?.org
          ? { "@type": "Organization", name: me.experience[0].org, url: profile.companyUrl }
          : undefined,
        alumniOf: me.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
        knowsLanguage: me.languages.map((l) => l.name),
        knowsAbout: profile.stack.flatMap((g) => g.items),
        sameAs: [profile.linkedin, profile.telegram && `https://t.me/${profile.telegram}`, profile.companyUrl].filter(Boolean),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: t.name.full,
        inLanguage: locale === "fa" ? "fa-IR" : "en",
        publisher: { "@id": `${siteUrl}/#person` },
      },
    ],
  };

  return (
    <ContentProvider value={content}>
      <CommandMenu>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
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
        <Trust />
        <Process />
        <Services />
        <Showcase />
        <Work />
        <Learning />
        <ResumeDownload />
        <Order />
        <Faq />
        <Contact />
      </main>
      </CommandMenu>
    </ContentProvider>
  );
}
