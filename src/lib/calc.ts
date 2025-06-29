// lib/calc.ts

/**
 * 実際に入金される金額を計算
 * @param amazonPrice Amazon販売価格
 * @param sellingFee 販売手数料率（%）
 * @param fbaFee FBA手数料
 * @returns 入金金額
 */
export function calcNetIncome(
  amazonPrice: number,
  sellingFee: number,
  fbaFee: number
): number {
  return amazonPrice - (amazonPrice * (sellingFee / 100)) - fbaFee;
}

/**
 * 利益額を計算
 * @param amazonPrice Amazon販売価格
 * @param sellingFee 販売手数料率（%）
 * @param fbaFee FBA手数料
 * @param cost 仕入原価
 * @returns 利益額
 */
export function calcProfit(
  amazonPrice: number,
  sellingFee: number,
  fbaFee: number,
  cost: number
): number {
  return calcNetIncome(amazonPrice, sellingFee, fbaFee) - cost;
}

/**
 * 利益率（実際に入金される金額ベース）
 * @param amazonPrice Amazon販売価格
 * @param sellingFee 販売手数料率（%）
 * @param fbaFee FBA手数料
 * @param cost 仕入原価
 * @returns 利益率（%）
 */
export function calcProfitMargin(
  amazonPrice: number,
  sellingFee: number,
  fbaFee: number,
  cost: number
): number {
  const netIncome = calcNetIncome(amazonPrice, sellingFee, fbaFee);
  if (netIncome === 0) return 0;
  const profit = netIncome - cost;
  return (profit / netIncome) * 100;
}

/**
 * ROI（仕入原価ベース）
 * @param amazonPrice Amazon販売価格
 * @param sellingFee 販売手数料率（%）
 * @param fbaFee FBA手数料
 * @param cost 仕入原価
 * @returns ROI（%）
 */
export function calcROI(
  amazonPrice: number,
  sellingFee: number,
  fbaFee: number,
  cost: number
): number {
  if (cost === 0) return 0;
  const profit = calcNetIncome(amazonPrice, sellingFee, fbaFee) - cost;
  return (profit / cost) * 100;
}
