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
    const jsonStr = await fs.readFile(asinFilePath, "utf-8");
    const asinList = JSON.parse(jsonStr) as AsinInfo[];
    const info = asinList.find((item) => item.asin === asin);

    if (!info) {
      return NextResponse.json({ error: "ASIN情報が見つかりません" }, { status: 404 });
    }
    return NextResponse.json(info);
  } catch (e) {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
