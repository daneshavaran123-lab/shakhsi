"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MousePointer2 } from "lucide-react";

import { Split } from "@/components/motion/split";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useI18n } from "@/i18n/provider";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const Cluster = dynamic(() => import("@/components/three/cluster"), { ssr: false });

/**
 * The approach in one sentence, set under a cluster of glossy objects you can
 * push around. While the section is pinned the sentence inks in word by word,
 * then the cluster loosens and drifts apart as you scroll on.
 */
export function Manifesto() {
  const { t, locale } = useI18n();
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const spread = useRef(0);
  const [inView, setInView] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    setNarrow(matchMedia("(max-width: 767px)").matches);
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "15% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>(".split-word", root.current);
      gsap.set("[data-split]", { autoAlpha: 1 });
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          words,
          { opacity: 0.12 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: root.current, start: "top 40%", end: "55% bottom", scrub: 0.6 },
          },
        );
        gsap.to(spread, {
          current: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "55% bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="manifesto" className="chapter relative" style={{ height: "210svh" }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <div aria-hidden className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
          {inView && (
            <Cluster
              active={inView}
              still={reduced}
              accent="#d8bb8a"
              spread={spread}
              eventSource={root}
              count={narrow ? 14 : 22}
              side={locale === "fa" ? -1 : 1}
            />
          )}
        </div>

        <div className="pointer-events-none relative mx-auto flex h-full max-w-[100rem] flex-col justify-between px-4 pt-24 pb-10 sm:px-6">
          <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
            <span className="flex items-center gap-3">
              <span className="text-accent">(✦)</span>
              <span className="h-px w-8 bg-current/25" />
              <span className="ltr:tracking-[0.16em] ltr:uppercase">{t.manifesto.label}</span>
            </span>
            <span className="hidden items-center gap-2 sm:flex">
              <MousePointer2 className="size-3.5" aria-hidden />
              {t.manifesto.hint}
            </span>
          </div>

          <div>
            <Split
              as="p"
              mode="scrub"
              lines={t.manifesto.text}
              lineClassName="block"
              className={cn(
                "max-w-[30ch] font-display text-[clamp(2rem,4.4vw,4.8rem)] leading-[1.08]",
                locale === "en" && "tracking-[-0.02em]",
              )}
            />
            <p className="mt-8 border-t pt-5 font-mono text-xs text-muted-foreground">{t.manifesto.foot}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
