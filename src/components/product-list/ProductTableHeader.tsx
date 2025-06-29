// src/components/product-list/ProductTableHeader.tsx
import React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { SortField, SortDirection } from "@/types/product";

interface ProductTableHeaderProps {
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export const ProductTableHeader: React.FC<ProductTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      className="cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1 justify-center">
        {children}
        {getSortIcon(field)}
      </div>
    </th>
  );

  return (
    <thead>
      <tr>
        <th className="w-20">画像</th>
        <SortableHeader field="name">
          <span className="min-w-[200px] block">商品名</span>
        </SortableHeader>
        <SortableHeader field="price">
          <span className="w-24 block">価格</span>
        </SortableHeader>
        <th className="w-32">仕入価格</th>
        <th className="w-32">ASIN管理</th>
        <th className="w-16">危険物</th>
        <th className="w-16">パートナー<br />キャリア不可</th>
        <th className="w-16">非表示</th>
        <SortableHeader field="memo">
          <span className="w-32 block">メモ</span>
        </SortableHeader>
      </tr>
    </thead>
  );
};