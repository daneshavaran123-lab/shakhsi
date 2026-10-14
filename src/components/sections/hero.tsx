"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowDown } from "lucide-react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";

import { gsap, useGSAP } from "@/lib/gsap";
import { useContent } from "@/content/provider";
import { useI18n } from "@/i18n/provider";
import { Split } from "@/components/motion/split";
import { Magnetic } from "@/components/motion/magnetic";
import { useTheme } from "@/components/providers/theme";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const DotField = dynamic(() => import("@/components/three/dot-field"), {
  ssr: false,
});

export function Hero() {
  const { t, n, locale } = useI18n();
  const { projects, certificates, profile } = useContent();
  const { theme } = useTheme();
  const root = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  const [colors, setColors] = useState({ ink: "#ede8df", accent: "#d8bb8a" });
  const reduced = useReducedMotion();

  // Soft champagne light that drifts toward the pointer.
  const gx = useSpring(useMotionValue(70), { stiffness: 40, damping: 20 });
  const gy = useSpring(useMotionValue(40), { stiffness: 40, damping: 20 });
  const glow = useMotionTemplate`radial-gradient(42rem 30rem at ${gx}% ${gy}%, var(--glow), transparent 70%)`;

  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    setColors({
      ink: css.getPropertyValue("--dot").trim() || "#ede8df",
      accent: css.getPropertyValue("--accent").trim() || "#d8bb8a",
    });
  }, [theme]);

  // Only render WebGL frames while the hero is on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "0px 0px -10% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });
        tl.fromTo(".hero-canvas", { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 2.6 }, 0)
          .set("[data-split]", { autoAlpha: 1 }, 0)
          .fromTo(
            "[data-split] .split-word",
            { yPercent: 120, rotate: locale === "fa" ? -4 : 4 },
            { yPercent: 0, rotate: 0, duration: 1.6, stagger: 0.09 },
            0.1,
          )
          .fromTo(
            "[data-reveal]",
            { autoAlpha: 0, y: 18, filter: "blur(6px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.2, stagger: 0.07, ease: "power4.out" },
            0.7,
          )
          .fromTo(".hero-rule", { scaleX: 0 }, { scaleX: 1, duration: 1.8 }, 0.6);

        gsap.to(".hero-name", {
          yPercent: -16,
          opacity: 0.15,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 1 },
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(["[data-split]", "[data-reveal]", ".hero-canvas"], { autoAlpha: 1 });
      });
    },
    { scope: root },
  );

  const isFa = locale === "fa";

  return (
    <section
      ref={root}
      id="top"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        gx.set(((e.clientX - r.left) / r.width) * 100);
        gy.set(((e.clientY - r.top) / r.height) * 100);
      }}
      className="relative flex min-h-[100svh] flex-col overflow-hidden px-4 pt-24 pb-6 sm:px-6"
    >
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glow }} />
      <div
        className="hero-canvas pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent_0%,black_32%,black_70%,transparent_100%)]"
        style={{ visibility: "hidden" }}
      >
        <DotField
          active={inView}
          still={reduced}
          ink={colors.ink}
          accent={colors.accent}
          eventSource={root}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-[100rem] flex-1 flex-col">
        <div data-reveal className="flex items-center justify-between font-mono text-[0.72rem] text-muted-foreground">
          <span>{t.hero.index}</span>
          <span className="ltr hidden sm:inline">35.6892° N — 51.3890° E</span>
        </div>

        <div className="mt-auto pt-16">
          <h1
            className={cn(
              "hero-name font-display font-normal",
              // Line height goes last: tailwind-merge drops `leading-*` that precedes a font size.
              isFa
                ? "text-[clamp(3.4rem,17vw,6.5rem)] md:text-[clamp(4rem,13.5vw,13.5rem)]"
                : "text-[clamp(3.2rem,15vw,6rem)] tracking-[-0.03em] md:text-[clamp(4rem,12.5vw,13rem)]",
              "leading-[0.84]",
            )}
          >
            {/* Short first name, indented, with the bilingual caption beside it;
                the longer family name runs full width underneath. */}
            <span className="flex flex-wrap items-end gap-x-[4vw]">
              <Split as="span" lines={[t.name.first]} className="block ps-[9vw]" />
              <span
                data-reveal
                className={cn(
                  "mb-[1.4vw] hidden text-[clamp(1rem,1.5vw,1.5rem)] tracking-normal text-muted-foreground lg:block",
                  isFa ? "ltr font-serif italic" : "rtl font-fa text-[clamp(1.2rem,1.9vw,1.9rem)]",
                  "leading-snug",
                )}
              >
                {isFa ? "Narges Jafar Tabatabaei" : "نرگس جعفر طباطبایی"}
                <br />
                <span className="text-foreground">
                  {isFa ? "Product & Interactive Experience" : "طراح محصول و تجربه تعاملی"}
                </span>
              </span>
            </span>
            <Split
              as="span"
              lines={[t.name.last]}
              className={cn("foil block", !isFa && "italic")}
              delay={0.1}
            />
          </h1>
        </div>

        <div className="hero-rule mt-10 h-px origin-[100%_50%] bg-gradient-to-l from-accent/60 via-foreground/20 to-transparent ltr:origin-[0%_50%] ltr:bg-gradient-to-r" />

        <div className="grid gap-8 pt-6 md:grid-cols-12 md:items-end">
          <p data-reveal className="max-w-md text-lg leading-8 text-foreground-2 md:col-span-5">
            {profile[locale].tagline}
          </p>

          <dl data-reveal className="flex gap-10 text-xs text-muted-foreground md:col-span-4 md:justify-center">
            <div>
              <dt>{t.hero.projects}</dt>
              <dd className="mt-1 font-display text-5xl text-foreground">{n(projects.length)}</dd>
            </div>
            <div>
              <dt>{t.hero.courses}</dt>
              <dd className="mt-1 font-display text-5xl text-foreground">{n(certificates.length)}</dd>
            </div>
          </dl>

          <div data-reveal className="flex items-center gap-3 md:col-span-3 md:justify-end">
            <Magnetic>
              <a
                href="#work"
                className="group inline-flex h-12 items-center gap-3 rounded-full bg-accent ps-6 pe-2 text-sm font-medium text-accent-foreground transition-colors duration-500 hover:bg-foreground hover:text-background"
              >
                {t.hero.cta}
                <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-accent-foreground text-accent">
                  <ArrowDown className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-y-0.5" />
                </span>
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
