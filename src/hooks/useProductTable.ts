// src/hooks/useProductTable.ts
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Product, AsinInfo } from "@/types/product";
import { fetchASINInfo } from "@/lib/fetchASINInfo";

export function useProductTable(category: string, shopName: string, initialProducts: Product[]) {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data, isLoading, mutate } = useSWR(`/api/products/${category}/${shopName}`, fetcher, {
    fallbackData: { data: { products: initialProducts } },
  });

  const products: Product[] = data?.data?.products ?? [];
  const [feeInfos, setFeeInfos] = useState<(AsinInfo | undefined)[]>([]);
  const [asinInputs, setAsinInputs] = useState<string[]>([]);
  const [loadingIndexes, setLoadingIndexes] = useState<number[]>([]);

  useEffect(() => {
    setAsinInputs(products.map((p) => (p.asins && p.asins[0]?.asin) || ""));
    setFeeInfos(Array(products.length).fill(undefined));
  }, [products]);

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
      await fetch(`/api/products/${category}/${shopName}/upload-asin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index: _rowIndex, asin }),
      });
      setLoadingIndexes((prev) => [...prev, _rowIndex]);
      
      // ブランド名をショップ名から推定（実際の実装では適切なブランドマッピングが必要）
      const brand = shopName === "vt-cosmetics" ? "vt-cosmetics" : "dhc";
      
      try {
        const keepaInfo = await fetchASINInfo(asin, brand);
        setFeeInfos((prev) => {
          const next = [...prev];
          next[_rowIndex] = keepaInfo;
          return next;
        });
      } catch (error) {
        console.error("Failed to fetch ASIN info:", error);
        setFeeInfos((prev) => {
          const next = [...prev];
          next[_rowIndex] = undefined;
          return next;
        });
      } finally {
        setLoadingIndexes((prev) => prev.filter((i) => i !== _rowIndex));
      }
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