"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

import { projectGroups, projects, type Project, type ProjectGroup } from "@/data/projects";
import { Split } from "@/components/motion/split";
import { SectionLabel } from "@/components/section-label";
import { ProjectSheet } from "@/components/sections/project-sheet";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useI18n } from "@/i18n/provider";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function Work() {
  const { t, n, locale } = useI18n();
  const root = useRef<HTMLElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [group, setGroup] = useState<ProjectGroup>("all");
  const [hovered, setHovered] = useState<Project | null>(null);
  const [active, setActive] = useState<Project | null>(null);
  useSectionMotion(root);

  const visible = projects.filter((p) => group === "all" || p.group === group);

  // Deep links: #project-mora opens that project.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.replace("#project-", ""));
      const match = projects.find((p) => p.id === id);
      if (match) setActive(match);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const open = useCallback((p: Project) => {
    setActive(p);
    history.replaceState(null, "", `#project-${p.id}`);
  }, []);

  const close = useCallback(() => {
    setActive(null);
    history.replaceState(null, "", "#work");
  }, []);

  // Floating preview that trails the cursor across the list.
  useEffect(() => {
    const el = preview.current;
    const list = root.current?.querySelector<HTMLElement>("[data-work-list]");
    if (!el || !list || !matchMedia("(pointer: fine)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    list.addEventListener("pointermove", move);
    return () => list.removeEventListener("pointermove", move);
  }, []);

  return (
    <section
      ref={root}
      id="work"
      className="chapter relative rounded-t-[2rem] px-4 py-28 sm:px-6 md:rounded-t-[3rem] md:py-36"
    >
      <div className="mx-auto max-w-[100rem]">
        <div className="grid gap-10 md:grid-cols-12">
          <SectionLabel index={n("02")} className="md:col-span-3">
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
            <p data-reveal className="mt-8 max-w-xl leading-8 text-muted-foreground">
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

        <ul data-work-list className="mt-10 border-t" onPointerLeave={() => setHovered(null)}>
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((p) => {
              const index = projects.indexOf(p) + 1;
              const copy = p[locale];
              return (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.7, ease }}
                  className="border-b"
                >
                  <button
                    type="button"
                    onClick={() => open(p)}
                    onPointerEnter={() => setHovered(p)}
                    onFocus={() => setHovered(p)}
                    aria-haspopup="dialog"
                    className="group relative grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 py-6 text-start md:grid-cols-12 md:gap-6 md:py-8"
                  >
                    {/* Row wash that sweeps in from the reading start. */}
                    <span
                      aria-hidden
                      className="absolute inset-0 origin-right scale-x-0 bg-foreground/[0.035] transition-transform duration-700 ease-out-expo group-hover:scale-x-100 ltr:origin-left"
                    />
                    <span className="relative font-mono text-xs text-muted-foreground md:col-span-1">
                      {n(String(index).padStart(2, "0"))}
                    </span>

                    <span className="relative md:col-span-5">
                      <span className="block font-display text-[clamp(1.8rem,3.4vw,3.4rem)] leading-tight transition-transform duration-700 ease-out-expo group-hover:translate-x-3 group-focus-visible:translate-x-3 rtl:group-hover:-translate-x-3 rtl:group-focus-visible:-translate-x-3">
                        {copy.title}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground md:hidden">{copy.category}</span>
                    </span>

                    <span className="relative hidden text-sm leading-6 text-muted-foreground md:col-span-4 md:block">
                      {locale === "fa" ? (
                        <span className="ltr block text-end font-serif text-lg text-foreground-2 italic">{p.eng}</span>
                      ) : (
                        <span className="line-clamp-2">{copy.summary}</span>
                      )}
                    </span>

                    <span className="relative hidden md:col-span-1 md:block">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs whitespace-nowrap",
                          p.live ? "text-accent" : "text-muted-foreground",
                        )}
                      >
                        <span className={cn("size-1.5 rounded-full", p.live ? "bg-accent" : "bg-muted-foreground")} />
                        {copy.status}
                      </span>
                    </span>

                    <span className="relative flex justify-end md:col-span-1">
                      <span className="grid size-10 place-items-center rounded-full ring-1 ring-border transition-all duration-500 ease-out-expo group-hover:bg-accent group-hover:text-accent-foreground group-hover:ring-accent group-focus-visible:bg-accent group-focus-visible:text-accent-foreground">
                        <ArrowUpRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:rotate-45 rtl:-scale-x-100 rtl:group-hover:-rotate-45" />
                      </span>
                    </span>

                    {/* Touch screens get the thumbnail inline instead of a hover preview. */}
                    <span className="relative col-span-3 block overflow-hidden rounded-lg md:hidden">
                      <Image
                        src={p.images[0]}
                        alt=""
                        sizes="100vw"
                        placeholder="blur"
                        className={cn(
                          "aspect-[16/10] w-full object-cover",
                          p.images[0].height > p.images[0].width ? "object-center" : "object-top",
                        )}
                      />
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>

      {/* Cursor-follow preview (fine pointers only). */}
      <div
        ref={preview}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-30 hidden [@media(pointer:fine)]:md:block"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="frame"
              initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.45, ease }}
              className="translate-x-10 -translate-y-1/2 overflow-hidden rounded-xl bg-card shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)] ring-1 ring-border rtl:-translate-x-[calc(100%+2.5rem)]"
              style={{ width: 360 }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={hovered.id}
                  initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.1 }}
                  animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
                  exit={{ opacity: 0.6 }}
                  transition={{ duration: 0.7, ease }}
                >
                  <Image
                    src={hovered.images[0]}
                    alt=""
                    sizes="360px"
                    className="aspect-[16/10] w-full object-cover object-top"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[0.72rem]">
                <span className="truncate text-foreground-2">{hovered[locale].category}</span>
                <span className="text-accent">{t.work.view}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProjectSheet project={active} onClose={close} />
    </section>
  );
}
