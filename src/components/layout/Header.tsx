'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header({ title }: { title: string }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-b border-white/10 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gradient">{title}</h1>
          <p className="text-sm text-gray-400 mt-1">
            リアルタイム商品情報管理
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Real-time Clock */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 glass-card px-4 py-2 rounded-lg"
          >
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-mono text-gray-300">
              {formatTime(currentTime)}
            </span>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}