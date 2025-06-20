"use client";
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FeeInfo, fetchKeepaData } from "@/app/api/keepa/route";
import { Product } from "@/types/product";

interface ProductTableProps {
  products: Product[];
  category: string;
  shopName: string;
}

export function ProductTable({ products: initialProducts, category, shopName }: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [feeInfos, setFeeInfos] = useState<FeeInfo[]>(
    Array(initialProducts.length).fill(undefined)
  );
  const [asinInputs, setAsinInputs] = useState(initialProducts.map((p) => p.asin || ""));
  const [loadingIndexes, setLoadingIndexes] = useState<number[]>([]);

  const handleAsinChange = (index: number, value: string) => {
    const upper = value.toUpperCase();
    const filtered = upper.replace(/[^A-Z0-9]/g, "").slice(0, 10);
    const newInputs = [...asinInputs];
    newInputs[index] = filtered;
    setAsinInputs(newInputs);
  };

  const handleAsinBlur = async (index: number) => {
    const asin = asinInputs[index];
    setProducts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], asin };
      return next;
    });

    // サーバーAPIにASINを保存
    if (asin.length === 10) {
      await fetch(`/api/products/${category}/${shopName}/update-asin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index, asin }),
      });

      setLoadingIndexes((prev) => [...prev, index]);
      const keepaInfo = await fetchKeepaData(asin);
      setFeeInfos((prev) => {
        const next = [...prev];
        next[index] = keepaInfo;
        return next;
      });
      setLoadingIndexes((prev) => prev.filter((i) => i !== index));
    }
  };

  // 非表示フラグの切り替え
  const handleHiddenChange = async (index: number, newHidden: boolean) => {
    setProducts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index]};
      return next;
    });

    // サーバーAPIにhiddenの変更を保存
    await fetch(`/api/products/${category}/${shopName}/update-hidden`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, hidden: newHidden }),
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full glass-card shadow-lg text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1 border-b text-left gradient-primary text-white font-semibold">
              画像
            </th>
            <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">商品名</th>
            <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">価格</th>
            <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">ASIN</th>
            <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">
              月間販売個数
            </th>
            <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">
              Amazon販売価格
            </th>
            <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">
              販売手数料
            </th>
            <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">
              FBA手数料
            </th>
            <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">利益額</th>
            <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">利益率</th>
            <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">ROI</th>
            <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">非表示</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => {
            const fee = feeInfos[i];
            const isLoading = loadingIndexes.includes(i);
            return (
              <tr key={i} className="border-b transition hover:bg-white/10">
                <td className="px-2 py-1">
                  <Avatar className="w-20 h-20 rounded-none">
                    {p.imageUrl ? (
                      <AvatarImage
                        src={p.imageUrl}
                        alt={p.name}
                        className="object-contain border border-white/20 bg-black/10 rounded-none"
                      />
                    ) : (
                      <AvatarFallback className="text-[10px]">No</AvatarFallback>
                    )}
                  </Avatar>
                </td>
                <td className="px-2 py-1 text-foreground">{p.name}</td>
                <td className="px-2 py-1">
                  {p.salePrice ? (
                    <>
                      <span className="line-through text-gray-400 mr-1">{p.price}円</span>
                      <span className="text-red-400 font-bold">{p.salePrice}円</span>
                    </>
                  ) : (
                    <span className="text-foreground">{p.price}円</span>
                  )}
                </td>
                <td className="px-2 py-1">
                  <input
                    type="text"
                    className="border px-1 py-0.5 rounded w-28 bg-white text-black"
                    value={asinInputs[i]}
                    maxLength={10}
                    onChange={(e) => handleAsinChange(i, e.target.value)}
                    onBlur={() => handleAsinBlur(i)}
                    placeholder="ASIN"
                    pattern="[A-Z0-9]{10}"
                    inputMode="text"
                    autoComplete="off"
                    required
                    title="ASINは大文字半角英数字10桁で入力してください"
                  />
                </td>
                <td className="px-2 py-1 text-foreground">
                  {isLoading
                    ? "取得中…"
                    : fee && fee.monthlySales !== undefined
                    ? `${fee.monthlySales}個`
                    : "-"}
                </td>
                <td className="px-2 py-1 text-foreground">
                  {isLoading
                    ? "取得中…"
                    : fee && fee.amazonPrice !== undefined
                    ? `${fee.amazonPrice}円`
                    : "-"}
                </td>
                <td className="px-2 py-1 text-foreground">
                  {isLoading
                    ? "取得中…"
                    : fee && fee.salesFee !== undefined
                    ? `${fee.salesFee}円`
                    : "-"}
                </td>
                <td className="px-2 py-1 text-foreground">
                  {isLoading
                    ? "取得中…"
                    : fee && fee.fbaFee !== undefined
                    ? `${fee.fbaFee}円`
                    : "-"}
                </td>
                <td className="px-2 py-1 text-foreground">
                  {isLoading
                    ? "取得中…"
                    : fee && fee.profit !== undefined
                    ? `${fee.profit}円`
                    : "-"}
                </td>
                <td className="px-2 py-1 text-foreground">
                  {isLoading
                    ? "取得中…"
                    : fee && fee.profitRate !== undefined
                    ? `${fee.profitRate}%`
                    : "-"}
                </td>
                <td className="px-2 py-1 text-foreground">
                  {isLoading ? "取得中…" : fee && fee.roi !== undefined ? `${fee.roi}%` : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}



