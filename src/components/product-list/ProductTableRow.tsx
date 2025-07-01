// src/components/product-list/ProductTableRow.tsx
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Product, AsinInfo, ShopPricingConfig, UserDiscountSettings } from "@/types/product";
import { calculateActualCost, calculateProfitWithShopPricing } from "@/lib/pricing-calculator";
import { AlertTriangle, Truck, ChevronDown, ChevronUp } from "lucide-react";
import { MultipleAsinManager } from "./MultipleAsinManager";
import { Button } from "@/components/ui/button";

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
  const [isExpanded, setIsExpanded] = useState(false);
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

  // 最適なASINの利益情報を計算（最も利益率の高いASIN）
  const getBestProfitInfo = () => {
    if (!product.asins || product.asins.length === 0 || !shopPricingConfig) {
      return { profit: null, profitMargin: null, roi: null };
    }

    let bestProfit = null;
    let bestProfitMargin = -Infinity;
    let bestROI = null;

    for (const asin of product.asins) {
      if (asin.price > 0 && asin.sellingFee !== null && asin.fbaFee !== null) {
        const profitResult = calculateProfitWithShopPricing(
          product.price,
          product.salePrice,
          asin.price,
          asin.sellingFee,
          asin.fbaFee,
          shopPricingConfig,
          userDiscountSettings
        );

        if (profitResult.profitMargin > bestProfitMargin) {
          bestProfitMargin = profitResult.profitMargin;
          bestProfit = profitResult.profit;
          bestROI = profitResult.roi;
        }
      }
    }

    return {
      profit: bestProfit,
      profitMargin: bestProfitMargin === -Infinity ? null : bestProfitMargin,
      roi: bestROI,
    };
  };

  const bestProfitInfo = getBestProfitInfo();

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
    <>
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
          <div className="flex items-center gap-2">
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
            {product.asins && product.asins.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
            )}
          </div>
        </td>
        
        {/* 6. 利益額 */}
        <td className="px-2 py-1 text-center">
          {bestProfitInfo.profit !== null ? (
            <div className={`font-medium text-sm ${
              bestProfitInfo.profit >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {bestProfitInfo.profit.toLocaleString()}円
            </div>
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </td>
        
        {/* 7. 利益率 */}
        <td className="px-2 py-1 text-center">
          {bestProfitInfo.profitMargin !== null ? (
            <div className={`font-medium text-sm ${
              bestProfitInfo.profitMargin >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {Math.round(bestProfitInfo.profitMargin)}%
            </div>
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </td>
        
        {/* 8. ROI */}
        <td className="px-2 py-1 text-center">
          {bestProfitInfo.roi !== null ? (
            <div className={`font-medium text-sm ${
              bestProfitInfo.roi >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {Math.round(bestProfitInfo.roi)}%
            </div>
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </td>
        
        {/* 9. 危険物 */}
        <td className="px-2 py-1 text-center">
          <div className="flex items-center justify-center">
            {hasDangerousGoods ? (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : (
              <span className="text-gray-400 text-xs">-</span>
            )}
          </div>
        </td>
        
        {/* 10. パートナーキャリア不可 */}
        <td className="px-2 py-1 text-center">
          <div className="flex items-center justify-center">
            {hasPartnerCarrierUnavailable ? (
              <Truck className="w-4 h-4 text-orange-500" />
            ) : (
              <span className="text-gray-400 text-xs">-</span>
            )}
          </div>
        </td>
        
        {/* 11. 非表示 */}
        <td className="px-2 py-1 text-center">
          <input
            type="checkbox"
            checked={!!product.hidden}
            onChange={(e) => onHiddenChange(_rowIndex, e.target.checked)}
            className="w-4 h-4"
          />
        </td>
        
        {/* 12. メモ */}
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

      {/* 展開された詳細行 */}
      {isExpanded && product.asins && product.asins.length > 0 && (
        <tr className={`${rowClassName} border-t-0`}>
          <td colSpan={12} className="px-4 py-3 bg-gray-50">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">
                ASIN詳細情報 ({product.asins.length}件)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left border-r">ASIN</th>
                      <th className="px-3 py-2 text-left border-r">商品名</th>
                      <th className="px-3 py-2 text-center border-r">Amazon価格</th>
                      <th className="px-3 py-2 text-center border-r">月販数</th>
                      <th className="px-3 py-2 text-center border-r">手数料</th>
                      <th className="px-3 py-2 text-center border-r">FBA料</th>
                      <th className="px-3 py-2 text-center border-r">利益額</th>
                      <th className="px-3 py-2 text-center border-r">利益率</th>
                      <th className="px-3 py-2 text-center border-r">ROI</th>
                      <th className="px-3 py-2 text-center border-r">危険物</th>
                      <th className="px-3 py-2 text-center">ﾊﾟｰｷｬﾘ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.asins.map((asin, asinIndex) => {
                      const profitResult = shopPricingConfig && 
                        asin.price > 0 && 
                        asin.sellingFee !== null && 
                        asin.fbaFee !== null
                        ? calculateProfitWithShopPricing(
                            product.price,
                            product.salePrice,
                            asin.price,
                            asin.sellingFee,
                            asin.fbaFee,
                            shopPricingConfig,
                            userDiscountSettings
                          )
                        : null;

                      const needsManualInput = !asin.productName || asin.price === 0 || 
                                             asin.sellingFee === null || asin.fbaFee === null;

                      return (
                        <tr key={asin.asin} className="border-t hover:bg-gray-50">
                          <td className="px-3 py-2 border-r">
                            <div className="font-mono text-blue-600 font-medium">
                              {asin.asin}
                            </div>
                          </td>
                          <td className="px-3 py-2 border-r">
                            <div className="max-w-[200px] truncate" title={asin.productName}>
                              {asin.productName || (
                                <span className="text-amber-600 italic">手動入力が必要</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center border-r">
                            {asin.price ? `${asin.price.toLocaleString()}円` : (
                              <span className="text-amber-600">未設定</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center border-r">
                            {asin.soldUnit ? asin.soldUnit.toLocaleString() : "-"}
                          </td>
                          <td className="px-3 py-2 text-center border-r">
                            {asin.sellingFee !== null ? `${asin.sellingFee}%` : (
                              <span className="text-amber-600">未設定</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center border-r">
                            {asin.fbaFee !== null ? `${asin.fbaFee.toLocaleString()}円` : (
                              <span className="text-amber-600">未設定</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center border-r">
                            {profitResult && !needsManualInput ? (
                              <span className={`font-medium ${
                                profitResult.profit >= 0 ? "text-green-600" : "text-red-600"
                              }`}>
                                {profitResult.profit.toLocaleString()}円
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center border-r">
                            {profitResult && !needsManualInput ? (
                              <span className={`font-medium ${
                                profitResult.profitMargin >= 0 ? "text-green-600" : "text-red-600"
                              }`}>
                                {Math.round(profitResult.profitMargin)}%
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center border-r">
                            {profitResult && !needsManualInput ? (
                              <span className={`font-medium ${
                                profitResult.roi >= 0 ? "text-green-600" : "text-red-600"
                              }`}>
                                {Math.round(profitResult.roi)}%
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center border-r">
                            <input
                              type="checkbox"
                              checked={asin.isDangerousGoods || false}
                              onChange={(e) => onDangerousGoodsChange(_rowIndex, asinIndex, e.target.checked)}
                              className="w-3 h-3 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={asin.isPartnerCarrierUnavailable || false}
                              onChange={(e) => onPartnerCarrierChange(_rowIndex, asinIndex, e.target.checked)}
                              className="w-3 h-3 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};