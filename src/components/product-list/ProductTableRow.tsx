// src/components/product-list/ProductTableRow.tsx
import React, { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Product, AsinInfo, ShopPricingConfig, UserDiscountSettings } from "@/types/product";
import { calculateActualCost, calculateProfitWithShopPricing, shouldCalculateUnitPrice } from "@/lib/pricing-calculator";
import { AlertTriangle, Truck, Plus, Trash2, Edit, ExternalLink, Check, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  product: Product;
  rowIndex: number;
  asinInfo?: AsinInfo;
  asinIndex?: number;
  isFirstAsinRow?: boolean;
  onHiddenChange: (_rowIndex: number, _checked: boolean) => void;
  onMemoChange: (_rowIndex: number, _memo: string) => void;
  onAsinAdd: (_rowIndex: number, _asin: string) => void;
  onAsinRemove: (_rowIndex: number, _asinIndex: number) => void;
  onDangerousGoodsChange: (_rowIndex: number, _asinIndex: number, _checked: boolean) => void;
  onPartnerCarrierChange: (_rowIndex: number, _asinIndex: number, _checked: boolean) => void;
  onAsinInfoUpdate: (_rowIndex: number, _asinIndex: number, _field: keyof AsinInfo, _value: any) => void;
  onProductDuplicate: (_rowIndex: number) => void;
  onProductDelete: (_rowIndex: number) => void;
  shopPricingConfig?: ShopPricingConfig;
  userDiscountSettings?: UserDiscountSettings;
  isLoadingAsins?: boolean;
}

export const ProductTableRow: React.FC<Props> = ({
  product,
  rowIndex,
  asinInfo,
  asinIndex,
  isFirstAsinRow = true,
  onHiddenChange,
  onMemoChange,
  onAsinAdd,
  onAsinRemove,
  onDangerousGoodsChange,
  onPartnerCarrierChange,
  onAsinInfoUpdate,
  onProductDuplicate,
  onProductDelete,
  shopPricingConfig,
  userDiscountSettings = {},
  isLoadingAsins = false,
}) => {
  const [memoValue, setMemoValue] = useState(product.memo || "");
  const [newAsin, setNewAsin] = useState("");
  const [isAddingAsin, setIsAddingAsin] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});
  const [isImageHovered, setIsImageHovered] = useState(false);
  const memoTimeoutRef = useRef<NodeJS.Timeout>();

  // メモの変更をデバウンス処理
  const handleMemoChange = (value: string) => {
    setMemoValue(value);
    
    if (memoTimeoutRef.current) {
      clearTimeout(memoTimeoutRef.current);
    }
    
    memoTimeoutRef.current = setTimeout(() => {
      onMemoChange(rowIndex, value);
    }, 1000);
  };

  // 編集開始
  const startEditing = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValues({
      ...editValues,
      [field]: String(currentValue || "")
    });
  };

  // 編集保存
  const saveEdit = async (field: string) => {
    if (!asinInfo || asinIndex === undefined) return;
    
    const value = editValues[field];
    let convertedValue: any = value;
    
    // 型変換
    if (field === "price" || field === "soldUnit" || field === "sellingFee" || field === "fbaFee") {
      const numValue = parseFloat(value);
      convertedValue = isNaN(numValue) ? (field === "sellingFee" || field === "fbaFee" ? null : 0) : numValue;
    }
    
    await onAsinInfoUpdate(rowIndex, asinIndex, field as keyof AsinInfo, convertedValue);
    setEditingField(null);
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  // 編集可能フィールドのレンダリング
  const renderEditableField = (field: string, currentValue: any, placeholder: string = "", suffix: string = "") => {
    const isEditing = editingField === field;
    
    // 月販売数と苦情回数の特別処理：0の場合も"-"で表示
    let displayValue;
    if (field === "soldUnit" || field === "complaintCount") {
      displayValue = (currentValue === null || currentValue === undefined || currentValue === 0) ? "-" : 
                    (typeof currentValue === "number" ? currentValue.toLocaleString() : String(currentValue));
    } else {
      displayValue = currentValue === null || currentValue === undefined ? "-" : 
                    (typeof currentValue === "number" ? currentValue.toLocaleString() : String(currentValue));
    }
    
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={editValues[field] || ""}
            onChange={(e) => setEditValues({...editValues, [field]: e.target.value})}
            className="w-24 h-7 text-xs"
            placeholder={placeholder}
            step={field === "sellingFee" ? "0.1" : "1"}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit(field);
              if (e.key === "Escape") cancelEdit();
            }}
            autoFocus
          />
          <Button
            size="sm"
            onClick={() => saveEdit(field)}
            className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={cancelEdit}
            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      );
    }
    
    return (
      <div 
        className="cursor-pointer hover:bg-blue-50 p-1 rounded group flex items-center justify-center gap-1 min-h-[28px]"
        onClick={() => startEditing(field, currentValue)}
        title="クリックして編集"
      >
        <span className="text-xs font-medium">
          {displayValue}{suffix}
        </span>
        {displayValue !== "-" && (
          <Edit className="w-2 h-2 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
        )}
      </div>
    );
  };
  // 文字列を20文字で切り詰める関数
  const truncateText = (text: string, maxLength: number = 40) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // ASIN追加処理
  const handleAddAsin = async () => {
    if (newAsin.length === 10) {
      setIsAddingAsin(true);
      await onAsinAdd(rowIndex, newAsin);
      setNewAsin("");
      setIsAddingAsin(false);
    }
  };

  // ASIN入力の検証とフォーマット
  const handleAsinInputChange = (value: string) => {
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    setNewAsin(formatted);
  };

  // Amazon商品ページを開く
  const handleAmazonLinkClick = () => {
    if (asinInfo?.url) {
      window.open(asinInfo.url, '_blank', 'noopener,noreferrer');
    }
  };

  // 仕入価格表示の生成（1個あたり対応）
  const getPurchasePriceDisplay = () => {
    if (!shopPricingConfig) {
      return `${Math.round(product.salePrice || product.price).toLocaleString()}円`;
    }

    const actualCost = calculateActualCost(
      product.price,
      product.salePrice,
      shopPricingConfig,
      userDiscountSettings,
      product.name, // 商品名を渡して個数検出
      asinInfo?.productName // Amazon商品名も渡す
    );


    switch (shopPricingConfig.priceCalculationType) {
      case 'fixed_discount':
        return (
          <div className="text-center">
            <div className="font-medium text-blue-600 text-sm">
              {Math.round(actualCost).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              -{shopPricingConfig.fixedDiscount}円
            </div>
          </div>
        );

      case 'user_configurable':
        const shopKey = `${shopPricingConfig.category}-${shopPricingConfig.shopName}`;
        const baseDiscountRate = shopPricingConfig.percentageDiscount || 0;
        const userDiscountRate = userDiscountSettings[shopKey] || 0;
        const totalDiscountRate = baseDiscountRate + userDiscountRate;
        
        return (
          <div className="text-center">
            <div className="font-medium text-blue-600 text-sm">
              {Math.round(actualCost).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {userDiscountRate > 0 && (
                <div>({baseDiscountRate}%+{userDiscountRate}%)</div>
              ) || (
                <div>({baseDiscountRate}%)</div>
              )}
            </div>
          </div>
        );

      case 'percentage_discount':
        const discountRate = shopPricingConfig.percentageDiscount || 0;
        return (
          <div className="text-center">
            <div className="font-medium text-blue-600 text-sm">
              {Math.round(actualCost).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              ({discountRate}%)
            </div>
          </div>
        );

      default:
        return `${Math.round(actualCost).toLocaleString()}`;
    }
  };

  // 価格表示の生成（DHC複数個商品対応）
  const getPriceDisplay = () => {
    // DHCの場合、複数個商品の1個あたり価格を表示
    if (shopPricingConfig?.shopName === 'dhc') {
      const priceInfo = shouldCalculateUnitPrice(product.name, asinInfo?.productName || "");
      if (priceInfo.shouldCalculate) {
        const unitPrice = (product.salePrice || product.price) / priceInfo.productCount;
        
        if (product.salePrice) {
          return (
            <div>
              <div className="line-through text-gray-400 text-xs">
                {product.price.toLocaleString()}
              </div>
              <div className="text-red-400 font-bold text-sm">
                {product.salePrice.toLocaleString()}
              </div>
              <div className="text-blue-600 font-medium text-xs border-t border-gray-200 pt-1 mt-1">
                {Math.round(unitPrice).toLocaleString()}/{priceInfo.unitType}
              </div>
            </div>
          );
        } else {
          return (
            <div>
              <div className="text-sm">
                {product.price.toLocaleString()}
              </div>
              <div className="text-blue-600 font-medium text-xs border-t border-gray-200 pt-1 mt-1">
                {Math.round(unitPrice).toLocaleString()}/{priceInfo.unitType}
              </div>
            </div>
          );
        }
      }
    }
    
    // 従来の表示（DHC以外、または単品商品）
    if (product.salePrice) {
      return (
        <div>
          <div className="line-through text-gray-400 text-xs">
            {product.price.toLocaleString()}
          </div>
          <div className="text-red-400 font-bold text-sm">
            {product.salePrice.toLocaleString()}
          </div>
        </div>
      );
    } else {
      return (
        <div className="text-sm">{product.price.toLocaleString()}</div>
      );
    }
  };
  // 利益情報を計算（1個あたり対応）
  const getProfitInfo = () => {
    if (!asinInfo || !shopPricingConfig || asinInfo.price === 0 || 
        asinInfo.sellingFee === null || asinInfo.fbaFee === null) {
      return { profit: null, profitMargin: null, roi: null };
    }

    const profitResult = calculateProfitWithShopPricing(
      product.price,
      product.salePrice,
      asinInfo.price,
      asinInfo.sellingFee,
      asinInfo.fbaFee,
      shopPricingConfig,
      userDiscountSettings,
      product.name, // 商品名を渡して個数検出
      asinInfo?.productName // Amazon商品名も渡す
    );

    return {
      profit: profitResult.profit,
      profitMargin: profitResult.profitMargin,
      roi: profitResult.roi,
    };
  };

  const profitInfo = getProfitInfo();

  // 手動入力が必要かチェック
  const needsManualInput = asinInfo && (!asinInfo.productName || asinInfo.price === 0 || 
                          asinInfo.sellingFee === null || asinInfo.fbaFee === null);

  // 行のスタイル（危険物・パートナーキャリア不可の場合は色分け）
  let rowClassName = "border-b transition hover:bg-accent/30";
  
  if (asinInfo?.isDangerousGoods && asinInfo?.isPartnerCarrierUnavailable) {
    rowClassName += " bg-gradient-to-r from-red-50 to-orange-50";
  } else if (asinInfo?.isDangerousGoods) {
    rowClassName += " bg-red-50";
  } else if (asinInfo?.isPartnerCarrierUnavailable) {
    rowClassName += " bg-orange-50";
  } else {
    rowClassName += " bg-background text-foreground";
  }

  // 同じ商品の2行目以降は薄いボーダーで区別
  if (!isFirstAsinRow) {
    rowClassName += " border-l-4 border-l-blue-200";
  }

  return (
    <tr className={rowClassName}>
      {/* 1. 画像 - 最初の行のみ表示 */}
      <td className="px-2 py-1 w-16">
        {isFirstAsinRow ? (
          <div 
            className="relative"
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
          >
            <Avatar className="w-16 h-16 rounded-none">
              {product.imageUrl ? (
                <AvatarImage
                  src={product.imageUrl}
                  alt={product.name}
                  className="object-contain border border-white/20 bg-black/10 rounded-none"
                />
              ) : (
                <AvatarFallback className="text-[10px]">No</AvatarFallback>
              )}
            </Avatar>
            {(asinInfo?.isDangerousGoods || asinInfo?.isPartnerCarrierUnavailable) && (
              <div className="absolute -top-1 -right-1 flex gap-1">
                {asinInfo?.isDangerousGoods && (
                  <div className="bg-red-500 rounded-full p-1">
                    <AlertTriangle className="w-3 h-3 text-white" />
                  </div>
                )}
                {asinInfo?.isPartnerCarrierUnavailable && (
                  <div className="bg-orange-500 rounded-full p-1">
                    <Truck className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            )}
            
            {/* ホバー時の拡大画像 */}
            <AnimatePresence>
              {isImageHovered && product.imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-50 -top-4 -left-4 pointer-events-none"
                  style={{ zIndex: 1000 }}
                >
                  <div className="bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-2">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-64 h-64 object-contain"
                      style={{ maxWidth: '256px', maxHeight: '256px' }}
                    />
                    <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded max-w-64 break-words">
                      {product.name}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="w-16 h-16"></div>
        )}
      </td>
      
      {/* 2. 商品名 - 最初の行のみ表示 */}
      <td className="px-2 py-1 w-48 relative group cursor-default">
        {isFirstAsinRow ? (
          <div className="flex items-center gap-2">
            <div 
              className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-xs leading-tight" 
              title={product.name}
            >
              {truncateText(product.name, 40)}
            </div>
            {/* ホバー時の全文表示 */}
            {product.name.length > 40 && (
              <div className="absolute left-0 top-full mt-1 bg-gray-900 text-white text-xs p-2 rounded shadow-lg z-50 max-w-xs break-words opacity-0 group-hover:opacity-100 transition-opacity duration-75 pointer-events-none">
                {product.name}
              </div>
            )}
            {/* 商品複製ボタン */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onProductDuplicate(rowIndex)}
              className="h-5 w-5 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
              title="この商品を複製して追加ASINを登録"
            >
              <Copy className="w-3 h-3" />
            </Button>
            {/* 商品削除ボタン */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onProductDelete(rowIndex)}
              className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
              title="この商品を削除"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="text-gray-400 text-xs italic flex items-center gap-1">
            <Copy className="w-3 h-3" />
            複製商品
          </div>
        )}
      </td>
      
      {/* 3. 価格 - 最初の行のみ表示 */}
      <td className="px-2 py-1 text-center w-20">
        {isFirstAsinRow ? (
          getPriceDisplay()
        ) : null}
      </td>
      
      {/* 4. 仕入価格 - 最初の行のみ表示 */}
      <td className="px-2 py-1 w-24">
        {isFirstAsinRow ? getPurchasePriceDisplay() : null}
      </td>
      
      {/* 5. ASIN */}
      <td className="px-2 py-1 w-24">
        {asinInfo ? (
          <div className="flex items-center gap-2">
            <div className="font-mono text-blue-600 font-medium text-xs">
              {asinInfo.asin}
            </div>
            {asinIndex !== undefined && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAsinRemove(rowIndex, asinIndex)}
                className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-2 h-2" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={newAsin}
              onChange={(e) => handleAsinInputChange(e.target.value)}
              placeholder="新しいASIN"
              className="w-20 h-6 text-xs"
              maxLength={10}
            />
            <Button
              size="sm"
              onClick={handleAddAsin}
              disabled={newAsin.length !== 10 || isAddingAsin}
              className="h-6 px-1 text-xs"
            >
              {isAddingAsin ? (
                <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-2 h-2" />
              )}
            </Button>
          </div>
        )}
      </td>
      
      {/* 6. Amazon商品名 - 折り返し表示とクリック機能 */}
      <td className="px-2 py-1 w-52 relative group">
        {asinInfo ? (
          asinInfo.productName ? (
            <>
              <div
                className="max-w-[250px] cursor-pointer"
                onClick={handleAmazonLinkClick}
                title={`${asinInfo.productName}\nクリックでAmazonページを開く`}
              >
                <div className="text-xs leading-tight text-blue-600 hover:text-blue-800 hover:underline hover:bg-blue-50 p-1 rounded transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
                  {truncateText(asinInfo.productName, 40)}
                  <ExternalLink className="w-2 h-2 inline ml-1 opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>
              {/* ホバー時の全文表示 */}
              {asinInfo.productName.length > 40 && (
                <div className="absolute left-0 top-full mt-1 bg-gray-900 text-white text-xs p-2 rounded shadow-lg z-50 max-w-xs break-words opacity-0 group-hover:opacity-100 transition-opacity duration-75 pointer-events-none">
                  {asinInfo.productName}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1 text-amber-600">
              <Edit className="w-2 h-2" />
              <span className="text-xs">手動入力が必要</span>
            </div>
          )
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 7. Amazon価格 */}
      <td className="px-2 py-1 text-center w-20">
        {asinInfo ? (
          asinIndex !== undefined ? (
            renderEditableField("price", asinInfo.price, "0", "")
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 8. 月販数 */}
      <td className="px-2 py-1 text-center w-16">
        {asinInfo ? (
          asinIndex !== undefined ? (
            renderEditableField("soldUnit", asinInfo.soldUnit, "0", "")
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 9. 手数料 */}
      <td className="px-2 py-1 text-center w-16">
        {asinInfo ? (
          asinIndex !== undefined ? (
            renderEditableField("sellingFee", asinInfo.sellingFee, "15", "%")
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 10. FBA料 */}
      <td className="px-2 py-1 text-center w-16">
        {asinInfo ? (
          asinIndex !== undefined ? (
            renderEditableField("fbaFee", asinInfo.fbaFee, "300", "")
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 11. 利益額（1個あたり） */}
      <td className="px-2 py-1 text-center w-20">
        {profitInfo.profit !== null && !needsManualInput ? (
          <div className={`font-medium text-xs ${
            profitInfo.profit >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            {Math.round(profitInfo.profit).toLocaleString()}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 12. 利益率 */}
      <td className="px-2 py-1 text-center w-16">
        {profitInfo.profitMargin !== null && !needsManualInput ? (
          <div className={`font-medium text-xs ${
            profitInfo.profitMargin >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            {Math.round(profitInfo.profitMargin)}%
          </div>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 13. ROI */}
      <td className="px-2 py-1 text-center w-16">
        {profitInfo.roi !== null && !needsManualInput ? (
          <div className={`font-medium text-xs ${
            profitInfo.roi >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            {Math.round(profitInfo.roi)}%
          </div>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 14. 危険物 */}
      <td className="px-2 py-1 text-center w-14">
        {asinInfo && asinIndex !== undefined ? (
          <input
            type="checkbox"
            checked={asinInfo.isDangerousGoods || false}
            onChange={(e) => onDangerousGoodsChange(rowIndex, asinIndex, e.target.checked)}
            className="w-3 h-3 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 15. パートナーキャリア不可 */}
      <td className="px-2 py-1 text-center w-14">
        {asinInfo && asinIndex !== undefined ? (
          <input
            type="checkbox"
            checked={asinInfo.isPartnerCarrierUnavailable || false}
            onChange={(e) => onPartnerCarrierChange(rowIndex, asinIndex, e.target.checked)}
            className="w-3 h-3 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 16. 公式有無 */}
      <td className="px-2 py-1 text-center w-14">
        {asinInfo && asinIndex !== undefined ? (
          <input
            type="checkbox"
            checked={asinInfo.hasOfficialStore || false}
            onChange={(e) => onAsinInfoUpdate(rowIndex, asinIndex, "hasOfficialStore", e.target.checked)}
            className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 17. Amazon有無 */}
      <td className="px-2 py-1 text-center w-14">
        {asinInfo && asinIndex !== undefined ? (
          <input
            type="checkbox"
            checked={asinInfo.hasAmazonStore || false}
            onChange={(e) => onAsinInfoUpdate(rowIndex, asinIndex, "hasAmazonStore", e.target.checked)}
            className="w-3 h-3 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 18. 苦情回数 */}
      <td className="px-2 py-1 text-center w-14">
        {asinInfo ? (
          asinIndex !== undefined ? (
            renderEditableField("complaintCount", asinInfo.complaintCount, "0", "")
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>
      
      {/* 19. 非表示 - 最初の行のみ表示 */}
      <td className="px-2 py-1 text-center w-14">
        {isFirstAsinRow ? (
          <input
            type="checkbox"
            checked={!!product.hidden}
            onChange={(e) => onHiddenChange(rowIndex, e.target.checked)}
            className="w-3 h-3"
          />
        ) : null}
      </td>
      
      {/* 20. メモ - 最初の行のみ表示 */}
      <td className="px-2 py-1 w-28">
        {isFirstAsinRow ? (
          <input
            type="text"
            className="border px-1 py-0.5 rounded w-24 bg-white text-black text-xs"
            value={memoValue}
            onChange={(e) => handleMemoChange(e.target.value)}
            placeholder="メモ"
            title="商品メモ（自動保存）"
          />
        ) : null}
      </td>
    </tr>
  );
};