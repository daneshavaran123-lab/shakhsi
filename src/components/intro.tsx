"use client";

import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useI18n } from "@/i18n/provider";

/** How long the hero should wait for the curtain, in seconds. */
export const INTRO_SECONDS = 1.55;

export const introActive = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("intro");

/**
 * First-visit curtain: the name settles while a counter runs to 100, then the
 * page is uncovered. The inline head script decides whether it shows (once
 * per session, never with reduced motion or a deep link), so there's no flash.
 */
export function Intro() {
  const { t, n } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !introActive()) return;

    const done = () => {
      document.documentElement.classList.remove("intro");
      try {
        sessionStorage.setItem("intro", "1");
      } catch {}
    };

    const counter = { v: 0 };
    const tl = gsap.timeline({ onComplete: done });
    tl.fromTo(
      el.querySelectorAll(".intro-word"),
      { yPercent: 110 },
      { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 },
      0,
    )
      .to(counter, {
        v: 100,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: () => {
          if (count.current) count.current.textContent = n(String(Math.round(counter.v)).padStart(2, "0"));
        },
      }, 0)
      .fromTo(el.querySelector(".intro-bar"), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0)
      .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.75, ease: "expo.inOut" }, 1.05);

    return () => {
      tl.kill();
      done();
    };
  }, [n]);

  return (
    <div
      ref={root}
      aria-hidden
      className="intro-overlay fixed inset-0 z-[90] flex flex-col justify-between bg-background p-6 sm:p-10"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <span className="font-mono text-xs text-muted-foreground">{t.hero.index}</span>
      <p className="font-display text-[clamp(2.6rem,8vw,7rem)] leading-none">
        {t.name.full.split(" ").map((w, i) => (
          <span key={i} className="split-mask me-[0.25em]">
            <span className="intro-word inline-block">{w}</span>
          </span>
        ))}
      </p>
      <div className="flex items-center gap-4">
        <span className="relative h-px flex-1 bg-border">
          <span className="intro-bar absolute inset-0 origin-right scale-x-0 bg-accent ltr:origin-left" />
        </span>
        <span ref={count} className="font-mono text-sm tabular-nums">
          {n("00")}
        </span>
      </div>
    </div>
  );
}
