'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Download, Share2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface QRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
  messageId?: string
}

export function QRDialog({ open, onOpenChange, onComplete, messageId }: QRDialogProps) {
  const [qrGenerated, setQrGenerated] = useState(false)

  useEffect(() => {
    if (open) {
      // Simulate QR code generation
      const timer = setTimeout(() => {
        setQrGenerated(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
    setQrGenerated(false)
  }, [open])

  const handleClose = () => {
    setQrGenerated(false)
    onOpenChange(false)
    onComplete()
  }

  const handleDownload = () => {
    // Simulate QR code download
    console.log('QRコードをダウンロード中...')
  }

  const handleShare = () => {
    // Simulate sharing functionality
    console.log('QRコードを共有中...')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">認証QRコード</DialogTitle>
        <Card className="border-none shadow-none">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">認証QRコード</CardTitle>
            <p className="text-sm text-muted-foreground">
              メッセージの証明用QRコードが生成されました
            </p>
          </CardHeader>

          <CardContent className="pt-0">
            {!qrGenerated ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">QRコード生成中...</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* QR Code placeholder */}
                <div className="bg-muted/50 rounded-lg p-6 text-center">
                  <div className="w-32 h-32 mx-auto bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
                    <div className="grid grid-cols-8 gap-1">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 ${
                            Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ID: {messageId?.slice(0, 8)}...
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    共有
                  </Button>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-green-800">
                        認証完了
                      </p>
                      <p className="text-xs text-green-600">
                        メッセージが正常に投稿され、認証QRコードが生成されました
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleClose} className="w-full">
                  完了
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}