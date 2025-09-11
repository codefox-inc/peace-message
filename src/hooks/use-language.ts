'use client'

import { create } from 'zustand'
import { Language, translations } from '@/lib/i18n'

interface LanguageStore {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: keyof typeof translations.en) => string
}

export const useLanguage = create<LanguageStore>((set, get) => ({
  language: 'ja',
  setLanguage: (language: Language) => set({ language }),
  t: (key: keyof typeof translations.en) => {
    const { language } = get()
    return translations[language][key]
  },
}))