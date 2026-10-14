"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Check, Copy } from "lucide-react";

import { site } from "@/data/site";
import { Split } from "@/components/motion/split";
import { Magnetic } from "@/components/motion/magnetic";
import { SectionLabel } from "@/components/section-label";
import { TehranClock } from "@/components/tehran-clock";
import { useLenis } from "@/components/providers/smooth-scroll";
import { useSectionMotion } from "@/hooks/use-section-motion";

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const lenis = useLenis();
  useSectionMotion(root);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section
      ref={root}
      id="contact"
      className="relative -mt-8 rounded-t-[2rem] bg-paper px-4 pt-28 pb-8 sm:px-6 md:-mt-12 md:rounded-t-[3rem] md:pt-40"
    >
      <div className="mx-auto max-w-[100rem]">
        <SectionLabel index="۰۴">ارتباط</SectionLabel>

        <h2 className="mt-12 font-display text-[clamp(3.4rem,11vw,12rem)] leading-[0.88]">
          <Split as="span" lines={["برای گفتگو"]} className="block" />
          <Split as="span" lines={["درباره همکاری."]} className="block ps-[10vw] text-vermilion" delay={0.1} />
        </h2>

        <div className="mt-16 grid gap-10 md:grid-cols-12 md:items-end">
          <p data-reveal className="max-w-md leading-8 text-ink-2 md:col-span-5">
            برای معرفی پروژه، همکاری یا دریافت جزئیات بیشتر درباره هر یک از نمونه‌کارها، یک ایمیل
            کافی است.
          </p>

          <div data-reveal className="flex flex-wrap items-center gap-3 md:col-span-7 md:justify-end">
            <Magnetic strength={0.15}>
              <a
                href={`mailto:${site.email}`}
                className="link-draw ltr inline-block font-mono text-[clamp(1rem,2.2vw,1.6rem)] text-ink"
              >
                {site.email}
              </a>
            </Magnetic>
            <button
              type="button"
              onClick={copy}
              className="relative grid size-11 cursor-pointer place-items-center rounded-full ring-1 ring-ink/15 transition-colors hover:bg-ink hover:text-paper"
              aria-label="کپی نشانی ایمیل"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? "ok" : "copy"}
                  initial={{ scale: 0.4, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.35, duration: 0.4 }}
                >
                  {copied ? <Check className="size-4 text-[#2f8f4e]" /> : <Copy className="size-4" />}
                </motion.span>
              </AnimatePresence>
              <AnimatePresence>
                {copied && (
                  <motion.span
                    role="status"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute -top-9 rounded-full bg-ink px-3 py-1 text-xs whitespace-nowrap text-paper"
                  >
                    کپی شد
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        <footer className="mt-32 flex flex-col gap-6 border-t pt-6 text-xs text-stone sm:flex-row sm:items-center sm:justify-between">
          <p>© ۲۰۲۶ — {site.name}</p>
          <TehranClock className="font-mono" />
          <button
            type="button"
            onClick={toTop}
            className="group inline-flex cursor-pointer items-center gap-2 self-start text-ink sm:self-auto"
          >
            بازگشت به بالا
            <span className="grid size-8 place-items-center rounded-full ring-1 ring-ink/15 transition-transform duration-500 ease-out-expo group-hover:-translate-y-1">
              <ArrowUp className="size-3.5" />
            </span>
          </button>
        </footer>
      </div>
    </section>
  );
}
