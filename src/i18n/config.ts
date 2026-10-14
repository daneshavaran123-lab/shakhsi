export const locales = ["fa", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fa";

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const dirOf = (locale: Locale) => (locale === "fa" ? "rtl" : "ltr");

const faDigits = "۰۱۲۳۴۵۶۷۸۹";

/** Locale-aware digits: Persian numerals in fa, Latin in en. */
export function num(locale: Locale, value: string | number) {
  const s = String(value);
  return locale === "fa" ? s.replace(/\d/g, (d) => faDigits[Number(d)]) : s;
}
