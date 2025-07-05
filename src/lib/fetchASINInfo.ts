import { AsinInfo } from "@/types/product";

export const fetchASINInfo = async (asin: string, brand: string): Promise<AsinInfo> => {
  const params = new URLSearchParams({ asin, brand });
  const response = await fetch(`/api/asin-info?${params.toString()}`);
  
  if (!response.ok) {
    // 404エラーの場合は基本的なASIN情報を作成
    if (response.status === 404) {
      console.log(`ASIN ${asin} not found in database, creating basic info`);
      return {
        asin,
        url: `https://amazon.co.jp/dp/${asin}`,
        productName: "", // 空文字で作成、ユーザーが後で入力
        brand,
        price: 0, // 0で作成、ユーザーが後で入力
        soldUnit: 0,
        sellingFee: null, // nullで作成、ユーザーが後で入力
        fbaFee: null, // nullで作成、ユーザーが後で入力
        jan: [],
        note: "手動入力が必要",
        isDangerousGoods: false,
        isPartnerCarrierUnavailable: false,
        hasOfficialStore: false,
        hasAmazonStore: false,
        complaintCount: 0,
      };
    }
    
    // その他のエラーの場合は例外をスロー
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}: Failed to fetch ASIN info`);
  }
  
  return response.json();
};