// src/components/product-list/ProductTableRow.tsx
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Product, AsinInfo, ShopPricingConfig, UserDiscountSettings } from "@/types/product";
import { calculateProfitWithShopPricing, calculateActualCost } from "@/lib/pricing-calculator";
import { AlertTriangle, Package } from "lucide-react";

interface Props {
  product: Product;
  rowIndex: number;
  asinInput: string;
  feeInfo?: AsinInfo;
  isLoadingFee: boolean;
  onAsinChange: (_rowIndex: number, _value: string) => void;
  onAsinBlur: (_rowIndex: number) => void;
  onHiddenChange: (_rowIndex: number, _checked: boolean) => void;
  onMemoChange: (_rowIndex: number, _memo: string) => void;
  onDangerousGoodsChange: (_rowIndex: number, _checked: boolean) => void;
  shopPricingConfig?: ShopPricingConfig;
  userDiscountSettings?: UserDiscountSettings;
}

export const ProductTableRow: React.FC<Props> = ({
  product,
  rowIndex: _rowIndex,
  asinInput,
  feeInfo,
  isLoadingFee,
  onAsinChange,
  onAsinBlur,
  onHiddenChange,
  onMemoChange,
  onDangerousGoodsChange,
  shopPricingConfig,
  userDiscountSettings = {},
}) => {
  const [memoValue, setMemoValue] = useState(product.memo || "");
  const [isDangerousGoods, setIsDangerousGoods] = useState(feeInfo?.isDangerousGoods || false);
  const memoTimeoutRef = useRef<NodeJS.Timeout>();

  // feeInfoが更新されたときにisDangerousGoodsを同期
  useEffect(() => {
    setIsDangerousGoods(feeInfo?.isDangerousGoods || false);
  }, [feeInfo?.isDangerousGoods]);

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

  // 危険物チェックボックスの変更
  const handleDangerousGoodsChange = (checked: boolean) => {
    setIsDangerousGoods(checked);
    onDangerousGoodsChange(_rowIndex, checked);
  };

  // 利益計算（ショップ別価格設定を考慮）
  const profitResult = React.useMemo(() => {
    if (!feeInfo || !shopPricingConfig || 
        feeInfo.price === undefined || 
        feeInfo.sellingFee === null || 
        feeInfo.fbaFee === null) {
      return null;
    }

    return calculateProfitWithShopPricing(
      product.price,
      product.salePrice,
      feeInfo.price,
      feeInfo.sellingFee,
      feeInfo.fbaFee,
      shopPricingConfig,
      userDiscountSettings
    );
  }, [product.price, product.salePrice, feeInfo, shopPricingConfig, userDiscountSettings]);

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

  // 行のスタイル（危険物の場合はグレーアウト）
  const rowClassName = `border-b transition ${
    isDangerousGoods 
      ? "bg-gray-100 text-gray-500 opacity-60" 
      : "bg-background text-foreground hover:bg-accent/30"
  }`;

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
          {isDangerousGoods && (
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
              <AlertTriangle className="w-3 h-3 text-white" />
            </div>
          )}
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
      
      {/* 5. Amazon商品名 */}
      <td className="px-2 py-1">
        <div className="max-w-[150px] truncate text-sm" title={feeInfo?.productName || ""}>
          {asinInput.length !== 10
            ? "-"
            : isLoadingFee
              ? "取得中…"
              : feeInfo
                ? feeInfo.productName
                : "ASIN情報なし"}
        </div>
      </td>
      
      {/* 6. ASIN */}
      <td className="px-2 py-1">
        <input
          type="text"
          className="border px-1 py-0.5 rounded w-20 bg-white text-black text-xs"
          value={asinInput}
          maxLength={10}
          onChange={(e) => onAsinChange(_rowIndex, e.target.value)}
          onBlur={() => onAsinBlur(_rowIndex)}
          placeholder="ASIN"
          pattern="[A-Z0-9]{10}"
          inputMode="text"
          autoComplete="off"
          required
          title="ASINは大文字半角英数字10桁で入力してください"
        />
      </td>
      
      {/* 7. 月間販売個数 */}
      <td className="px-2 py-1 text-center">
        <div className="text-sm">
          {asinInput.length === 10
            ? isLoadingFee
              ? "取得中"
              : feeInfo?.soldUnit !== undefined
                ? `${feeInfo.soldUnit.toLocaleString()}`
                : "-"
            : "-"}
        </div>
      </td>
      
      {/* 8. Amazon販売価格 */}
      <td className="px-2 py-1 text-center">
        <div className="text-sm">
          {asinInput.length === 10
            ? isLoadingFee
              ? "取得中"
              : feeInfo?.price !== undefined
                ? `${feeInfo.price.toLocaleString()}`
                : "-"
            : "-"}
        </div>
      </td>
      
      {/* 9. 販売手数料 */}
      <td className="px-2 py-1 text-center">
        <div className="text-sm">
          {asinInput.length === 10
            ? isLoadingFee
              ? "取得中"
              : feeInfo?.sellingFee !== undefined
                ? `${feeInfo.sellingFee}%`
                : "-"
            : "-"}
        </div>
      </td>
      
      {/* 10. FBA手数料 */}
      <td className="px-2 py-1 text-center">
        <div className="text-sm">
          {isLoadingFee
            ? "取得中"
            : feeInfo && feeInfo.fbaFee !== undefined
              ? `${feeInfo.fbaFee.toLocaleString()}`
              : "-"}
        </div>
      </td>
      
      {/* 11. 利益額 */}
      <td className="px-2 py-1 text-center">
        <div className="text-sm">
          {isLoadingFee
            ? "取得中"
            : profitResult
              ? (
                <span className={profitResult.profit >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {profitResult.profit.toLocaleString()}
                </span>
              )
              : "-"}
        </div>
      </td>
      
      {/* 12. 利益率 */}
      <td className="px-2 py-1 text-center">
        <div className="text-sm">
          {isLoadingFee
            ? "取得中"
            : profitResult
              ? (
                <span className={profitResult.profitMargin >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {Math.round(profitResult.profitMargin)}%
                </span>
              )
              : "-"}
        </div>
      </td>

      {/* 13. ROI */}
      <td className="px-2 py-1 text-center">
        <div className="text-sm">
          {isLoadingFee
            ? "取得中"
            : profitResult
              ? (
                <span className={profitResult.roi >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {Math.round(profitResult.roi)}%
                </span>
              )
              : "-"}
        </div>
      </td>
      
      {/* 14. 危険物チェックボックス */}
      <td className="px-2 py-1 text-center">
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isDangerousGoods}
            onChange={(e) => handleDangerousGoodsChange(e.target.checked)}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            title="FBA納品不可（危険物）"
          />
          {isDangerousGoods && (
            <AlertTriangle className="w-3 h-3 text-red-500 ml-1" />
          )}
        </div>
      </td>
      
      {/* 15. 非表示 */}
      <td className="px-2 py-1 text-center">
        <input
          type="checkbox"
          checked={!!product.hidden}
          onChange={(e) => onHiddenChange(_rowIndex, e.target.checked)}
          className="w-4 h-4"
        />
      </td>
      
      {/* 16. メモ */}
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