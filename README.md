# نرگس جعفر طباطبایی — وب‌سایت شخصی

وب‌سایت پورتفولیوی شخصی، دوزبانه — فارسی (`/fa`، راست‌به‌چپ) و انگلیسی (`/en`) — با پالت «ابسیدین و شامپاینی» و حالت روشن/تیره.

## پشته

| بخش | ابزار |
| --- | --- |
| فریم‌ورک | Next.js 15 (App Router) + TypeScript |
| استایل | Tailwind CSS v4 + کامپوننت‌های shadcn/ui (Dialog، Button) |
| موشن اصلی | GSAP + ScrollTrigger (`@gsap/react`) |
| اسکرول نرم | Lenis (متصل به ticker گسپ) |
| سه‌بعدی | Three.js + React Three Fiber |
| تعاملات کوچک | Motion (`motion/react`) |

## اجرا

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

## ساختار

```
src/
  app/[lang]/          layout ریشه به ازای هر زبان (lang/dir)، فونت‌های محلی
  app/globals.css      توکن‌های رنگ دو تم و کلاس .chapter برای بخش‌های تیره
  components/
    sections/          هدر، هیرو، نوار حوزه‌ها، درباره، نمونه‌کارها، آموزش، ارتباط
    three/dot-field    میدان نقطه‌ای WebGL هیرو (واکنش به نشانگر)
    motion/            Split (تفکیک کلمات سمت سرور) و Magnetic
    ui/                کامپوننت‌های shadcn/ui
  data/                محتوای دوزبانه پروژه‌ها و گواهینامه‌ها (fa / en)، اطلاعات تماس
  i18n/                تنظیم زبان‌ها، دیکشنری رابط و Provider
  assets/              تصاویر پروژه‌ها و گواهینامه‌ها (WebP)
  hooks/               useSectionMotion (واژگان مشترک انیمیشن)، useReducedMotion
```

ویرایش محتوا فقط در `src/data/*` و `src/i18n/dictionary.ts` انجام می‌شود. مسیر `/` به `/fa` هدایت می‌شود.

## جزئیات

- **رنگ:** تم تیره (پیش‌فرض) ابسیدین `#0b0b0c` + استخوانی `#ede8df` + شامپاینی `#d8bb8a`؛ تم روشن کاغذی `#f3efe8` + برنز `#8c6635`. انتخاب کاربر در localStorage می‌ماند.
- **تایپوگرافی:** فارسی Vazirmatn + Markazi Text؛ انگلیسی Geist + Instrument Serif.

- **میدان نقطه‌ای هیرو:** شیدر سفارشی؛ زیر نشانگر فرورفتگی ایجاد می‌کند (اشاره به نمایشگرهای لمسی پروژه‌ها). روی لمسی/در حالت بیکار مسیر آرام هشتی را دنبال می‌کند و فقط وقتی دیده می‌شود رندر می‌شود.
- **نمونه‌کارها:** فهرست ادیتوریال با پیش‌نمایش تصویری که دنبال نشانگر می‌آید، فیلتر با Motion و پنل جزئیات (shadcn Dialog) با لینک مستقیم `#project-<id>`.
- **آموزش:** شمارنده‌ها و اسکرول افقیِ پین‌شده در دسکتاپ؛ نمایش تمام‌صفحه گواهینامه.
- **دسترس‌پذیری:** `prefers-reduced-motion` همه انیمیشن‌ها و Lenis را خاموش می‌کند؛ بدون جاوااسکریپت هم محتوا دیده می‌شود؛ ناوبری با کیبورد و تمرکز قابل‌مشاهده.

## مهارت‌های ایجنت

مهارت‌های استفاده‌شده در `.claude/skills` و فهرست کامل در `skills-lock.json`:
`ui-ux-pro-max`، `web-design-guidelines`، `vercel-react-best-practices` و مجموعه `SoftwareInFocus/threejs-skills`.
برای بازیابی همه: `npx skills experimental_install`.
