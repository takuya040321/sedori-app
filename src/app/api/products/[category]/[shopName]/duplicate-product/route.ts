// src/app/api/products/[category]/[shopName]/duplicate-product/route.ts

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Product } from "@/types/product";

export async function POST(
  request: Request,
  { params }: { params: { category: string; shopName: string } },
) {
  const { category, shopName } = params;
  const { index, duplicatedProduct } = await request.json();

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

    // 指定されたインデックスの次に複製商品を挿入
    shopData.products.splice(index + 1, 0, duplicatedProduct);

    // ファイルに書き戻す
    await fs.writeFile(filePath, JSON.stringify(shopData, null, 2), "utf-8");

    return NextResponse.json({ 
      success: true, 
      message: "商品を複製しました",
      insertedIndex: index + 1
    });
  } catch (error) {
    console.error("商品複製エラー:", error);
    return NextResponse.json(
      { success: false, message: "ファイル書き込みエラー" },
      { status: 500 },
    );
  }
}