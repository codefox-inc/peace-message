'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'classic' | 'balloon'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  themes: { value: Theme; label: string; description: string }[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const themes = [
  { 
    value: 'classic' as Theme, 
    label: 'クラシック', 
    description: 'シンプルなモノクロームデザイン' 
  },
  { 
    value: 'balloon' as Theme, 
    label: 'バルーン', 
    description: 'ふわふわバルーンスタイル' 
  }
]

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('classic')

  useEffect(() => {
    const saved = localStorage.getItem('peace-message-theme') as Theme
    if (saved && themes.some(t => t.value === saved)) {
      setTheme(saved)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('peace-message-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}