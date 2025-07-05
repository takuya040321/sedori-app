// src/components/product-list/ProductTable.tsx
import React, { forwardRef, useImperativeHandle, useMemo } from "react";
import { Product } from "@/types/product";
import { useProductTable } from "@/hooks/useProductTable";
import { useUserDiscountSettings } from "@/hooks/useUserDiscountSettings";
import { ProductTableRow } from "./ProductTableRow";
import { ProductTableHeader } from "./ProductTableHeader";
import { UserDiscountControl } from "./UserDiscountControl";
import { SearchAndFilter } from "./SearchAndFilter";
import { getShopPricingConfig, getShopKey } from "@/lib/pricing-config";

export interface ProductTableProps {
  category: string;
  shopName: string;
  initialProducts: Product[];
}

// 外部から呼び出したいメソッドを定義
export interface ProductTableHandle {
  mutate: () => void;
}

// 商品を行に展開する型
interface ProductRow {
  product: Product;
  originalIndex: number;
  asinInfo?: any;
  asinIndex?: number;
  isFirstAsinRow: boolean;
}

export const ProductTable = forwardRef<ProductTableHandle, ProductTableProps>(
  ({ category, shopName, initialProducts }, ref) => {
    const {
      products,
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
    } = useProductTable(category, shopName, initialProducts);

    const { userDiscountSettings, updateDiscountSetting, getDiscountSetting } = useUserDiscountSettings();

    // ショップ別価格設定を取得
    const shopPricingConfig = getShopPricingConfig(category, shopName);
    const shopKey = getShopKey(category, shopName);

    // ref経由でmutate関数を外部公開
    useImperativeHandle(ref, () => ({
      mutate,
    }));

    // 商品を行に展開
    const expandedRows = useMemo(() => {
      const rows: ProductRow[] = [];
      
      products.forEach((product) => {
        // 元の配列でのインデックスを取得
        const originalIndex = allProducts.findIndex(p => 
          p.name === product.name && p.updatedAt === product.updatedAt
        );

        if (product.asins && product.asins.length > 0) {
          // ASINがある場合：ASIN数分の行を作成
          product.asins.forEach((asinInfo, asinIndex) => {
            rows.push({
              product,
              originalIndex,
              asinInfo,
              asinIndex,
              isFirstAsinRow: asinIndex === 0,
            });
          });
        } else {
          // ASINがない場合：1行のみ作成
          rows.push({
            product,
            originalIndex,
            isFirstAsinRow: true,
          });
        }
      });

      return rows;
    }, [products, allProducts]);

    if (isLoading) {
      return (
        <div className="minimal-card p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">商品データを読み込み中...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 w-full">
        {/* ユーザー設定割引コントロール */}
        {shopPricingConfig?.allowUserDiscount && (
          <div className="minimal-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {shopName.toUpperCase()} 割引設定
            </h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                基本割引: {shopPricingConfig.percentageDiscount || 0}%
                {shopPricingConfig.percentageDiscount && shopPricingConfig.percentageDiscount > 0 && 
                  " (セール価格から自動適用)"
                }
              </div>
              <UserDiscountControl
                shopKey={shopKey}
                currentDiscount={getDiscountSetting(shopKey)}
                onDiscountChange={updateDiscountSetting}
                disabled={!shopPricingConfig.allowUserDiscount}
              />
              <div className="text-xs text-gray-500">
                例: セール価格から20% + 追加10% = 合計30%割引で計算されます
              </div>
            </div>
          </div>
        )}

        {/* 検索・フィルター */}
        <SearchAndFilter
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={allProducts.length}
          filteredCount={products.length}
        />

        {/* 商品テーブル - 画面いっぱいに表示 */}
        <div className="minimal-card overflow-hidden w-full">
          <div className="overflow-auto max-h-[80vh] w-full" style={{ scrollbarWidth: 'thin' }}>
            <table className="minimal-table w-full min-w-[1800px]">
              <ProductTableHeader
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <tbody>
                {expandedRows.map((row, index) => (
                  <ProductTableRow
                    key={`${row.product.name}-${row.product.updatedAt}-${row.asinIndex || 0}`}
                    product={row.product}
                    rowIndex={row.originalIndex}
                    asinInfo={row.asinInfo}
                    asinIndex={row.asinIndex}
                    isFirstAsinRow={row.isFirstAsinRow}
                    onHiddenChange={handleHiddenChange}
                    onMemoChange={handleMemoChange}
                    onAsinAdd={handleAsinAdd}
                    onAsinRemove={handleAsinRemove}
                    onDangerousGoodsChange={handleDangerousGoodsChange}
                    onPartnerCarrierChange={handlePartnerCarrierChange}
                    shopPricingConfig={shopPricingConfig}
                    userDiscountSettings={userDiscountSettings}
                    isLoadingAsins={loadingProductIndexes.includes(row.originalIndex)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 検索結果が0件の場合 */}
          {expandedRows.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium mb-2">商品が見つかりません</p>
              <p className="text-sm">検索条件やフィルターを変更してお試しください</p>
            </div>
          )}
        </div>

        {/* 価格計算説明 */}
        {shopPricingConfig && (
          <div className="minimal-card p-6 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              💰 価格計算について
            </h4>
            <div className="text-sm text-blue-800 space-y-2">
              {shopPricingConfig.priceCalculationType === 'fixed_discount' && (
                <p>
                  • <strong>{shopName.toUpperCase()}</strong>: 価格から<strong>{shopPricingConfig.fixedDiscount}円</strong>を差し引いた金額で利益計算
                </p>
              )}
              {shopPricingConfig.priceCalculationType === 'user_configurable' && (
                <>
                  <p>
                    • <strong>{shopName.toUpperCase()}</strong>: セール価格から<strong>{shopPricingConfig.percentageDiscount}%基本割引</strong> + <strong>ユーザー設定割引</strong>
                  </p>
                  <p>
                    • 最終仕入れ価格 = セール価格 × (100% - 基本割引% - 追加割引%)
                  </p>
                  {shopName === 'dhc' && (
                    <p className="text-blue-700 bg-blue-100 px-3 py-2 rounded-lg">
                      🔢 <strong>複数個商品対応</strong>: 「2本」「3個」などの商品は価格列に1個あたり価格を表示し、その価格を基準に利益計算
                    </p>
                  )}
                </>
              )}
              <p className="text-xs mt-2 text-blue-700 bg-blue-100 px-3 py-2 rounded-lg">
                💡 仕入価格列で各商品の割引詳細を確認できます
              </p>
            </div>
          </div>
        )}

        {/* 機能説明 */}
        <div className="minimal-card p-6 bg-amber-50 border-amber-200">
          <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
            🔧 テーブル機能について
          </h4>
          <div className="text-sm text-amber-800 space-y-2">
            <p>
              • <strong>複数ASIN表示</strong>: 1つの商品に複数ASINがある場合、ASIN数分の行で表示
            </p>
            <p>
              • <strong>列幅調整</strong>: 各列の境界をドラッグして幅を調整できます
            </p>
            <p>
              • <strong>固定ヘッダー</strong>: スクロール時もヘッダーが表示されます
            </p>
            <p>
              • <strong>並び替え</strong>: 列ヘッダーをクリックして昇順・降順で並び替え
            </p>
            <p>
              • <strong>ﾊﾟｰｷｬﾘ</strong>: パートナーキャリア不可の略称（オレンジ色で表示）
            </p>
            <p>
              • <strong>色分け表示</strong>: 危険物（赤）、ﾊﾟｰｷｬﾘ不可（オレンジ）、両方（グラデーション）
            </p>
            <p>
              • <strong>横スクロール</strong>: 画面いっぱいに表示、横スクロールで全情報を確認
            </p>
            {shopName === 'dhc' && (
              <p>
                • <strong>1個あたり表示</strong>: DHCの複数個商品は価格列に1個あたり価格を表示し、その価格で利益計算
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
);

ProductTable.displayName = "ProductTable";