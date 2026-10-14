"use client";

import { useRef } from "react";
import { ArrowUpRight, Download, FileText } from "lucide-react";

import { Split } from "@/components/motion/split";
import { useContent } from "@/content/provider";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useI18n } from "@/i18n/provider";
import { pageHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** PDF downloads (fa/en) next to a preview of the page, plus the live résumé. */
export function ResumeDownload() {
  const { t, locale } = useI18n();
  const { profile } = useContent();
  const root = useRef<HTMLElement>(null);
  useSectionMotion(root);

  const files = (["fa", "en"] as const)
    .map((l) => ({ l, href: profile.resume[l], label: l === "fa" ? t.resume.pdfFa : t.resume.pdfEn }))
    .filter((f): f is { l: "fa" | "en"; href: string; label: string } => !!f.href)
    // The visitor's own language first.
    .sort((a) => (a.l === locale ? -1 : 1));

  if (!files.length) return null;
  // A stable name for the saved file, whatever the href looks like (the HTML export inlines it).
  const fileName = (l: string) => `narges-jafar-tabatabaei-resume-${l}.pdf`;

  return (
    <section ref={root} id="resume-download" className="px-4 pt-28 sm:px-6 md:pt-36">
      <div className="edge chapter relative mx-auto grid max-w-[100rem] gap-10 overflow-hidden rounded-3xl p-8 md:grid-cols-12 md:items-center md:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 end-0 size-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(216_187_138/0.18),transparent)]"
        />

        <div className="relative md:col-span-7">
          <p data-reveal className="flex items-center gap-3 text-sm text-accent">
            <span className="h-px w-8 bg-accent" />
            {t.resume.download}
          </p>
          <h2 className="mt-6 font-display text-[clamp(2.6rem,5.5vw,5.5rem)] leading-[0.95]">
            <Split as="span" lines={[t.resume.downloadTitle[0]]} className="block" />
            <Split
              as="span"
              lines={[t.resume.downloadTitle[1]]}
              className={cn("foil block", locale === "en" && "italic")}
              delay={0.1}
            />
          </h2>
          <p data-reveal className="mt-6 max-w-lg leading-8 text-foreground-2">
            {t.resume.downloadBody}
          </p>

          <div data-reveal className="mt-8 flex flex-wrap gap-3">
            {files.map((f, i) => (
              <a
                key={f.l}
                href={f.href}
                download={fileName(f.l)}
                className={cn(
                  "group inline-flex h-12 items-center gap-3 rounded-full px-5 text-sm transition-colors",
                  i === 0
                    ? "bg-accent font-medium text-accent-foreground hover:bg-accent-strong"
                    : "ring-1 ring-border hover:bg-foreground hover:text-background",
                )}
              >
                <Download className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-y-0.5" />
                {f.label}
                <span className="font-mono text-[0.65rem] opacity-60">PDF</span>
              </a>
            ))}
            <a
              href={pageHref(locale, "resume")}
              className="group inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm ring-1 ring-border transition-colors hover:bg-foreground hover:text-background"
            >
              <FileText className="size-4" />
              {t.resume.interactive}
              <ArrowUpRight className="size-3.5 transition-transform group-hover:rotate-45 rtl:-scale-x-100" />
            </a>
          </div>
        </div>

        {/* A tilted sheet of paper previewing the PDF. */}
        <a
          data-reveal
          href={files[0].href}
          download={fileName(files[0].l)}
          aria-label={files[0].label}
          className="group relative mx-auto block w-full max-w-sm [perspective:1200px] md:col-span-5"
        >
          <span className="absolute inset-4 translate-x-4 translate-y-4 rotate-3 rounded-lg bg-white/10" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/files/resume-preview-${files[0].l}.webp`}
            alt=""
            width={595}
            height={842}
            loading="lazy"
            className="relative w-full rounded-lg bg-white shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] ring-1 ring-black/10 transition-transform duration-700 ease-out-expo [transform:rotateY(-8deg)_rotateX(4deg)] group-hover:[transform:rotateY(0deg)_rotateX(0deg)_translateY(-6px)] rtl:[transform:rotateY(8deg)_rotateX(4deg)]"
          />
        </a>
      </div>
    </section>
  );
}
