// src/lib/helpers.ts
// ヘルパー関数を集約

import { Product, AsinInfo } from "@/types/product";

/**
 * 配列をチャンクに分割
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * オブジェクトから指定されたキーのみを抽出
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * オブジェクトから指定されたキーを除外
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * 深いオブジェクトのクローンを作成
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === "object") {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * 商品が利益を出しているかチェック
 */
export function isProfitable(product: Product): boolean {
  if (!product.asins || product.asins.length === 0) return false;
  
  const asin = product.asins[0];
  if (!asin || asin.price === 0 || asin.sellingFee === null || asin.fbaFee === null) {
    return false;
  }

  const cost = product.salePrice || product.price;
  const netIncome = asin.price - (asin.price * (asin.sellingFee / 100)) - asin.fbaFee;
  return netIncome > cost;
}

/**
 * 商品にASINが登録されているかチェック
 */
export function hasAsin(product: Product): boolean {
  return !!(product.asins && product.asins.length > 0);
}

/**
 * 商品が危険物かチェック
 */
export function isDangerousGoods(product: Product): boolean {
  return !!(product.asins && product.asins.some(asin => asin.isDangerousGoods));
}

/**
 * 商品がパートナーキャリア不可かチェック
 */
export function isPartnerCarrierUnavailable(product: Product): boolean {
  return !!(product.asins && product.asins.some(asin => asin.isPartnerCarrierUnavailable));
}

/**
 * 商品の最初のASINを取得
 */
export function getFirstAsin(product: Product): AsinInfo | null {
  return product.asins && product.asins.length > 0 ? product.asins[0] : null;
}

/**
 * URLが有効かチェック
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 配列が空でないかチェック
 */
export function isNotEmpty<T>(array: T[] | undefined | null): array is T[] {
  return Array.isArray(array) && array.length > 0;
}

/**
 * 値が定義されているかチェック
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * 数値が有効な範囲内かチェック
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * 文字列が空でないかチェック
 */
export function isNotEmptyString(value: string | undefined | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}