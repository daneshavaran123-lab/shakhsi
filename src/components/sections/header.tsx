"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";

import { nav, site } from "@/data/site";
import { TehranClock } from "@/components/tehran-clock";
import { useLenis } from "@/components/providers/smooth-scroll";
import { cn, toFa } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export function Header() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 240 && !open);
    setScrolled(y > 24);
  });

  const toggleMenu = (next: boolean) => {
    setOpen(next);
    if (next) lenis?.stop();
    else lenis?.start();
  };

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: hidden ? "-110%" : 0, opacity: 1 }}
        transition={{ duration: 0.7, ease }}
        className="fixed inset-x-0 top-0 z-40 px-4 pt-3 sm:px-6"
      >
        <div
          className={cn(
            "mx-auto flex h-14 max-w-[100rem] items-center justify-between rounded-full ps-5 pe-2 transition-[background-color,box-shadow,backdrop-filter] duration-500",
            scrolled && !open && "bg-paper/75 shadow-[0_0_0_1px_var(--border)] backdrop-blur-md",
          )}
        >
          <a
            href="#top"
            className="group relative z-50 flex items-baseline gap-2 text-[0.95rem] font-semibold tracking-tight"
            onClick={() => toggleMenu(false)}
          >
            <span className="relative">
              نرگس طباطبایی
              <span className="absolute -start-2.5 top-0.5 size-1.5 rounded-full bg-vermilion transition-transform duration-500 ease-out-expo group-hover:scale-150" />
            </span>
          </a>

          <nav aria-label="ناوبری اصلی" className="hidden md:block">
            <ul className="flex items-center" onMouseLeave={() => setHovered(null)}>
              {nav.map((item) => (
                <li key={item.href} className="relative">
                  <a
                    href={item.href}
                    onMouseEnter={() => setHovered(item.href)}
                    onFocus={() => setHovered(item.href)}
                    className="relative z-10 block px-4 py-2 text-sm text-ink-2 transition-colors hover:text-ink"
                  >
                    {item.label}
                  </a>
                  {hovered === item.href && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-ink/[0.06]"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <TehranClock className="hidden font-mono text-xs text-stone sm:inline" />
            <a
              href={`mailto:${site.email}`}
              className="hidden h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm text-paper transition-colors hover:bg-vermilion md:inline-flex"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7fd18b] opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-[#7fd18b]" />
              </span>
              آماده همکاری
            </a>
            <button
              type="button"
              className="relative z-50 grid size-11 cursor-pointer place-items-center rounded-full md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "بستن منو" : "باز کردن منو"}
              onClick={() => toggleMenu(!open)}
            >
              <span className="relative block h-3 w-6">
                <motion.span
                  className="absolute inset-x-0 top-0 h-px bg-current"
                  animate={open ? { top: "50%", rotate: 45 } : { top: "0%", rotate: 0 }}
                  transition={{ duration: 0.5, ease }}
                />
                <motion.span
                  className="absolute inset-x-0 bottom-0 h-px bg-current"
                  animate={open ? { bottom: "50%", rotate: -45 } : { bottom: "0%", rotate: 0 }}
                  transition={{ duration: 0.5, ease }}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-30 flex flex-col justify-between bg-paper px-6 pt-28 pb-10 md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease }}
          >
            <nav aria-label="منوی موبایل">
              <ul className="space-y-1">
                {nav.map((item, i) => (
                  <li key={item.href} className="overflow-hidden">
                    <motion.a
                      href={item.href}
                      onClick={() => toggleMenu(false)}
                      className="flex items-baseline justify-between border-b py-3 font-display text-5xl"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ duration: 0.7, ease, delay: 0.15 + i * 0.06 }}
                    >
                      {item.label}
                      <span className="font-mono text-xs text-stone">{toFa(`0${i + 1}`)}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
              className="space-y-2 text-sm"
            >
              <a href={`mailto:${site.email}`} className="block font-mono text-ink">
                {site.email}
              </a>
              <TehranClock className="block font-mono text-xs text-stone" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
