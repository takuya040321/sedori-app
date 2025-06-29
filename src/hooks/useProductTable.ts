// src/hooks/useProductTable.ts
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Product, AsinInfo } from "@/types/product";
import { fetchASINInfo } from "@/lib/fetchASINInfo";

export function useProductTable(category: string, shopName: string, initialProducts: Product[]) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, isLoading, mutate } = useSWR(`/api/products/${category}/${shopName}`, fetcher, {
    fallbackData: { data: { products: initialProducts } },
  });

  const products: Product[] = data?.data?.products ?? [];
  const [loadingProductIndexes, setLoadingProductIndexes] = useState<number[]>([]);

  const handleHiddenChange = (_rowIndex: number, _checked: boolean) => {
    fetch(`/api/products/${category}/${shopName}/update-hidden`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: _rowIndex, hidden: _checked }),
    }).then(() => mutate());
  };

  // メモ更新処理
  const handleMemoChange = async (_rowIndex: number, memo: string) => {
    try {
      await fetch(`/api/products/${category}/${shopName}/update-memo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: _rowIndex, memo }),
      });
      // 成功時はmutateを呼ばない（リアルタイム更新のため）
    } catch (error) {
      console.error("Failed to update memo:", error);
    }
  };

  // ASIN追加処理
  const handleAsinAdd = async (_rowIndex: number, asin: string) => {
    if (asin.length !== 10) return;

    setLoadingProductIndexes(prev => [...prev, _rowIndex]);

    try {
      // ブランド名をショップ名から推定
      const brand = shopName === "vt-cosmetics" ? "vt-cosmetics" : "dhc";
      
      // ASIN情報を取得
      const asinInfo = await fetchASINInfo(asin, brand);
      
      // 商品のASIN配列に追加
      await fetch(`/api/products/${category}/${shopName}/add-asin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productIndex: _rowIndex, 
          asinInfo 
        }),
      });

      // データを再取得
      mutate();
    } catch (error) {
      console.error("Failed to add ASIN:", error);
    } finally {
      setLoadingProductIndexes(prev => prev.filter(i => i !== _rowIndex));
    }
  };

  // ASIN削除処理
  const handleAsinRemove = async (_rowIndex: number, asinIndex: number) => {
    try {
      await fetch(`/api/products/${category}/${shopName}/remove-asin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productIndex: _rowIndex, 
          asinIndex 
        }),
      });

      // データを再取得
      mutate();
    } catch (error) {
      console.error("Failed to remove ASIN:", error);
    }
  };

  // 危険物フラグ更新処理
  const handleDangerousGoodsChange = async (_rowIndex: number, asinIndex: number, isDangerousGoods: boolean) => {
    try {
      const product = products[_rowIndex];
      const asinInfo = product.asins?.[asinIndex];
      
      if (!asinInfo) return;

      const brand = shopName === "vt-cosmetics" ? "vt-cosmetics" : "dhc";
      
      await fetch(`/api/asin-dangerous-goods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          asin: asinInfo.asin, 
          brand, 
          isDangerousGoods 
        }),
      });

      // 商品データの危険物フラグも更新
      await fetch(`/api/products/${category}/${shopName}/update-asin-dangerous`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productIndex: _rowIndex, 
          asinIndex, 
          isDangerousGoods 
        }),
      });

      // データを再取得
      mutate();
    } catch (error) {
      console.error("Failed to update dangerous goods flag:", error);
    }
  };

  return {
    products,
    isLoading,
    mutate,
    loadingProductIndexes,
    handleHiddenChange,
    handleMemoChange,
    handleAsinAdd,
    handleAsinRemove,
    handleDangerousGoodsChange,
  };
}