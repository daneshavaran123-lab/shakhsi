import type { NextConfig } from "next";

// `npm run export:html` builds a fully static copy (no server, no admin panel).
const staticHtml = !!process.env.NEXT_PUBLIC_STATIC_HTML;

const nextConfig: NextConfig = {
  ...(staticHtml && { output: "export", distDir: ".next-html" }),
  images: staticHtml ? { unoptimized: true } : { formats: ["image/avif", "image/webp"] },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  ...(!staticHtml && {
    async redirects() {
      return [{ source: "/", destination: "/fa", permanent: false }];
    },
  }),
};

export default nextConfig;
