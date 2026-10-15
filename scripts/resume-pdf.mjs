#!/usr/bin/env node
/**
 * Regenerates the downloadable résumé PDFs from the site's own résumé page.
 *
 *   npm run resume:pdf
 *
 * 1. exports the static HTML (html/fa-resume.html, html/en-resume.html)
 * 2. prints each to A4 PDF  → public/files/narges-jafar-tabatabaei-resume-{fa,en}.pdf
 *    and a preview image    → public/files/resume-preview-{fa,en}.webp
 * 3. exports again so the HTML files embed the fresh PDFs
 *
 * Needs a Chromium: set CHROMIUM_PATH, or have one at a common location.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public/files");
const candidates = [
  process.env.CHROMIUM_PATH,
  "/opt/pw-browsers/chromium",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].filter(Boolean);
const executablePath = candidates.find((p) => existsSync(p));
if (!executablePath) {
  console.error("No Chromium found — set CHROMIUM_PATH to a Chrome/Chromium executable.");
  process.exit(1);
}

const exportHtml = () => execSync("node scripts/export-html.mjs", { stdio: "inherit" });

exportHtml();
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath });
for (const locale of ["fa", "en"]) {
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  // The site opens at night; the résumé is printed (and previewed) on paper.
  await page.addInitScript(() => {
    try {
      localStorage.setItem("theme", "light");
    } catch {}
  });
  await page.goto(pathToFileURL(path.join(root, "html", `${locale}-resume.html`)).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const pdf = path.join(outDir, `narges-jafar-tabatabaei-resume-${locale}.pdf`);
  await page.pdf({ path: pdf, format: "A4", printBackground: true, preferCSSPageSize: true });

  // Preview: the first page as it prints, as a light WebP.
  await page.emulateMedia({ media: "print", colorScheme: "light" });
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: 794, height: 1123 } });
  await sharp(png).resize(620).webp({ quality: 82 }).toFile(path.join(outDir, `resume-preview-${locale}.webp`));
  console.log(`public/files/${path.basename(pdf)}`);
  await page.close();
}
await browser.close();

exportHtml();
