// src/components/product-list/ProductTableRow.tsx
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Product, AsinInfo, ShopPricingConfig, UserDiscountSettings } from "@/types/product";
import { calculateProfitWithShopPricing, getDiscountDisplayText } from "@/lib/pricing-calculator";

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

  // 割引表示テキスト
  const discountDisplayText = React.useMemo(() => {
    if (!shopPricingConfig) return null;
    
    return getDiscountDisplayText(
      product.price,
      product.salePrice,
      shopPricingConfig,
      userDiscountSettings
    );
  }, [product.price, product.salePrice, shopPricingConfig, userDiscountSettings]);

  return (
    <tr className="border-b transition bg-background text-foreground hover:bg-accent/30">
      {/* 1. 画像 */}
      <td className="px-2 py-1 bg-background text-foreground">
        <Avatar className="w-20 h-20 rounded-none">
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
      <td className="px-2 py-1 bg-background text-foreground">{product.name}</td>
      
      {/* 3. 価格 */}
      <td className="px-2 py-1 bg-background text-foreground">
        {product.salePrice ? (
          <>
            <span className="line-through text-gray-400 mr-1">{product.price.toLocaleString()}円</span>
            <span className="text-red-400 font-bold">{product.salePrice.toLocaleString()}円</span>
          </>
        ) : (
          <span>{product.price.toLocaleString()}円</span>
        )}
      </td>
      
      {/* 4. 実際の仕入れ価格 */}
      <td className="px-2 py-1 bg-background text-foreground">
        {shopPricingConfig ? (
          <div className="space-y-1">
            <div className="font-medium text-blue-600">
              {profitResult ? `${profitResult.actualCost.toLocaleString()}円` : discountDisplayText?.split('=')[1]?.trim() || '-'}
            </div>
            <div className="text-xs text-gray-500">
              {discountDisplayText}
            </div>
          </div>
        ) : (
          <span>{(product.salePrice || product.price).toLocaleString()}円</span>
        )}
      </td>
      
      {/* 5. Amazon商品名 */}
      <td className="px-2 py-1 bg-background text-foreground">
        {asinInput.length !== 10
          ? "-"
          : isLoadingFee
            ? "取得中…"
            : feeInfo
              ? feeInfo.productName
              : "ASIN情報なし"}
      </td>
      
      {/* 6. ASIN */}
      <td className="px-2 py-1 bg-background text-foreground">
        <input
          type="text"
          className="border px-1 py-0.5 rounded w-28 bg-white text-black"
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
      <td className="px-2 py-1 bg-background text-foreground">
        {asinInput.length === 10
          ? isLoadingFee
            ? "取得中…"
            : feeInfo?.soldUnit !== undefined
              ? `${feeInfo.soldUnit.toLocaleString()}`
              : "-"
          : "-"}
      </td>
      
      {/* 8. Amazon販売価格 */}
      <td className="px-2 py-1 bg-background text-foreground">
        {asinInput.length === 10
          ? isLoadingFee
            ? "取得中…"
            : feeInfo?.price !== undefined
              ? `${feeInfo.price.toLocaleString()}円`
              : "-"
          : "-"}
      </td>
      
      {/* 9. 販売手数料 */}
      <td className="px-2 py-1 bg-background text-foreground">
        {asinInput.length === 10
          ? isLoadingFee
            ? "取得中…"
            : feeInfo?.sellingFee !== undefined
              ? `${feeInfo.sellingFee}%`
              : "-"
          : "-"}
      </td>
      
      {/* 10. FBA手数料 */}
      <td className="px-2 py-1 bg-background text-foreground">
        {isLoadingFee
          ? "取得中…"
          : feeInfo && feeInfo.fbaFee !== undefined
            ? `${feeInfo.fbaFee.toLocaleString()}円`
            : "-"}
      </td>
      
      {/* 11. 利益額 */}
      <td className="px-2 py-1 bg-background text-foreground">
        {isLoadingFee
          ? "取得中…"
          : profitResult
            ? (
              <span className={profitResult.profit >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {profitResult.profit.toLocaleString()}円
              </span>
            )
            : "-"}
      </td>
      
      {/* 12. 利益率 */}
      <td className="px-2 py-1 bg-background text-foreground">
        {isLoadingFee
          ? "取得中…"
          : profitResult
            ? (
              <span className={profitResult.profitMargin >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {Math.round(profitResult.profitMargin)}%
              </span>
            )
            : "-"}
      </td>

      {/* 13. ROI */}
      <td className="px-2 py-1 bg-background text-foreground">
        {isLoadingFee
          ? "取得中…"
          : profitResult
            ? (
              <span className={profitResult.roi >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {Math.round(profitResult.roi)}%
              </span>
            )
            : "-"}
      </td>
      
      {/* 14. 非表示 */}
      <td className="px-2 py-1 bg-background text-foreground">
        <input
          type="checkbox"
          checked={!!product.hidden}
          onChange={(e) => onHiddenChange(_rowIndex, e.target.checked)}
        />
      </td>
      
      {/* 15. メモ */}
      <td className="px-2 py-1 bg-background text-foreground">
        {isLoadingFee ? (
          "取得中…"
        ) : (
          <input
            type="text"
            className="border px-1 py-0.5 rounded w-28 bg-white text-black"
            value={feeInfo?.note ?? ""}
            readOnly
          />
        )}
      </td>
    </tr>
  );
};