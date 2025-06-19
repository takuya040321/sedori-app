'use client'

import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTimeAgo } from '@/lib/utils'

const activities = [
  {
    id: '1',
    type: 'scraping' as const,
    shop: 'VT Cosmetics',
    message: '商品情報を更新しました (10件)',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'success' as const
  },
  {
    id: '2',
    type: 'price_change' as const,
    shop: 'DHC',
    message: '価格変動を検出しました (3件)',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'warning' as const
  },
  {
    id: '3',
    type: 'new_product' as const,
    shop: 'VT Cosmetics',
    message: '新商品を追加しました (2件)',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    status: 'success' as const
  },
  {
    id: '4',
    type: 'scraping' as const,
    shop: 'DHC',
    message: 'スクレイピングエラーが発生しました',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'error' as const
  }
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'scraping':
      return <Clock className="w-4 h-4" />
    case 'price_change':
      return <TrendingUp className="w-4 h-4" />
    case 'new_product':
      return <CheckCircle className="w-4 h-4" />
    default:
      return <AlertCircle className="w-4 h-4" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'success':
      return <Badge variant="success">成功</Badge>
    case 'warning':
      return <Badge variant="warning">警告</Badge>
    case 'error':
      return <Badge variant="destructive">エラー</Badge>
    default:
      return <Badge>不明</Badge>
  }
}

export function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <Card className="glass-card border-white/20">
        <CardHeader>
          <CardTitle className="text-gradient">最新アクティビティ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className={`p-2 rounded-lg ${
                  activity.status === 'success' ? 'bg-green-500/20 text-green-400' :
                  activity.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{activity.shop}</span>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-sm text-gray-400 truncate">{activity.message}</p>
                </div>
                
                <div className="text-xs text-gray-500">
                  {getTimeAgo(activity.timestamp)}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}