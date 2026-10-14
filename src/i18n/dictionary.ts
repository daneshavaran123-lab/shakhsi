import type { Locale } from "./config";

const fa = {
  meta: {
    title: "نرگس جعفر طباطبایی — طراح محصول و تجربه‌های دیجیتال تعاملی",
    description:
      "طراحی و توسعه محصولات دیجیتال، کیوسک‌های تعاملی و تجربه‌های مبتنی بر هوش مصنوعی؛ با تمرکز بر مسئله واقعی، سادگی و کارایی.",
  },
  // First name: Narges. Family name: Jafar Tabatabaei.
  name: { first: "نرگس", last: "جعفر طباطبایی", short: "نرگس جعفر طباطبایی", full: "نرگس جعفر طباطبایی" },
  role: "طراح محصول و تجربه‌های دیجیتال تعاملی",
  skip: "رفتن به محتوا",
  nav: { about: "درباره", work: "نمونه‌کارها", learning: "آموزش", contact: "ارتباط", label: "ناوبری اصلی", open: "باز کردن منو", close: "بستن منو" },
  available: "آماده همکاری",
  tehran: "تهران",
  theme: { toLight: "حالت روشن", toDark: "حالت تیره" },
  langSwitch: "تغییر زبان",
  hero: {
    index: "(۰۰) — پورتفولیو ۱۴۰۵",
    tagline:
      "طراح محصول و تجربه‌های دیجیتال تعاملی؛ از نمایشگر لمسی ۶۵ اینچی اتاق مدیران تا کیوسک موزه — طراحی برای مسئله واقعی، با سادگی و کارایی.",
    projects: "پروژه منتخب",
    courses: "دوره تخصصی",
    cta: "دیدن نمونه‌کارها",
    scroll: "اسکرول",
  },
  marquee: [
    "طراحی محصول",
    "تجربه کاربری",
    "کیوسک تعاملی",
    "هوش مصنوعی کاربردی",
    "نمایشگر لمسی",
    "برندسازی",
  ],
  about: {
    label: "درباره",
    lines: [
      "طراحی و توسعه راهکارهای دیجیتال برای مدیریت، خدمات عمومی، موزه‌ها، فروشگاه‌ها و فضاهای تعاملی.",
      "هدف هر پروژه، ساده‌ترکردن یک فرایند و ساختن تجربه‌ای روشن و قابل فهم برای کاربر است.",
    ],
    principles: [
      { title: "مسئله واقعی", body: "هر پروژه از یک گره مشخص شروع می‌شود؛ جلسه‌ای که آماده نیست، بازدیدکننده‌ای که مسیر را گم کرده، سفارشی که پیچیده است." },
      { title: "سادگی", body: "رابطی که روی نمایشگر عمومی کار می‌کند باید در چند ثانیه فهمیده شود — بدون راهنما، بدون حدس." },
      { title: "کارایی", body: "از ایده تا نسخه قابل استفاده؛ محصولی که روی سخت‌افزار واقعی، در فضای واقعی اجرا می‌شود." },
    ],
    fields:
      "حوزه‌های کاری: نرم‌افزارهای تحت وب، طراحی رابط و تجربه کاربری، هوش مصنوعی کاربردی، راهکارهای نمایشگر لمسی، کیوسک‌های اطلاع‌رسانی و سامانه‌های خدماتی. در پروژه‌های مرتبط، سخت‌افزارهای تعاملی KARAKO بستر اجرای محصول هستند.",
  },
  work: {
    label: "نمونه‌کارها",
    heading: ["محصولاتی که", "روی صفحه‌ی لمسی زندگی می‌کنند."],
    intro:
      "پروژه‌های نرم‌افزاری در حوزه تجربه کاربری، سامانه‌های هوشمند، کیوسک‌های تعاملی و محصولات مبتنی بر هوش مصنوعی. هر ردیف را باز کنید تا امکانات و تصاویر بیشتر را ببینید.",
    filterLabel: "فیلتر دسته‌بندی پروژه‌ها",
    groups: { all: "همه", management: "مدیریت", culture: "نمایشگاه و فرهنگ", retail: "خدمات و خرده‌فروشی", ai: "هوش مصنوعی" },
    view: "مشاهده جزئیات",
  },
  sheet: {
    services: "خدمات ارائه‌شده",
    features: "امکانات نرم‌افزار",
    tech: "مشخصات فنی",
    uses: "کاربردها",
    value: "ارزش کاربردی",
    hardware: "بستر پیشنهادی",
    visit: "مشاهده نسخه آنلاین",
    noLink: "نسخه عمومی این پروژه منتشر نشده است.",
    back: "بازگشت به فهرست",
    close: "بستن",
    imageOf: (i: string, n: string, title: string) => `تصویر ${i} از ${n} — ${title}`,
    of: "از",
    screenshot: (title: string) => `نمایی از ${title}`,
  },
  learning: {
    label: "آموزش و گواهینامه‌ها",
    heading: ["یادگیری مستمر،", "از مدیریت تا هوش مصنوعی."],
    stats: ["دوره و گواهینامه", "ساعت آموزش ثبت‌شده", "حوزه تخصصی"],
    scroll: "اسکرول کنید",
    certificates: "گواهینامه",
    open: (title: string) => `نمایش گواهینامه ${title}`,
    alt: (title: string, issuer: string) => `گواهینامه ${title} صادرشده توسط ${issuer}`,
  },
  contact: {
    label: "ارتباط",
    heading: ["برای گفتگو", "درباره همکاری."],
    body: "برای معرفی پروژه، همکاری یا دریافت جزئیات بیشتر درباره هر یک از نمونه‌کارها، یک ایمیل کافی است.",
    copy: "کپی نشانی ایمیل",
    copied: "کپی شد",
    top: "بازگشت به بالا",
    rights: "© ۲۰۲۶ — نرگس جعفر طباطبایی",
  },
};

export type Dictionary = typeof fa;

const en: Dictionary = {
  meta: {
    title: "Narges Jafar Tabatabaei — Product & Interactive Experience Designer",
    description:
      "Designing and building digital products, interactive kiosks and AI-powered experiences — focused on real problems, simplicity and usefulness.",
  },
  name: { first: "Narges", last: "Jafar Tabatabaei", short: "Narges Jafar Tabatabaei", full: "Narges Jafar Tabatabaei" },
  role: "Product & interactive experience designer",
  skip: "Skip to content",
  nav: { about: "About", work: "Work", learning: "Learning", contact: "Contact", label: "Main navigation", open: "Open menu", close: "Close menu" },
  available: "Open to work",
  tehran: "Tehran",
  theme: { toLight: "Light mode", toDark: "Dark mode" },
  langSwitch: "Switch language",
  hero: {
    index: "(00) — Portfolio 2026",
    tagline:
      "Product and interactive experience designer — from 65″ touch displays in boardrooms to museum kiosks. Designing for real problems, with simplicity and purpose.",
    projects: "Selected projects",
    courses: "Certified courses",
    cta: "See the work",
    scroll: "Scroll",
  },
  marquee: ["Product design", "User experience", "Interactive kiosks", "Applied AI", "Touch displays", "Branding"],
  about: {
    label: "About",
    lines: [
      "Designing and building digital solutions for management, public services, museums, retail and interactive spaces.",
      "Every project sets out to simplify one process and leave the user with a clear, understandable experience.",
    ],
    principles: [
      { title: "Real problems", body: "Each project starts from a concrete knot — a meeting nobody prepared for, a visitor who lost their way, an order that got complicated." },
      { title: "Simplicity", body: "An interface on a public screen has to make sense in seconds — no manual, no guessing." },
      { title: "Usefulness", body: "From idea to a working release — products that run on real hardware, in real spaces." },
    ],
    fields:
      "Fields: web software, UI and UX design, applied AI, touch-display solutions, information kiosks and service systems. Where relevant, KARAKO interactive hardware is the platform the products run on.",
  },
  work: {
    label: "Selected work",
    heading: ["Products that", "live on touch screens."],
    intro:
      "Software projects across user experience, smart systems, interactive kiosks and AI-driven products. Open any row for features and more screens.",
    filterLabel: "Filter projects by category",
    groups: { all: "All", management: "Management", culture: "Exhibition & culture", retail: "Services & retail", ai: "AI" },
    view: "View details",
  },
  sheet: {
    services: "What it offers",
    features: "Features",
    tech: "Technical",
    uses: "Where it’s used",
    value: "Value",
    hardware: "Recommended setup",
    visit: "Visit live version",
    noLink: "There is no public release of this project yet.",
    back: "Back to the list",
    close: "Close",
    imageOf: (i: string, n: string, title: string) => `Image ${i} of ${n} — ${title}`,
    of: "of",
    screenshot: (title: string) => `Screen from ${title}`,
  },
  learning: {
    label: "Learning & certificates",
    heading: ["Always learning —", "from management to AI."],
    stats: ["Courses & certificates", "Recorded training hours", "Specialist fields"],
    scroll: "Keep scrolling",
    certificates: "certificates",
    open: (title: string) => `Open certificate: ${title}`,
    alt: (title: string, issuer: string) => `${title} certificate issued by ${issuer}`,
  },
  contact: {
    label: "Contact",
    heading: ["Let’s talk about", "working together."],
    body: "To introduce a project, discuss a collaboration or get more detail on any of the work, one email is enough.",
    copy: "Copy email address",
    copied: "Copied",
    top: "Back to top",
    rights: "© 2026 — Narges Jafar Tabatabaei",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { fa, en };
