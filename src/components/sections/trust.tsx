"use client";

import { useRef } from "react";

import { useContent } from "@/content/provider";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useI18n } from "@/i18n/provider";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Proof in one band: who the work was for, and four honest numbers that
 * count up as they arrive.
 */
export function Trust() {
  const { t, n, locale } = useI18n();
  const { projects, extras } = useContent();
  const clients = extras[locale].clients;
  const root = useRef<HTMLElement>(null);
  useSectionMotion(root);

  const stats = [
    { value: projects.length, label: t.trust.stats.projects },
    { value: clients.length, label: t.trust.stats.clients },
    { value: 6, label: t.trust.stats.teaching },
    { text: t.trust.productYears, label: t.trust.stats.product },
  ].filter((s) => s.text || s.value);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const end = Number(el.dataset.count);
          const state = { v: 0 };
          gsap.to(state, {
            v: end,
            duration: 1.6,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
            onUpdate: () => {
              el.textContent = n(Math.round(state.v));
            },
          });
        });
      });
    },
    { scope: root, dependencies: [locale] },
  );

  return (
    <section ref={root} id="trust" aria-label={t.trust.label} className="px-4 pb-28 sm:px-6 md:pb-40">
      <div className="mx-auto max-w-[100rem] border-y">
        <dl data-reveal-group className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              data-reveal
              className="flex flex-col-reverse justify-end border-border px-2 py-8 not-first:border-s max-md:[&:nth-child(3)]:border-s-0 max-md:[&:nth-child(n+3)]:border-t md:px-8 md:py-12"
            >
              <dt className="mt-3 text-sm text-muted-foreground">{s.label}</dt>
              <dd className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-none">
                {s.text ? (
                  s.text
                ) : (
                  <span data-count={s.value}>{n(s.value ?? 0)}</span>
                )}
                {i < 2 && <span className="text-accent">+</span>}
              </dd>
            </div>
          ))}
        </dl>

        {clients.length > 0 && (
          <div className="border-t py-6">
            <p className="sr-only">{t.trust.label}</p>
            <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              {[0, 1].map((copy) => (
                <ul
                  key={copy}
                  aria-hidden={copy === 1 || undefined}
                  className="trust-belt flex shrink-0 items-center gap-12 pe-12 motion-reduce:animate-none"
                >
                  {clients.map((c) => (
                    <li key={c} className="flex items-center gap-12 whitespace-nowrap text-lg text-foreground-2">
                      {c}
                      <span aria-hidden className="size-1.5 rotate-45 bg-accent/70" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
