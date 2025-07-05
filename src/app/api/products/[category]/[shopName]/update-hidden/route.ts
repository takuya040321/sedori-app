// src/app/api/products/[category]/[shopName]/update-hidden/route.ts

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(
  request: Request,
  { params }: { params: { category: string; shopName: string } },
) {
  const { category, shopName } = params;
  const { index, hidden } = await request.json();

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

    if (!shopData.products || !shopData.products[index]) {
      return NextResponse.json(
        { success: false, message: "商品が見つかりません" },
        { status: 404 },
      );
    }

    // 非表示フラグを更新
    shopData.products[index].hidden = hidden;

    // ファイルに書き戻す
    await fs.writeFile(filePath, JSON.stringify(shopData, null, 2), "utf-8");

    return NextResponse.json({ success: true, message: "非表示設定を更新しました" });
  } catch (error) {
    console.error("非表示設定更新エラー:", error);
    return NextResponse.json(
      { success: false, message: "ファイル書き込みエラー" },
      { status: 500 },
    );
  }
}