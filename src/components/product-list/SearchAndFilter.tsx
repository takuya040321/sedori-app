// src/components/product-list/SearchAndFilter.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterSettings } from "@/types/product";

interface SearchAndFilterProps {
  filters: FilterSettings;
  onFiltersChange: (filters: FilterSettings) => void;
  totalCount: number;
  filteredCount: number;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const updateFilter = (key: keyof FilterSettings, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const updatePriceRange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    onFiltersChange({
      ...filters,
      priceRange: {
        ...filters.priceRange,
        [type]: numValue,
      },
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      showHiddenOnly: false,
      showDangerousGoods: false,
      showPartnerCarrierUnavailable: false,
      showProfitableOnly: false,
      priceRange: { min: null, max: null },
      hasAsin: null,
    });
  };

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.showHiddenOnly ||
    filters.showDangerousGoods ||
    filters.showPartnerCarrierUnavailable ||
    filters.showProfitableOnly ||
    filters.priceRange.min !== null ||
    filters.priceRange.max !== null ||
    filters.hasAsin !== null;

  return (
    <div className="minimal-card p-4 space-y-4">
      {/* 検索バー */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="商品名で検索..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          フィルター
          {isFilterExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </Button>

        <div className="text-sm text-gray-600">
          {filteredCount} / {totalCount} 件
        </div>
      </div>

      {/* フィルター詳細 */}
      <AnimatePresence>
        {isFilterExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 border-t pt-4"
          >
            {/* チェックボックスフィルター */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showHiddenOnly}
                  onChange={(e) => updateFilter('showHiddenOnly', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm">非表示商品のみを表示</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showDangerousGoods}
                  onChange={(e) => updateFilter('showDangerousGoods', e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm">危険物のみ表示</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showPartnerCarrierUnavailable}
                  onChange={(e) => updateFilter('showPartnerCarrierUnavailable', e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm">パートナーキャリア不可のみ</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showProfitableOnly}
                  onChange={(e) => updateFilter('showProfitableOnly', e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm">利益商品のみ表示</span>
              </label>
            </div>

            {/* 価格範囲フィルター */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">価格範囲:</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="最小"
                  value={filters.priceRange.min || ''}
                  onChange={(e) => updatePriceRange('min', e.target.value)}
                  className="w-24"
                />
                <span className="text-gray-500">〜</span>
                <Input
                  type="number"
                  placeholder="最大"
                  value={filters.priceRange.max || ''}
                  onChange={(e) => updatePriceRange('max', e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-gray-500">円</span>
              </div>
            </div>

            {/* ASIN有無フィルター */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">ASIN:</span>
              <div className="flex gap-2">
                <Button
                  variant={filters.hasAsin === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('hasAsin', null)}
                >
                  全て
                </Button>
                <Button
                  variant={filters.hasAsin === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('hasAsin', true)}
                >
                  ASINあり
                </Button>
                <Button
                  variant={filters.hasAsin === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('hasAsin', false)}
                >
                  ASINなし
                </Button>
              </div>
            </div>

            {/* フィルタークリア */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                  フィルターをクリア
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};