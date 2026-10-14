"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

import type { Project, ProjectCopy } from "@/data/projects";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLenis } from "@/components/providers/smooth-scroll";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const blocks = ["services", "features", "tech", "uses"] as const satisfies readonly (keyof ProjectCopy)[];

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

export function ProjectSheet({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const { t, n, locale } = useI18n();
  const lenis = useLenis();
  const [slide, setSlide] = useState(0);
  // Keep the last project mounted while the sheet animates out.
  const [shown, setShown] = useState<Project | null>(project);

  useEffect(() => {
    if (project) {
      setShown(project);
      setSlide(0);
      lenis?.stop();
    } else {
      lenis?.start();
    }
  }, [project, lenis]);

  const p = shown;
  const copy = p?.[locale];

  return (
    <Dialog open={!!project} onOpenChange={(o) => !o && onClose()}>
      {p && copy && (
        <DialogContent variant="sheet" closeLabel={t.sheet.close} aria-describedby="project-intro">
          <div data-lenis-prevent className="h-full overflow-y-auto overscroll-contain">
            {/* Gallery */}
            <div className="relative bg-card p-3 pt-20 sm:p-6 sm:pt-20">
              <div className="relative overflow-hidden rounded-lg bg-foreground/5">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={`${p.id}-${slide}`}
                    initial={{ clipPath: "inset(0 0 0 100%)" }}
                    animate={{ clipPath: "inset(0 0 0 0%)" }}
                    exit={{ opacity: 0.4 }}
                    transition={{ duration: 0.8, ease }}
                  >
                    <Image
                      src={p.images[slide]}
                      alt={t.sheet.screenshot(copy.title)}
                      sizes="(min-width: 960px) 58rem, 100vw"
                      placeholder="blur"
                      priority
                      className="max-h-[62vh] w-full object-contain"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {p.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSlide(i)}
                    aria-label={t.sheet.imageOf(n(i + 1), n(p.images.length), copy.title)}
                    aria-current={slide === i}
                    className={cn(
                      "relative h-14 w-20 cursor-pointer overflow-hidden rounded-md ring-1 transition-[opacity,box-shadow] duration-300",
                      slide === i ? "ring-2 ring-accent" : "opacity-55 ring-border hover:opacity-100",
                    )}
                  >
                    <Image src={img} alt="" sizes="80px" className="size-full object-cover object-top" />
                  </button>
                ))}
                <span className="ms-auto font-mono text-xs text-muted-foreground">
                  {n(slide + 1)} {t.sheet.of} {n(p.images.length)}
                </span>
              </div>
            </div>

            {/* Body */}
            <motion.div
              key={p.id}
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } } }}
              className="px-5 py-10 sm:px-10"
            >
              <motion.p variants={item} className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{copy.category}</span>
                <span className="size-1 rounded-full bg-muted-foreground/50" />
                <span className={cn("inline-flex items-center gap-1.5", p.live && "text-accent")}>
                  <span className={cn("size-1.5 rounded-full", p.live ? "bg-accent" : "bg-muted-foreground")} />
                  {copy.status}
                </span>
              </motion.p>
              <motion.div variants={item}>
                <DialogTitle className="mt-4 text-[clamp(2.4rem,5vw,4.2rem)]">{copy.title}</DialogTitle>
                {locale === "fa" && (
                  <p className="ltr mt-1 text-end font-serif text-xl text-muted-foreground italic">{p.eng}</p>
                )}
              </motion.div>

              <motion.div variants={item}>
                <DialogDescription id="project-intro" className="mt-8 max-w-2xl text-lg leading-9 text-foreground-2">
                  {copy.intro}
                </DialogDescription>
              </motion.div>

              <motion.div
                variants={item}
                className="edge chapter mt-10 grid gap-4 rounded-xl p-6 sm:grid-cols-2"
              >
                <div>
                  <p className="text-[0.72rem] text-accent">{t.sheet.value}</p>
                  <p className="mt-2 font-display text-2xl leading-snug">{copy.value}</p>
                </div>
                <div className="sm:border-s sm:ps-6">
                  <p className="text-[0.72rem] text-accent">{t.sheet.hardware}</p>
                  <p className="mt-2 leading-7 text-foreground-2">{copy.hardware}</p>
                </div>
              </motion.div>

              <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
                {blocks.map((key) => (
                  <motion.div key={key} variants={item}>
                    <h3 className="border-b pb-3 text-sm font-semibold">{t.sheet[key]}</h3>
                    <ul className="mt-3 space-y-2.5 text-[0.95rem] leading-7 text-foreground-2">
                      {copy[key].map((line) => (
                        <li key={line} className="flex gap-3">
                          <span className="mt-3 h-px w-3 shrink-0 bg-accent" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              <motion.div variants={item} className="mt-14 flex flex-wrap items-center gap-4 border-t pt-8">
                {p.url ? (
                  <Button asChild variant="accent" size="lg" className="group">
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      {t.sheet.visit}
                      <ArrowUpRight className="transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
                    </a>
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">{t.sheet.noLink}</span>
                )}
                <Button variant="outline" size="lg" onClick={onClose}>
                  {t.sheet.back}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
