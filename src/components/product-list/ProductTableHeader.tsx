// src/components/product-list/ProductTableHeader.tsx
import React from "react";

export const ProductTableHeader: React.FC = () => (
  <thead>
    <tr>
      <th className="w-20">画像</th>
      <th className="min-w-[200px]">商品名</th>
      <th className="w-24">価格</th>
      <th className="w-32">仕入価格</th>
      <th className="w-32">ASIN管理</th>
      <th className="w-16">危険物</th>
      <th className="w-16">非表示</th>
      <th className="w-32">メモ</th>
    </tr>
  </thead>
);