"use client";

import { useEffect, useState } from "react";

import { useI18n } from "@/i18n/provider";

/** Live Tehran time; renders a stable placeholder until mounted. */
export function TehranClock({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-GB", {
      timeZone: "Asia/Tehran",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const update = () => setNow(format.format(new Date()));
    update();
    const id = window.setInterval(update, 15_000);
    return () => window.clearInterval(id);
  }, [locale]);

  return (
    <span className={className} suppressHydrationWarning>
      {t.tehran} <span className="tabular-nums">{now ?? "—:—"}</span>
    </span>
  );
}
