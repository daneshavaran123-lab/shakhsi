"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

import { navKeys } from "@/data/site";
import { Scramble } from "@/components/motion/scramble";
import { LanguageSwitch } from "@/components/sections/header";
import { TehranClock } from "@/components/tehran-clock";
import { useContent } from "@/content/provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useI18n } from "@/i18n/provider";
import { formatPhone } from "@/lib/phone";
import { pageHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

const Fluid = dynamic(() => import("@/components/three/fluid"), { ssr: false });
const ease = [0.16, 1, 0.3, 1] as const;
const inks = ["#d8bb8a", "#ede8df", "#c0884a"];

/**
 * Full-screen menu: oversized links over a pool of ink that follows the
 * pointer, with contact details and the time in Tehran along the bottom.
 */
export function Menu({ onNavigate }: { onNavigate: (hash?: string) => void }) {
  const { t, n, locale } = useI18n();
  const { profile } = useContent();
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const phone = formatPhone(profile.phone, locale);

  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === "Escape" && onNavigate();
    window.addEventListener("keydown", key);
    root.current?.querySelector<HTMLElement>("a")?.focus();
    return () => window.removeEventListener("keydown", key);
  }, [onNavigate]);

  const links = [
    ...navKeys.map((key) => ({ key, label: t.nav[key], href: `#${key}` })),
    { key: "resume", label: t.resume.title, href: pageHref(locale, "resume") },
  ];
  const socials = [
    profile.telegram && { label: "Telegram", href: `https://t.me/${profile.telegram}` },
    profile.linkedin && { label: "LinkedIn", href: profile.linkedin },
    profile.companyUrl && { label: t.contact.company, href: profile.companyUrl },
  ].filter((s): s is { label: string; href: string } => !!s);

  return (
    <motion.div
      ref={root}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t.nav.label}
      data-lenis-prevent
      className="chapter fixed inset-0 z-[45] overflow-y-auto bg-background text-foreground"
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ clipPath: "inset(100% 0% 0% 0%)" }}
      transition={{ duration: 0.9, ease }}
    >
      <div aria-hidden className="pointer-events-none fixed inset-0 opacity-90">
        <Fluid active still={reduced} colors={inks} light={false} eventSource={root} />
      </div>

      <div className="relative mx-auto flex min-h-full max-w-[100rem] flex-col px-4 pt-28 pb-8 sm:px-6 md:pt-32">
        <nav aria-label={t.nav.label} className="flex-1">
          <ul onMouseLeave={() => setHovered(null)}>
            {links.map((l, i) => (
              <li key={l.key} className="overflow-hidden border-b border-border">
                <motion.a
                  href={l.href}
                  onClick={(e) => {
                    if (!l.href.startsWith("#")) return;
                    e.preventDefault();
                    onNavigate(l.href);
                  }}
                  onMouseEnter={() => setHovered(l.key)}
                  onFocus={() => setHovered(l.key)}
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-105%", transition: { duration: 0.5, ease, delay: i * 0.02 } }}
                  transition={{ duration: 0.9, ease, delay: 0.25 + i * 0.05 }}
                  className={cn(
                    "group flex items-baseline gap-4 py-2 transition-opacity duration-500 md:gap-8 md:py-3",
                    hovered && hovered !== l.key && "opacity-30",
                  )}
                >
                  <span className="w-8 shrink-0 font-mono text-xs text-accent">{n(String(i + 1).padStart(2, "0"))}</span>
                  <span className="font-display text-[clamp(2.6rem,7.5vw,7rem)] leading-[1.05] transition-transform duration-700 ease-out-expo group-hover:translate-x-4 rtl:group-hover:-translate-x-4">
                    <Scramble text={l.label} active={hovered === l.key} locale={locale} />
                  </span>
                  <ArrowUpRight className="ms-auto size-6 shrink-0 self-center opacity-0 transition-all duration-500 group-hover:rotate-45 group-hover:opacity-100 rtl:-scale-x-100" />
                </motion.a>
              </li>
            ))}
          </ul>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.7, duration: 0.8, ease } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="mt-14 grid gap-8 text-sm sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <p className="font-mono text-[0.68rem] text-muted-foreground ltr:tracking-[0.18em] ltr:uppercase">{t.menu.contact}</p>
            <a href={`mailto:${profile.email}`} className="link-draw ltr mt-3 inline-block font-mono text-xs">
              {profile.email}
            </a>
            {phone && (
              <a href={phone.href} className="link-draw ltr mt-2 block w-fit font-mono text-xs">
                {phone.display}
              </a>
            )}
          </div>
          <div>
            <p className="font-mono text-[0.68rem] text-muted-foreground ltr:tracking-[0.18em] ltr:uppercase">{t.menu.follow}</p>
            <ul className="mt-3 space-y-2">
              {socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-draw">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[0.68rem] text-muted-foreground ltr:tracking-[0.18em] ltr:uppercase">{t.tehran}</p>
            <TehranClock bare className="mt-3 block font-display text-4xl" />
          </div>
          <div className="flex items-end lg:justify-end">
            <LanguageSwitch />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
