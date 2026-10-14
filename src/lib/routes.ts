import type { Locale } from "@/i18n/config";

// The standalone HTML export (npm run export:html) ships flat files per page.
const staticHtml = !!process.env.NEXT_PUBLIC_STATIC_HTML;

export type Page = "home" | "resume" | `work/${string}`;

export function pageHref(locale: Locale | string, page: Page = "home") {
  if (page.startsWith("work/")) {
    // Case-study pages need a server build; the HTML export opens the project sheet instead.
    const id = page.slice(5);
    return staticHtml ? `./${locale}.html#project-${id}` : `/${locale}/work/${id}`;
  }
  if (staticHtml) return page === "home" ? `./${locale}.html` : `./${locale}-resume.html`;
  return page === "home" ? `/${locale}` : `/${locale}/resume`;
}

/** Whether per-project case-study pages exist in this build. */
export const hasCaseStudies = !staticHtml;
