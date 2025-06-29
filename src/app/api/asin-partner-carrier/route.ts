// src/app/api/asin-partner-carrier/route.ts

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { AsinInfo } from "@/types/product";

export async function POST(request: Request) {
  try {
    const { asin, brand, isPartnerCarrierUnavailable } = await request.json();

    if (!asin || !brand || typeof isPartnerCarrierUnavailable !== "boolean") {
      return NextResponse.json(
        { success: false, message: "必要なパラメータが不足しています" },
        { status: 400 },
      );
    }

    const asinFilePath = path.join(process.cwd(), "src/data/asin", `${brand}.json`);
    
    try {
      const fileData = await fs.readFile(asinFilePath, "utf-8");
      const asinList: AsinInfo[] = JSON.parse(fileData);
      
      // 該当ASINを検索して更新
      const asinIndex = asinList.findIndex(item => item.asin === asin);
      
      if (asinIndex !== -1) {
        asinList[asinIndex].isPartnerCarrierUnavailable = isPartnerCarrierUnavailable;
        
        // ファイルに書き戻す
        await fs.writeFile(asinFilePath, JSON.stringify(asinList, null, 2), "utf-8");
        
        return NextResponse.json({ 
          success: true, 
          message: "パートナーキャリア不可フラグを更新しました" 
        });
      } else {
        return NextResponse.json(
          { success: false, message: "ASIN情報が見つかりません" },
          { status: 404 },
        );
      }
    } catch (fileError) {
      // ファイルが存在しない場合は新規作成
      const newAsinInfo: AsinInfo = {
        asin,
        url: `https://amazon.co.jp/dp/${asin}`,
        productName: "",
        brand,
        price: 0,
        soldUnit: 0,
        sellingFee: null,
        fbaFee: null,
        jan: [],
        note: "",
        isPartnerCarrierUnavailable,
      };
      
      await fs.writeFile(asinFilePath, JSON.stringify([newAsinInfo], null, 2), "utf-8");
      
      return NextResponse.json({ 
        success: true, 
        message: "新規ASIN情報を作成し、パートナーキャリア不可フラグを設定しました" 
      });
    }
  } catch (error) {
    console.error("パートナーキャリア不可フラグ更新エラー:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラー" },
      { status: 500 },
    );
  }
}