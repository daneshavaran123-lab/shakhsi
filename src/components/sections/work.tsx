"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

import { projectGroups, projects, type Project, type ProjectGroup } from "@/data/projects";
import { Split } from "@/components/motion/split";
import { SectionLabel } from "@/components/section-label";
import { ProjectSheet } from "@/components/sections/project-sheet";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { gsap } from "@/lib/gsap";
import { cn, toFa } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function Work() {
  const root = useRef<HTMLElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [group, setGroup] = useState<ProjectGroup>("همه");
  const [hovered, setHovered] = useState<Project | null>(null);
  const [active, setActive] = useState<Project | null>(null);
  useSectionMotion(root);

  const visible = projects.filter((p) => group === "همه" || p.group === group);

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

    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
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
      className="relative rounded-t-[2rem] bg-ink px-4 py-28 text-paper sm:px-6 md:rounded-t-[3rem] md:py-36"
    >
      <div className="mx-auto max-w-[100rem]">
        <div className="grid gap-10 md:grid-cols-12">
          <SectionLabel index="۰۲" className="text-paper/80 md:col-span-3">
            نمونه‌کارها
          </SectionLabel>
          <div className="md:col-span-9">
            <h2 className="font-display text-[clamp(3rem,8vw,8.5rem)] leading-[0.9]">
              <Split as="span" lines={["محصولاتی که"]} className="block" />
              <Split
                as="span"
                lines={["روی صفحه‌ی لمسی زندگی می‌کنند."]}
                className="block text-paper/45"
                delay={0.1}
              />
            </h2>
            <p data-reveal className="mt-8 max-w-xl leading-8 text-paper/60">
              پروژه‌های نرم‌افزاری در حوزه تجربه کاربری، سامانه‌های هوشمند، کیوسک‌های تعاملی و
              محصولات مبتنی بر هوش مصنوعی. هر ردیف را باز کنید تا امکانات و تصاویر بیشتر را ببینید.
            </p>
          </div>
        </div>

        <div
          data-reveal
          role="toolbar"
          aria-label="فیلتر دسته‌بندی پروژه‌ها"
          className="mt-20 flex flex-wrap gap-2"
        >
          {projectGroups.map((g) => {
            const count =
              g === "همه" ? projects.length : projects.filter((p) => p.group === g).length;
            const selected = group === g;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={selected}
                onClick={() => setGroup(g)}
                className={cn(
                  "relative h-10 cursor-pointer rounded-full px-4 text-sm transition-colors duration-300",
                  selected ? "text-ink" : "text-paper/70 ring-1 ring-paper/15 hover:text-paper hover:ring-paper/40",
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="work-filter"
                    className="absolute inset-0 rounded-full bg-paper"
                    transition={{ type: "spring", bounce: 0.18, duration: 0.55 }}
                  />
                )}
                <span className="relative">
                  {g}
                  <sup aria-hidden className="ms-1 font-mono text-[0.6rem] opacity-60">{toFa(count)}</sup>
                </span>
              </button>
            );
          })}
        </div>

        <ul
          data-work-list
          className="mt-10 border-t border-paper/15"
          onPointerLeave={() => setHovered(null)}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((p) => {
              const index = projects.indexOf(p) + 1;
              return (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.7, ease }}
                  className="border-b border-paper/15"
                >
                  <button
                    type="button"
                    onClick={() => open(p)}
                    onPointerEnter={() => setHovered(p)}
                    onFocus={() => setHovered(p)}
                    aria-haspopup="dialog"
                    className="group grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 py-6 text-start md:grid-cols-12 md:gap-6 md:py-8"
                  >
                    <span className="font-mono text-xs text-paper/40 md:col-span-1">
                      {toFa(String(index).padStart(2, "0"))}
                    </span>

                    <span className="md:col-span-5">
                      <span className="block font-display text-[clamp(1.8rem,3.4vw,3.4rem)] leading-tight transition-transform duration-700 ease-out-expo group-hover:-translate-x-3 group-focus-visible:-translate-x-3">
                        {p.title}
                      </span>
                      <span className="ltr mt-1 block text-end font-serif text-paper/45 italic md:hidden">
                        {p.eng}
                      </span>
                    </span>

                    <span className="ltr hidden text-end font-serif text-lg text-paper/45 italic md:col-span-3 md:block">
                      {p.eng}
                    </span>

                    <span className="hidden text-sm text-paper/60 md:col-span-2 md:block">
                      {p.category}
                    </span>

                    <span className="flex justify-end md:col-span-1">
                      <span className="grid size-10 place-items-center rounded-full ring-1 ring-paper/20 transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:bg-vermilion group-focus-visible:bg-vermilion group-hover:ring-vermilion">
                        <ArrowLeft className="size-4" />
                      </span>
                    </span>

                    {/* Touch screens get the thumbnail inline instead of a hover preview. */}
                    <span className="col-span-3 block overflow-hidden rounded-md md:hidden">
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
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.45, ease }}
              className="-translate-x-1/2 -translate-y-[115%] overflow-hidden rounded-md bg-ink-2 shadow-2xl ring-1 ring-paper/10"
              style={{ width: 340 }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={hovered.id}
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  animate={{ clipPath: "inset(0% 0 0 0)" }}
                  exit={{ opacity: 0.6 }}
                  transition={{ duration: 0.6, ease }}
                >
                  <Image
                    src={hovered.images[0]}
                    alt=""
                    sizes="340px"
                    className="aspect-[16/10] w-full object-cover object-top"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="flex items-center justify-between px-3 py-2 text-[0.7rem] text-paper/70">
                <span>{hovered.status}</span>
                <span>مشاهده جزئیات</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProjectSheet project={active} onClose={close} />
    </section>
  );
}
