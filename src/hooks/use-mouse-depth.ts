"use client";

import { useEffect, type RefObject } from "react";

import { gsap } from "@/lib/gsap";

/**
 * Pointer parallax for `[data-mouse-depth]` layers inside `area`: each layer
 * drifts by (pointer offset × depth) px, so negative depths move against the
 * pointer. Mouse only; nothing moves for touch or reduced motion.
 */
export function useMouseDepth(area: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = area.current;
    if (!el || !matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-mouse-depth]")).map((layer) => ({
      depth: Number(layer.dataset.mouseDepth || 0.03),
      x: gsap.quickTo(layer, "x", { duration: 1.1, ease: "power3.out" }),
      y: gsap.quickTo(layer, "y", { duration: 1.1, ease: "power3.out" }),
    }));
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - r.left - r.width / 2;
      const dy = e.clientY - r.top - r.height / 2;
      layers.forEach((l) => (l.x(dx * l.depth), l.y(dy * l.depth)));
    };
    const leave = () => layers.forEach((l) => (l.x(0), l.y(0)));
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [area]);
}
