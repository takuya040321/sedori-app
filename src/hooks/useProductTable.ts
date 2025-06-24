// src/hooks/useProductTable.ts
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Product, AsinInfo } from "@/types/product";

export function useProductTable(category: string, shopName: string, initialProducts: Product[]) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, isLoading, mutate } = useSWR(`/api/products/${category}/${shopName}`, fetcher, {
    fallbackData: { data: { products: initialProducts } },
  });

  const products: Product[] = data?.data?.products ?? [];
  const [feeInfos, setFeeInfos] = useState<(AsinInfo | undefined)[]>([]);
  const [asinInputs, setAsinInputs] = useState<string[]>([]);
  const [loadingIndexes, setLoadingIndexes] = useState<number[]>([]);

  // 商品データ取得時、asins[0]?.asinがあれば詳細データも取得
  useEffect(() => {
    setAsinInputs(
      products.map((p) =>
        Array.isArray(p.asins) && typeof p.asins[0]?.asin === "string" ? p.asins[0].asin : "",
      ),
    );
    setFeeInfos(Array(products.length).fill(undefined));

    // asinがある商品の詳細データを一括取得
    async function fetchAllAsinInfos() {
      const infos: (AsinInfo | undefined)[] = await Promise.all(
        products.map(async (p) => {
          const asin =
            Array.isArray(p.asins) && typeof p.asins[0]?.asin === "string" ? p.asins[0].asin : "";
          if (asin && asin.length === 10) {
            try {
              const res = await fetch(`/api/asin-info?brand=${shopName}&asin=${asin}`);
              if (res.ok) {
                return await res.json();
              }
            } catch (e) {
              // エラー時はundefined
            }
          }
          return undefined;
        }),
      );
      setFeeInfos(infos);
    }

    if (products.length > 0) {
      fetchAllAsinInfos();
    }
  }, [products, shopName]);

  const handleAsinChange = (_rowIndex: number, value: string) => {
    const upper = value.toUpperCase();
    const filtered = upper.replace(/[^A-Z0-9]/g, "").slice(0, 10);
    const newInputs = [...asinInputs];
    newInputs[_rowIndex] = filtered;
    setAsinInputs(newInputs);
  };

  const handleAsinBlur = async (_rowIndex: number) => {
    const asin = asinInputs[_rowIndex];
    if (asin.length === 10) {
      await fetch(`/api/products/${category}/${shopName}/update-asin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: _rowIndex, asin }),
      });
      setLoadingIndexes((prev) => [...prev, _rowIndex]);
      // サーバーAPI経由でASIN情報を取得
      const res = await fetch(`/api/asin-info?brand=${shopName}&asin=${asin}`);
      let keepaInfo: AsinInfo | undefined = undefined;
      if (res.ok) {
        keepaInfo = await res.json();
      }
      setFeeInfos((prev) => {
        const next = [...prev];
        next[_rowIndex] = keepaInfo;
        return next;
      });
      setLoadingIndexes((prev) => prev.filter((i) => i !== _rowIndex));
    }
  };

  const handleHiddenChange = (_rowIndex: number, _checked: boolean) => {
    fetch(`/api/products/${category}/${shopName}/update-hidden`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: _rowIndex, hidden: _checked }),
    }).then(() => mutate());
  };

  return {
    products,
    isLoading,
    mutate,
    feeInfos,
    asinInputs,
    loadingIndexes,
    handleAsinChange,
    handleAsinBlur,
    handleHiddenChange,
  };
}
