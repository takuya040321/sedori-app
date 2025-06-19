'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Clock, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/types/product'
import { formatPrice, getTimeAgo } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  index: number
}

export function ProductCard({ product, index }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercentage = hasDiscount 
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <Card className="glass-card hover-lift glow-effect border-white/20 overflow-hidden h-full">
        <CardContent className="p-0">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden">
            {!imageError ? (
              <Image
                src={product.imageUrl}
                alt={product.productName}
                fill
                className={`object-cover transition-all duration-500 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <Tag className="w-12 h-12 text-gray-500" />
              </div>
            )}
            
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-800 shimmer" />
            )}

            {/* Sale Badge */}
            {hasDiscount && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: -45 }}
                transition={{ delay: 0.3 }}
                className="absolute top-2 -right-8 bg-red-500 text-white px-8 py-1 text-xs font-bold transform rotate-45"
              >
                {discountPercentage}% OFF
              </motion.div>
            )}

            {/* Updated Badge */}
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {getTimeAgo(product.updatedAt)}
              </Badge>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
              {product.productName}
            </h3>

            {/* Price */}
            <div className="space-y-1">
              {hasDiscount ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-400">
                    {formatPrice(product.salePrice!)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-white">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* ASIN */}
            {product.asin && (
              <div className="text-xs text-gray-400">
                ASIN: {product.asin}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}