// src/components/product-list/MultipleAsinManager.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, AlertTriangle, Package, ChevronDown, ChevronUp, Truck, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AsinInfo, ShopPricingConfig, UserDiscountSettings } from "@/types/product";
import { calculateProfitWithShopPricing } from "@/lib/pricing-calculator";

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
  productPrice,
  productSalePrice,
  asins,
  onAsinAdd,
  onAsinRemove,
  onDangerousGoodsChange,
  onPartnerCarrierChange,
  shopPricingConfig,
  userDiscountSettings = {},
  isLoading = false,
}) => {
  const [newAsin, setNewAsin] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
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

  // 利益計算
  const calculateProfit = (asinInfo: AsinInfo) => {
    if (!shopPricingConfig || 
        asinInfo.price === undefined || 
        asinInfo.sellingFee === null || 
        asinInfo.fbaFee === null) {
      return null;
    }

    return calculateProfitWithShopPricing(
      productPrice,
      productSalePrice,
      asinInfo.price,
      asinInfo.sellingFee,
      asinInfo.fbaFee,
      shopPricingConfig,
      userDiscountSettings
    );
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

      {/* ASIN一覧 */}
      {asins.length > 0 && (
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-xs w-full justify-between"
          >
            <span>{asins.length}個のASIN</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 border border-gray-200 rounded-lg p-2 bg-gray-50"
              >
                {asins.map((asinInfo, asinIndex) => {
                  const profitResult = calculateProfit(asinInfo);
                  
                  // 背景色の決定
                  let bgColor = "bg-white border-gray-200";
                  if (asinInfo.isDangerousGoods && asinInfo.isPartnerCarrierUnavailable) {
                    bgColor = "bg-gradient-to-r from-red-50 to-orange-50 border-red-300";
                  } else if (asinInfo.isDangerousGoods) {
                    bgColor = "bg-red-50 border-red-200";
                  } else if (asinInfo.isPartnerCarrierUnavailable) {
                    bgColor = "bg-orange-50 border-orange-200";
                  }

                  // 手動入力が必要かチェック
                  const needsManualInput = !asinInfo.productName || asinInfo.price === 0 || 
                                         asinInfo.sellingFee === null || asinInfo.fbaFee === null;
                  
                  return (
                    <motion.div
                      key={asinInfo.asin}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className={`p-2 rounded border ${bgColor}`}
                    >
                      {/* ASIN基本情報 */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-medium text-blue-600">
                            {asinInfo.asin}
                          </span>
                          <div className="flex items-center gap-1">
                            {asinInfo.isDangerousGoods && (
                              <AlertTriangle className="w-3 h-3 text-red-500" title="危険物" />
                            )}
                            {asinInfo.isPartnerCarrierUnavailable && (
                              <Truck className="w-3 h-3 text-orange-500" title="パートナーキャリア不可" />
                            )}
                            {needsManualInput && (
                              <Edit className="w-3 h-3 text-amber-500" title="手動入力が必要" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* 危険物チェックボックス */}
                          <div className="flex flex-col items-center gap-1">
                            <input
                              type="checkbox"
                              checked={asinInfo.isDangerousGoods || false}
                              onChange={(e) => onDangerousGoodsChange(productIndex, asinIndex, e.target.checked)}
                              className="w-3 h-3 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              title="危険物"
                            />
                            <span className="text-xs text-gray-500">危険</span>
                          </div>
                          
                          {/* パートナーキャリア不可チェックボックス */}
                          <div className="flex flex-col items-center gap-1">
                            <input
                              type="checkbox"
                              checked={asinInfo.isPartnerCarrierUnavailable || false}
                              onChange={(e) => onPartnerCarrierChange(productIndex, asinIndex, e.target.checked)}
                              className="w-3 h-3 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                              title="パートナーキャリア不可"
                            />
                            <span className="text-xs text-gray-500">PC不可</span>
                          </div>
                          
                          {/* 削除ボタン */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAsinRemove(productIndex, asinIndex)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* 手動入力が必要な場合の警告 */}
                      {needsManualInput && (
                        <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                          <div className="flex items-center gap-1">
                            <Edit className="w-3 h-3" />
                            <span className="font-medium">手動入力が必要</span>
                          </div>
                          <div className="text-xs mt-1">
                            ASIN一括登録ページで詳細情報を入力してください
                          </div>
                        </div>
                      )}

                      {/* 商品情報 */}
                      <div className="text-xs text-gray-600 mb-2">
                        <div className="truncate" title={asinInfo.productName}>
                          {asinInfo.productName || "商品名未設定"}
                        </div>
                      </div>

                      {/* 価格・利益情報 */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Amazon価格:</span>
                          <div className="font-medium">
                            {asinInfo.price ? `${asinInfo.price.toLocaleString()}円` : "未設定"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">月販数:</span>
                          <div className="font-medium">
                            {asinInfo.soldUnit ? asinInfo.soldUnit.toLocaleString() : "-"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">手数料:</span>
                          <div className="font-medium">
                            {asinInfo.sellingFee !== null ? `${asinInfo.sellingFee}%` : "未設定"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">FBA料:</span>
                          <div className="font-medium">
                            {asinInfo.fbaFee !== null ? `${asinInfo.fbaFee.toLocaleString()}円` : "未設定"}
                          </div>
                        </div>
                      </div>

                      {/* 利益情報 */}
                      {profitResult && !needsManualInput && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">利益:</span>
                              <div className={`font-medium ${
                                profitResult.profit >= 0 ? "text-green-600" : "text-red-600"
                              }`}>
                                {profitResult.profit.toLocaleString()}円
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">利益率:</span>
                              <div className={`font-medium ${
                                profitResult.profitMargin >= 0 ? "text-green-600" : "text-red-600"
                              }`}>
                                {Math.round(profitResult.profitMargin)}%
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">ROI:</span>
                              <div className={`font-medium ${
                                profitResult.roi >= 0 ? "text-green-600" : "text-red-600"
                              }`}>
                                {Math.round(profitResult.roi)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 利益計算不可の場合 */}
                      {needsManualInput && (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                          利益計算には詳細情報の入力が必要です
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
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