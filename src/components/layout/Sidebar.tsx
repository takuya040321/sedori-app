// src/components/layout/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Store, ChevronRight, Menu, X, Package, ShoppingBag, Upload, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: "ダッシュボード",
    href: "/dashboard",
    icon: <Home className="w-5 h-5" />,
  },
  {
    title: "Official",
    icon: <Store className="w-5 h-5" />,
    children: [
      {
        title: "VT Cosmetics",
        href: "/shop/official/vt-cosmetics",
        icon: <Package className="w-4 h-4" />,
      },
      {
        title: "DHC",
        href: "/shop/official/dhc",
        icon: <ShoppingBag className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Rakuten",
    icon: <Store className="w-5 h-5 opacity-50" />,
    children: [
      {
        title: "VT Cosmetics",
        href: "/shop/dummy",
        icon: <Package className="w-4 h-4 opacity-50" />,
      },
      {
        title: "DHC",
        href: "/shop/dummy",
        icon: <ShoppingBag className="w-4 h-4 opacity-50" />,
      },
    ],
  },
  {
    title: "Yahoo",
    icon: <Store className="w-5 h-5 opacity-50" />,
    children: [
      {
        title: "VT Cosmetics",
        href: "/shop/dummy",
        icon: <Package className="w-4 h-4 opacity-50" />,
      },
      {
        title: "DHC",
        href: "/shop/dummy",
        icon: <ShoppingBag className="w-4 h-4 opacity-50" />,
      },
    ],
  },
  {
    title: "Yahoo",
    icon: <Store className="w-5 h-5 opacity-50" />,
    children: [
      {
        title: "VT Cosmetics",
        href: "/shop/dummy",
        icon: <Package className="w-4 h-4 opacity-50" />,
      },
      {
        title: "DHC",
        href: "/shop/dummy",
        icon: <ShoppingBag className="w-4 h-4 opacity-50" />,
      },
    ],
  },
];

// 下部メニュー（設定・ASIN一括登録）
const bottomNavigation: NavItem[] = [
  {
    title: "ASIN一括登録", 
    href: "/asin-upload",
    icon: <Upload className="w-5 h-5" />,
  },
  {
    title: "設定",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Official"]);
  const pathname = usePathname();

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    );
  };

  const NavItemComponent = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const isExpanded = expandedItems.includes(item.title);
    const isActive = item.href === pathname;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div className="space-y-1">
        {item.href ? (
          <Link href={item.href}>
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                level > 0 && "ml-6",
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
              )}
            >
              {item.icon}
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </div>
          </Link>
        ) : (
          <button
            onClick={() => hasChildren && toggleExpanded(item.title)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full",
              "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
            )}
          >
            {item.icon}
            {!isCollapsed && (
              <>
                <span className="truncate flex-1 text-left">{item.title}</span>
                {hasChildren && (
                  <div
                    style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    className="transition-transform duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </>
            )}
          </button>
        )}

        {/* サブメニュー */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="space-y-1">
            {item.children?.map((child) => (
              <NavItemComponent key={child.title} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{ width: isCollapsed ? 80 : 280 }}
      className="bg-white border-r border-gray-200 h-screen flex flex-col shadow-sm transition-all duration-300"
    >
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-md">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gradient font-bold text-xl">ShopScraper</h1>
                <p className="text-xs text-gray-500">商品管理システム</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:bg-gray-100 rounded-xl"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <NavItemComponent key={item.title} item={item} />
        ))}
      </div>

      {/* 区切り線 */}
      <div className="px-4">
        <div className="border-t border-gray-200"></div>
      </div>

      {/* 下部ナビゲーション */}
      <div className="p-4 space-y-2">
        {bottomNavigation.map((item) => (
          <NavItemComponent key={item.title} item={item} />
        ))}
      </div>

      {/* フッター */}
      <div className="p-4 border-t border-gray-100">
        {!isCollapsed && (
          <div className="text-xs text-gray-400 text-center">
            © 2025 ShopScraper
          </div>
        )}
      </div>
    </div>
  );
}