// src/components/product-list/ProductTableHeader.tsx
import React from "react";

export const ProductTableHeader: React.FC = () => (
  <thead>
    <tr>
      <th className="sticky top-0 z-10 px-2 py-1 border-b text-left gradient-primary text-white font-semibold w-20">
        画像
      </th>
      <th className="sticky top-0 z-10 px-2 py-1 border-b gradient-primary text-white font-semibold min-w-[200px]">
        商品名
      </th>
      <th className="sticky top-0 z-10 px-2 py-1 border-b gradient-primary text-white font-semibold w-24">
        価格
      </th>
      <th className="sticky top-0 z-10 px-2 py-1 border-b gradient-primary text-white font-semibold w-32">
        仕入価格
      </th>
      <th className="sticky top-0 z-10 px-2 py-1 border-b gradient-primary text-white font-semibold min-w-[150px]">
        Amazon商品名
      </th>
      <th className="sticky top-0 z-10 px-2 py-1 border-b gradient-primary text-white font-semibold w-24">
        ASIN
      </th>
      <th className="sticky top-0 z-10 px-2 py-1 border-b gradient-primary text-white font-semibold w-20">
        月販数
      </th>
      <th className="sticky top-0 z-10 px-2 py-1 border-b gradient-primary text-white font-semibold w-24">
        Amazon価格
      </th>
      <th className="sticky top-0 z-10 px-2 py-1 border-b gradient-primary text-white font-semibold w-20">
        手数料
      </th>
      <th className="sticky top-0 z-10 px-2 py-1 border-b gradient-primary text-white font-semibold w-20">
        FBA料
      </th>
      <th className="sticky top-0 z-10 px-2 py-1 border-b gradient-primary text-white font-semibold w-20">
        利益額
      </th>
      <th className="sticky top-0 z-10 px-2 py-1 border-b gradient-primary text-white font-semibold w-16">
        利益率
      </th>
      <th className="sticky top-0 z-10 px-2 py-1 border-b gradient-primary text-white font-semibold w-16">
        ROI
      </th>
      <th className="sticky top-0 z-10 px-2 py-1 border-b gradient-primary text-white font-semibold w-16">
        非表示
      </th>
      <th className="sticky top-0 z-10 px-2 py-1 border-b gradient-primary text-white font-semibold w-20">
        メモ
      </th>
    </tr>
  </thead>
);