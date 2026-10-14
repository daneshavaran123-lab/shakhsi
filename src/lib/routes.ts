import type { Locale } from "@/i18n/config";

// The standalone HTML export (npm run export:html) ships flat files per page.
const staticHtml = !!process.env.NEXT_PUBLIC_STATIC_HTML;

export type Page = "home" | "resume";

export function pageHref(locale: Locale | string, page: Page = "home") {
  if (staticHtml) return page === "home" ? `./${locale}.html` : `./${locale}-resume.html`;
  return page === "home" ? `/${locale}` : `/${locale}/resume`;
}
