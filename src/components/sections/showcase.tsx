"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, Hand } from "lucide-react";

import { SectionLabel } from "@/components/section-label";
import { Split } from "@/components/motion/split";
import { useTheme } from "@/components/providers/theme";
import { useContent } from "@/content/provider";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useI18n } from "@/i18n/provider";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const ShowcaseStage = dynamic(() => import("@/components/three/showcase-stage"), { ssr: false });

/**
 * The products on their hardware: a pinned 3D stage that hands from one
 * device to the next as you scroll — the kids' table, a 65″ display, a kiosk.
 */
export function Showcase() {
  const { t, n, locale } = useI18n();
  const { services, projects } = useContent();
  const { theme } = useTheme();
  const reduced = useReducedMotion();
  const chapters = services[locale].showcase.filter((c) => projects.some((p) => p.id === c.project));
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [chapter, setChapter] = useState(0);
  const [inView, setInView] = useState(false);
  const [accent, setAccent] = useState("#d8bb8a");
  useSectionMotion(root);

  useEffect(() => {
    setAccent(getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#d8bb8a");
  }, [theme]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (chapters.length < 2) return;
      ScrollTrigger.create({
        trigger: ".showcase-track",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
          setChapter(Math.min(chapters.length - 1, Math.round(self.progress * (chapters.length - 1))));
        },
      });
    },
    { scope: root, dependencies: [chapters.length] },
  );

  if (!chapters.length) return null;

  const devices = chapters.map((c) => {
    const project = projects.find((p) => p.id === c.project);
    // The kids' table shows its launcher, drawn live; the rest show a screenshot.
    return { device: c.device, screen: c.project === "kids" ? undefined : project?.images[0]?.src };
  });

  return (
    <section ref={root} id="showcase" className="chapter relative rounded-t-[2rem] md:rounded-t-[3rem]">
      <div className="mx-auto grid max-w-[100rem] gap-10 px-4 pt-28 sm:px-6 md:grid-cols-12 md:pt-40">
        <SectionLabel index={n("04")} className="md:col-span-4 lg:col-span-3">
          {t.showcase.label}
        </SectionLabel>
        <h2 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.95] md:col-span-8 lg:col-span-9">
          <Split as="span" lines={[t.showcase.heading[0]]} className="block" />
          <Split
            as="span"
            lines={[t.showcase.heading[1]]}
            className={cn("foil block", locale === "en" && "italic")}
            delay={0.1}
          />
        </h2>
      </div>

      {/* A tall track; the stage sticks while the track scrolls past. */}
      <div className="showcase-track relative" style={{ height: `${chapters.length * 90 + 30}svh` }}>
        <div className="sticky top-0 flex h-svh flex-col overflow-hidden md:flex-row md:items-center">
          <div className="relative min-h-0 flex-1 md:order-2 md:ms-[34%] md:h-full">
            {inView && (
              <ShowcaseStage
                devices={devices}
                progress={progress}
                active={inView}
                still={reduced}
                accent={accent}
                locale={locale}
              />
            )}
            <p className="pointer-events-none absolute bottom-6 start-1/2 flex -translate-x-1/2 items-center gap-2 font-mono text-[0.7rem] text-muted-foreground rtl:translate-x-1/2">
              <Hand className="size-3.5" aria-hidden />
              {t.showcase.hint}
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[100rem] shrink-0 px-4 pb-10 sm:px-6 md:absolute md:inset-x-0 md:top-1/2 md:-translate-y-1/2 md:pb-0">
            <div className="relative grid md:w-[34%]">
              {chapters.map((c, i) => (
                <div
                  key={c.project}
                  aria-hidden={chapter !== i}
                  className={cn(
                    "col-start-1 row-start-1 transition-all duration-700 ease-out-expo",
                    chapter === i ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
                  )}
                >
                  <p className="font-mono text-xs text-accent">
                    {n(String(i + 1).padStart(2, "0"))} / {n(String(chapters.length).padStart(2, "0"))}
                  </p>
                  <h3 className="mt-3 font-display text-[clamp(2rem,3.6vw,3.4rem)] leading-tight">{c.title}</h3>
                  <p className="mt-3 max-w-md leading-8 text-foreground-2">{c.body}</p>
                  <a
                    href={`#project-${c.project}`}
                    tabIndex={chapter === i ? undefined : -1}
                    className="group mt-6 inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm ring-1 ring-border transition-colors hover:bg-accent hover:text-accent-foreground hover:ring-accent"
                  >
                    {t.showcase.open}
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:rotate-45 rtl:-scale-x-100" />
                  </a>
                </div>
              ))}
            </div>
            {/* Chapter ticks */}
            <div className="mt-8 flex gap-2" aria-hidden>
              {chapters.map((c, i) => (
                <span
                  key={c.project}
                  className={cn(
                    "h-0.5 rounded-full transition-all duration-500",
                    chapter === i ? "w-10 bg-accent" : "w-4 bg-border",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
