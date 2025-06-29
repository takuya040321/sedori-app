// src\components\product-list\ProductTable.tsx
import React, { forwardRef, useImperativeHandle } from "react";
import { Product } from "@/types/product";
import { useProductTable } from "@/hooks/useProductTable";
import { ProductTableRow } from "./ProductTableRow";
import { ProductTableHeader } from "./ProductTableHeader";

export interface ProductTableProps {
  category: string;
  shopName: string;
  initialProducts: Product[];
}

// 外部から呼び出したいメソッドを定義
export interface ProductTableHandle {
  mutate: () => void;
}

export const ProductTable = forwardRef<ProductTableHandle, ProductTableProps>(
  ({ category, shopName, initialProducts }, ref) => {
    const {
      products,
      isLoading,
      feeInfos,
      asinInputs,
      loadingIndexes,
      handleAsinChange,
      handleAsinBlur,
      handleHiddenChange,
      mutate, // ← useProductTable内でmutateを返すようにしてください
    } = useProductTable(category, shopName, initialProducts);

    // ref経由でmutate関数を外部公開
    useImperativeHandle(ref, () => ({
      mutate,
    }));

    if (isLoading) {
      return <div>Loading products...</div>;
    }

    return (
      <div className="w-full overflow-x-auto overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <ProductTableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product, index) => (
              <ProductTableRow
                key={product.name}
                product={product}
                rowIndex={index}
                asinInput={asinInputs[index] || ""}
                feeInfo={feeInfos[index]}
                isLoadingFee={loadingIndexes.includes(index)}
                onAsinChange={handleAsinChange}
                onAsinBlur={handleAsinBlur}
                onHiddenChange={handleHiddenChange}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

ProductTable.displayName = "ProductTable";
