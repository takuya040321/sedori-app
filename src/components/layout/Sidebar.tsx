'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Store, 
  ChevronDown, 
  ChevronRight, 
  Menu, 
  X,
  Package,
  ShoppingBag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface NavItem {
  title: string
  href?: string
  icon: React.ReactNode
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: 'ダッシュボード',
    href: '/dashboard',
    icon: <Home className="w-5 h-5" />
  },
  {
    title: 'Official',
    icon: <Store className="w-5 h-5" />,
    children: [
      {
        title: 'VT Cosmetics',
        href: '/shop/official/vt-cosmetics',
        icon: <Package className="w-4 h-4" />
      },
      {
        title: 'DHC',
        href: '/shop/official/dhc',
        icon: <ShoppingBag className="w-4 h-4" />
      }
    ]
  },
  {
    title: 'Rakuten',
    icon: <Store className="w-5 h-5 opacity-50" />,
    children: [
      {
        title: 'VT Cosmetics',
        href: '#',
        icon: <Package className="w-4 h-4 opacity-50" />
      },
      {
        title: 'DHC',
        href: '#',
        icon: <ShoppingBag className="w-4 h-4 opacity-50" />
      }
    ]
  },
  {
    title: 'Yahoo',
    icon: <Store className="w-5 h-5 opacity-50" />,
    children: [
      {
        title: 'VT Cosmetics',
        href: '#',
        icon: <Package className="w-4 h-4 opacity-50" />
      },
      {
        title: 'DHC',
        href: '#',
        icon: <ShoppingBag className="w-4 h-4 opacity-50" />
      }
    ]
  }
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['Official'])
  const pathname = usePathname()

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const NavItemComponent = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const isExpanded = expandedItems.includes(item.title)
    const isActive = item.href === pathname
    const hasChildren = item.children && item.children.length > 0

    return (
      <div className="space-y-1">
        {item.href ? (
          <Link href={item.href}>
            <motion.div
              whileHover={{ x: 4 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                level > 0 && "ml-6",
                isActive 
                  ? "gradient-primary text-white shadow-lg glow-effect" 
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              )}
            >
              {item.icon}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        ) : (
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => hasChildren && toggleExpanded(item.title)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full",
              "text-gray-300 hover:text-white hover:bg-white/10"
            )}
          >
            {item.icon}
            <AnimatePresence>
              {!isCollapsed && (
                <>
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate flex-1 text-left"
                  >
                    {item.title}
                  </motion.span>
                  {hasChildren && (
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </motion.button>
        )}

        <AnimatePresence>
          {hasChildren && isExpanded && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1"
            >
              {item.children?.map((child) => (
                <NavItemComponent key={child.title} item={child} level={level + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="glass-card border-r border-white/10 h-screen flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-gradient font-bold text-lg">ShopScraper</h1>
                  <p className="text-xs text-gray-400">商品管理システム</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:bg-white/10"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <NavItemComponent key={item.title} item={item} />
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-gray-400 text-center"
            >
              © 2024 ShopScraper
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}