"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";

import { useI18n } from "@/i18n/provider";
import { dictionaries } from "@/i18n/dictionary";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Drifts slowly in the reading direction; scrolling nudges its speed
 * and flips its direction, like a belt the page is pulling.
 * Each term is paired with its counterpart in the other language.
 */
export function Marquee() {
  const { locale, dir } = useI18n();
  const reduced = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 300 });
  const factor = useTransform(velocity, [-2000, 0, 2000], [-4, 0, 4], { clamp: false });
  const direction = useRef(1);
  // RTL rows overflow to the left, LTR rows to the right.
  const sign = dir === "rtl" ? 1 : -1;
  const x = useTransform(base, (v) => `${sign * wrap(0, 50, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    base.set(base.get() + direction.current * 1.4 * (delta / 1000) * (1 + Math.abs(f)));
  });

  const primary = dictionaries[locale].marquee;
  const secondary = dictionaries[locale === "fa" ? "en" : "fa"].marquee;

  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {primary.map((term, i) => (
        <span key={term} className="flex items-center gap-6 pe-6">
          <span className="font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-none">{term}</span>
          <span
            className={
              locale === "fa"
                ? "ltr font-serif text-[clamp(1.3rem,2.4vw,2.2rem)] text-muted-foreground italic"
                : "rtl font-fa text-[clamp(1.5rem,2.8vw,2.6rem)] text-muted-foreground"
            }
          >
            {secondary[i]}
          </span>
          <svg viewBox="0 0 24 24" className="size-5 text-accent" aria-hidden>
            <path
              d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0z"
              fill="currentColor"
            />
          </svg>
        </span>
      ))}
    </div>
  );

  return (
    <section aria-label={primary.join(" · ")} className="overflow-hidden border-y py-7">
      <motion.div className="flex w-max" style={{ x }}>
        {row(false)}
        {row(true)}
      </motion.div>
    </section>
  );
}
