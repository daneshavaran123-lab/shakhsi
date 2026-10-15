"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const read = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

/** Theme lives on <html data-theme>; an inline script sets it before paint. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);

  const setTheme = useCallback((next: Theme, persist = true) => {
    document.documentElement.dataset.theme = next;
    if (persist) {
      try {
        localStorage.setItem("theme", next);
      } catch {}
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "light" ? "#f3efe8" : "#0b0b0c");
    listeners.forEach((l) => l());
  }, []);

  return { theme, setTheme };
}

/**
 * Runs before paint: a saved choice wins; otherwise the site opens at night,
 * like the scene it was designed as.
 */
export const themeScript = `(function(){var d=document.documentElement,t;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='light'&&t!=='dark')t='dark';d.dataset.theme=t;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('has-motion');try{if(!sessionStorage.getItem('intro')&&!location.hash&&!/resume/.test(location.pathname))d.classList.add('intro')}catch(e){}}})()`;
