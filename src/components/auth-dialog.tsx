'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthComplete: () => void
}

export function AuthDialog({ open, onOpenChange, onAuthComplete }: AuthDialogProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authStep, setAuthStep] = useState<'initial' | 'processing' | 'completed'>('initial')

  const handleStartAuth = async () => {
    setIsAuthenticating(true)
    setAuthStep('processing')
    
    // Simulate authentication process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setAuthStep('completed')
    
    // Wait a moment to show success state
    setTimeout(() => {
      setIsAuthenticating(false)
      setAuthStep('initial')
      onAuthComplete()
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">メッセージ認証</DialogTitle>
        <Card className="border-none shadow-none">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">メッセージ認証</CardTitle>
            <p className="text-sm text-muted-foreground">
              ゼロ知識証明を使用してメッセージを認証します
            </p>
          </CardHeader>

          <CardContent className="pt-0">
            {authStep === 'initial' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">認証プロセス</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• プライバシーを保護した認証</li>
                    <li>• 個人情報の開示なし</li>
                    <li>• 偽装防止機能</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleStartAuth}
                  className="w-full"
                  disabled={isAuthenticating}
                >
                  認証を開始
                </Button>
              </motion.div>
            )}

            {authStep === 'processing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">認証処理中...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ゼロ知識証明を生成しています
                </p>
              </motion.div>
            )}

            {authStep === 'completed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <p className="font-medium text-green-700">認証完了！</p>
                <p className="text-xs text-muted-foreground mt-1">
                  QRコードを生成しています...
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}