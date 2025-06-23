// src\app\api\keepa\route.ts

export interface FeeInfo {
  asin: string;
  amazonPrice?: number;
  salesFee?: number;
  fbaFee?: number;
  monthlySales?: number; // 月間販売個数
  profit?: number; // 利益額
  profitRate?: number;
  roi?: number;
}

// ダミーのKeepa API呼び出し関数
export async function fetchKeepaData(asin: string): Promise<FeeInfo> {
  const amazonPrice = Math.floor(Math.random() * 10000) + 1000;
  const salesFee = Math.round(amazonPrice * 0.1); // 10%
  const fbaFee = 434; // 固定
  const monthlySales = Math.floor(Math.random() * 200) + 1; // 1〜200個
  const profit = amazonPrice - salesFee - fbaFee - 1000; // 仕入れ1000円仮定
  const profitRate = Number(((profit / amazonPrice) * 100).toFixed(2));
  const roi = Number(((profit / 1000) * 100).toFixed(2)); // 仕入れ1000円仮定

  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        asin,
        amazonPrice,
        salesFee,
        fbaFee,
        monthlySales,
        profit,
        profitRate,
        roi,
      });
    }, 800)
  );
}
