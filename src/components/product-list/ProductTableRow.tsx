// src/components/product-list/ProductTableRow.tsx
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Product, AsinInfo } from "@/types/product";

interface Props {
  product: Product;
  rowIndex: number;
  asinInput: string;
  feeInfo?: AsinInfo;
  isLoadingFee: boolean;
  onAsinChange: (_rowIndex: number, _value: string) => void;
  onAsinBlur: (_rowIndex: number) => void;
  onHiddenChange: (_rowIndex: number, _checked: boolean) => void;
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
}) => {
  return (
    <tr className="border-b transition hover:bg-white/10">
      {/* 1. 画像 */}
      <td className="px-2 py-1">
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
      <td className="px-2 py-1 text-foreground">{product.name}</td>
      {/* 3. 価格 */}
      <td className="px-2 py-1">
        {product.salePrice ? (
          <>
            <span className="line-through text-gray-400 mr-1">{product.price}円</span>
            <span className="text-red-400 font-bold">{product.salePrice}円</span>
          </>
        ) : (
          <span className="text-foreground">{product.price}円</span>
        )}
      </td>
      {/* 4. Amazon商品名 */}
      <td className="px-2 py-1 text-foreground">
        {isLoadingFee ? "取得中…" : feeInfo && feeInfo.productName ? feeInfo.productName : "-"}
      </td>
      {/* 5. ASIN */}
      <td className="px-2 py-1">
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
      {/* 6. 月間販売個数 */}
      <td className="px-2 py-1 text-foreground">
        {isLoadingFee
          ? "取得中…"
          : feeInfo && feeInfo.soldUnit !== undefined
            ? `${feeInfo.soldUnit}個`
            : "-"}
      </td>
      {/* 7. Amazon販売価格 */}
      <td className="px-2 py-1 text-foreground">
        {isLoadingFee
          ? "取得中…"
          : feeInfo && feeInfo.price !== undefined
            ? `${feeInfo.price}円`
            : "-"}
      </td>
      {/* 8. 販売手数料 */}
      <td className="px-2 py-1 text-foreground">
        {isLoadingFee
          ? "取得中…"
          : feeInfo && feeInfo.sellingFee !== undefined
            ? `${feeInfo.sellingFee}円`
            : "-"}
      </td>
      {/* 9. FBA手数料 */}
      <td className="px-2 py-1 text-foreground">
        {isLoadingFee
          ? "取得中…"
          : feeInfo && feeInfo.fbaFee !== undefined
            ? `${feeInfo.fbaFee}円`
            : "-"}
      </td>
      {/* 10. 利益額 */}
      <td className="px-2 py-1 text-foreground">
        {isLoadingFee
          ? "取得中…"
          : feeInfo &&
              feeInfo.price !== undefined &&
              feeInfo.sellingFee !== undefined &&
              feeInfo.fbaFee !== undefined
            ? `${feeInfo.price - feeInfo.sellingFee - feeInfo.fbaFee}円`
            : "-"}
      </td>
      {/* 11. 利益率 */}
      <td className="px-2 py-1 text-foreground">
        {isLoadingFee
          ? "取得中…"
          : feeInfo &&
              feeInfo.price !== undefined &&
              feeInfo.sellingFee !== undefined &&
              feeInfo.fbaFee !== undefined
            ? `${Math.round(
                ((feeInfo.price - feeInfo.sellingFee - feeInfo.fbaFee) / feeInfo.price) * 100,
              )}%`
            : "-"}
      </td>
      {/* 12. ROI */}
      <td className="px-2 py-1 text-foreground">
        {isLoadingFee
          ? "取得中…"
          : feeInfo &&
              feeInfo.price !== undefined &&
              feeInfo.sellingFee !== undefined &&
              feeInfo.fbaFee !== undefined
            ? `${Math.round(
                ((feeInfo.price - feeInfo.sellingFee - feeInfo.fbaFee) / feeInfo.price) * 100,
              )}%`
            : "-"}
      </td>
      {/* 13. 非表示 */}
      <td className="px-2 py-1 text-foreground">
        <input
          type="checkbox"
          checked={!!product.hidden}
          onChange={(e) => onHiddenChange(_rowIndex, e.target.checked)}
        />
      </td>
      {/* 14. メモ */}
      <td className="px-2 py-1 text-foreground">
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
