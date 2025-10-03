import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">404</CardTitle>
          <p className="text-muted-foreground">ページが見つかりません</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            お探しのページは存在しないか、移動された可能性があります。
          </p>
          
          <div className="flex flex-col space-y-2">
            <Button asChild className="w-full">
              <Link href="/">
                ホームに戻る
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}