// src/components/product-list/ProductTable.tsx

import { Product } from "@/types/product";
import { useProductTable } from "@/hooks/useProductTable";
import { ProductTableRow } from "./ProductTableRow";

interface ProductTableProps {
  category: string;
  shopName: string;
  initialProducts: Product[];
}

export function ProductTable({ category, shopName, initialProducts }: ProductTableProps) {
  const {
    products,
    isLoading,
    feeInfos,
    asinInputs,
    loadingIndexes,
    handleAsinChange,
    handleAsinBlur,
    handleHiddenChange,
  } = useProductTable(category, shopName, initialProducts);

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              商品名
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ASIN
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              価格
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              手数料
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              利益
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              非表示
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product, index) => (
            <ProductTableRow
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
}
