// src/hooks/useUserDiscountSettings.ts
import { useState, useEffect } from "react";
import { UserDiscountSettings } from "@/types/product";

const STORAGE_KEY = "shopscaper-user-discount-settings";

export function useUserDiscountSettings() {
  const [userDiscountSettings, setUserDiscountSettings] = useState<UserDiscountSettings>({});

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUserDiscountSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load user discount settings:", error);
    }
  }, []);

  // 設定を更新
  const updateDiscountSetting = (shopKey: string, discountRate: number) => {
    const newSettings = {
      ...userDiscountSettings,
      [shopKey]: discountRate,
    };
    
    setUserDiscountSettings(newSettings);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error("Failed to save user discount settings:", error);
    }
  };

  // 特定ショップの設定を取得
  const getDiscountSetting = (shopKey: string): number => {
    return userDiscountSettings[shopKey] || 0;
  };

  return {
    userDiscountSettings,
    updateDiscountSetting,
    getDiscountSetting,
  };
}