#!/usr/bin/env node
/**
 * Social share cards (1200×630) for each language, drawn with the site's own
 * fonts and colours and saved to public/og/{fa,en}.png.
 *
 *   npm run og:image
 *
 * Re-run after changing the name, role or portrait. Needs a Chromium: set
 * CHROMIUM_PATH, or have one at a common location.
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd();
const outDir = path.join(root, "public/og");
const executablePath = [
  process.env.CHROMIUM_PATH,
  "/opt/pw-browsers/chromium",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
]
  .filter(Boolean)
  .find((p) => existsSync(p));
if (!executablePath) {
  console.error("No Chromium found — set CHROMIUM_PATH to a Chrome/Chromium executable.");
  process.exit(1);
}

// Everything is embedded: a page set from memory can't load local files.
const dataUri = (file, type) => `data:${type};base64,${readFileSync(file).toString("base64")}`;
const font = (file) => dataUri(path.join(root, "src/fonts", file), "font/woff2");
const portraitLine = readFileSync(path.join(root, "content/profile.yaml"), "utf8").match(/^portrait:\s*(.+)$/m);
const portraitFile = portraitLine && path.join(root, "public", portraitLine[1].trim());
const portrait =
  portraitFile && existsSync(portraitFile)
    ? dataUri(portraitFile, `image/${path.extname(portraitFile).slice(1).replace("jpg", "jpeg")}`)
    : null;

const copy = {
  fa: {
    dir: "rtl",
    name: ["نرگس", "جعفر طباطبایی"],
    role: "مدیر محصول و طراح تجربه‌های دیجیتال تعاملی",
    line: "نرم‌افزار سفارشی · کیوسک و میز لمسی · پکیج سخت‌افزار و نرم‌افزار",
  },
  en: {
    dir: "ltr",
    name: ["Narges", "Jafar Tabatabaei"],
    role: "Product manager & interactive experience designer",
    line: "Custom software · Touch kiosks & tables · Hardware + software packages",
  },
};

const page = (l) => `<!doctype html><html lang="${l}"><head><meta charset="utf-8"><style>
@font-face{font-family:OgNaskh;src:url(${font("noto-naskh-arabic-arabic-wght-normal.woff2")});font-weight:400 700}
@font-face{font-family:Estedad;src:url(${font("estedad-arabic-wght-normal.woff2")});font-weight:100 900}
@font-face{font-family:Estedad;src:url(${font("estedad-latin-wght-normal.woff2")});font-weight:100 900}
@font-face{font-family:Bodoni;src:url(${font("bodoni-moda-latin-wght-normal.woff2")});font-weight:400 900}
@font-face{font-family:Bodoni;font-style:italic;src:url(${font("bodoni-moda-latin-wght-italic.woff2")});font-weight:400 900}
@font-face{font-family:Schibsted;src:url(${font("schibsted-grotesk-latin-wght-normal.woff2")});font-weight:400 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden}
.card{position:relative;width:1200px;height:630px;overflow:hidden;background:#0b0b0c;color:#ede8df;font-family:${l === "fa" ? "Estedad" : "Schibsted"},sans-serif}
.glow{position:absolute;inset:auto;width:900px;height:900px;border-radius:50%;background:radial-gradient(closest-side,rgba(216,187,138,.22),transparent);${l === "fa" ? "left" : "right"}:-250px;top:-300px}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(237,232,223,.12) 1px,transparent 1.4px);background-size:22px 22px;mask-image:linear-gradient(${l === "fa" ? "to left" : "to right"},black,transparent 70%)}
.wrap{position:relative;height:100%;display:flex;align-items:center;gap:64px;padding:72px 80px}
.text{flex:1;min-width:0}
.tag{display:flex;align-items:center;gap:14px;font-size:22px;color:#d8bb8a}
.tag i{display:block;width:44px;height:1px;background:#d8bb8a}
h1{margin-top:28px;font-family:${l === "fa" ? "OgNaskh" : "Bodoni"},serif;font-weight:${l === "fa" ? 500 : 400};font-size:${l === "fa" ? 118 : 104}px;line-height:.92}
h1 span{display:block;background:linear-gradient(100deg,#ede8df,#d8bb8a 55%,#f3e2c2);-webkit-background-clip:text;color:transparent;${l === "en" ? "font-style:italic;" : ""}}
.role{margin-top:30px;font-size:28px;color:#c4beb3}
.line{margin-top:40px;padding-top:24px;border-top:1px solid rgba(237,232,223,.12);font-size:20px;color:#8d877c}
.photo{width:300px;height:380px;border-radius:28px;overflow:hidden;box-shadow:0 0 0 1px rgba(237,232,223,.12),0 40px 80px -30px rgba(0,0,0,.8)}
.photo img{width:100%;height:100%;object-fit:cover;object-position:50% 30%}
</style></head><body><div class="card"><div class="glow"></div><div class="dots"></div><div class="wrap" dir="${copy[l].dir}"><div class="text">
<p class="tag"><i></i>${l === "fa" ? "پرتفولیو و رزومه" : "Portfolio & résumé"}</p>
<h1>${copy[l].name[0]}<span>${copy[l].name[1]}</span></h1>
<p class="role">${copy[l].role}</p><p class="line">${copy[l].line}</p></div>
${portrait ? `<div class="photo"><img src="${portrait}"></div>` : ""}</div></div></body></html>`;

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath });
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const l of ["fa", "en"]) {
  await tab.setContent(page(l), { waitUntil: "load" });
  // Load the heading faces explicitly; fonts.ready alone can resolve first.
  await tab.evaluate(() =>
    Promise.all(["500 118px OgNaskh", "400 104px Bodoni", "italic 400 104px Bodoni"].map((f) => document.fonts.load(f, "نرگس Narges"))),
  );
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: path.join(outDir, `${l}.png`) });
  console.log(`public/og/${l}.png`);
}
await browser.close();
