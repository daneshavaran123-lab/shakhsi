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
      status: fields.text({ label: fa ? "وضعیت (مثلاً نسخه آنلاین)" : "Status (e.g. Live)" }),
      summary: fields.text({ label: fa ? "خلاصه یک‌خطی" : "One-line summary", multiline: true }),
      intro: fields.text({ label: fa ? "معرفی" : "Introduction", multiline: true }),
      value: fields.text({ label: fa ? "ارزش کاربردی" : "Value", multiline: true }),
      hardware: fields.text({ label: fa ? "بستر پیشنهادی" : "Recommended setup" }),
      services: list(fa ? "خدمات ارائه‌شده" : "What it offers", fa ? "مورد" : "Item"),
      features: list(fa ? "امکانات نرم‌افزار" : "Features", fa ? "مورد" : "Item"),
      tech: list(fa ? "مشخصات فنی" : "Technical", fa ? "مورد" : "Item"),
      uses: list(fa ? "کاربردها" : "Where it’s used", fa ? "مورد" : "Item"),
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

export default config({
  storage,
  ui: {
    brand: { name: "پنل مدیریت سایت" },
    navigation: {
      "محتوا": ["projects", "certificates"],
      "تنظیمات": ["profile"],
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
        available: fields.checkbox({ label: "نشان «آماده همکاری» نمایش داده شود", defaultValue: true }),
        specialistFields: fields.integer({ label: "تعداد حوزه‌های تخصصی (آمار بخش آموزش)", defaultValue: 6 }),
        fa: fields.object(
          {
            tagline: fields.text({ label: "متن معرفی زیر نام", multiline: true }),
            about: list("پاراگراف‌های درباره", "جمله"),
            principles: fields.array(
              fields.object({
                title: fields.text({ label: "عنوان" }),
                body: fields.text({ label: "متن", multiline: true }),
              }),
              { label: "اصول کاری (کارت‌ها)", itemLabel: (p) => p.fields.title.value || "کارت" },
            ),
            fields: fields.text({ label: "حوزه‌های کاری", multiline: true }),
          },
          { label: "فارسی" },
        ),
        en: fields.object(
          {
            tagline: fields.text({ label: "Tagline", multiline: true }),
            about: list("About paragraphs", "Sentence"),
            principles: fields.array(
              fields.object({
                title: fields.text({ label: "Title" }),
                body: fields.text({ label: "Body", multiline: true }),
              }),
              { label: "Principles (cards)", itemLabel: (p) => p.fields.title.value || "Card" },
            ),
            fields: fields.text({ label: "Fields of work", multiline: true }),
          },
          { label: "English" },
        ),
      },
    }),
  },
});
