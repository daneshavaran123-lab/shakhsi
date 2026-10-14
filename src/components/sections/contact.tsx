"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Check, Copy, Phone } from "lucide-react";

import { useContent } from "@/content/provider";
import { Split } from "@/components/motion/split";
import { Magnetic } from "@/components/motion/magnetic";
import { SectionLabel } from "@/components/section-label";
import { TehranClock } from "@/components/tehran-clock";
import { useLenis } from "@/components/providers/smooth-scroll";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function Contact() {
  const { t, n, locale } = useI18n();
  const { profile } = useContent();
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const lenis = useLenis();

  // 0915… → +98915… for the tel: link; grouped digits for display.
  const digits = profile.phone.replace(/\D/g, "");
  const phone = digits
    ? {
        intl: digits.startsWith("0") ? `+98${digits.slice(1)}` : `+${digits}`,
        display:
          locale === "fa"
            ? n(digits.replace(/^(\d{4})(\d{3})(\d{4})$/, "$1 $2 $3"))
            : (digits.startsWith("0") ? `+98 ${digits.slice(1)}` : `+${digits}`).replace(
                /^(\+98) (\d{3})(\d{3})(\d{4})$/,
                "$1 $2 $3 $4",
              ),
      }
    : null;
  useSectionMotion(root);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
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
      className="relative -mt-8 overflow-hidden rounded-t-[2rem] bg-background px-4 pt-28 pb-8 sm:px-6 md:-mt-12 md:rounded-t-[3rem] md:pt-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/3 start-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)] rtl:translate-x-1/2"
      />
      <div className="relative mx-auto max-w-[100rem]">
        <SectionLabel index={n("04")}>{t.contact.label}</SectionLabel>

        <h2 className="mt-12 font-display text-[clamp(3.4rem,11vw,12rem)] leading-[0.9]">
          <Split as="span" lines={[t.contact.heading[0]]} className="block" />
          <Split
            as="span"
            lines={[t.contact.heading[1]]}
            className={cn("foil block ps-[10vw]", locale === "en" && "italic")}
            delay={0.1}
          />
        </h2>

        <div className="mt-16 grid gap-10 md:grid-cols-12 md:items-end">
          <p data-reveal className="max-w-md leading-8 text-foreground-2 md:col-span-5">
            {t.contact.body}
          </p>

          <div data-reveal className="flex flex-wrap items-center gap-3 md:col-span-7 md:justify-end">
            <Magnetic strength={0.15}>
              <a
                href={`mailto:${profile.email}`}
                className="link-draw ltr inline-block font-mono text-[clamp(1rem,2.2vw,1.6rem)]"
              >
                {profile.email}
              </a>
            </Magnetic>
            <button
              type="button"
              onClick={copy}
              className="relative grid size-11 cursor-pointer place-items-center rounded-full ring-1 ring-border transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label={t.contact.copy}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? "ok" : "copy"}
                  initial={{ scale: 0.4, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.35, duration: 0.4 }}
                >
                  {copied ? <Check className="size-4 text-[#7fd18b]" /> : <Copy className="size-4" />}
                </motion.span>
              </AnimatePresence>
              <AnimatePresence>
                {copied && (
                  <motion.span
                    role="status"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute -top-9 rounded-full bg-foreground px-3 py-1 text-xs whitespace-nowrap text-background"
                  >
                    {t.contact.copied}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            {phone && (
              <a
                href={`tel:${phone.intl}`}
                aria-label={`${t.contact.call}: ${phone.display}`}
                className="group inline-flex h-11 basis-full items-center justify-start gap-3 md:justify-end"
              >
                <span className="grid size-11 place-items-center rounded-full ring-1 ring-border transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <Phone className="size-4" />
                </span>
                <span className="link-draw ltr font-mono text-[clamp(1rem,2.2vw,1.6rem)]">{phone.display}</span>
              </a>
            )}
          </div>
        </div>

        <footer className="mt-32 flex flex-col gap-6 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t.contact.rights}</p>
          <TehranClock className="font-mono" />
          <button
            type="button"
            onClick={toTop}
            className="group inline-flex cursor-pointer items-center gap-2 self-start text-foreground sm:self-auto"
          >
            {t.contact.top}
            <span className="grid size-8 place-items-center rounded-full ring-1 ring-border transition-transform duration-500 ease-out-expo group-hover:-translate-y-1">
              <ArrowUp className="size-3.5" />
            </span>
          </button>
        </footer>
      </div>
    </section>
  );
}
