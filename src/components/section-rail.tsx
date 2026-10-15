"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";

import { navKeys } from "@/data/site";
import { useI18n } from "@/i18n/provider";
import { useLenis } from "@/components/providers/smooth-scroll";
import { cn } from "@/lib/utils";

/**
 * Reading progress along the top edge plus a quiet index of sections on the
 * reading-end side: the current chapter is marked, any other is one click away.
 */
export function SectionRail() {
  const { t, n } = useI18n();
  const lenis = useLenis();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const [active, setActive] = useState<string | null>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const hud = useRef<HTMLParagraphElement>(null);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // Out of the way while the hero (and its buttons) fill the screen.
    if (hud.current) hud.current.style.opacity = v > 0.04 ? "1" : "0";
    if (pct.current) pct.current.textContent = n(String(Math.round(v * 100)).padStart(3, "0"));
  });

  useEffect(() => {
    const sections = navKeys
      .map((k) => document.getElementById(k))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const go = (key: string) => {
    if (lenis) lenis.scrollTo(`#${key}`, { offset: -24, duration: 1.4 });
    else document.getElementById(key)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-[2px] origin-right bg-accent ltr:origin-left"
        style={{ scaleX: progress }}
      />
      {/* Corner readout, in the spirit of an instrument panel. */}
      <p
        aria-hidden
        ref={hud}
        className="fixed end-5 bottom-5 z-30 hidden font-mono text-[0.68rem] text-white opacity-0 mix-blend-difference transition-opacity duration-500 xl:block"
      >
        <span className="opacity-60 ltr:tracking-[0.16em] ltr:uppercase">{t.hud.scroll}</span>{" "}
        <span ref={pct} className="tabular-nums">
          {n("000")}
        </span>
        <span className="opacity-60">%</span>
      </p>
      <nav
        aria-label={t.nav.label}
        // Difference blending keeps the rail legible over light pages and dark chapters alike.
        className="fixed end-5 top-1/2 z-30 hidden -translate-y-1/2 text-white mix-blend-difference xl:block"
      >
        <ol className="flex flex-col items-end gap-3">
          {navKeys.map((key, i) => {
            const on = active === key;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => go(key)}
                  aria-current={on ? "true" : undefined}
                  className="group flex cursor-pointer items-center gap-3 py-0.5"
                >
                  <span
                    className={cn(
                      "text-xs whitespace-nowrap transition-all duration-500 ease-out-expo",
                      on
                        ? "translate-x-0 opacity-100"
                        : "pointer-events-none translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100 rtl:-translate-x-2 rtl:group-hover:translate-x-0",
                    )}
                  >
                    <span className="me-1.5 font-mono text-[0.65rem] opacity-60">{n(`0${i + 1}`)}</span>
                    {t.nav[key]}
                  </span>
                  <span
                    className={cn(
                      "h-px transition-all duration-500 ease-out-expo",
                      on ? "w-8 bg-white" : "w-4 bg-white/40 group-hover:w-6 group-hover:bg-white/70",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
