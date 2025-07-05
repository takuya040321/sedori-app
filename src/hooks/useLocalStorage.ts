// src/hooks/useLocalStorage.ts
// ローカルストレージ操作を共通化

import { useState, useEffect } from "react";

/**
 * ローカルストレージとの同期を行うカスタムフック
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void, () => void] {
  const [value, setValue] = useState<T>(defaultValue);

  // 初期値の読み込み
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
    } catch (error) {
      console.error(`Failed to load from localStorage (key: ${key}):`, error);
    }
  }, [key]);

  // 値の保存
  const setStoredValue = (newValue: T) => {
    try {
      setValue(newValue);
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.error(`Failed to save to localStorage (key: ${key}):`, error);
    }
  };

  // 値の削除
  const removeStoredValue = () => {
    try {
      setValue(defaultValue);
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Failed to remove from localStorage (key: ${key}):`, error);
    }
  };

  return [value, setStoredValue, removeStoredValue];
}

/**
 * ローカルストレージから値を安全に取得
 */
export function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Failed to get storage value (key: ${key}):`, error);
    return defaultValue;
  }
}

/**
 * ローカルストレージに値を安全に保存
 */
export function setStorageValue<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set storage value (key: ${key}):`, error);
    return false;
  }
}

/**
 * ローカルストレージから値を安全に削除
 */
export function removeStorageValue(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove storage value (key: ${key}):`, error);
    return false;
  }
}