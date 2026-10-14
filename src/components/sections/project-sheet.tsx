"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpLeft } from "lucide-react";

import type { Project } from "@/data/projects";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLenis } from "@/components/providers/smooth-scroll";
import { cn, toFa } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const blocks: { key: keyof Pick<Project, "services" | "features" | "tech" | "uses">; label: string }[] = [
  { key: "services", label: "خدمات ارائه‌شده" },
  { key: "features", label: "امکانات نرم‌افزار" },
  { key: "tech", label: "مشخصات فنی" },
  { key: "uses", label: "کاربردها" },
];

export function ProjectSheet({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
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

  return (
    <Dialog open={!!project} onOpenChange={(o) => !o && onClose()}>
      {p && (
        <DialogContent variant="sheet" className="text-ink" aria-describedby="project-intro">
          <div data-lenis-prevent className="h-full overflow-y-auto overscroll-contain">
            {/* Gallery */}
            <div className="relative bg-paper-2 p-3 pt-20 sm:p-6 sm:pt-20">
              <div className="relative overflow-hidden rounded-md bg-ink/5">
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
                      alt={`نمایی از ${p.title}`}
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
                    aria-label={`تصویر ${toFa(i + 1)} از ${p.title}`}
                    aria-current={slide === i}
                    className={cn(
                      "relative h-14 w-20 cursor-pointer overflow-hidden rounded-sm ring-1 transition-[opacity,box-shadow] duration-300",
                      slide === i ? "ring-2 ring-vermilion" : "opacity-55 ring-ink/10 hover:opacity-100",
                    )}
                  >
                    <Image src={img} alt="" sizes="80px" className="size-full object-cover object-top" />
                  </button>
                ))}
                <span className="ms-auto font-mono text-xs text-stone">
                  {toFa(slide + 1)} از {toFa(p.images.length)}
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
              <motion.p
                variants={item}
                className="flex flex-wrap items-center gap-3 font-mono text-xs text-stone"
              >
                <span>{p.category}</span>
                <span className="size-1 rounded-full bg-stone/50" />
                <span className="inline-flex items-center gap-1.5">
                  <span className={cn("size-1.5 rounded-full", p.url ? "bg-[#4caf6a]" : "bg-stone")} />
                  {p.status}
                </span>
              </motion.p>
              <motion.div variants={item}>
                <DialogTitle className="mt-4 text-[clamp(2.4rem,5vw,4rem)]">{p.title}</DialogTitle>
                <p className="ltr mt-1 text-end font-serif text-xl text-stone italic">{p.eng}</p>
              </motion.div>

              <motion.div variants={item}>
                <DialogDescription id="project-intro" className="mt-8 max-w-2xl text-lg leading-9 text-ink-2">
                  {p.intro}
                </DialogDescription>
              </motion.div>

              <motion.div
                variants={item}
                className="mt-10 grid gap-4 rounded-md bg-ink p-6 text-paper sm:grid-cols-2"
              >
                <div>
                  <p className="font-mono text-[0.7rem] text-paper/50">ارزش کاربردی</p>
                  <p className="mt-2 font-display text-2xl leading-snug">{p.value}</p>
                </div>
                <div className="sm:border-s sm:border-paper/15 sm:ps-6">
                  <p className="font-mono text-[0.7rem] text-paper/50">بستر پیشنهادی</p>
                  <p className="mt-2 leading-7 text-paper/85">{p.hardware}</p>
                </div>
              </motion.div>

              <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
                {blocks.map((b) => (
                  <motion.div key={b.key} variants={item}>
                    <h3 className="border-b pb-3 text-sm font-semibold">{b.label}</h3>
                    <ul className="mt-3 space-y-2.5 text-[0.95rem] leading-7 text-ink-2">
                      {p[b.key].map((line) => (
                        <li key={line} className="flex gap-3">
                          <span className="mt-3 h-px w-3 shrink-0 bg-vermilion" />
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
                      مشاهده نسخه آنلاین
                      <ArrowUpLeft className="transition-transform duration-500 ease-out-expo group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </Button>
                ) : (
                  <span className="text-sm text-stone">نسخه عمومی این پروژه منتشر نشده است.</span>
                )}
                <Button variant="outline" size="lg" onClick={onClose}>
                  بازگشت به فهرست
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};
