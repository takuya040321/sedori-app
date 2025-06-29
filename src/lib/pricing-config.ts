// src/lib/pricing-config.ts
import { ShopPricingConfig } from "@/types/product";

// ショップ別価格計算設定
export const SHOP_PRICING_CONFIGS: ShopPricingConfig[] = [
  {
    shopName: "vt-cosmetics",
    category: "official",
    priceCalculationType: "fixed_discount",
    fixedDiscount: 400, // VTは400円引き
    allowUserDiscount: false,
  },
  {
    shopName: "dhc",
    category: "official",
    priceCalculationType: "user_configurable",
    percentageDiscount: 20, // DHCは基本20%割引
    allowUserDiscount: true, // ユーザー設定割引も可能
  },
];

// ショップ設定を取得
export function getShopPricingConfig(category: string, shopName: string): ShopPricingConfig | null {
  return SHOP_PRICING_CONFIGS.find(
    config => config.category === category && config.shopName === shopName
  ) || null;
}

// ショップキーを生成
export function getShopKey(category: string, shopName: string): string {
  return `${category}-${shopName}`;
}