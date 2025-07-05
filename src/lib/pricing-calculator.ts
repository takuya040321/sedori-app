// src/lib/pricing-calculator.ts
import { ShopPricingConfig, UserDiscountSettings } from "@/types/product";
import { calcProfit, calcProfitMargin, calcROI } from "./calc";

// 商品名から個数を検出する関数
export function extractUnitCount(productName: string): { count: number; unitType: string; hasNumber: boolean } {
  if (!productName || productName.trim() === "") {
    return { count: 1, unitType: "個", hasNumber: false };
  }

  // 正規表現で数字 + 単位を検出（より包括的なパターン）
  const patterns = [
    { regex: /(\d+)本/gi, unit: "本" },
    { regex: /(\d+)個/gi, unit: "個" },
    { regex: /(\d+)セット/gi, unit: "セット" },
    { regex: /(\d+)袋/gi, unit: "袋" },
    { regex: /(\d+)包/gi, unit: "包" },
    { regex: /(\d+)粒/gi, unit: "粒" },
    { regex: /(\d+)錠/gi, unit: "錠" },
    { regex: /(\d+)缶/gi, unit: "缶" },
    { regex: /(\d+)箱/gi, unit: "箱" },
    { regex: /(\d+)枚/gi, unit: "枚" },
    { regex: /(\d+)回分/gi, unit: "回分" },
    { regex: /(\d+)日分/gi, unit: "日分" },
    // 角括弧・丸括弧パターン
    { regex: /［(\d+)個入［/gi, unit: "個" },
    { regex: /\[(\d+)個入\]/gi, unit: "個" },
    { regex: /（(\d+)個入）/gi, unit: "個" },
    { regex: /\((\d+)個入\)/gi, unit: "個" },
    { regex: /［(\d+)本入［/gi, unit: "本" },
    { regex: /\[(\d+)本入\]/gi, unit: "本" },
    { regex: /（(\d+)本入）/gi, unit: "本" },
    { regex: /\((\d+)本入\)/gi, unit: "本" },
    // その他のパターン
    { regex: /(\d+)ヶ/gi, unit: "個" },
    { regex: /(\d+)ケ/gi, unit: "個" },
    { regex: /(\d+)コ/gi, unit: "個" },
  ];

  for (const pattern of patterns) {
    const matches = Array.from(productName.matchAll(pattern.regex));
    if (matches.length > 0) {
      // 最後にマッチした数字を使用
      const lastMatch = matches[matches.length - 1];
      const count = parseInt(lastMatch[1], 10);
      if (!isNaN(count) && count > 0) {
        return { count, unitType: pattern.unit, hasNumber: true };
      }
    }
  }

  // 単純な数字パターンもチェック（例：「DHC 30」「商品名 2」など）
  const simpleNumberPattern = /(\d+)/g;
  const numberMatches = Array.from(productName.matchAll(simpleNumberPattern));
  if (numberMatches.length > 0) {
    // 数字は見つかったが単位がない場合
    return { count: 1, unitType: "個", hasNumber: true };
  }

  return { count: 1, unitType: "個", hasNumber: false };
}

// 商品名とAmazon商品名の個数を比較して価格調整が必要かを判定
export function shouldCalculateUnitPrice(
  productName: string, 
  amazonProductName: string
): { 
  shouldCalculate: boolean; 
  productCount: number; 
  amazonCount: number; 
  unitType: string;
  reason: string;
} {
  const productInfo = extractUnitCount(productName);
  const amazonInfo = extractUnitCount(amazonProductName || "");
  
  // デバッグ用ログ
  console.log(`🔍 商品名分析: "${productName}" → 個数:${productInfo.count}, 単位:${productInfo.unitType}, 数字有無:${productInfo.hasNumber}`);
  console.log(`🔍 Amazon商品名分析: "${amazonProductName}" → 個数:${amazonInfo.count}, 単位:${amazonInfo.unitType}, 数字有無:${amazonInfo.hasNumber}`);
  
  // Amazon商品名が空の場合
  if (!amazonProductName || amazonProductName.trim() === "") {
    const shouldCalc = productInfo.hasNumber && productInfo.count > 1;
    return {
      shouldCalculate: shouldCalc,
      productCount: productInfo.count,
      amazonCount: 1,
      unitType: productInfo.unitType,
      reason: shouldCalc ? "Amazon商品名が空で、商品名に複数個表記あり" : "Amazon商品名が空だが、商品名は単品"
    };
  }
  
  // 両方に数字が含まれている場合
  if (productInfo.hasNumber && amazonInfo.hasNumber) {
    // 個数が異なる場合は1個あたり価格を計算
    const shouldCalc = productInfo.count !== amazonInfo.count && productInfo.count > 1;
    return {
      shouldCalculate: shouldCalc,
      productCount: productInfo.count,
      amazonCount: amazonInfo.count,
      unitType: productInfo.unitType,
      reason: shouldCalc 
        ? `個数が異なる (商品:${productInfo.count}${productInfo.unitType} vs Amazon:${amazonInfo.count}${amazonInfo.unitType})`
        : `個数が同じ (${productInfo.count}${productInfo.unitType})`
    };
  }
  
  // 商品名にのみ数字が含まれている場合
  if (productInfo.hasNumber && !amazonInfo.hasNumber) {
    const shouldCalc = productInfo.count > 1;
    return {
      shouldCalculate: shouldCalc,
      productCount: productInfo.count,
      amazonCount: 1,
      unitType: productInfo.unitType,
      reason: shouldCalc 
        ? `商品名に複数個表記、Amazon商品名は単品`
        : `商品名は単品、Amazon商品名も単品`
    };
  }
  
  // Amazon商品名にのみ数字が含まれている場合、または両方に数字がない場合
  return {
    shouldCalculate: false,
    productCount: productInfo.count,
    amazonCount: amazonInfo.count,
    unitType: productInfo.unitType,
    reason: "価格調整不要（商品名に個数表記なし、またはAmazon商品名のみに個数表記）"
  };
}

// 実際の仕入れ価格を計算（1個あたり対応）
export function calculateActualCost(
  originalPrice: number,
  salePrice: number | undefined,
  config: ShopPricingConfig,
  userDiscountSettings: UserDiscountSettings = {},
  productName?: string,
  amazonProductName?: string
): number {
  // DHCの場合、商品名とAmazon商品名を比較して価格調整
  let basePrice = originalPrice;
  if (config.shopName === 'dhc' && productName) {
    const priceInfo = shouldCalculateUnitPrice(productName, amazonProductName || "");
    console.log(`💰 価格計算: ${priceInfo.reason}`);
    
    if (priceInfo.shouldCalculate) {
      // 個数が異なる場合、1個あたり価格を基準にする
      if (salePrice) {
        basePrice = salePrice / priceInfo.productCount;
      } else {
        basePrice = originalPrice / priceInfo.productCount;
      }
      console.log(`💰 1個あたり価格: ${Math.round(basePrice).toLocaleString()}円`);
    } else {
      // 個数が同じ場合は従来通り（セール価格 > 通常価格）
      basePrice = salePrice || originalPrice;
      console.log(`💰 そのままの価格: ${Math.round(basePrice).toLocaleString()}円`);
    }
  } else {
    // 他のショップは従来通り
    basePrice = salePrice || originalPrice;
  }
  
  let actualCost = 0;
  
  switch (config.priceCalculationType) {
    case 'fixed_discount':
      // VT: 固定額割引（400円引き）
      actualCost = Math.max(0, basePrice - (config.fixedDiscount || 0));
      break;
      
    case 'percentage_discount':
      // 固定割引率
      const discountRate = config.percentageDiscount || 0;
      actualCost = basePrice * (1 - discountRate / 100);
      break;
      
    case 'user_configurable':
      // DHC: 基本割引 + ユーザー設定割引
      const shopKey = `${config.category}-${config.shopName}`;
      const baseDiscountRate = config.percentageDiscount || 0;
      const userDiscountRate = userDiscountSettings[shopKey] || 0;
      const totalDiscountRate = baseDiscountRate + userDiscountRate;
      actualCost = basePrice * (1 - totalDiscountRate / 100);
      break;
      
    default:
      actualCost = basePrice;
  }

  return actualCost;
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
  userDiscountSettings: UserDiscountSettings = {},
  productName?: string,
  amazonProductName?: string
): ProfitCalculationResult {
  const actualCost = calculateActualCost(originalPrice, salePrice, config, userDiscountSettings, productName, amazonProductName);
  
  // 利益計算
  const profit = Math.round(calcProfit(amazonPrice, sellingFee, fbaFee, actualCost));
  const profitMargin = calcProfitMargin(amazonPrice, sellingFee, fbaFee, actualCost);
  const roi = calcROI(amazonPrice, sellingFee, fbaFee, actualCost);
  
  // 割引情報
  let basePrice = originalPrice;
  if (config.shopName === 'dhc' && productName) {
    const priceInfo = shouldCalculateUnitPrice(productName, amazonProductName || "");
    if (priceInfo.shouldCalculate) {
      basePrice = (salePrice || originalPrice) / priceInfo.productCount;
    } else {
      basePrice = salePrice || originalPrice;
    }
  } else {
    basePrice = salePrice || originalPrice;
  }
  
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
    actualCost: Math.round(actualCost),
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
  userDiscountSettings: UserDiscountSettings = {},
  productName?: string,
  amazonProductName?: string
): string {
  const basePrice = salePrice || originalPrice;
  const actualCost = calculateActualCost(originalPrice, salePrice, config, userDiscountSettings, productName, amazonProductName);
  
  // DHCの場合、単位情報を取得
  let unitSuffix = "";
  if (config.shopName === 'dhc' && productName) {
    const priceInfo = shouldCalculateUnitPrice(productName, amazonProductName || "");
    if (priceInfo.shouldCalculate) {
      unitSuffix = ` (1${priceInfo.unitType}あたり)`;
    }
  }
  
  switch (config.priceCalculationType) {
    case 'fixed_discount':
      return `${basePrice.toLocaleString()}円 - ${config.fixedDiscount}円 = ${actualCost.toLocaleString()}円${unitSuffix}`;
      
    case 'percentage_discount':
      const discountRate = config.percentageDiscount || 0;
      return `${basePrice.toLocaleString()}円 × ${100 - discountRate}% = ${actualCost.toLocaleString()}円${unitSuffix}`;
      
    case 'user_configurable':
      const shopKey = `${config.category}-${config.shopName}`;
      const baseDiscountRate = config.percentageDiscount || 0;
      const userDiscountRate = userDiscountSettings[shopKey] || 0;
      const totalDiscountRate = baseDiscountRate + userDiscountRate;
      
      if (userDiscountRate > 0) {
        return `(${baseDiscountRate}% + ${userDiscountRate}%) = ${Math.round(actualCost).toLocaleString()}円${unitSuffix}`;
      } else {
        return `(${baseDiscountRate}%) = ${Math.round(actualCost).toLocaleString()}円${unitSuffix}`;
      }
      
    default:
      return `${Math.round(actualCost).toLocaleString()}円${unitSuffix}`;
  }
}