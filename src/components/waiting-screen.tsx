'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

// Type for global balloon refs
declare global {
  interface Window {
    balloonRefs?: Map<string, {
      element: HTMLElement
      onOutOfBounds: () => void
    }>
  }
}
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { MessagePostDialog } from '@/components/message-post-dialog'
import { ProofGenerationDialog } from '@/components/proof-generation-dialog'
import { AuthDialog } from '@/components/auth-dialog'
import { QRDialog } from '@/components/qr-dialog'
import { useLanguage } from '@/hooks/use-language'
import { useTheme } from '@/contexts/theme-context'
import { PeaceMessage } from '@/types/peace-message'
import { mockMessages, generateMockMessage } from '@/lib/mock-data'

// Calculate balloon size based on text length for balloon theme
const getBalloonSize = (text: string, totalMessagesCount: number = 8) => {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  
  const length = text.length
  
  // 画面サイズに応じて動的にサイズを調整
  const scaleFactor = Math.min(1, viewportWidth / 1200)
  const densityFactor = Math.min(1, Math.sqrt(8 / totalMessagesCount))
  const combinedFactor = scaleFactor * densityFactor
  
  let baseSize, baseFontSize
  if (length <= 5) {
    baseSize = 140
    baseFontSize = 40  // 32 -> 40（短文をさらに強調）
  } else if (length <= 10) {
    baseSize = 170
    baseFontSize = 34  // 28 -> 34（短文をさらに強調）
  } else if (length <= 20) {
    baseSize = 210
    baseFontSize = 24  // 20 -> 24（中文も大きく）
  } else if (length <= 35) {
    baseSize = 260
    baseFontSize = 22  // 19 -> 22（中文も大きく）
  } else if (length <= 55) {
    baseSize = 320
    baseFontSize = 20  // 18 -> 20（全体的に大きく）
  } else if (length <= 80) {
    baseSize = 380
    baseFontSize = 19  // 17 -> 19（全体的に大きく）
  } else {
    baseSize = 420
    baseFontSize = 18  // 16 -> 18（全体的に大きく）
  }
  
  const adjustedSize = Math.max(120, baseSize * combinedFactor)
  const adjustedFontSize = Math.max(14, baseFontSize * combinedFactor)  // 最小フォントサイズを12->14に
  
  return { 
    width: `${adjustedSize}px`, 
    height: `${adjustedSize}px`, 
    fontSize: `${adjustedFontSize}px`,
    numericSize: adjustedSize // 配置計算用の数値
  }
}

const MessageCard = ({
  message,
  onVerify,
  isBalloonTheme = false,
  balloonColorIndex,
  onOutOfBounds,
  onBalloonClick,
  totalMessages = 8
}: {
  message: PeaceMessage
  onVerify: (message: PeaceMessage) => void
  isBalloonTheme?: boolean
  balloonColorIndex?: number
  onOutOfBounds?: (messageId: string) => void
  onBalloonClick?: (messageId: string) => void
  totalMessages?: number
}) => {
  const { t } = useLanguage()
  const balloonRef = useRef<HTMLDivElement>(null)
  
  // Store ref for viewport checking
  useEffect(() => {
    if (!isBalloonTheme || !balloonRef.current || !onOutOfBounds) return
    
    // Store the ref in a global array for batch checking
    if (typeof window !== 'undefined') {
      if (!window.balloonRefs) window.balloonRefs = new Map()
      window.balloonRefs.set(message.messageId, {
        element: balloonRef.current,
        onOutOfBounds: () => onOutOfBounds(message.messageId)
      })
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.balloonRefs) {
        window.balloonRefs.delete(message.messageId)
      }
    }
  }, [isBalloonTheme, message.messageId, onOutOfBounds])
  

  const balloonStyle = isBalloonTheme ? getBalloonSize(message.text, totalMessages) : {
    width: '0px',
    height: '0px', 
    fontSize: '14px',
    numericSize: 0
  }
  
  return (
    <motion.div
      ref={balloonRef}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ 
        duration: 0.3, 
        delay: 0,
        ease: "easeOut"
      }}
    >
      <Card 
        className={`w-full hover:scale-[1.02] transition-transform duration-200 message-card ${
          isBalloonTheme && typeof balloonColorIndex === 'number' ? `balloon-color-${balloonColorIndex}` : ''
        } ${isBalloonTheme ? 'cursor-pointer' : ''}`}
        style={isBalloonTheme ? balloonStyle : {}}
        onClick={isBalloonTheme && onBalloonClick ? () => onBalloonClick(message.messageId) : undefined}
      >
        <CardContent className={isBalloonTheme ? "p-0 h-full" : "pt-6"}>
          {isBalloonTheme ? (
            <div 
              className="h-full flex items-center justify-center"
              style={{ 
                fontSize: balloonStyle.fontSize,
                padding: `${Math.max(1, parseInt(balloonStyle.width) * 0.01)}px`  // パディングをほぼゼロに: 0.02->0.01, 2->1
              }}
            >
              <div className="text-center leading-tight font-medium">
                {message.text}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>ID: {message.messageId.slice(0, 8)}...</span>
                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
              </div>
              
              <div className="text-lg leading-relaxed min-h-[4rem] flex items-center justify-center text-center text-foreground">
                {message.text}
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{message.kioskId}</span>
                <span>{t('scheme')} {message.scheme}</span>
              </div>
            </div>
          )}
        </CardContent>
        {!isBalloonTheme && (
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
        )}
      </Card>
    </motion.div>
  )
}

export function WaitingScreen() {
  const { t, language } = useLanguage()
  const { theme } = useTheme()
  const [messages, setMessages] = useState<PeaceMessage[]>(mockMessages)
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<PeaceMessage | null>(null)
  const [isProofDialogOpen, setIsProofDialogOpen] = useState(false)
  
  // New balloon theme flow states
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const [pendingMessage, setPendingMessage] = useState<PeaceMessage | null>(null)
  
  // Balloon animation states
  const [hiddenBalloons, setHiddenBalloons] = useState<Set<string>>(new Set())
  const [returningBalloons, setReturningBalloons] = useState<Set<string>>(new Set())
  const [balloonPositions, setBalloonPositions] = useState<Map<string, {top: number, left: number}>>(new Map())
  const [hoveredBalloon, setHoveredBalloon] = useState<string | null>(null)
  

  // Simulate new messages arriving
  useEffect(() => {
    const interval = setInterval(() => {
      const newMessage = generateMockMessage()
      setMessages(prev => [newMessage, ...prev.slice(0, 19)]) // Keep only 20 messages
    }, 15000) // New message every 15 seconds

    return () => clearInterval(interval)
  }, [])

  // Centralized viewport checking for balloon theme
  useEffect(() => {
    if (theme !== 'balloon') return

    const checkAllBalloons = () => {
      if (typeof window === 'undefined' || !window.balloonRefs) return

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      window.balloonRefs.forEach((balloonData, messageId) => {
        if (!balloonData.element) return

        const rect = balloonData.element.getBoundingClientRect()
        
        // Check if balloon is completely out of viewport
        const isOutOfBounds = (
          rect.right < 0 || 
          rect.left > viewportWidth || 
          rect.bottom < 0 || 
          rect.top > viewportHeight
        )

        if (isOutOfBounds && !hiddenBalloons.has(messageId)) {
          balloonData.onOutOfBounds()
        }
      })
    }

    const interval = setInterval(checkAllBalloons, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [theme, hiddenBalloons])

  const handleVerifyMessage = (message: PeaceMessage) => {
    setSelectedMessage(message)
    setIsProofDialogOpen(true)
  }

  // Handle balloon touch/click (removed centering animation)
  const handleBalloonClick = (messageId: string) => {
    if (theme === 'balloon') {
      console.log(`Balloon clicked: ${messageId}`)
      // クリックイベントは残すが、中央移動アニメーションは削除
    }
  }

  const handleNewMessage = (message: PeaceMessage) => {
    if (theme === 'balloon') {
      // For balloon theme, start the new flow
      setPendingMessage(message)
      setIsPostDialogOpen(false)
      setIsAuthDialogOpen(true)
    } else {
      // For other themes, use the original flow
      setMessages(prev => [message, ...prev.slice(0, 19)])
    }
  }

  const handleAuthComplete = () => {
    setIsAuthDialogOpen(false)
    setIsQRDialogOpen(true)
  }

  const handleQRComplete = () => {
    if (pendingMessage) {
      setMessages(prev => [pendingMessage, ...prev.slice(0, 19)])
      setPendingMessage(null)
    }
    setIsQRDialogOpen(false)
  }

  // Get numeric balloon size for layout calculations
  const getBalloonSizeNumeric = (text: string, messageCount: number = 8) => {
    try {
      const sizeData = getBalloonSize(text, messageCount)
      return sizeData.numericSize || 140
    } catch (error) {
      console.error('Error calculating balloon size:', error)
      return 140
    }
  }

  const adjustBalloonPositions = useCallback((messages: PeaceMessage[]) => {
    // 100%表示基準での実際のviewportサイズを使用
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
    
    console.log(`=== GRID LAYOUT DEBUG ===`)
    console.log(`Viewport size: ${viewportWidth}x${viewportHeight}`)
    
    // クロス格子状の均等配置を計算
    const newPositions = new Map<string, {top: number, left: number}>()
    
    // 最大バルーンサイズを動的に計算
    const maxBalloonSize = Math.max(...messages.map(m => getBalloonSizeNumeric(m.text, messages.length)))
    
    // 風船間隔を広げるための設定 - 左側・中央やや下に配置
    const leftMargin = 10   // 左側マージンをさらに削減
    const rightMargin = 200 // 右マージンを増やして左側エリアに集中
    const topMargin = 120   // 上部マージンを少し削減して上に移動
    const bottomMargin = 80 // 下部マージンを少し増やしてバランス調整
    const availableWidth = Math.max(viewportWidth - leftMargin - rightMargin, 200)
    const availableHeight = Math.max(viewportHeight - topMargin - bottomMargin, 200)
    
    // グリッドの列数と行数を計算（重なりを防ぐため間隔を十分に確保）
    const aspectRatio = availableWidth / availableHeight
    // 風船の重なりを防ぐため、より少ない列数を使用
    const baseCols = Math.ceil(Math.sqrt(messages.length * aspectRatio))
    const cols = Math.max(1, Math.min(baseCols, Math.max(1, Math.ceil(messages.length / 3)))) // 列数をさらに制限
    const rows = Math.ceil(messages.length / cols)
    
    console.log(`=== LEFT-UP POSITIONING DEBUG ===`)
    console.log(`Viewport: ${viewportWidth}x${viewportHeight}`)
    console.log(`Margins: left=${leftMargin}, right=${rightMargin}, top=${topMargin}, bottom=${bottomMargin}`)
    console.log(`Available area: ${availableWidth}x${availableHeight}`)
    console.log(`Grid: ${cols}x${rows} for ${messages.length} balloons`)
    console.log(`Max balloon size: ${maxBalloonSize}`)
    
    // セルのサイズを計算
    const cellWidth = availableWidth / cols
    const cellHeight = availableHeight / rows
    
    console.log(`Cell size: ${cellWidth}x${cellHeight}`)
    
    messages.forEach((message, index) => {
      // グリッド位置を計算
      const col = index % cols
      const row = Math.floor(index / cols)
      
      // セルの中央に配置（オフセットを削減して重なりを防ぐ）
      const maxOffsetX = Math.min(cellWidth * 0.1, 10) // オフセット範囲をさらに縮小
      const maxOffsetY = Math.min(cellHeight * 0.1, 10)
      const randomOffsetX = (Math.random() - 0.5) * maxOffsetX
      const randomOffsetY = (Math.random() - 0.5) * maxOffsetY
      
      const centerX = leftMargin + col * cellWidth + cellWidth / 2 + randomOffsetX
      const centerY = topMargin + row * cellHeight + cellHeight / 2 + randomOffsetY
      
      // シンプルな境界チェック（transform: translate(-50%, -50%)があるため、中心座標基準）
      const minX = leftMargin
      const maxX = viewportWidth - rightMargin
      const minY = topMargin
      const maxY = viewportHeight - bottomMargin
      
      // より安全な境界チェック
      const finalX = Math.max(minX, Math.min(maxX, centerX))
      const finalY = Math.max(minY, Math.min(maxY, centerY))
      
      // transform: translate(-50%, -50%)を考慮したパーセンテージ変換
      // バルーンの中心が指定位置になるように座標を設定
      const leftPercent = (finalX / viewportWidth) * 100
      const topPercent = (finalY / viewportHeight) * 100
      
      newPositions.set(message.messageId, {
        top: topPercent,
        left: leftPercent
      })
      
      console.log(`Balloon ${index}: Grid(${col},${row}) 
        -> center:(${centerX.toFixed(0)},${centerY.toFixed(0)}) 
        -> final:(${finalX.toFixed(0)},${finalY.toFixed(0)}) 
        -> CSS: left:${leftPercent.toFixed(1)}%, top:${topPercent.toFixed(1)}%
        -> bounds: X[${minX}-${maxX}], Y[${minY}-${maxY}]`)
    })
    
    setBalloonPositions(newPositions)
  }, [])

  // Track previous message count to detect new messages
  const [previousMessageCount, setPreviousMessageCount] = useState(0)

  // Initialize positions on theme change
  useEffect(() => {
    if (theme === 'balloon' && messages.length > 0) {
      console.log(`Theme changed to balloon - initializing positions for ${messages.length} balloons`)
      // 強制的に位置をクリアしてから再計算
      setBalloonPositions(new Map())
      setTimeout(() => {
        adjustBalloonPositions(messages)
      }, 100)
      setPreviousMessageCount(messages.length)
    }
  }, [theme, messages.length, adjustBalloonPositions, messages])

  // Adjust positions when messages change
  useEffect(() => {
    if (theme === 'balloon' && messages.length > 0 && previousMessageCount > 0) {
      console.log(`Messages changed: ${previousMessageCount} -> ${messages.length}`)
      
      const isNewMessageAdded = messages.length > previousMessageCount
      
      if (isNewMessageAdded) {
        console.log('New message added - recalculating all positions for grid layout')
        adjustBalloonPositions(messages) // 全て再配置して均等にする
      }
      
      setPreviousMessageCount(messages.length)
    }
  }, [messages.length, theme, previousMessageCount, adjustBalloonPositions, messages])

  // Re-adjust on window resize
  useEffect(() => {
    if (theme !== 'balloon') return

    const handleResize = () => {
      if (messages.length > 0) {
        adjustBalloonPositions(messages)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [theme, messages.length, adjustBalloonPositions, messages])

  // Handle balloon going out of bounds
  const handleBalloonOutOfBounds = (messageId: string) => {
    if (hiddenBalloons.has(messageId)) return
    
    setHiddenBalloons(prev => new Set(prev).add(messageId))
    
    // Schedule return after 5-10 seconds
    const returnDelay = 5000 + Math.random() * 5000
    setTimeout(() => {
      setReturningBalloons(prev => new Set(prev).add(messageId))
      setHiddenBalloons(prev => {
        const newSet = new Set(prev)
        newSet.delete(messageId)
        return newSet
      })
      
      // Reset returning state after animation
      setTimeout(() => {
        setReturningBalloons(prev => {
          const newSet = new Set(prev)
          newSet.delete(messageId)
          return newSet
        })
      }, 1000)
    }, returnDelay)
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
    <div className={`min-h-screen flex flex-col bg-background ${getFontClass()}`}>
      {/* Header */}
      <header className={`sticky top-0 ${theme === 'balloon' ? 'z-[100]' : 'z-50'} bg-background/95 backdrop-blur-sm border-b border-border`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <motion.h1 
                className="text-3xl font-bold text-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {t('title')}
              </motion.h1>
              <motion.p 
                className="text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {t('subtitle')}
              </motion.p>
            </div>
            
            {/* Message count in center */}
            <div className="flex items-center space-x-2 bg-card border border-border rounded-full px-6 py-3 shadow-sm">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {messages.length} {t('messageCount')}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <ThemeSwitcher />
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
                <p className="text-xl text-muted-foreground">{t('noMessages')}</p>
              </motion.div>
            ) : theme === 'balloon' ? (
              <div className="balloon-container">
                <AnimatePresence mode="popLayout">
                  {messages.map((message, index) => {
                    // Generate a consistent random color based on message ID
                    const colorIndex = message.messageId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 9;
                    
                    const isHidden = hiddenBalloons.has(message.messageId)
                    const isReturning = returningBalloons.has(message.messageId)
                    const position = balloonPositions.get(message.messageId)
                    const isHovered = hoveredBalloon === message.messageId
                    
                    // Debug position for each balloon
                    if (index === 0) {
                      console.log(`=== Balloon Rendering Debug ===`)
                      console.log(`First balloon position:`, position)
                      console.log(`Total positions in map:`, balloonPositions.size)
                      console.log(`Theme:`, theme)
                      console.log(`Messages length:`, messages.length)
                      console.log(`All positions:`, Array.from(balloonPositions.entries()))
                    }
                    
                    
                    return (
                      <motion.div 
                        key={message.messageId}
                        className="balloon-item balloon-item-dynamic"
                        style={{
                          '--initial-rotation': `${(index % 8 - 4) * 0.5}deg`,
                          position: 'absolute',
                          left: position ? `${position.left}%` : '50%',
                          top: position ? `${position.top}%` : '50%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: isHovered ? 1000 : 1, // ホバー時は最前面
                          cursor: 'pointer',
                        } as React.CSSProperties}
                        onMouseEnter={() => setHoveredBalloon(message.messageId)}
                        onMouseLeave={() => setHoveredBalloon(null)}
                        initial={{
                          opacity: 1,
                        }}
                        animate={{
                          opacity: isHidden ? 0 : 1,
                          scale: isReturning ? [0.5, 1.2, 1] : (isHovered ? 1.1 : 1),
                        }}
                        transition={{
                          opacity: { duration: 0.3, delay: 0 },
                          scale: { 
                            duration: isReturning ? 1 : (isHovered ? 0.2 : 0.2), 
                            times: isReturning ? [0, 0.6, 1] : undefined,
                            ease: "easeInOut",
                            delay: 0
                          },
                        }}
                      >
                        <MessageCard 
                          message={message} 
                          onVerify={handleVerifyMessage}
                          delay={0}
                          isBalloonTheme={true}
                          balloonColorIndex={colorIndex}
                          onOutOfBounds={handleBalloonOutOfBounds}
                          onBalloonClick={handleBalloonClick}
                          totalMessages={messages.length}
                        />
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {messages.map((message, index) => (
                    <MessageCard 
                      key={message.messageId}
                      message={message} 
                      onVerify={handleVerifyMessage}
                      delay={index * 0.1}
                      totalMessages={messages.length}
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

      {/* Balloon theme specific dialogs */}
      <AuthDialog
        open={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        onAuthComplete={handleAuthComplete}
      />

      <QRDialog
        open={isQRDialogOpen}
        onOpenChange={setIsQRDialogOpen}
        onComplete={handleQRComplete}
        messageId={pendingMessage?.messageId}
      />
    </div>
  )
}