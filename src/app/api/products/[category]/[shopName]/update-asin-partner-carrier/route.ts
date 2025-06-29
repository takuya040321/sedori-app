// src/app/api/products/[category]/[shopName]/update-asin-partner-carrier/route.ts

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(
  request: Request,
  { params }: { params: { category: string; shopName: string } },
) {
  const { category, shopName } = params;
  const { productIndex, asinIndex, isPartnerCarrierUnavailable } = await request.json();

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

    if (!shopData.products[productIndex].asins || !shopData.products[productIndex].asins[asinIndex]) {
      return NextResponse.json(
        { success: false, message: "ASINが見つかりません" },
        { status: 404 },
      );
    }

    // パートナーキャリア不可フラグを更新
    shopData.products[productIndex].asins[asinIndex].isPartnerCarrierUnavailable = isPartnerCarrierUnavailable;

    // ファイルに書き戻す
    await fs.writeFile(filePath, JSON.stringify(shopData, null, 2), "utf-8");

    return NextResponse.json({ success: true, message: "パートナーキャリア不可フラグを更新しました" });
  } catch (error) {
    console.error("パートナーキャリア不可フラグ更新エラー:", error);
    return NextResponse.json(
      { success: false, message: "ファイル書き込みエラー" },
      { status: 500 },
    );
  }
}