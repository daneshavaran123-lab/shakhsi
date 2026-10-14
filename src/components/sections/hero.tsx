"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowDownLeft } from "lucide-react";

import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/data/site";
import { projects } from "@/data/projects";
import { certificates } from "@/data/certificates";
import { Split } from "@/components/motion/split";
import { Magnetic } from "@/components/motion/magnetic";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { toFa } from "@/lib/utils";

const DotField = dynamic(() => import("@/components/three/dot-field"), {
  ssr: false,
});

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  const reduced = useReducedMotion();

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
        tl.fromTo(".hero-canvas", { autoAlpha: 0, scale: 1.06 }, { autoAlpha: 1, scale: 1, duration: 2.4 }, 0)
          .set("[data-split]", { autoAlpha: 1 }, 0)
          .fromTo(
            "[data-split] .split-word",
            { yPercent: 120, rotate: -4 },
            { yPercent: 0, rotate: 0, duration: 1.5, stagger: 0.09 },
            0.1,
          )
          .fromTo(
            "[data-reveal]",
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.07, ease: "power4.out" },
            0.7,
          )
          .fromTo(".hero-rule", { scaleX: 0 }, { scaleX: 1, duration: 1.6, transformOrigin: "100% 50%" }, 0.6);

        // Name drifts up and loosens as you leave the hero.
        gsap.to(".hero-name", {
          yPercent: -18,
          opacity: 0.2,
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

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-[100svh] flex-col overflow-hidden px-4 pt-24 pb-6 sm:px-6"
    >
      <div
        className="hero-canvas pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent_0%,black_30%,black_70%,transparent_100%)]"
        style={{ visibility: "hidden" }}
      >
        <DotField active={inView} still={reduced} eventSource={root} />
      </div>

      <div className="relative mx-auto flex w-full max-w-[100rem] flex-1 flex-col">
        <div
          data-reveal
          className="flex items-center justify-between font-mono text-[0.72rem] text-stone"
        >
          <span>(۰۰) — پورتفولیو ۱۴۰۵</span>
          <span className="ltr hidden sm:inline">35.6892° N — 51.3890° E</span>
        </div>

        <div className="mt-auto pt-16">
          <h1 className="hero-name font-display text-[clamp(3.6rem,19vw,7rem)] md:text-[clamp(4.2rem,15.5vw,15rem)] leading-[0.82] font-medium tracking-[-0.01em]">
            <Split as="span" lines={["نرگس جعفر"]} className="block" />
            <span className="flex flex-wrap items-end gap-x-[3vw]">
              <Split as="span" lines={["طباطبایی"]} className="block ps-[9vw]" delay={0.1} />
              <span
                data-reveal
                className="ltr mb-[1.4vw] hidden font-serif tracking-normal text-[clamp(1rem,1.6vw,1.6rem)] leading-tight text-stone italic lg:block"
              >
                Narges Jafar Tabatabaei
                <br />
                <span className="text-ink">Product & Interactive Experience</span>
              </span>
            </span>
          </h1>
        </div>

        <div className="hero-rule mt-10 h-px bg-ink/20" />

        <div className="grid gap-8 pt-6 md:grid-cols-12 md:items-end">
          <p data-reveal className="max-w-md text-lg leading-8 text-ink-2 md:col-span-5">
            {site.role}؛ از نمایشگر لمسی ۶۵ اینچی اتاق مدیران تا کیوسک موزه —
            طراحی برای مسئله واقعی، با سادگی و کارایی.
          </p>

          <dl
            data-reveal
            className="flex gap-10 font-mono text-xs text-stone md:col-span-4 md:justify-center"
          >
            <div>
              <dt>پروژه منتخب</dt>
              <dd className="mt-1 font-display text-4xl text-ink">{toFa(projects.length)}</dd>
            </div>
            <div>
              <dt>دوره تخصصی</dt>
              <dd className="mt-1 font-display text-4xl text-ink">{toFa(certificates.length)}</dd>
            </div>
          </dl>

          <div data-reveal className="flex items-center gap-3 md:col-span-3 md:justify-end">
            <Magnetic>
              <a
                href="#work"
                className="group inline-flex h-12 items-center gap-3 rounded-full bg-ink ps-6 pe-2 text-sm text-paper transition-colors duration-500 hover:bg-vermilion"
              >
                دیدن نمونه‌کارها
                <span className="grid size-8 place-items-center rounded-full bg-paper text-ink transition-transform duration-500 ease-out-expo group-hover:rotate-[-45deg]">
                  <ArrowDownLeft className="size-4" />
                </span>
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
