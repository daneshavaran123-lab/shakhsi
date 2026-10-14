/** A project request from the order form, as sent to /api/order. */
export type OrderRequest = {
  locale: "fa" | "en";
  type: string;
  space: string;
  details: string;
  budget: string;
  timeline: string;
  name: string;
  org: string;
  phone: string;
  contact: string;
};

const labels = {
  fa: { title: "درخواست پروژه تازه", type: "نوع کار", space: "فضا", details: "توضیحات", budget: "بودجه", timeline: "زمان‌بندی", name: "نام", org: "سازمان", phone: "تلفن", contact: "ایمیل / تلگرام" },
  en: { title: "New project request", type: "Type", space: "Space", details: "Details", budget: "Budget", timeline: "Timeline", name: "Name", org: "Organisation", phone: "Phone", contact: "Email / Telegram" },
} as const;

/** Plain-text summary, used for Telegram, n8n and the mail/copy fallbacks. */
export function formatOrder(o: OrderRequest) {
  const l = labels[o.locale] ?? labels.fa;
  const rows: [string, string][] = [
    [l.type, o.type],
    [l.space, o.space],
    [l.budget, o.budget],
    [l.timeline, o.timeline],
    [l.name, o.name],
    [l.org, o.org],
    [l.phone, o.phone],
    [l.contact, o.contact],
  ];
  return [
    `— ${l.title} —`,
    ...rows.filter(([, v]) => v.trim()).map(([k, v]) => `${k}: ${v.trim()}`),
    "",
    `${l.details}:`,
    o.details.trim(),
  ].join("\n");
}

const max = { details: 3000, other: 200 } as const;

/** Narrow untrusted JSON to an OrderRequest, or null if it isn't one. */
export function parseOrder(input: unknown): OrderRequest | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const str = (k: string, limit: number = max.other) =>
    typeof raw[k] === "string" ? (raw[k] as string).slice(0, limit) : "";
  const o: OrderRequest = {
    locale: raw.locale === "en" ? "en" : "fa",
    type: str("type"),
    space: str("space"),
    details: str("details", max.details),
    budget: str("budget"),
    timeline: str("timeline"),
    name: str("name"),
    org: str("org"),
    phone: str("phone"),
    contact: str("contact"),
  };
  if (!o.type || !o.details.trim() || !o.name.trim() || !o.phone.trim()) return null;
  return o;
}
