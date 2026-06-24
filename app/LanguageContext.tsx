"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { getTranslation, TranslationKey } from "@/lib/i18n";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({
  children,
  language,
  setLanguage,
}: {
  children: ReactNode;
  language: string;
  setLanguage: (lang: string) => void;
}) {
  const t = (key: TranslationKey) => getTranslation(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a dummy context if used outside provider (shouldn't happen)
    return {
      language: "th",
      setLanguage: () => {},
      t: (key: TranslationKey) => getTranslation("th", key),
    };
  }
  return context;
}
