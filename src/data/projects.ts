// Content sourced from the portfolio document of Narges Jafar Tabatabaei.
import type { StaticImageData } from "next/image";

import mora1 from "@/assets/projects/mora-1.webp";
import mora2 from "@/assets/projects/mora-2.webp";
import fava1 from "@/assets/projects/fava-1.webp";
import fava2 from "@/assets/projects/fava-2.webp";
import wedding1 from "@/assets/projects/wedding-1.webp";
import wedding2 from "@/assets/projects/wedding-2.webp";
import museum1 from "@/assets/projects/museum-1.webp";
import museum2 from "@/assets/projects/museum-2.webp";
import ticket1 from "@/assets/projects/ticket-1.webp";
import ticket2 from "@/assets/projects/ticket-2.webp";
import future1 from "@/assets/projects/future-1.webp";
import future2 from "@/assets/projects/future-2.webp";
import zaer1 from "@/assets/projects/zaer-1.webp";
import zaer2 from "@/assets/projects/zaer-2.webp";
import tecmall1 from "@/assets/projects/tecmall-1.webp";
import tecmall2 from "@/assets/projects/tecmall-2.webp";
import fitly1 from "@/assets/projects/fitly-1.webp";
import fitly2 from "@/assets/projects/fitly-2.webp";

import type { Locale } from "@/i18n/config";

export const projectGroups = ["all", "management", "culture", "retail", "ai"] as const;
export type ProjectGroup = (typeof projectGroups)[number];

export type ProjectCopy = {
  title: string;
  category: string;
  summary: string;
  intro: string;
  services: string[];
  features: string[];
  tech: string[];
  uses: string[];
  value: string;
  hardware: string;
  status: string;
};

export type Project = {
  id: string;
  /** Latin product line shown as a subtitle in Persian. */
  eng: string;
  group: Exclude<ProjectGroup, "all">;
  url?: string;
  live: boolean;
  images: StaticImageData[];
} & Record<Locale, ProjectCopy>;

export const projects: Project[] = [
  {
    "id": "mora",
    "eng": "MORA — Executive Second Brain",
    "group": "management",
    "url": "http://aisecondbrain.me/",
    "live": true,
    "fa": {
      "title": "مُورا | مغز دوم مدیران",
      "category": "مدیریت هوشمند",
      "summary": "محیط دیجیتال یکپارچه برای برنامه‌ریزی فردی و سازمانی، مدیریت جلسات، وظایف، پروژه‌ها و دسترسی سریع مدیران به اطلاعات موردنیاز تصمیم‌گیری.",
      "intro": "مُورا یک فضای کاری متمرکز برای مدیرانی است که تصمیم‌ها، جلسات، وظایف و اطلاعات سازمانی را در چند ابزار متفاوت مدیریت می‌کنند. محیط واحد آن برای مرور روزانه امور و آماده‌سازی جلسات طراحی شده است.",
      "services": [
        "سازمان‌دهی فعالیت‌های فردی، حرفه‌ای و سازمانی",
        "آماده‌سازی و تحلیل موضوع جلسه با جست‌وجوی منابع مرتبط",
        "گردآوری ایده‌ها، وظایف، پروژه‌ها و داده‌های مدیریتی در یک محیط"
      ],
      "features": [
        "داشبورد وضعیت امروز و فعالیت‌های اخیر",
        "برنامه‌ریزی سازمانی با نمایش فهرست، تقویم، کانبان و ماتریس",
        "فرم تحلیل موضوع پیش از جلسه و ورود توضیحات",
        "جست‌وجوی اطلاعات، تقویم و دسترسی سریع"
      ],
      "tech": [
        "وب‌اپلیکیشن فارسی راست‌به‌چپ",
        "اجرا در مرورگر سازگار روی رایانه/OPS",
        "استفاده روی نمایشگر لمسی ۶۵ اینچ با اتصال شبکه"
      ],
      "uses": [
        "اتاق مدیرعامل و هیئت‌مدیره",
        "جلسات مدیریتی و سازمانی",
        "مرکز کنترل و پیگیری فعالیت‌ها"
      ],
      "value": "تبدیل نمایشگر لمسی ۶۵ اینچ به میز کار و مرکز فرماندهی مدیریتی.",
      "hardware": "نمایشگر لمسی ۶۵ اینچ + OPS یا رایانه",
      "status": "نسخه آنلاین"
    },
    "en": {
      "title": "MORA — Executive Second Brain",
      "category": "Smart management",
      "summary": "A unified digital workspace for personal and organisational planning — meetings, tasks, projects and the information executives need to make decisions, in one place.",
      "intro": "MORA is a focused workspace for executives who juggle decisions, meetings, tasks and organisational knowledge across too many tools. One environment for the daily review and for walking into every meeting prepared.",
      "services": [
        "Organising personal, professional and organisational activity",
        "Preparing and analysing meeting topics with related sources",
        "Collecting ideas, tasks, projects and management data in one place"
      ],
      "features": [
        "Today’s status dashboard and recent activity",
        "Organisational planning as list, calendar, kanban and matrix",
        "Pre-meeting topic analysis form with notes",
        "Search, calendar and quick access"
      ],
      "tech": [
        "Persian right-to-left web application",
        "Runs in a modern browser on a PC or OPS module",
        "Designed for a networked 65″ touch display"
      ],
      "uses": [
        "CEO and board rooms",
        "Management and organisational meetings",
        "Command centres and follow-up desks"
      ],
      "value": "Turns a 65″ touch display into an executive desk and command centre.",
      "hardware": "65″ touch display + OPS or PC",
      "status": "Live"
    },
    "images": [mora1, mora2]
  },
  {
    "id": "fava",
    "eng": "Fava Park — Interactive Technology Atlas",
    "group": "culture",
    "url": "https://favapark.liara.run/",
    "live": true,
    "fa": {
      "title": "اطلس شرکت‌های پارک فناوری",
      "category": "اطلاع‌رسانی و نمایشگاه",
      "summary": "پلتفرم معرفی و جست‌وجوی شرکت‌های فناور همراه با نمایشگاه مجازی، شاخه‌های تخصصی فناوری، نقشه پارک‌ها و مدیریت اطلاعات شرکت‌ها.",
      "intro": "اطلس شرکت‌های پارک فناوری، یک نمایشگاه دیجیتال برای معرفی شرکت‌های فناور، ظرفیت پارک‌ها و حوزه‌های تخصصی است. بازدیدکننده می‌تواند به‌جای مراجعه به فهرست‌های پراکنده، اطلاعات را در قالبی منظم جست‌وجو کند.",
      "services": [
        "معرفی شرکت‌ها، محصولات و حوزه فعالیت آن‌ها",
        "معرفی پارک‌های فناوری و موقعیت روی نقشه",
        "دسترسی به جست‌وجوی نمایشگاه مجازی و دستیار هوشمند"
      ],
      "features": [
        "کارت معرفی شرکت با لوگو و اطلاعات فارسی و انگلیسی",
        "دسته‌بندی شرکت‌ها براساس شاخه فناوری",
        "نقشه پارک‌ها و اطلاعات آن‌ها",
        "پنل ثبت و ویرایش، بارگذاری لوگو و وضعیت تأیید"
      ],
      "tech": [
        "وب‌اپلیکیشن تحت شبکه",
        "رابط کاربری فارسی RTL",
        "بخش عمومی نمایشگاه و بخش مدیریت محتوا",
        "قابل نمایش در کیوسک و نمایشگر بزرگ دارای مرورگر"
      ],
      "uses": [
        "لابی پارک‌های علم و فناوری",
        "نمایشگاه‌های تخصصی و رویدادهای B2B",
        "مراکز رشد و مراکز نوآوری"
      ],
      "value": "تبدیل نمایشگر و استند به راهنمای هوشمند اکوسیستم فناوری.",
      "hardware": "نمایشگر ۶۵ اینچ / استند و کیوسک لمسی",
      "status": "نسخه آنلاین"
    },
    "en": {
      "title": "Technology Park Atlas",
      "category": "Exhibition & information",
      "summary": "A platform to discover and search technology companies — with a virtual exhibition, technology verticals, park maps and company data management.",
      "intro": "The atlas is a digital exhibition of technology companies, park capacities and specialist fields. Instead of scattered lists, visitors search everything in one organised, browsable format.",
      "services": [
        "Showcasing companies, products and fields of activity",
        "Introducing technology parks and their locations on a map",
        "Virtual exhibition search and a smart assistant"
      ],
      "features": [
        "Company cards with logo and Persian/English details",
        "Companies grouped by technology vertical",
        "Park maps and park information",
        "Admin panel for editing, logo upload and approval status"
      ],
      "tech": [
        "Networked web application",
        "Persian RTL interface",
        "Public exhibition plus content management",
        "Runs on kiosks and large browser-enabled displays"
      ],
      "uses": [
        "Science and technology park lobbies",
        "Trade shows and B2B events",
        "Incubators and innovation centres"
      ],
      "value": "Turns displays and stands into a smart guide to the technology ecosystem.",
      "hardware": "65″ display / touch stand and kiosk",
      "status": "Live"
    },
    "images": [fava1, fava2]
  },
  {
    "id": "wedding",
    "eng": "TashrifatYar — Smart Ceremony Booking",
    "group": "retail",
    "url": "https://wedding-menu-kiosk.liara.run/",
    "live": true,
    "fa": {
      "title": "تشریفات‌یار | رزرو مراسم",
      "category": "رزرو و خدمات",
      "summary": "سامانه سفارش‌گیری مرحله‌ای برای انتخاب نوع مراسم، سالن، تاریخ و سانس، غذا و خدمات تشریفاتی همراه با نمایش خلاصه سفارش و پیش‌فاکتور.",
      "intro": "تشریفات‌یار مسیر انتخاب و سفارش خدمات برگزاری مراسم را در یک رابط مرحله‌ای ساده می‌کند. مشتری نوع مراسم، سالن، تاریخ، پذیرایی و خدمات جانبی را انتخاب کرده و در پایان ریز هزینه‌ها را مشاهده می‌کند.",
      "services": [
        "معرفی سالن‌ها و خدمات تشریفاتی مجموعه",
        "انتخاب زمان، سانس، پذیرایی و خدمات جانبی",
        "تهیه خلاصه سفارش و پیش‌فاکتور برای مشتری"
      ],
      "features": [
        "فرایند مرحله‌ای با نمایش پیشرفت سفارش",
        "انتخاب مراسم عروسی یا ترحیم",
        "تقویم شمسی با وضعیت تاریخ‌ها و سانس‌ها",
        "ثبت اطلاعات تماس و تعداد مهمانان",
        "نمایش جمع هزینه‌ها و حق سرویس"
      ],
      "tech": [
        "وب‌اپلیکیشن لمسی با رابط فارسی",
        "اجرای تمام‌صفحه در مرورگر کیوسک",
        "تقویم و فرم‌های ورود داده"
      ],
      "uses": [
        "تالار و باغ‌تالار",
        "هتل‌ها و مراکز همایش",
        "کیوسک پیش‌پذیرش تشریفات"
      ],
      "value": "تبدیل کیوسک به پیشخوان دیجیتال رزرو و فروش خدمات تالار.",
      "hardware": "کیوسک لمسی / استند هوشمند",
      "status": "نسخه آنلاین"
    },
    "en": {
      "title": "TashrifatYar — Ceremony Booking",
      "category": "Booking & services",
      "summary": "A step-by-step ordering flow to choose the ceremony type, hall, date and session, catering and services — ending in an order summary and quote.",
      "intro": "TashrifatYar simplifies booking an event into one guided flow. Guests pick the ceremony, hall, date, catering and extras, and see a clear cost breakdown at the end.",
      "services": [
        "Presenting halls and ceremony services",
        "Choosing date, session, catering and extras",
        "Generating an order summary and quote"
      ],
      "features": [
        "Stepped flow with order progress",
        "Wedding or memorial ceremony paths",
        "Persian calendar with date and session availability",
        "Contact details and guest count",
        "Totals with service charge"
      ],
      "tech": [
        "Touch-first web application, Persian UI",
        "Full-screen kiosk browser mode",
        "Calendar and data-entry forms"
      ],
      "uses": [
        "Banquet halls and garden venues",
        "Hotels and conference centres",
        "Pre-reception kiosks"
      ],
      "value": "Turns a kiosk into a digital front desk for venue bookings and sales.",
      "hardware": "Touch kiosk / smart stand",
      "status": "Live"
    },
    "images": [wedding1, wedding2]
  },
  {
    "id": "museum",
    "eng": "Iran Wrestling — Interactive Digital Museum",
    "group": "culture",
    "url": "https://koshtyiran.liara.run/",
    "live": true,
    "fa": {
      "title": "موزه افتخارات کشتی ایران",
      "category": "فرهنگی و موزه‌ای",
      "summary": "موزه دیجیتال تعاملی برای معرفی قهرمانان، تاریخچه و تألیفات کشتی. آواتار و کلیپ معرفی هر کشتی‌گیر، روایت اول‌شخص از زندگی و افتخارات او ارائه می‌کند.",
      "intro": "موزه افتخارات کشتی ایران، روایت دیجیتال تاریخ و افتخارات این ورزش است. پروفایل قهرمانان در کنار تصاویر و آثار تاریخی، کلیپ‌های معرفی اول‌شخص با آواتار سخنگو را در اختیار بازدیدکننده قرار می‌دهد.",
      "services": [
        "معرفی قهرمانان و افتخارات کشتی ایران",
        "نمایش کلیپ معرفی هر قهرمان با آواتار دیجیتال",
        "مرور تاریخچه، بناهای مرتبط و منابع مکتوب"
      ],
      "features": [
        "جست‌وجو و فیلتر کشتی‌گیران",
        "پروفایل با زندگینامه، افتخارات، مسیر موفقیت و رسانه‌ها",
        "کلیپ سخنگوی معرفی از زبان قهرمان",
        "بخش تألیفات و محتوای فرهنگی"
      ],
      "tech": [
        "وب‌اپلیکیشن تعاملی با نمایش محتوای چندرسانه‌ای",
        "رابط فارسی مناسب کیوسک لمسی",
        "پخش ویدئو، تصویر و محتوای متنی",
        "قابلیت نصب در مرورگر (PWA)"
      ],
      "uses": [
        "موزه‌های ورزشی",
        "فدراسیون‌ها و سالن افتخارات",
        "نمایشگاه‌های فرهنگی ورزشی"
      ],
      "value": "خلق تجربه موزه‌ای چندرسانه‌ای و تعاملی با روایت قهرمانان.",
      "hardware": "کیوسک موزه / نمایشگر لمسی ۶۵ اینچ",
      "status": "نسخه آنلاین"
    },
    "en": {
      "title": "Iran Wrestling Hall of Fame",
      "category": "Culture & museums",
      "summary": "An interactive digital museum of wrestling champions, history and literature. Each champion’s avatar clip tells their life and achievements in the first person.",
      "intro": "A digital narrative of the history and glory of Iranian wrestling. Champion profiles sit alongside historic images and artefacts, with first-person introduction clips voiced by talking avatars.",
      "services": [
        "Introducing Iran’s wrestling champions and honours",
        "An avatar introduction clip for every champion",
        "History, related landmarks and written sources"
      ],
      "features": [
        "Search and filter wrestlers",
        "Profiles with biography, honours, journey and media",
        "Talking introduction clip in the champion’s voice",
        "Publications and cultural content"
      ],
      "tech": [
        "Interactive multimedia web application",
        "Persian UI tuned for touch kiosks",
        "Video, image and text playback",
        "Installable in the browser (PWA)"
      ],
      "uses": [
        "Sports museums",
        "Federations and halls of fame",
        "Cultural and sports exhibitions"
      ],
      "value": "A multimedia, interactive museum experience told by the champions themselves.",
      "hardware": "Museum kiosk / 65″ touch display",
      "status": "Live"
    },
    "images": [museum1, museum2]
  },
  {
    "id": "ticket",
    "eng": "MuseumYar — Ticketing & Visitor Services",
    "group": "culture",
    "url": "https://koshtyticket.liara.run/",
    "live": true,
    "fa": {
      "title": "موزه‌یار | خدمات موزه",
      "category": "فروش و خدمات",
      "summary": "پرتال خدمات موزه کشتی برای معرفی انواع بلیت، فروشگاه کتاب و یادبود، کافه، عضویت سالانه، رویدادها، حمایت مالی و نظرسنجی بازدیدکنندگان.",
      "intro": "موزه‌یار، میز خدمات دیجیتال موزه کشتی است که معرفی انواع بلیت و خدمات جانبی مجموعه را در یک محیط لمسی گرد هم می‌آورد و امکان ثبت حمایت و دریافت نظر بازدیدکنندگان را فراهم می‌کند.",
      "services": [
        "معرفی و انتخاب بلیت عادی، راهنمادار و VIP",
        "دسترسی به فروشگاه کتاب، یادبود و کافه موزه",
        "ثبت حمایت مالی و نظرسنجی بازدیدکننده",
        "معرفی عضویت و رویدادهای موزه"
      ],
      "features": [
        "انتخاب انواع بلیت همراه شرح و قیمت",
        "سبد خرید و بخش فروشگاه‌های موزه",
        "فرم حمایت با مبلغ پیشنهادی یا دلخواه",
        "امتیازدهی ستاره‌ای و ثبت دیدگاه",
        "گزینه تغییر زبان و نصب برنامه"
      ],
      "tech": [
        "وب‌اپلیکیشن سلف‌سرویس با رابط فارسی",
        "مناسب مرورگر کیوسک لمسی",
        "فرم‌ها و ماژول‌های خدماتی مستقل"
      ],
      "uses": [
        "ورودی و گیشه موزه",
        "فروش محصولات فرهنگی",
        "بخش ارتباط با بازدیدکنندگان"
      ],
      "value": "تبدیل کیوسک به پایانه سلف‌سرویس خدمات و فروش موزه.",
      "hardware": "کیوسک فروش خدمات / نمایشگر لمسی",
      "status": "نسخه آنلاین"
    },
    "en": {
      "title": "MuseumYar — Visitor Services",
      "category": "Sales & services",
      "summary": "A service portal for the wrestling museum: tickets, book and souvenir shop, café, annual membership, events, donations and visitor feedback.",
      "intro": "MuseumYar is the museum’s digital service desk — tickets and visitor services gathered on one touch screen, with donations and feedback built in.",
      "services": [
        "Standard, guided and VIP tickets",
        "Book shop, souvenirs and museum café",
        "Donations and visitor surveys",
        "Membership and museum events"
      ],
      "features": [
        "Ticket types with descriptions and prices",
        "Cart and museum shops",
        "Donation form with suggested or custom amounts",
        "Star ratings and comments",
        "Language switch and app install"
      ],
      "tech": [
        "Self-service web application, Persian UI",
        "Built for touch-kiosk browsers",
        "Independent forms and service modules"
      ],
      "uses": [
        "Museum entrance and ticket desk",
        "Cultural merchandise sales",
        "Visitor relations"
      ],
      "value": "Turns a kiosk into a self-service terminal for museum services and sales.",
      "hardware": "Service kiosk / touch display",
      "status": "Live"
    },
    "images": [ticket1, ticket2]
  },
  {
    "id": "future",
    "eng": "FutureLab — AI Photo Experience",
    "group": "ai",
    "url": "https://aipic.liara.run/",
    "live": true,
    "fa": {
      "title": "آزمایشگاه آینده",
      "category": "تجربه هوش مصنوعی",
      "summary": "تجربه نمایشگاهی ساخت تصویر شخصی‌سازی‌شده با هوش مصنوعی؛ ثبت تصویر با رضایت کاربر، انتخاب قالب، تولید تصویر علمی و تحویل با QR Code.",
      "intro": "آزمایشگاه آینده یک تجربه نمایشگاهی تعاملی است: کاربر با رضایت خود تصویرش را ثبت می‌کند و سامانه نسخه‌ای بازآفرینی‌شده از او در محیط آزمایشگاه آینده می‌سازد؛ سپس نتیجه را با کد QR تحویل می‌دهد.",
      "services": [
        "ساخت هدیه تصویری شخصی‌سازی‌شده در غرفه",
        "بازآفرینی پوشش و محیط علمی با حفظ چهره در حد توان مدل",
        "نمایش مقایسه قبل و بعد و تحویل به موبایل"
      ],
      "features": [
        "مرحله اعلام رضایت برای دسترسی به دوربین",
        "انتخاب قالب زن یا مرد",
        "نشانگر پیشرفت تولید تصویر",
        "اسلایدر مقایسه قبل و بعد",
        "نمایش QR برای دریافت عکس"
      ],
      "tech": [
        "وب‌اپلیکیشن متصل به دوربین",
        "پردازش تصویر با سرویس هوش مصنوعی",
        "دسترسی امن به دوربین و شبکه پایدار",
        "در رابط، حذف تصاویر با شروع مجدد جلسه ذکر شده است"
      ],
      "uses": [
        "غرفه‌های نمایشگاهی",
        "رویدادهای علمی و دانشگاهی",
        "تجربه برند و کمپین‌های مشارکتی"
      ],
      "value": "جذب مخاطب به غرفه با هدیه دیجیتال شخصی‌سازی‌شده.",
      "hardware": "کیوسک دوربین‌دار / استند تعاملی",
      "status": "نسخه آنلاین"
    },
    "en": {
      "title": "FutureLab — AI Photo Experience",
      "category": "AI experience",
      "summary": "An exhibition experience that creates a personalised AI portrait — consent-first capture, template choice, a science-themed image and delivery by QR code.",
      "intro": "Visitors consent, take a photo, and the system reimagines them inside the lab of the future — then hands over the result through a QR code.",
      "services": [
        "A personalised image gift at the booth",
        "Reimagined outfit and lab setting while keeping the face",
        "Before/after comparison and delivery to mobile"
      ],
      "features": [
        "Consent step before camera access",
        "Template selection",
        "Generation progress indicator",
        "Before/after slider",
        "QR code to download the photo"
      ],
      "tech": [
        "Camera-connected web application",
        "Image processing via an AI service",
        "Secure camera access and a stable network",
        "Images cleared when a new session starts"
      ],
      "uses": [
        "Exhibition booths",
        "Science and university events",
        "Brand experiences and participatory campaigns"
      ],
      "value": "Draws visitors to the booth with a personalised digital gift.",
      "hardware": "Camera kiosk / interactive stand",
      "status": "Live"
    },
    "images": [future1, future2]
  },
  {
    "id": "zaer",
    "eng": "ZAER — Conversational AI Guide",
    "group": "ai",
    "live": false,
    "fa": {
      "title": "دستیار هوشمند زائر",
      "category": "دستیار هوشمند",
      "summary": "راهنمای گفت‌وگومحور ویژه زائران حرم مطهر رضوی با پرسش‌وپاسخ صوتی و متنی، نمایش متن مکالمه و امکان ارائه پاسخ از طریق آواتار تصویری.",
      "intro": "دستیار هوشمند زائر، یک راهنمای مکالمه‌ای ویژه زائران حرم مطهر رضوی است. کاربر می‌تواند پرسش را با صدا یا متن مطرح کند و پاسخ را در قالب گفت‌وگو با یک آواتار تصویری دریافت کند.",
      "services": [
        "پاسخ‌گویی به پرسش‌های عمومی درباره حرم و خدمات زائر",
        "راهنمایی درباره فضاها و مسیرهای شناخته‌شده",
        "گفت‌وگوی صوتی و متنی همراه با نمایش متن مکالمه"
      ],
      "features": [
        "نمایش آواتار سخنگو و وضعیت ارتباط",
        "ورود متن و آغاز گفت‌وگو با میکروفون",
        "پنل متن گفت‌وگو",
        "فیلدهای دریافت ایمیل و شماره تماس"
      ],
      "tech": [
        "وب‌اپلیکیشن تعاملی با رابط فارسی",
        "معماری پیشنهادی گفت‌وگوی بلادرنگ بر بستر LiveKit و آواتار Tavus",
        "نیازمند اینترنت و تجهیزات صوتی مناسب",
        "دسترسی به پایگاه دانش باید در استقرار نهایی پیکربندی شود"
      ],
      "uses": [
        "کیوسک راهنمای حرم",
        "مراکز اطلاع‌رسانی زیارتی",
        "پایانه‌های راهنمای گردشگری و اماکن عمومی"
      ],
      "value": "تبدیل کیوسک به راهنمای دیجیتال تعاملی برای مراجعه‌کنندگان.",
      "hardware": "کیوسک راهنما / نمایشگر لمسی + میکروفون",
      "status": "نمونه رابط کاربری"
    },
    "en": {
      "title": "ZAER — Conversational AI Guide",
      "category": "AI assistant",
      "summary": "A conversational guide for pilgrims of the Imam Reza shrine — voice and text Q&A, a live transcript and answers delivered by a video avatar.",
      "intro": "A conversational guide for pilgrims of the Imam Reza shrine. Visitors ask by voice or text and receive answers in a dialogue with a visual avatar.",
      "services": [
        "Answering general questions about the shrine and pilgrim services",
        "Guidance on known spaces and routes",
        "Voice and text conversation with a live transcript"
      ],
      "features": [
        "Talking avatar with connection status",
        "Text input and microphone conversation",
        "Conversation transcript panel",
        "Email and phone capture fields"
      ],
      "tech": [
        "Interactive web application, Persian UI",
        "Proposed real-time stack: LiveKit + Tavus avatar",
        "Requires internet and suitable audio hardware",
        "Knowledge base configured at deployment"
      ],
      "uses": [
        "Shrine guide kiosks",
        "Pilgrim information centres",
        "Tourism and public-space guide terminals"
      ],
      "value": "Turns a kiosk into an interactive digital guide for visitors.",
      "hardware": "Guide kiosk / touch display + microphone",
      "status": "UI prototype"
    },
    "images": [zaer1, zaer2]
  },
  {
    "id": "tecmall",
    "eng": "Interactive mall wayfinding",
    "group": "retail",
    "live": false,
    "fa": {
      "title": "تک‌مال | TECMALL",
      "category": "مسیریابی و خدمات",
      "summary": "راهنمای هوشمند مجتمع‌های تجاری با نقشه‌های دوبعدی و سه‌بعدی، مسیریابی در طبقات، جست‌وجوی فروشگاه‌ها و نمایش خدمات و پیشنهادهای ویژه.",
      "intro": "تک‌مال یک سامانه راهنمای دیجیتال مراکز خرید است که خدمات جست‌وجوی فروشگاه، مسیریابی داخلی، نمایش مدل سه‌بعدی مجتمع و اطلاع‌رسانی رفاهی را در یک تجربه واحد کنار هم قرار می‌دهد.",
      "services": [
        "راهنمای پیدا کردن فروشگاه‌ها و واحدهای تجاری",
        "محاسبه مسیر از ورودی تا مقصد روی نقشه",
        "معرفی رستوران‌ها، امکانات، تخفیف‌ها و سرگرمی‌ها"
      ],
      "features": [
        "جست‌وجو با فیلتر صنف و طبقه",
        "نقشه‌های 2D و 3D چندطبقه",
        "نمایش مسیر و شبیه‌سازی حرکت در مدل سه‌بعدی",
        "پنل جزئیات فروشگاه، اطلاعات تماس و گزینه QR",
        "دستیار گفت‌وگوی ShopAvatar و بخش بازی‌ها"
      ],
      "tech": [
        "وب‌اپلیکیشن تعاملی سازگار با مرورگر",
        "نمایش گرافیک سه‌بعدی؛ GPU سازگار با WebGL توصیه می‌شود",
        "رابط فارسی RTL و کنترل با لمس",
        "پنل مدیریت محتوا با صفحه ورود"
      ],
      "uses": [
        "مراکز خرید و مجتمع‌های چندطبقه",
        "کیوسک راهنمای لابی و ورودی",
        "پایانه تبلیغات و خدمات بازدیدکننده"
      ],
      "value": "تبدیل کیوسک به راهنمای دیجیتال مجموعه و تسهیل تجربه بازدید و خرید.",
      "hardware": "کیوسک و نمایشگر لمسی؛ رایانه مجهز به شتاب‌دهی سه‌بعدی",
      "status": "نسخه نمایشی"
    },
    "en": {
      "title": "TECMALL — Mall Wayfinding",
      "category": "Wayfinding & services",
      "summary": "A smart guide for shopping centres — 2D and 3D maps, multi-floor wayfinding, store search, amenities and featured offers.",
      "intro": "TECMALL brings store search, indoor wayfinding, a 3D model of the mall and visitor information together into one experience.",
      "services": [
        "Finding stores and retail units",
        "Routing from entrance to destination on the map",
        "Restaurants, amenities, offers and entertainment"
      ],
      "features": [
        "Search filtered by category and floor",
        "Multi-floor 2D and 3D maps",
        "Route display with motion through the 3D model",
        "Store details, contact and QR option",
        "ShopAvatar chat assistant and games"
      ],
      "tech": [
        "Browser-based interactive web app",
        "3D graphics — WebGL-capable GPU recommended",
        "Persian RTL interface with touch control",
        "Content admin panel with sign-in"
      ],
      "uses": [
        "Shopping malls and multi-storey complexes",
        "Lobby and entrance guide kiosks",
        "Advertising and visitor-service terminals"
      ],
      "value": "Turns a kiosk into the mall’s digital guide, easing every visit.",
      "hardware": "Touch kiosk / display; PC with 3D acceleration",
      "status": "Demo"
    },
    "images": [tecmall1, tecmall2]
  },
  {
    "id": "fitly",
    "eng": "Virtual try-on & personal styling",
    "group": "retail",
    "live": false,
    "fa": {
      "title": "فیتلی | FITLY",
      "category": "مد و خرده‌فروشی",
      "summary": "تجربه پرو مجازی پوشاک و انتخاب استایل با پشتیبانی از کمد دیجیتال، ثبت تصویر، پیشنهاد ست لباس و مشاوره تعاملی.",
      "intro": "فیتلی یک دستیار دیجیتال انتخاب پوشاک است که کمد لباس شخصی، پیشنهاد ترکیب‌های پوششی، مشاوره استایل و مسیر پرو مجازی را در کنار هم قرار می‌دهد.",
      "services": [
        "مرور و دسته‌بندی لباس‌ها در کمد دیجیتال",
        "مشاوره استایل متناسب با سلیقه و اطلاعات پروفایل",
        "انتخاب لباس و ثبت یا بارگذاری عکس برای پرو مجازی"
      ],
      "features": [
        "کمد لباس با دسته‌بندی پوشاک و اکسسوری",
        "چت مشاور استایل و پیشنهاد ست‌ها",
        "پروفایل ویژگی‌های ظاهری و ترجیحات پوشش",
        "مسیر مرحله‌ای پرو مجازی و دسترسی به دوربین",
        "نمایش ست‌های پیشنهادی و آیتم‌های ذخیره‌شده"
      ],
      "tech": [
        "وب‌اپلیکیشن فارسی و واکنش‌گرا",
        "ورود عکس از دوربین یا گالری",
        "برای اجرای نسخه فروشگاهی، دستگاه دارای مرورگر و دوربین پیشنهاد می‌شود"
      ],
      "uses": [
        "فروشگاه‌های پوشاک و مزون‌ها",
        "کیوسک‌های پرو مجازی",
        "پلتفرم‌های فروش آنلاین مد و لباس"
      ],
      "value": "تبدیل کیوسک فروشگاهی به نقطه مشاوره استایل و تجربه پرو مجازی لباس.",
      "hardware": "کیوسک و نمایشگر لمسی با دوربین و اینترنت مناسب",
      "status": "نسخه نمایشی"
    },
    "en": {
      "title": "FITLY — Virtual Try-on",
      "category": "Fashion & retail",
      "summary": "A virtual try-on and styling experience — a digital wardrobe, photo capture, outfit suggestions and interactive styling advice.",
      "intro": "FITLY is a digital styling assistant that brings a personal wardrobe, outfit suggestions, style advice and a virtual try-on flow together.",
      "services": [
        "Browsing and organising clothes in a digital wardrobe",
        "Style advice matched to taste and profile",
        "Choosing pieces and capturing a photo for try-on"
      ],
      "features": [
        "Wardrobe sorted by clothing and accessories",
        "Style-advisor chat and outfit suggestions",
        "Profile of appearance and preferences",
        "Stepped try-on flow with camera access",
        "Suggested looks and saved items"
      ],
      "tech": [
        "Responsive web application, Persian UI",
        "Photo input from camera or gallery",
        "In-store: a device with browser and camera recommended"
      ],
      "uses": [
        "Fashion stores and boutiques",
        "Virtual try-on kiosks",
        "Online fashion retail platforms"
      ],
      "value": "Turns a store kiosk into a styling point with virtual try-on.",
      "hardware": "Touch kiosk / display with camera and internet",
      "status": "Demo"
    },
    "images": [fitly1, fitly2]
  },
];
