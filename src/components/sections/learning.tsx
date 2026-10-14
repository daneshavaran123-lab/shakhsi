"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";

import type { Certificate } from "@/content/types";
import { useContent } from "@/content/provider";
import { Split } from "@/components/motion/split";
import { SectionLabel } from "@/components/section-label";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useLenis } from "@/components/providers/smooth-scroll";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useI18n } from "@/i18n/provider";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export function Learning() {
  const { t, n, locale, dir } = useI18n();
  const { certificates, profile } = useContent();
  const totalHours = certificates.reduce((sum, c) => sum + (c.hours ?? 0), 0);
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [viewing, setViewing] = useState<Certificate | null>(null);
  const lenis = useLenis();
  useSectionMotion(root);

  const stats = [
    { value: certificates.length, suffix: "" },
    { value: totalHours, suffix: "+" },
    { value: profile.specialistFields, suffix: "" },
  ];

  useEffect(() => {
    if (viewing) lenis?.stop();
    else lenis?.start();
  }, [viewing, lenis]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const end = Number(el.dataset.count);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: end,
            duration: 1.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
            onUpdate: () => (el.textContent = n(Math.round(obj.v))),
          });
        });
      });

      // Horizontal run through the certificates on large screens.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const tr = track.current;
        const p = pin.current;
        if (!tr || !p) return;
        const distance = () => tr.scrollWidth - p.clientWidth;
        // RTL overflows to the left, so the track travels right; LTR the reverse.
        const sign = dir === "rtl" ? 1 : -1;

        const tween = gsap.to(tr, {
          x: () => sign * distance(),
          ease: "none",
          scrollTrigger: {
            trigger: p,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-cert-img]").forEach((img) => {
          gsap.fromTo(
            img,
            { scale: 1.12, rotate: sign * -2 },
            {
              scale: 1,
              rotate: 0,
              ease: "none",
              scrollTrigger: {
                trigger: img,
                containerAnimation: tween,
                start: dir === "rtl" ? "right left" : "left right",
                end: "center center",
                scrub: true,
              },
            },
          );
        });

        gsap.to(".learning-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: p, start: "top top", end: () => `+=${distance()}`, scrub: true },
        });
      });
    },
    { scope: root, dependencies: [dir] },
  );

  return (
    <section ref={root} id="learning" className="chapter">
      <div className="px-4 pt-28 pb-16 sm:px-6 md:pt-40">
        <div className="mx-auto grid max-w-[100rem] gap-12 md:grid-cols-12">
          <SectionLabel index={n("06")} className="md:col-span-3">
            {t.learning.label}
          </SectionLabel>
          <div className="md:col-span-9">
            <h2 className="font-display text-[clamp(2.8rem,6.6vw,7rem)] leading-[0.95]">
              <Split as="span" lines={[t.learning.heading[0]]} className="block" />
              <Split
                as="span"
                lines={[t.learning.heading[1]]}
                className={cn("block text-muted-foreground", locale === "en" && "italic")}
                delay={0.1}
              />
            </h2>
            <dl data-reveal-group className="mt-16 grid grid-cols-3 gap-4 border-t pt-8">
              {stats.map((s, i) => (
                <div key={i} data-reveal className="flex flex-col-reverse">
                  <dt className="mt-3 text-xs text-muted-foreground sm:text-sm">{t.learning.stats[i]}</dt>
                  <dd className="font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-none">
                    <span data-count={s.value}>{n(s.value)}</span>
                    {s.suffix && <span className="text-accent">{s.suffix}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div ref={pin} className="overflow-hidden pb-24 lg:flex lg:h-svh lg:flex-col lg:justify-center lg:pb-0">
        <ul
          ref={track}
          data-reveal-group
          className="flex flex-col gap-6 px-4 sm:px-6 lg:w-max lg:flex-row lg:gap-8 lg:px-[6vw]"
        >
          {certificates.map((c, i) => {
            const copy = c[locale];
            return (
              <li key={c.id} data-reveal className="lg:w-[34rem] xl:w-[38rem]">
                <article className="group flex h-full flex-col">
                  <button
                    type="button"
                    onClick={() => setViewing(c)}
                    aria-label={t.learning.open(copy.title)}
                    className="edge relative block cursor-zoom-in overflow-hidden rounded-xl bg-card"
                  >
                    <Image
                      data-cert-img
                      src={c.image}
                      alt=""
                      sizes="(min-width: 1280px) 38rem, (min-width: 1024px) 34rem, 100vw"
                      placeholder="blur"
                      className="aspect-[4/3] w-full object-cover transition-[filter] duration-700 group-hover:brightness-110"
                    />
                    <span className="absolute end-3 top-3 grid size-10 place-items-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <Maximize2 className="size-4" />
                    </span>
                  </button>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.72rem] text-accent">{copy.field}</p>
                      <h3 className="mt-2 font-display text-3xl leading-tight">{copy.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{copy.issuer}</p>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {n(String(i + 1).padStart(2, "0"))}
                    </span>
                  </div>
                  <p className="mt-4 text-[0.95rem] leading-7 text-foreground-2">{copy.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs">
                    {copy.meta.map((m) => (
                      <span key={m} className="rounded-full bg-foreground/[0.07] px-3 py-1.5 text-foreground-2">
                        {m}
                      </span>
                    ))}
                    {c.skills.map((s) => (
                      <span key={s} className="ltr rounded-full px-3 py-1.5 text-muted-foreground ring-1 ring-border">
                        {s}
                      </span>
                    ))}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <div className="mx-auto mt-14 hidden w-full max-w-[100rem] items-center gap-4 px-6 font-mono text-xs text-muted-foreground lg:flex">
          <span>{t.learning.scroll}</span>
          <span className="relative h-px flex-1 bg-border">
            <span className="learning-progress absolute inset-0 origin-right scale-x-0 bg-accent ltr:origin-left" />
          </span>
          <span>
            {n(certificates.length)} {t.learning.certificates}
          </span>
        </div>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        {viewing && (
          <DialogContent className="bg-card" closeLabel={t.sheet.close}>
            <DialogTitle className="sr-only">{viewing[locale].title}</DialogTitle>
            <DialogDescription className="sr-only">{viewing[locale].issuer}</DialogDescription>
            <Image
              src={viewing.image}
              alt={t.learning.alt(viewing[locale].title, viewing[locale].issuer)}
              sizes="(min-width: 1024px) 64rem, 100vw"
              placeholder="blur"
              className="max-h-[82vh] w-full rounded-lg object-contain"
            />
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
