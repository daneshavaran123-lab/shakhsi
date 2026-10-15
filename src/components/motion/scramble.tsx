"use client";

import { useEffect, useRef, useState } from "react";

const glyphs = {
  fa: "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی",
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
} as const;

/**
 * Text that briefly shuffles its letters before settling — re-run by
 * `active` turning on. Width is held by the real text so nothing jumps.
 */
export function Scramble({ text, active, locale }: { text: string; active: boolean; locale: "fa" | "en" }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!active) return setOut(text);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const set = glyphs[locale];
    const total = 14;
    let frame = 0;
    let id = 0;
    const tick = () => {
      frame++;
      const settled = Math.floor((frame / total) * text.length);
      setOut(
        [...text]
          .map((ch, i) => (i < settled || ch === " " ? ch : set[Math.floor(Math.random() * set.length)]))
          .join(""),
      );
      if (frame < total) id = window.setTimeout(tick, 28);
      else setOut(text);
    };
    tick();
    return () => window.clearTimeout(id);
  }, [active, text, locale]);

  return (
    <span className="relative inline-grid">
      <span className="invisible col-start-1 row-start-1">{text}</span>
      <span aria-hidden className="col-start-1 row-start-1">
        {out}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

/** Decodes from noise into its text the first time it scrolls into view. */
export function DecodeOnView({ text, locale }: { text: string; locale: "fa" | "en" }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span ref={ref}>
      <Scramble text={text} active={seen} locale={locale} />
    </span>
  );
}
