import type { MetadataRoute } from "next";

import { getContent } from "@/content/read";
import { locales } from "@/i18n/config";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getContent();
  const alternates = (path: string) => ({
    languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])),
  });
  const page = (path: string, priority: number) =>
    locales.map((l) => ({ url: `${siteUrl}/${l}${path}`, lastModified: new Date(), priority, alternates: alternates(path) }));

  return [
    ...page("", 1),
    ...page("/resume", 0.8),
    ...(process.env.NEXT_PUBLIC_STATIC_HTML ? [] : projects.flatMap((p) => page(`/work/${p.id}`, 0.7))),
  ];
}
