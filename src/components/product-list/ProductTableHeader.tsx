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


  return (
    <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
      <tr>
        <SortableHeader field="name" className="w-20">
          <span>画像</span>
        </SortableHeader>
        <SortableHeader field="name" className="min-w-[200px]">
          <span>商品名</span>
        </SortableHeader>
        <SortableHeader field="price" className="w-24">
          <span>価格</span>
        </SortableHeader>
        <SortableHeader field="purchasePrice" className="w-32">
          <span>仕入価格</span>
        </SortableHeader>
        <SortableHeader field="asin" className="w-32">
          <span>ASIN</span>
        </SortableHeader>
        <SortableHeader field="amazonProductName" className="w-60">
          <span>Amazon商品名</span>
        </SortableHeader>
        <SortableHeader field="amazonPrice" className="w-24">
          <span>Amazon価格</span>
        </SortableHeader>
        <SortableHeader field="soldUnit" className="w-20">
          <span>月販数</span>
        </SortableHeader>
        <SortableHeader field="sellingFee" className="w-20">
          <span>手数料</span>
        </SortableHeader>
        <SortableHeader field="fbaFee" className="w-20">
          <span>FBA料</span>
        </SortableHeader>
        <SortableHeader field="profit" className="w-24">
          <span>利益額</span>
        </SortableHeader>
        <SortableHeader field="profitMargin" className="w-20">
          <span>利益率</span>
        </SortableHeader>
        <SortableHeader field="roi" className="w-20">
          <span>ROI</span>
        </SortableHeader>
        <SortableHeader field="isDangerousGoods" className="w-16">
          <span>危険物</span>
        </SortableHeader>
        <SortableHeader field="isPartnerCarrierUnavailable" className="w-16">
          <span>ﾊﾟｰｷｬﾘ</span>
        </SortableHeader>
        <SortableHeader field="hasOfficialStore" className="w-16">
          <span>公式有無</span>
        </SortableHeader>
        <SortableHeader field="hasAmazonStore" className="w-16">
          <span>Amazon有無</span>
        </SortableHeader>
        <SortableHeader field="complaintCount" className="w-16">
          <span>苦情回数</span>
        </SortableHeader>
        <SortableHeader field="hidden" className="w-16">
          <span>非表示</span>
        </SortableHeader>
        <SortableHeader field="memo" className="w-32">
          <span>メモ</span>
        </SortableHeader>
      </tr>
    </thead>
  );
};