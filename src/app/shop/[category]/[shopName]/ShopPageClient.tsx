// src/app/shop/[category]/[shopName]/ShopPageClient.tsx

"use client";
import React, { useRef } from "react";
import { ProductTable } from "@/components/product-list/ProductTable";
import { ScrapingButton } from "@/components/product-list/ScrapingButton";
import { ProxyStatusIndicator } from "@/components/product-list/ProxyStatusIndicator";
import { PageContainer } from "@/components/layout/PageContainer";

interface ShopPageClientProps {
  category: string;
  shopName: string;
  shopData: any;
}

export default function ShopPageClient({ category, shopName, shopData }: ShopPageClientProps) {
  const tableRef = useRef<any>(null);

  return (
    <PageContainer fullWidth={true}>
      <div className="space-y-6">
        {/* ヘッダー部分 */}
        <div className="minimal-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gradient mb-2">{shopName.toUpperCase()} 商品一覧</h2>
              <p className="text-gray-600">
                最終更新:{" "}
                {shopData?.lastUpdated
                  ? new Date(shopData.lastUpdated).toLocaleString("ja-JP")
                  : "データなし"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ScrapingButton
                category={category}
                shopName={shopName}
                onScraped={() => {
                  if (tableRef.current && tableRef.current.mutate) {
                    tableRef.current.mutate();
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* プロキシ状態表示 */}
        <ProxyStatusIndicator />

        {/* 商品テーブル */}
        <ProductTable
          ref={tableRef}
          category={category}
          shopName={shopName}
          initialProducts={shopData?.products ?? []}
        />
      </div>
    </PageContainer>
  );
}