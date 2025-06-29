// src/components/product-list/ProductTableHeader.tsx
import React from "react";

export const ProductTableHeader: React.FC = () => (
  <thead>
    <tr>
      <th className="w-20">画像</th>
      <th className="min-w-[200px]">商品名</th>
      <th className="w-24">価格</th>
      <th className="w-32">仕入価格</th>
      <th className="min-w-[150px]">Amazon商品名</th>
      <th className="w-24">ASIN</th>
      <th className="w-20">月販数</th>
      <th className="w-24">Amazon価格</th>
      <th className="w-20">手数料</th>
      <th className="w-20">FBA料</th>
      <th className="w-20">利益額</th>
      <th className="w-16">利益率</th>
      <th className="w-16">ROI</th>
      <th className="w-16">非表示</th>
      <th className="w-20">メモ</th>
    </tr>
  </thead>
);