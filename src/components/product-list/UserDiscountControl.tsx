// src/components/product-list/UserDiscountControl.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface UserDiscountControlProps {
  shopKey: string;
  currentDiscount: number;
  onDiscountChange: (shopKey: string, discount: number) => void;
  disabled?: boolean;
}

export const UserDiscountControl: React.FC<UserDiscountControlProps> = ({
  shopKey,
  currentDiscount,
  onDiscountChange,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(currentDiscount.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    const discount = parseFloat(inputValue) || 0;
    if (discount >= 0 && discount <= 50) { // 最大50%まで
      onDiscountChange(shopKey, discount);
      setIsEditing(false);
    } else {
      alert("割引率は0%から50%の間で入力してください");
      setInputValue(currentDiscount.toString());
    }
  };

  const handleCancel = () => {
    setInputValue(currentDiscount.toString());
    setIsEditing(false);
  };

  if (disabled) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      <Settings className="w-4 h-4 text-blue-600" />
      <span className="text-sm font-medium text-gray-700">追加割引:</span>
      
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-20 h-8 text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
            min="0"
            max="50"
            step="0.1"
          />
          <span className="text-sm text-gray-600">%</span>
          <Button
            size="sm"
            onClick={handleSave}
            className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            保存
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            className="h-8 px-3 text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {currentDiscount}%
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="h-8 px-3 text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            編集
          </Button>
        </div>
      )}
    </div>
  );
};