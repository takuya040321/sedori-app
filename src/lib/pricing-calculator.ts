// src/lib/pricing-calculator.ts
import { ShopPricingConfig, UserDiscountSettings } from "@/types/product";
import { calcProfit, calcProfitMargin, calcROI } from "./calc";

// 実際の仕入れ価格を計算
export function calculateActualCost(
  originalPrice: number,
  salePrice: number | undefined,
  config: ShopPricingConfig,
  userDiscountSettings: UserDiscountSettings = {}
): number {
  // 基準価格を決定（セール価格があればセール価格、なければ通常価格）
  const basePrice = salePrice || originalPrice;
  
  switch (config.priceCalculationType) {
    case 'fixed_discount':
      // VT: 固定額割引（400円引き）
      return Math.max(0, basePrice - (config.fixedDiscount || 0));
      
    case 'percentage_discount':
      // 固定割引率
      const discountRate = config.percentageDiscount || 0;
      return basePrice * (1 - discountRate / 100);
      
    case 'user_configurable':
      // DHC: 基本割引 + ユーザー設定割引
      const shopKey = `${config.category}-${config.shopName}`;
      const baseDiscountRate = config.percentageDiscount || 0;
      const userDiscountRate = userDiscountSettings[shopKey] || 0;
      const totalDiscountRate = baseDiscountRate + userDiscountRate;
      return basePrice * (1 - totalDiscountRate / 100);
      
    default:
      return basePrice;
  }
}

// 利益計算結果
export interface ProfitCalculationResult {
  actualCost: number;
  profit: number;
  profitMargin: number;
  roi: number;
  discountInfo: {
    baseDiscount: number;
    userDiscount?: number;
    totalDiscount: number;
    discountType: string;
  };
}

// 利益計算（ショップ別価格設定を考慮）
export function calculateProfitWithShopPricing(
  originalPrice: number,
  salePrice: number | undefined,
  amazonPrice: number,
  sellingFee: number,
  fbaFee: number,
  config: ShopPricingConfig,
  userDiscountSettings: UserDiscountSettings = {}
): ProfitCalculationResult {
  const actualCost = calculateActualCost(originalPrice, salePrice, config, userDiscountSettings);
  
  // 利益計算
  const profit = calcProfit(amazonPrice, sellingFee, fbaFee, actualCost);
  const profitMargin = calcProfitMargin(amazonPrice, sellingFee, fbaFee, actualCost);
  const roi = calcROI(amazonPrice, sellingFee, fbaFee, actualCost);
  
  // 割引情報
  const basePrice = salePrice || originalPrice;
  let baseDiscount = 0;
  let userDiscount = 0;
  let discountType = "";
  
  switch (config.priceCalculationType) {
    case 'fixed_discount':
      baseDiscount = config.fixedDiscount || 0;
      discountType = "固定額割引";
      break;
      
    case 'percentage_discount':
      baseDiscount = basePrice * ((config.percentageDiscount || 0) / 100);
      discountType = "固定割引率";
      break;
      
    case 'user_configurable':
      const shopKey = `${config.category}-${config.shopName}`;
      const baseDiscountRate = config.percentageDiscount || 0;
      const userDiscountRate = userDiscountSettings[shopKey] || 0;
      
      baseDiscount = basePrice * (baseDiscountRate / 100);
      userDiscount = basePrice * (userDiscountRate / 100);
      discountType = "設定可能割引";
      break;
  }
  
  return {
    actualCost,
    profit,
    profitMargin,
    roi,
    discountInfo: {
      baseDiscount,
      userDiscount,
      totalDiscount: baseDiscount + userDiscount,
      discountType,
    },
  };
}

// 割引表示用のテキストを生成
export function getDiscountDisplayText(
  originalPrice: number,
  salePrice: number | undefined,
  config: ShopPricingConfig,
  userDiscountSettings: UserDiscountSettings = {}
): string {
  const basePrice = salePrice || originalPrice;
  const actualCost = calculateActualCost(originalPrice, salePrice, config, userDiscountSettings);
  
  switch (config.priceCalculationType) {
    case 'fixed_discount':
      return `${basePrice.toLocaleString()}円 - ${config.fixedDiscount}円 = ${actualCost.toLocaleString()}円`;
      
    case 'percentage_discount':
      const discountRate = config.percentageDiscount || 0;
      return `${basePrice.toLocaleString()}円 × ${100 - discountRate}% = ${actualCost.toLocaleString()}円`;
      
    case 'user_configurable':
      const shopKey = `${config.category}-${config.shopName}`;
      const baseDiscountRate = config.percentageDiscount || 0;
      const userDiscountRate = userDiscountSettings[shopKey] || 0;
      const totalDiscountRate = baseDiscountRate + userDiscountRate;
      
      if (userDiscountRate > 0) {
        return `${basePrice.toLocaleString()}円 × ${100 - totalDiscountRate}% (基本${baseDiscountRate}% + 追加${userDiscountRate}%) = ${actualCost.toLocaleString()}円`;
      } else {
        return `${basePrice.toLocaleString()}円 × ${100 - baseDiscountRate}% = ${actualCost.toLocaleString()}円`;
      }
      
    default:
      return `${actualCost.toLocaleString()}円`;
  }
}