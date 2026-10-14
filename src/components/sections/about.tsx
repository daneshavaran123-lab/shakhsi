"use client";

import { useRef } from "react";
import Image from "next/image";

import { Split } from "@/components/motion/split";
import { SectionLabel } from "@/components/section-label";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useI18n } from "@/i18n/provider";
import { useContent } from "@/content/provider";

export function About() {
  const { t, n, locale } = useI18n();
  const { profile } = useContent();
  const copy = profile[locale];
  const root = useRef<HTMLElement>(null);
  useSectionMotion(root);

  return (
    <section ref={root} id="about" className="px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto grid max-w-[100rem] gap-12 md:grid-cols-12">
        <div className="flex flex-col gap-10 md:col-span-4 lg:col-span-3">
          <SectionLabel index={n("01")}>{t.about.label}</SectionLabel>

          {profile.portrait && (
            <figure className="w-2/3 max-w-xs md:sticky md:top-28 md:w-full">
              <div
                data-portrait
                className="edge relative aspect-[4/5] overflow-hidden rounded-2xl bg-card shadow-[0_30px_80px_-30px_var(--glow)]"
              >
                <Image
                  data-parallax="0.08"
                  src={profile.portrait}
                  alt={t.name.full}
                  sizes="(min-width: 768px) 22rem, 66vw"
                  placeholder="blur"
                  className="absolute inset-x-0 -top-[8%] h-[116%] w-full object-cover object-[50%_30%]"
                />
                {/* A whisper of champagne so the photo sits in the palette. */}
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent mix-blend-multiply"
                />
              </div>
              <figcaption data-reveal className="mt-4 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-display text-xl">{t.name.full}</span>
                <span className="font-mono text-[0.7rem] text-accent">{t.tehran}</span>
              </figcaption>
            </figure>
          )}
        </div>

        <div className="md:col-span-8 lg:col-span-9">
          <Split
            mode="scrub"
            as="p"
            className="font-display text-[clamp(2rem,4.4vw,4.4rem)] leading-[1.15]"
            lines={copy.about}
          />

          {copy.bio && (
            <p data-reveal className="mt-12 max-w-3xl text-lg leading-9 text-foreground-2 md:text-xl md:leading-10">
              {copy.bio}
            </p>
          )}

          {/* At-a-glance facts: experience, education, tools, languages. */}
          <div data-reveal-group className="mt-16 grid gap-4 lg:grid-cols-2">
            <FactCard title={t.about.experience}>
              {copy.experience.map((e) => (
                <FactRow key={e.title + e.org} primary={e.title} secondary={e.org} aside={e.period} />
              ))}
            </FactCard>
            <FactCard title={t.about.education}>
              {copy.education.map((e) => (
                <FactRow key={e.degree} primary={e.degree} secondary={e.school} />
              ))}
            </FactCard>
            <FactCard title={t.about.tools}>
              <li className="flex flex-wrap gap-2 py-3">
                {profile.tools.map((tool) => (
                  <span key={tool} className="ltr rounded-full bg-foreground/[0.07] px-3 py-1.5 text-sm">
                    {tool}
                  </span>
                ))}
              </li>
            </FactCard>
            <FactCard title={t.about.languages}>
              {copy.languages.map((l) => (
                <FactRow key={l.name} primary={l.name} aside={l.level} />
              ))}
            </FactCard>
          </div>

          <h3 data-reveal className="mt-20 flex items-center gap-3 text-sm text-foreground-2">
            <span className="h-px w-8 bg-accent" />
            {t.about.approach}
          </h3>
          <div data-reveal-group className="mt-6 grid gap-4 sm:grid-cols-3">
            {copy.principles.map((p, i) => (
              <article
                key={p.title}
                data-reveal
                className="edge group relative overflow-hidden rounded-xl bg-card/60 p-6 transition-colors duration-500 hover:bg-card md:p-8"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -end-10 -top-10 size-40 rounded-full bg-accent/0 blur-3xl transition-colors duration-700 group-hover:bg-accent/20"
                />
                <span className="font-mono text-xs text-accent">{n(`0${i + 1}`)}</span>
                <h3 className="mt-12 font-display text-3xl md:text-4xl">{p.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-7 text-muted-foreground">{p.body}</p>
              </article>
            ))}
          </div>

          <p data-reveal className="mt-10 max-w-2xl text-sm leading-7 text-muted-foreground">
            {copy.fields}
          </p>
        </div>
      </div>
    </section>
  );
}

function FactCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section data-reveal className="edge rounded-xl bg-card/60 p-6 md:p-7">
      <h3 className="text-xs text-accent">{title}</h3>
      <ul className="mt-3 divide-y divide-border">{children}</ul>
    </section>
  );
}

function FactRow({ primary, secondary, aside }: { primary: string; secondary?: string; aside?: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 py-3">
      <span>
        <span className="block font-display text-2xl leading-tight">{primary}</span>
        {secondary && <span className="mt-0.5 block text-sm text-muted-foreground">{secondary}</span>}
      </span>
      {aside && <span className="shrink-0 font-mono text-xs text-muted-foreground">{aside}</span>}
    </li>
  );
}
