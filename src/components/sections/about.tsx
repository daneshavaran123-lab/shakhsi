"use client";

import { useRef } from "react";

import { Split } from "@/components/motion/split";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { SectionLabel } from "@/components/section-label";

const principles = [
  {
    n: "۱",
    title: "مسئله واقعی",
    body: "هر پروژه از یک گره مشخص شروع می‌شود؛ جلسه‌ای که آماده نیست، بازدیدکننده‌ای که مسیر را گم کرده، سفارشی که پیچیده است.",
  },
  {
    n: "۲",
    title: "سادگی",
    body: "رابطی که روی نمایشگر عمومی کار می‌کند باید در چند ثانیه فهمیده شود — بدون راهنما، بدون حدس.",
  },
  {
    n: "۳",
    title: "کارایی",
    body: "از ایده تا نسخه قابل استفاده؛ محصولی که روی سخت‌افزار واقعی، در فضای واقعی اجرا می‌شود.",
  },
];

export function About() {
  const root = useRef<HTMLElement>(null);
  useSectionMotion(root);

  return (
    <section ref={root} id="about" className="px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto grid max-w-[100rem] gap-12 md:grid-cols-12">
        <SectionLabel index="۰۱" className="md:col-span-3">
          درباره
        </SectionLabel>

        <div className="md:col-span-9">
          <Split
            mode="scrub"
            as="p"
            className="font-display text-[clamp(2rem,4.4vw,4.4rem)] leading-[1.18]"
            lines={[
              "طراحی و توسعه راهکارهای دیجیتال برای مدیریت، خدمات عمومی، موزه‌ها، فروشگاه‌ها و فضاهای تعاملی.",
              "هدف هر پروژه، ساده‌ترکردن یک فرایند و ساختن تجربه‌ای روشن و قابل فهم برای کاربر است.",
            ]}
          />

          <div data-reveal-group className="mt-20 grid gap-px overflow-hidden rounded-md bg-border sm:grid-cols-3">
            {principles.map((p) => (
              <article
                key={p.title}
                data-reveal
                className="group relative bg-background p-6 transition-colors duration-500 hover:bg-card md:p-8"
              >
                <span className="font-mono text-xs text-stone">({p.n})</span>
                <h3 className="mt-10 font-display text-3xl">{p.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-7 text-stone">{p.body}</p>
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-right scale-x-0 bg-vermilion transition-transform duration-700 ease-out-expo group-hover:scale-x-100" />
              </article>
            ))}
          </div>

          <p data-reveal className="mt-10 max-w-2xl text-sm leading-7 text-stone">
            حوزه‌های کاری: نرم‌افزارهای تحت وب، طراحی رابط و تجربه کاربری، هوش مصنوعی کاربردی،
            راهکارهای نمایشگر لمسی، کیوسک‌های اطلاع‌رسانی و سامانه‌های خدماتی. در پروژه‌های مرتبط،
            سخت‌افزارهای تعاملی <span className="ltr font-mono text-ink">KARAKO</span> بستر اجرای
            محصول هستند.
          </p>
        </div>
      </div>
    </section>
  );
}
