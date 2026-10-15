"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { Split } from "@/components/motion/split";
import { GlLayer } from "@/components/gl-layer";
import { LanguageSwitch, ThemeToggle } from "@/components/sections/header";
import { Button } from "@/components/ui/button";
import { useContent } from "@/content/provider";
import type { ProjectCopy } from "@/content/types";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useI18n } from "@/i18n/provider";
import { pageHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

const blocks = ["features", "tech", "uses"] as const satisfies readonly (keyof ProjectCopy)[];

export function CaseStudy({ id }: { id: string }) {
  const { t, n, locale } = useI18n();
  const { projects } = useContent();
  const root = useRef<HTMLElement>(null);
  useSectionMotion(root);

  const index = projects.findIndex((p) => p.id === id);
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];
  const copy = p[locale];
  const [cover, ...gallery] = p.images;

  // The written case study when there is one; otherwise the project's own copy.
  type Part = { label: string; body?: string; list?: string[] };
  const story = ([
    { label: t.caseStudy.challenge, body: copy.challenge || copy.intro },
    copy.process.length
      ? { label: t.caseStudy.process, list: copy.process }
      : copy.services.length
        ? { label: t.sheet.services, list: copy.services }
        : null,
    { label: t.caseStudy.outcome, body: copy.outcome || copy.value },
  ] as (Part | null)[]).filter((s): s is Part => !!s && !!(s.body || s.list?.length));

  return (
    <>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5"
      >
        <div className="mx-auto flex h-14 max-w-[100rem] items-center justify-between rounded-full bg-background/70 px-2 shadow-[0_0_0_1px_var(--border)] backdrop-blur-xl">
          <a
            href={`${pageHref(locale)}#work`}
            className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm transition-colors hover:bg-foreground/5"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t.caseStudy.back}
          </a>
          <div className="flex items-center gap-2">
            <LanguageSwitch page={`work/${id}`} />
            <ThemeToggle />
          </div>
        </div>
      </motion.div>

      <GlLayer />
      <main ref={root} id="main" className="px-4 pt-36 sm:px-6 md:pt-44">
        <div className="mx-auto max-w-[100rem]">
          {/* Title */}
          <p data-reveal className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="font-mono text-xs text-accent">({n(String(index + 1).padStart(2, "0"))})</span>
            <span>{copy.category}</span>
            <span className="size-1 rounded-full bg-muted-foreground/50" />
            <span className={cn("inline-flex items-center gap-1.5", p.live && "text-accent")}>
              <span className={cn("size-1.5 rounded-full", p.live ? "bg-accent" : "bg-muted-foreground")} />
              {copy.status}
            </span>
          </p>
          <h1 className="mt-6 font-display text-[clamp(3.2rem,10vw,10rem)] leading-[0.9]">
            <Split as="span" lines={[copy.title]} className="block" />
          </h1>
          {locale === "fa" && (
            <p data-reveal className="ltr mt-3 text-end font-serif text-2xl text-muted-foreground italic">
              {p.eng}
            </p>
          )}

          <div className="mt-14 grid gap-10 border-t pt-8 md:grid-cols-12">
            <dl data-reveal-group className="grid grid-cols-2 gap-6 text-sm md:col-span-5">
              {[
                { k: t.sheet.client, v: copy.client },
                { k: t.sheet.role, v: copy.role },
                { k: t.sheet.hardware, v: copy.hardware },
              ]
                .filter((r) => r.v)
                .map((r) => (
                  <div key={r.k} data-reveal className="last:col-span-2">
                    <dt className="text-[0.72rem] text-accent">{r.k}</dt>
                    <dd className="mt-1.5 leading-7 text-foreground">{r.v}</dd>
                  </div>
                ))}
            </dl>
            <p data-reveal className="text-xl leading-10 text-foreground-2 md:col-span-7">
              {copy.summary || copy.intro}
            </p>
          </div>
        </div>

        {/* Cover — shares its view-transition name with the sheet's first image. */}
        {cover && (
          <div className="mx-auto mt-16 max-w-[100rem]">
            <div
              className="overflow-hidden rounded-2xl bg-card ring-1 ring-border"
              style={{ viewTransitionName: `project-${p.id}`, viewTransitionClass: "cover" }}
            >
              <Image
                src={cover}
                alt={t.sheet.screenshot(copy.title)}
                sizes="(min-width: 1600px) 100rem, 100vw"
                placeholder="blur"
                priority
                className="max-h-[85vh] w-full object-contain"
              />
            </div>
          </div>
        )}

        {p.video && (
          <div className="mx-auto mt-6 max-w-[100rem]">
            <p className="sr-only">{t.caseStudy.video}</p>
            <video
              src={p.video}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full rounded-2xl bg-card ring-1 ring-border"
            />
          </div>
        )}

        {/* Story */}
        <div className="mx-auto mt-28 max-w-[100rem] md:mt-40">
          <div className="grid gap-px overflow-hidden rounded-2xl bg-border md:grid-cols-3">
            {story.map((s, i) => (
              <section key={s.label} data-reveal className="bg-background p-7 md:p-10">
                <p className="flex items-center gap-3 text-sm text-accent">
                  <span className="font-mono text-xs">{n(String(i + 1).padStart(2, "0"))}</span>
                  {s.label}
                </p>
                {s.body && <p className="mt-6 text-lg leading-9 text-foreground-2">{s.body}</p>}
                {s.list && (
                  <ol className="mt-6 space-y-3 leading-8 text-foreground-2">
                    {s.list.map((line) => (
                      <li key={line} className="flex gap-3">
                        <span className="mt-4 h-px w-3 shrink-0 bg-accent" />
                        {line}
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            ))}
          </div>

          <div className="mt-20 grid gap-x-10 gap-y-12 md:grid-cols-3">
            {blocks
              .filter((key) => copy[key].length)
              .map((key) => (
                <div key={key} data-reveal>
                  <h2 className="border-b pb-3 text-sm font-semibold">{t.sheet[key]}</h2>
                  <ul className="mt-3 space-y-2.5 text-[0.95rem] leading-7 text-foreground-2">
                    {copy[key].map((line) => (
                      <li key={line} className="flex gap-3">
                        <span className="mt-3 h-px w-3 shrink-0 bg-accent" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>

        {/* Gallery */}
        {gallery.length > 0 && (
          <div className="mx-auto mt-28 max-w-[100rem] md:mt-40">
            <h2 data-reveal className="text-sm text-muted-foreground">
              {t.caseStudy.gallery} · <span className="font-mono">{n(gallery.length)}</span>
            </h2>
            <div className="mt-8 columns-1 gap-4 md:columns-2 [&>*]:mb-4">
              {gallery.map((img, i) => (
                <div key={img.src} data-gl data-gl-host className="break-inside-avoid overflow-hidden rounded-2xl bg-card ring-1 ring-border">
                  <Image
                    src={img}
                    alt={t.sheet.imageOf(n(i + 2), n(p.images.length), copy.title)}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    placeholder="blur"
                    className="w-full transition-transform duration-[1.2s] ease-out-expo hover:scale-[1.03]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        <div data-reveal className="mx-auto mt-20 flex max-w-[100rem] flex-wrap items-center gap-3 border-t pt-10">
          {p.url && (
            <Button asChild variant="accent" size="lg" className="group">
              <a href={p.url} target="_blank" rel="noopener noreferrer">
                {t.sheet.visit}
                <ArrowUpRight className="rtl:-scale-x-100" />
              </a>
            </Button>
          )}
          {copy.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm ring-1 ring-border transition-colors hover:bg-accent hover:text-accent-foreground hover:ring-accent"
            >
              {l.label}
              <ArrowUpRight className="size-3.5 transition-transform group-hover:rotate-45 rtl:-scale-x-100" />
            </a>
          ))}
        </div>

        {/* Next */}
        {next && next.id !== p.id && (
          <a
            href={pageHref(locale, `work/${next.id}`)}
            className="group chapter relative -mx-4 mt-32 block overflow-hidden rounded-t-[2rem] px-4 pt-20 pb-24 sm:-mx-6 sm:px-6 md:mt-44 md:rounded-t-[3rem] md:pt-28 md:pb-32"
          >
            <div className="relative mx-auto grid max-w-[100rem] gap-10 md:grid-cols-12 md:items-end">
              <div className="md:col-span-7">
                <p className="text-sm text-accent">{t.caseStudy.next}</p>
                <p className="mt-6 font-display text-[clamp(3rem,8vw,8rem)] leading-[0.92] transition-transform duration-700 ease-out-expo group-hover:translate-x-4 rtl:group-hover:-translate-x-4">
                  {next[locale].title}
                </p>
                <p className="mt-4 text-muted-foreground">{next[locale].category}</p>
              </div>
              {next.images[0] && (
                <div
                  className="overflow-hidden rounded-xl ring-1 ring-border md:col-span-5"
                  style={{ viewTransitionName: `project-${next.id}`, viewTransitionClass: "cover" }}
                >
                  <Image
                    src={next.images[0]}
                    alt=""
                    sizes="(min-width: 768px) 40vw, 100vw"
                    placeholder="blur"
                    className="aspect-[16/10] w-full object-cover object-top transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105"
                  />
                </div>
              )}
            </div>
          </a>
        )}
      </main>
    </>
  );
}
