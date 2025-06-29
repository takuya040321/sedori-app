// src/app/dashboard/page.tsx

import { Package, Store, Clock, TrendingUp } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { KPICard } from "@/components/dashboard/KPICard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { getAllProducts } from "@/lib/data-loader";

export default async function DashboardPage() {
  const allProducts = await getAllProducts();
  const totalProducts = allProducts.length;
  const saleProducts = allProducts.filter((p) => p.salePrice && p.salePrice < p.price).length;

  // Calculate last updated
  const lastUpdated =
    allProducts.length > 0
      ? new Date(Math.max(...allProducts.map((p) => new Date(p.updatedAt).getTime())))
      : null;

  return (
    <div className="min-h-screen">
      <PageContainer>
        {/* ヘッダー */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gradient">ShopScraper</h1>
          <p className="text-lg text-gray-600">商品管理システム - ダッシュボード</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="総商品数"
            value={totalProducts}
            icon={<Package className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
            gradient="gradient-primary"
            delay={0}
          />
          <KPICard
            title="アクティブショップ"
            value={2}
            icon={<Store className="w-6 h-6" />}
            trend={{ value: 0, isPositive: true }}
            gradient="gradient-secondary"
            delay={0.1}
          />
          <KPICard
            title="最終更新"
            value={lastUpdated ? lastUpdated.toLocaleDateString("ja-JP") : "データなし"}
            icon={<Clock className="w-6 h-6" />}
            gradient="gradient-accent"
            delay={0.2}
          />
          <KPICard
            title="セール商品"
            value={saleProducts}
            icon={<TrendingUp className="w-6 h-6" />}
            trend={{ value: 8, isPositive: true }}
            gradient="bg-gradient-to-r from-pink-500 to-rose-600"
            delay={0.3}
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityChart />
          <RecentActivity />
        </div>
      </PageContainer>
    </div>
  );
}