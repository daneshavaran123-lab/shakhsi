import { collection, config, fields, singleton } from "@keystatic/core";

/**
 * Admin panel at /keystatic.
 *
 * Locally (npm run dev) edits are written straight to the files in this repo.
 * In production the panel commits to GitHub instead: set
 * NEXT_PUBLIC_KEYSTATIC_STORAGE=github plus the GitHub app variables (see README).
 */
const storage =
  process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github"
    ? ({
        kind: "github",
        repo: { owner: "daneshavaran123-lab", name: "shakhsi" },
      } as const)
    : ({ kind: "local" } as const);

const list = (label: string, itemLabel: string) =>
  fields.array(fields.text({ label: itemLabel }), {
    label,
    itemLabel: (props) => props.value || itemLabel,
  });

const projectCopy = (lang: "fa" | "en") => {
  const fa = lang === "fa";
  return fields.object(
    {
      ...(fa ? {} : { title: fields.text({ label: "Title", validation: { isRequired: true } }) }),
      category: fields.text({ label: fa ? "دسته" : "Category" }),
      client: fields.text({ label: fa ? "کارفرما (اختیاری)" : "Client (optional)" }),
      role: fields.text({ label: fa ? "نقش من در پروژه" : "My role" }),
      status: fields.text({ label: fa ? "وضعیت (مثلاً نسخه آنلاین)" : "Status (e.g. Live)" }),
      summary: fields.text({ label: fa ? "خلاصه یک‌خطی" : "One-line summary", multiline: true }),
      intro: fields.text({ label: fa ? "معرفی" : "Introduction", multiline: true }),
      value: fields.text({ label: fa ? "ارزش کاربردی" : "Value", multiline: true }),
      hardware: fields.text({ label: fa ? "بستر پیشنهادی" : "Recommended setup" }),
      services: list(fa ? "خدمات ارائه‌شده" : "What it offers", fa ? "مورد" : "Item"),
      features: list(fa ? "امکانات نرم‌افزار" : "Features", fa ? "مورد" : "Item"),
      tech: list(fa ? "مشخصات فنی" : "Technical", fa ? "مورد" : "Item"),
      uses: list(fa ? "کاربردها" : "Where it’s used", fa ? "مورد" : "Item"),
      links: fields.array(
        fields.object({
          label: fields.text({ label: fa ? "عنوان لینک" : "Link label" }),
          url: fields.url({ label: fa ? "آدرس" : "URL" }),
        }),
        { label: fa ? "لینک‌های بیشتر (مثلاً صفحه محصول)" : "More links (e.g. product pages)", itemLabel: (p) => p.fields.label.value || "—" },
      ),
    },
    { label: fa ? "محتوای فارسی" : "English content" },
  );
};

const certCopy = (lang: "fa" | "en") => {
  const fa = lang === "fa";
  return fields.object(
    {
      ...(fa ? {} : { title: fields.text({ label: "Title", validation: { isRequired: true } }) }),
      field: fields.text({ label: fa ? "حوزه" : "Field" }),
      issuer: fields.text({ label: fa ? "برگزارکننده" : "Issuer" }),
      summary: fields.text({ label: fa ? "توضیح" : "Description", multiline: true }),
      meta: list(fa ? "برچسب‌ها (مدت، تاریخ، ...)" : "Tags (duration, date, …)", fa ? "برچسب" : "Tag"),
    },
    { label: fa ? "محتوای فارسی" : "English content" },
  );
};

const profileCopy = (lang: "fa" | "en") => {
  const fa = lang === "fa";
  return fields.object(
    {
      tagline: fields.text({ label: fa ? "متن معرفی زیر نام" : "Tagline", multiline: true }),
      about: list(fa ? "جمله‌های بزرگ بخش درباره" : "Large About statements", fa ? "جمله" : "Sentence"),
      bio: fields.text({ label: fa ? "معرفی کامل (درباره من)" : "Bio (About me)", multiline: true }),
      principles: fields.array(
        fields.object({
          title: fields.text({ label: fa ? "عنوان" : "Title" }),
          body: fields.text({ label: fa ? "متن" : "Body", multiline: true }),
        }),
        { label: fa ? "شیوه کار من (کارت‌ها)" : "How I work (cards)", itemLabel: (p) => p.fields.title.value || "—" },
      ),
      experience: fields.array(
        fields.object({
          title: fields.text({ label: fa ? "سمت" : "Role" }),
          org: fields.text({ label: fa ? "سازمان" : "Organisation" }),
          period: fields.text({ label: fa ? "مدت یا بازه" : "Period" }),
          url: fields.url({ label: fa ? "لینک سازمان (اختیاری)" : "Organisation link (optional)" }),
        }),
        { label: fa ? "سوابق" : "Experience", itemLabel: (p) => p.fields.title.value || "—" },
      ),
      education: fields.array(
        fields.object({
          degree: fields.text({ label: fa ? "مقطع" : "Degree" }),
          school: fields.text({ label: fa ? "دانشگاه" : "University" }),
        }),
        { label: fa ? "تحصیلات" : "Education", itemLabel: (p) => p.fields.degree.value || "—" },
      ),
      languages: fields.array(
        fields.object({
          name: fields.text({ label: fa ? "زبان" : "Language" }),
          level: fields.text({ label: fa ? "سطح" : "Level" }),
        }),
        { label: fa ? "زبان‌ها" : "Languages", itemLabel: (p) => p.fields.name.value || "—" },
      ),
      fields: fields.text({ label: fa ? "حوزه‌های کاری" : "Fields of work", multiline: true }),
    },
    { label: fa ? "فارسی" : "English" },
  );
};

const servicesCopy = (lang: "fa" | "en") => {
  const fa = lang === "fa";
  return fields.object(
    {
      heading: list(fa ? "عنوان (هر خط جدا)" : "Heading (one line each)", fa ? "خط" : "Line"),
      intro: fields.text({ label: fa ? "معرفی" : "Intro", multiline: true }),
      items: fields.array(
        fields.object({
          title: fields.text({ label: fa ? "عنوان خدمت" : "Service" }),
          body: fields.text({ label: fa ? "توضیح" : "Description", multiline: true }),
          points: list(fa ? "جزئیات" : "Details", fa ? "مورد" : "Item"),
        }),
        { label: fa ? "خدمات" : "Services", itemLabel: (p) => p.fields.title.value || "—" },
      ),
      packagesTitle: fields.text({ label: fa ? "عنوان بخش پکیج‌ها" : "Packages heading" }),
      packages: fields.array(
        fields.object({
          title: fields.text({ label: fa ? "فضا / صنعت" : "Space / industry" }),
          body: fields.text({ label: fa ? "توضیح" : "Description", multiline: true }),
          projects: list(fa ? "شناسه پروژه‌های نمونه (مثلاً museum)" : "Example project ids", fa ? "شناسه" : "id"),
        }),
        { label: fa ? "پکیج‌ها بر اساس فضا" : "Packages by space", itemLabel: (p) => p.fields.title.value || "—" },
      ),
      cta: fields.text({ label: fa ? "دعوت به سفارش" : "Call to action", multiline: true }),
    },
    { label: fa ? "فارسی" : "English" },
  );
};

export default config({
  storage,
  ui: {
    brand: { name: "پنل مدیریت سایت" },
    navigation: {
      "محتوا": ["projects", "certificates"],
      "تنظیمات": ["profile", "services"],
    },
  },
  collections: {
    projects: collection({
      label: "پروژه‌ها",
      path: "content/projects/*",
      format: { data: "yaml" },
      slugField: "title",
      columns: ["title", "order"],
      entryLayout: "form",
      schema: {
        title: fields.slug({
          name: { label: "عنوان فارسی", validation: { isRequired: true } },
          slug: {
            label: "شناسه انگلیسی (در آدرس)",
            description: "فقط حروف انگلیسی کوچک و خط تیره؛ مثلاً my-project",
          },
        }),
        order: fields.integer({ label: "ترتیب نمایش", description: "عدد کوچک‌تر بالاتر", defaultValue: 100 }),
        eng: fields.text({ label: "زیرعنوان لاتین", description: "در نسخه فارسی زیر عنوان نمایش داده می‌شود" }),
        group: fields.select({
          label: "گروه (برای فیلتر)",
          options: [
            { label: "مدیریت", value: "management" },
            { label: "نمایشگاه و فرهنگ", value: "culture" },
            { label: "خدمات و خرده‌فروشی", value: "retail" },
            { label: "هوش مصنوعی", value: "ai" },
            { label: "کودک و آموزش", value: "kids" },
          ],
          defaultValue: "management",
        }),
        url: fields.url({ label: "لینک نسخه آنلاین (اختیاری)" }),
        live: fields.checkbox({ label: "نسخه آنلاین فعال است", defaultValue: false }),
        images: fields.array(
          fields.image({
            label: "تصویر",
            directory: "public/images/projects",
            publicPath: "/images/projects/",
            validation: { isRequired: true },
          }),
          { label: "تصاویر (اولی تصویر اصلی است)", itemLabel: (p) => p.value?.filename ?? "تصویر" },
        ),
        fa: projectCopy("fa"),
        en: projectCopy("en"),
      },
    }),

    certificates: collection({
      label: "مدرک‌ها و دوره‌ها",
      path: "content/certificates/*",
      format: { data: "yaml" },
      slugField: "title",
      columns: ["title", "order"],
      entryLayout: "form",
      schema: {
        title: fields.slug({
          name: { label: "عنوان فارسی", validation: { isRequired: true } },
          slug: { label: "شناسه انگلیسی", description: "فقط حروف انگلیسی کوچک و خط تیره" },
        }),
        order: fields.integer({ label: "ترتیب نمایش", description: "عدد کوچک‌تر جلوتر", defaultValue: 100 }),
        image: fields.image({
          label: "تصویر مدرک",
          directory: "public/images/certificates",
          publicPath: "/images/certificates/",
          validation: { isRequired: true },
        }),
        hours: fields.integer({ label: "ساعت آموزش (اختیاری)", description: "در جمع ساعت‌ها حساب می‌شود" }),
        skills: list("مهارت‌ها (انگلیسی)", "مهارت"),
        fa: certCopy("fa"),
        en: certCopy("en"),
      },
    }),
  },

  singletons: {
    services: singleton({
      label: "خدمات",
      path: "content/services",
      format: { data: "yaml" },
      schema: {
        fa: servicesCopy("fa"),
        en: servicesCopy("en"),
      },
    }),

    profile: singleton({
      label: "پروفایل و متن‌های اصلی",
      path: "content/profile",
      format: { data: "yaml" },
      schema: {
        portrait: fields.image({
          label: "عکس پرتره",
          description: "مربعی یا عمودی، حداقل ۸۰۰ پیکسل",
          directory: "public/images/profile",
          publicPath: "/images/profile/",
        }),
        email: fields.text({ label: "ایمیل", validation: { isRequired: true } }),
        phone: fields.text({ label: "شماره تماس", description: "مثلاً 09151236596" }),
        linkedin: fields.url({ label: "لینک لینکدین" }),
        telegram: fields.text({ label: "آیدی تلگرام", description: "بدون @؛ مثلاً nargestabatabaii" }),
        companyUrl: fields.url({ label: "وب‌سایت شرکت" }),
        resumeFa: fields.file({
          label: "فایل رزومه فارسی (PDF)",
          description: "خالی بگذارید تا نسخه خودکار استفاده شود",
          directory: "public/files",
          publicPath: "/files/",
        }),
        resumeEn: fields.file({
          label: "فایل رزومه انگلیسی (PDF)",
          directory: "public/files",
          publicPath: "/files/",
        }),
        stack: fields.array(
          fields.object({
            group: fields.text({ label: "دسته (فارسی)" }),
            groupEn: fields.text({ label: "Group (English)" }),
            items: list("ابزارها و فناوری‌ها", "مورد"),
          }),
          { label: "مهارت‌ها و ابزارها", itemLabel: (p) => p.fields.group.value || "—" },
        ),
        available: fields.checkbox({ label: "نشان «آماده همکاری» نمایش داده شود", defaultValue: true }),
        specialistFields: fields.integer({ label: "تعداد حوزه‌های تخصصی (آمار بخش آموزش)", defaultValue: 6 }),
        fa: profileCopy("fa"),
        en: profileCopy("en"),
      },
    }),
  },
});
