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
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <Settings className="w-4 h-4 text-gray-500" />
      <span className="text-sm text-gray-600">追加割引:</span>
      
      {isEditing ? (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-16 h-6 text-xs"
            min="0"
            max="50"
            step="0.1"
          />
          <span className="text-xs text-gray-500">%</span>
          <Button
            size="sm"
            onClick={handleSave}
            className="h-6 px-2 text-xs"
          >
            保存
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="h-6 px-2 text-xs"
          >
            キャンセル
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{currentDiscount}%</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-6 px-2 text-xs"
          >
            編集
          </Button>
        </div>
      )}
    </div>
  );
};