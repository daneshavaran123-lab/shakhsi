"use client";

import type { RefObject } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Wires the shared motion vocabulary inside one section:
 *  - [data-split="rise"]   words rise out of their masks
 *  - [data-split="scrub"]  words ink in as the paragraph scrolls past
 *  - [data-reveal]         fade/slide up, staggered per [data-reveal-group]
 *  - [data-parallax]       slow drift, speed from the attribute value
 */
export function useSectionMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { reduce } = ctx.conditions as { motion: boolean; reduce: boolean };
          const root = scope.current;
          if (!root) return;

          const splits = gsap.utils.toArray<HTMLElement>("[data-split]", root);
          const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);

          if (reduce) {
            gsap.set([...splits, ...reveals], { autoAlpha: 1 });
            return;
          }

          splits.forEach((el) => {
            const words = el.querySelectorAll<HTMLElement>(".split-word");
            gsap.set(el, { autoAlpha: 1 });

            if (el.dataset.split === "scrub") {
              gsap.fromTo(
                words,
                { opacity: 0.14 },
                {
                  opacity: 1,
                  ease: "none",
                  stagger: 0.1,
                  scrollTrigger: {
                    trigger: el,
                    start: "top 78%",
                    end: "bottom 45%",
                    scrub: 1,
                  },
                },
              );
              return;
            }

            gsap.fromTo(
              words,
              { yPercent: 115, rotate: -3 },
              {
                yPercent: 0,
                rotate: 0,
                duration: 1.15,
                ease: "expo.out",
                stagger: 0.045,
                delay: Number(el.dataset.delay ?? 0),
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              },
            );
          });

          const groups = new Map<Element, HTMLElement[]>();
          reveals.forEach((el) => {
            const key = el.closest("[data-reveal-group]") ?? el;
            groups.set(key, [...(groups.get(key) ?? []), el]);
          });

          groups.forEach((items, trigger) => {
            gsap.fromTo(
              items,
              { autoAlpha: 0, y: 28 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 1,
                ease: "power4.out",
                stagger: 0.08,
                scrollTrigger: { trigger, start: "top 86%", once: true },
              },
            );
          });

          gsap.utils.toArray<HTMLElement>("[data-parallax]", root).forEach((el) => {
            const speed = Number(el.dataset.parallax || 0.12);
            gsap.fromTo(
              el,
              { yPercent: speed * 100 },
              {
                yPercent: -speed * 100,
                ease: "none",
                scrollTrigger: {
                  trigger: el.parentElement ?? el,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.2,
                },
              },
            );
          });
        },
      );

      // Fonts and images shift layout; re-measure once they settle.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope },
  );
}
