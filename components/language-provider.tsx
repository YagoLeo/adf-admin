"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { translations, type TranslationKey } from "@/lib/translations"
import type { TranslationFunction } from "@/types/language"

type Language = "zh" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: TranslationFunction
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh")

  const t: TranslationFunction = (key: TranslationKey) => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

