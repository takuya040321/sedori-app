// src/components/product-list/ProductTableHeader.tsx
import React from "react";

export const ProductTableHeader: React.FC = () => (
  <thead>
    <tr>
      <th className="px-2 py-1 border-b text-left gradient-primary text-white font-semibold">
        画像
      </th>
      <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">商品名</th>
      <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">価格</th>
      <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">Amazon商品名</th>
      <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">ASIN</th>
      <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">月間販売個数</th>
      <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">
        Amazon販売価格
      </th>
      <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">販売手数料</th>
      <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">FBA手数料</th>
      <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">利益額</th>
      <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">利益率</th>
      <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">ROI</th>
      <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">非表示</th>
      <th className="px-2 py-1 border-b gradient-primary text-white font-semibold">メモ</th>
    </tr>
  </thead>
);
