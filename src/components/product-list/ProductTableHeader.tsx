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

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode; className?: string }> = ({ field, children, className = "" }) => (
    <th 
      className={`cursor-pointer hover:bg-gray-100 transition-colors resize-x overflow-hidden ${className}`}
      onClick={() => onSort(field)}
      style={{ minWidth: '80px' }}
    >
      <div className="flex items-center gap-1 justify-center">
        {children}
        {getSortIcon(field)}
      </div>
    </th>
  );

  const ResizableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <th className={`resize-x overflow-hidden ${className}`} style={{ minWidth: '80px' }}>
      <div className="flex items-center justify-center">
        {children}
      </div>
    </th>
  );

  return (
    <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
      <tr>
        <ResizableHeader className="w-20">画像</ResizableHeader>
        <SortableHeader field="name" className="min-w-[200px]">
          <span>商品名</span>
        </SortableHeader>
        <SortableHeader field="price" className="w-24">
          <span>価格</span>
        </SortableHeader>
        <ResizableHeader className="w-32">仕入価格</ResizableHeader>
        <ResizableHeader className="w-32">ASIN</ResizableHeader>
        <ResizableHeader className="w-60">Amazon商品名</ResizableHeader>
        <ResizableHeader className="w-24">Amazon価格</ResizableHeader>
        <ResizableHeader className="w-20">月販数</ResizableHeader>
        <ResizableHeader className="w-20">手数料</ResizableHeader>
        <ResizableHeader className="w-20">FBA料</ResizableHeader>
        <ResizableHeader className="w-24">利益額</ResizableHeader>
        <ResizableHeader className="w-20">利益率</ResizableHeader>
        <ResizableHeader className="w-20">ROI</ResizableHeader>
        <ResizableHeader className="w-16">危険物</ResizableHeader>
        <ResizableHeader className="w-16">ﾊﾟｰｷｬﾘ</ResizableHeader>
        <ResizableHeader className="w-16">非表示</ResizableHeader>
        <SortableHeader field="memo" className="w-32">
          <span>メモ</span>
        </SortableHeader>
      </tr>
    </thead>
  );
};