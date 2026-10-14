"use client";

import { useEffect, useState } from "react";

const format = new Intl.DateTimeFormat("fa-IR", {
  timeZone: "Asia/Tehran",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Live Tehran time; renders a stable placeholder until mounted. */
export function TehranClock({ className }: { className?: string }) {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setNow(format.format(new Date()));
    update();
    const id = window.setInterval(update, 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      تهران <span className="tabular-nums">{now ?? "—:—"}</span>
    </span>
  );
}
