import { AsinInfo } from "@/types/product";
import { getAsinInfo } from "./database";

export const fetchASINInfo = async (asin: string, brand: string): Promise<AsinInfo> => {
  try {
    const asinInfo = await getAsinInfo(asin, brand);
    
    if (asinInfo) {
      return asinInfo;
    }
    
    // データベースにない場合は基本的なASIN情報を作成
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
  } catch (error) {
    console.error("Error fetching ASIN info:", error);
    throw error;
  }
};