// src/app/api/asin-dangerous-goods/route.ts

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { AsinInfo } from "@/types/product";

export async function POST(request: Request) {
  try {
    const { asin, brand, isDangerousGoods } = await request.json();

    if (!asin || !brand || typeof isDangerousGoods !== "boolean") {
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
        asinList[asinIndex].isDangerousGoods = isDangerousGoods;
        
        // ファイルに書き戻す
        await fs.writeFile(asinFilePath, JSON.stringify(asinList, null, 2), "utf-8");
        
        return NextResponse.json({ 
          success: true, 
          message: "危険物フラグを更新しました" 
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
        isDangerousGoods,
      };
      
      await fs.writeFile(asinFilePath, JSON.stringify([newAsinInfo], null, 2), "utf-8");
      
      return NextResponse.json({ 
        success: true, 
        message: "新規ASIN情報を作成し、危険物フラグを設定しました" 
      });
    }
  } catch (error) {
    console.error("危険物フラグ更新エラー:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラー" },
      { status: 500 },
    );
  }
}