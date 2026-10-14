#!/usr/bin/env node
/**
 * Standalone HTML export.
 *
 *   npm run export:html   →   html/fa.html, en.html, index.html (= fa),
 *                             fa-resume.html, en-resume.html
 *
 * Each file is fully self-contained: CSS, fonts, scripts (including the
 * Three.js scene) and every image are inlined, so it opens straight from
 * disk or can be uploaded to any static host. The admin panel needs a
 * server and is left out of this export; edit content with `npm run dev`
 * (/keystatic) and export again.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
// With a custom distDir, `output: "export"` writes the static site there.
const outDir = path.join(root, ".next-html");
const destDir = path.join(root, "html");
const locales = ["fa", "en"];

// Route handlers and the admin UI can't be statically exported; Next ignores
// folders that start with "_", so park them there for the duration of the build.
const parked = [
  ["src/app/keystatic", "src/app/_keystatic"],
  ["src/app/api", "src/app/_api"],
];

function build() {
  for (const [from, to] of parked) if (existsSync(from)) renameSync(from, to);
  try {
    execSync("npx next build", {
      stdio: "inherit",
      env: { ...process.env, NEXT_PUBLIC_STATIC_HTML: "1", NEXT_TELEMETRY_DISABLED: "1" },
    });
  } finally {
    for (const [from, to] of parked) if (existsSync(to)) renameSync(to, from);
  }
}

const mime = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

const dataCache = new Map();
function dataUri(file) {
  if (!dataCache.has(file)) {
    const type = mime[path.extname(file).toLowerCase()] ?? "application/octet-stream";
    dataCache.set(file, `data:${type};base64,${readFileSync(file).toString("base64")}`);
  }
  return dataCache.get(file);
}

/** Resolve a site-absolute URL ("/_next/…", "/images/…") to a file in out/. */
const fileFor = (url) => path.join(outDir, decodeURIComponent(url.split(/[?#]/)[0]));

// Inside <script>, "</script" ends the element and "<!--" + "<script" switch
// the HTML parser into an escaped state that swallows later scripts. These
// only occur inside JS strings/regexes, where \x3C is an equivalent "<".
const scriptTag = (code) => `<script>${code.replace(/<(\/?script|!--)/gi, "\\x3C$1")}</script>`;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function inline(html) {
  // Stylesheets → <style>, with fonts and other url() assets embedded.
  html = html.replace(/<link rel="stylesheet" href="([^"]+)"[^>]*>/g, (_, href) => {
    const css = readFileSync(fileFor(href), "utf8").replace(
      /url\((\/_next\/[^)]+)\)/g,
      (_m, url) => `url(${dataUri(fileFor(url))})`,
    );
    return `<style>${css}</style>`;
  });

  // Preload hints point at files that won't exist next to the HTML.
  html = html.replace(/<link rel="preload"[^>]*>/g, "");

  // Favicon.
  html = html.replace(/(<link rel="icon" href=")([^"]+)(")/g, (_m, a, href, b) => a + dataUri(fileFor(href)) + b);

  // Resource hints inside the React payload (fonts, the stylesheet) would make
  // React re-request files that are already inlined above; drop those rows.
  html = html.replace(/:HL\[\\"\/_next\/static\/[^\]]*\]\\n/g, "");

  // The payload also renders the stylesheet <link>; its rules are already in
  // the <style> above, so point it at an empty sheet instead of a missing file.
  html = html.replace(/\/_next\/static\/css\/[\w]+\.css/g, "data:text/css,");

  // Favicon references inside the payload.
  html = html.replace(/\/icon\.svg\?[\w]+/g, (url) => dataUri(fileFor(url)));

  // Images: both the server-rendered <img> tags and the copies inside the
  // React payload that hydrates the page.
  html = html.replace(/\/images\/[\w\-/]+\.(?:webp|png|jpe?g|avif|gif)/g, (url) => dataUri(fileFor(url)));

  // Scripts: drop the external tags, then inline every chunk so webpack never
  // has to fetch one (dynamic imports such as the 3D scene resolve from memory).
  const referenced = [];
  html = html.replace(/<script src="([^"]+)"[^>]*><\/script>/g, (_, src) => {
    if (!/polyfills/.test(src)) referenced.push(fileFor(src));
    return "";
  });

  const chunksDir = path.join(outDir, "_next/static/chunks");
  // Skip the pages-router boot code (main-*.js, pages/*): it expects
  // __NEXT_DATA__, which an app-router page doesn't have.
  const skip = (f) =>
    /polyfills/.test(f) || /[\\/]main-(?!app)/.test(f) || /[\\/]pages[\\/]/.test(f) || /_not-found/.test(f);
  const all = walk(chunksDir).filter((f) => f.endsWith(".js") && !skip(f));
  const runtime = referenced.find((f) => /webpack-/.test(path.basename(f)));
  const extras = all.filter((f) => !referenced.includes(f));
  // main-app boots hydration as soon as it runs, and microtasks fire between
  // inline scripts — so every other chunk must already be registered by then.
  const boot = referenced.filter((f) => /main-app/.test(path.basename(f)));
  const rest = referenced.filter((f) => f !== runtime && !boot.includes(f));
  const ordered = [runtime, ...extras, ...rest, ...boot].filter(Boolean);
  const bundle = ordered.map((f) => scriptTag(readFileSync(f, "utf8"))).join("");

  // Splice rather than String#replace: inlined code is full of "$&"-style
  // sequences that replace() would treat as substitution patterns.
  const at = html.lastIndexOf("</body>");
  return html.slice(0, at) + bundle + html.slice(at);
}

build();
mkdirSync(destDir, { recursive: true });
const pages = locales.flatMap((locale) => [
  { from: `${locale}.html`, to: [`${locale}.html`, ...(locale === "fa" ? ["index.html"] : [])] },
  { from: `${locale}/resume.html`, to: [`${locale}-resume.html`] },
]);
for (const page of pages) {
  const html = inline(readFileSync(path.join(outDir, page.from), "utf8"));
  for (const name of page.to) writeFileSync(path.join(destDir, name), html);
  console.log(`html/${page.to[0]}  ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB`);
}
