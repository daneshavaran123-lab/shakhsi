"use client";

import dynamic from "next/dynamic";

// The WebGL image layer only exists in the browser.
const GlMedia = dynamic(() => import("@/components/three/gl-media"), { ssr: false });

export function GlLayer() {
  return <GlMedia />;
}
