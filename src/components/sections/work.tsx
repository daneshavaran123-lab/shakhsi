"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

import { projectGroups, type Project, type ProjectGroup } from "@/content/types";
import { useContent } from "@/content/provider";
import { Split } from "@/components/motion/split";
import { SectionLabel } from "@/components/section-label";
import { ProjectSheet } from "@/components/sections/project-sheet";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useI18n } from "@/i18n/provider";
import { flipOriginOf, type FlipOrigin } from "@/lib/flip";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function Work() {
  const { t, n, locale } = useI18n();
  const { projects } = useContent();
  const root = useRef<HTMLElement>(null);
  const [group, setGroup] = useState<ProjectGroup>("all");
  const [active, setActive] = useState<Project | null>(null);
  const [origin, setOrigin] = useState<FlipOrigin | null>(null);
  useSectionMotion(root);

  const visible = projects.filter((p) => group === "all" || p.group === group);

  // Deep links: #project-mora opens that project.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.replace("#project-", ""));
      const match = projects.find((p) => p.id === id);
      if (match) {
        setOrigin(null);
        setActive(match);
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [projects]);

  // Opening from a card: remember where its picture sits, so it can fly into the sheet.
  const open = useCallback((p: Project, card?: HTMLElement) => {
    setOrigin(flipOriginOf(card?.querySelector<HTMLElement>("[data-gl]") ?? null));
    setActive(p);
    history.replaceState(null, "", `#project-${p.id}`);
  }, []);

  const close = useCallback(() => {
    setActive(null);
    history.replaceState(null, "", "#work");
  }, []);

  return (
    <section
      ref={root}
      id="work"
      data-curtain
      className="chapter relative rounded-t-[2rem] px-4 py-28 sm:px-6 md:rounded-t-[3rem] md:py-36"
    >
      <div className="mx-auto max-w-[100rem]">
        <div data-exit className="grid gap-10 md:grid-cols-12">
          <SectionLabel index={n("05")} className="md:col-span-3">
            {t.work.label}
          </SectionLabel>
          <div className="md:col-span-9">
            <h2 className="font-display text-[clamp(3rem,8vw,8.5rem)] leading-[0.92]">
              <Split as="span" lines={[t.work.heading[0]]} className="block" />
              <Split
                as="span"
                lines={[t.work.heading[1]]}
                className={cn("block text-muted-foreground", locale === "en" && "italic")}
                delay={0.1}
              />
            </h2>
            <p data-reveal="blur" className="mt-8 max-w-xl leading-8 text-muted-foreground">
              {t.work.intro}
            </p>
          </div>
        </div>

        <div
          data-reveal
          role="toolbar"
          aria-label={t.work.filterLabel}
          className="mt-20 flex flex-wrap gap-2"
        >
          {projectGroups.map((g) => {
            const count = g === "all" ? projects.length : projects.filter((p) => p.group === g).length;
            const selected = group === g;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={selected}
                onClick={() => setGroup(g)}
                className={cn(
                  "relative h-10 cursor-pointer rounded-full px-4 text-sm transition-colors duration-300",
                  selected
                    ? "text-accent-foreground"
                    : "text-foreground-2 ring-1 ring-border hover:text-foreground hover:ring-foreground/30",
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="work-filter"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: "spring", bounce: 0.18, duration: 0.55 }}
                  />
                )}
                <span className="relative">
                  {t.work.groups[g]}
                  <sup aria-hidden className="ms-1 font-mono text-[0.6rem] opacity-60">
                    {n(count)}
                  </sup>
                </span>
              </button>
            );
          })}
        </div>

        <ul className="mt-16 grid gap-x-6 gap-y-16 md:grid-cols-2 md:gap-x-10 md:gap-y-24">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((p, i) => {
              const index = projects.indexOf(p) + 1;
              const copy = p[locale];
              return (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.8, ease }}
                  // Staggered columns: every second card sits lower.
                  className={cn(i % 2 === 1 && "md:mt-40")}
                >
                  <button
                    type="button"
                    data-gl-host
                    data-cursor={t.work.view}
                    onClick={(e) => open(p, e.currentTarget)}
                    aria-haspopup="dialog"
                    className="group block w-full cursor-pointer text-start"
                  >
                    <span
                      data-gl
                      className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-card ring-1 ring-border"
                    >
                      <Image
                        src={p.images[0]}
                        alt={t.sheet.screenshot(copy.title)}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        placeholder="blur"
                        className={cn(
                          "object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.04]",
                          p.images[0].height > p.images[0].width ? "object-center" : "object-top",
                        )}
                      />
                    </span>
                    <span className="mt-5 flex items-baseline gap-4">
                      <span className="font-mono text-xs text-accent">{n(String(index).padStart(2, "0"))}</span>
                      <span className="font-display text-[clamp(1.8rem,3vw,3rem)] leading-tight transition-transform duration-700 ease-out-expo group-hover:translate-x-2 rtl:group-hover:-translate-x-2">
                        {copy.title}
                      </span>
                      <span
                        className={cn(
                          "ms-auto inline-flex shrink-0 items-center gap-1.5 text-xs whitespace-nowrap",
                          p.live ? "text-accent" : "text-muted-foreground",
                        )}
                      >
                        <span className={cn("size-1.5 rounded-full", p.live ? "bg-accent" : "bg-muted-foreground")} />
                        {copy.status}
                      </span>
                    </span>
                    <span className="mt-2 flex flex-wrap items-baseline gap-x-3 ps-9 text-sm text-muted-foreground">
                      <span>{copy.client || copy.category}</span>
                      {locale === "fa" && <span className="ltr font-serif text-base italic">{p.eng}</span>}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>

      <ProjectSheet project={active} origin={origin} onClose={close} />
    </section>
  );
}
