// src\app\shop\[category]\[shopName]\ShopPageClient.tsx

"use client";
import React, { useRef } from "react";
import { ProductTable } from "@/components/product-list/ProductTable";
import { ScrapingButton } from "@/components/product-list/ScrapingButton";

interface ShopPageClientProps {
  category: string;
  shopName: string;
  shopData: any;
}

export default function ShopPageClient({ category, shopName, shopData }: ShopPageClientProps) {
  const tableRef = useRef<any>(null);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gradient mb-2">{shopName} 商品一覧</h2>
          <p className="text-gray-400">
            最終更新:{" "}
            {shopData?.lastUpdated
              ? new Date(shopData.lastUpdated).toLocaleString("ja-JP")
              : "データなし"}
          </p>
        </div>
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
      <ProductTable
        ref={tableRef}
        category={category}
        shopName={shopName}
        initialProducts={shopData?.products ?? []}
      />
    </div>
  );
}
