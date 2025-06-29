// src\components\product-list\ProductTable.tsx
import React, { forwardRef, useImperativeHandle } from "react";
import { Product } from "@/types/product";
import { useProductTable } from "@/hooks/useProductTable";
import { useUserDiscountSettings } from "@/hooks/useUserDiscountSettings";
import { ProductTableRow } from "./ProductTableRow";
import { ProductTableHeader } from "./ProductTableHeader";
import { UserDiscountControl } from "./UserDiscountControl";
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

export const ProductTable = forwardRef<ProductTableHandle, ProductTableProps>(
  ({ category, shopName, initialProducts }, ref) => {
    const {
      products,
      isLoading,
      feeInfos,
      asinInputs,
      loadingIndexes,
      handleAsinChange,
      handleAsinBlur,
      handleHiddenChange,
      mutate,
    } = useProductTable(category, shopName, initialProducts);

    const { userDiscountSettings, updateDiscountSetting, getDiscountSetting } = useUserDiscountSettings();

    // ショップ別価格設定を取得
    const shopPricingConfig = getShopPricingConfig(category, shopName);
    const shopKey = getShopKey(category, shopName);

    // ref経由でmutate関数を外部公開
    useImperativeHandle(ref, () => ({
      mutate,
    }));

    if (isLoading) {
      return <div>Loading products...</div>;
    }

    return (
      <div className="space-y-4">
        {/* ユーザー設定割引コントロール */}
        {shopPricingConfig?.allowUserDiscount && (
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium mb-3 text-gray-800">
              {shopName.toUpperCase()} 割引設定
            </h3>
            <div className="space-y-2">
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

        {/* 商品テーブル */}
        <div className="w-full overflow-x-auto overflow-y-auto max-h-[80vh]">
          <table className="min-w-full divide-y divide-gray-200 text-xs table-fixed">
            <ProductTableHeader />
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product, index) => (
                <ProductTableRow
                  key={product.name}
                  product={product}
                  rowIndex={index}
                  asinInput={asinInputs[index] || ""}
                  feeInfo={feeInfos[index]}
                  isLoadingFee={loadingIndexes.includes(index)}
                  onAsinChange={handleAsinChange}
                  onAsinBlur={handleAsinBlur}
                  onHiddenChange={handleHiddenChange}
                  shopPricingConfig={shopPricingConfig}
                  userDiscountSettings={userDiscountSettings}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* 価格計算説明 */}
        {shopPricingConfig && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">💰 価格計算について</h4>
            <div className="text-sm text-blue-700 space-y-1">
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
                </>
              )}
              <p className="text-xs mt-2 text-blue-600">
                💡 仕入価格列で各商品の割引詳細を確認できます
              </p>
            </div>
          </div>
        )}
      </div>
    );
  },
);

ProductTable.displayName = "ProductTable";