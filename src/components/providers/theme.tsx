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

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "light" ? "#f3efe8" : "#0b0b0c");
    listeners.forEach((l) => l());
  }, []);

  return { theme, setTheme };
}

export const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('has-motion')})()`;
