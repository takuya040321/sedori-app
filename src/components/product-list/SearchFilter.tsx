"use client";

import { motion } from "framer-motion";
import { Search, Filter, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: "name" | "price" | "updated";
  onSortChange: (value: "name" | "price" | "updated") => void;
  filterBy: "all" | "sale" | "regular";
  onFilterChange: (value: "all" | "sale" | "regular") => void;
  totalCount: number;
}

export function SearchFilter({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  totalCount,
}: SearchFilterProps) {
  const sortOptions = [
    { value: "updated" as const, label: "更新日時" },
    { value: "name" as const, label: "商品名" },
    { value: "price" as const, label: "価格" },
  ];

  const filterOptions = [
    { value: "all" as const, label: "すべて" },
    { value: "sale" as const, label: "セール中" },
    { value: "regular" as const, label: "通常価格" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 space-y-4"
    >
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="商品名で検索..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white/5 border-white/20 focus:border-blue-400"
        />
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <SortAsc className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">並び順:</span>
          <div className="flex gap-1">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={sortBy === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => onSortChange(option.value)}
                className={sortBy === option.value ? "gradient-primary" : "hover:bg-white/10"}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Filter Options */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">フィルター:</span>
          <div className="flex gap-1">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filterBy === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => onFilterChange(option.value)}
                className={filterBy === option.value ? "gradient-secondary" : "hover:bg-white/10"}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="ml-auto">
          <Badge variant="outline" className="border-white/20">
            {totalCount}件の商品
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}
