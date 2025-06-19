'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'

interface ScrapingButtonProps {
  shopName: string
  onScrape: () => Promise<{ success: boolean; message: string; updatedCount?: number }>
}

type ScrapingState = 'idle' | 'loading' | 'success' | 'error'

export function ScrapingButton({ shopName, onScrape }: ScrapingButtonProps) {
  const [state, setState] = useState<ScrapingState>('idle')
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)

  const handleScrape = async () => {
    setState('loading')
    setProgress(0)
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 200)

    try {
      const result = await onScrape()
      clearInterval(progressInterval)
      setProgress(100)
      
      if (result.success) {
        setState('success')
        setMessage(result.message)
        
        // Trigger confetti animation
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        
        // Reset after 3 seconds
        setTimeout(() => {
          setState('idle')
          setMessage('')
          setProgress(0)
        }, 3000)
      } else {
        setState('error')
        setMessage(result.message)
        
        // Reset after 5 seconds
        setTimeout(() => {
          setState('idle')
          setMessage('')
          setProgress(0)
        }, 5000)
      }
    } catch (error) {
      clearInterval(progressInterval)
      setState('error')
      setMessage('スクレイピング中にエラーが発生しました')
      
      setTimeout(() => {
        setState('idle')
        setMessage('')
        setProgress(0)
      }, 5000)
    }
  }

  const getButtonContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            スクレイピング中... {Math.round(progress)}%
          </>
        )
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4" />
            完了
          </>
        )
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4" />
            エラー
          </>
        )
      default:
        return (
          <>
            <Download className="w-4 h-4" />
            {shopName}をスクレイピング
          </>
        )
    }
  }

  const getButtonVariant = () => {
    switch (state) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      default:
        return 'gradient'
    }
  }

  return (
    <div className="space-y-2">
      <motion.div
        whileHover={{ scale: state === 'idle' ? 1.05 : 1 }}
        whileTap={{ scale: state === 'idle' ? 0.95 : 1 }}
      >
        <Button
          variant={getButtonVariant() as any}
          size="lg"
          onClick={handleScrape}
          disabled={state === 'loading'}
          className={`relative overflow-hidden ${
            state === 'success' ? 'gradient-secondary' :
            state === 'error' ? 'bg-red-500 hover:bg-red-600' :
            'gradient-primary'
          } transition-all duration-300`}
        >
          {/* Progress Bar */}
          {state === 'loading' && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="absolute inset-y-0 left-0 bg-white/20 rounded-md"
            />
          )}
          
          <span className="relative z-10 flex items-center gap-2">
            {getButtonContent()}
          </span>
        </Button>
      </motion.div>

      {/* Status Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-sm text-center ${
              state === 'success' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}