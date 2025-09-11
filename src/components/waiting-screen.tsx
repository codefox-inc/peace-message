'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/language-switcher'
import { MessagePostDialog } from '@/components/message-post-dialog'
import { ProofGenerationDialog } from '@/components/proof-generation-dialog'
import { useLanguage } from '@/hooks/use-language'
import { PeaceMessage } from '@/types/peace-message'
import { mockMessages, generateMockMessage } from '@/lib/mock-data'

const MessageCard = ({ 
  message, 
  onVerify, 
  delay 
}: { 
  message: PeaceMessage
  onVerify: (message: PeaceMessage) => void
  delay: number 
}) => {
  const { t } = useLanguage()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: "easeOut"
      }}
    >
      <Card className="w-full hover:scale-[1.02] transition-transform duration-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>ID: {message.messageId.slice(0, 8)}...</span>
              <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            
            <div className="text-lg leading-relaxed min-h-[4rem] flex items-center justify-center text-center text-black">
              {message.text}
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{message.kioskId}</span>
              <span>{t('scheme')} {message.scheme}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onVerify(message)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t('verifyMessage')}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export function WaitingScreen() {
  const { t, language } = useLanguage()
  const [messages, setMessages] = useState<PeaceMessage[]>(mockMessages)
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<PeaceMessage | null>(null)
  const [isProofDialogOpen, setIsProofDialogOpen] = useState(false)

  // Simulate new messages arriving
  useEffect(() => {
    const interval = setInterval(() => {
      const newMessage = generateMockMessage()
      setMessages(prev => [newMessage, ...prev.slice(0, 19)]) // Keep only 20 messages
    }, 15000) // New message every 15 seconds

    return () => clearInterval(interval)
  }, [])

  const handleVerifyMessage = (message: PeaceMessage) => {
    setSelectedMessage(message)
    setIsProofDialogOpen(true)
  }

  const handleNewMessage = (message: PeaceMessage) => {
    setMessages(prev => [message, ...prev.slice(0, 19)])
  }

  const getFontClass = () => {
    switch (language) {
      case 'ja': return 'font-ja'
      case 'zh': return 'font-zh'
      case 'ko': return 'font-ko'
      case 'fr': return 'font-fr'
      case 'de': return 'font-de'
      default: return 'font-en'
    }
  }

  return (
    <div className={`min-h-screen flex flex-col bg-white ${getFontClass()}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <motion.h1 
                className="text-3xl font-bold text-black"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {t('title')}
              </motion.h1>
              <motion.p 
                className="text-gray-600"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {t('subtitle')}
              </motion.p>
            </div>
            
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <Button 
                variant="default" 
                size="lg" 
                onClick={() => setIsPostDialogOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('postMessage')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Stats */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="inline-flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-6 py-3 shadow-sm">
              <Sparkles className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-black">
                {messages.length} {t('messageCount')}
              </span>
            </div>
          </motion.div>

          {/* Message Feed */}
          <div className="relative">
            {messages.length === 0 ? (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-6xl mb-4 peace-float">🕊️</div>
                <p className="text-xl text-gray-600">{t('noMessages')}</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {messages.map((message, index) => (
                    <MessageCard 
                      key={message.messageId}
                      message={message} 
                      onVerify={handleVerifyMessage}
                      delay={index * 0.1}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <MessagePostDialog 
        open={isPostDialogOpen}
        onOpenChange={setIsPostDialogOpen}
        onMessagePosted={handleNewMessage}
      />
      
      <ProofGenerationDialog
        open={isProofDialogOpen}
        onOpenChange={setIsProofDialogOpen}
        message={selectedMessage}
      />
    </div>
  )
}