"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Hand, X } from "lucide-react";

import { Split } from "@/components/motion/split";
import { SectionLabel } from "@/components/section-label";
import { TehranClock } from "@/components/tehran-clock";
import { useContent } from "@/content/provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import type { TableTile } from "@/components/three/touch-table";

const TouchTable = dynamic(() => import("@/components/three/touch-table"), { ssr: false });
const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The approach, then the proof: a framed touch screen — the kind she builds —
 * where every project is a tile you can push, flick and tap open.
 */
export function Manifesto() {
  const { t, n, locale } = useI18n();
  const { projects } = useContent();
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const engaged = useRef(false);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [touched, setTouched] = useState<number[]>([]);
  const [prompting, setPrompting] = useState(true);
  useSectionMotion(root);

  const tiles: TableTile[] = projects.map((p, i) => ({
    id: p.id,
    mono: p.eng.trim().charAt(0).toUpperCase() || p.id.charAt(0).toUpperCase(),
    name: p[locale].title.split("|")[0].trim(),
    index: n(String(i + 1).padStart(2, "0")),
  }));

  useEffect(() => {
    setNarrow(matchMedia("(max-width: 767px)").matches);
    document.fonts.ready.then(() => setReady(true));
    const el = screen.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Fade the instructions once someone starts touching; bring them back when idle.
  useEffect(() => {
    const id = window.setInterval(() => {
      setPrompting(!engaged.current);
      engaged.current = false;
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  const onTouch = useCallback((i: number) => setTouched((list) => (list.includes(i) ? list : [...list, i])), []);
  const onHover = useCallback(
    (i: number | null) => {
      if (!screen.current) return;
      if (i === null) delete screen.current.dataset.cursor;
      else screen.current.dataset.cursor = t.manifesto.touch;
    },
    [t.manifesto.touch],
  );
  const onSelect = useCallback((i: number | null) => setSelected(i), []);

  const project = selected !== null ? projects[selected] : null;
  const all = touched.length >= projects.length && projects.length > 0;

  return (
    <section ref={root} id="manifesto" data-curtain className="chapter relative rounded-t-[2rem] px-4 py-28 sm:px-6 md:rounded-t-[3rem] md:py-36">
      <div className="mx-auto max-w-[100rem]">
        <div data-exit className="grid gap-10 md:grid-cols-12">
          <SectionLabel className="md:col-span-4 lg:col-span-3">{t.manifesto.label}</SectionLabel>
          <div className="md:col-span-8 lg:col-span-9">
            <Split
              as="p"
              mode="scrub"
              lines={t.manifesto.text}
              lineClassName="block"
              className={cn(
                "font-display text-[clamp(2rem,4.4vw,4.6rem)] leading-[1.08]",
                locale === "en" && "tracking-[-0.02em]",
              )}
            />
            <p data-reveal className="mt-6 font-mono text-xs text-muted-foreground">
              {t.manifesto.foot}
            </p>
          </div>
        </div>

        {/* The device: a bezel, a status bar, and the live table inside. */}
        <div data-reveal className="mt-16 rounded-[2rem] bg-gradient-to-b from-white/[0.09] to-white/[0.02] p-2 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.9)] ring-1 ring-white/10 md:mt-24 md:rounded-[2.6rem] md:p-3">
          <div
            ref={screen}
            className="relative h-[78svh] min-h-[32rem] overflow-hidden rounded-[1.6rem] bg-[radial-gradient(120%_90%_at_50%_45%,#17161a,#09090a)] md:h-[74svh] md:rounded-[2.1rem]"
          >
            {/* Faint pixel grid, so it reads as a screen. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(closest-side,black,transparent)]"
            />

            <div aria-hidden className="absolute inset-0">
              {inView && ready && (
                <TouchTable
                  tiles={tiles}
                  active={inView}
                  still={reduced}
                  accent="#d8bb8a"
                  narrow={narrow}
                  eventSource={screen}
                  selected={selected}
                  onSelect={onSelect}
                  onTouch={onTouch}
                  onHover={onHover}
                  engaged={engaged}
                />
              )}
            </div>

            {/* Status bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-4 font-mono text-[0.68rem] text-muted-foreground md:px-7 md:pt-5">
              <span className="flex items-center gap-2">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7fd18b] opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[#7fd18b]" />
                </span>
                {t.manifesto.screen}
              </span>
              <TehranClock bare className="tabular-nums" />
            </div>

            {/* Instructions, shown until someone starts touching. */}
            <AnimatePresence>
              {prompting && selected === null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.6, ease }}
                  className="pointer-events-none absolute inset-x-0 bottom-14 flex flex-col items-center px-6 text-center md:bottom-16"
                >
                  <span className="relative grid size-14 place-items-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/30">
                    <span className="absolute inset-0 animate-ping rounded-full ring-1 ring-accent/40" />
                    <Hand className="size-6" aria-hidden />
                  </span>
                  <p className="mt-4 font-display text-2xl md:text-3xl">{t.manifesto.prompt}</p>
                  <p className="mt-2 max-w-md text-sm leading-7 text-foreground-2">{t.manifesto.instruction}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The tapped project's card. */}
            <AnimatePresence>
              {project && (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  transition={{ duration: 0.6, ease }}
                  className="absolute start-4 end-4 bottom-16 rounded-2xl bg-background/75 p-5 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:end-auto md:start-7 md:bottom-20 md:w-[26rem]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs text-accent">
                        {n(String((selected ?? 0) + 1).padStart(2, "0"))} · {project[locale].category}
                      </p>
                      <h3 className="mt-2 font-display text-3xl leading-tight">{project[locale].title}</h3>
                      {project[locale].client && (
                        <p className="mt-1 text-sm text-muted-foreground">{project[locale].client}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      aria-label={t.manifesto.close}
                      className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full ring-1 ring-border transition-colors hover:bg-foreground/10"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-foreground-2">{project[locale].summary}</p>
                  <a
                    href={`#project-${project.id}`}
                    className="group mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-strong"
                  >
                    {t.manifesto.open}
                    <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45 rtl:-scale-x-100" />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Discovery meter: one dot per project. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 px-5 pb-4 font-mono text-[0.68rem] text-muted-foreground md:px-7 md:pb-5">
              <span aria-live="polite">
                {all ? t.manifesto.all : t.manifesto.explored(n(touched.length), n(projects.length))}
              </span>
              <span className="flex gap-1.5" aria-hidden>
                {projects.map((p, i) => (
                  <span
                    key={p.id}
                    className={cn(
                      "size-1.5 rounded-full transition-colors duration-500",
                      selected === i ? "bg-foreground" : touched.includes(i) ? "bg-accent" : "bg-white/15",
                    )}
                  />
                ))}
              </span>
            </div>
          </div>
        </div>

        {/* Screen-reader and keyboard route to the same projects. */}
        <ul className="sr-only">
          {projects.map((p) => (
            <li key={p.id}>
              <a href={`#project-${p.id}`}>{p[locale].title}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
