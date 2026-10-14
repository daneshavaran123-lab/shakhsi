import type { Locale } from "@/i18n/config";

export type Img = { src: string; width: number; height: number; blurDataURL: string };

export const projectGroups = ["all", "management", "culture", "retail", "ai"] as const;
export type ProjectGroup = (typeof projectGroups)[number];

export type ProjectCopy = {
  title: string;
  category: string;
  status: string;
  summary: string;
  intro: string;
  value: string;
  hardware: string;
  services: string[];
  features: string[];
  tech: string[];
  uses: string[];
};

export type Project = {
  id: string;
  /** Latin product line shown as a subtitle in Persian. */
  eng: string;
  group: Exclude<ProjectGroup, "all">;
  url?: string;
  live: boolean;
  images: Img[];
} & Record<Locale, ProjectCopy>;

export type CertificateCopy = {
  title: string;
  field: string;
  issuer: string;
  summary: string;
  meta: string[];
};

export type Certificate = {
  id: string;
  skills: string[];
  hours?: number;
  image: Img;
} & Record<Locale, CertificateCopy>;

export type ProfileCopy = {
  tagline: string;
  about: string[];
  principles: { title: string; body: string }[];
  fields: string;
};

export type Profile = {
  email: string;
  available: boolean;
  specialistFields: number;
} & Record<Locale, ProfileCopy>;

export type SiteContent = {
  projects: Project[];
  certificates: Certificate[];
  profile: Profile;
};
