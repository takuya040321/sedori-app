// src\app\api\asin-info\route.ts
import { NextRequest, NextResponse } from "next/server";
import { AsinInfo } from "@/types/product";
import { promises as fs } from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const brand = searchParams.get("brand");
  const asin = searchParams.get("asin");

  if (!brand || !asin) {
    return NextResponse.json({ error: "brand, asinは必須です" }, { status: 400 });
  }

  try {
    const asinFilePath = path.join(process.cwd(), "src/data/asin", `${brand}.json`);
    
    // ファイルの存在確認
    try {
      await fs.access(asinFilePath);
    } catch (error) {
      console.log(`ASIN file not found: ${asinFilePath}`);
      return NextResponse.json({ 
        error: "ASIN情報が見つかりません",
        details: "ASINデータファイルが存在しません" 
      }, { status: 404 });
    }

    const jsonStr = await fs.readFile(asinFilePath, "utf-8");
    const asinList = JSON.parse(jsonStr) as AsinInfo[];
    const info = asinList.find((item) => item.asin === asin);

    if (!info) {
      console.log(`ASIN not found in file: ${asin}`);
      return NextResponse.json({ 
        error: "ASIN情報が見つかりません",
        details: `ASIN ${asin} がデータベースに登録されていません`
      }, { status: 404 });
    }
    
    return NextResponse.json(info);
  } catch (e) {
    console.error("ASIN info API error:", e);
    return NextResponse.json({ 
      error: "サーバーエラー",
      details: e instanceof Error ? e.message : "Unknown error"
    }, { status: 500 });
  }
}