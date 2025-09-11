'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/hooks/use-language'
import { PeaceMessage } from '@/types/peace-message'

type MessageForm = {
  message: string
  passphrase: string
}

interface MessagePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMessagePosted: (message: PeaceMessage) => void
}

export function MessagePostDialog({
  open,
  onOpenChange,
  onMessagePosted,
}: MessagePostDialogProps) {
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Create schema dynamically with translated messages
  const messageSchema = z.object({
    message: z
      .string()
      .min(1, t('messageInput'))
      .max(280, t('messageMaxLength'))
      .refine((val) => val.trim().length > 0, t('messageInput')),
    passphrase: z
      .string()
      .min(8, t('passphraseMinLength'))
      .max(100, t('passphraseMaxLength'))
      .refine((val) => !/[\r\n\t]/.test(val), t('noLineBreaks')),
  })
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: '',
      passphrase: '',
    },
  })

  const messageValue = watch('message')
  const characterCount = messageValue?.length || 0

  const onSubmit = async (data: MessageForm) => {
    setIsSubmitting(true)
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create new message with mock data
      const newMessage: PeaceMessage = {
        messageId: `0x${Date.now().toString(16).padStart(64, '0')}`,
        text: data.message.trim(),
        h: `0x${Buffer.from(`${data.message}-${data.passphrase}`).toString('hex').padStart(64, '0')}`,
        kioskId: 'KIOSK_USER',
        timestamp: Date.now(),
        scheme: 1,
      }
      
      onMessagePosted(newMessage)
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error('Failed to post message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-black">
            {t('postMessage')}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t('subtitle')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">
              {t('messageInput')}
            </label>
            <div className="relative">
              <Textarea
                {...register('message')}
                placeholder={t('messageInput')}
                className="min-h-[120px] resize-none"
                disabled={isSubmitting}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {characterCount}/280
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {t('messageHelp')}
            </p>
            {errors.message && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500"
              >
                {errors.message.message}
              </motion.p>
            )}
          </div>

          {/* Passphrase Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">
              {t('passphraseInput')}
            </label>
            <Input
              {...register('passphrase')}
              type="password"
              placeholder={t('passphraseInput')}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              {t('passphraseHelpPost')}
            </p>
            {errors.passphrase && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500"
              >
                {errors.passphrase.message}
              </motion.p>
            )}
          </div>

          <DialogFooter className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              variant="default" 
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('submit')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}