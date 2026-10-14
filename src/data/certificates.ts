// Content sourced from the training résumé of Narges Jafar Tabatabaei.
import type { StaticImageData } from "next/image";

import type { Locale } from "@/i18n/config";
import c1 from "@/assets/certs/1.webp";
import c2 from "@/assets/certs/2.webp";
import c3 from "@/assets/certs/3.webp";
import c4 from "@/assets/certs/4.webp";
import c5 from "@/assets/certs/5.webp";
import c6 from "@/assets/certs/6.webp";
import c7 from "@/assets/certs/7.webp";
import c8 from "@/assets/certs/8.webp";

type CertificateCopy = {
  field: string;
  title: string;
  issuer: string;
  summary: string;
  meta: string[];
};

export type Certificate = {
  id: string;
  skills: string[];
  hours?: number;
  image: StaticImageData;
} & Record<Locale, CertificateCopy>;

export const certificates: Certificate[] = [
  {
    id: "ai-managers",
    skills: ["AI Strategy", "Management", "Digital Transformation"],
    hours: 8,
    image: c1,
    fa: {
      field: "هوش مصنوعی و مدیریت",
      title: "AI for Managers",
      issuer: "MCI Academy",
      summary: "کارگاه مدیریتی برای آشنایی کاربردی مدیران با فرصت‌ها، کاربردها و تصمیم‌گیری مبتنی بر هوش مصنوعی در سازمان.",
      meta: ["۸ ساعت", "پاییز ۲۰۲۶"],
    },
    en: {
      field: "AI & management",
      title: "AI for Managers",
      issuer: "MCI Academy",
      summary: "A management workshop on the practical opportunities, applications and AI-informed decision-making inside organisations.",
      meta: ["8 hours", "Autumn 2026"],
    },
  },
  {
    id: "marketing",
    skills: ["Marketing", "Market Analysis", "Brand Thinking"],
    hours: 20,
    image: c2,
    fa: {
      field: "بازاریابی",
      title: "Marketing Bootcamp — Master Class",
      issuer: "Garnet Talent Assessment & Skill Learning Academy",
      summary: "بوت‌کمپ فشرده بازاریابی با تمرکز بر مفاهیم کلیدی مارکتینگ، تحلیل بازار، برند و اجرای اثربخش برنامه‌های بازاریابی.",
      meta: ["۲۰ ساعت", "۳ روز", "مارس ۲۰۲۵"],
    },
    en: {
      field: "Marketing",
      title: "Marketing Bootcamp — Master Class",
      issuer: "Garnet Talent Assessment & Skill Learning Academy",
      summary: "An intensive bootcamp on core marketing concepts, market analysis, brand and running effective marketing programmes.",
      meta: ["20 hours", "3 days", "March 2025"],
    },
  },
  {
    id: "hrm",
    skills: ["HRM", "Talent Management", "Performance", "Organization"],
    hours: 100,
    image: c3,
    fa: {
      field: "منابع انسانی",
      title: "مدیریت جامع منابع انسانی (HRM)",
      issuer: "مجتمع فنی تهران",
      summary: "دوره جامع مدیریت منابع انسانی با تمرکز بر فرآیندها، سازماندهی، ارزیابی و توسعه سرمایه انسانی.",
      meta: ["۱۰۰ ساعت", "نمره ۸۰ از ۱۰۰", "۱۴۰۳"],
    },
    en: {
      field: "Human resources",
      title: "Human Resource Management (HRM)",
      issuer: "Tehran Institute of Technology",
      summary: "A comprehensive HRM programme covering HR processes, organisation design, evaluation and developing human capital.",
      meta: ["100 hours", "Score 80/100", "2024"],
    },
  },
  {
    id: "sales",
    skills: ["Sales Management", "Commission Design", "Sales Analytics", "Team Motivation"],
    hours: 80,
    image: c4,
    fa: {
      field: "فروش حرفه‌ای",
      title: "دوره جامع فروش حرفه‌ای",
      issuer: "آکادمی فروش دیدار",
      summary: "مدیریت عملکرد فروش؛ از طراحی عملکرد و انگیزش تیم فروش تا طراحی سیستم پورسانت و تحلیل داده‌های فروش.",
      meta: ["۸۰ ساعت", "بهار ۱۴۰۴", "کارگاه حضوری"],
    },
    en: {
      field: "Professional sales",
      title: "Professional Sales Programme",
      issuer: "Didar Sales Academy",
      summary: "Sales performance management — from performance design and team motivation to commission systems and sales analytics.",
      meta: ["80 hours", "Spring 2025", "In person"],
    },
  },
  {
    id: "pm-bootcamp",
    skills: ["Product Strategy", "Discovery", "Roadmapping", "Prioritization"],
    hours: 65,
    image: c5,
    fa: {
      field: "مدیریت محصول",
      title: "Product Management Bootcamp",
      issuer: "Product Management Bootcamp",
      summary: "چرخه عمر محصول، کشف مسئله، تعریف ارزش، اولویت‌بندی و کار با تیم‌های چندتخصصی.",
      meta: ["۶۵ ساعت", "آنلاین", "نوامبر ۲۰۲۵ — ژانویه ۲۰۲۶"],
    },
    en: {
      field: "Product management",
      title: "Product Management Bootcamp",
      issuer: "Product Management Bootcamp",
      summary: "Product lifecycle, problem discovery, value definition, prioritisation and working with cross-functional teams.",
      meta: ["65 hours", "Online", "Nov 2025 — Jan 2026"],
    },
  },
  {
    id: "branding",
    skills: ["Brand Strategy", "Creativity", "Brand Identity"],
    image: c6,
    fa: {
      field: "برندینگ",
      title: "Creativity in Branding",
      issuer: "Reza Mahdavi — Brand Management Course",
      summary: "خلاقیت در برندسازی با تمرکز بر ایده‌پردازی، هویت برند و ساخت تمایز معنادار در تجربه و ارتباطات برند.",
      meta: ["مدیریت برند", "خلاقیت"],
    },
    en: {
      field: "Branding",
      title: "Creativity in Branding",
      issuer: "Reza Mahdavi — Brand Management Course",
      summary: "Creativity in brand building — ideation, brand identity and meaningful differentiation across experience and communication.",
      meta: ["Brand management", "Creativity"],
    },
  },
  {
    id: "diginext",
    skills: ["Product Management", "User Needs", "Decision Making"],
    image: c7,
    fa: {
      field: "مدیریت محصول",
      title: "Product Management Bootcamp",
      issuer: "Diginext Academy",
      summary: "منطق محصول، درک نیاز کاربر، ساختار تصمیم‌گیری و تبدیل مسئله به راهکار قابل اجرا.",
      meta: ["گواهی پایان دوره"],
    },
    en: {
      field: "Product management",
      title: "Product Management Bootcamp",
      issuer: "Diginext Academy",
      summary: "Product logic, understanding user needs, decision structures and turning problems into workable solutions.",
      meta: ["Certificate of completion"],
    },
  },
  {
    id: "procurement",
    skills: ["Procurement", "Logistics", "Contracts"],
    hours: 18,
    image: c8,
    fa: {
      field: "مدیریت",
      title: "مدیریت خرید، تدارکات و قراردادهای داخلی",
      issuer: "سازمان پژوهش و برنامه‌ریزی آموزشی",
      summary: "دوره آموزشی مدیریت خرید، تدارکات و قراردادهای داخلی، همراه با گواهینامه پایان دوره.",
      meta: ["۱۸ ساعت", "۱۴۰۳"],
    },
    en: {
      field: "Management",
      title: "Procurement, Logistics & Domestic Contracts",
      issuer: "Organization for Educational Research and Planning",
      summary: "Training in purchasing management, logistics and domestic contracts, with a certificate of completion.",
      meta: ["18 hours", "2024"],
    },
  },
];

export const totalHours = certificates.reduce((sum, c) => sum + (c.hours ?? 0), 0);
