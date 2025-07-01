// src/components/product-list/MultipleAsinManager.tsx
import React, { useState } from "react";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AsinInfo, ShopPricingConfig, UserDiscountSettings } from "@/types/product";

interface MultipleAsinManagerProps {
  productIndex: number;
  productPrice: number;
  productSalePrice?: number;
  asins: AsinInfo[];
  onAsinAdd: (productIndex: number, asin: string) => void;
  onAsinRemove: (productIndex: number, asinIndex: number) => void;
  onDangerousGoodsChange: (productIndex: number, asinIndex: number, isDangerous: boolean) => void;
  onPartnerCarrierChange: (productIndex: number, asinIndex: number, isUnavailable: boolean) => void;
  shopPricingConfig?: ShopPricingConfig;
  userDiscountSettings?: UserDiscountSettings;
  isLoading?: boolean;
}

export const MultipleAsinManager: React.FC<MultipleAsinManagerProps> = ({
  productIndex,
  asins,
  onAsinAdd,
  isLoading = false,
}) => {
  const [newAsin, setNewAsin] = useState("");
  const [isAddingAsin, setIsAddingAsin] = useState(false);

  // ASIN追加処理
  const handleAddAsin = async () => {
    if (newAsin.length === 10) {
      setIsAddingAsin(true);
      await onAsinAdd(productIndex, newAsin);
      setNewAsin("");
      setIsAddingAsin(false);
    }
  };

  // ASIN入力の検証とフォーマット
  const handleAsinInputChange = (value: string) => {
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    setNewAsin(formatted);
  };

  return (
    <div className="space-y-2">
      {/* ASIN追加フォーム */}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={newAsin}
          onChange={(e) => handleAsinInputChange(e.target.value)}
          placeholder="新しいASIN"
          className="w-28 h-8 text-xs"
          maxLength={10}
        />
        <Button
          size="sm"
          onClick={handleAddAsin}
          disabled={newAsin.length !== 10 || isAddingAsin}
          className="h-8 px-2 text-xs"
        >
          {isAddingAsin ? (
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* ASIN数表示 */}
      {asins.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Package className="w-3 h-3" />
          <span>{asins.length}個のASIN</span>
        </div>
      )}

      {/* ローディング状態 */}
      {isLoading && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          ASIN情報取得中...
        </div>
      )}
    </div>
  );
};