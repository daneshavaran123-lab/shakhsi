import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CommandMenu } from "@/components/command-menu";
import { CaseStudy } from "@/components/case-study";
import { ContentProvider } from "@/content/provider";
import { getContent } from "@/content/read";
import { isLocale, locales } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionary";

export const dynamicParams = false;

export async function generateStaticParams() {
  const { projects } = await getContent();
  return locales.flatMap((lang) => projects.map((p) => ({ lang, id: p.id })));
}

type Params = { params: Promise<{ lang: string; id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isLocale(lang)) return {};
  const project = (await getContent()).projects.find((p) => p.id === id);
  if (!project) return {};
  const copy = project[lang];
  const t = dictionaries[lang];
  return {
    title: `${copy.title} — ${t.name.full}`,
    description: copy.summary || copy.intro,
    alternates: { canonical: `/${lang}/work/${id}`, languages: { fa: `/fa/work/${id}`, en: `/en/work/${id}` } },
    openGraph: { title: copy.title, description: copy.summary || copy.intro, images: project.images[0] ? [project.images[0].src] : [] },
  };
}

/** A full page per project: the story, the hardware, the gallery, the next one. */
export default async function WorkPage({ params }: Params) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const content = await getContent();
  if (!content.projects.some((p) => p.id === id)) notFound();

  return (
    <ContentProvider value={content}>
      <CommandMenu page={`work/${id}`}>
        <CaseStudy id={id} />
      </CommandMenu>
    </ContentProvider>
  );
}
