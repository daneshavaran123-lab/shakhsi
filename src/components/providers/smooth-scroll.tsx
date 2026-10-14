"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/use-reduced-motion";

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

/**
 * Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger and
 * the scroll position never drift apart. Disabled for reduced motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const instance = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.95,
      anchors: { offset: -24 },
    });
    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    // The browser jumps to #anchors before fonts and the 3D stage settle the
    // layout; land on the section again once it has.
    let settle = 0;
    const id = decodeURIComponent(location.hash.slice(1));
    if (id && !id.startsWith("project-")) {
      document.fonts.ready.then(() => {
        settle = window.setTimeout(() => {
          ScrollTrigger.refresh();
          const target = document.getElementById(id);
          if (target) instance.scrollTo(target, { offset: -24, immediate: true });
        }, 150);
      });
    }

    return () => {
      window.clearTimeout(settle);
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
