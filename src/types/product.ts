// src\types\product.ts
export interface Product {
  name: string;
  imageUrl: string;
  price: number;
  salePrice?: number;
  asins?: AsinInfo[];
  updatedAt: string;
  hidden?: boolean;
}

export interface AsinInfo {
  asin: string;
  url: string;
  productName: string;
  brand: string;
  price: number;
  soldUnit: number;
  sellingFee: number | null;
  fbaFee: number | null;
  jan: string[];
  note?: string;
}

export interface ShopData {
  lastUpdated: string;
  products: Product[];
}

export interface ShopInfo {
  category: string;
  shopName: string;
  displayName: string;
  icon: string;
}

export interface KPIData {
  totalProducts: number;
  activeShops: number;
  lastUpdated: string;
  priceChanges: number;
}

export interface ActivityItem {
  id: string;
  type: "scraping" | "price_change" | "new_product";
  shop: string;
  message: string;
  timestamp: string;
  status: "success" | "error" | "warning";
}

export type AsinInfoHeaderKey =
  | keyof Omit<AsinInfo, "jan" | "note" | "sellingFee" | "fbaFee">
  | "sellingFeeRaw"
  | "fbaFeeRaw"
  | "janRaw";

// ショップ別価格計算設定
export interface ShopPricingConfig {
  shopName: string;
  category: string;
  priceCalculationType: 'fixed_discount' | 'percentage_discount' | 'user_configurable';
  fixedDiscount?: number; // 固定割引額（円）
  percentageDiscount?: number; // 固定割引率（%）
  allowUserDiscount?: boolean; // ユーザー設定割引の許可
}

// ユーザー設定割引情報
export interface UserDiscountSettings {
  [shopKey: string]: number; // ショップキー: 割引率（%）
}