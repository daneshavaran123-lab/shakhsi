"use client";

import type { RefObject } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { duration, gsapEase, scrub, stagger } from "@/lib/motion";

/**
 * Wires the shared motion vocabulary inside one section. Everything plays
 * once, animates transforms/opacity/clip only (no layout), and collapses to
 * a static page for reduced motion.
 *
 *  - [data-split="rise"]    words rise out of their masks, softly sharpening
 *  - [data-split="scrub"]   words ink in as the paragraph scrolls past
 *  - [data-reveal]          enter preset, staggered per [data-reveal-group]:
 *                             ""/"up" fade + rise · "blur" blur to sharp ·
 *                             "scale" settle from 96% · "clip" wipe up
 *  - [data-image-reveal]    framed media wipes open while the image settles
 *  - [data-portrait]        clip-path curtain reveal
 *  - [data-parallax]        slow drift, speed from the attribute value
 *  - [data-curtain]         the section rises in from slightly narrower
 *  - [data-exit]            content you've read eases back as it leaves
 *  - [data-mouse-depth]     pointer parallax inside [data-mouse-parallax]
 */

const presets: Record<string, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
  up: { from: { autoAlpha: 0, y: 28 }, to: { autoAlpha: 1, y: 0 } },
  blur: { from: { autoAlpha: 0, y: 14, filter: "blur(8px)" }, to: { autoAlpha: 1, y: 0, filter: "blur(0px)" } },
  scale: { from: { autoAlpha: 0, scale: 0.96 }, to: { autoAlpha: 1, scale: 1 } },
  clip: {
    from: { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" },
    to: { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)" },
  },
};

export function useSectionMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
          fine: "(pointer: fine)",
        },
        (ctx) => {
          const { reduce, fine } = ctx.conditions as { motion: boolean; reduce: boolean; fine: boolean };
          const root = scope.current;
          if (!root) return;

          const splits = gsap.utils.toArray<HTMLElement>("[data-split]", root);
          const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
          const images = gsap.utils.toArray<HTMLElement>("[data-image-reveal]", root);

          if (reduce) {
            gsap.set([...splits, ...reveals, ...images], { autoAlpha: 1 });
            return;
          }
          const cleanups: (() => void)[] = [];

          splits.forEach((el) => {
            const words = el.querySelectorAll<HTMLElement>(".split-word");
            gsap.set(el, { autoAlpha: 1 });

            if (el.dataset.split === "scrub") {
              gsap.fromTo(
                words,
                { opacity: 0.14 },
                {
                  opacity: 1,
                  ease: gsapEase.scrub,
                  stagger: 0.1,
                  scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 45%", scrub },
                },
              );
              return;
            }

            gsap.fromTo(
              words,
              { yPercent: 115, rotate: -3, opacity: 0.4 },
              {
                yPercent: 0,
                rotate: 0,
                opacity: 1,
                duration: 1.15,
                ease: gsapEase.out,
                stagger: stagger.word,
                delay: Number(el.dataset.delay ?? 0),
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              },
            );
          });

          // Label first, heading next, then details: one trigger per group.
          const groups = new Map<Element, HTMLElement[]>();
          reveals.forEach((el) => {
            const key = el.closest("[data-reveal-group]") ?? el;
            groups.set(key, [...(groups.get(key) ?? []), el]);
          });
          groups.forEach((items, trigger) => {
            const tl = gsap.timeline({ scrollTrigger: { trigger, start: "top 86%", once: true } });
            items.forEach((el, i) => {
              const preset = presets[el.dataset.reveal || "up"] ?? presets.up;
              tl.fromTo(
                el,
                preset.from,
                { ...preset.to, duration: duration.reveal, ease: gsapEase.reveal, clearProps: "filter,clipPath" },
                i * stagger.item,
              );
            });
          });

          // Framed media: the frame wipes open while the picture settles inside it.
          images.forEach((frame) => {
            const img = frame.querySelector("img, video");
            gsap.set(frame, { autoAlpha: 1 });
            const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: "top 85%", once: true } });
            tl.fromTo(
              frame,
              { clipPath: "inset(100% 0% 0% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: duration.section, ease: gsapEase.out, clearProps: "clipPath" },
            );
            if (img) tl.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.6, ease: gsapEase.out, clearProps: "scale" }, 0);
          });

          gsap.utils.toArray<HTMLElement>("[data-portrait]", root).forEach((el) => {
            gsap.fromTo(
              el,
              { clipPath: "inset(100% 0% 0% 0% round 1rem)" },
              {
                clipPath: "inset(0% 0% 0% 0% round 1rem)",
                duration: 1.4,
                ease: gsapEase.out,
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
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
                ease: gsapEase.scrub,
                scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub },
              },
            );
          });

          // Section handoff, in: the band arrives a touch narrower and opens to full width.
          const curtains = root.matches("[data-curtain]") ? [root] : gsap.utils.toArray<HTMLElement>("[data-curtain]", root);
          curtains.forEach((el) => {
            const radius = getComputedStyle(el).borderTopLeftRadius || "0px";
            gsap.fromTo(
              el,
              { clipPath: `inset(0% 2.5% 0% 2.5% round ${radius} ${radius} 0 0)` },
              {
                clipPath: `inset(0% 0% 0% 0% round ${radius} ${radius} 0 0)`,
                ease: gsapEase.scrub,
                scrollTrigger: { trigger: el, start: "top bottom", end: "top 35%", scrub },
              },
            );
          });

          // Section handoff, out: what you've finished reading eases back and dims.
          gsap.utils.toArray<HTMLElement>("[data-exit]", root).forEach((el) => {
            gsap.fromTo(
              el,
              { opacity: 1, y: 0 },
              {
                opacity: 0.25,
                y: () => -window.innerHeight * 0.06,
                ease: gsapEase.scrub,
                scrollTrigger: {
                  trigger: el,
                  start: "bottom 45%",
                  end: "bottom top",
                  scrub,
                  invalidateOnRefresh: true,
                },
              },
            );
          });

          // Pointer depth: layers drift against each other, barely.
          if (fine) {
            const areas = root.matches("[data-mouse-parallax]")
              ? [root]
              : gsap.utils.toArray<HTMLElement>("[data-mouse-parallax]", root);
            areas.forEach((area) => {
              const layers = Array.from(area.querySelectorAll<HTMLElement>("[data-mouse-depth]")).map((layer) => ({
                depth: Number(layer.dataset.mouseDepth || 0.03),
                x: gsap.quickTo(layer, "x", { duration: 1, ease: "power3.out" }),
                y: gsap.quickTo(layer, "y", { duration: 1, ease: "power3.out" }),
              }));
              const move = (e: PointerEvent) => {
                const r = area.getBoundingClientRect();
                const dx = e.clientX - r.left - r.width / 2;
                const dy = e.clientY - r.top - r.height / 2;
                layers.forEach((l) => (l.x(dx * l.depth), l.y(dy * l.depth)));
              };
              const leave = () => layers.forEach((l) => (l.x(0), l.y(0)));
              area.addEventListener("pointermove", move);
              area.addEventListener("pointerleave", leave);
              cleanups.push(() => {
                area.removeEventListener("pointermove", move);
                area.removeEventListener("pointerleave", leave);
              });
            });
          }
          return () => cleanups.forEach((fn) => fn());
        },
      );

      // Fonts and images shift layout; re-measure once they settle.
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      if (document.readyState !== "complete") window.addEventListener("load", refresh, { once: true });
      return () => window.removeEventListener("load", refresh);
    },
    { scope },
  );
}
