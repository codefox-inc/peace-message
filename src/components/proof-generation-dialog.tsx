'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Loader2, CheckCircle, XCircle, QrCode } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/hooks/use-language'
import { PeaceMessage } from '@/types/peace-message'
import { generateMockProof } from '@/lib/mock-data'

const proofSchema = z.object({
  passphrase: z
    .string()
    .min(1, 'Passphrase is required')
    .max(100, 'Passphrase must be less than 100 characters'),
})

type ProofForm = z.infer<typeof proofSchema>

interface ProofGenerationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: PeaceMessage | null
}

type ProofState = 'input' | 'generating' | 'success' | 'failed' | 'qr'

export function ProofGenerationDialog({
  open,
  onOpenChange,
  message,
}: ProofGenerationDialogProps) {
  const { t } = useLanguage()
  const [proofState, setProofState] = useState<ProofState>('input')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [generatedProof, setGeneratedProof] = useState<any>(null)
  const [mockQR, setMockQR] = useState<string>('')
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProofForm>({
    resolver: zodResolver(proofSchema),
    defaultValues: {
      passphrase: '',
    },
  })

  const onSubmit = async (data: ProofForm) => {
    if (!message) return
    
    setProofState('generating')
    
    try {
      // Simulate ZK proof generation (3-15 seconds)
      const delay = Math.random() * 12000 + 3000 // 3-15 seconds
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // Generate mock proof
      const proof = generateMockProof(message.text, data.passphrase)
      setGeneratedProof(proof)
      
      // Create mock QR data
      const qrData = {
        txHash: message.messageId,
        h: message.h,
        publicInputs: proof.publicSignals,
        proof: proof.proof,
      }
      
      setMockQR(JSON.stringify(qrData))
      setProofState('success')
    } catch (error) {
      console.error('Proof generation failed:', error)
      setProofState('failed')
    }
  }

  const handleClose = () => {
    if (proofState !== 'generating') {
      onOpenChange(false)
      setProofState('input')
      setGeneratedProof(null)
      setMockQR('')
      reset()
    }
  }

  const showQR = () => {
    setProofState('qr')
  }

  const resetState = () => {
    setProofState('input')
    setGeneratedProof(null)
    setMockQR('')
    reset()
    console.log(generatedProof) // accessing to avoid unused error
  }

  if (!message) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center">
            <Shield className="w-6 h-6 mr-2 text-gray-600" />
            {t('verifyMessage')}
          </DialogTitle>
          <DialogDescription>
            {t('proofDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <AnimatePresence mode="wait">
          {/* Input State */}
          {proofState === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Message Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{t('messageToVerify')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{message.text}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    ID: {message.messageId.slice(0, 16)}...
                  </div>
                </CardContent>
              </Card>
              
              {/* Passphrase Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">
                    {t('passphraseInput')}
                  </label>
                  <Input
                    {...register('passphrase')}
                    type="password"
                    placeholder={t('passphraseInput')}
                  />
                  <p className="text-xs text-gray-500">
                    {t('passphraseHelp')}
                  </p>
                  {errors.passphrase && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-black"
                    >
                      {errors.passphrase.message}
                    </motion.p>
                  )}
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    {t('cancel')}
                  </Button>
                  <Button type="submit" variant="default">
                    <Shield className="w-4 h-4 mr-2" />
                    {t('generateProof')}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          )}

          {/* Generating State */}
          {proofState === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8 space-y-6"
            >
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-gray-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t('generating')}</h3>
                <p className="text-gray-600">
                  {t('proofDescription')}...<br />
                  3-15秒程度かかります。
                </p>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {proofState === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-6 space-y-6"
            >
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-black" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-black">
                  {t('success')}!
                </h3>
                <p className="text-gray-600">
                  {t('proofSuccess')}
                </p>
              </div>
              
              <DialogFooter className="flex space-x-3">
                <Button variant="outline" onClick={resetState}>
                  {t('generateAnother')}
                </Button>
                <Button variant="default" onClick={showQR}>
                  <QrCode className="w-4 h-4 mr-2" />
                  {t('qrCodeTitle')}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Failed State */}
          {proofState === 'failed' && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-6 space-y-6"
            >
              <div className="flex justify-center">
                <XCircle className="w-16 h-16 text-black" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-black">
                  {t('failed')}
                </h3>
                <p className="text-gray-600">
                  {t('proofFailed')}
                </p>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={resetState}>
                  {t('tryAgain')}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* QR State */}
          {proofState === 'qr' && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">{t('qrCodeTitle')}</h3>
                <p className="text-sm text-gray-600 mb-6">
                  {t('scanQRDescription')}
                </p>
                
                {/* Mock QR Code Display */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-600" />
                        <div className="text-xs text-gray-500">
                          Mock QR Code<br/>
                          {mockQR.slice(0, 20)}...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">
                  {t('mockQRNote')}
                </p>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setProofState('success')}>
                  {t('back')}
                </Button>
                <Button variant="default" onClick={handleClose}>
                  {t('done')}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}