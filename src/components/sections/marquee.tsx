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

import { useReducedMotion } from "@/hooks/use-reduced-motion";

const items = [
  { fa: "طراحی محصول", en: "Product" },
  { fa: "تجربه کاربری", en: "Experience" },
  { fa: "کیوسک تعاملی", en: "Kiosk" },
  { fa: "هوش مصنوعی کاربردی", en: "Applied AI" },
  { fa: "نمایشگر لمسی", en: "Touch" },
  { fa: "برندسازی", en: "Brand" },
];

/**
 * Drifts slowly in the reading direction; scrolling nudges its speed
 * and flips its direction, like a belt the page is pulling.
 */
export function Marquee() {
  const reduced = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 300 });
  const factor = useTransform(velocity, [-2000, 0, 2000], [-4, 0, 4], { clamp: false });
  const direction = useRef(1);
  const x = useTransform(base, (v) => `${wrap(0, 50, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    const move = direction.current * 1.4 * (delta / 1000) * (1 + Math.abs(f));
    base.set(base.get() + move);
  });

  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item.fa} className="flex items-center gap-6 pe-6">
          <span className="font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-none">{item.fa}</span>
          <span className="ltr font-serif text-[clamp(1.4rem,2.6vw,2.4rem)] text-stone italic">
            {item.en}
          </span>
          <svg viewBox="0 0 24 24" className="size-5 text-vermilion" aria-hidden>
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
    <section aria-label="حوزه‌ها" className="overflow-hidden border-y py-7">
      <motion.div className="flex w-max" style={{ x }}>
        {row(false)}
        {row(true)}
      </motion.div>
    </section>
  );
}
