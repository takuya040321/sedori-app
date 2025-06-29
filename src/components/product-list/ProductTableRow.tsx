// src/components/product-list/ProductTableRow.tsx
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Product, AsinInfo, ShopPricingConfig, UserDiscountSettings } from "@/types/product";
import { calculateProfitWithShopPricing } from "@/lib/pricing-calculator";

interface Props {
  product: Product;
  rowIndex: number;
  asinInput: string;
  feeInfo?: AsinInfo;
  isLoadingFee: boolean;
  onAsinChange: (_rowIndex: number, _value: string) => void;
  onAsinBlur: (_rowIndex: number) => void;
  onHiddenChange: (_rowIndex: number, _checked: boolean) => void;
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
  shopPricingConfig,
  userDiscountSettings = {},
}) => {
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

    const basePrice = product.salePrice || product.price;
    const actualCost = profitResult?.actualCost || 0;

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

  return (
    <tr className="border-b transition bg-background text-foreground hover:bg-accent/30">
      {/* 1. 画像 */}
      <td className="px-2 py-1 bg-background text-foreground">
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
      </td>
      
      {/* 2. 商品名 */}
      <td className="px-2 py-1 bg-background text-foreground">
        <div className="max-w-[200px] truncate" title={product.name}>
          {product.name}
        </div>
      </td>
      
      {/* 3. 価格 */}
      <td className="px-2 py-1 bg-background text-foreground text-center">
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
      <td className="px-2 py-1 bg-background text-foreground">
        {getPurchasePriceDisplay()}
      </td>
      
      {/* 5. Amazon商品名 */}
      <td className="px-2 py-1 bg-background text-foreground">
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
      <td className="px-2 py-1 bg-background text-foreground">
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
      <td className="px-2 py-1 bg-background text-foreground text-center">
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
      <td className="px-2 py-1 bg-background text-foreground text-center">
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
      <td className="px-2 py-1 bg-background text-foreground text-center">
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
      <td className="px-2 py-1 bg-background text-foreground text-center">
        <div className="text-sm">
          {isLoadingFee
            ? "取得中"
            : feeInfo && feeInfo.fbaFee !== undefined
              ? `${feeInfo.fbaFee.toLocaleString()}`
              : "-"}
        </div>
      </td>
      
      {/* 11. 利益額 */}
      <td className="px-2 py-1 bg-background text-foreground text-center">
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
      <td className="px-2 py-1 bg-background text-foreground text-center">
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
      <td className="px-2 py-1 bg-background text-foreground text-center">
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
      
      {/* 14. 非表示 */}
      <td className="px-2 py-1 bg-background text-foreground text-center">
        <input
          type="checkbox"
          checked={!!product.hidden}
          onChange={(e) => onHiddenChange(_rowIndex, e.target.checked)}
          className="w-4 h-4"
        />
      </td>
      
      {/* 15. メモ */}
      <td className="px-2 py-1 bg-background text-foreground">
        <div className="text-xs max-w-[80px] truncate" title={feeInfo?.note || ""}>
          {isLoadingFee ? (
            "取得中"
          ) : (
            feeInfo?.note || "-"
          )}
        </div>
      </td>
    </tr>
  );
};