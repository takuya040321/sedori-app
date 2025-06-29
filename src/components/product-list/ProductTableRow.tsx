// src/components/product-list/ProductTableRow.tsx
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Product, AsinInfo, ShopPricingConfig, UserDiscountSettings } from "@/types/product";
import { calculateActualCost } from "@/lib/pricing-calculator";
import { AlertTriangle, Truck } from "lucide-react";
import { MultipleAsinManager } from "./MultipleAsinManager";

interface Props {
  product: Product;
  rowIndex: number;
  onHiddenChange: (_rowIndex: number, _checked: boolean) => void;
  onMemoChange: (_rowIndex: number, _memo: string) => void;
  onAsinAdd: (_rowIndex: number, _asin: string) => void;
  onAsinRemove: (_rowIndex: number, _asinIndex: number) => void;
  onDangerousGoodsChange: (_rowIndex: number, _asinIndex: number, _checked: boolean) => void;
  onPartnerCarrierChange: (_rowIndex: number, _asinIndex: number, _checked: boolean) => void;
  shopPricingConfig?: ShopPricingConfig;
  userDiscountSettings?: UserDiscountSettings;
  isLoadingAsins?: boolean;
}

export const ProductTableRow: React.FC<Props> = ({
  product,
  rowIndex: _rowIndex,
  onHiddenChange,
  onMemoChange,
  onAsinAdd,
  onAsinRemove,
  onDangerousGoodsChange,
  onPartnerCarrierChange,
  shopPricingConfig,
  userDiscountSettings = {},
  isLoadingAsins = false,
}) => {
  const [memoValue, setMemoValue] = useState(product.memo || "");
  const memoTimeoutRef = useRef<NodeJS.Timeout>();

  // メモの変更をデバウンス処理
  const handleMemoChange = (value: string) => {
    setMemoValue(value);
    
    // 既存のタイマーをクリア
    if (memoTimeoutRef.current) {
      clearTimeout(memoTimeoutRef.current);
    }
    
    // 1秒後に保存
    memoTimeoutRef.current = setTimeout(() => {
      onMemoChange(_rowIndex, value);
    }, 1000);
  };

  // 仕入価格表示の生成
  const getPurchasePriceDisplay = () => {
    if (!shopPricingConfig) {
      return `${(product.salePrice || product.price).toLocaleString()}円`;
    }

    // 実際の仕入価格を計算
    const actualCost = calculateActualCost(
      product.price,
      product.salePrice,
      shopPricingConfig,
      userDiscountSettings
    );

    switch (shopPricingConfig.priceCalculationType) {
      case 'fixed_discount':
        return (
          <div className="text-center">
            <div className="font-medium text-blue-600 text-sm">
              {actualCost.toLocaleString()}円
            </div>
            <div className="text-xs text-gray-500">
              -{shopPricingConfig.fixedDiscount}円
            </div>
          </div>
        );

      case 'user_configurable':
        const shopKey = `${shopPricingConfig.category}-${shopPricingConfig.shopName}`;
        const baseDiscountRate = shopPricingConfig.percentageDiscount || 0;
        const userDiscountRate = userDiscountSettings[shopKey] || 0;
        const totalDiscountRate = baseDiscountRate + userDiscountRate;
        
        return (
          <div className="text-center">
            <div className="font-medium text-blue-600 text-sm">
              {actualCost.toLocaleString()}円
            </div>
            <div className="text-xs text-gray-500">
              -{totalDiscountRate}%
              {userDiscountRate > 0 && (
                <div>({baseDiscountRate}%+{userDiscountRate}%)</div>
              )}
            </div>
          </div>
        );

      case 'percentage_discount':
        const discountRate = shopPricingConfig.percentageDiscount || 0;
        return (
          <div className="text-center">
            <div className="font-medium text-blue-600 text-sm">
              {actualCost.toLocaleString()}円
            </div>
            <div className="text-xs text-gray-500">
              -{discountRate}%
            </div>
          </div>
        );

      default:
        return `${actualCost.toLocaleString()}円`;
    }
  };

  // 危険物があるかチェック
  const hasDangerousGoods = product.asins?.some(asin => asin.isDangerousGoods) || false;
  
  // パートナーキャリア不可があるかチェック
  const hasPartnerCarrierUnavailable = product.asins?.some(asin => asin.isPartnerCarrierUnavailable) || false;

  // 行のスタイル（危険物・パートナーキャリア不可の場合は色分け）
  let rowClassName = "border-b transition hover:bg-accent/30";
  if (hasDangerousGoods && hasPartnerCarrierUnavailable) {
    rowClassName += " bg-gradient-to-r from-red-50 to-orange-50";
  } else if (hasDangerousGoods) {
    rowClassName += " bg-red-50";
  } else if (hasPartnerCarrierUnavailable) {
    rowClassName += " bg-orange-50";
  } else {
    rowClassName += " bg-background text-foreground";
  }

  return (
    <tr className={rowClassName}>
      {/* 1. 画像 */}
      <td className="px-2 py-1">
        <div className="relative">
          <Avatar className="w-16 h-16 rounded-none">
            {product.imageUrl ? (
              <AvatarImage
                src={product.imageUrl}
                alt={product.name}
                className="object-contain border border-white/20 bg-black/10 rounded-none"
              />
            ) : (
              <AvatarFallback className="text-[10px]">No</AvatarFallback>
            )}
          </Avatar>
          <div className="absolute -top-1 -right-1 flex gap-1">
            {hasDangerousGoods && (
              <div className="bg-red-500 rounded-full p-1">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
            )}
            {hasPartnerCarrierUnavailable && (
              <div className="bg-orange-500 rounded-full p-1">
                <Truck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </td>
      
      {/* 2. 商品名 */}
      <td className="px-2 py-1">
        <div className="max-w-[200px] truncate" title={product.name}>
          {product.name}
        </div>
      </td>
      
      {/* 3. 価格 */}
      <td className="px-2 py-1 text-center">
        {product.salePrice ? (
          <div>
            <div className="line-through text-gray-400 text-xs">
              {product.price.toLocaleString()}
            </div>
            <div className="text-red-400 font-bold text-sm">
              {product.salePrice.toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="text-sm">{product.price.toLocaleString()}</div>
        )}
      </td>
      
      {/* 4. 仕入価格 */}
      <td className="px-2 py-1">
        {getPurchasePriceDisplay()}
      </td>
      
      {/* 5. ASIN管理 */}
      <td className="px-2 py-1">
        <MultipleAsinManager
          productIndex={_rowIndex}
          productPrice={product.price}
          productSalePrice={product.salePrice}
          asins={product.asins || []}
          onAsinAdd={onAsinAdd}
          onAsinRemove={onAsinRemove}
          onDangerousGoodsChange={onDangerousGoodsChange}
          onPartnerCarrierChange={onPartnerCarrierChange}
          shopPricingConfig={shopPricingConfig}
          userDiscountSettings={userDiscountSettings}
          isLoading={isLoadingAsins}
        />
      </td>
      
      {/* 6. 危険物 */}
      <td className="px-2 py-1 text-center">
        <div className="flex items-center justify-center">
          {hasDangerousGoods ? (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </div>
      </td>
      
      {/* 7. パートナーキャリア不可 */}
      <td className="px-2 py-1 text-center">
        <div className="flex items-center justify-center">
          {hasPartnerCarrierUnavailable ? (
            <Truck className="w-4 h-4 text-orange-500" />
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </div>
      </td>
      
      {/* 8. 非表示 */}
      <td className="px-2 py-1 text-center">
        <input
          type="checkbox"
          checked={!!product.hidden}
          onChange={(e) => onHiddenChange(_rowIndex, e.target.checked)}
          className="w-4 h-4"
        />
      </td>
      
      {/* 9. メモ */}
      <td className="px-2 py-1">
        <input
          type="text"
          className="border px-1 py-0.5 rounded w-28 bg-white text-black text-xs"
          value={memoValue}
          onChange={(e) => handleMemoChange(e.target.value)}
          placeholder="メモ"
          title="商品メモ（自動保存）"
        />
      </td>
    </tr>
  );
};