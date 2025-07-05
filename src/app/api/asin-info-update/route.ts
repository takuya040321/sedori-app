// src/app/api/asin-info-update/route.ts

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { AsinInfo } from "@/types/product";

export async function POST(request: Request) {
  try {
    const { asin, brand, field, value } = await request.json();

    if (!asin || !brand || !field) {
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
        asinList[asinIndex][field as keyof AsinInfo] = value;
        
        // ファイルに書き戻す
        await fs.writeFile(asinFilePath, JSON.stringify(asinList, null, 2), "utf-8");
        
        return NextResponse.json({ 
          success: true, 
          message: "ASIN情報を更新しました" 
        });
      } else {
        return NextResponse.json(
          { success: false, message: "ASIN情報が見つかりません" },
          { status: 404 },
        );
      }
    } catch (fileError) {
      return NextResponse.json(
        { success: false, message: "ASINファイルが見つかりません" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("ASIN情報更新エラー:", error);
    return NextResponse.json(
      { success: false, message: "サーバーエラー" },
      { status: 500 },
    );
  }
}