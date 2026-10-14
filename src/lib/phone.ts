import type { Locale } from "@/i18n/config";
import { num } from "@/i18n/config";

/** 0915… → tel:+98915…, displayed as grouped digits in the page's locale. */
export function formatPhone(raw: string, locale: Locale) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const intl = digits.startsWith("0") ? `+98${digits.slice(1)}` : `+${digits}`;
  const display =
    locale === "fa"
      ? num("fa", digits.replace(/^(\d{4})(\d{3})(\d{4})$/, "$1 $2 $3"))
      : intl.replace(/^(\+98)(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3 $4");
  return { href: `tel:${intl}`, display };
}
