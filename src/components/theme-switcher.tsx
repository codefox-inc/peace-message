'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTheme } from '@/contexts/theme-context'

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const currentTheme = themes.find(t => t.value === theme)

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">{currentTheme?.label}</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 z-50 w-80"
            >
              <Card className="shadow-lg border-2">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      デザインテーマを選択
                    </h3>
                    {themes.map((themeOption) => (
                      <motion.button
                        key={themeOption.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setTheme(themeOption.value)
                          setIsOpen(false)
                        }}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          theme === themeOption.value
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-black">
                              {themeOption.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {themeOption.description}
                            </div>
                          </div>
                          {theme === themeOption.value && (
                            <Check className="w-4 h-4 text-black" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}