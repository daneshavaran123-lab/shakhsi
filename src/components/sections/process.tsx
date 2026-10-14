"use client";

import { useRef } from "react";

import { Split } from "@/components/motion/split";
import { SectionLabel } from "@/components/section-label";
import { useContent } from "@/content/provider";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useI18n } from "@/i18n/provider";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * "From idea to product": a spine that draws itself as you scroll, lighting
 * each step as the line reaches it. Steps alternate sides on wide screens.
 */
export function Process() {
  const { t, n, locale } = useI18n();
  const steps = useContent().services[locale].process;
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  useSectionMotion(root);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".process-fill",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: list.current, start: "top 62%", end: "bottom 62%", scrub: 0.6 },
          },
        );
        gsap.utils.toArray<HTMLElement>(".process-step").forEach((el) => {
          ScrollTrigger.create({ trigger: el, start: "top 62%", toggleClass: { targets: el, className: "is-on" } });
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".process-fill", { scaleY: 1 });
        gsap.utils.toArray<HTMLElement>(".process-step").forEach((el) => el.classList.add("is-on"));
      });
    },
    { scope: root, dependencies: [steps.length] },
  );

  if (!steps.length) return null;

  return (
    <section ref={root} id="process" className="px-4 pb-28 sm:px-6 md:pb-40">
      <div className="mx-auto max-w-[100rem]">
        <div className="grid gap-10 md:grid-cols-12">
          <SectionLabel index={n("02")} className="md:col-span-4 lg:col-span-3">
            {t.process.label}
          </SectionLabel>
          <h2 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.95] md:col-span-8 lg:col-span-9">
            <Split as="span" lines={[t.process.heading[0]]} className="block" />
            <Split
              as="span"
              lines={[t.process.heading[1]]}
              className={cn("block text-muted-foreground", locale === "en" && "italic")}
              delay={0.1}
            />
          </h2>
        </div>

        <ol ref={list} className="relative mt-20 md:mt-28">
          {/* Spine: a quiet track and the accent line that fills it. */}
          <span aria-hidden className="absolute inset-y-0 start-5 w-px bg-border md:start-1/2" />
          <span
            aria-hidden
            className="process-fill absolute inset-y-0 start-5 w-px origin-top bg-gradient-to-b from-accent via-accent to-accent/0 md:start-1/2"
          />

          {steps.map((step, i) => {
            const flip = i % 2 === 1;
            return (
              <li
                key={step.title}
                className="process-step group relative grid min-h-40 grid-cols-[2.5rem_1fr] gap-x-6 pb-16 last:pb-0 md:grid-cols-2 md:gap-x-24 md:pb-24"
              >
                {/* Node */}
                <span
                  aria-hidden
                  className="absolute start-5 top-2 z-10 grid size-4 -translate-x-1/2 place-items-center rounded-full bg-background ring-1 ring-border transition-all duration-700 ease-out-expo group-[.is-on]:scale-125 group-[.is-on]:ring-accent md:start-1/2 rtl:translate-x-1/2"
                >
                  <span className="size-1.5 rounded-full bg-border transition-colors duration-700 group-[.is-on]:bg-accent" />
                </span>

                <div
                  className={cn(
                    "col-start-2 opacity-35 transition-all duration-1000 ease-out-expo group-[.is-on]:opacity-100 md:row-start-1",
                    flip ? "md:col-start-2 md:translate-x-6 md:group-[.is-on]:translate-x-0 rtl:md:-translate-x-6" : "md:col-start-1 md:text-end md:-translate-x-6 md:group-[.is-on]:translate-x-0 rtl:md:translate-x-6",
                  )}
                >
                  <span className="font-display text-[clamp(3.5rem,7vw,6.5rem)] leading-none text-transparent [-webkit-text-stroke:1px_var(--muted-foreground)] transition-[-webkit-text-stroke-color] duration-700 group-[.is-on]:[-webkit-text-stroke-color:var(--accent)]">
                    {n(String(i + 1).padStart(2, "0"))}
                  </span>
                  <h3 className="mt-3 font-display text-3xl md:text-4xl">{step.title}</h3>
                  <p
                    className={cn(
                      "mt-3 max-w-md leading-8 text-muted-foreground",
                      !flip && "md:ms-auto",
                    )}
                  >
                    {step.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
