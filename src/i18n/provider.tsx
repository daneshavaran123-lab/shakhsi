"use client";

import { createContext, useContext } from "react";

import { dirOf, num, type Locale } from "./config";
import { dictionaries, type Dictionary } from "./dictionary";

type I18n = {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: Dictionary;
  /** Locale-aware digits. */
  n: (value: string | number) => string;
};

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value: I18n = {
    locale,
    dir: dirOf(locale),
    t: dictionaries[locale],
    n: (v) => num(locale, v),
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
