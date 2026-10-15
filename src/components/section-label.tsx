"use client";

import { DecodeOnView } from "@/components/motion/scramble";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/** "(03) —— Services": a small mono caption that decodes as it arrives. */
export function SectionLabel({
  index,
  children,
  className,
}: {
  index?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { locale } = useI18n();
  return (
    <div data-reveal className={cn("flex items-center gap-3 self-start font-mono text-xs", className)}>
      {index && <span className="text-accent">({index})</span>}
      <span className="h-px w-8 bg-current/25" />
      <span className="text-foreground-2 ltr:tracking-[0.16em] ltr:uppercase">
        {typeof children === "string" ? <DecodeOnView text={children} locale={locale} /> : children}
      </span>
    </div>
  );
}
