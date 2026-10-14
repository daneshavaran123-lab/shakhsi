# نرگس جعفر طباطبایی — وب‌سایت شخصی

وب‌سایت پورتفولیوی شخصی؛ فارسی و راست‌به‌چپ، مینیمال و ادیتوریال.

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
  app/                 layout، فونت‌های محلی، استایل سراسری و توکن‌های رنگ
  components/
    sections/          هدر، هیرو، نوار حوزه‌ها، درباره، نمونه‌کارها، آموزش، ارتباط
    three/dot-field    میدان نقطه‌ای WebGL هیرو (واکنش به نشانگر)
    motion/            Split (تفکیک کلمات سمت سرور) و Magnetic
    ui/                کامپوننت‌های shadcn/ui
  data/                محتوای پروژه‌ها، گواهینامه‌ها و اطلاعات تماس
  assets/              تصاویر پروژه‌ها و گواهینامه‌ها (WebP)
  hooks/               useSectionMotion (واژگان مشترک انیمیشن)، useReducedMotion
```

ویرایش محتوا فقط در `src/data/*` انجام می‌شود.

## جزئیات

- **میدان نقطه‌ای هیرو:** شیدر سفارشی؛ زیر نشانگر فرورفتگی ایجاد می‌کند (اشاره به نمایشگرهای لمسی پروژه‌ها). روی لمسی/در حالت بیکار مسیر آرام هشتی را دنبال می‌کند و فقط وقتی دیده می‌شود رندر می‌شود.
- **نمونه‌کارها:** فهرست ادیتوریال با پیش‌نمایش تصویری که دنبال نشانگر می‌آید، فیلتر با Motion و پنل جزئیات (shadcn Dialog) با لینک مستقیم `#project-<id>`.
- **آموزش:** شمارنده‌ها و اسکرول افقیِ پین‌شده در دسکتاپ؛ نمایش تمام‌صفحه گواهینامه.
- **دسترس‌پذیری:** `prefers-reduced-motion` همه انیمیشن‌ها و Lenis را خاموش می‌کند؛ بدون جاوااسکریپت هم محتوا دیده می‌شود؛ ناوبری با کیبورد و تمرکز قابل‌مشاهده.

## مهارت‌های ایجنت

مهارت‌های استفاده‌شده در `.claude/skills` و فهرست کامل در `skills-lock.json`:
`ui-ux-pro-max`، `web-design-guidelines`، `vercel-react-best-practices` و مجموعه `SoftwareInFocus/threejs-skills`.
برای بازیابی همه: `npx skills experimental_install`.
