"use client";

import { useRef } from "react";
import { AppWindow, ArrowUpRight, Mail, MonitorSmartphone, Package, Phone, Sparkles } from "lucide-react";

import { Split } from "@/components/motion/split";
import { Magnetic } from "@/components/motion/magnetic";
import { SectionLabel } from "@/components/section-label";
import { useContent } from "@/content/provider";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useI18n } from "@/i18n/provider";
import { formatPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

// One quiet glyph per service, in the order they're authored.
const icons = [AppWindow, MonitorSmartphone, Package, Sparkles];

export function Services() {
  const { t, n, locale } = useI18n();
  const { services, projects, profile } = useContent();
  const copy = services[locale];
  const root = useRef<HTMLElement>(null);
  const phone = formatPhone(profile.phone, locale);
  useSectionMotion(root);

  const titleOf = (id: string) => projects.find((p) => p.id === id)?.[locale].title;

  return (
    <section ref={root} id="services" className="px-4 pb-28 sm:px-6 md:pb-40">
      <div className="mx-auto max-w-[100rem]">
        <div className="grid gap-10 md:grid-cols-12">
          <SectionLabel index={n("02")} className="md:col-span-4 lg:col-span-3">
            {t.services.label}
          </SectionLabel>
          <div className="md:col-span-8 lg:col-span-9">
            <h2 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.95]">
              <Split as="span" lines={[copy.heading[0] ?? ""]} className="block" />
              {copy.heading[1] && (
                <Split
                  as="span"
                  lines={[copy.heading[1]]}
                  className={cn("foil block", locale === "en" && "italic")}
                  delay={0.1}
                />
              )}
            </h2>
            <p data-reveal className="mt-8 max-w-2xl text-lg leading-9 text-foreground-2">
              {copy.intro}
            </p>
          </div>
        </div>

        {/* Services */}
        <div data-reveal-group className="mt-20 grid gap-4 md:grid-cols-2">
          {copy.items.map((s, i) => {
            const Icon = icons[i % icons.length];
            return (
              <article
                key={s.title}
                data-reveal
                className="edge group relative overflow-hidden rounded-2xl bg-card/60 p-7 transition-colors duration-500 hover:bg-card md:p-10"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-accent/0 blur-3xl transition-colors duration-700 group-hover:bg-accent/15"
                />
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20 transition-transform duration-700 ease-out-expo group-hover:-rotate-6">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{n(`0${i + 1}`)}</span>
                </div>
                <h3 className="mt-10 font-display text-[clamp(2rem,3vw,2.8rem)] leading-tight">{s.title}</h3>
                <p className="mt-3 max-w-md leading-8 text-foreground-2">{s.body}</p>
                <ul className="mt-6 space-y-2 border-t pt-5 text-[0.95rem] text-muted-foreground">
                  {s.points.map((pt) => (
                    <li key={pt} className="flex gap-3">
                      <span className="mt-3 h-px w-3 shrink-0 bg-accent" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        {/* Packages by space, each linked to a project that already runs there. */}
        <h3 data-reveal className="mt-24 flex items-center gap-3 text-sm text-foreground-2">
          <span className="h-px w-8 bg-accent" />
          {copy.packagesTitle}
        </h3>
        <ul data-reveal-group className="mt-6 border-t">
          {copy.packages.map((pkg) => (
            <li
              key={pkg.title}
              data-reveal
              className="grid gap-3 border-b py-6 md:grid-cols-12 md:items-center md:gap-6"
            >
              <span className="font-display text-3xl md:col-span-4">{pkg.title}</span>
              <span className="text-muted-foreground md:col-span-4">{pkg.body}</span>
              <span className="flex flex-wrap gap-2 md:col-span-4 md:justify-end">
                {pkg.projects.map((id) => {
                  const title = titleOf(id);
                  if (!title) return null;
                  return (
                    <a
                      key={id}
                      href={`#project-${id}`}
                      aria-label={`${t.services.examples}: ${title}`}
                      className="group/chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-foreground-2 ring-1 ring-border transition-colors hover:bg-accent hover:text-accent-foreground hover:ring-accent"
                    >
                      {title.split("|")[0].trim()}
                      <ArrowUpRight className="size-3.5 transition-transform group-hover/chip:rotate-45 rtl:-scale-x-100" />
                    </a>
                  );
                })}
              </span>
            </li>
          ))}
        </ul>

        {/* Call to action */}
        <div
          data-reveal
          className="edge chapter relative mt-20 overflow-hidden rounded-3xl p-8 md:p-14"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 start-1/4 size-[36rem] rounded-full bg-[radial-gradient(closest-side,rgb(216_187_138/0.22),transparent)]"
          />
          <div className="relative grid gap-8 md:grid-cols-12 md:items-end">
            <p className="font-display text-[clamp(1.8rem,3.4vw,3.2rem)] leading-tight md:col-span-7">{copy.cta}</p>
            <div className="flex flex-wrap gap-3 md:col-span-5 md:justify-end">
              {phone && (
                <Magnetic>
                  <a
                    href={phone.href}
                    className="inline-flex h-12 items-center gap-3 rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-strong"
                  >
                    <Phone className="size-4" />
                    {t.services.call}
                    <span className="ltr font-mono text-xs opacity-80">{phone.display}</span>
                  </a>
                </Magnetic>
              )}
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm ring-1 ring-border transition-colors hover:bg-foreground hover:text-background"
              >
                <Mail className="size-4" />
                {t.services.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
