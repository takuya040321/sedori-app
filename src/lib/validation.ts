// src/lib/validation.ts
// バリデーション関数を集約

import { VALIDATION_RULES, ERROR_MESSAGES } from "./constants";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * ASINの形式を検証
 */
export function validateAsin(asin: string): ValidationResult {
  if (!asin) {
    return { isValid: false, error: "ASINを入力してください" };
  }
  
  if (asin.length !== VALIDATION_RULES.ASIN_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_ASIN };
  }
  
  if (!VALIDATION_RULES.ASIN_PATTERN.test(asin)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_ASIN };
  }
  
  return { isValid: true };
}

/**
 * 価格の形式を検証
 */
export function validatePrice(price: number): ValidationResult {
  if (price < VALIDATION_RULES.MIN_PRICE) {
    return { isValid: false, error: "価格は0以上で入力してください" };
  }
  
  if (price > VALIDATION_RULES.MAX_PRICE) {
    return { isValid: false, error: "価格が上限を超えています" };
  }
  
  return { isValid: true };
}

/**
 * 割引率の形式を検証
 */
export function validateDiscountRate(rate: number): ValidationResult {
  if (rate < 0) {
    return { isValid: false, error: "割引率は0%以上で入力してください" };
  }
  
  if (rate > VALIDATION_RULES.MAX_DISCOUNT_RATE) {
    return { isValid: false, error: `割引率は${VALIDATION_RULES.MAX_DISCOUNT_RATE}%以下で入力してください` };
  }
  
  return { isValid: true };
}

/**
 * メモの長さを検証
 */
export function validateMemo(memo: string): ValidationResult {
  if (memo.length > VALIDATION_RULES.MAX_MEMO_LENGTH) {
    return { isValid: false, error: `メモは${VALIDATION_RULES.MAX_MEMO_LENGTH}文字以内で入力してください` };
  }
  
  return { isValid: true };
}

/**
 * 商品名の長さを検証
 */
export function validateProductName(name: string): ValidationResult {
  if (!name.trim()) {
    return { isValid: false, error: "商品名を入力してください" };
  }
  
  if (name.length > VALIDATION_RULES.MAX_PRODUCT_NAME_LENGTH) {
    return { isValid: false, error: `商品名は${VALIDATION_RULES.MAX_PRODUCT_NAME_LENGTH}文字以内で入力してください` };
  }
  
  return { isValid: true };
}

/**
 * ASINを正規化（大文字変換、特殊文字除去）
 */
export function normalizeAsin(asin: string): string {
  return asin.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, VALIDATION_RULES.ASIN_LENGTH);
}

/**
 * 数値を安全に変換
 */
export function safeParseNumber(value: string | number, defaultValue: number = 0): number {
  if (typeof value === "number") return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * 整数を安全に変換
 */
export function safeParseInt(value: string | number, defaultValue: number = 0): number {
  if (typeof value === "number") return Math.floor(value);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}