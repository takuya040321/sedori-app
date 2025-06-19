'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductCard } from './ProductCard'
import { SearchFilter } from './SearchFilter'
import { Product } from '@/types/product'

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'updated'>('updated')
  const [filterBy, setFilterBy] = useState<'all' | 'sale' | 'regular'>('all')

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Apply filter
    if (filterBy === 'sale') {
      filtered = filtered.filter(product => product.salePrice && product.salePrice < product.price)
    } else if (filterBy === 'regular') {
      filtered = filtered.filter(product => !product.salePrice || product.salePrice >= product.price)
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.productName.localeCompare(b.productName)
        case 'price':
          const priceA = a.salePrice || a.price
          const priceB = b.salePrice || b.price
          return priceA - priceB
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [products, searchTerm, sortBy, filterBy])

  return (
    <div className="space-y-6">
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterBy={filterBy}
        onFilterChange={setFilterBy}
        totalCount={filteredAndSortedProducts.length}
      />

      <AnimatePresence mode="wait">
        {filteredAndSortedProducts.length > 0 ? (
          <motion.div
            key="products"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredAndSortedProducts.map((product, index) => (
              <ProductCard
                key={`${product.asin}-${product.updatedAt}`}
                product={product}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="no-products"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-lg">
              {searchTerm || filterBy !== 'all' 
                ? '条件に一致する商品が見つかりませんでした' 
                : '商品がありません'
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}