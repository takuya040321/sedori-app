// src/components/product-list/ProductTableRow.tsx
import React, { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Product, AsinInfo, ShopPricingConfig, UserDiscountSettings } from "@/types/product";
import { calculateActualCost, calculateProfitWithShopPricing, extractUnitCount } from "@/lib/pricing-calculator";
import { AlertTriangle, Truck, Plus, Trash2, Edit, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  product: Product;
  rowIndex: number;
  asinInfo?: AsinInfo;
  asinIndex?: number;
  isFirstAsinRow?: boolean;
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
  rowIndex,
  asinInfo,
  asinIndex,
  isFirstAsinRow = true,
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
  const [newAsin, setNewAsin] = useState("");
  const [isAddingAsin, setIsAddingAsin] = useState(false);
  const memoTimeoutRef = useRef<NodeJS.Timeout>();

  // メモの変更をデバウンス処理
  const handleMemoChange = (value: string) => {
    setMemoValue(value);
    
    if (memoTimeoutRef.current) {
      clearTimeout(memoTimeoutRef.current);
    }
    
    memoTimeoutRef.current = setTimeout(() => {
      onMemoChange(rowIndex, value);
    }, 1000);
  };

  // ASIN追加処理
  const handleAddAsin = async () => {
    if (newAsin.length === 10) {
      setIsAddingAsin(true);
      await onAsinAdd(rowIndex, newAsin);
      setNewAsin("");
      setIsAddingAsin(false);
    }
  };

  // ASIN入力の検証とフォーマット
  const handleAsinInputChange = (value: string) => {
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    setNewAsin(formatted);
  };

  // Amazon商品ページを開く
  const handleAmazonLinkClick = () => {
    if (asinInfo?.url) {
      window.open(asinInfo.url, '_blank', 'noopener,noreferrer');
    }
  };

  // 仕入価格表示の生成（1個あたり対応）
  const getPurchasePriceDisplay = () => {
    if (!shopPricingConfig) {
      return `${(product.salePrice || product.price).toLocaleString()}円`;
    }

    const actualCost = calculateActualCost(
      product.price,
      product.salePrice,
      shopPricingConfig,
      userDiscountSettings,
      product.name // 商品名を渡して個数検出
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

  // 価格表示の生成（DHC複数個商品対応）
  const getPriceDisplay = () => {
    // DHCの場合、複数個商品の1個あたり価格を表示
    if (shopPricingConfig?.shopName === 'dhc') {
      const { count, unitType } = extractUnitCount(product.name);
      if (count > 1) {
        const unitPrice = (product.salePrice || product.price) / count;
        
        if (product.salePrice) {
          return (
            <div>
              <div className="line-through text-gray-400 text-xs">
                {product.price.toLocaleString()}円
              </div>
              <div className="text-red-400 font-bold text-sm">
                {product.salePrice.toLocaleString()}円
              </div>
              <div className="text-blue-600 font-medium text-xs border-t border-gray-200 pt-1 mt-1">
                {unitPrice.toLocaleString()}円/1{unitType}
              </div>
            </div>
          );
        } else {
          return (
            <div>
              <div className="text-sm">
                {product.price.toLocaleString()}円
              </div>
              <div className="text-blue-600 font-medium text-xs border-t border-gray-200 pt-1 mt-1">
                {unitPrice.toLocaleString()}円/1{unitType}
              </div>
            </div>
          );
        }
      }
    }
    
    // 従来の表示（DHC以外、または単品商品）
    if (product.salePrice) {
      return (
        <div>
          <div className="line-through text-gray-400 text-xs">
            {product.price.toLocaleString()}
          </div>
          <div className="text-red-400 font-bold text-sm">
            {product.salePrice.toLocaleString()}
          </div>
        </div>
      );
    } else {
      return (
        <div className="text-sm">{product.price.toLocaleString()}</div>
      );
    }
  };
  // 利益情報を計算（1個あたり対応）
  const getProfitInfo = () => {
    if (!asinInfo || !shopPricingConfig || asinInfo.price === 0 || 
        asinInfo.sellingFee === null || asinInfo.fbaFee === null) {
      return { profit: null, profitMargin: null, roi: null };
    }

    const profitResult = calculateProfitWithShopPricing(
      product.price,
      product.salePrice,
      asinInfo.price,
      asinInfo.sellingFee,
      asinInfo.fbaFee,
      shopPricingConfig,
      userDiscountSettings,
      product.name // 商品名を渡して個数検出
    );

    return {
      profit: profitResult.profit,
      profitMargin: profitResult.profitMargin,
      roi: profitResult.roi,
    };
  };

  const profitInfo = getProfitInfo();

  // 手動入力が必要かチェック
  const needsManualInput = asinInfo && (!asinInfo.productName || asinInfo.price === 0 || 
                          asinInfo.sellingFee === null || asinInfo.fbaFee === null);

  // 行のスタイル（危険物・パートナーキャリア不可の場合は色分け）
  let rowClassName = "border-b transition hover:bg-accent/30";
  
  if (asinInfo?.isDangerousGoods && asinInfo?.isPartnerCarrierUnavailable) {
    rowClassName += " bg-gradient-to-r from-red-50 to-orange-50";
  } else if (asinInfo?.isDangerousGoods) {
    rowClassName += " bg-red-50";
  } else if (asinInfo?.isPartnerCarrierUnavailable) {
    rowClassName += " bg-orange-50";
  } else {
    rowClassName += " bg-background text-foreground";
  }

  // 同じ商品の2行目以降は薄いボーダーで区別
  if (!isFirstAsinRow) {
    rowClassName += " border-l-4 border-l-blue-200";
  }

  return (
    <tr className={rowClassName}>
      {/* 1. 画像 - 最初の行のみ表示 */}
      <td className="px-2 py-1">
        {isFirstAsinRow ? (
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
            {(asinInfo?.isDangerousGoods || asinInfo?.isPartnerCarrierUnavailable) && (
              <div className="absolute -top-1 -right-1 flex gap-1">
                {asinInfo?.isDangerousGoods && (
                  <div className="bg-red-500 rounded-full p-1">
                    <AlertTriangle className="w-3 h-3 text-white" />
                  </div>
                )}
                {asinInfo?.isPartnerCarrierUnavailable && (
                  <div className="bg-orange-500 rounded-full p-1">
                    <Truck className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-16 h-16"></div>
        )}
      </td>
      
      {/* 2. 商品名 - 最初の行のみ表示 */}
      <td className="px-2 py-1">
        {isFirstAsinRow ? (
          <div className="max-w-[200px]" title={product.name}>
            <div className="text-sm leading-tight break-words">
              {product.name}
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-xs italic">↳ 追加ASIN</div>
        )}
      </td>
      
      {/* 3. 価格 - 最初の行のみ表示 */}
      <td className="px-2 py-1 text-center">
        {isFirstAsinRow ? (
          getPriceDisplay()
        ) : null}
      </td>
      
      {/* 4. 仕入価格 - 最初の行のみ表示 */}
      <td className="px-2 py-1">
        {isFirstAsinRow ? getPurchasePriceDisplay() : null}
      </td>
      
      {/* 5. ASIN */}
      <td className="px-2 py-1">
        {asinInfo ? (
          <div className="flex items-center gap-2">
            <div className="font-mono text-blue-600 font-medium text-sm">
              {asinInfo.asin}
            </div>
            {asinIndex !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAsinRemove(rowIndex, asinIndex)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={newAsin}
              onChange={(e) => handleAsinInputChange(e.target.value)}
              placeholder="新しいASIN"
              className="w-28 h-8 text-xs"
              maxLength={10}
            />
            <Button
              size="sm"
              onClick={handleAddAsin}
              disabled={newAsin.length !== 10 || isAddingAsin}
              className="h-8 px-2 text-xs"
            >
              {isAddingAsin ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
            </Button>
          </div>
        )}
      </td>
      
      {/* 6. Amazon商品名 - 折り返し表示とクリック機能 */}
      <td className="px-2 py-1">
        {asinInfo ? (
          asinInfo.productName ? (
            <div 
              className="max-w-[250px] cursor-pointer group"
              onClick={handleAmazonLinkClick}
              title={`${asinInfo.productName}\nクリックでAmazonページを開く`}
            >
              <div className="text-sm leading-tight break-words text-blue-600 hover:text-blue-800 hover:underline group-hover:bg-blue-50 p-1 rounded transition-colors">
                {asinInfo.productName}
                <ExternalLink className="w-3 h-3 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-600">
              <Edit className="w-3 h-3" />
              <span className="text-xs">手動入力が必要</span>
            </div>
          )
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 7. Amazon価格 */}
      <td className="px-2 py-1 text-center">
        {asinInfo ? (
          asinInfo.price ? (
            <div className="text-sm font-medium">
              {asinInfo.price.toLocaleString()}円
            </div>
          ) : (
            <span className="text-amber-600 text-xs">未設定</span>
          )
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 8. 月販数 */}
      <td className="px-2 py-1 text-center">
        {asinInfo ? (
          asinInfo.soldUnit ? (
            <div className="text-sm">
              {asinInfo.soldUnit.toLocaleString()}
            </div>
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 9. 手数料 */}
      <td className="px-2 py-1 text-center">
        {asinInfo ? (
          asinInfo.sellingFee !== null ? (
            <div className="text-sm">
              {asinInfo.sellingFee}%
            </div>
          ) : (
            <span className="text-amber-600 text-xs">未設定</span>
          )
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 10. FBA料 */}
      <td className="px-2 py-1 text-center">
        {asinInfo ? (
          asinInfo.fbaFee !== null ? (
            <div className="text-sm">
              {asinInfo.fbaFee.toLocaleString()}円
            </div>
          ) : (
            <span className="text-amber-600 text-xs">未設定</span>
          )
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 11. 利益額（1個あたり） */}
      <td className="px-2 py-1 text-center">
        {profitInfo.profit !== null && !needsManualInput ? (
          <div className={`font-medium text-sm ${
            profitInfo.profit >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            {profitInfo.profit.toLocaleString()}円
          </div>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 12. 利益率 */}
      <td className="px-2 py-1 text-center">
        {profitInfo.profitMargin !== null && !needsManualInput ? (
          <div className={`font-medium text-sm ${
            profitInfo.profitMargin >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            {Math.round(profitInfo.profitMargin)}%
          </div>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 13. ROI */}
      <td className="px-2 py-1 text-center">
        {profitInfo.roi !== null && !needsManualInput ? (
          <div className={`font-medium text-sm ${
            profitInfo.roi >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            {Math.round(profitInfo.roi)}%
          </div>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 14. 危険物 */}
      <td className="px-2 py-1 text-center">
        {asinInfo && asinIndex !== undefined ? (
          <input
            type="checkbox"
            checked={asinInfo.isDangerousGoods || false}
            onChange={(e) => onDangerousGoodsChange(rowIndex, asinIndex, e.target.checked)}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 15. パートナーキャリア不可 */}
      <td className="px-2 py-1 text-center">
        {asinInfo && asinIndex !== undefined ? (
          <input
            type="checkbox"
            checked={asinInfo.isPartnerCarrierUnavailable || false}
            onChange={(e) => onPartnerCarrierChange(rowIndex, asinIndex, e.target.checked)}
            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 16. 非表示 - 最初の行のみ表示 */}
      <td className="px-2 py-1 text-center">
        {isFirstAsinRow ? (
          <input
            type="checkbox"
            checked={!!product.hidden}
            onChange={(e) => onHiddenChange(rowIndex, e.target.checked)}
            className="w-4 h-4"
          />
        ) : null}
      </td>
      
      {/* 17. メモ - 最初の行のみ表示 */}
      <td className="px-2 py-1">
        {isFirstAsinRow ? (
          <input
            type="text"
            className="border px-1 py-0.5 rounded w-28 bg-white text-black text-xs"
            value={memoValue}
            onChange={(e) => handleMemoChange(e.target.value)}
            placeholder="メモ"
            title="商品メモ（自動保存）"
          />
        ) : null}
      </td>
    </tr>
  );
};