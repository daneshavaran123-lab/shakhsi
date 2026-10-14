import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { createReader } from "@keystatic/core/reader";
import { imageSize } from "image-size";
import sharp from "sharp";

import keystaticConfig from "../../keystatic.config";
import type { Certificate, Img, Profile, Project, Services, ServicesCopy, SiteContent } from "./types";

const reader = createReader(process.cwd(), keystaticConfig);

/** Measure a /public image and make a tiny blurred placeholder for next/image. */
async function toImg(src: string | null | undefined): Promise<Img | null> {
  if (!src) return null;
  try {
    const file = await readFile(path.join(process.cwd(), "public", src));
    const { width = 1600, height = 1000 } = imageSize(file);
    const tiny = await sharp(file).resize(16).webp({ quality: 40 }).toBuffer();
    return { src, width, height, blurDataURL: `data:image/webp;base64,${tiny.toString("base64")}` };
  } catch {
    return null;
  }
}

const byOrder = <T extends { order: number | null }>(a: T, b: T) => (a.order ?? 999) - (b.order ?? 999);

export const getContent = cache(async (): Promise<SiteContent> => {
  const [projectEntries, certEntries, profileEntry, servicesEntry] = await Promise.all([
    reader.collections.projects.all(),
    reader.collections.certificates.all(),
    reader.singletons.profile.read(),
    reader.singletons.services.read(),
  ]);

  const projects: Project[] = await Promise.all(
    projectEntries
      .map(({ slug, entry }) => ({ slug, ...entry }))
      .sort(byOrder)
      .map(async (p) => ({
        id: p.slug,
        eng: p.eng,
        group: p.group,
        url: p.url || undefined,
        live: p.live,
        images: (await Promise.all(p.images.map(toImg))).filter((i): i is Img => i !== null),
        fa: { title: p.title, ...p.fa, services: [...p.fa.services], features: [...p.fa.features], tech: [...p.fa.tech], uses: [...p.fa.uses] },
        en: { ...p.en, title: p.en.title || p.title, services: [...p.en.services], features: [...p.en.features], tech: [...p.en.tech], uses: [...p.en.uses] },
      })),
  );

  const certificates: Certificate[] = (
    await Promise.all(
      certEntries
        .map(({ slug, entry }) => ({ slug, ...entry }))
        .sort(byOrder)
        .map(async (c): Promise<Certificate | null> => {
          const image = await toImg(c.image);
          if (!image) return null;
          return {
            id: c.slug,
            skills: [...c.skills],
            hours: c.hours ?? undefined,
            image,
            fa: { title: c.title, ...c.fa, meta: [...c.fa.meta] },
            en: { ...c.en, title: c.en.title || c.title, meta: [...c.en.meta] },
          };
        }),
    )
  ).filter((c): c is Certificate => c !== null);

  if (!profileEntry) throw new Error("content/profile.yaml is missing");
  const copy = (p: typeof profileEntry.fa) => ({
    tagline: p.tagline,
    about: [...p.about],
    bio: p.bio,
    principles: p.principles.map((x) => ({ ...x })),
    experience: p.experience.map((x) => ({ ...x, url: x.url || undefined })),
    education: p.education.map((x) => ({ ...x })),
    languages: p.languages.map((x) => ({ ...x })),
    fields: p.fields,
  });
  const profile: Profile = {
    portrait: (await toImg(profileEntry.portrait)) ?? undefined,
    email: profileEntry.email,
    phone: profileEntry.phone,
    linkedin: profileEntry.linkedin || undefined,
    telegram: profileEntry.telegram?.replace(/^@/, "") || undefined,
    companyUrl: profileEntry.companyUrl || undefined,
    stack: profileEntry.stack.map((g) => ({ ...g, items: [...g.items] })),
    available: profileEntry.available,
    specialistFields: profileEntry.specialistFields ?? 6,
    fa: copy(profileEntry.fa),
    en: copy(profileEntry.en),
  };

  if (!servicesEntry) throw new Error("content/services.yaml is missing");
  const servicesCopy = (c: typeof servicesEntry.fa): ServicesCopy => ({
    heading: [...c.heading],
    intro: c.intro,
    items: c.items.map((i) => ({ ...i, points: [...i.points] })),
    packagesTitle: c.packagesTitle,
    packages: c.packages.map((p) => ({ ...p, projects: [...p.projects] })),
    cta: c.cta,
  });
  const services: Services = { fa: servicesCopy(servicesEntry.fa), en: servicesCopy(servicesEntry.en) };

  return { projects, certificates, profile, services };
});
