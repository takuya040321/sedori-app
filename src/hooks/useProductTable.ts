// src/hooks/useProductTable.ts
import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { Product, AsinInfo, SortField, SortDirection, FilterSettings } from "@/types/product";
import { fetchASINInfo } from "@/lib/fetchASINInfo";
import { calculateProfitWithShopPricing } from "@/lib/pricing-calculator";
import { getShopPricingConfig } from "@/lib/pricing-config";

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
    showHiddenOnly: false,
    showDangerousGoods: false,
    excludeDangerousGoods: false,
    showPartnerCarrierUnavailable: false,
    excludePartnerCarrierUnavailable: false,
    excludeOfficialStore: false,
    excludeAmazonStore: false,
    showProfitableOnly: false,
    priceRange: { min: null, max: null },
    hasAsin: null,
  });

  // ショップ設定を取得
  const shopPricingConfig = getShopPricingConfig(category, shopName);

  // 利益計算のヘルパー関数
  const calculateProductProfit = (product: Product, userDiscountSettings = {}) => {
    if (!product.asins || product.asins.length === 0 || !shopPricingConfig) {
      return { profit: 0, profitMargin: 0, roi: 0 };
    }

    const asinInfo = product.asins[0]; // 最初のASINで計算
    if (!asinInfo || asinInfo.price === 0 || 
        asinInfo.sellingFee === null || asinInfo.fbaFee === null) {
      return { profit: 0, profitMargin: 0, roi: 0 };
    }

    const profitResult = calculateProfitWithShopPricing(
      product.price,
      product.salePrice,
      asinInfo.price,
      asinInfo.sellingFee,
      asinInfo.fbaFee,
      shopPricingConfig,
      userDiscountSettings,
      product.name,
      asinInfo.productName
    );

    return {
      profit: profitResult.profit,
      profitMargin: profitResult.profitMargin,
      roi: profitResult.roi,
    };
  };
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

    // 非表示商品のみフィルター
    if (filters.showHiddenOnly) {
      filtered = filtered.filter(product => !!product.hidden);
    }

    // 危険物フィルター
    if (filters.showDangerousGoods) {
      filtered = filtered.filter(product => 
        product.asins?.some(asin => asin.isDangerousGoods)
      );
    }

    // 危険物を除くフィルター
    if (filters.excludeDangerousGoods) {
      filtered = filtered.filter(product => 
        !product.asins?.some(asin => asin.isDangerousGoods)
      );
    }

    // パートナーキャリア不可フィルター
    if (filters.showPartnerCarrierUnavailable) {
      filtered = filtered.filter(product => 
        product.asins?.some(asin => asin.isPartnerCarrierUnavailable)
      );
    }

    // パートナーキャリア不可を除くフィルター
    if (filters.excludePartnerCarrierUnavailable) {
      filtered = filtered.filter(product => 
        !product.asins?.some(asin => asin.isPartnerCarrierUnavailable)
      );
    }

    // 公式を除くフィルター（チェックついているものを除く）
    if (filters.excludeOfficialStore) {
      filtered = filtered.filter(product => 
        !product.asins?.some(asin => asin.hasOfficialStore)
      );
    }

    // Amazonを除くフィルター（チェックついているものを除く）
    if (filters.excludeAmazonStore) {
      filtered = filtered.filter(product => 
        !product.asins?.some(asin => asin.hasAmazonStore)
      );
    }

    // 利益商品のみフィルター
    if (filters.showProfitableOnly) {
      filtered = filtered.filter(product => {
        if (!product.asins || product.asins.length === 0 || !shopPricingConfig) {
          return false;
        }
        
        const asinInfo = product.asins[0]; // 最初のASINで判定
        if (!asinInfo || asinInfo.price === 0 || 
            asinInfo.sellingFee === null || asinInfo.fbaFee === null) {
          return false;
        }

        const profitResult = calculateProfitWithShopPricing(
          product.price,
          product.salePrice,
          asinInfo.price,
          asinInfo.sellingFee,
          asinInfo.fbaFee,
          shopPricingConfig,
          {},
          product.name,
          asinInfo.productName
        );

        return profitResult.profitMargin > 0; // 利益率がプラスの商品のみ
      });
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
        case 'purchasePrice':
          // 仕入価格での並び替え（ショップ設定を考慮）
          aValue = a.salePrice || a.price;
          bValue = b.salePrice || b.price;
          break;
        case 'asin':
          aValue = (a.asins && a.asins[0]?.asin) || '';
          bValue = (b.asins && b.asins[0]?.asin) || '';
          break;
        case 'amazonProductName':
          aValue = (a.asins && a.asins[0]?.productName) || '';
          bValue = (b.asins && b.asins[0]?.productName) || '';
          break;
        case 'amazonPrice':
          aValue = (a.asins && a.asins[0]?.price) || 0;
          bValue = (b.asins && b.asins[0]?.price) || 0;
          break;
        case 'soldUnit':
          aValue = (a.asins && a.asins[0]?.soldUnit) || 0;
          bValue = (b.asins && b.asins[0]?.soldUnit) || 0;
          break;
        case 'sellingFee':
          aValue = (a.asins && a.asins[0]?.sellingFee) || 0;
          bValue = (b.asins && b.asins[0]?.sellingFee) || 0;
          break;
        case 'fbaFee':
          aValue = (a.asins && a.asins[0]?.fbaFee) || 0;
          bValue = (b.asins && b.asins[0]?.fbaFee) || 0;
          break;
        case 'profit':
          // 利益額での並び替え
          const aProfitData = calculateProductProfit(a);
          const bProfitData = calculateProductProfit(b);
          aValue = aProfitData.profit;
          bValue = bProfitData.profit;
          break;
        case 'profitMargin':
          // 利益率での並び替え
          const aMarginData = calculateProductProfit(a);
          const bMarginData = calculateProductProfit(b);
          aValue = aMarginData.profitMargin;
          bValue = bMarginData.profitMargin;
          break;
        case 'roi':
          // ROIでの並び替え
          const aRoiData = calculateProductProfit(a);
          const bRoiData = calculateProductProfit(b);
          aValue = aRoiData.roi;
          bValue = bRoiData.roi;
          break;
        case 'isDangerousGoods':
          aValue = (a.asins && a.asins[0]?.isDangerousGoods) ? 1 : 0;
          bValue = (b.asins && b.asins[0]?.isDangerousGoods) ? 1 : 0;
          break;
        case 'isPartnerCarrierUnavailable':
          aValue = (a.asins && a.asins[0]?.isPartnerCarrierUnavailable) ? 1 : 0;
          bValue = (b.asins && b.asins[0]?.isPartnerCarrierUnavailable) ? 1 : 0;
          break;
        case 'hasOfficialStore':
          aValue = (a.asins && a.asins[0]?.hasOfficialStore) ? 1 : 0;
          bValue = (b.asins && b.asins[0]?.hasOfficialStore) ? 1 : 0;
          break;
        case 'hasAmazonStore':
          aValue = (a.asins && a.asins[0]?.hasAmazonStore) ? 1 : 0;
          bValue = (b.asins && b.asins[0]?.hasAmazonStore) ? 1 : 0;
          break;
        case 'complaintCount':
          aValue = (a.asins && a.asins[0]?.complaintCount) || 0;
          bValue = (b.asins && b.asins[0]?.complaintCount) || 0;
          break;
        case 'hidden':
          aValue = a.hidden ? 1 : 0;
          bValue = b.hidden ? 1 : 0;
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
    // 楽観的更新：即座にUIを更新
    const updatedProducts = [...allProducts];
    if (updatedProducts[_rowIndex]) {
      updatedProducts[_rowIndex] = {
        ...updatedProducts[_rowIndex],
        hidden: _checked
      };
    }

    // SWRキャッシュを即座に更新
    mutate({ data: { products: updatedProducts } }, false);

    // バックエンドに保存（非同期）
    fetch(`/api/products/${category}/${shopName}/update-hidden`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: _rowIndex, hidden: _checked }),
    })
    .then(response => {
      if (!response.ok) {
        // エラーの場合は元に戻す
        console.error("Failed to update hidden status");
        mutate(); // サーバーから最新データを再取得
      }
    })
    .catch(error => {
      console.error("Failed to update hidden status:", error);
      mutate(); // サーバーから最新データを再取得
    });
  };

  // 商品複製処理
  const handleProductDuplicate = async (_rowIndex: number) => {
    try {
      const originalProduct = allProducts[_rowIndex];
      if (!originalProduct) return;

      // 複製商品を作成（ASINは空にする）
      const duplicatedProduct: Product = {
        ...originalProduct,
        asins: undefined, // ASINをクリア
        updatedAt: new Date().toISOString(),
        memo: originalProduct.memo ? `${originalProduct.memo} (複製)` : "(複製)",
      };

      // 商品配列に追加
      const updatedProducts = [...allProducts];
      updatedProducts.splice(_rowIndex + 1, 0, duplicatedProduct);

      // バックエンドに保存
      await fetch(`/api/products/${category}/${shopName}/duplicate-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: _rowIndex, duplicatedProduct }),
      });

      // データを再取得
      mutate();
    } catch (error) {
      console.error("Failed to duplicate product:", error);
    }
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
    handleProductDuplicate,
  };
}