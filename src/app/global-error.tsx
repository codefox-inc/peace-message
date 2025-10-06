'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <div className="text-center">
              <h1 className="text-xl font-bold text-red-600 mb-4">
                アプリケーションエラー
              </h1>
              <p className="text-sm text-gray-600 mb-6">
                申し訳ありませんが、アプリケーションで重大なエラーが発生しました。
              </p>
              
              {process.env.NODE_ENV === 'development' && error.message && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-4 text-left">
                  <strong>エラー詳細:</strong> {error.message}
                </div>
              )}
              
              <div className="space-y-2">
                <button 
                  onClick={reset}
                  className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  再試行
                </button>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  ホームに戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}