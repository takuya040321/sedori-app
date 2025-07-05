// src/hooks/useProductTable.ts
import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { Product, AsinInfo, SortField, SortDirection, FilterSettings } from "@/types/product";
import { fetchASINInfo } from "@/lib/fetchASINInfo";

export function useProductTable(category: string, shopName: string, initialProducts: Product[]) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, isLoading, mutate } = useSWR(`/api/products/${category}/${shopName}`, fetcher, {
    fallbackData: { data: { products: initialProducts } },
  });

  const allProducts: Product[] = data?.data?.products ?? [];
  const [loadingProductIndexes, setLoadingProductIndexes] = useState<number[]>([]);
  
  // 並び替え状態
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // フィルター状態
  const [filters, setFilters] = useState<FilterSettings>({
    search: '',
    showHidden: false,
    showDangerousGoods: false,
    showPartnerCarrierUnavailable: false,
    priceRange: { min: null, max: null },
    hasAsin: null,
  });

  // フィルタリング処理
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // 検索フィルター
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        (product.memo && product.memo.toLowerCase().includes(searchLower))
      );
    }

    // 非表示商品フィルター
    if (!filters.showHidden) {
      filtered = filtered.filter(product => !product.hidden);
    }

    // 危険物フィルター
    if (filters.showDangerousGoods) {
      filtered = filtered.filter(product => 
        product.asins?.some(asin => asin.isDangerousGoods)
      );
    }

    // パートナーキャリア不可フィルター
    if (filters.showPartnerCarrierUnavailable) {
      filtered = filtered.filter(product => 
        product.asins?.some(asin => asin.isPartnerCarrierUnavailable)
      );
    }

    // 価格範囲フィルター
    if (filters.priceRange.min !== null) {
      filtered = filtered.filter(product => 
        (product.salePrice || product.price) >= filters.priceRange.min!
      );
    }
    if (filters.priceRange.max !== null) {
      filtered = filtered.filter(product => 
        (product.salePrice || product.price) <= filters.priceRange.max!
      );
    }

    // ASIN有無フィルター
    if (filters.hasAsin === true) {
      filtered = filtered.filter(product => 
        product.asins && product.asins.length > 0
      );
    } else if (filters.hasAsin === false) {
      filtered = filtered.filter(product => 
        !product.asins || product.asins.length === 0
      );
    }

    return filtered;
  }, [allProducts, filters]);

  // 並び替え処理
  const sortedProducts = useMemo(() => {
    if (!sortField) return filteredProducts;

    const sorted = [...filteredProducts].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.salePrice || a.price;
          bValue = b.salePrice || b.price;
          break;
        case 'salePrice':
          aValue = a.salePrice || 0;
          bValue = b.salePrice || 0;
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'memo':
          aValue = (a.memo || '').toLowerCase();
          bValue = (b.memo || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredProducts, sortField, sortDirection]);

  // 並び替えハンドラー
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  // ASIN追加処理（エラーハンドリング改善）
  const handleAsinAdd = async (_rowIndex: number, asin: string) => {
    if (asin.length !== 10) return;

    setLoadingProductIndexes(prev => [...prev, _rowIndex]);

    try {
      // ブランド名をショップ名から推定
      const brand = shopName === "vt-cosmetics" ? "vt-cosmetics" : "dhc";
      
      console.log(`Fetching ASIN info for: ${asin}, brand: ${brand}`);
      
      // ASIN情報を取得（404の場合は基本情報を作成）
      const asinInfo = await fetchASINInfo(asin, brand);
      
      console.log(`ASIN info retrieved:`, asinInfo);
      
      // 商品のASIN配列に追加
      const response = await fetch(`/api/products/${category}/${shopName}/add-asin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productIndex: _rowIndex, 
          asinInfo 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      console.log(`ASIN ${asin} successfully added to product ${_rowIndex}`);

      // データを再取得
      mutate();
    } catch (error) {
      console.error("Failed to add ASIN:", error);
      
      // ユーザーにエラーを表示（将来的にはtoast通知など）
      alert(`ASIN登録に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      const product = allProducts[_rowIndex];
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

  // パートナーキャリア不可フラグ更新処理
  const handlePartnerCarrierChange = async (_rowIndex: number, asinIndex: number, isPartnerCarrierUnavailable: boolean) => {
    try {
      const product = allProducts[_rowIndex];
      const asinInfo = product.asins?.[asinIndex];
      
      if (!asinInfo) return;

      const brand = shopName === "vt-cosmetics" ? "vt-cosmetics" : "dhc";
      
      await fetch(`/api/asin-partner-carrier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          asin: asinInfo.asin, 
          brand, 
          isPartnerCarrierUnavailable 
        }),
      });

      // 商品データのパートナーキャリア不可フラグも更新
      await fetch(`/api/products/${category}/${shopName}/update-asin-partner-carrier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productIndex: _rowIndex, 
          asinIndex, 
          isPartnerCarrierUnavailable 
        }),
      });

      // データを再取得
      mutate();
    } catch (error) {
      console.error("Failed to update partner carrier flag:", error);
    }
  };

  // ASIN情報更新処理
  const handleAsinInfoUpdate = async (_rowIndex: number, asinIndex: number, field: keyof AsinInfo, value: any) => {
    try {
      const product = allProducts[_rowIndex];
      const asinInfo = product.asins?.[asinIndex];
      
      if (!asinInfo) return;

      const brand = shopName === "vt-cosmetics" ? "vt-cosmetics" : "dhc";
      
      // ASIN情報を更新
      await fetch(`/api/products/${category}/${shopName}/update-asin-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productIndex: _rowIndex, 
          asinIndex, 
          field,
          value
        }),
      });

      // ASINデータベースも更新
      await fetch(`/api/asin-info-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          asin: asinInfo.asin, 
          brand, 
          field,
          value
        }),
      });

      // データを再取得
      mutate();
    } catch (error) {
      console.error("Failed to update ASIN info:", error);
    }
  };

  return {
    products: sortedProducts,
    allProducts,
    isLoading,
    mutate,
    loadingProductIndexes,
    sortField,
    sortDirection,
    filters,
    handleSort,
    setFilters,
    handleHiddenChange,
    handleMemoChange,
    handleAsinAdd,
    handleAsinRemove,
    handleDangerousGoodsChange,
    handlePartnerCarrierChange,
    handleAsinInfoUpdate,
  };
}