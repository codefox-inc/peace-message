'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-red-600">
            エラーが発生しました
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            申し訳ありませんが、予期しないエラーが発生しました。
          </p>
          
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <strong>エラー詳細:</strong> {error.message}
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            <Button onClick={reset} className="w-full">
              再試行
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              ホームに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}