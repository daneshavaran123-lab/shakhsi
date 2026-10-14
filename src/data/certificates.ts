// Content sourced from the training résumé of Narges Jafar Tabatabaei.
import type { StaticImageData } from "next/image";

import c1 from "@/assets/certs/1.webp";
import c2 from "@/assets/certs/2.webp";
import c3 from "@/assets/certs/3.webp";
import c4 from "@/assets/certs/4.webp";
import c5 from "@/assets/certs/5.webp";
import c6 from "@/assets/certs/6.webp";
import c7 from "@/assets/certs/7.webp";
import c8 from "@/assets/certs/8.webp";

export type Certificate = {
  id: string;
  field: string;
  title: string;
  issuer: string;
  summary: string;
  meta: string[];
  skills: string[];
  hours?: number;
  image: StaticImageData;
};

export const certificates: Certificate[] = [
  {
    id: "ai-managers",
    field: "هوش مصنوعی و مدیریت",
    title: "AI for Managers",
    issuer: "MCI Academy",
    summary:
      "کارگاه مدیریتی برای آشنایی کاربردی مدیران با فرصت‌ها، کاربردها و تصمیم‌گیری مبتنی بر هوش مصنوعی در سازمان.",
    meta: ["۸ ساعت", "پاییز ۲۰۲۶"],
    skills: ["AI Strategy", "Management", "Digital Transformation"],
    hours: 8,
    image: c1,
  },
  {
    id: "marketing",
    field: "بازاریابی",
    title: "Marketing Bootcamp — Master Class",
    issuer: "Garnet Talent Assessment & Skill Learning Academy",
    summary:
      "بوت‌کمپ فشرده بازاریابی با تمرکز بر مفاهیم کلیدی مارکتینگ، تحلیل بازار، برند و اجرای اثربخش برنامه‌های بازاریابی.",
    meta: ["۲۰ ساعت", "۳ روز", "مارس ۲۰۲۵"],
    skills: ["Marketing", "Market Analysis", "Brand Thinking"],
    hours: 20,
    image: c2,
  },
  {
    id: "hrm",
    field: "منابع انسانی",
    title: "مدیریت جامع منابع انسانی (HRM)",
    issuer: "مجتمع فنی تهران",
    summary:
      "دوره جامع مدیریت منابع انسانی با تمرکز بر فرآیندها، سازماندهی، ارزیابی و توسعه سرمایه انسانی.",
    meta: ["۱۰۰ ساعت", "نمره ۸۰ از ۱۰۰", "۱۴۰۳"],
    skills: ["HRM", "Talent Management", "Performance", "Organization"],
    hours: 100,
    image: c3,
  },
  {
    id: "sales",
    field: "فروش حرفه‌ای",
    title: "دوره جامع فروش حرفه‌ای",
    issuer: "آکادمی فروش دیدار",
    summary:
      "مدیریت عملکرد فروش؛ از طراحی عملکرد و انگیزش تیم فروش تا طراحی سیستم پورسانت و تحلیل داده‌های فروش.",
    meta: ["۸۰ ساعت", "بهار ۱۴۰۴", "کارگاه حضوری"],
    skills: ["Sales Management", "Commission Design", "Sales Analytics", "Team Motivation"],
    hours: 80,
    image: c4,
  },
  {
    id: "pm-bootcamp",
    field: "مدیریت محصول",
    title: "Product Management Bootcamp",
    issuer: "Product Management Bootcamp",
    summary:
      "چرخه عمر محصول، کشف مسئله، تعریف ارزش، اولویت‌بندی و کار با تیم‌های چندتخصصی.",
    meta: ["۶۵ ساعت", "آنلاین", "نوامبر ۲۰۲۵ — ژانویه ۲۰۲۶"],
    skills: ["Product Strategy", "Discovery", "Roadmapping", "Prioritization"],
    hours: 65,
    image: c5,
  },
  {
    id: "branding",
    field: "برندینگ",
    title: "Creativity in Branding",
    issuer: "Reza Mahdavi — Brand Management Course",
    summary:
      "خلاقیت در برندسازی با تمرکز بر ایده‌پردازی، هویت برند و ساخت تمایز معنادار در تجربه و ارتباطات برند.",
    meta: ["مدیریت برند", "خلاقیت"],
    skills: ["Brand Strategy", "Creativity", "Brand Identity"],
    image: c6,
  },
  {
    id: "diginext",
    field: "مدیریت محصول",
    title: "Product Management Bootcamp",
    issuer: "Diginext Academy",
    summary:
      "منطق محصول، درک نیاز کاربر، ساختار تصمیم‌گیری و تبدیل مسئله به راهکار قابل اجرا.",
    meta: ["گواهی پایان دوره"],
    skills: ["Product Management", "User Needs", "Decision Making"],
    image: c7,
  },
  {
    id: "procurement",
    field: "مدیریت",
    title: "مدیریت خرید، تدارکات و قراردادهای داخلی",
    issuer: "سازمان پژوهش و برنامه‌ریزی آموزشی",
    summary:
      "دوره آموزشی مدیریت خرید، تدارکات و قراردادهای داخلی، همراه با گواهینامه پایان دوره.",
    meta: ["۱۸ ساعت", "۱۴۰۳"],
    skills: ["مدیریت خرید", "تدارکات", "قراردادها"],
    hours: 18,
    image: c8,
  },
];

export const totalHours = certificates.reduce((sum, c) => sum + (c.hours ?? 0), 0);
