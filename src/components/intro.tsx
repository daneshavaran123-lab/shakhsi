"use client";

import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { useI18n } from "@/i18n/provider";

/** Fired on window when the preloader starts uncovering the page. */
export const INTRO_DONE = "intro:done";

export const introActive = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("intro");

/** Runs `cb` once the preloader has lifted (immediately when there is none). */
export function afterIntro(cb: () => void) {
  if (!introActive()) {
    cb();
    return () => {};
  }
  window.addEventListener(INTRO_DONE, cb, { once: true });
  return () => window.removeEventListener(INTRO_DONE, cb);
}

/**
 * Preloader: a counter that follows what is actually loading (type, the
 * first screen's images, the page itself), then splits open down the middle.
 * The inline head script decides whether it shows — once per session, never
 * with reduced motion or a deep link — so there's no flash either way.
 */
export function Intro() {
  const { t, n } = useI18n();
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const status = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !introActive()) return;

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      document.documentElement.classList.remove("intro");
      window.dispatchEvent(new Event(INTRO_DONE));
      try {
        sessionStorage.setItem("intro", "1");
      } catch {}
    };

    // Real progress: fonts 30%, first-screen images 50%, window load 20%.
    const progress = { fonts: 0, images: 0, page: document.readyState === "complete" ? 1 : 0 };
    document.fonts.ready.then(() => (progress.fonts = 1));
    const imgs = Array.from(document.images).filter((img) => img.getBoundingClientRect().top < innerHeight * 1.5);
    const settleImages = () => {
      progress.images = imgs.length ? imgs.filter((i) => i.complete).length / imgs.length : 1;
    };
    imgs.forEach((img) => img.addEventListener("load", settleImages, { once: true }));
    settleImages();
    const onLoad = () => (progress.page = 1);
    window.addEventListener("load", onLoad, { once: true });

    const started = performance.now();
    const shown = { v: 0 };
    let exiting = false;
    let stage = -1;

    const tick = () => {
      const real = progress.fonts * 30 + progress.images * 50 + progress.page * 20;
      // Never faster than a beat, never stuck: time alone carries it home after 4s.
      const elapsed = (performance.now() - started) / 1000;
      const target = Math.min(real, elapsed * 80, 100);
      const forced = Math.min(100, (elapsed / 4) * 100);
      shown.v += (Math.max(target, forced) - shown.v) * 0.12;
      const v = Math.min(100, Math.round(shown.v + 0.4));
      if (count.current) count.current.textContent = n(String(v).padStart(3, "0"));
      el.style.setProperty("--p", String(v / 100));

      const nextStage = v >= 100 ? 2 : v >= 45 ? 1 : 0;
      if (nextStage !== stage && status.current) {
        stage = nextStage;
        status.current.textContent = t.loader.states[stage];
      }
      if (v >= 100 && !exiting) {
        exiting = true;
        exit();
      }
    };
    gsap.ticker.add(tick);

    const exit = () => {
      gsap.ticker.remove(tick);
      gsap
        .timeline({ defaults: { ease: "expo.inOut" } })
        .to(el.querySelectorAll(".loader-rise"), { yPercent: -110, duration: 0.7, stagger: 0.04, ease: "expo.in" }, 0.15)
        .to(el.querySelector(".loader-line"), { scaleX: 0, duration: 0.6, ease: "expo.in" }, 0.15)
        .add(done, 0.75)
        .to(el.querySelector(".loader-top"), { yPercent: -100, duration: 1.1 }, 0.75)
        .to(el.querySelector(".loader-bottom"), { yPercent: 100, duration: 1.1 }, 0.75)
        .set(el, { display: "none" });
    };

    return () => {
      gsap.ticker.remove(tick);
      imgs.forEach((img) => img.removeEventListener("load", settleImages));
      window.removeEventListener("load", onLoad);
      done();
    };
  }, [n, t]);

  return (
    <div ref={root} aria-hidden className="intro-overlay chapter fixed inset-0 z-[90] text-foreground">
      {/* The two halves that split apart. */}
      <div className="loader-top absolute inset-x-0 top-0 h-1/2 bg-background" />
      <div className="loader-bottom absolute inset-x-0 bottom-0 h-1/2 bg-background" />

      <div className="relative flex h-full flex-col justify-between p-5 sm:p-8">
        <div className="flex justify-between overflow-hidden font-mono text-[0.68rem] text-muted-foreground ltr:tracking-[0.18em] ltr:uppercase">
          <span className="loader-rise inline-block">{t.name.full}</span>
          <span className="loader-rise inline-block">{t.loader.label}</span>
        </div>

        <div className="overflow-hidden text-center">
          <span
            ref={count}
            className="loader-rise inline-block font-display text-[clamp(5rem,18vw,15rem)] leading-none tabular-nums"
          >
            {n("000")}
          </span>
        </div>

        <div>
          <div className="relative h-px bg-border">
            <span className="loader-line absolute inset-0 origin-right bg-accent [transform:scaleX(var(--p,0))] ltr:origin-left" />
          </div>
          <div className="mt-3 flex justify-between overflow-hidden font-mono text-[0.68rem] text-muted-foreground ltr:tracking-[0.18em] ltr:uppercase">
            <span ref={status} className="loader-rise inline-block">
              {t.loader.states[0]}
            </span>
            <span className="loader-rise ltr inline-block">35.6892° N — 51.3890° E</span>
          </div>
        </div>
      </div>
    </div>
  );
}
