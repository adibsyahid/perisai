"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { bm, type Dictionary } from "./bm";
import { en } from "./en";

export type Locale = "ms" | "en";
export const LOCALES: Locale[] = ["ms", "en"];

const dictionaries: Record<Locale, Dictionary> = { ms: bm, en };
const STORAGE_KEY = "perisai.locale";

// The chosen language lives only on this phone (localStorage), never on a server.
// useSyncExternalStore lets every component read it without a flash of the
// wrong state after hydration; the server always renders BM, the default.
const listeners = new Set<() => void>();

function readLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" ? "en" : "ms";
  } catch {
    return "ms"; // Storage can be blocked (private mode); fall back to BM.
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function saveLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Not saved, but the switch still works for this visit.
  }
  listeners.forEach((notify) => notify());
}

type I18nValue = { locale: Locale; t: Dictionary; setLocale: (l: Locale) => void };
const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readLocale, () => "ms" as Locale);

  // Screen readers and text-to-speech use <html lang> to pick a voice.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, t: dictionaries[locale], setLocale: saveLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return value;
}
