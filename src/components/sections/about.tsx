"use client";

import { useRef } from "react";

import { Split } from "@/components/motion/split";
import { SectionLabel } from "@/components/section-label";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useI18n } from "@/i18n/provider";
import { useContent } from "@/content/provider";

export function About() {
  const { t, n, locale } = useI18n();
  const copy = useContent().profile[locale];
  const root = useRef<HTMLElement>(null);
  useSectionMotion(root);

  return (
    <section ref={root} id="about" className="px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto grid max-w-[100rem] gap-12 md:grid-cols-12">
        <SectionLabel index={n("01")} className="md:col-span-3">
          {t.about.label}
        </SectionLabel>

        <div className="md:col-span-9">
          <Split
            mode="scrub"
            as="p"
            className="font-display text-[clamp(2rem,4.4vw,4.4rem)] leading-[1.15]"
            lines={copy.about}
          />

          <div data-reveal-group className="mt-20 grid gap-4 sm:grid-cols-3">
            {copy.principles.map((p, i) => (
              <article
                key={p.title}
                data-reveal
                className="edge group relative overflow-hidden rounded-xl bg-card/60 p-6 transition-colors duration-500 hover:bg-card md:p-8"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -end-10 -top-10 size-40 rounded-full bg-accent/0 blur-3xl transition-colors duration-700 group-hover:bg-accent/20"
                />
                <span className="font-mono text-xs text-accent">{n(`0${i + 1}`)}</span>
                <h3 className="mt-12 font-display text-3xl md:text-4xl">{p.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-7 text-muted-foreground">{p.body}</p>
              </article>
            ))}
          </div>

          <p data-reveal className="mt-10 max-w-2xl text-sm leading-7 text-muted-foreground">
            {copy.fields}
          </p>
        </div>
      </div>
    </section>
  );
}
