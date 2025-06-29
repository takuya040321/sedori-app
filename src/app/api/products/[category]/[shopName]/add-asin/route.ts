// src/app/api/products/[category]/[shopName]/add-asin/route.ts

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { AsinInfo } from "@/types/product";

export async function POST(
  request: Request,
  { params }: { params: { category: string; shopName: string } },
) {
  const { category, shopName } = params;
  const { productIndex, asinInfo } = await request.json();

  try {
    const filePath = path.resolve(
      process.cwd(),
      "src",
      "data",
      "products",
      category,
      `${shopName}.json`,
    );
    const fileData = await fs.readFile(filePath, "utf-8");
    const shopData = JSON.parse(fileData);

    if (!shopData.products || !shopData.products[productIndex]) {
      return NextResponse.json(
        { success: false, message: "商品が見つかりません" },
        { status: 404 },
      );
    }

    // asinsフィールドがなければ初期化
    if (!shopData.products[productIndex].asins) {
      shopData.products[productIndex].asins = [];
    }

    // 既に同じASINが存在するかチェック
    const existingAsinIndex = shopData.products[productIndex].asins.findIndex(
      (asin: AsinInfo) => asin.asin === asinInfo.asin
    );

    if (existingAsinIndex !== -1) {
      // 既存のASINを更新
      shopData.products[productIndex].asins[existingAsinIndex] = asinInfo;
    } else {
      // 新しいASINを追加
      shopData.products[productIndex].asins.push(asinInfo);
    }

    // ファイルに書き戻す
    await fs.writeFile(filePath, JSON.stringify(shopData, null, 2), "utf-8");

    return NextResponse.json({ success: true, message: "ASINを追加しました" });
  } catch (error) {
    console.error("ASIN追加エラー:", error);
    return NextResponse.json(
      { success: false, message: "ファイル書き込みエラー" },
      { status: 500 },
    );
  }
}