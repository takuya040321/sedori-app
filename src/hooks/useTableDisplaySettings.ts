// src/hooks/useTableDisplaySettings.ts
import { useState, useEffect } from "react";
import { FilterSettings } from "@/types/product";

const STORAGE_KEY = "shopscaper-table-display-settings";

const DEFAULT_SETTINGS: FilterSettings = {
  search: '',
  showHiddenOnly: false,
  showDangerousGoods: false,
  excludeDangerousGoods: false,
  showPartnerCarrierUnavailable: false,
  excludePartnerCarrierUnavailable: false,
  excludeOfficialStore: false,
  excludeAmazonStore: false,
  showProfitableOnly: false,
  priceRange: { min: null, max: null },
  hasAsin: null,
};

export function useTableDisplaySettings() {
  const [settings, setSettings] = useState<FilterSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<FilterSettings>(DEFAULT_SETTINGS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings(parsedSettings);
        setSavedSettings(parsedSettings);
      }
    } catch (error) {
      console.error("Failed to load table display settings:", error);
    }
  }, []);

  // 設定変更の検出
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);
    setHasUnsavedChanges(hasChanges);
  }, [settings, savedSettings]);

  // 設定を更新
  const updateSetting = <K extends keyof FilterSettings>(
    key: K,
    value: FilterSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // 設定を保存
  const saveSettings = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSavedSettings(settings);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save table display settings:", error);
    }
  };

  // 設定をリセット
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSavedSettings(DEFAULT_SETTINGS);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to reset table display settings:", error);
    }
  };

  // 保存された設定を取得（商品一覧ページで使用）
  const getSavedSettings = (): FilterSettings => {
    // SSR環境ではlocalStorageが利用できないため、クライアントサイドでのみ実行
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS;
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to get saved table display settings:", error);
    }
    return DEFAULT_SETTINGS;
  };

  return {
    settings,
    savedSettings,
    hasUnsavedChanges,
    updateSetting,
    saveSettings,
    resetSettings,
    getSavedSettings,
  };
}