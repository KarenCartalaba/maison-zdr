"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { en } from "@/locales/en";
import { fr } from "@/locales/fr";

export type Locale = "en" | "fr";

const LOCALE_KEY = "zdr-locale";

const dictionaries = { en, fr } as const;

type Dictionary = typeof en;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
  dateLocale: string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  setLocale: () => {},
  t: en,
  dateLocale: "en-US",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  // EN default; browser's stored choice (if any) loads after mount
  // so server render and first paint always match (no hydration mismatch).
  // Stored per-browser only — never affects other users.
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_KEY);
      if (stored === "en" || stored === "fr") {
        setLocaleState(stored);
      }
    } catch {
      // localStorage unavailable — stay on EN default
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_KEY, next);
    } catch {
      // ignore persistence failures
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t: dictionaries[locale],
        dateLocale: locale === "fr" ? "fr-FR" : "en-US",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
