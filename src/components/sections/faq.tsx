"use client";

import { useRef } from "react";
import { Quote } from "lucide-react";

import { Split } from "@/components/motion/split";
import { SectionLabel } from "@/components/section-label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useContent } from "@/content/provider";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/** Client words (when there are any) and the questions people ask first. */
export function Faq() {
  const { t, n, locale } = useI18n();
  const { faq, testimonials } = useContent().extras[locale];
  const root = useRef<HTMLElement>(null);
  useSectionMotion(root);

  if (!faq.length && !testimonials.length) return null;

  return (
    <section ref={root} id="faq" className="px-4 pb-36 sm:px-6 md:pb-48">
      <div className="mx-auto max-w-[100rem]">
        {testimonials.length > 0 && (
          <div className="mb-28 md:mb-40">
            <SectionLabel>{t.testimonials.label}</SectionLabel>
            <div data-reveal-group className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {testimonials.map((q) => (
                <figure key={q.name + q.quote} data-reveal className="edge flex flex-col rounded-2xl bg-card/60 p-8">
                  <Quote className="size-6 text-accent rtl:-scale-x-100" aria-hidden />
                  <blockquote className="mt-5 flex-1 font-display text-2xl leading-snug">{q.quote}</blockquote>
                  <figcaption className="mt-8 border-t pt-5 text-sm">
                    <span className="block text-foreground">{q.name}</span>
                    {q.role && <span className="mt-1 block text-muted-foreground">{q.role}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        {faq.length > 0 && (
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4 lg:col-span-3">
              <SectionLabel index={n("08")}>{t.faq.label}</SectionLabel>
            </div>
            <div className="md:col-span-8 lg:col-span-9">
              <h2 className="font-display text-[clamp(2.4rem,5vw,5rem)] leading-none">
                <Split as="span" lines={[locale === "fa" ? "پیش از شروع،" : "Before we start,"]} className="block" />
                <Split
                  as="span"
                  lines={[locale === "fa" ? "پاسخ پرسش‌های رایج." : "a few common questions."]}
                  className={cn("block text-muted-foreground", locale === "en" && "italic")}
                  delay={0.1}
                />
              </h2>
              <Accordion data-reveal type="single" collapsible className="mt-10 border-t">
                {faq.map((item, i) => (
                  <AccordionItem key={item.q} value={String(i)}>
                    <AccordionTrigger className="font-display text-[clamp(1.4rem,2.4vw,2.1rem)] leading-snug">
                      <span className="flex gap-5">
                        <span className="mt-2 font-mono text-xs text-muted-foreground">{n(String(i + 1).padStart(2, "0"))}</span>
                        {item.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="max-w-3xl ps-10 leading-8 text-foreground-2">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
