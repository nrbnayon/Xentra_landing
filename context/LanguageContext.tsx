"use client";

/**
 * LanguageContext.tsx (Next.js version)
 */

import { translationService } from "../services/translationService";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

const LANG_STORAGE_KEY = "xentra_language";
const DEFAULT_LANGUAGE = "en";

const isDev = process.env.NODE_ENV === "development";
const LOG = "[LanguageContext]";

function log(msg: string, data?: unknown) {
  if (isDev) {
    data !== undefined
      ? console.log(`${LOG} ${msg}`, data)
      : console.log(`${LOG} ${msg}`);
  }
}

// ─── Supported Languages ─────────────────────────────────────────────────────

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "th", name: "Thai", nativeName: "ภาษาไทย" },
  { code: "ht", name: "Haitian Kreyòl", nativeName: "Kreyòl ayisyen" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "es", name: "Spanish", nativeName: "Español" },
];

export interface LanguageContextValue {
  language: string;
  isReady: boolean;
  isChanging: boolean;
  currentLanguage: Language;
  supportedLanguages: Language[];
  translate: (text: string) => string;
  translateAsync: (text: string) => Promise<string>;
  translateBatch: (texts: string[]) => Promise<string[]>;
  changeLanguage: (code: string) => Promise<void>;
  tick: number;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [isReady, setIsReady] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [tick, setTick] = useState(0);

  const rerender = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    (async () => {
      if (typeof window === "undefined") return;
      log("Initialising…");

      await translationService.hydrate();

      try {
        const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
        if (saved && saved !== DEFAULT_LANGUAGE) {
          log(`Restoring saved language: ${saved}`);
          setLanguage(saved);
        }
      } catch (e) {
        log("Could not read saved language:", e);
      }

      setIsReady(true);
      log("Ready ✅");
    })();
  }, []);

  const translate = useCallback(
    (text: string): string => {
      if (!text?.trim() || language === "en") return text;

      const cached = translationService.getCached(text, language);
      if (cached !== undefined) return cached;

      translationService
        .translate(text, language)
        .then(() => rerender())
        .catch(() => {});

      return text;
    },
    [language, rerender],
  );

  const translateAsync = useCallback(
    (text: string): Promise<string> => {
      if (!text?.trim() || language === "en") return Promise.resolve(text);
      return translationService.translate(text, language);
    },
    [language],
  );

  const translateBatch = useCallback(
    (texts: string[]): Promise<string[]> => {
      if (language === "en") return Promise.resolve(texts);
      return translationService.translateBatch(texts, language);
    },
    [language],
  );

  const changeLanguage = useCallback(
    async (code: string): Promise<void> => {
      if (code === language) return;
      if (typeof window === "undefined") return;

      log(`Changing language: ${language} → ${code}`);
      setIsChanging(true);

      try {
        // Keep cache between language switches for better performance
        window.localStorage.setItem(LANG_STORAGE_KEY, code);
        setLanguage(code);

        if (code !== "en") {
          const common = [
            "Welcome to",
            "Experience Sports Like Never Before",
            "Predict Now",
            "Learn More",
            "About Us",
            "Contact",
            "Home",
            "Users",
            "Experience",
            "Matches",
          ];
          translationService
            .translateBatch(common, code)
            .then(() => {
              log(`Pre-warm complete for [${code}]`);
              rerender();
            })
            .catch(() => {});
        }

        log(`Language changed to: ${code} ✅`);
      } catch (e) {
        log("changeLanguage error:", e);
      } finally {
        setIsChanging(false);
      }
    },
    [language, rerender],
  );

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) ??
    SUPPORTED_LANGUAGES[0];

  const value: LanguageContextValue = {
    language,
    isReady,
    isChanging,
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    translate,
    translateAsync,
    translateBatch,
    changeLanguage,
    tick,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}
