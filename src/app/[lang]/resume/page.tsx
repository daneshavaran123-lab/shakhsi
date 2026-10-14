import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { CommandMenu } from "@/components/command-menu";
import { ResumeToolbar } from "@/components/resume-toolbar";
import { ContentProvider } from "@/content/provider";
import { getContent } from "@/content/read";
import { isLocale, locales, num, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionary";
import { formatPhone } from "@/lib/phone";
import { pageHref } from "@/lib/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = dictionaries[lang];
  return { title: `${t.resume.title} — ${t.name.full}`, description: t.meta.description };
}

/**
 * One-page résumé built from the same content as the site: readable on
 * screen, and laid out for A4 when printed or saved as PDF.
 */
export default async function ResumePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const t = dictionaries[locale];
  const content = await getContent();
  const { profile, projects, certificates, services } = content;
  const copy = profile[locale];
  const phone = formatPhone(profile.phone, locale);
  const home = pageHref(locale);
  const n = (v: string | number) => num(locale, v);
  const domain = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

  const contacts = [
    { label: profile.email, href: `mailto:${profile.email}`, ltr: true },
    phone && { label: phone.display, href: phone.href, ltr: true },
    profile.telegram && { label: `t.me/${profile.telegram}`, href: `https://t.me/${profile.telegram}`, ltr: true },
    profile.linkedin && { label: "linkedin.com/in/narges-tabatabaii", href: profile.linkedin, ltr: true },
    profile.companyUrl && { label: domain(profile.companyUrl), href: profile.companyUrl, ltr: true },
  ].filter((c): c is { label: string; href: string; ltr: boolean } => !!c);

  return (
    <ContentProvider value={content}>
      <CommandMenu page="resume">
        <ResumeToolbar />
        <main className="resume px-4 pt-24 pb-20 sm:px-6 print:p-0">
          <article className="resume-sheet edge mx-auto max-w-[62rem] overflow-hidden rounded-3xl bg-card/60 print:max-w-none print:rounded-none print:bg-transparent">
            {/* Masthead */}
            <header className="grid gap-8 border-b p-8 sm:grid-cols-[auto_1fr] sm:items-center md:p-12 print:gap-5 print:p-5">
              {profile.portrait && (
                <Image
                  src={profile.portrait}
                  alt={t.name.full}
                  width={160}
                  height={160}
                  placeholder="blur"
                  priority
                  className="size-28 rounded-2xl object-cover object-[50%_30%] md:size-36 print:size-24"
                />
              )}
              <div>
                <p className="text-xs text-accent">{t.resume.title}</p>
                <h1 className="mt-2 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.95] print:text-4xl">{t.name.full}</h1>
                <p className="mt-3 text-lg text-foreground-2">
                  {copy.experience[0]?.title}
                  {copy.experience[0]?.org && ` — ${copy.experience[0].org}`}
                </p>
              </div>
            </header>

            <div className="grid md:grid-cols-[18rem_1fr] print:grid-cols-[200px_1fr]">
              {/* Sidebar */}
              <aside className="space-y-9 border-b p-8 md:border-e md:border-b-0 md:p-10 print:space-y-6 print:border-e print:border-b-0 print:p-5">
                <Block title={t.resume.contact}>
                  <ul className="space-y-2 text-sm">
                    {contacts.map((c) => (
                      <li key={c.href}>
                        <a href={c.href} className={`link-draw [overflow-wrap:anywhere] print:text-[10px] ${c.ltr ? "ltr inline-block" : ""}`}>
                          {c.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block title={t.resume.skills}>
                  <ul className="space-y-3 text-sm">
                    {profile.stack.map((g) => (
                      <li key={g.group}>
                        <span className="block text-xs text-muted-foreground">{locale === "fa" ? g.group : g.groupEn}</span>
                        <span className="ltr block">{g.items.join(" · ")}</span>
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block title={t.resume.education}>
                  <ul className="space-y-3 text-sm">
                    {copy.education.map((e) => (
                      <li key={e.degree}>
                        <span className="block font-medium">{e.degree}</span>
                        <span className="text-muted-foreground">{e.school}</span>
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block title={t.resume.languages}>
                  <ul className="space-y-1 text-sm">
                    {copy.languages.map((l) => (
                      <li key={l.name} className="flex justify-between gap-3">
                        <span>{l.name}</span>
                        <span className="text-muted-foreground">{l.level}</span>
                      </li>
                    ))}
                  </ul>
                </Block>
              </aside>

              {/* Main column */}
              <div className="space-y-10 p-8 md:p-10 print:space-y-4 print:p-5">
                <Block title={t.resume.summary}>
                  <p className="leading-8 text-foreground-2 print:leading-6">{copy.bio}</p>
                </Block>

                <Block title={t.resume.experience}>
                  <ol className="relative space-y-5 border-s ps-5 print:space-y-2">
                    {copy.experience.map((e) => (
                      <li key={e.title + e.org} className="relative">
                        <span className="absolute -start-[1.6rem] top-2 size-2.5 rounded-full bg-accent ring-4 ring-background print:ring-white" />
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                          <h3 className="font-display text-2xl print:text-lg">{e.title}</h3>
                          {e.period && <span className="font-mono text-xs text-muted-foreground">{e.period}</span>}
                        </div>
                        {e.org &&
                          (e.url ? (
                            <a href={e.url} className="link-draw text-sm text-muted-foreground">
                              {e.org} ↗
                            </a>
                          ) : (
                            <p className="text-sm text-muted-foreground">{e.org}</p>
                          ))}
                      </li>
                    ))}
                  </ol>
                </Block>

                <Block title={t.resume.approach}>
                  <ul className="grid gap-3 sm:grid-cols-3 print:grid-cols-3">
                    {copy.principles.map((p) => (
                      <li key={p.title} className="rounded-xl bg-foreground/[0.04] p-4 print:p-2">
                        <span className="block font-medium">{p.title}</span>
                        <span className="mt-1 block text-sm leading-6 text-muted-foreground print:text-xs">{p.body}</span>
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block title={t.resume.projects}>
                  <ul className="divide-y">
                    {projects.map((p) => (
                      <li key={p.id} className="py-3 first:pt-0 print:py-1.5">
                        <a href={`${home}#project-${p.id}`} className="group block print:pointer-events-none">
                          <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                            <span className="font-medium transition-colors group-hover:text-accent">{p[locale].title}</span>
                            {p[locale].client && <span className="text-xs text-muted-foreground">{p[locale].client}</span>}
                          </span>
                          <span className="mt-0.5 block text-sm leading-6 text-muted-foreground print:hidden">
                            {p[locale].summary}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block title={t.resume.certificates}>
                  <ul className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 print:grid-cols-2">
                    {certificates.map((c) => (
                      <li key={c.id} className="flex justify-between gap-3">
                        <span>
                          {c[locale].title}
                          <span className="block text-xs text-muted-foreground">{c[locale].issuer}</span>
                        </span>
                        {c.hours && (
                          <span className="shrink-0 font-mono text-xs text-muted-foreground">
                            {n(c.hours)} {t.resume.hours}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </Block>

                <Block title={t.resume.services} className="print:hidden">
                  <p className="text-sm leading-7 text-foreground-2">
                    {services[locale].items.map((s) => s.title).join(" · ")}
                  </p>
                </Block>
              </div>
            </div>
          </article>
        </main>
      </CommandMenu>
    </ContentProvider>
  );
}

function Block({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`resume-block ${className ?? ""}`}>
      <h2 className="mb-3 flex items-center gap-2 text-xs text-accent">
        <span className="h-px w-5 bg-accent" />
        {title}
      </h2>
      {children}
    </section>
  );
}
