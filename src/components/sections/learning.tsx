"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";

import { certificates, totalHours, type Certificate } from "@/data/certificates";
import { Split } from "@/components/motion/split";
import { SectionLabel } from "@/components/section-label";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useLenis } from "@/components/providers/smooth-scroll";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { gsap, useGSAP } from "@/lib/gsap";
import { toFa } from "@/lib/utils";

const stats = [
  { value: certificates.length, suffix: "", label: "دوره و گواهینامه" },
  { value: totalHours, suffix: "+", label: "ساعت آموزش ثبت‌شده" },
  { value: 6, suffix: "", label: "حوزه تخصصی" },
];

export function Learning() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [viewing, setViewing] = useState<Certificate | null>(null);
  const lenis = useLenis();
  useSectionMotion(root);

  useEffect(() => {
    if (viewing) lenis?.stop();
    else lenis?.start();
  }, [viewing, lenis]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Count-up stats.
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const end = Number(el.dataset.count);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: end,
            duration: 1.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
            onUpdate: () => (el.textContent = toFa(Math.round(obj.v))),
          });
        });
      });

      // Horizontal run through the certificates on large screens.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const t = track.current;
        const p = pin.current;
        if (!t || !p) return;
        const distance = () => t.scrollWidth - p.clientWidth;

        const tween = gsap.to(t, {
          // RTL: overflow runs to the left, so the track travels right.
          x: () => distance(),
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
            { scale: 1.12, rotate: 2 },
            {
              scale: 1,
              rotate: 0,
              ease: "none",
              scrollTrigger: {
                trigger: img,
                containerAnimation: tween,
                start: "left right",
                end: "center center",
                scrub: true,
              },
            },
          );
        });

        gsap.to(".learning-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: p,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: true,
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="learning" className="bg-ink text-paper">
      <div className="px-4 pt-28 pb-16 sm:px-6 md:pt-40">
        <div className="mx-auto grid max-w-[100rem] gap-12 md:grid-cols-12">
          <SectionLabel index="۰۳" className="text-paper/80 md:col-span-3">
            آموزش و گواهینامه‌ها
          </SectionLabel>
          <div className="md:col-span-9">
            <h2 className="font-display text-[clamp(2.8rem,6.6vw,7rem)] leading-[0.95]">
              <Split as="span" lines={["یادگیری مستمر،"]} className="block" />
              <Split as="span" lines={["از مدیریت تا هوش مصنوعی."]} className="block text-paper/45" delay={0.1} />
            </h2>
            <dl data-reveal-group className="mt-16 grid grid-cols-3 gap-4 border-t border-paper/15 pt-8">
              {stats.map((s) => (
                <div key={s.label} data-reveal>
                  <dd className="font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-none">
                    <span data-count={s.value}>{toFa(s.value)}</span>
                    {s.suffix && <span className="text-vermilion">{s.suffix}</span>}
                  </dd>
                  <dt className="mt-3 text-xs text-paper/55 sm:text-sm">{s.label}</dt>
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
          {certificates.map((c, i) => (
            <li key={c.id} data-reveal className="lg:w-[34rem] xl:w-[38rem]">
              <article className="group flex h-full flex-col">
                <button
                  type="button"
                  onClick={() => setViewing(c)}
                  aria-label={`نمایش گواهینامه ${c.title}`}
                  className="relative block cursor-zoom-in overflow-hidden rounded-md bg-paper/5"
                >
                  <Image
                    data-cert-img
                    src={c.image}
                    alt=""
                    sizes="(min-width: 1280px) 38rem, (min-width: 1024px) 34rem, 100vw"
                    placeholder="blur"
                    className="aspect-[4/3] w-full object-cover transition-[filter] duration-700 group-hover:brightness-105"
                  />
                  <span className="absolute top-3 left-3 grid size-10 place-items-center rounded-full bg-ink/70 text-paper opacity-0 backdrop-blur transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Maximize2 className="size-4" />
                  </span>
                </button>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[0.7rem] text-vermilion">{c.field}</p>
                    <h3 className="mt-2 font-display text-3xl leading-tight">{c.title}</h3>
                    <p className="mt-1 text-sm text-paper/55">{c.issuer}</p>
                  </div>
                  <span className="font-mono text-xs text-paper/35">
                    {toFa(String(i + 1).padStart(2, "0"))}
                  </span>
                </div>
                <p className="mt-4 text-[0.95rem] leading-7 text-paper/70">{c.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  {c.meta.map((m) => (
                    <span key={m} className="rounded-full bg-paper/10 px-3 py-1.5 text-paper/80">
                      {m}
                    </span>
                  ))}
                  {c.skills.map((s) => (
                    <span key={s} className="ltr rounded-full px-3 py-1.5 text-paper/50 ring-1 ring-paper/15">
                      {s}
                    </span>
                  ))}
                </div>
              </article>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-14 hidden w-full max-w-[100rem] items-center gap-4 px-6 font-mono text-xs text-paper/45 lg:flex">
          <span>اسکرول کنید</span>
          <span className="relative h-px flex-1 bg-paper/15">
            <span className="learning-progress absolute inset-0 origin-right scale-x-0 bg-vermilion" />
          </span>
          <span>{toFa(certificates.length)} گواهینامه</span>
        </div>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        {viewing && (
          <DialogContent className="bg-paper">
            <DialogTitle className="sr-only">{viewing.title}</DialogTitle>
            <DialogDescription className="sr-only">
              گواهینامه {viewing.title} — {viewing.issuer}
            </DialogDescription>
            <Image
              src={viewing.image}
              alt={`گواهینامه ${viewing.title} صادرشده توسط ${viewing.issuer}`}
              sizes="(min-width: 1024px) 64rem, 100vw"
              placeholder="blur"
              className="max-h-[82vh] w-full rounded-md object-contain"
            />
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}

