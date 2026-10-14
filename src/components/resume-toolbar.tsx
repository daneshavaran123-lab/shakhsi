"use client";

import { ArrowLeft, Printer } from "lucide-react";
import { motion } from "motion/react";

import { LanguageSwitch, ThemeToggle } from "@/components/sections/header";
import { useI18n } from "@/i18n/provider";
import { pageHref } from "@/lib/routes";

export function ResumeToolbar() {
  const { t, locale } = useI18n();
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5 print:hidden"
    >
      <div className="mx-auto flex h-14 max-w-[62rem] items-center justify-between rounded-full bg-background/70 ps-2 pe-2 shadow-[0_0_0_1px_var(--border)] backdrop-blur-xl">
        <a
          href={pageHref(locale)}
          className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm transition-colors hover:bg-foreground/5"
        >
          <ArrowLeft className="size-4 ltr:rotate-0 rtl:rotate-180" />
          {t.resume.back}
        </a>
        <div className="flex items-center gap-2">
          <LanguageSwitch page="resume" className="hidden sm:flex" />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-strong"
          >
            <Printer className="size-4" />
            <span className="hidden sm:inline">{t.resume.print}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
